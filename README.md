# MTG Pocket Library

MTGの所持カード管理・カード検索・デッキ編集を行うための個人向けWebアプリです。

PCブラウザでもAndroidでも使えるよう、静的サイトとして動作します。カード情報の検索には主にScryfall APIと、アプリ内の日本語検索補完DBを使います。

## 主な機能

- 日本語・英語カード名検索
- 所持カードの登録、枚数管理、お気に入り管理
- カード価格の参考表示
- デッキ作成・編集
- メイン / サイド / 統率者 / 候補の管理
- デッキ統計表示
- デッキインポート
- バックアップ / 復元
- 日本語検索補完DB、CSV出力・取り込み

## ローカルでの起動

このフォルダでHTTPサーバーを起動します。

```powershell
cd C:\Users\xsq11\DDM\mtg-pocket
python -m http.server 4174 --bind 127.0.0.1
```

PCでは次のURLを開きます。

```text
http://127.0.0.1:4174/?v=112
```

AndroidをUSB接続してPCのローカルサーバーを見る場合は、ADBでポート転送します。

```powershell
adb reverse tcp:4174 tcp:4174
```

その後、Android Chromeで次を開きます。

```text
http://127.0.0.1:4174/?v=112
```

## GitHub Pagesで公開する場合

この `mtg-pocket` フォルダを単体リポジトリとしてGitHubへアップロードするのがおすすめです。

公開手順は [docs/GitHub公開手順.md](docs/GitHub公開手順.md) を参照してください。

## データ保存について

所持カード、デッキ、設定などのユーザーデータは、各端末のブラウザ内 `localStorage` に保存されます。

GitHub Pagesなどで公開しても、あなたのPCやスマホに保存されているデータが他の人へ自動共有されることはありません。知り合いが同じURLを開いた場合、その人の端末には空の状態からデータが作られます。

ただし、以下のようなファイルをリポジトリに含める場合は、公開前に内容を確認してください。

- バックアップJSON
- 個人的なメモ
- 手作業で作成したCSV
- 未整理の作業ログ

## 公開対象の目安

最低限、公開に必要なファイルは次の通りです。

- `index.html`
- `app.js`
- `styles.css`
- `manifest.webmanifest`
- `sw.js`
- `icon.svg`
- `icons/`
- `mtg-jp-card-index.js`
- `mtgjson-jp-search-index.js`

運用メモとして、`docs/` と `scripts/` も含めておくと、今後DB更新やCSV運用を続けやすくなります。

`exports/` は監査結果や作業用CSVが多いため、基本的にはGitHub公開対象から外す方針です。

## DB運用

日本語検索DBやCSV出力・取り込みの手順は、以下を参照してください。

- [docs/DB運用手順.md](docs/DB運用手順.md)
- [docs/日本語画像DB運用メモ.md](docs/日本語画像DB運用メモ.md)
- [docs/DB最新セット対応計画.md](docs/DB最新セット対応計画.md)
- [docs/DB対応進捗サマリー.md](docs/DB対応進捗サマリー.md)

## 注意

Scryfall APIへの通信が必要な検索があります。ネットワーク状況やScryfall側の制限によって、一時的に検索に失敗する場合があります。
