// Independent pHash baseline. Not a bit-compatible implementation of Lotus Vault.
export const PHASH_VERSION='art-dct64-low16-median-v1';
const cos=Array.from({length:16},(_,k)=>Float64Array.from({length:64},(_,x)=>Math.cos(Math.PI*(2*x+1)*k/128)));
export function phashGray(gray){
  if(gray.length!==4096)throw Error('64×64 grayscale required');
  const tmp=new Float64Array(64*16),coeff=[];
  for(let y=0;y<64;y++)for(let u=0;u<16;u++){let s=0;for(let x=0;x<64;x++)s+=gray[y*64+x]*cos[u][x];tmp[y*16+u]=s;}
  for(let v=0;v<16;v++)for(let u=0;u<16;u++){let s=0;for(let y=0;y<64;y++)s+=tmp[y*16+u]*cos[v][y];coeff.push(s*(u===0?Math.SQRT1_2:1)*(v===0?Math.SQRT1_2:1));}
  const sorted=coeff.slice(1).sort((a,b)=>a-b),median=sorted[127];let hex='';
  for(let i=0;i<256;i+=4){let n=0;for(let j=0;j<4;j++)n=n*2+(i+j!==0&&coeff[i+j]>median?1:0);hex+=n.toString(16);}
  return hex;
}
export function phashCanvas(canvas){
  const c=new OffscreenCanvas(64,64),ctx=c.getContext('2d',{willReadFrequently:true});
  ctx.drawImage(canvas,canvas.width*.08,canvas.height*.16,canvas.width*.84,canvas.height*.40,0,0,64,64);
  const d=ctx.getImageData(0,0,64,64).data;return phashGray(Float64Array.from({length:4096},(_,i)=>d[i*4]*.299+d[i*4+1]*.587+d[i*4+2]*.114));
}
export function distance(a,b){if(a.length!==b.length)throw Error('Hash length mismatch');let d=0;for(let i=0;i<a.length;i++){let x=parseInt(a[i],16)^parseInt(b[i],16);while(x){d++;x&=x-1;}}return d;}
