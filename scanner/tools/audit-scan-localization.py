"""Data-level audit. Does not claim visual/camera verification of every card."""
import argparse,json,re
from pathlib import Path
parser=argparse.ArgumentParser();parser.add_argument('snapshot',type=Path);parser.add_argument('output',type=Path);args=parser.parse_args()
data=Path(__file__).resolve().parents[1]/'data'
ids={r['oracleId']:r for r in json.loads((data/'identities.json').read_text(encoding='utf-8'))}
display=json.loads((data/'print-display.json').read_text(encoding='utf-8'))
prints={r['id']:r for r in json.loads((data/'prints.json').read_text(encoding='utf-8'))}
japanese_ids=set();recent_japanese=set()
for p in (args.snapshot/'scryfall').glob('*.json'):
 for r in json.loads(p.read_text(encoding='utf-8'))['data']:
  oid=r.get('oracle_id');japanese_ids.add(oid)
  if '2025-01-01'<=r.get('released_at','')<='2026-10-26':recent_japanese.add(oid)
recent={r['oracleId'] for r in prints.values() if '2025-01-01'<=display.get('releaseDates',{}).get(r['set'],'')<='2026-10-26'}
images={};available=set()
for p in (data/'japanese-image-sets').glob('set-*.json'):
 for r in json.loads(p.read_text(encoding='utf-8')).values():
  if r.get('images',{}).get('normal'):images[(r['set'],str(r['number']).lower())]=r;available.add(r['oracleId'])
defaults={}
for r in json.loads((data/'cards.json').read_text(encoding='utf-8')):defaults.setdefault(r['oracleId'],prints.get(r['id'][:36]))
missing_names=[];missing_references=[];invalid_references=[]
for oid,c in ids.items():
 if oid in japanese_ids and not any(re.search('[ぁ-んァ-ン一-龯]',n) for n in c.get('aliases',[])):missing_names.append({'oracleId':oid,'name':c['name'],'recent':oid in recent_japanese})
 if oid not in available:continue
 p=defaults.get(oid);native=images.get((p['set'],str(p['number']).lower())) if p else None
 ref=display.get('japaneseReferences',{}).get(oid)
 if ref:
  r=images.get((ref['set'],str(ref['number']).lower()))
  if not r or r['oracleId']!=oid or r['images']['normal']!=ref['image']:invalid_references.append(oid)
 if not (native and native['oracleId']==oid) and not ref:missing_references.append({'oracleId':oid,'name':c['name'],'recent':oid in recent_japanese})
report={'scope':'All scanner identities; recent = Japanese paper printing dated 2025-01-01 to 2026-10-26. Local metadata audit, not per-card camera/image-language validation.',
 'scannerIdentities':len(ids),'recentJapaneseIdentities':len(recent_japanese&ids.keys()),
 'missingJapaneseNames':missing_names,'recentMissingJapaneseNames':[r for r in missing_names if r['recent']],
 'missingJapaneseReferenceDespiteAvailableData':missing_references,'invalidReferenceIdentities':invalid_references,
 'recentWithoutJapanesePaperSnapshot': [{'oracleId':oid,'name':ids[oid]['name']} for oid in sorted((recent-japanese_ids)&ids.keys())],
 'limitations':['Absence from Japanese paper snapshot does not establish absence of a Japanese physical printing.','Japanese metadata and URL coverage do not establish correct text/physical borders in every image.','Previously documented old-card border issues remain separate and unresolved.']}
args.output.write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps({k:(len(v) if isinstance(v,list) else v) for k,v in report.items() if k not in ['scope','limitations']},ensure_ascii=False))
