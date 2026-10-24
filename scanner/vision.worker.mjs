// AGPL-3.0-only. Cornelius/Milo models by HanClinto. Local WASM, one serialized worker.
import * as ort from './vendor/ort/ort.wasm.min.mjs';
import {orderCorners,isUsableQuad,quadArea,computeHomography,applyHomography} from './geometry.mjs';
let detector,embedder,features,variants,cards,lookup;
const mean=[.485,.456,.406],std=[.229,.224,.225];
function input(canvas,size){
  const small=new OffscreenCanvas(size,size),ctx=small.getContext('2d',{willReadFrequently:true});
  ctx.drawImage(canvas,0,0,size,size);const rgba=ctx.getImageData(0,0,size,size).data,a=new Float32Array(3*size*size);
  for(let i=0;i<size*size;i++)for(let c=0;c<3;c++)a[c*size*size+i]=(rgba[i*4+c]/255-mean[c])/std[c];
  return new ort.Tensor('float32',a,[1,3,size,size]);
}
function dispose(output){if(output)for(const t of Object.values(output))t.dispose();}
function unhalf(n){const s=n&32768?-1:1,e=n>>>10&31,f=n&1023;return e===0?s*2**-14*f/1024:e===31?(f?NaN:s*Infinity):s*2**(e-15)*(1+f/1024);}
function dewarp(frame,corners){
  const w=672,h=936,source=frame.getContext('2d',{willReadFrequently:true}).getImageData(0,0,frame.width,frame.height);
  const inverse=computeHomography([[0,0],[w-1,0],[w-1,h-1],[0,h-1]],corners.map(([x,y])=>[x*(frame.width-1),y*(frame.height-1)]));
  const canvas=new OffscreenCanvas(w,h),ctx=canvas.getContext('2d'),out=ctx.createImageData(w,h),src=source.data;
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){
    const [u,v]=applyHomography(inverse,x,y),sx=Math.max(0,Math.min(frame.width-1,u)),sy=Math.max(0,Math.min(frame.height-1,v));
    const x0=Math.floor(sx),y0=Math.floor(sy),x1=Math.min(x0+1,frame.width-1),y1=Math.min(y0+1,frame.height-1),tx=sx-x0,ty=sy-y0;
    const a=(y0*frame.width+x0)*4,b=(y0*frame.width+x1)*4,c=(y1*frame.width+x0)*4,d=(y1*frame.width+x1)*4,o=(y*w+x)*4;
    for(let channel=0;channel<3;channel++)out.data[o+channel]=(src[a+channel]*(1-tx)+src[b+channel]*tx)*(1-ty)+(src[c+channel]*(1-tx)+src[d+channel]*tx)*ty;
    out.data[o+3]=255;
  }
  ctx.putImageData(out,0,0);return canvas;
}
async function detect(d){
  const started=performance.now(),frame=new OffscreenCanvas(d.bitmap.width,d.bitmap.height);
  frame.getContext('2d',{willReadFrequently:true}).drawImage(d.bitmap,0,0);d.bitmap.close();
  const tensor=input(frame,384),prepared=performance.now();let output;
  try{
    output=await detector.run({[detector.inputNames[0]]:tensor});const inferred=performance.now();
    const raw=Array.from(output.corners.data).slice(0,8),presence=output.presence.data[0],sharpness=output.sharpness?.data[0]??null;
    const points=Array.from({length:4},(_,i)=>[Math.max(0,Math.min(1,raw[i*2])),Math.max(0,Math.min(1,raw[i*2+1]))]);
    // Keep the upper edge upright for portrait cards; do not arbitrarily rotate to the shortest bottom edge.
    let corners=orderCorners(points);
    const length=(a,b)=>Math.hypot((a[0]-b[0])*frame.width,(a[1]-b[1])*frame.height);
    if(length(corners[0],corners[1])>length(corners[1],corners[2]))corners=[corners[3],corners[0],corners[1],corners[2]];
    const ratio=(length(corners[0],corners[1])+length(corners[2],corners[3]))/(length(corners[1],corners[2])+length(corners[3],corners[0]));
    // The pinned model returns constant presence=1 even on a blank image. Do not treat it as a probability.
    // Match the upstream corner-quality trial threshold; validate on real negative examples separately.
    const valid=isUsableQuad(corners)&&quadArea(corners)>=.025&&ratio>=.45&&ratio<=.95,cardPresent=Number.isFinite(sharpness)&&sharpness>=.02;
    const reason=!cardPresent?'low-corner-quality':!valid?'invalid-corners':'detected';
    const timing={detectorPreMs:prepared-started,detectorRunMs:inferred-prepared,detectorPostMs:performance.now()-inferred};
    let cropBitmap;
    if(cardPresent&&valid){const t=performance.now();cropBitmap=dewarp(frame,corners).transferToImageBitmap();timing.dewarpMs=performance.now()-t;}
    timing.detectTotalMs=performance.now()-started;
    postMessage({type:'result',id:d.id,cardPresent,cornersValid:valid,corners,presence,sharpness,reason,timing,cropBitmap},cropBitmap?[cropBitmap]:[]);
  }finally{tensor.dispose();dispose(output);}
}
async function identify(d){
  const started=performance.now();let embedInitMs=0;
  if(!embedder){embedder=await ort.InferenceSession.create('./models/milo.onnx',{executionProviders:['wasm']});features=new Uint16Array(await(await fetch('./data/full-features.f16.bin')).arrayBuffer());cards=await(await fetch('./data/milo-cards.json')).json();lookup=Float32Array.from({length:65536},(_,i)=>unhalf(i));if(features.length!==cards.length*128)throw Error('全体特徴量の件数が不一致です');embedInitMs=performance.now()-started;}
  const frame=new OffscreenCanvas(d.bitmap.width,d.bitmap.height);frame.getContext('2d').drawImage(d.bitmap,0,0);d.bitmap.close();
  const preprocessAt=performance.now(),tensor=input(frame,448),inferAt=performance.now();let output;
  try{
    output=await embedder.run({[embedder.inputNames[0]]:tensor});const vector=output[embedder.outputNames[0]].data,norm=Math.sqrt(vector.reduce((a,b)=>a+b*b,0));
    const searchAt=performance.now(),hits=[];
    // Top candidates grouped by Oracle identity; keep all artwork rows in the search.
    const best=new Map();for(let row=0;row<cards.length;row++){let score=0;for(let c=0;c<128;c++)score+=lookup[features[row*128+c]]*vector[c]/norm;const old=best.get(cards[row].oracleId);if(!old||score>old.score)best.set(cards[row].oracleId,{id:cards[row].id,oracleId:cards[row].oracleId,score});}
    hits.push(...[...best.values()].sort((a,b)=>b.score-a.score).slice(0,30));
    postMessage({type:'result',id:d.id,hits,timing:{embedInitMs,embedPreMs:inferAt-preprocessAt,embedRunMs:searchAt-inferAt,searchMs:performance.now()-searchAt,catalogRows:cards.length}});
  }finally{tensor.dispose();dispose(output);}
}
let chain=Promise.resolve();
self.onmessage=({data:d})=>{chain=chain.then(async()=>{try{
  if(d.type==='init'){ort.env.wasm.numThreads=1;ort.env.wasm.wasmPaths=new URL('./vendor/ort/',self.location).href;cards=d.cards;detector=await ort.InferenceSession.create('./models/detector.onnx',{executionProviders:['wasm']});postMessage({type:'result',id:d.id,ready:true});}
  else if(d.type==='detect')await detect(d);
  else if(d.type==='embed')await identify(d);
}catch(e){d.bitmap?.close();postMessage({type:'error',id:d.id,message:e.message});}});};
