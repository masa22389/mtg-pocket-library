# カードスキャナー試用版 v298

このディレクトリの試用コードは AGPL-3.0-only で提供します。ライセンス全文は vendor/LICENSE。
trial.js、quick-add.js、quick-store.js、trial.css、index.html と vendor/scanner.worker.mjs が、試用版の対応するソースです。ビルド工程はありません。
外部モデルを含む本番のクローズドソース利用については、別途許諾確認か実装の置換が必要です。

## 配布元と取得日

- CollectorVision: https://github.com/HanClinto/CollectorVision
- 取得元: https://hanclinto.github.io/CollectorVision/scanner.worker.mjs （2026-09-26）
- 元ファイルのSHA-256は UPSTREAM-SHA256.txt に記録。
- Workerは作者のAGPL-3.0ソースを改変。変更点：Top 3返却、試用専用IndexedDB名、単一スレッドWASM、外部ORT URL。
- ONNX Runtime Web: https://github.com/microsoft/onnxruntime （MIT）。公式デモ配布物のJS/WASMを必要時に取得します。
- Milo: https://huggingface.co/HanClinto/milo （AGPL-3.0）
- Cornelius: https://huggingface.co/HanClinto/cornelius （AGPL-3.0）
- モデル、特徴量、ID一覧はCollectorVision公式配布先から取得。モデル・リファレンスデータの権利は各提供者に帰属します。
- 互換性確保のためモデル案内は vendor/manifest.json に固定（2026-07-09の109,711件）。外部配布ファイルが変更・停止された場合は動作しない可能性があります。
- サンプル画像は同プロジェクトの公式ブラウザデモに含まれる mtg-sample.jpg。

## 境界

- 有料API、画像アップロード、自動登録はありません。
- 最有力候補は確認画面で言語・仕様・枚数を選び、ボタンで確定します。別候補は従来の本体詳細へ進みます。
- 確定時のみ本体IndexedDBのコレクションへ加算します。既存の移行処理で初期化後、読込と書込を単一トランザクションで実施します。
- 初回約46.5MBのモデル・カタログに加え、WASM等を取得。二回目以降は専用IndexedDBを利用します。
- 簡易追加はNM・保管場所未指定。言語変更は同一セット・番号・Oracle IDを確認し、取得失敗時は保存しません。保存後に次の読み取りへ進めます。
- 起動時は読み込まれず、専用ページを開くとカメラの許可を求め、許可後にモデルを取得します。

## 完全撤去

1. 試用画面の「認識データを削除」を各利用端末で押す（専用DB mtg-pocket.scanner-trial.assets.v1 のみ）。
2. 試用版追加コミットを git revert する。後続の修正がある場合は、以下のみ撤去する。
   - scanner-trial/ ディレクトリ
   - index.html の BEGIN/END SCANNER TRIAL LINK 部分
   - app.js の BEGIN/END SCANNER TRIAL BRIDGE 部分
   - sw.js の BEGIN/END SCANNER TRIAL BYPASS 部分
3. アプリのキャッシュ版を新しい番号に更新して配信。旧版番号への巻き戻しは避ける。

復帰基準：v256 / 47a73c6。ローカルのタグ scanner-baseline-v256 でも保存。
以降の無関係な改修や端末の所持データを戻さないこと。

## v278 自動読み取りの試用
専用画面でカメラを自動起動。自動モードは処理完了後1.8秒空けて再試行し、候補取得時にカメラ停止。手動切替、停止、画面非表示時の解放に対応。自動登録はしません。

## v298 FRA recognition supplement

- Base catalog remains the upstream 2026-07-09 snapshot. A local supplement covers 461 FRA print IDs fetched from Scryfall on 2026-10-22; 454 IDs were missing from the base catalog. Duplicate IDs are not appended.
- Generated using the identical pinned Milo ONNX SHA-256, ImageNet normalization, 448x448 RGB input, normalized 128-dimensional vectors stored as float16. No model retraining or runtime image upload.
- `scripts/build-fra-scanner-catalog.py --work-dir <temporary-directory>` reproduces assets with Python, numpy, Pillow, onnxruntime >= 1.20. Downloaded card images remain in the specified temporary directory; only vectors/IDs are shipped.
- `catalog/validation.json` records brightness-modified reference-image checks against the full base catalog. This is not a smartphone camera accuracy measurement. Language detection remains unchanged.
- Added assets: about 155 KB, cached separately by supplement version; original model/catalog cache remains reusable. Asset dimensions are validated before merging.

## v299 Local Japanese-language detection (trial)
- After one successful card identification, transfer the rectified 448px crop, rotate to the recognized orientation, and OCR the lower text area at 896px width. No camera frame or OCR text is uploaded.
- Tesseract.js 6.0.1 and tesseract.js-core 6.0.0 (Apache-2.0) are loaded from jsDelivr. Japanese/English traineddata is downloaded on first use and cached by Tesseract. The existing scanner-data removal button removes only the CollectorVision cache, not Tesseract's language cache.
- Japanese requires OCR confidence >=45, kana evidence, at least six Japanese characters and more Japanese than Latin letters. Otherwise English is requested. This is conservative heuristic detection, not guaranteed language identification.
- A separate OCR worker runs once per recognized card, with a 25-second timeout, and terminates on completion, cancellation, error or page exit. Initial downloads add latency and temporary memory use; mobile performance is not yet measured.
- Language retrieval uses the existing exact set/collector-number/Oracle-ID check. Missing Japanese printing blocks saving and offers manual language/alternate-candidate selection, rather than silently saving English as Japanese.
- PC reference-image test: TDM #5 Japanese detected Japanese (confidence 74), English detected unknown/default-English (confidence 74); OCR about 0.7–0.8 seconds excluding initial downloads. This is not smartphone camera validation.
- Upstream documentation: https://github.com/naptha/tesseract.js/blob/master/docs/api.md

## v301 continuous preview and draft list
Camera preview remains active during confirmation. Recognition pauses until Next; automatic registration is not enabled. scanner-list.js stores a compact draft in the existing values store and consumes it in the same transaction as collection merging. scanner-list-ui.js supports removal and final save. Photos are not stored. These source files are AGPL-3.0-only.
