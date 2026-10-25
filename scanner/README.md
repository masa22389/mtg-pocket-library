# 本体スキャナー v310

入口：../index.html → カメラでカードをスキャン。良好基準版の自動読み取り、ライブ映像、候補の初期非表示・×、直近カード、枠外拒否、カード交換検知を継承。ガイド幅を表示幅78%から86%に拡大（高さの上限は維持）。

初回と認識データ更新時は約91MBを自動準備し、SHA256検証後にカメラ開始を許可する。毎回のデータダウンロードは不要だが、ページを開いた際の特徴・モデルのメモリ読込は必要。

スキャン → 自動仮登録 → スキャンリストで収録版・言語・仕様を選択 → 確認 → 確認済みカードを所持カードへ保存。確認時はScryfall通信が必要。通常認識・仮登録は端末内で完結する。候補の「合っています」はカード名の確認であり、版確定・所持カード保存ではない。日本語版が存在しない場合は別の版または英語を選ぶ。未確認カードは保存後も仮登録リストに残る。

保存：本体と同じIndexedDB mtg-pocket-data-v1 / values。スキャナー専用キー mtg-pocket.scannerHybrid.v1。確認済みの消費と所持カードへの加算は単一トランザクション。失敗時は両方ロールバック。別タブの変更を検知した場合は古いリストによる上書きを拒否する。

旧scanner-trialと独立Labのリストは自動移行しない。別オリジン・別ポートの所持データは共有されない。本体と同じURLから利用すること。試験用ローカルURL http://localhost:4174/ と公開サイトは別データ。

再生成：python scanner/tools/refresh-pack.py。モデル・カタログの出典とライセンスはSOURCE.md。公開・Git pushはこの組み込み作業では行っていない。

## v306 画像付きの版選択
スキャン結果の「収録版を選ぶ」またはリストの収録版ボタンから、画像・セット名・略号・番号・仕様の一覧を開く。新しいセット順で表示し、検索、選択チェック、通常/Foil切替と「完了」で確定する。×や戻るキーは未確定の選択を保存しない。取得に失敗した場合も所持カードには保存しない。選択中は認識処理を待機させ、映像はライブを維持する。サムネイルはこの画面でのみScryfall画像サーバーから取得し、カメラ画像を送信しない。

## v307 スキャンと仮リスト、起動の再利用
本体の入口は同じオリジンのiframeを一度だけ作り、保存データとアプリ更新処理の準備後に裏で認識機能を読み込む。戻る・再表示・停止ではカメラのみ終了し、認識Workerは保持する。スキャン/仮リストのタブ切替でもページ遷移しない。アプリ再読み込み・OSによるページ破棄・ブラウザー再起動後はメモリへの読み込みが再度必要。初回ダウンロードや更新確認を完全に省略したものではない。

準備済みモデル/カタログはCache Storageを優先して利用。更新時のPREPAREは旧パックとSHA256・容量が同じ資産を再利用し、変更されたファイルだけ取得する。scanner-startup、camera-start、ダウンロード/再利用バイト数とWorker作成回数を記録書き出しに含める。

スキャン画面の直近カード一覧は削除。仮リストでは参照画像付きのカードから、コレクションへの追加画面を開く。収録版・枚数・状態・仕様・言語・保管場所を確認して追加する。枚数は追加する数で、既存の所持総数を上書きしない。確定したカードの取り込みと該当仮登録の削除は同一トランザクション。同じ版・言語・仕様・状態・場所のロットだけ加算する。仮リストの参照画像は開いたときに取得し、撮影画像は保存・送信しない。

本体とのデータ更新はpostMessageで同一オリジンと送信元iframeを確認したうえで通知し、storage.refreshItemでIndexedDBから本体の表示用データを再読込する。本体やiframe自体の再読み込みは行わない。起動時間のPC合成カメラ検証値と実機値は別に扱う。

回帰テスト：node --test scanner/tests/*.test.mjs。ブラウザーテストはローカルサーバー4174を起動し、tests/hybrid-scanner-storage.browser.cjs と tests/hybrid-scanner-warm.browser.cjs を実行する（第1引数にPlaywrightモジュールのパスを指定可能、Chromeの指定はCHROME_PATH環境変数）。独立したブラウザーのデータ領域と合成映像を使用し、実物の認識精度を主張しない。

## v309 iPhone上部・事前準備・仮リスト削除
本体のセーフエリアを確保した全画面コンテナ内にスキャナーを表示する。単独で開いた場合もscanner自身に安全領域を設ける。戻るは44px以上のタップ領域を持つ固定ヘッダーで表示し、タブはその下へ配置する。WebKitのガイド https://webkit.org/blog/7929/designing-websites-for-iphone-x/ に沿ったenv(safe-area-inset-*)を利用。ブラウザーで安全領域47px/34pxを模擬して押下を検証したが、iPhone実機の確認は別途必要。

本体サービスワーカーの登録をwindow.load待ちからDOMContentLoaded段階へ移動し、認識用iframeは待機コールバックを使わず先行読み込みする。iframeをdisplay:noneにせず画面外でレイアウトし、非表示中はinertと画面外配置で操作を防ぐ。準備完了通知の前にスキャン画面へ切り替えない。準備中に押した場合は本体画面に留まり、完了後に開く（キャンセル可能）。初回・更新・ブラウザーによる破棄後の初期化はなくならない。入力欄ズーム対策と日本語所持検索はv308から継承する。

仮リストの各カードと追加画面に削除ボタンを設置。専用のIndexedDBトランザクションで仮登録だけを削除し、所持カードへは書き込まない。保存失敗時は表示上もカードを残し、再試行可能。tests/hybrid-scanner-delete.browser.cjsで両方の操作、再読み込み、書き込み失敗、所持枚数不変を確認する。

## v310 本体・スキャナー起動の短縮
段階別のPC計測で、準備済みでもawait serviceWorker.registerが約2.2秒待つケースを確認。既存の登録スコープ、スクリプトURL、前後のパックのsw.js SHA256が一致する場合は登録済みのものを再利用する。更新確認はready通知後に行う。初回およびsw.js変更時は登録・アクティブ化を待ち、キャッシュのSHA256検証を省略しない。登録URLには新SWのSHAを付け、preparePackは同じスクリプト本体のURLか確認する。

画像指紋と検出モデルの初期化を名前辞書の読込と並列化。指紋Workerが自分でカード参照を読み、本体から約58,000行を再コピーしない。仮リスト画像の参照マップは仮リストを開くときに読み込む（画像領域の高さを維持し、読み込み途中に削除ボタンが大きく移動しないようにする）。スキャン入口のイベント処理は大きい日本語辞書のスクリプトより先に設置する。

本体はセット日本語名を毎セット全件検索していた処理を一度の索引作成に変更。カード名の正規化結果は検索索引の作成中だけ再利用し、終了時に破棄する。日本語検索の結果・カードの同一性・版選択は変更しない。起動記録に保存領域・パック取得・SW登録・名前読込・認識準備の各時間を追加。

実機の起動時間は端末とブラウザーの状態で異なる。PCでCPU負荷を模擬した測定はGalaxyやiPhoneの実測値として扱わない。tests/set-name-startup.test.cjs と tests/scanner-startup.browser.cjs で重複走査の抑止、SW再利用、オフライン起動、辞書読込中のタップを確認する。


### Japanese printing pictures (v315)

`card-images.js` shares image selection with the main app and resolves scanner pictures by exact set, collector number, language, Oracle identity and face. Rebuild `data/japanese-images.json` from the maintained app index with `python scanner/tools/build-japanese-images.py`, then run `python scanner/tools/refresh-pack.py`.

The edition picker resolves visible Japanese pictures only; changing language cancels old bindings. Missing or unavailable Japanese pictures retain the English picture with an explicit label. Unselected draft pictures remain reference pictures and never select a printing. Metadata is cached for seven days (404 misses for one day); temporary network failures are retried. The two service workers share a cache of up to 160 CORS-readable pictures. Other picture hosts use the browser HTTP cache; opaque responses are not placed in CacheStorage because of mobile quota padding.


v317 rejects Scryfall `image_status=placeholder`/`missing` pictures as Japanese scans and never substitutes a different printing. The main app binds this exact-print resolver to Japanese card images, including saved collection and deck images; image replacement is DOM-only. The selected printing, language and quantity remain unchanged. Metadata uses the v3 cache namespace so earlier results are not reused.

Reviewed supplemental images live in `data/japanese-image-overrides.json`. Every record specifies the exact set, collector number, language, Oracle ID, source product page and verification date. The two initial records are Red Elemental Blast, 4BB #218 Japanese black border (Hareruya) and 4ED #218 Japanese white border (Cardshop Serra). The source pages and actual images were visually checked. Rebuilding the Japanese image index merges these records; no generic same-name, same-Oracle or cross-set fallback is allowed. An unavailable exact Japanese image is labeled as unavailable and retains the original image for that printing.


### Complete-catalogue image audit (v318)

The runtime also reads `data/japanese-image-manifest.json` and loads only the needed set in `data/japanese-image-sets/`. Each bucket is checked against its byte count and SHA256, cached separately, and matched to exact set, collector number, Japanese language and Oracle ID. Pictures remain lazy; buckets are not part of the initial model pack. `data/japanese-image-coverage.json` lists the unresolved printings and evidence limits. As of this snapshot, 62,680/62,851 Japanese paper printings have a matched front-image URL; 171 remain unresolved. This is a metadata coverage audit, not visual verification of every photo.

Reproduce/update in a fresh or resumable snapshot directory:

```powershell
python scanner/tools/collect-japanese-image-data.py <snapshot-directory>
python scanner/tools/build-japanese-images.py
python scanner/tools/build-japanese-image-catalog.py <snapshot-directory>
python scanner/tools/refresh-pack.py
python scanner/tools/test-japanese-image-index.py
node --test scanner/tests/*.test.mjs
```

The collector respects public pagination and the 25,000-product global API cap, using explicit set collections for missing-image sets. Candidate pictures from the shop must match set/language/name/number/SKU; ambiguous promotional identifiers are rejected. A numbered crosswalk is allowed only when the English name identifies exactly one printing in both catalogues within that set and language. Multiple-art basic lands are excluded from that rule. Known black-border Japanese Chronicles uses the BCHR set alias. The supplementary Hareruya adapter requires explicit Japanese CSP Theme Deck product labels and JP image paths. No cross-set substitution is allowed.


v319 fixes an update-path issue: a cached negative lookup must not take precedence over newly available local image data. The main service worker fetches the mutable image manifest network-first with offline fallback, and an initial manifest failure no longer permanently pins an empty set index for the session. Image load failures and lookup/connection failures have separate UI messages from missing catalogue pictures. Regression coverage includes NEM #30 Daze with an existing negative cache and an old manifest path, as well as transient-manifest recovery. The coverage file reports data/URL matching, not successful rendering in every user session.
