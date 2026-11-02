// Load the scanner frame on first open, keep it while in use, and release it after a while unused.
(() => {
 // The scanner page is opened with this app version (scanner-host.js?v=NNN), not a fixed old number.
 const APP_VERSION=new URL(document.currentScript?.src||location.href).searchParams.get('v')||'';
 const META='mtg-pocket-hybrid-scanner-meta-v1',IDLE_RELEASE_MS=5*60*1000,SW_TIMEOUT_MS=20000;
 let previousTab;
 let frame,shell,visible=false,phase='idle',requested=false,progress='',errorText='',consentMb=0,consentReply=null,idleTimer=null;
 const getEntry=()=>document.querySelector('[data-action="open-scanner"]');
 let status=document.createElement('p');status.id='scannerWarmStatus';status.setAttribute('role','status');status.setAttribute('aria-live','polite');document.body.append(status);
 function button(label,className,onclick,id){const b=document.createElement('button');b.type='button';if(className)b.className=className;if(id)b.id=id;b.textContent=label;b.onclick=onclick;return b;}
 function update(){const entry=getEntry();if(entry){entry.setAttribute('aria-busy',String(requested&&phase==='loading'));entry.removeAttribute('aria-disabled');entry.setAttribute('aria-label',phase==='ready'||phase==='idle'?'カードをスキャン':phase==='error'?'スキャナーの準備を再試行':phase==='consent'?'スキャナー用データのダウンロードを確認':'準備完了後にスキャン画面を開く');}
  status.hidden=!requested;status.replaceChildren();const text=document.createElement('span');text.textContent=phase==='consent'?`スキャナーを初めて使うときは、認識用データ（約${consentMb}MB）をダウンロードします。Wi-Fiでの利用をおすすめします。`:phase==='ready'?'スキャナーを使えます':phase==='error'?`スキャナーの準備に失敗しました${errorText?'（'+errorText+'）':''}。もう一度押すと再試行します。`:'スキャナーを準備しています。完了したら開きます。';status.append(text);
  if(progress&&phase==='loading'){const detail=document.createElement('small');detail.textContent=progress;status.append(detail);}
  if(phase==='consent')status.append(button('ダウンロードして開く','',()=>consentReply?.(true),'scannerConsentAccept'),button('やめる','ghost',()=>consentReply?.(false),'scannerConsentDecline'));
  else if(requested)status.append(button(phase==='error'?'閉じる':'開くのをキャンセル','ghost compact',()=>{requested=false;update();}));
 }
 function ensure(){if(frame)return frame;shell=document.createElement('section');shell.id='scannerHostShell';shell.dataset.open='false';shell.inert=true;shell.setAttribute('aria-label','カードスキャナー');frame=document.createElement('iframe');frame.id='scannerHostFrame';frame.title='カードスキャナー';frame.allow='camera';frame.loading='eager';frame.src='scanner/live.html?embedded=1&v='+APP_VERSION;shell.append(frame);document.body.append(shell);return frame;}
 // Destroying the frame frees its workers, recognition data and camera pipeline; drafts are already saved.
 function release(){clearTimeout(idleTimer);if(visible||!frame)return;frame.remove();shell.remove();frame=shell=null;phase='idle';progress='';update();}
 function scheduleRelease(){clearTimeout(idleTimer);idleTimer=setTimeout(()=>{if(!visible&&!requested)release();},IDLE_RELEASE_MS);}
 async function start(){
  phase='loading';progress='';errorText='';update();
  try{
   if(!('serviceWorker'in navigator)||!('caches'in window))throw Error('このブラウザはスキャナーに対応していません');
   // The first download is large, so ask before it starts. Later updates reuse unchanged files.
   // The scanner stores this marker relative to scanner/, not to this page.
   if(!await(await caches.open(META)).match('scanner/active')){
    const response=await fetch('scanner/pack.json',{cache:'no-store'}).catch(()=>null);if(!response?.ok)throw Error('スキャナー用データを確認できません。通信状態を確認してください');
    consentMb=Math.round((await response.json()).assets.reduce((sum,asset)=>sum+asset.bytes,0)/1e6);phase='consent';update();
    const accepted=await new Promise(resolve=>consentReply=resolve);consentReply=null;
    if(!accepted){phase='idle';requested=false;update();return;}
    phase='loading';update();
   }
   await Promise.race([navigator.serviceWorker.ready,new Promise((_,reject)=>setTimeout(()=>reject(Error('アプリの準備が完了しません。再読み込みしてください')),SW_TIMEOUT_MS))]);
   ensure();
  }catch(e){phase='error';errorText=e.message;update();}
 }
 // The open scanner is a history entry so Android's back button closes it instead of leaving the app.
 function show(){if(phase!=='ready')return;clearTimeout(idleTimer);if(history.state?.overlay!=='scanner')history.pushState({mtgDepth:(Number(history.state?.mtgDepth)||0)+1,view:document.querySelector('.view.active')?.id.replace(/View$/,'')||'search',overlay:'scanner'},'');if(!visible)previousTab=document.querySelector('.bottom-nav button.active');document.querySelectorAll('.bottom-nav button').forEach(b=>b.classList.toggle('active',b.dataset.action==='open-scanner'));visible=true;requested=false;shell.dataset.open='true';shell.inert=false;document.body.classList.add('scannerHostOpen');frame.contentWindow?.postMessage({type:'mtg-scanner-resume'},location.origin);update();}
 function open(event){event?.preventDefault();if(phase==='ready'){show();return;}requested=true;if(phase==='error'){if(frame){frame.remove();shell.remove();frame=shell=null;}phase='idle';}if(phase==='idle')start();else update();}
 function close(restore=true){if(visible&&restore){document.querySelectorAll('.bottom-nav button').forEach(b=>b.classList.toggle('active',b===previousTab));}visible=false;requested=false;if(frame){frame.contentWindow?.postMessage({type:'mtg-scanner-suspend'},location.origin);shell.dataset.open='false';shell.inert=true;scheduleRelease();}document.body.classList.remove('scannerHostOpen');update();}
 document.addEventListener('click',event=>{if(event.target.closest('a[href^="scanner/live.html"], [data-action="open-scanner"]'))open(event);else if(event.target.closest('[data-view]')){close(false);}});
 window.addEventListener('message',event=>{if(!frame||event.source!==frame.contentWindow||event.origin!==location.origin)return;const data=event.data||{};
  if(data.type==='mtg-scanner-close'){if(history.state?.overlay==='scanner')history.back();else close();}
  if(data.type==='mtg-scanner-progress'&&phase==='loading'){progress=data.message||'';update();}
  if(data.type==='mtg-scanner-ready'){phase='ready';progress='';if(requested)show();else{update();scheduleRelease();}}
  if(data.type==='mtg-scanner-error'){phase='error';errorText=data.message||'';progress='';update();}
  if(data.type==='mtg-scanner-collection-changed')window.dispatchEvent(new Event('mtg-scanner-collection-changed'));
 });
 window.mtgScannerHost={open,close,release,get frame(){return frame},get visible(){return visible},get phase(){return phase}};
 update();
})();
