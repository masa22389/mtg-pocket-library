from pathlib import Path
import json,hashlib
r=Path(__file__).resolve().parents[1];assets=[]
required=['print-display.json','phash.bin','phash-meta.json','cards.json','identities.json','prints.json','full-features.f16.bin','milo-cards.json','milo-source.json']
for name in required:
 if not (r/'data'/name).is_file():raise RuntimeError('Missing '+name)
meta=json.loads((r/'data/phash-meta.json').read_text(encoding='utf-8'));cards=json.loads((r/'data/cards.json').read_text(encoding='utf-8'));assert len(cards)==meta['rows'];assert (r/'data/phash.bin').stat().st_size==len(cards)*32
for p in sorted(r.rglob('*')):
 if not p.is_file():continue
 rel=p.relative_to(r)
 if (rel.parts[0]=='vendor' and rel.parts[1]=='ort') or rel.parts[0]=='models' or (rel.parts[0]=='data' and p.name in required) or (len(rel.parts)==1 and p.suffix in ['.mjs','.css','.html','.js'] and p.name not in ['build.html','index.html','scan.html','benchmark.mjs','benchmark-core.mjs','scan.mjs','scan.css']):
  b=p.read_bytes();assets.append({'path':rel.as_posix(),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()})
pack={'ready':True,'version':'full-0.1','rows':len(cards),'identityCount':38091,'printCount':109991,'sourceDate':'2026-10-23','scope':'Scryfall default/unique_artwork snapshots 2026-10-23; paper cards and available faces/artwork. Language-independent identity matching, English-first printing metadata; not a claim of perfect recognition.','assets':assets,'totalBytes':sum(a['bytes'] for a in assets),'buildId':hashlib.sha256(json.dumps(assets,sort_keys=True).encode()).hexdigest()[:12]}
(r/'pack.json').write_text(json.dumps(pack,ensure_ascii=False,indent=2),encoding='utf-8');print(pack['buildId'],pack['rows'],pack['totalBytes'])
