# カードスキャナー試用版 v257

このディレクトリの試用コードは AGPL-3.0-only で提供します。ライセンス全文は vendor/LICENSE。
trial.js、trial.css、index.html と vendor/scanner.worker.mjs が、試用版の対応するソースです。ビルド工程はありません。
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
- 候補のScryfall IDだけを本体URLに渡し、本体の登録画面でユーザーが確定します。
- 本体のコレクション／デッキ／設定の保存領域には試用コードから書き込みません。
- 初回約46.5MBのモデル・カタログに加え、WASM等を取得。二回目以降は専用IndexedDBを利用します。
- 言語・Foil・状態の確定や連続登録は未実装。カタログ未収録のカードは誤った候補が出る可能性があります。
- 起動時は読み込まれず、専用ページで開始操作した場合のみモデルを取得します。

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
