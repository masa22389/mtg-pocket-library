const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const src=fs.readFileSync(require('node:path').join(__dirname,'../scanner-trial/vendor/scanner.worker.mjs'),'utf8').replace(/\r\n/g,'\n');
const start=src.indexOf('  search(query) {'),end=src.indexOf('\n}\n',start);
const c={FLOAT16_LOOKUP:[0,.98,.97,.8,.7]};vm.createContext(c);vm.runInContext('class Search { '+src.slice(start,end)+' }; globalThis.search=new Search()',c);
Object.assign(c.search,{catalogDims:1,catalogRows:4,embeddings:[1,2,3,4],cardIds:['a1','a2','b','c'],secondaryIds:['a','a','b','c'],secondaryIdField:'oracle_id'});
const result=c.search.search([1]);assert.equal(result.candidates[1].cardId,'a2');assert.equal(result.identityCandidates[1].identity,'b');assert.equal(result.identityCandidates[0].score,.98);
let embeds=0,closed=false,message;
const d={performance:{now:()=>1},frameCanvas:null,frameCtx:null,OffscreenCanvas:class {getContext(){return {drawImage(){}}}},runtime:{detect:async()=>({cardPresent:true,corners:[[0,0],[1,0],[1,1],[0,1]],timing:{detectMs:1}}),identify(){embeds++;}},isUsableQuad:()=>true,roundTiming:x=>x,self:{postMessage:m=>message=m}};
vm.createContext(d);const from=src.indexOf('async function processFrame('),to=src.indexOf('\nfunction sumTiming',from);vm.runInContext(src.slice(from,to),d);
(async()=>{await d.processFrame({width:640,height:480,close(){closed=true}},false,false,true);assert.equal(embeds,0);assert.equal(closed,true);assert.equal(message.detectionOnly,true);console.log('PASS distinct-card confidence grouping and detector-only path without image embedding');})().catch(e=>{console.error(e);process.exitCode=1});

