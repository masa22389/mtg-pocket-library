"""Supplement scan names and unselected reference images from exact Japanese data.

References never select an owned printing. Confirmed printing images remain exact.
"""
import argparse,json,re
from pathlib import Path
parser=argparse.ArgumentParser();parser.add_argument('snapshot',type=Path);args=parser.parse_args()
data=Path(__file__).resolve().parents[1]/'data'
names={}
for p in sorted((args.snapshot/'scryfall').glob('*.json')):
 for c in json.loads(p.read_text(encoding='utf-8'))['data']:
  name=c.get('printed_name','')
  if not re.search('[ぁ-んァ-ン一-龯]',name):
   face_names=[f.get('printed_name','') for f in c.get('card_faces',[])]
   if face_names and re.search('[ぁ-んァ-ン一-龯]',face_names[0]):name=' // '.join(n for n in face_names if re.search('[ぁ-んァ-ン一-龯]',n))
  if c.get('lang')=='ja' and re.search('[ぁ-んァ-ン一-龯]',name):names.setdefault(c.get('oracle_id'),name)
# Existing maintained dictionaries supply names omitted by localized card metadata.
for filename in ['mtg-jp-card-index.js','mtgjson-jp-search-index.js']:
 text=(data.parents[1]/filename).read_text(encoding='utf-8')
 for c in json.loads(text[text.index('['):text.rfind(']')+1]):
  for name in c.get('jaNames',[]):
   if c.get('oracleId') and re.search('[ぁ-んァ-ン一-龯]',name):names.setdefault(c['oracleId'],name)
identities=json.loads((data/'identities.json').read_text(encoding='utf-8'));added=0
for c in identities:
 if not any(re.search('[ぁ-んァ-ン一-龯]',n) for n in c.get('aliases',[])) and c['oracleId'] in names:
  c.setdefault('aliases',[]).append(names[c['oracleId']]);added+=1
(data/'identities.json').write_text(json.dumps(identities,ensure_ascii=False,separators=(',',':')),encoding='utf-8')
images={};by_oracle={}
for p in sorted((data/'japanese-image-sets').glob('set-*.json')):
 for r in json.loads(p.read_text(encoding='utf-8')).values():
  if r.get('language','ja')!='ja' or not r.get('images',{}).get('normal'):continue
  images[(r['set'],str(r['number']).lower())]=r
  by_oracle.setdefault(r['oracleId'],[]).append(r)
prints={p['id']:p for p in json.loads((data/'prints.json').read_text(encoding='utf-8'))}
display=json.loads((data/'print-display.json').read_text(encoding='utf-8'));refs={};seen=set()
for c in json.loads((data/'cards.json').read_text(encoding='utf-8')):
 oid=c['oracleId']
 if oid in seen:continue
 seen.add(oid);p=prints.get(c['id'][:36]);known=images.get((p['set'],str(p['number']).lower())) if p else None
 if known and known['oracleId']==oid:continue
 options=by_oracle.get(oid,[])
 if not options:continue
 # Prefer a normal-numbered recent printing, not an arbitrary special treatment.
 r=sorted(options,key=lambda r:(bool(re.fullmatch(r'\d+',str(r['number']))),display.get('releaseDates',{}).get(r['set'],''),-int(r['number']) if str(r['number']).isdigit() else 0),reverse=True)[0]
 refs[oid]={'set':r['set'],'number':r['number'],'image':r['images']['normal']}
display['japanesePrintings']={}
for r in images.values():display['japanesePrintings'].setdefault(r['set'],[]).append(str(r['number']).lower())
display['japaneseReferences']=refs
(data/'print-display.json').write_text(json.dumps(display,ensure_ascii=False,separators=(',',':')),encoding='utf-8')
print(json.dumps({'japaneseNamesAdded':added,'unselectedJapaneseReferences':len(refs)}))
