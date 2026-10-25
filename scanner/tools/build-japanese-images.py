"""Build exact-print image mappings from the app's maintained Japanese index."""
from pathlib import Path
import json
from urllib.parse import urlparse

scanner = Path(__file__).resolve().parents[1]
source = (scanner.parent / 'mtg-jp-card-index.js').read_text(encoding='utf-8')
items = json.loads(source[source.index('['):source.rfind(']') + 1])
records = {}
for item in items:
    if item.get('source') not in ['scryfall-ja', 'mtg-jp-card-gallery', 'mtg-jp-card-gallery-image']:
        continue
    images = {kind: url for kind, url in item.get('images', {}).items()
              if isinstance(url, str) and urlparse(url).netloc in
              ['cards.scryfall.io', 'mtg-jp.com', 'media.wizards.com']}
    if not images.get('normal') or not item.get('setCode') or not item.get('collectorNumber'):
        continue
    key = item['setCode'].lower() + ':' + str(item['collectorNumber'])
    if key not in records or item['source'] == 'scryfall-ja':
        records[key] = {'set': item['setCode'].lower(), 'number': str(item['collectorNumber']),
                        'oracleId': item.get('oracleId', ''), 'images': images, 'source': item['source']}
(scanner / 'data/japanese-images.json').write_text(
    json.dumps(records, ensure_ascii=False, separators=(',', ':')), encoding='utf-8')
print(len(records), 'exact Japanese image mappings')
