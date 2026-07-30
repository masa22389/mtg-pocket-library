# MTG Pocket Library DB運用手順

この手順書は、カード検索用DBの更新、CSV出力、CSV取り込みを行うためのメモです。

作業場所は以下です。

```powershell
cd C:\Users\xsq11\DDM\mtg-pocket
```

## 1. 日本語検索DBを更新する

MTGJSONから日本語名DBを再生成します。

```powershell
node scripts\update-mtgjson-jp-index.mjs
```

更新されるファイルは以下です。

```text
mtgjson-jp-search-index.js
```

更新前のファイルは自動で以下にバックアップされます。

```text
C:\Users\xsq11\DDM\mtg-pocket-backups
```

## 2. 更新前に件数だけ確認する

実際にファイルを書き換えず、更新結果の件数だけ確認したい場合は `--dry-run` を使います。

```powershell
node scripts\update-mtgjson-jp-index.mjs --dry-run
```

特定セットだけ確認する場合は `--sets` を使います。

```powershell
node scripts\update-mtgjson-jp-index.mjs --sets MH3,FIN --dry-run
```

## 3. DBをCSVに出力する

Excelで確認できるCSVを出力します。

```powershell
node scripts\export-search-db-csv.mjs
```

標準の出力先は以下です。

```text
exports\search-db.csv
```

出力されるCSVは、Excelで文字化けしにくいBOM付きUTF-8です。

## 4. 出力対象を指定してCSV出力する

すべての検索DBを出力します。

```powershell
node scripts\export-search-db-csv.mjs --source all --out exports\search-db.csv
```

手動・補完DBだけ出力します。

```powershell
node scripts\export-search-db-csv.mjs --source manual --out exports\manual-db.csv
```

MTGJSON生成DBだけ出力します。

```powershell
node scripts\export-search-db-csv.mjs --source mtgjson --out exports\mtgjson-db.csv
```

## 5. CSVの主な列

| 列名 | 内容 |
| --- | --- |
| `source` | データ元。例：`mtgjson`、`mtg-jp-card-gallery`、`csv` |
| `sourceUrl` | 参照元URL |
| `setCode` | セット略号 |
| `collectorNumber` | コレクター番号 |
| `setNameJa` | 日本語セット名 |
| `jaNames` | 日本語名。複数ある場合は `|` 区切り |
| `enNames` | 英語名。複数ある場合は `|` 区切り |
| `scryfallName` | Scryfall検索用の英語名 |
| `oracleId` | Oracle ID |
| `scryfallId` | Scryfall ID |
| `image` | 画像URL |
| `imageNormal` | 通常面画像URL |
| `imageBack` | 裏面画像URL |
| `releasedAt` | 発売日 |

## 6. CSVを編集するときの注意

- ヘッダー行は削除しないでください。
- 複数の日本語名・英語名を入れる場合は `|` で区切ります。
- 新しい行を追加する場合は、最低限 `jaNames` と `enNames` または `scryfallName` を入力してください。
- `setCode` と `collectorNumber` があると、同じ収録版として扱いやすくなります。
- Excelで保存するときは、可能ならCSV UTF-8形式で保存してください。

## 7. CSVを取り込む前に確認する

取り込み前に、必ず `--dry-run` で確認します。

```powershell
node scripts\import-search-db-csv.mjs --in exports\search-db.csv --dry-run
```

この時点ではファイルは更新されません。

## 8. CSVを実際に取り込む

問題なければ、次のコマンドで取り込みます。

```powershell
node scripts\import-search-db-csv.mjs --in exports\search-db.csv
```

取り込み先は以下です。

```text
mtg-jp-card-index.js
```

これは手動・補完DBです。

## 9. MTGJSON生成DBと補完DBの扱い

検索DBは大きく2種類あります。

```text
mtgjson-jp-search-index.js
```

MTGJSONから自動生成するDBです。基本的に手で編集しません。

```text
mtg-jp-card-index.js
```

自動生成DBで足りないカードを補うためのDBです。CSV取り込みはこちらに反映します。

標準では、CSV内の `source` が `mtgjson` の行は取り込み時にスキップされます。  
これは、MTGJSON生成DBの大量データを補完DBに丸ごとコピーしてしまうのを避けるためです。

MTGJSON由来の行をExcelで修正して補完DBへ反映したい場合は、その行の `source` を `manual` や `csv` に変更してから取り込んでください。

どうしても `mtgjson` 行もまとめて取り込む場合だけ、次のように指定します。

```powershell
node scripts\import-search-db-csv.mjs --in exports\search-db.csv --include-generated
```

## 9-1. 生成DBと補完DBの考え方

ざっくり言うと、生成DBと補完DBの違いは次の通りです。

```text
生成DB = 外部データからまとめて作る辞書
補完DB = 足りない・直したい部分を人間側で補う辞書
```

このアプリでは、カード検索時に主に次の2つのDBを使います。

| 種類 | ファイル | 役割 |
| --- | --- | --- |
| 生成DB | `mtgjson-jp-search-index.js` | MTGJSONから自動生成した大量のカード名DB |
| 補完DB | `mtg-jp-card-index.js` | 生成DBで足りないカードや、うまく検索できないカードを補うDB |

検索時のイメージは次の通りです。

```text
検索する
  ↓
まず補完DBを見る
  ↓
次に生成DBを見る
  ↓
足りなければScryfall検索
```

生成DBは、MTGJSONのデータから機械的に作り直すDBです。

```powershell
node scripts\update-mtgjson-jp-index.mjs
```

このコマンドを実行すると、`mtgjson-jp-search-index.js` が再生成されます。

そのため、このファイルをExcelなどで直接修正しても、次回更新時に上書きされて消える可能性があります。

一方、補完DBは、このアプリ用に足りないところを足すDBです。

たとえば、次のような内容は補完DBに入れます。

- ScryfallやMTGJSONで日本語名が拾えないカード
- 日本語検索で出ないカード
- 日本語名の別表記
- 公式カードギャラリー由来の補足情報
- 日本語画像や両面カードの補足情報

イメージとしては、次のように考えるとわかりやすいです。

```text
生成DB = 公式資料から毎回印刷し直す分厚いカード名辞典
補完DB = その辞典に貼る自分用の付箋・訂正メモ
```

生成DBを直接直すと、辞典を刷り直したときに訂正が消えます。  
補完DBに入れておけば、生成DBを更新しても補足情報は残ります。

そのため、CSV取り込みでは標準で `source = mtgjson` の行をスキップします。

これは、MTGJSON生成DBの大量データをそのまま補完DBにコピーしてしまうと、DBが無駄に重くなったり、管理がややこしくなるためです。

おすすめの運用は次の通りです。

```text
普段の検索精度アップ
→ 補完DBに追加

MTGJSON全体を最新化
→ 生成DBを更新

Excelで確認・修正
→ CSV出力して、必要な行だけ source を csv/manual にして取り込み
```

つまり、カードが検索できなかった場合は、基本的に「生成DBを直接直す」のではなく、「補完DBにそのカードを追加する」と考えるのが安全です。

## 10. アプリ側へ反映する

CSV取り込みでDBファイルを更新した場合、PCブラウザやAndroid側で古いキャッシュが残ることがあります。

その場合は、Codexに次のように依頼してください。

```text
CSV取り込み後のDBをアプリに反映して、Androidでも最新版にしたい
```

または、アプリのURL末尾のバージョンを更新して開き直します。

```text
http://127.0.0.1:4174/?v=新しい番号
```

Androidで確認する場合は、必要に応じてPC側で次を実行します。

```powershell
adb reverse tcp:4174 tcp:4174
```

その後、AndroidのChromeで以下を開きます。

```text
http://127.0.0.1:4174/?v=新しい番号
```

## 11. よく使う流れ

DB更新からCSV確認までの基本手順です。

```powershell
cd C:\Users\xsq11\DDM\mtg-pocket
node scripts\update-mtgjson-jp-index.mjs
node scripts\export-search-db-csv.mjs
```

ExcelでCSVを編集して、補完DBへ戻す場合です。

```powershell
cd C:\Users\xsq11\DDM\mtg-pocket
node scripts\import-search-db-csv.mjs --in exports\search-db.csv --dry-run
node scripts\import-search-db-csv.mjs --in exports\search-db.csv
```
