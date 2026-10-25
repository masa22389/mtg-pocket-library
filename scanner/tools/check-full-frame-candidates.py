import json,time,urllib.request,hashlib
from pathlib import Path
import cv2,numpy as np
from PIL import Image,ImageDraw
import argparse
parser=argparse.ArgumentParser(description='Report-only full-frame candidate comparison; manual image-language review is required.')
parser.add_argument('snapshot',type=Path)
args=parser.parse_args()
base=args.snapshot/'blackfrog'
images=base/'images';images.mkdir(exist_ok=True)
root=Path(__file__).resolve().parents[1]/'data/japanese-image-sets'
def load(url):
 p=images/(hashlib.sha256(url.encode()).hexdigest()+'.img')
 if not p.exists():
  time.sleep(.2)
  with urllib.request.urlopen(url,timeout=20) as r:p.write_bytes(r.read())
 img=cv2.imdecode(np.frombuffer(p.read_bytes(),np.uint8),cv2.IMREAD_COLOR)
 if img is None:raise ValueError('invalid image')
 return img,str(p)
def analyse(row):
 current=json.loads((root/f"set-{row['set']}.json").read_text(encoding='utf-8')).get(str(row['number']))
 if not current or current['source'].startswith('scryfall'):return None
 try:
  new,path=load(row['url']);old,oldpath=load(current['images']['normal'])
  new=cv2.resize(new,(250,350));best=(-1,None)
  for width in range(210,251,2):
   height=round(old.shape[0]/old.shape[1]*width)
   if height>350:continue
   temp=cv2.resize(old,(width,height))
   score=cv2.matchTemplate(new,temp,cv2.TM_CCOEFF_NORMED)
   _,v,_,pos=cv2.minMaxLoc(score)
   if v>best[0]:best=(v,(pos,width,height,temp))
  score,(pos,w,h,temp)=best;x,y=pos;crop=new[y:y+h,x:x+w]
  def similarity(a,b):return float(cv2.matchTemplate(a,b,cv2.TM_CCOEFF_NORMED)[0,0])
  title=similarity(crop[:int(h*.13),:int(w*.78)],temp[:int(h*.13),:int(w*.78)])
  body=similarity(crop[int(h*.61):int(h*.96)],temp[int(h*.61):int(h*.96)])
  # Black physical border must exist on all four edges, excluding corners.
  edge=[new[10:340,:7],new[10:340,-7:],new[:7,10:240],new[-7:,10:240]]
  black=min(float((np.max(e,axis=2)<70).mean()) for e in edge)
  result={**row,'imagePath':path,'previousPath':oldpath,'previousUrl':current['images']['normal'],'similarity':round(score,4),'titleSimilarity':round(title,4),'bodySimilarity':round(body,4),'blackEdgeMin':round(black,4),'autoCandidate':score>.8 and title>.7 and body>.7 and black>.65}
  return result
 except Exception as e:return {**row,'error':str(e)}

from concurrent.futures import ThreadPoolExecutor
rows=[r for r in json.loads((base/'candidates.json').read_text(encoding='utf-8')) ]
results=[]
with ThreadPoolExecutor(max_workers=3) as pool:
 for r in pool.map(analyse,rows):
  if r:
   results.append(r)
   (base/'frame-check.tmp').write_text(json.dumps(results,ensure_ascii=False,indent=2),encoding='utf-8')
   (base/'frame-check.tmp').replace(base/'frame-check.json')
   print(r['set'],r['number'],r.get('autoCandidate',False),flush=True)
accepted=[r for r in results if r.get('autoCandidate')]
for page in range((len(accepted)+39)//40):
 rows=accepted[page*40:(page+1)*40];sheet=Image.new('RGB',(1000,((len(rows)+7)//8)*205),'white');draw=ImageDraw.Draw(sheet)
 for i,r in enumerate(rows):
  img=Image.open(r['imagePath']).convert('RGB');img.thumbnail((120,176));x=(i%8)*125;y=(i//8)*205;sheet.paste(img,(x,y));draw.text((x,y+177),r['set']+' #'+r['number'],fill='black')
 sheet.save(base/f'review-{page}.jpg')
print('accepted',len(accepted),'total',len(results))
