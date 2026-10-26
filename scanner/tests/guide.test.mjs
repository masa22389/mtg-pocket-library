import test from 'node:test';import assert from 'node:assert/strict';import {guideGeometry,presenceGray,cardWithinGuide,sceneSignature,sceneDifference,guideSceneUnchanged} from '../guide.mjs';
test('guide maps contain letterboxing to the same source card rectangle',()=>{const g=guideGeometry(720,960,354,304);assert.ok(g.sx>=0&&g.sy>=0);assert.ok(g.sx+g.sw<=720&&g.sy+g.sh<=960);assert.ok(Math.abs(g.sw/g.sh-63/88)<1e-10);const s=Math.min(354/720,304/960);assert.ok(Math.abs(g.width-g.sw*s)<1e-10);assert.throws(()=>guideGeometry(0,960,354,304));});
test('flat empty frame is not treated as a card',()=>{const r=presenceGray(new Float64Array(84*116).fill(52));assert.equal(r.present,false);assert.equal(r.edges,0);});
test('synthetic textured card with visible boundaries passes the heuristic',()=>{const a=new Float64Array(84*116).fill(55);for(let y=8;y<108;y++)for(let x=6;x<78;x++)a[y*84+x]=(x<9||x>74||y<11||y>104)?10:((x+y)%2?120:210);assert.equal(presenceGray(a).present,true);});

test('all four corners must fit inside actual guide',()=>{assert.equal(cardWithinGuide([[.1,.1],[.9,.1],[.9,.9],[.1,.9]]).accepted,true);for(const q of [[[.05,.1],[.85,.1],[.85,.9],[.05,.9]],[[.1,.1],[.9,.1],[.9,.96],[.1,.9]],[[0,0],[1,0],[1,1],[0,1]]])assert.equal(cardWithinGuide(q).accepted,false);});
test('invalid corners fail closed',()=>{for(const q of [null,[],[[NaN,0],[1,0],[1,1],[0,1]]])assert.equal(cardWithinGuide(q).accepted,false);});

test('scene change ignores brightness and distinguishes a changed pattern',()=>{const a=Float64Array.from({length:84*116},(_,i)=>(i*17)%180),b=Float64Array.from(a,v=>v+25),c=Float64Array.from({length:a.length},(_,i)=>(i*39)%180);assert.ok(sceneDifference(sceneSignature(a),sceneSignature(b))<.001);assert.ok(sceneDifference(sceneSignature(a),sceneSignature(c))>.65);});

test('small corner jitter is tolerated but a clearly outside card is rejected',()=>{
 for(const q of [[[.09,.1],[.9,.1],[.9,.9],[.09,.9]],[[.1,.1],[.91,.1],[.91,.9],[.1,.9]],[[.1,.09],[.9,.09],[.9,.9],[.1,.9]],[[.1,.1],[.9,.1],[.9,.91],[.1,.91]]])assert.equal(cardWithinGuide(q).accepted,true);
 for(const q of [[[.07,.1],[.9,.1],[.9,.9],[.07,.9]],[[.1,.1],[.93,.1],[.93,.9],[.1,.9]]])assert.equal(cardWithinGuide(q).accepted,false);
});
 test('moderate change is tolerated while a large change still holds publication',()=>{const a=Array(96).fill(0);assert.equal(guideSceneUnchanged(a,Array(96).fill(.4)).accepted,true);assert.equal(guideSceneUnchanged(a,Array(96).fill(.6)).accepted,false);});
test('changed or missing current frame cannot publish a guided scan',()=>{
 const a=Array(96).fill(0),b=Array(96).fill(1);
 assert.equal(guideSceneUnchanged(a,a).accepted,true);
 assert.equal(guideSceneUnchanged(a,b).accepted,false);
 for(const invalid of [undefined,[],[NaN]])assert.equal(guideSceneUnchanged(a,invalid).accepted,false);
});
