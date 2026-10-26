// Match collection/deck gestures: 450ms hold, cancel after 18px movement.
export function bindDraftPress(button,{isSelecting,isDisabled,onToggle,onOpen}){
 let timer,start,suppressUntil=0;
 const cancel=()=>{clearTimeout(timer);timer=null;start=null;};
 const down=e=>{if(isDisabled()||(e.pointerType==='mouse'&&e.button!==0))return;cancel();suppressUntil=0;start={x:e.clientX,y:e.clientY};timer=setTimeout(()=>{timer=null;suppressUntil=performance.now()+800;onToggle();},450);};
 const move=e=>{if(start&&Math.hypot(e.clientX-start.x,e.clientY-start.y)>18)cancel();};
 const click=e=>{if(isDisabled())return;e.preventDefault();if(performance.now()<suppressUntil){suppressUntil=0;return;}if(isSelecting())onToggle();else onOpen();};
 const prevent=e=>e.preventDefault();
 const listeners={pointerdown:down,pointermove:move,pointerup:cancel,pointercancel:cancel,lostpointercapture:cancel,click,contextmenu:prevent,dragstart:prevent};
 for(const [name,handler]of Object.entries(listeners))button.addEventListener(name,handler);
 return ()=>{cancel();for(const [name,handler]of Object.entries(listeners))button.removeEventListener(name,handler);};
}
