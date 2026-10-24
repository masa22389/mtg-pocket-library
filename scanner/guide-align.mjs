import {computeHomography,applyHomography,isUsableQuad,quadArea} from './geometry.mjs';
// Constrained straight-edge search around the guide. Trial thresholds, not a learned detector.
export function findGuideQuad(gray,w,h){
 const nominal={left:w*.1,right:w*.9,top:h*.1,bottom:h*.9};
 function search(vertical,expected){
  let best=null;const span=vertical?w:h,along=vertical?h:w;
  for(let offset=-Math.round(span*.1);offset<=span*.1;offset+=1)for(let slope=-.24;slope<=.2401;slope+=.04){
   const base=expected+offset;let sum=0,count=0,strong=0;const bins=[0,0,0,0],totals=[0,0,0,0];
   for(let p=Math.round(along*.22);p<along*.78;p+=2){const cross=Math.round(base+slope*(p-along/2));if(cross<3||cross>=span-3)continue;
    const value=vertical?Math.abs(gray[p*w+cross-2]-gray[p*w+cross+2]):Math.abs(gray[(cross-2)*w+p]-gray[(cross+2)*w+p]);
    const bin=Math.min(3,Math.floor((p-along*.22)/(along*.56)*4));totals[bin]++;if(value>=12){strong++;bins[bin]++;}sum+=Math.min(value,80);count++;
   }
   if(!count)continue;const support=strong/count,coverage=bins.filter((n,i)=>n/Math.max(1,totals[i])>=.4).length;
   const mean=sum/count,score=mean*(.25+.75*support)-Math.abs(offset)/span*8;
   if(coverage===4&&support>=.5&&mean>=12&&(!best||score>best.score))best={base,slope,mean,support,score};
  }return best;
 }
 const left=search(true,nominal.left),right=search(true,nominal.right),top=search(false,nominal.top),bottom=search(false,nominal.bottom);
 const edges={left,right,top,bottom};if(Object.values(edges).some(e=>!e))return {valid:false,reason:'edge-incomplete',edges};
 function intersect(v,hor){const a=v.base-v.slope*h/2,c=hor.base-hor.slope*w/2,x=(a+v.slope*c)/(1-v.slope*hor.slope);return [x,c+hor.slope*x];}
 const corners=[intersect(left,top),intersect(right,top),intersect(right,bottom),intersect(left,bottom)],normal=corners.map(([x,y])=>[x/w,y/h]);
 const dist=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]),ratio=(dist(corners[0],corners[1])+dist(corners[2],corners[3]))/(dist(corners[1],corners[2])+dist(corners[3],corners[0]));
 const area=quadArea(normal),center=normal.reduce((a,p)=>[a[0]+p[0]/4,a[1]+p[1]/4],[0,0]);
 const valid=isUsableQuad(normal)&&area>=.38&&area<=.86&&ratio>=.54&&ratio<=.91&&Math.abs(center[0]-.5)<.15&&Math.abs(center[1]-.5)<.15;
 return {valid,reason:valid?'aligned':'quad-invalid',corners:normal,ratio,area,edges};
}
export function warpGuide(source,corners,w=252,h=352){
 const src=source.getContext('2d',{willReadFrequently:true}).getImageData(0,0,source.width,source.height),out=new OffscreenCanvas(w,h),ctx=out.getContext('2d'),pixels=ctx.createImageData(w,h);
 const inv=computeHomography([[0,0],[w-1,0],[w-1,h-1],[0,h-1]],corners.map(([x,y])=>[x*(source.width-1),y*(source.height-1)]));
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const [u,v]=applyHomography(inv,x,y),sx=Math.max(0,Math.min(source.width-1,u)),sy=Math.max(0,Math.min(source.height-1,v)),x0=Math.floor(sx),y0=Math.floor(sy),x1=Math.min(x0+1,source.width-1),y1=Math.min(y0+1,source.height-1),tx=sx-x0,ty=sy-y0,a=(y0*source.width+x0)*4,b=(y0*source.width+x1)*4,c=(y1*source.width+x0)*4,d=(y1*source.width+x1)*4,o=(y*w+x)*4;for(let k=0;k<3;k++)pixels.data[o+k]=(src.data[a+k]*(1-tx)+src.data[b+k]*tx)*(1-ty)+(src.data[c+k]*(1-tx)+src.data[d+k]*tx)*ty;pixels.data[o+3]=255;}
 ctx.putImageData(pixels,0,0);return out;
}
