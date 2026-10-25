# Japanese card image framing

Image URL coverage, Japanese text, exact printing, and complete physical framing
are separate checks. Catalogue language does not prove image language: multiple
shops show English pictures or an English picture with a Japanese-version label.

## Repeatable investigation

`scanner/tools/collect-full-frame-candidates.py SNAPSHOT SET...` collects public
Black Frog category pages with resumable snapshots and sequential requests.
Candidates require an explicit Japanese non-foil product, the exact set code,
the full English card name, and exactly one matching printing in the Japanese
Scryfall snapshot. Basic-land art variants and ambiguous names fail closed.

`scanner/tools/check-full-frame-candidates.py SNAPSHOT` requires Pillow, NumPy,
and OpenCV. It compares the current Japanese picture to each candidate over a
range of crop scales, checks title and text-region similarity, and checks all
four black edges. Output is a report and contact sheets only. It never updates
the application index. Black-edge checks target traditional black-bordered
cards, not white-bordered or intentionally borderless treatments.

Automatic candidates MUST undergo visual review: even matching scores can
accept English pictures with a Japanese-version overlay. Inspect the printed
Japanese title, artwork, set symbol, and physical edges. Category thumbnails
must not be published. Read the product page's `og:image` and compare that full
image to the reviewed thumbnail; require >=200px width and similarity >=0.94.

Reviewed results reside in `scanner/data/japanese-image-overrides.json` with
exact set/number/language/Oracle identity, source page, review date, image hash,
dimensions and comparison evidence. `frame: full-card-reviewed` takes precedence
over another provider's cropped photo without changing the owned printing.

Run `build-japanese-images.py`, `build-japanese-image-catalog.py SNAPSHOT`, then
`refresh-pack.py` after updates. Manifest hashes cover every changed bucket.

## Runtime behavior

Card detail and edition thumbnails use contain, with no CSS corner clipping.
Artwork banners intentionally retain their crop. No physical border is drawn
or inferred, and no other printing is substituted.

v321 uses metadata cache v5 so old successful cropped-image lookups cannot hide
the replacement. Approved images are scoped to the exact Black Frog image
directory on its shared CDN. This supplier does not provide CORS permission;
the bounded offline picture cache cannot store its opaque responses. Normal
HTTP caching may help, but offline availability is not guaranteed.
