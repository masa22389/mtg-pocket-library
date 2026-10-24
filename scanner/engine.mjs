export const normalize=s=>String(s||'').normalize('NFKC').toLocaleLowerCase('en').replace(/[\p{P}\p{Z}\s]/gu,'');
export function editDistance(a,b){const row=Array.from({length:b.length+1},(_,i)=>i);for(let i=1;i<=a.length;i++){let diag=row[0];row[0]=i;for(let j=1;j<=b.length;j++){const old=row[j];row[j]=Math.min(row[j]+1,row[j-1]+1,diag+(a[i-1]===b[j-1]?0:1));diag=old;}}return row[b.length];}
export function nameIndex(records){const index=new Map();for(const c of records)for(const name of c.aliases||c.names||[]){const key=normalize(name);if(!key)continue;if(!index.has(key))index.set(key,new Set());index.get(key).add(c.oracleId);}return index;}
export function matchNames(text,index){const found=new Map();const lines=text.split(/\n|\r|\|/).map(normalize).filter(x=>x.length>=3);for(const line of lines){const ids=index.get(line);if(ids)for(const id of ids)found.set(id,{oracleId:id,score:1,exact:true,text:line});}
 if(found.size)return [...found.values()];
 // Fuzzy results are suggestions only. They never meet automatic-add conditions.
 for(const line of lines)for(const [key,ids]of index){const limit=key.length>=10?2:1;if(Math.abs(key.length-line.length)>limit||key.length<5)continue;const distance=editDistance(key,line);if(distance>0&&distance<=limit)for(const id of ids)found.set(id,{oracleId:id,score:.8-distance*.05,exact:false,text:line});}
 return [...found.values()].slice(0,12);
}
export function matchTitleOCR(text,index,cards){
  const ordinary=matchNames(text,index);if(ordinary.some(n=>n.exact))return ordinary;
  const verified=[];
  for(const line of text.split(/\n|\r/)){
    const m=line.trim().match(/^(.+?)\s+([0-9]{1,2})\s*$/u);if(!m)continue;
    const prefix=matchNames(m[1],index).filter(n=>n.exact);
    for(const hit of prefix){if(cards.some(c=>c.oracleId===hit.oracleId&&c.manaCost===`{${Number(m[2])}}`))verified.push({...hit,source:'exact-title-with-verified-numeric-mana'});}
  }
  return verified.length?verified:ordinary;
}
export function hamming(a,b){if(!a||!b||a.length!==b.length)return 128;let d=0;for(let i=0;i<a.length;i++){let x=parseInt(a[i],16)^parseInt(b[i],16);while(x){d++;x&=x-1;}}return d;}
export function hashImagePixels(rgba,w,h){const sx=Math.round(w*.08),ex=Math.round(w*.92),sy=Math.round(h*.16),ey=Math.round(h*.56),small=new Uint8ClampedArray(17*8*4);for(let y=0;y<8;y++)for(let x=0;x<17;x++){const x0=sx+Math.floor(x*(ex-sx)/17),x1=sx+Math.floor((x+1)*(ex-sx)/17),y0=sy+Math.floor(y*(ey-sy)/8),y1=sy+Math.floor((y+1)*(ey-sy)/8);let r=0,g=0,b=0,n=0;for(let j=y0;j<y1;j++)for(let i=x0;i<x1;i++){const o=(j*w+i)*4;r+=rgba[o];g+=rgba[o+1];b+=rgba[o+2];n++;}const o=(y*17+x)*4;small[o]=Math.round(r/n);small[o+1]=Math.round(g/n);small[o+2]=Math.round(b/n);small[o+3]=255;}return hashPixels(small);}
export function hashPixels(rgba,width=17,height=8){let s='';for(let y=0;y<height;y++)for(let x=0;x<width-1;x+=8){let byte=0;for(let j=0;j<8;j++){const a=(y*width+x+j)*4,b=a+4;const l=rgba[a]*.299+rgba[a+1]*.587+rgba[a+2]*.114;const r=rgba[b]*.299+rgba[b+1]*.587+rgba[b+2]*.114;byte=byte*2+(l>r?1:0);}s+=byte.toString(16).padStart(2,'0');}return s;}
export function hashRank(hash,cards){return cards.map(c=>({id:c.id,oracleId:c.oracleId,score:1-hamming(hash,c.dhash)/128,distance:hamming(hash,c.dhash)})).sort((a,b)=>b.score-a.score);}
export function byIdentity(hits){const seen=new Set();return hits.filter(h=>{if(seen.has(h.oracleId))return false;seen.add(h.oracleId);return true;});}
export function decide({mode,hits=[],names=[]}){const distinct=byIdentity(hits),top=distinct[0],next=distinct[1];const exact=[...new Set(names.filter(n=>n.exact).map(n=>n.oracleId))];if(!top)return {automatic:false,reason:'候補なし'};
 const margin=next?top.score-next.score:0;
 if(mode==='ocr')return {automatic:exact.length===1&&exact[0]===top.oracleId,reason:'OCR完全一致（試用条件）'};
 if(mode==='hash')return {automatic:top.distance<=10&&distinct.length>=2&&((next?.distance||0)-top.distance)>=6,reason:'画像指紋（未校正）'};
 if(mode==='embed')return {automatic:top.score>=.87&&margin>=.06&&distinct.length>=2,reason:'画像特徴（未校正）'};
 return {automatic:exact.length===1&&exact[0]===top.oracleId&&(mode==='ocrhash'?top.distance<=18:top.score>=.82),reason:'OCRと画像の一致（未校正）'};
}
export function createGate(){let last=null;return {accept(oracleId){if(last===oracleId)return false;last=oracleId;return true;},reset(){last=null;}};}
export function finishOptions(c,requested){return c.finishes.includes(requested)?requested:null;}
export function matchFooter(text,cards){const upper=text.toUpperCase();const sets=new Set(cards.map(c=>c.set.toUpperCase()));const codes=[...sets].filter(set=>new RegExp('(?:^|[^A-Z])'+set+'(?:$|[^A-Z])').test(upper));if(codes.length!==1)return[];const numbers=new Set((upper.match(/\b\d+[A-Z]?\b/g)||[]).map(n=>n.replace(/^0+(?=\d)/,'')));return cards.filter(c=>c.set.toUpperCase()===codes[0]&&numbers.has(c.number.toUpperCase().replace(/^0+(?=\d)/,''))).map(c=>c.id);}
export function choosePrinting(cards,hits,language){const identity=hits[0]?.oracleId;for(const hit of hits){if(hit.oracleId!==identity)continue;const c=cards.find(c=>c.id===hit.id&&c.lang===language);if(c)return c;}const best=cards.find(c=>c.id===hits[0]?.id);return best?cards.find(c=>c.oracleId===identity&&c.lang===language&&c.set===best.set&&c.number===best.number&&c.artId===best.artId)||null:null;}

export function assess({mode,hits=[],names=[]}){
  const [top,next]=byIdentity(hits),exact=[...new Set(names.filter(n=>n.exact).map(n=>n.oracleId))];
  const details={exactNames:exact.length,score:top?.score??null,distance:top?.distance??null,margin:next&&top?top.score-next.score:null};
  const result=(automatic,code,reason)=>({automatic,code,reason,...details});
  if(!top)return result(false,'NO_HITS','候補なし。未導入のカードか、名前を読めていません');
  if(mode==='adaptive'&&next&&top.score>=.87&&top.score-next.score>=.06)return result(true,'IMAGE_STRONG','画像候補が試用条件を満たしたため、名前OCRを省略');
  if(mode==='hash'){
    if(top.distance>10)return result(false,'HASH_DISTANCE','画像指紋の距離が大きい（10以下が条件）');
    if(!next||next.distance-top.distance<6)return result(false,'HASH_MARGIN','別カード候補との差が不足（6以上が条件）');
    return result(true,'HASH_ACCEPT','画像指紋の試用条件を通過');
  }
  if(mode==='embed'){
    if(top.score<.87)return result(false,'IMAGE_SCORE','画像スコアが不足（0.87以上が条件）');
    if(!next||top.score-next.score<.06)return result(false,'IMAGE_MARGIN','別カード候補との差が不足（0.06以上が条件）');
    return result(true,'IMAGE_ACCEPT','画像特徴の試用条件を通過');
  }
  if(exact.length!==1)return result(false,'OCR_NOT_UNIQUE',exact.length?'名前の完全一致が複数あります':'名前OCRの完全一致がありません');
  if(exact[0]!==top.oracleId)return result(false,'OCR_IMAGE_CONFLICT','名前OCRと画像の候補が一致していません');
  if(mode==='ocr')return result(true,'OCR_ACCEPT','名前の完全一致が1種類');
  if(mode==='ocrhash'&&top.distance>18)return result(false,'HYBRID_HASH_DISTANCE','名前は一致しましたが画像指紋の距離が大きい');
  if(mode!=='ocrhash'&&(top.score<.82||(mode==='adaptive'&&(!next||top.score-next.score<.03))))return result(false,'HYBRID_IMAGE_SCORE','名前は一致しましたが画像の裏付けが不足');
  return result(true,'HYBRID_ACCEPT','名前と画像の試用条件を通過');
}
