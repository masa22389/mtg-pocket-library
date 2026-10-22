const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
let closed=0,terminated=0,currentWorker,timer,reply={text:'飛行。このクリーチャーは攻撃できない。',confidence:80};
const ctx={window:{addEventListener(){}},document:{createElement(){return {width:0,height:0,getContext(){return {translate(){},rotate(){},drawImage(){}}},toDataURL(){return 'data:image/png;base64,AA';}}}},Worker:class{constructor(){currentWorker=this;}postMessage(){if(reply)queueMicrotask(()=>this.onmessage({data:reply}));}terminate(){terminated++;}},setTimeout(fn){timer=fn;return 1;},clearTimeout(){}};
vm.createContext(ctx);vm.runInContext(fs.readFileSync(path.join(__dirname,'../scanner-trial/scanner-language.js'),'utf8'),ctx);
const api=ctx.window.scannerLanguage;
assert.equal(api.classify('飛行。このクリーチャーは攻撃できない。',80),'ja');
assert.equal(api.classify('Flying. Activated abilities cannot be activated. の ラ キテ',74),'unknown');
assert.equal(api.classify('飛行。このクリーチャーは攻撃できない。',20),'unknown');
assert.equal(api.classify('龍 王 天 地',90),'unknown');
(async()=>{
 const bitmap=()=>({close(){closed++;}});
 assert.equal(await api.detect(bitmap()),'ja');assert.equal(closed,1);assert.equal(terminated,1);
 reply=null;let p=api.detect(bitmap());api.cancel();assert.equal(await p,'unknown');assert.equal(terminated,2);
 p=api.detect(bitmap());timer();assert.equal(await p,'unknown');assert.equal(terminated,3);
 p=api.detect(bitmap());currentWorker.onerror();assert.equal(await p,'unknown');assert.equal(terminated,4);
 assert.match(api.lastReason,/起動/);
 reply={error:true,text:'',confidence:0};assert.equal(await api.detect(bitmap()),'unknown');assert.match(api.lastReason,/失敗/);
 console.log('PASS Japanese classification, English decoration rejection, low confidence, cancel/timeout/error resource cleanup');
})();
