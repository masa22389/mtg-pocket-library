const {chromium}=require(process.argv[2]||'playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const version=fs.readFileSync(path.join(__dirname,'../app.js'),'utf8').match(/const APP_VERSION = "([^"]+)"/)[1];
(async()=>{const b=await chromium.launch({headless:true,...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{})});try{
 const c=await b.newContext({viewport:{width:390,height:844}}),p=await c.newPage();
 await p.goto('http://127.0.0.1:4174/styles.css');await p.evaluate(async version=>{await navigator.serviceWorker.register('./sw.js?v='+version);await navigator.serviceWorker.ready},version);
 await p.goto('http://127.0.0.1:4174/?v='+version.slice(1));
 const tabs=p.locator('.bottom-nav button');assert.equal(await tabs.count(),6);assert.equal(await tabs.nth(1).innerText(),'▣\nスキャン');
 await p.locator('[data-action=open-scanner]').click();await p.waitForFunction(()=>window.mtgScannerHost?.visible,{timeout:60000});
 const frame=await p.locator('#scannerHostFrame').elementHandle();
 assert.equal(await p.locator('.bottom-nav .active').getAttribute('data-action'),'open-scanner');
 for(const width of [320,390,1280]){await p.setViewportSize({width,height:844});const bounds=await p.evaluate(()=>{const nav=document.querySelector('.bottom-nav'),shell=document.querySelector('#scannerHostShell');return {nav:nav.getBoundingClientRect().toJSON(),shell:shell.getBoundingClientRect().toJSON(),overflow:document.documentElement.scrollWidth>innerWidth}});assert.ok(bounds.shell.bottom<=bounds.nav.top+1);assert.equal(bounds.overflow,false);}
 await p.setViewportSize({width:390,height:844});await p.screenshot({path:process.env.SCREENSHOT_PATH||'scanner-tab.png'});
 await p.locator('.bottom-nav [data-view=collection]').click();assert.equal(await p.evaluate(()=>window.mtgScannerHost.visible),false);assert.ok(await p.locator('#collectionView').evaluate(e=>e.classList.contains('active')));
 await p.locator('[data-action=open-scanner]').click();assert.equal(await p.evaluate(()=>window.mtgScannerHost.visible),true);assert.ok(await frame.evaluate(e=>e===document.querySelector('#scannerHostFrame')));
 await p.locator('#scannerHostFrame').contentFrame().locator('body').evaluate(()=>parent.postMessage({type:'mtg-scanner-close'},location.origin));await p.waitForFunction(()=>!window.mtgScannerHost.visible);assert.equal(await p.locator('.bottom-nav .active').getAttribute('data-view'),'collection');
 console.log(JSON.stringify({passed:true,realPhone:false,sixTabs:true,scannerNavigation:true,frameReused:true,returnRestored:true,widths:[320,390,1280]}));
}finally{await b.close()}})().catch(e=>{console.error(e);process.exitCode=1});
