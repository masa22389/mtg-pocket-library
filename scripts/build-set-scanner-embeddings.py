"""Milo embeddings for scanner prints missing from scanner/data (used for the Star Trek supplement in v403).

Input: a JSON list of {id, image} (Scryfall print id and its normal image URL), e.g. from
scripts/merge-set-scanner-supplement.mjs --list. Output in --work-dir: embeddings.f16.bin (rows of 128 float16,
L2-normalised) and embeddings-ids.json in the same order. Before embedding, it re-embeds --check prints already in
scanner/data and stops unless they reproduce the stored vectors (cosine >= 0.995), so the new rows match the old.
Requires numpy, Pillow and onnxruntime. Same preprocessing as scripts/build-fra-scanner-catalog.py (v299).
"""
import argparse, hashlib, json, pathlib, time, urllib.request
import numpy as np
import onnxruntime as ort
from PIL import Image

repo = pathlib.Path(__file__).resolve().parents[1]
p = argparse.ArgumentParser()
p.add_argument('--input', required=True)
p.add_argument('--work-dir', required=True)
p.add_argument('--check', default='', help='comma-separated print ids already in scanner/data/milo-cards.json')
a = p.parse_args()
work = pathlib.Path(a.work_dir); (work / 'images').mkdir(parents=True, exist_ok=True)
model = repo / 'scanner/models/milo.onnx'
assert hashlib.sha256(model.read_bytes()).hexdigest() == 'bd13d8d60383c69da04dce261f32e93fdaeaa8fd618fbc991e7385f71b3d45df'
opts = ort.SessionOptions(); opts.intra_op_num_threads = 4
session = ort.InferenceSession(str(model), sess_options=opts, providers=['CPUExecutionProvider'])

def fetch(url):
    for attempt in range(3):
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'MTG-Pocket-Catalog/1.0', 'Accept': 'image/*,*/*'})
            with urllib.request.urlopen(req, timeout=45) as r: return r.read()
        except Exception:
            if attempt == 2: raise
            time.sleep(2)

def image(card_id, url):
    path = work / 'images' / (card_id + '.jpg')
    if not path.exists(): path.write_bytes(fetch(url)); time.sleep(.11)
    return Image.open(path)

def embed(im):
    x = np.asarray(im.convert('RGB').resize((448, 448), Image.Resampling.BILINEAR), dtype=np.float32) / 255
    x = (x - np.array([.485, .456, .406], np.float32)) / np.array([.229, .224, .225], np.float32)
    v = session.run(None, {session.get_inputs()[0].name: x.transpose(2, 0, 1)[None]})[0].reshape(-1)
    return v / np.linalg.norm(v)

def normal_url(card_id):
    return f'https://cards.scryfall.io/normal/front/{card_id[0]}/{card_id[1]}/{card_id}.jpg'

if a.check:
    rows = json.loads((repo / 'scanner/data/milo-cards.json').read_text(encoding='utf-8'))
    index = {r['id']: i for i, r in enumerate(rows)}
    stored = np.memmap(repo / 'scanner/data/full-features.f16.bin', dtype='<f2', mode='r').reshape(-1, 128)
    scores = []
    for card_id in a.check.split(','):
        old = stored[index[card_id]].astype(np.float32)
        scores.append(float(embed(image(card_id, normal_url(card_id))) @ (old / np.linalg.norm(old))))
        print('check', card_id, round(scores[-1], 4), flush=True)
    # A single low score can be a Scryfall image replaced after the 2026-10-23 snapshot (preview scan -> final scan).
    assert sorted(scores)[len(scores) // 2] >= .995, 'stored vectors not reproduced; stop before adding rows'

items = json.loads(pathlib.Path(a.input).read_text(encoding='utf-8'))
vectors = []
for i, item in enumerate(items):
    vectors.append(embed(image(item['id'], item['image'])))
    if i % 50 == 0: print('embedded', i + 1, 'of', len(items), flush=True)
np.asarray(vectors, dtype='<f2').tofile(work / 'embeddings.f16.bin')
(work / 'embeddings-ids.json').write_text(json.dumps([x['id'] for x in items]), encoding='utf-8')
print('done', len(items), flush=True)
