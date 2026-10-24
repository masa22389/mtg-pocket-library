export class AlignClient{
 constructor(){this.worker=new Worker(new URL('./align.worker.mjs',import.meta.url),{type:'module'});this.pending=new Map();this.seq=0;this.closed=false;this.worker.onmessage=({data:d})=>{const p=this.pending.get(d.id);if(!p){d.bitmap?.close();return;}clearTimeout(p.timer);this.pending.delete(d.id);d.error?p.reject(Error(d.error)):p.resolve(d);};this.worker.onerror=e=>this.close(Error(e.message));}
 call(bitmap){if(this.closed){bitmap.close();return Promise.reject(Error('停止しました'));}return new Promise((resolve,reject)=>{const id=++this.seq,timer=setTimeout(()=>{this.pending.delete(id);reject(Error('枠内補正が10秒で完了しませんでした'));},10000);this.pending.set(id,{resolve,reject,timer});this.worker.postMessage({id,bitmap},[bitmap]);});}
 close(error=Error('停止しました')){this.closed=true;this.worker.terminate();for(const p of this.pending.values()){clearTimeout(p.timer);p.reject(error);}this.pending.clear();}
}
