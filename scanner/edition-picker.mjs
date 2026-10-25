export function sortPrintings(rows,display){return [...rows].sort((a,b)=>(display.releaseDates?.[b.set]||'').localeCompare(display.releaseDates?.[a.set]||'')||(display.sets?.[a.set]||a.set).localeCompare(display.sets?.[b.set]||b.set)||String(a.number).localeCompare(String(b.number),undefined,{numeric:true}));}
export function printingMatches(printing,query,setName=''){
 const normalize=v=>String(v||'').normalize('NFKC').toLowerCase().replace(/[\s#·・]/g,'');
 return normalize(setName+' '+printing.set+' '+printing.number).includes(normalize(query));
}
export function printingImage(printing,display={}){
 if(display.imageOverrides?.[printing.id])return display.imageOverrides[printing.id];
 const id=printing.id;if(!/^[0-9a-f-]{36}$/i.test(id))return '';
 return `https://cards.scryfall.io/small/front/${id[0]}/${id[1]}/${id}.jpg`;
}
export const finishName=f=>({nonfoil:'通常',normal:'通常',foil:'Foil',etched:'エッチング'}[f]||f);
export class EditionPicker{
 constructor({dialog,load,apply,onClose}){
  this.dialog=dialog;this.load=load;this.apply=apply;this.onClose=onClose;this.token=0;this.saving=false;
  const el=id=>dialog.querySelector('#'+id);this.el=el;
  el('editionSearch').addEventListener('input',()=>{this.limit=60;this.render();});
  el('editionMore').onclick=()=>{this.limit+=60;this.render();};
  el('editionClose').onclick=()=>this.close();
  el('editionDone').onclick=()=>this.done();
  el('editionLanguage').onchange=()=>{this.language=el('editionLanguage').value;this.render();};
  dialog.addEventListener('cancel',e=>{e.preventDefault();this.close();});
  dialog.addEventListener('close',()=>{for(const cancel of this.imageBindings||[])cancel();this.token++;this.onClose?.();});
 }
 async open(row){
  if(!row||this.saving)return;const token=++this.token;this.row=row;this.selected=row.printId||null;this.finish=row.finish||'normal';this.language=row.language||'ja';this.limit=60;this.rows=[];this.display={};
  this.el('editionCardName').textContent=row.name;this.el('editionSearch').value='';this.el('editionLanguage').value=this.language;this.el('editionMessage').textContent='収録版を読み込んでいます…';this.el('editionResults').replaceChildren();this.el('editionFinishes').replaceChildren();this.el('editionDone').disabled=true;this.el('editionMore').hidden=true;
  if(!this.dialog.open)this.dialog.showModal();this.el('editionTitle').focus({preventScroll:true});
  try{const data=await this.load(row.oracleId);if(token!==this.token)return;this.rows=sortPrintings(data.rows,data.display);this.display=data.display;this.render();this.el('editionMessage').textContent='版を選び、言語・仕様を確認して「完了」を押してください。';}
  catch(e){if(token===this.token)this.el('editionMessage').textContent='読み込めません：'+e.message;}
 }
 close(){if(!this.saving)this.dialog.close();}
 render(){
  for(const cancel of this.imageBindings||[])cancel();this.imageBindings=[];
  const filtered=this.rows.filter(p=>printingMatches(p,this.el('editionSearch').value,this.display.sets?.[p.set]));
  const frag=document.createDocumentFragment();
  for(const p of filtered.slice(0,this.limit)){
   const button=document.createElement('button');button.className='editionRow';button.type='button';button.setAttribute('aria-pressed',String(p.id===this.selected));button.dataset.printId=p.id;
   const image=document.createElement('img');image.alt='';image.loading='lazy';image.referrerPolicy='no-referrer';image.src=printingImage(p,this.display);image.onerror=()=>{image.hidden=true;};
   const text=document.createElement('span'),title=document.createElement('strong'),number=document.createElement('span'),spec=document.createElement('small'),check=document.createElement('span');
   title.textContent=this.display.sets?.[p.set]||p.set.toUpperCase();number.textContent=`${p.set.toUpperCase()} · #${p.number}`;spec.textContent=(p.finishes||[]).map(finishName).join(' ・ ');check.textContent=p.id===this.selected?'✓':'';check.className='editionCheck';check.setAttribute('aria-hidden','true');const imageStatus=document.createElement('small');imageStatus.className='editionImageStatus';imageStatus.textContent=this.language==='ja'?'日本語画像を確認中（英語画像を表示）':'英語画像';text.append(title,number,spec,imageStatus);button.append(image,text,check);if(this.language==='ja'&&globalThis.MtgCardImages){this.imageBindings.push(globalThis.MtgCardImages.bind(image,{set:p.set,number:p.number,oracleId:this.row.oracleId,language:this.language,allowRepresentative:true,fallbackUrl:printingImage(p,this.display)},result=>{imageStatus.textContent=result.representative?`日本語参考画像：${result.imageSet.toUpperCase()} #${result.imageNumber}`:result.fallback?'日本語画像を取得できません（英語画像）':'日本語画像';image.alt=this.row.name+' / '+imageStatus.textContent;}));}
   button.onclick=()=>{this.selected=p.id;this.render();};frag.append(button);
  }
  if(!filtered.length){const empty=document.createElement('p');empty.textContent='一致する収録版はありません。セット名・略号・番号で検索できます。';frag.append(empty);}
  const list=this.el('editionResults'),scroll=list.scrollTop;list.replaceChildren(frag);list.scrollTop=scroll;
  this.el('editionCount').textContent=filtered.length+'件';this.el('editionMore').hidden=filtered.length<=this.limit;
  const selected=this.rows.find(p=>p.id===this.selected),available=selected?.finishes||[];
  if(!available.includes(this.finish==='normal'?'nonfoil':this.finish))this.finish=available.includes('nonfoil')?'normal':available[0]||'normal';
  const buttons=available.map(apiFinish=>{const f=apiFinish==='nonfoil'?'normal':apiFinish,b=document.createElement('button');b.type='button';b.textContent=finishName(f);b.setAttribute('aria-pressed',String(f===this.finish));b.onclick=()=>{this.finish=f;this.render();};return b;});this.el('editionFinishes').replaceChildren(...buttons);this.el('editionDone').disabled=!selected||!available.length||this.saving;
 }
 async done(){
  const printing=this.rows.find(p=>p.id===this.selected);if(this.saving||!printing)return;this.saving=true;this.el('editionControls').inert=true;this.el('editionClose').disabled=true;this.el('editionDone').disabled=true;this.el('editionDone').textContent='確認中…';this.el('editionMessage').textContent='選択した版・言語・仕様を確認しています…';
  try{await this.apply(this.row,printing,this.language,this.finish);this.dialog.close();}
  catch(e){this.el('editionMessage').textContent='確認できません：'+e.message;}
  finally{this.saving=false;this.el('editionControls').inert=false;this.el('editionClose').disabled=false;this.el('editionDone').textContent='完了';this.el('editionDone').disabled=!this.selected;}
 }
}
