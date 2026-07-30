# 日本語画像DB運用メモ

## 目的

Scryfallに日本語版画像がない、または検索結果が英語版画像になりやすいカードについて、MTG日本公式カードギャラリー由来の日本語画像を補完DBへ追加します。

## 現在の方針

アプリ側では、カードに `jpImage` / `jpImages.normal` がある場合、日本語版・英語版どちらの検索結果でもその画像を優先表示します。

検索そのものは引き続きScryfallを使い、公式ギャラリーは「日本語名・日本語画像の補助DB」として使います。

## 追加したスクリプト

### 公式ギャラリーから画像候補CSVを作る

```powershell
node scripts\export-mtg-jp-gallery-images.mjs --gallery https://mtg-jp.com/products/card-gallery/0000276/ --set MH3 --out exports\mtg-jp-gallery-images-mh3.csv
```

確認だけしたい場合：

```powershell
node scripts\export-mtg-jp-gallery-images.mjs --gallery https://mtg-jp.com/products/card-gallery/0000276/ --set MH3 --limit 3 --out exports\mtg-jp-gallery-images-mh3-sample.csv
```

### 画像候補CSVを補完DBへ反映する

まずdry-run：

```powershell
node scripts\import-mtg-jp-gallery-images.mjs --in exports\mtg-jp-gallery-images-mh3.csv --dry-run
```

問題なければ反映：

```powershell
node scripts\import-mtg-jp-gallery-images.mjs --in exports\mtg-jp-gallery-images-mh3.csv
```

## 今回の実績

- 対象セット：モダンホライゾン3 / `MH3`
- 公式ギャラリー画像候補：309件
- 自動照合：305件
- 手動補完：4件
  - ナカティルの最下層民、アジャニ // ナカティルの報復者、アジャニ
  - モンスーンの魔道士、ラル // 力線の神童、ラル
  - オンドゥの縄名人 // 命（いのち）綱（づな）投（な）げ
  - 収穫の力 // 収穫の安息地

## 注意

- 公式ギャラリーのHTML構造が変わると、取得スクリプトの修正が必要です。
- 大量取得するときは公式サイトへ負荷をかけないよう、スクリプト内で1件ずつ短い待機を入れています。
- 取り込みは基本的に「既存DBと日本語名＋セットで照合できたものだけ」を追加します。
- 照合できないカードは、必要に応じて個別CSVパッチで補完します。
