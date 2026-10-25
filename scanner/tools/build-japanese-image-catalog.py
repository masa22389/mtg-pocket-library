"""Join a complete Japanese paper-card snapshot to a complete product snapshot.

Input is the compact, resumable output of collect-japanese-image-data.py.
This writes set-specific runtime buckets, not card pictures.
"""
from pathlib import Path
from collections import Counter, defaultdict
from urllib.parse import urlparse
import argparse
import hashlib
import json
from japanese_image_index import parse_product, native_images, join_product, number_key, product_text, card_names

parser = argparse.ArgumentParser()
parser.add_argument('snapshot', type=Path)
args = parser.parse_args()
scanner = Path(__file__).resolve().parents[1]

pages = [json.loads(p.read_text(encoding='utf-8')) for p in sorted((args.snapshot / 'scryfall').glob('*.json'))]
assert pages and not pages[-1]['has_more'], 'Scryfall snapshot incomplete'
cards = {c['id']: c for page in pages for c in page['data']}
assert len(cards) == pages[0]['total_cards'], 'Scryfall snapshot count mismatch'
shop_pages = [json.loads(p.read_text(encoding='utf-8')) for p in sorted((args.snapshot / 'serra').glob('*.json'))]
assert shop_pages, 'Product snapshot missing'
completion = json.loads((args.snapshot / 'serra-set-completion.json').read_text(encoding='utf-8'))
set_pages = [json.loads(p.read_text(encoding='utf-8')) for p in sorted((args.snapshot / 'serra-sets').glob('*.json'))]
shop_pages.extend(set_pages)
mapping=json.loads((args.snapshot/'serra-collections.json').read_text(encoding='utf-8'))
source_aliases={'4bb':'4ed','bchr':'chr','cst':'csp'}
missing_sets={c['set'] for c in cards.values() if c.get('image_status') in ['placeholder','missing']}
required={(source_aliases.get(code,code),i) for code in missing_sets for i in mapping.get(source_aliases.get(code,code),[])}
assert all(code+':'+identifier in completion for code,identifier in required),'Source collection snapshot incomplete'
products = {p['id']: p for page in shop_pages for p in page}
skipped = Counter()
candidates = defaultdict(list)
english_urls = set()


def picture_identity(url):
    u = urlparse(url)
    return u.path.split('/files/', 1)[-1] if '/files/' in u.path else u.netloc + u.path


for product in products.values():
    if product_text(product.get('title', '')).startswith('(英)'):
        english_urls.update(picture_identity(url) for url in product.get('images', []))
for product in products.values():
    parsed, reason = parse_product(product)
    if reason:
        skipped[reason] += 1
    else:
        candidates[(parsed['set'], parsed['number'])].append(parsed)
name_candidates=defaultdict(list)
for rows in candidates.values():
    for product in rows:name_candidates[(product['set'],product['english'])].append(product)
name_counts=Counter((card['set'],name) for card in cards.values() for name in card_names(card))
shared = {p['url'] for rows in candidates.values() for p in rows
          if picture_identity(p['url']) in english_urls}
extra_path=args.snapshot/'hareruya-theme-search-8.json'
extra_docs=json.loads(extra_path.read_text(encoding='utf-8'))['response']['docs'] if extra_path.exists() else []
overrides = json.loads((scanner / 'data/japanese-image-overrides.json').read_text(encoding='utf-8'))
official = json.loads((scanner / 'data/japanese-images.json').read_text(encoding='utf-8'))
buckets = defaultdict(dict)
stats = Counter()
by_set = defaultdict(Counter)
missing = []
native_status = Counter()
for card in cards.values():
    native_status[card.get('image_status', 'unknown')] += 1
    set_code, number = card['set'], number_key(card['collector_number'])
    key = set_code + ':' + str(card['collector_number'])
    images = native_images(card)
    record = None
    if images:
        record = {'set': set_code, 'number': str(card['collector_number']), 'language': 'ja',
                  'oracleId': card.get('oracle_id', ''), 'images': images,
                  'source': 'scryfall-ja-verified', 'imageStatus': card['image_status']}
        stats['scryfallAvailable'] += 1
    else:
        record = join_product(card, candidates[(set_code, number)], shared)
        if record:
            stats['supplementedFromCatalogue'] += 1
        else:
            # Some shops assign different virtual numbers, especially old sets.
            # Permit an explicit crosswalk only when BOTH catalogues have exactly
            # one printing for the full name in this set/language. Multiple arts,
            # basic-land variants and promotions cannot pass this rule.
            unique=[]
            for name in card_names(card):
                choices=name_candidates[(set_code,name)]
                if name_counts[(set_code,name)]==1 and len({p['number'] for p in choices})==1:
                    unique.extend(choices)
            if unique:
                original_numbers=sorted({p['number'] for p in unique})
                remapped=[{**p,'number':number} for p in unique]
                record=join_product(card,remapped,shared)
                if record:
                    record['validation']='unique-name-within-set-language-crosswalk'
                    record['sourceNumbers']=original_numbers
                    stats['supplementedFromUniquePrintCrosswalk']+=1
            exact = overrides.get(key) or official.get(key)
            if not record and exact and exact.get('source') != 'scryfall-ja' and exact.get('oracleId') == card.get('oracle_id'):
                record = exact
                stats['supplementedFromReviewedIndex'] += 1
    if not record and set_code=='cst':
        matches=[row for row in extra_docs if str(row.get('language'))=='1' and '[CSP Theme Deck]' in row.get('product_name_en','') and row.get('card_name','').casefold() in {name.casefold() for name in card_names(card)} and '/CSPTHEME/JP/' in row.get('image_url','')]
        names=card_names(card)
        if matches and any(name_counts[(set_code,name)]==1 for name in names):
            row=matches[0]
            record={'set':set_code,'number':str(card['collector_number']),'language':'ja','oracleId':card.get('oracle_id',''),'images':{'normal':row['image_url']},'source':'hareruya-catalog-exact','sourcePage':'https://www.hareruyamtg.com/ja/products/detail/'+row['product'],'validation':'unique-name-in-explicit-csp-theme-japanese-products'}
            stats['supplementedFromSecondCatalogue']+=1
    by_set[set_code]['total'] += 1
    if record:
        buckets[set_code][number] = record
        by_set[set_code]['available'] += 1
        stats['available'] += 1
    else:
        by_set[set_code]['unresolved'] += 1
        stats['unresolved'] += 1
        missing.append({'set': set_code, 'number': str(card['collector_number']),
                        'name': card['name'], 'oracleId': card.get('oracle_id', ''),
                        'imageStatus': card.get('image_status'), 'reason': 'no-safe-exact-source'})

destination = scanner / 'data/japanese-image-sets'
destination.mkdir(exist_ok=True)
sets = {}
for set_code, records in sorted(buckets.items()):
    data = json.dumps(records, ensure_ascii=False, separators=(',', ':')).encode('utf-8')
    (destination / ('set-' + set_code + '.json')).write_bytes(data)
    sets[set_code] = {'path': './japanese-image-sets/' + 'set-' + set_code + '.json', 'bytes': len(data),
                      'sha256': hashlib.sha256(data).hexdigest(), 'records': len(records)}
manifest = {'version': 1, 'sourceDate': '2026-10-25', 'scope': 'Scryfall Japanese paper printings including extras',
            'total': len(cards), 'stats': dict(stats), 'sets': sets}
manifest['buildId'] = hashlib.sha256(json.dumps(sets, sort_keys=True).encode()).hexdigest()[:12]
(scanner / 'data/japanese-image-manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, separators=(',', ':')), encoding='utf-8')
report = {'completeScryfallSnapshot': True, 'globalShopApiTruncatedAt': 25000, 'completedSourceCollections': completion, 'scryfallCards': len(cards), 'productRecords': len(products),
          'sourceImageStatuses': dict(native_status), 'stats': dict(stats), 'sets': dict(by_set),
          'productParseRejections': dict(skipped), 'crossLanguageImageUrlsRejected': len(shared),
          'unresolved': missing, 'backFacesRequired':sum(c.get('layout') in ['transform','modal_dfc','double_faced_token'] for c in cards.values()), 'backFacesAvailable':sum(bool(record.get('images',{}).get('back')) for rows in buckets.values() for record in rows.values()),
          'limitations': ['Catalogue joins validate metadata, not OCR of every picture.',
                         'Missing images and unsupported promotional identifiers remain unresolved.',
                         'Back-face supplementation is not inferred from unlabelled shop galleries.']}
(scanner / 'data/japanese-image-coverage.json').write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
print(json.dumps({**stats, 'cards': len(cards), 'products': len(products), 'sets': len(sets),
                  'metadataBytes': sum(row['bytes'] for row in sets.values()), 'buildId': manifest['buildId']}, ensure_ascii=False))
