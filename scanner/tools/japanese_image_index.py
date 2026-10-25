"""Conservative joins for a set-specific Japanese picture catalogue.

Shop titles are data, never instructions. A picture requires matching print
coordinates AND an English title. Unknown promotional variants fail closed.
"""
import re
import unicodedata
from urllib.parse import urlparse


def number_key(value):
    return re.sub(r'^0+(?=\d)', '', str(value)).lower()


def name_key(value):
    value = unicodedata.normalize('NFKC', str(value)).replace('’', "'")
    value = ''.join(c for c in unicodedata.normalize('NFKD', value) if not unicodedata.combining(c))
    value = re.sub(r'\s*(?://|\+)\s*', ' // ', value)
    return re.sub(r'\s+', ' ', value).strip().casefold()


def product_text(value):
    # Older catalogue imports expose literal JSON Unicode escapes in titles.
    value = str(value)
    for _ in range(2):
        value = re.sub(r'\\u([0-9a-fA-F]{4})', lambda m: chr(int(m[1], 16)), value)
    return unicodedata.normalize('NFKC', value)


def image_allowed(url):
    parsed = urlparse(url)
    return parsed.scheme == 'https' and (
        parsed.netloc in ['cards.scryfall.io', 'mtg-jp.com', 'media.wizards.com',
                          'cardshop-serra.com', 'files.hareruyamtg.com'] or
        (parsed.netloc == 'makeshop-multi-images.akamaized.net' and parsed.path.startswith('/blackfrog/itemimages/')) or
        (parsed.netloc == 'cdn.shopify.com' and
         parsed.path.startswith('/s/files/1/0672/8302/6038/')))


def parse_product(product):
    title = product_text(product.get('title', ''))
    if not title.startswith('(日)'):
        return None, 'not-japanese'
    match = re.search(r'【([A-Z0-9]+)】[^【]*?No\.\s*([0-9A-Za-z★☆†-]+)\s*$', title)
    if not match or ' / ' not in title:
        return None, 'unsupported-title'
    set_code, number = match.groups()
    prefix, english = title[:match.start()].split(' / ', 1)
    english = re.split(r'\s*[★☆]', english, maxsplit=1)[0].strip()
    skus = [str(sku).upper().split('_')[0] for sku in product.get('skus', [])]
    expected = f'{set_code}-{number}-J'
    matching = [sku for sku in skus if sku == expected or sku.startswith(expected + '-')]
    if not matching:
        return None, 'sku-variant-mismatch'
    # 4ED's Japanese black border has its own Scryfall set. Do not merge it.
    if set_code == '4ED':
        if '黒枠' in title or any('-J-BB' in sku for sku in matching):
            set_code = '4BB'
        elif '白枠' not in title and not any('-J-WB' in sku for sku in matching):
            return None, 'ambiguous-border'
    if set_code == 'CHR':
        # The Japanese Chronicles printing uses Scryfall's black-border set.
        set_code = 'BCHR'
    images = [url for url in product.get('images', []) if image_allowed(url)]
    if not images:
        return None, 'missing-image'
    return {
        'set': set_code.lower(), 'number': number_key(number),
        'english': name_key(english), 'url': images[0],
        'sourcePage': 'https://cardshop-serra.com/products/' + product['handle'],
        'productId': product['id'], 'foil': bool(re.search(r'【foil】', title, re.I)),
    }, None


def card_names(card):
    names = [card.get('name', '')]
    names.extend(face.get('name', '') for face in card.get('card_faces', []))
    names.extend(str(card.get('name', '')).split(' // '))
    return {name_key(name) for name in names if name}


def native_images(card):
    if card.get('image_status') not in ['highres_scan', 'lowres']:
        return {}
    faces = card.get('card_faces', [])
    front = card.get('image_uris', {}).get('normal') or (faces[0].get('image_uris', {}).get('normal') if faces else None)
    back = faces[1].get('image_uris', {}).get('normal') if len(faces) > 1 else None
    return {key: url for key, url in [('normal', front), ('back', back)] if url and image_allowed(url)}


def join_product(card, candidates, shared_language_images):
    if card.get('lang') != 'ja':
        return None
    matches = [p for p in candidates if p['set'] == card['set']
               and p['number'] == number_key(card['collector_number'])
               and p['english'] in card_names(card)
               and p['url'] not in shared_language_images
               and (not p['foil'] or 'foil' in card.get('finishes', []))]
    if not matches:
        return None
    matches.sort(key=lambda p: (p['foil'], p['productId']))
    product = matches[0]
    return {'set': card['set'], 'number': str(card['collector_number']),
            'language': 'ja', 'oracleId': card.get('oracle_id', ''),
            'images': {'normal': product['url']}, 'source': 'serra-catalog-exact',
            'sourcePage': product['sourcePage'], 'productId': product['productId'],
            'validation': 'set-number-language-english-title-sku',
            'imageStatus': 'source-product-image'}
