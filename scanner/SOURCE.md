# MTG Pocket スキャナーの出典

操作感の良好基準：独立Lab build 8953ffa7d19b（2026-10-24実機テスト）。
この本体組み込み版ではIndexedDBへの仮登録、確認済みカードの所持データ保存を追加。通常の認識では外部通信を行わず、版・言語・仕様の確認操作時にScryfallのカード情報を取得する。撮影画像は送信しない。候補画像は撮影画像の切り出しを表示。

- カードデータ：Scryfall公式default_cards / unique_artwork、2026-10-23 snapshot。paper 38,091 Oracle IDs、58,676画像指紋、109,991収録版。https://scryfall.com/docs/api/bulk-data
- pHash生成・照合：fingerprint.mjs、64x64 DCT / 256 bit。参照画像と実行時で同じ実装。
- Cornelius 2.12 / Milo 1.0：HanClinto、AGPL-3.0。https://huggingface.co/HanClinto/cornelius / https://huggingface.co/HanClinto/milo
- ジオメトリ処理：CollectorVision由来、AGPL-3.0。https://github.com/HanClinto/CollectorVision
- オプションMilo認識データ：CollectorVisionCatalog v2 scryfall/mtg v64、113,892特徴。https://hanclinto.github.io/CollectorVisionCatalog/catalog-v2/catalog-feed-v2.json
- ONNX Runtime Web 1.22.0：MIT、vendor/ort/LICENSE。
- このスキャナーの実装・改変部分：AGPL-3.0-only、LICENSE参照。モデルとデータのSHA256はpack.json。カード・イラストの権利は各権利者に帰属。

shared-storage.jsとcollection-store.jsは本体storage.js / scanner-trial/quick-store.jsの同一コピー。オフライン準備をスキャナー配下で完結させるため同梱する。更新時は同期する。OCRは利用していない。全体カタログは全カードの認識精度を保証するものではない。

v306のdata/print-display.json：同じScryfall bulk snapshotからセット名・セット内の最新公開日を抽出。サムネイルURLは同bulk内のsmall/front形式と全paperカードで一致することを確認したID形式から構成する。一覧を開いた際にのみcards.scryfall.ioへ画像取得を行う。セット単位の日付は一覧の並べ替え用。

v307では画像取得のタイミングを仮リストおよび版選択画面に限定。候補の切り出しは表示中だけ保持し、永続保存しない。本体の通常のスキャン照合は端末内で実行する。

v308 mobile-inputs.cssは本体と同じCSSをスキャナー配下にも同梱し、オフライン時も入力サイズを維持する。iOS自動ズームの16px対策の一次資料例： https://docs.flutter.dev/ui/accessibility/web-accessibility#viewport-zoom-and-mobile-text-inputs 。手動の拡大を禁止するviewport指定は追加しない。
