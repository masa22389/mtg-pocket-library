export class VisionClient{
  constructor(cards){
    this.worker=new Worker(new URL('./vision.worker.mjs',import.meta.url),{type:'module'});this.pending=new Map();this.sequence=0;this.closed=false;
    this.worker.onmessage=({data:d})=>{const p=this.pending.get(d.id);if(!p){d.cropBitmap?.close();return;}clearTimeout(p.timer);this.pending.delete(d.id);d.type==='error'?p.reject(Error(d.message)):p.resolve(d);};
    this.worker.onerror=e=>this.close(Error(e.message));
    this.ready=this.call('init',{cards:[]});
  }
  call(type,data={},transfer=[]){
    if(this.closed)return Promise.reject(Error('認識Workerは停止しています'));
    const id=++this.sequence;
    return new Promise((resolve,reject)=>{const timer=setTimeout(()=>{this.pending.delete(id);reject(Error(type+' が45秒で完了しませんでした'));},45000);this.pending.set(id,{resolve,reject,timer});try{this.worker.postMessage({type,id,...data},transfer);}catch(e){clearTimeout(timer);this.pending.delete(id);reject(e);}});
  }
  close(reason=Error('停止しました')){if(this.closed)return;this.closed=true;for(const p of this.pending.values()){clearTimeout(p.timer);p.reject(reason);}this.pending.clear();this.worker.terminate();}
}
