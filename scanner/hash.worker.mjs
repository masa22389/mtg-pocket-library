import {phashCanvas,PHASH_VERSION,distance} from './fingerprint.mjs';
let cards,refs,lut;
self.onmessage=({data:d})=>{try{
 if(d.type==='init'){init(d);return;}
 const started=performance.now(),c=new OffscreenCanvas(d.bitmap.width,d.bitmap.height);c.getContext('2d').drawImage(d.bitmap,0,0);d.bitmap.close();const hash=phashCanvas(c),bytes=Uint8Array.from({length:32},(_,i)=>parseInt(hash.slice(i*2,i*2+2),16)),searchAt=performance.now(),best=new Map();
 for(let row=0;row<cards.length;row++){let n=0;for(let k=0;k<32;k++)n+=lut[bytes[k]^refs[row*32+k]];const card=cards[row],old=best.get(card.oracleId);if(!old||n<old.distance)best.set(card.oracleId,{id:card.id,oracleId:card.oracleId,distance:n,score:1-n/256});}
 const hits=[...best.values()].sort((a,b)=>a.distance-b.distance).slice(0,30);postMessage({id:d.id,hits,timing:{featureMs:searchAt-started,searchMs:performance.now()-searchAt,catalogRows:cards.length}});
 }catch(e){d.bitmap?.close();postMessage({id:d.id,error:e.message});}};
async function init(d){try{cards=d.cards;const meta=await(await fetch('./data/phash-meta.json')).json();if(meta.algorithm!==PHASH_VERSION||meta.rows!==cards.length)throw Error('全体pHashデータが不一致');refs=new Uint8Array(await(await fetch('./data/phash.bin')).arrayBuffer());if(refs.length!==cards.length*32)throw Error('指紋の長さが不一致');lut=Uint8Array.from({length:256},(_,v)=>{let n=0;while(v){n++;v&=v-1;}return n;});postMessage({id:d.id});}catch(e){postMessage({id:d.id,error:e.message});}}
