from pathlib import Path
import urllib.request,urllib.parse,json,gzip,time,re
import argparse
parser=argparse.ArgumentParser(description='Collect public Japanese picture metadata into a resumable snapshot directory.')
parser.add_argument('snapshot',type=Path)
args=parser.parse_args()
root=args.snapshot;root.mkdir(parents=True,exist_ok=True)
def get(url):
 for attempt in range(4):
  try:
   req=urllib.request.Request(url,headers={'User-Agent':'MTGPocket-ImageIndex/1.0 (public card image metadata audit)','Accept':'application/json','Accept-Encoding':'gzip'})
   with urllib.request.urlopen(req,timeout=40) as r:
    data=r.read()
    if r.headers.get('Content-Encoding')=='gzip':data=gzip.decompress(data)
   return json.loads(data)
  except Exception:
   if attempt==3:raise
   time.sleep(2*(attempt+1))
def scryfall():
 folder=root/'scryfall';folder.mkdir(exist_ok=True);page=1;url='https://api.scryfall.com/cards/search?'+urllib.parse.urlencode({'q':'lang:ja game:paper','unique':'prints','include_extras':'true','order':'set'})
 while url:
  p=folder/f'{page:04}.json'
  if p.exists():c=json.loads(p.read_text(encoding='utf-8'))
  else:
   c=get(url)
   if c.get('warnings'):raise Exception(c['warnings'])
   c={k:c[k] for k in ['total_cards','has_more','next_page','data'] if k in c}
   keep=['id','oracle_id','name','printed_name','lang','set','collector_number','border_color','image_status','image_uris','illustration_id','card_faces','finishes','released_at','layout']
   c['data']=[{k:x[k] for k in keep if k in x} for x in c['data']]
   p.write_text(json.dumps(c,ensure_ascii=False,separators=(',',':')),encoding='utf-8');time.sleep(.15)
  if page%20==1:print('Scryfall page',page,'total',c['total_cards'],flush=True)
  url=c.get('next_page') if c.get('has_more') else None;page+=1
 print('Scryfall COMPLETE',page-1,flush=True)
def serra():
 folder=root/'serra';folder.mkdir(exist_ok=True);page=1
 while page<=100:
  p=folder/f'{page:04}.json'
  if p.exists():rows=json.loads(p.read_text(encoding='utf-8'))
  else:
   c=get('https://cardshop-serra.com/products.json?limit=250&page='+str(page));rows=[]
   for x in c['products']:
    rows.append({'id':x['id'],'title':x['title'],'handle':x['handle'],'skus':[v.get('sku','') for v in x.get('variants',[])],'images':[i.get('src','') for i in x.get('images',[])],'updatedAt':x.get('updated_at')})
   p.write_text(json.dumps(rows,ensure_ascii=False,separators=(',',':')),encoding='utf-8');time.sleep(.7)
  if page%20==1:print('Serra page',page,'rows',len(rows),flush=True)
  if len(rows)<250:break
  page+=1
 print('Serra COMPLETE',page,flush=True)
scryfall()
serra()
source='https://cardshop-serra.com/products/mmq-162-j_nm_qkhi'
request=urllib.request.Request(source,headers={'User-Agent':'MTGPocket-ImageIndex/1.0'})
html=urllib.request.urlopen(request,timeout=30).read().decode('utf-8')
mapping={}
for match in re.finditer(r'<input[^>]*name="filter\.p\.m\.custom\.mtg_expantion_ids"[^>]*value="(\d+)"[\s\S]*?<span class="form-tag__label">([^<]*)',html):
 code=re.search(r'【([A-Z0-9]+)】',match[2])
 if code:mapping.setdefault(code[1].lower(),[]).append(match[1])
(root/'serra-collections.json').write_text(json.dumps(mapping),encoding='utf-8')
folder=root/'serra-sets';folder.mkdir(exist_ok=True)
cards=[c for p in sorted((root/'scryfall').glob('*.json')) for c in json.loads(p.read_text(encoding='utf-8'))['data']]
missing={c['set'] for c in cards if c.get('image_status') in ['placeholder','missing']}
aliases={'4bb':'4ed','bchr':'chr','cst':'csp'}
groups={(aliases.get(code,code),i) for code in missing for i in mapping.get(aliases.get(code,code),[])}
completion={}
for code,identifier in sorted(groups):
 page=1;total=0
 while True:
  path=folder/f'{code}-{identifier}-{page:03}.json'
  if path.exists():rows=json.loads(path.read_text(encoding='utf-8'))
  else:
   data=get(f'https://cardshop-serra.com/collections/sidebar-exp-{identifier}/products.json?limit=250&page={page}')
   rows=[{'id':x['id'],'title':x['title'],'handle':x['handle'],'skus':[v.get('sku','') for v in x.get('variants',[])],'images':[i.get('src','') for i in x.get('images',[])],'updatedAt':x.get('updated_at')} for x in data['products']]
   path.write_text(json.dumps(rows,ensure_ascii=False,separators=(',',':')),encoding='utf-8');time.sleep(.7)
  total+=len(rows)
  if len(rows)<250:break
  page+=1
 completion[code+':'+identifier]={'products':total,'pages':page}
 (root/'serra-set-completion.json').write_text(json.dumps(completion),encoding='utf-8')
 print('Set complete',code,total,flush=True)
extra=get('https://www.hareruyamtg.com/ja/products/search/unisearch_api?rows=100&kw=CSPTHEME&fq.language=1')
assert len(extra['response']['docs'])==extra['response']['numFound'],'Supplemental source pagination changed'
(root/'hareruya-theme-search-8.json').write_text(json.dumps(extra,ensure_ascii=False),encoding='utf-8')
print('Metadata collection complete',flush=True)
