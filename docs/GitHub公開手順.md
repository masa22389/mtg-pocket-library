# GitHub Pages 公開手順

MTG Pocket LibraryをGitHub Pagesで公開するための手順です。

## 1. 公開前に確認すること

公開するのは `C:\Users\xsq11\DDM\mtg-pocket` フォルダだけにしてください。

親フォルダ `C:\Users\xsq11\DDM` には別プロジェクトや大きな作業ファイルが含まれているため、そのままGitHubにアップロードしない方が安全です。

## 2. 公開に必要な主なファイル

最低限、以下が入っていればアプリは動作します。

- `index.html`
- `app.js`
- `styles.css`
- `manifest.webmanifest`
- `sw.js`
- `icon.svg`
- `icons/`
- `mtg-jp-card-index.js`
- `mtgjson-jp-search-index.js`

運用のために、以下も含めるのがおすすめです。

- `docs/`
- `scripts/`
- `README.md`
- `.gitignore`
- `.nojekyll`

## 3. GitHubリポジトリを作る

GitHubで新しいリポジトリを作成します。

例：

```text
mtg-pocket-library
```

公開テスト用であれば、最初は `Public` でも `Private` でも構いません。

ただし、GitHub Pagesで外部の知り合いに見てもらう場合は、無料プランでは基本的に `Public` リポジトリの方が扱いやすいです。

## 4. ファイルをアップロードする

GitHub Desktopを使う場合は、`mtg-pocket` フォルダをリポジトリとして追加して、変更をcommit/pushします。

コマンドで行う場合の例です。

```powershell
cd C:\Users\xsq11\DDM\mtg-pocket
git init
git add .
git commit -m "Initial publish"
git branch -M main
git remote add origin https://github.com/ユーザー名/mtg-pocket-library.git
git push -u origin main
```

すでにリポジトリを作成済みの場合は、GitHub画面に表示されるURLに合わせて `origin` を指定してください。

## 5. GitHub Pagesを有効化する

GitHubのリポジトリ画面で次の順に進みます。

1. `Settings`
2. `Pages`
3. `Build and deployment`
4. `Source` を `Deploy from a branch` にする
5. Branchを `main` にする
6. Folderを `/root` にする
7. `Save`

数十秒〜数分待つと、公開URLが表示されます。

例：

```text
https://ユーザー名.github.io/mtg-pocket-library/
```

## 6. 公開後の確認

公開URLを開いたら、アプリの `設定` タブで現在のバージョンを確認してください。

現在の想定バージョン：

```text
v112
```

古い表示になる場合は、ブラウザのキャッシュやService Workerが残っている可能性があります。

その場合は、以下を試してください。

- URL末尾に `?v=112` を付けて開く
- ブラウザを閉じて開き直す
- サイトデータを削除する
- Androidの場合はインストール済みPWAを一度閉じて開き直す

## 7. 知り合いにテストしてもらう場合

公開URLを共有すればテストできます。

所持カードやデッキのデータは各端末のブラウザに保存されるため、あなたのデータが知り合いに見えるわけではありません。

ただし、テスターが入力したデータもその人の端末内に保存されます。別端末へ移したい場合は、アプリ内のバックアップ / 復元機能を使ってください。

## 8. 今後更新するとき

アプリを修正したら、バージョン番号を上げてからGitHubへpushします。

主に確認するファイル：

- `app.js`
- `index.html`
- `sw.js`
- `manifest.webmanifest`

push後、GitHub Pagesが自動で更新されます。

反映されない場合は、公開URLに新しい `?v=xxx` を付けて開いてください。
