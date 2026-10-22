// SPDX-License-Identifier: AGPL-3.0-only
(() => {
  const $=id=>document.getElementById(id), motion=scanFlow.createMotion();
  const small=document.createElement('canvas');small.width=32;small.height=40;
  const ctx=small.getContext('2d',{willReadFrequently:true});
  let stream,worker,timer,epoch=0,busy=false,paused=false,pending,watchdog,lastIdentity='',lastRow,lastTemplate;
  let stableAt=0,lastDetection=0; const logs=[],cache=new Map(),requests=new Set();
  const status=text=>{$('status').textContent=text;};
  const memory=()=>performance.memory?.usedJSHeapSize ?? null;
  function log(record){logs.push({...record,at:new Date().toISOString(),heapBytes:memory()});if(logs.length>100)logs.shift();}
  async function json(url,options={}) {
    const cached=cache.get(url);if(cached && Date.now()-cached.at<300000 && !options.method)return cached.data;
    const controller=new AbortController();requests.add(controller);const timeout=setTimeout(()=>controller.abort(),15000);
    try{const response=await fetch(url,{...options,signal:controller.signal});if(!response.ok)throw new Error(`カード情報を取得できません (${response.status})`);
      const data=await response.json();if(!options.method){cache.set(url,{data,at:Date.now()});if(cache.size>100)cache.delete(cache.keys().next().value);}return data;
    }finally{clearTimeout(timeout);requests.delete(controller);}
  }
  const card=id=>json('https://api.scryfall.com/cards/'+encodeURIComponent(id));
  function rpc(message,transfer=[]) {
    return new Promise((resolve,reject)=>{pending={resolve,reject};watchdog=setTimeout(()=>{pending=null;stop();status('認識がタイムアウトしました。開始で再試行できます');reject(new Error('認識がタイムアウトしました'));},message.type==='init'?180000:45000);worker.postMessage(message,transfer);});
  }
  function stop(){++epoch;clearTimeout(timer);clearTimeout(watchdog);scannerLanguage.cancel();pending?.reject(new DOMException('停止','AbortError'));pending=null;worker?.terminate();worker=null;stream?.getTracks().forEach(t=>t.stop());stream=null;$('video').srcObject=null;$('outline').setAttribute('points','');for(const c of requests)c.abort();busy=false;status('停止しました');}
  async function start(){stop();const token=epoch;busy=true;motion.reset();
    try{status('カメラと認識データを準備中…');
      const media=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'environment'},width:{ideal:1280},height:{ideal:960}},audio:false});
      if(token!==epoch){media.getTracks().forEach(t=>t.stop());return;}stream=media;$('video').srcObject=media;await $('video').play();
      const manifest=await json('vendor/manifest.json?v=304');if(token!==epoch)return;
      worker=new Worker('vendor/scanner.worker.mjs?v=304',{type:'module'});
      worker.onmessage=({data})=>{data.detectorBitmap?.close();if(token!==epoch){data.cropBitmap?.close();return;}
        if(data.type==='progress'){status('認識データを準備中…');return;}
        clearTimeout(watchdog);const task=pending;pending=null;if(data.type==='error')task?.reject(new Error(data.message));else task?.resolve(data);};
      worker.onerror=e=>{clearTimeout(watchdog);const task=pending;pending=null;stop();status('認識処理が停止しました。開始で再試行できます');task?.reject(new Error(e.message));};
      await rpc({type:'init',manifest,assetBasePath:'https://hanclinto.github.io/CollectorVision/assets',enableWebGpu:false,catalogMode:'v1',rotationInvariant:true});
      if(token!==epoch)return;busy=false;status('カードをかざしてください');schedule();
    }catch(e){if(token===epoch){stop();status(e.name==='NotAllowedError'?'カメラの使用を許可してください':e.message);}}
  }
  function sample(){const v=$('video');ctx.drawImage(v,v.videoWidth*.15,v.videoHeight*.1,v.videoWidth*.7,v.videoHeight*.8,0,0,32,40);const raw=ctx.getImageData(0,0,32,40).data;const a=[];for(let i=0;i<raw.length;i+=4)a.push((raw[i]+raw[i+1]+raw[i+2])/3);const mean=a.reduce((s,x)=>s+x,0)/a.length;return a.map(x=>x-mean);}
  function schedule(){clearTimeout(timer);if(stream&&!document.hidden)timer=setTimeout(tick,180);}
  async function tick(){try{
    if(busy||paused||$('list').open||!$('video').videoWidth)return;
    const pixels=sample(),state=motion.observe(pixels);
    if(!state.stable){stableAt=0;if(state.changed && performance.now()-lastDetection>1000)await detectOnly();return;}
    if(!state.changed)return;
    stableAt ||= performance.now();motion.attempted(pixels);await recognize();
  }catch(e){status('読み取り失敗：'+e.message+'。「再読取」で再試行できます。');}finally{schedule();}}
  async function detectOnly(){
    busy=true;lastDetection=performance.now();const token=epoch;
    try{const v=$('video'),c=$('capture'),scale=640/Math.max(v.videoWidth,v.videoHeight);
      c.width=Math.round(v.videoWidth*scale);c.height=Math.round(v.videoHeight*scale);c.getContext('2d').drawImage(v,0,0,c.width,c.height);
      const bitmap=await createImageBitmap(c);if(token!==epoch){bitmap.close();return;}
      const data=await rpc({type:'frame',bitmap,detectionOnly:true},[bitmap]);if(token!==epoch)return;
      $('guide').setAttribute('viewBox',`0 0 ${c.width} ${c.height}`);
      $('outline').setAttribute('points',data.cornersValid?data.corners.map(([x,y])=>`${x*c.width},${y*c.height}`).join(' '):'');
      status(data.cornersValid?'カードを検出しました。少し静止してください':'カードの四隅を映してください');
      log({outcome:'detection-only',worker:data.timing});
    }finally{if(token===epoch)busy=false;}
  }
  async function recognize(){if(busy||!stream)return;busy=true;const token=epoch,t0=performance.now();let bitmap;
    try{const v=$('video'),c=$('capture'),scale=Math.min(1,1280/Math.max(v.videoWidth,v.videoHeight));c.width=Math.round(v.videoWidth*scale);c.height=Math.round(v.videoHeight*scale);c.getContext('2d').drawImage(v,0,0,c.width,c.height);
      bitmap=await createImageBitmap(c);if(token!==epoch){bitmap.close();return;}
      $('candidate').hidden=true;uncertain=null;status('カード認識中…');const data=await rpc({type:'frame',bitmap,includeDebugBitmaps:$('language').value==='auto'},[bitmap]);
      if(token!==epoch){data.cropBitmap?.close();return;}
      $('guide').setAttribute('viewBox',`0 0 ${c.width} ${c.height}`);$('outline').setAttribute('points',data.cornersValid?data.corners.map(([x,y])=>`${x*c.width},${y*c.height}`).join(' '):'');
      const verdict=scanFlow.classify(data),record={worker:data.timing,stableToRecognitionMs:performance.now()-(stableAt||t0)};
      if(!data.cardPresent||!data.cornersValid||!data.cardId){data.cropBitmap?.close();status('カードの四隅を映してください');log({...record,outcome:'no-card'});return;}
      if(verdict.identity===lastIdentity){data.cropBitmap?.close();if(lastTemplate){$('result').hidden=false;$('name').textContent=lastTemplate.name;$('thumb').src=lastTemplate.image||'';$('resultStatus').textContent='追加済みのカードです';$('more').disabled=false;}status('同じカードです。「もう1枚」で追加できます');log({...record,outcome:'duplicate'});return;}
      $('more').disabled=true;$('result').hidden=false;$('name').textContent=data.cardName||'カードを識別しました';$('resultStatus').textContent='カード情報を取得中…';$('thumb').removeAttribute('src');
      let language=$('language').value;const languageStart=performance.now();
      if(language==='auto')language=await scannerLanguage.detect(data.cropBitmap,data.orientation==='rotated_180');else data.cropBitmap?.close();
      if(token!==epoch)return;record.languageMs=performance.now()-languageStart;
      const fetchStart=performance.now();let best=await card(data.cardId);if(token!==epoch)return;
      if(['ja','en'].includes(language) && best.lang!==language){
        try{const localized=await json(`https://api.scryfall.com/cards/${encodeURIComponent(best.set)}/${encodeURIComponent(best.collector_number)}/${language}`);
          if(localized.oracle_id===best.oracle_id && localized.set===best.set && String(localized.collector_number)===String(best.collector_number) && localized.lang===language)best=localized;
        }catch(e){if(e.name==='AbortError' && token!==epoch)return;}
      }
      if(token!==epoch)return;record.metadataMs=performance.now()-fetchStart;
      const template={image:best.image_uris?.small||best.card_faces?.[0]?.image_uris?.small||'',identity:best.oracle_id||verdict.identity,name:best.printed_name||best.name,candidateIds:[...new Set([best.id,data.cardId,...(data.candidates||[]).map(x=>x.cardId),...(data.identityCandidates||[]).map(x=>x.cardId)])].slice(0,6),language,finish:$('finish').value,score:data.score};
      $('name').textContent=template.name;$('thumb').src=best.image_uris?.small||best.card_faces?.[0]?.image_uris?.small||'';
      record.resultMs=performance.now()-t0;
      if(verdict.automatic){const saveStart=performance.now();const rows=await continuousDraft.add(template);if(token!==epoch)return;record.saveMs=performance.now()-saveStart;lastIdentity=verdict.identity;lastTemplate=template;lastRow=rows.at(-1).id;$('more').disabled=false;$('undo').disabled=false;
        $('resultStatus').textContent='仮追加しました · 収録版はリストで要確認';status('次のカードをかざしてください');await count();
      }else{
        $('resultStatus').textContent='カード候補が不確かです。リストで候補を確認できます';
        // Uncertain identity is not automatically persisted.
        uncertain=template;status('候補確認が必要です。「候補を確認」を押すか、次のカードへ');$('candidate').hidden=false;
      }
      log({...record,outcome:verdict.automatic?'pending-added':'uncertain',score:data.score,identityGap:data.identityCandidates?.length>1?data.identityCandidates[0].score-data.identityCandidates[1].score:null,totalMs:performance.now()-t0});
    }finally{if(token===epoch)busy=false;}
  }
  let uncertain=null;
  async function count(){const rows=await continuousDraft.read();$('review').textContent=`リスト ${rows.length}枚${rows.some(r=>r.review)?'・要確認':''}`;return rows;}
  async function act(fn){if(busy)return;busy=true;$('list').inert=true;try{await fn();}catch(e){status(e.message);$('message').textContent=e.message;}finally{$('list').inert=false;busy=false;schedule();}}
  async function showList(){paused=true;$('list').showModal();await render();}
  async function render(){const rows=await count();$('rows').replaceChildren();$('commit').disabled=!rows.length||rows.some(r=>r.review);
    for(const row of rows){const host=document.createElement('section');host.className='row';const title=document.createElement('strong');title.textContent=(row.review?'要確認：':'確認済み：')+row.name;host.append(title);
      const remove=document.createElement('button');remove.textContent='この1枚を取消';remove.onclick=()=>act(async()=>{await continuousDraft.remove(row.id);await render();});host.append(remove);
      const edit=document.createElement('button');edit.textContent='版・言語・仕様を確認';edit.onclick=()=>act(()=>editRow(row,host,edit));host.append(edit);$('rows').append(host);
    }
  }
  async function editRow(row,host,button){button.disabled=true;const box=document.createElement('div');host.append(box);
    try{
      let cards=await Promise.all(row.candidateIds.map(card));
      const select=document.createElement('select'),lang=document.createElement('select'),finish=document.createElement('select'),img=document.createElement('img'),info=document.createElement('p'),confirm=document.createElement('button'),editions=document.createElement('button');
      for(const [value,text] of [['ja','日本語'],['en','英語']])lang.add(new Option(text,value));lang.value=row.language==='ja'?'ja':'en';
      const fill=()=>{select.replaceChildren();for(const c of cards)select.add(new Option(`${c.printed_name||c.name} / ${c.set.toUpperCase()} #${c.collector_number} (${c.lang})`,c.id));};
      let selected=null,next=null;
      async function display(){confirm.disabled=true;selected=null;let c=cards.find(c=>c.id===select.value);if(!c)return;
        try{if(c.lang!==lang.value){const peer=await json(`https://api.scryfall.com/cards/${encodeURIComponent(c.set)}/${encodeURIComponent(c.collector_number)}/${lang.value}`);if(peer.oracle_id!==c.oracle_id||peer.set!==c.set||String(peer.collector_number)!==String(c.collector_number)||peer.lang!==lang.value)throw new Error('一致する収録版がありません');c=peer;}
          selected=c;img.src=c.image_uris?.normal||c.card_faces?.[0]?.image_uris?.normal||'';img.alt=c.printed_name||c.name;info.textContent=`${c.printed_name||c.name} / ${c.set_name} #${c.collector_number} / ${c.lang}`;
          finish.replaceChildren();for(const f of c.finishes||[])finish.add(new Option(f==='nonfoil'?'通常':f,f==='nonfoil'?'normal':f));if([...finish.options].some(o=>o.value===row.finish))finish.value=row.finish;
          confirm.disabled=!finish.value;
        }catch(e){info.textContent=e.message;}
      }
      lang.setAttribute('aria-label','言語');finish.setAttribute('aria-label','仕様');fill();const label=document.createElement('label');label.textContent='収録版・カード候補';label.append(select);box.append(label,lang,finish,img,info,editions,confirm);
      confirm.textContent='画像・収録版・言語・仕様を確認して確定';confirm.onclick=()=>act(async()=>{if(!selected)throw new Error('収録版を確認してください');await continuousDraft.confirm(row.id,selected,{language:selected.lang,finish:finish.value});await render();});
      editions.textContent='選択したカードの他の収録版を取得';editions.onclick=()=>act(async()=>{const base=cards.find(c=>c.id===select.value);const url=next||`https://api.scryfall.com/cards/search?q=${encodeURIComponent('oracleid:'+base.oracle_id+' lang:'+lang.value)}&unique=prints&order=released`;const data=await json(url);cards=[...new Map([...cards,...data.data].map(c=>[c.id,c])).values()];next=data.has_more?data.next_page:null;fill();await display();editions.textContent=next?'さらに収録版を取得':'収録版を取得済み';editions.disabled=!next;});
      select.onchange=()=>act(async()=>{next=null;editions.disabled=false;editions.textContent='選択したカードの他の収録版を取得';await display();});lang.onchange=select.onchange;await display();
    }catch(e){box.textContent=e.message;button.disabled=false;}
  }
  const candidate=document.createElement('button');candidate.id='candidate';candidate.textContent='候補を確認';candidate.hidden=true;$('controls').append(candidate);
  candidate.onclick=()=>act(async()=>{if(!uncertain)return;await continuousDraft.add(uncertain);uncertain=null;candidate.hidden=true;await showList();});
  $('more').onclick=()=>act(async()=>{if(!lastTemplate)return;const rows=await continuousDraft.add(lastTemplate);lastRow=rows.at(-1).id;$('undo').disabled=false;await count();status('もう1枚を仮追加しました');});
  $('undo').onclick=()=>act(async()=>{if(lastRow)await continuousDraft.remove(lastRow);lastRow=null;$('undo').disabled=true;await count();status('直前の1枚を取り消しました');});
  $('review').onclick=()=>act(showList);$('close').onclick=()=>{$('list').close();paused=false;schedule();};$('list').addEventListener('close',()=>{paused=false;schedule();});
  $('commit').onclick=()=>act(async()=>{await continuousDraft.commit();lastRow=null;$('undo').disabled=true;await render();$('message').textContent='コレクションへ保存しました';});
  $('start').onclick=()=>{if(!busy)start();};$('stop').onclick=stop;$('rescan').onclick=()=>{motion.reset();stableAt=0;schedule();};
  $('export').onclick=()=>{const url=URL.createObjectURL(new Blob([JSON.stringify({version:304,records:logs},null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='scanner-timing-'+Date.now()+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
  window.addEventListener('pagehide',stop);document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
  count().then(rows=>{const last=rows.at(-1);if(last){lastIdentity=last.identity;lastTemplate=last;lastRow=last.id;$('more').disabled=false;$('undo').disabled=false;}start();}).catch(e=>status(e.message));
})();
