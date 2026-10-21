import json, urllib.request, time, pathlib, io, hashlib
import numpy as np
import onnxruntime as ort
from PIL import Image, ImageEnhance

import argparse
p=argparse.ArgumentParser(description='Build FRA scanner supplement; requires numpy, Pillow, onnxruntime >= 1.20')
p.add_argument('--work-dir',required=True)
root=pathlib.Path(p.parse_args().work_dir); root.mkdir(parents=True,exist_ok=True)
def fetch(url):
    for attempt in range(3):
        try:
            with urllib.request.urlopen(urllib.request.Request(url,headers={'User-Agent':'MTG-Pocket-Catalog/1.0','Accept':'application/json,image/*,*/*'}),timeout=45) as r:return r.read()
        except Exception:
            if attempt==2:raise
            time.sleep(2)
def cached(name,url):
    p=root/name
    if not p.exists():p.write_bytes(fetch(url))
    return p
base='https://hanclinto.github.io/CollectorVision/assets/'
model=cached('milo.onnx',base+'models/milo.onnx')
assert hashlib.sha256(model.read_bytes()).hexdigest()=='bd13d8d60383c69da04dce261f32e93fdaeaa8fd618fbc991e7385f71b3d45df'
cards=[]; url='https://api.scryfall.com/cards/search?q=set%3Afra&unique=prints'
while url:
    page=json.loads(fetch(url)); cards.extend(page['data']); url=page.get('next_page'); time.sleep(.12)
(root/'cards.json').write_text(json.dumps(cards),encoding='utf-8')
old=json.loads(cached('old-ids.json',base+'catalog/scryfall-mtg-card-ids.json').read_text())
print('FRA prints',len(cards),'existing IDs',sum(c['id'] in old for c in cards),flush=True)
opts=ort.SessionOptions();opts.intra_op_num_threads=2
session=ort.InferenceSession(str(model),sess_options=opts,providers=['CPUExecutionProvider'])
def embed(im):
    a=np.asarray(im.convert('RGB').resize((448,448),Image.Resampling.BILINEAR),dtype=np.float32)/255
    a=(a-np.array([.485,.456,.406],np.float32))/np.array([.229,.224,.225],np.float32)
    v=session.run(None,{session.get_inputs()[0].name:a.transpose(2,0,1)[None]})[0].reshape(-1)
    return v/np.linalg.norm(v)
vectors=[]; ids=[]; oracles=[]; checks=[]
for i,c in enumerate(cards):
    uri=c.get('image_uris',{}).get('normal') or c.get('card_faces',[{}])[0].get('image_uris',{}).get('normal')
    if not uri:raise RuntimeError('Missing image '+c['id'])
    p=cached(c['id']+'.jpg',uri)
    im=Image.open(p); vectors.append(embed(im)); ids.append(c['id']); oracles.append(c['oracle_id'])
    if i%40==0:
        checks.append((i,embed(ImageEnhance.Brightness(im).enhance(.8))))
        print('processed',i+1,flush=True)
    time.sleep(.11)
matrix=np.asarray(vectors,dtype='<f2'); matrix.tofile(root/'fra.f16.bin')
(root/'fra-ids.json').write_text(json.dumps(ids,separators=(',',':')),encoding='utf-8')
(root/'fra-oracles.json').write_text(json.dumps(oracles,separators=(',',':')),encoding='utf-8')
baseline=np.fromfile(cached('old.f16.bin',base+'catalog/scryfall-mtg-embeddings.f16.bin'),dtype='<f2').reshape(-1,128).astype('float32')
results=[]
for i,v in checks:
    scores=matrix.astype('float32')@v; best=int(scores.argmax()); oldscore=float((baseline@v).max())
    results.append({'id':ids[i],'best':ids[best],'score':float(scores[best]),'oldBestScore':oldscore,'sameOracle':oracles[i]==oracles[best]})
assert all(r['sameOracle'] and r['score']>=r['oldBestScore']-.005 for r in results),results
(root/'validation.json').write_text(json.dumps(results,indent=2),encoding='utf-8')
print('PASS',len(results),'brightness-modified reference checks against full old catalog',flush=True)
