const {chromium}=require(process.argv[2]||'playwright'),assert=require('node:assert/strict');
(async()=>{const b=await chromium.launch({headless:true,...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{})});try{
 const c=await b.newContext({viewport:{width:390,height:844}}),p=await c.newPage();await p.goto('http://127.0.0.1:4174/scanner/style.css');for(const src of ['boot-config.js','shared-storage.js','collection-store.js'])await p.addScriptTag({url:'http://127.0.0.1:4174/scanner/'+src});
 await p.evaluate(async()=>{const store=(await import('./integrated-store.mjs')).integratedStore;await store.read();await store.save({events:[{id:'kraken',oracleId:'83c61083-b357-4775-a855-5a9013cc2bdf',name:'Verdant Kraken',printId:null},{id:'sphinx',oracleId:'48b1ac27-430f-4fd9-a71b-6ad125c57fe3',name:"Sphinx's Approach",printId:null}],logs:[]})});
 await p.goto('http://127.0.0.1:4174/scanner/live.html');await p.waitForFunction(()=>!document.querySelector('#start').disabled);await p.locator('#tabDraft').click();
 await p.waitForFunction(()=>{const tiles=[...document.querySelectorAll('.draftTile')];return tiles.length===2&&tiles.every(t=>t.querySelector('img').complete&&t.querySelector('img').naturalWidth>100)&&tiles.some(t=>t.innerText.includes('スフィンクスの接近'))&&tiles.some(t=>t.innerText.includes('新緑のクラーケン'))});
 await p.waitForFunction(()=>[...document.querySelectorAll('.draftTile small')].every(e=>e.innerText.includes('日本語画像')&&!e.innerText.includes('未取得')));
 const baseline=require('../scanner/data/japanese-images.json');const expected=['fra:41','fra:118'].map(k=>baseline[k].images.normal).sort();assert.deepEqual((await p.locator('.draftTile img').evaluateAll(imgs=>imgs.map(i=>i.src))).sort(),expected);

 const saved=await p.evaluate(async()=>{await(await import('./integrated-store.mjs')).integratedStore.flush();return (await(await import('./integrated-store.mjs')).integratedStore.read()).events});assert.equal(saved.length,2);assert.ok(saved.every(r=>r.printId&&r.printingEstimated&&!r.confirmed));
 await p.screenshot({path:process.env.SCREENSHOT_PATH||'scanner-japanese-display.png'});await p.reload();await p.waitForFunction(()=>!document.querySelector('#start').disabled);assert.equal(await p.locator('#scanCount').innerText(),'2');
 console.log(JSON.stringify({passed:true,realPhone:false,existingNamesMigrated:true,realJapaneseImages:true,estimatedPrinting:true,countPreserved:2}));
}finally{await b.close()}})().catch(e=>{console.error(e);process.exitCode=1});
