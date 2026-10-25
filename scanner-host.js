// Retain a laid-out scanner frame and switch to it only after its runtime is ready.
(() => {
 let frame,shell,visible=false,phase='loading',requested=false,progress='',warmStarted=false;
 const getEntry=()=>document.querySelector('a[href^="scanner/live.html"]');
 let status=document.createElement('p');status.id='scannerWarmStatus';status.setAttribute('role','status');status.setAttribute('aria-live','polite');getEntry()?.parentElement.after(status);
 function update(){const entry=getEntry();if(entry){entry.setAttribute('aria-busy',String(phase==='loading'));entry.removeAttribute('aria-disabled');entry.setAttribute('aria-label',phase==='ready'?'カードをスキャン':phase==='error'?'スキャナーの準備を再試行':'準備完了後にスキャン画面を開く');}
  status.replaceChildren();const text=document.createElement('span');text.textContent=phase==='ready'?'スキャナーを使えます':phase==='error'?'スキャナーの準備に失敗しました。もう一度押すと再試行します。':requested?'スキャナーを準備しています。完了したら開きます。':'スキャナーを準備しています。ほかの操作は利用できます。';status.append(text);
  if(progress&&phase==='loading'){const detail=document.createElement('small');detail.textContent=progress;status.append(detail);}
  if(requested){const cancel=document.createElement('button');cancel.type='button';cancel.className='ghost compact';cancel.textContent='開くのをキャンセル';cancel.onclick=()=>{requested=false;update()};status.append(cancel);}
 }
 function ensure(){if(frame)return frame;shell=document.createElement('section');shell.id='scannerHostShell';shell.dataset.open='false';shell.inert=true;shell.setAttribute('aria-label','カードスキャナー');frame=document.createElement('iframe');frame.id='scannerHostFrame';frame.title='カードスキャナー';frame.allow='camera';frame.loading='eager';frame.src='scanner/live.html?embedded=1&v=318';shell.append(frame);document.body.append(shell);return frame;}
 function show(){if(phase!=='ready')return;visible=true;requested=false;shell.dataset.open='true';shell.inert=false;document.body.classList.add('scannerHostOpen');frame.contentWindow?.postMessage({type:'mtg-scanner-resume'},location.origin);update();}
 function open(event){event?.preventDefault();if(phase==='ready'){show();return;}requested=true;if(phase==='error'){phase='loading';progress='';ensure().src='scanner/live.html?embedded=1&v=318';}else warm();update();}
 function close(){visible=false;requested=false;if(frame){frame.contentWindow?.postMessage({type:'mtg-scanner-suspend'},location.origin);shell.dataset.open='false';shell.inert=true;}document.body.classList.remove('scannerHostOpen');update();}
 document.addEventListener('click',event=>{if(event.target.closest('a[href^="scanner/live.html"]'))open(event);else if(event.target.closest('[data-view]')){requested=false;update();}});
 window.addEventListener('message',event=>{if(!frame||event.source!==frame.contentWindow||event.origin!==location.origin)return;const data=event.data||{};
  if(data.type==='mtg-scanner-close')close();
  if(data.type==='mtg-scanner-progress'&&phase==='loading'){progress=data.message||'';update();}
  if(data.type==='mtg-scanner-ready'){phase='ready';progress='';if(requested)show();else update();}
  if(data.type==='mtg-scanner-error'){phase='error';progress='';update();}
  if(data.type==='mtg-scanner-collection-changed')window.dispatchEvent(new Event('mtg-scanner-collection-changed'));
 });
 window.mtgScannerHost={open,close,get frame(){return frame},get visible(){return visible},get phase(){return phase}};
 async function warm(){if(warmStarted)return;warmStarted=true;try{if('serviceWorker'in navigator)await navigator.serviceWorker.ready;setTimeout(ensure,200);}catch{phase='error';update();}}
 update();if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',warm,{once:true});else warm();
})();
