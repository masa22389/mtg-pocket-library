// Keep the scanner document and its local recognition workers alive across app views.
(() => {
 let frame,visible=false;
 function ensure(){if(frame)return frame;frame=document.createElement('iframe');frame.id='scannerHostFrame';frame.title='カードスキャナー';frame.allow='camera';frame.src='scanner/live.html?embedded=1&v=307';frame.hidden=true;document.body.append(frame);return frame;}
 function open(event){event?.preventDefault();visible=true;ensure().hidden=false;document.body.classList.add('scannerHostOpen');frame.contentWindow?.postMessage({type:'mtg-scanner-resume'},location.origin);}
 function close(){visible=false;if(frame){frame.contentWindow?.postMessage({type:'mtg-scanner-suspend'},location.origin);frame.hidden=true;}document.body.classList.remove('scannerHostOpen');}
 document.addEventListener('click',event=>{if(event.target.closest('a[href^="scanner/live.html"]'))open(event);});
 window.addEventListener('message',event=>{if(!frame||event.source!==frame.contentWindow||event.origin!==location.origin)return;if(event.data?.type==='mtg-scanner-close')close();if(event.data?.type==='mtg-scanner-collection-changed')window.dispatchEvent(new Event('mtg-scanner-collection-changed'));});
 window.mtgScannerHost={open,close,get frame(){return frame},get visible(){return visible}};
 async function warm(){if('serviceWorker'in navigator)await navigator.serviceWorker.ready;setTimeout(()=>{if('requestIdleCallback'in window)requestIdleCallback(ensure,{timeout:1500});else ensure();},200);}
 if(document.readyState==='complete')warm();else window.addEventListener('load',warm,{once:true});
})();
