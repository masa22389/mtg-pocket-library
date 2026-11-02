(async()=>{
const assert=require('node:assert/strict'),path=require('node:path'),{pathToFileURL}=require('node:url');
const {updateAssetHashes}=await import(pathToFileURL(path.join(__dirname,'../scripts/update-asset-hashes.mjs')).href);
const {problems}=await updateAssetHashes({check:true});
assert.deepEqual(problems,[],'Run node scripts/update-asset-hashes.mjs after changing the search indexes');
console.log('PASS: index.html and sw.js reference the search indexes by their current content hash.');
})().catch(error=>{console.error(error);process.exitCode=1;});
