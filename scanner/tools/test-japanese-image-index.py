import unittest
from japanese_image_index import parse_product, join_product, native_images


class CatalogueJoinTests(unittest.TestCase):
    def product(self, **changes):
        return {'id': 1, 'title': '(日)殺し / Snuff Out【MMQ】 No.162',
                'handle': 'mmq-162-j', 'skus': ['MMQ-162-J_NM_abc'],
                'images': ['https://cdn.shopify.com/s/files/1/0672/8302/6038/files/snuff.jpg'], **changes}

    def card(self, **changes):
        return {'lang': 'ja', 'set': 'mmq', 'collector_number': '162',
                'name': 'Snuff Out', 'oracle_id': 'snuff', 'finishes': ['nonfoil', 'foil'], **changes}

    def test_old_escaped_titles_and_padded_numbers(self):
        product = self.product(title=r'(\u65e5)\u6bba\u3057 / Snuff Out\u3010MMQ\u3011 No.0162', skus=['MMQ-0162-J_NM_abc'])
        parsed, error = parse_product(product)
        self.assertIsNone(error)
        self.assertEqual(parsed['number'], '162')
        self.assertIsNotNone(join_product(self.card(), [parsed], set()))

    def test_all_identity_coordinates_are_required(self):
        parsed, _ = parse_product(self.product())
        for changes in [{'set': 'fic'}, {'collector_number': '163'}, {'name': 'Other'}, {'lang': 'en'}]:
            self.assertIsNone(join_product(self.card(**changes), [parsed], set()))

    def test_unknown_promotional_skus_fail_closed(self):
        _, error = parse_product(self.product(skus=['MMQ-PRM-PRE-162-J-F_NM_abc']))
        self.assertEqual(error, 'sku-variant-mismatch')

    def test_same_image_shared_with_english_is_rejected(self):
        parsed, _ = parse_product(self.product())
        self.assertIsNone(join_product(self.card(), [parsed], {parsed['url']}))

    def test_black_and_white_borders_do_not_merge(self):
        base = self.product(title='(日)赤霊破 / Red Elemental Blast【4ED】 黒枠 No.218', skus=['4ED-218-J-BB_NM_a'])
        black, _ = parse_product(base)
        white, _ = parse_product({**base, 'title': base['title'].replace('黒枠', '白枠'), 'skus': ['4ED-218-J-WB_NM_a']})
        self.assertEqual(black['set'], '4bb')
        self.assertEqual(white['set'], '4ed')

    def test_placeholder_is_not_a_native_japanese_image(self):
        c = self.card(image_status='placeholder', image_uris={'normal': 'https://cards.scryfall.io/placeholder.jpg'})
        self.assertEqual(native_images(c), {})


if __name__ == '__main__':
    unittest.main()
