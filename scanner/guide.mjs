// Geometry and low-cost heuristics only. Presence is not a calibrated card detector.
export function guideGeometry(vw,vh,dw,dh){
 if(Math.min(vw,vh,dw,dh)<=0)throw Error('Invalid video dimensions');
 const scale=Math.min(dw/vw,dh/vh),cw=vw*scale,ch=vh*scale;
 const h=Math.min(ch*.84,cw*.86*88/63),w=h*63/88;
 return {left:(dw-w)/2,top:(dh-h)/2,width:w,height:h,sx:(cw-w)/2/scale,sy:(ch-h)/2/scale,sw:w/scale,sh:h/scale};
}
export function presenceGray(gray,w=84,h=116){
 let sum=0,sum2=0,energy=0,n=0;
 for(let y=12;y<h-12;y++)for(let x=10;x<w-10;x++){const v=gray[y*w+x];sum+=v;sum2+=v*v;energy+=Math.abs(v-gray[y*w+x-1]);n++;}
 const std=Math.sqrt(Math.max(0,sum2/n-(sum/n)**2)),texture=energy/n;
 // The card should occupy the central 1/1.16 of the enlarged region.
 const left=w*(1-1/1.16)/2,right=w-left,top=h*(1-1/1.16)/2,bottom=h-top;
 function side(vertical,edge,lo,hi){let best=0;for(let offset=-3;offset<=3;offset++){let s=0,k=0;for(let p=Math.ceil(lo);p<hi;p++){const a=Math.round(edge+offset-2),b=Math.round(edge+offset+2);s+=vertical?Math.abs(gray[p*w+a]-gray[p*w+b]):Math.abs(gray[a*w+p]-gray[b*w+p]);k++;}best=Math.max(best,s/k);}return best;}
 const sides=[side(true,left,top+8,bottom-8),side(true,right,top+8,bottom-8),side(false,top,left+8,right-8),side(false,bottom,left+8,right-8)];
 const edges=sides.filter(v=>v>=14).length;
 return {present:std>=12&&texture>=3&&edges>=3,std,texture,edges,sides,thresholds:'uncalibrated-v1'};
}

// Detector coordinates are relative to the 1.25x guide ROI.
// The visible guide occupies [0.1, 0.9] of the 1.25x ROI. Fail closed at its edge.
export function cardWithinGuide(corners){
 const bounds={min:.1,max:.9}, toleranceGuideFraction=0;
 if(!Array.isArray(corners)||corners.length!==4||corners.some(p=>!Array.isArray(p)||p.length!==2||p.some(v=>!Number.isFinite(v))))return {accepted:false,reason:'missing-corners',bounds,toleranceGuideFraction};
 const accepted=corners.every(([x,y])=>x>=bounds.min&&x<=bounds.max&&y>=bounds.min&&y<=bounds.max);
 return {accepted,reason:accepted?'inside-guide':'outside-guide',bounds,toleranceGuideFraction,corners};
}

export function sceneSignature(gray,w=84,h=116){
 const a=[];for(let y=24;y<h-24;y+=6)for(let x=18;x<w-18;x+=6)a.push(gray[y*w+x]);
 const mean=a.reduce((s,v)=>s+v,0)/a.length,std=Math.sqrt(a.reduce((s,v)=>s+(v-mean)**2,0)/a.length);
 return a.map(v=>(v-mean)/Math.max(12,std));
}
export function sceneDifference(a,b){return !a||!b||a.length!==b.length?0:a.reduce((s,v,i)=>s+Math.abs(v-b[i]),0)/a.length;}

// Cheap stale-frame guard, not another calibrated card detector.
export function guideSceneUnchanged(before,after){
 const valid=Array.isArray(before)&&Array.isArray(after)&&before.length>0&&before.length===after.length&&[...before,...after].every(Number.isFinite);
 const difference=valid?sceneDifference(before,after):null;
 return {accepted:valid&&difference<=.25,difference,threshold:.25,thresholds:'uncalibrated-v1'};
}
