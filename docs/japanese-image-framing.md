# Japanese card image framing

## 引き継ぎ：未完了事項（2026-10-26、v321時点）

ユーザーの指示により、画像対応の作業はここで一旦終了。再開時は以下を前提にする。

- **古いカードの日本語画像には、物理的な外枠が切り落とされた元画像が残っている。全件対応は未完了。**
- 以前の「全件対応」という報告は不正確だった。画像URLを収録版に対応付けたことと、実画像の日本語・版・イラスト・外枠を全件確認したことを混同していた。後者の全件確認は実施できていない。
- v320で共通の表示処理をcontainに変更し、表示時の切り抜きを抑制。元画像にない外枠は復元されない。
- v321では29セット・1,720件の候補を調査し、目視と詳細画像の照合を経た38件（目くらましNEM、殺しMMQなど）を外枠付き日本語画像へ差し替えた。この38件は全カードの対応完了を意味しない。
- 外枠の全件監査は未完了で、外枠欠落の総数・完全な残件一覧は未確定。38件以外がすべて不良という意味でもない。
- `japanese-image-coverage.json`の未解決171件は「安全に対応付けられる画像URLがない」件数であり、外枠欠落・外枠未確認の件数ではない。分けて扱う。
- 今回の取得元では、蓄積した知識NEM、リスティックの研究PCY、フェアリーの大群USG、ティタニアの僧侶USG、輪作ULG、モックス・ダイアモンドSTH、陰謀団の貴重品室TOR、思考掃きJUD、煙霧の連鎖ONS、萎縮した卑劣漢LGNなどは採用に至らなかった。これは完全な残件一覧ではなく、現行画像すべての外枠欠落を確定した一覧でもない。

再開時は全対象について「画像URLあり」「日本語・版の実画像確認」「外枠確認」を別々に記録し、未確認・確認済み不良・代替画像なしを区別する。別版の画像や英語画像で埋めず、外枠を描き足さない。商品言語や画像類似度だけで採用せず、実画像を確認する。全件監査と確認済み不良の解消が完了するまでは「全件対応済み」と報告しない。

調査資料：作業用ワークスペースの `outputs/v321-日本語画像の外枠対応結果.md`、`work/japanese-image-audit/blackfrog/`。採用済み38件の恒久的な根拠は `scanner/data/japanese-image-overrides.json` の `frame: full-card-reviewed` に保存。

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
