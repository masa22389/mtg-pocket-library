"""Collect public catalogue candidates, never publish unreviewed pictures.

Resumable, sequential requests. Exact Japanese title + set + unique card name
are mandatory; language metadata alone is not evidence of picture language.
"""
import argparse, html, json, re, time, urllib.request
from pathlib import Path
from japanese_image_index import name_key

parser=argparse.ArgumentParser()
parser.add_argument('snapshot',type=Path)
parser.add_argument('sets',nargs='+')
args=parser.parse_args()
dest=args.snapshot/'blackfrog';dest.mkdir(exist_ok=True)
cards=[c for p in (args.snapshot/'scryfall').glob('*.json') for c in json.loads(p.read_text(encoding='utf-8'))['data']]
lookup={}
for c in cards:lookup.setdefault((c['set'],name_key(c['name'])),[]).append(c)
records=[]
for code in args.sets:
 if not re.fullmatch('[a-z0-9]+',code):raise ValueError('set')
 page=1
 while True:
  url=f'https://blackfrog.jp/shopbrand/{code}/page{page}/recommend/'
  path=dest/f'{code}-{page}.html'
  if not path.exists():
   time.sleep(.4)
   with urllib.request.urlopen(url,timeout=30) as r:path.write_bytes(r.read())
  text=path.read_text(encoding='euc_jp',errors='replace')
  for block in text.split('<div class="innerBox">')[1:]:
   block=block.split('</li>',1)[0]
   a=re.search(r'<a href="(/shopdetail/(\d+)/[^"]*)">\s*<img ([^>]+)>',block)
   if not a:continue
   attrs=dict(re.findall(r'(\w+)="([^"]*)"',a[3]))
   title=html.unescape(attrs.get('alt',''))
   # Damaged singles, foil, alternate versions and promo cards are excluded.
   m=re.fullmatch(r'【日】([^/]+)/(.+)\[[^\]]+\]【([A-Z0-9]+)】',title)
   if not m or m[3].lower()!=code:continue
   choices=lookup.get((code,name_key(m[2])),[])
   if len(choices)!=1:continue
   c=choices[0]
   image=html.unescape(attrs.get('src',''))
   if not image.startswith('https://makeshop-multi-images.akamaized.net/blackfrog/itemimages/'):continue
   records.append({'set':code,'number':c['collector_number'],'oracleId':c.get('oracle_id',''),'name':c['name'],'printedName':m[1],'url':image,'sourcePage':'https://blackfrog.jp'+a[1],'product':a[2],'validation':'candidate-only-unique-name-within-set; image-language-and-framing-unreviewed'})
  pages=[int(n) for n in re.findall(r'/shopbrand/'+code+r'/page(\d+)/recommend/',text)]
  if not pages or page>=max(pages):break
  page+=1
 unique={(r['set'],r['number']):r for r in records}
 (dest/'candidates.json').write_text(json.dumps(list(unique.values()),ensure_ascii=False,indent=2),encoding='utf-8')
 print(code,page,len(unique),flush=True)
