const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const code=fs.readFileSync(path.join(__dirname,'../app.js'),'utf8');
const take=(from,to)=>code.slice(code.indexOf(from),code.indexOf(to,code.indexOf(from)));
const fn=[
  take('// Wisdom Guild files some printings','function wisdomGuildConditionForCard('),
  take('function wisdomGuildSharedPriceParams(','function wisdomGuildPriceUrl('),
].join('\n');
const c={URLSearchParams,wisdomGuildLanguageForCard:()=>'JPN'};
vm.createContext(c);vm.runInContext(fn,c);
// Japanese black-border Chronicles and Fourth Edition are searched under Wisdom Guild's codes; other sets as they are.
assert.equal(c.wisdomGuildSetForCard({set:'bchr'}),'CHR');
assert.equal(c.wisdomGuildSetForCard({set:'4bb'}),'4ED');
assert.equal(c.wisdomGuildSetForCard({set:'chk'}),'CHK');
assert.equal(c.wisdomGuildSharedPriceParams({set:'bchr'}).getAll('set[]').join(),'CHR');
// A "no listing" saved under the old code is tried again; one saved under the new code, or for an unmapped set, is not.
assert.equal(c.wisdomGuildNoListingOutdated({set:'bchr'},{noListing:true}),true);
assert.equal(c.wisdomGuildNoListingOutdated({set:'bchr'},{noListing:true,wgSet:'CHR'}),false);
assert.equal(c.wisdomGuildNoListingOutdated({set:'sch'},{noListing:true}),false);
assert.equal(c.wisdomGuildNoListingOutdated({set:'bchr'},{valueJpy:300}),false);
console.log('PASS: BCHR and 4BB searched as CHR and 4ED on Wisdom Guild, old no-listing records retried once.');
