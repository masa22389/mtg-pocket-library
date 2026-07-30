# DB最新セット対応計画

このメモは、カード検索DBを最新セットから順番に補完していくための作業リストです。

## 基本方針

最新セットから順に、次の流れで確認します。

```text
1. セット別CSVを出力する
2. Excelなどで日本語名・英語名・セット略号・コレクター番号を確認する
3. 検索できないカード、表記ゆれ、画像不足、両面情報不足を見つける
4. 必要な行だけ source を manual または csv にして補完DBへ取り込む
5. アプリで日本語検索・英語検索・部分一致・完全一致を確認する
```

## 現在の最新順リスト

ローカル生成DB上では、現時点の最新セットは次の順です。

| 優先 | 発売日 | セット略号 | セット名 | 生成DB件数 | 補完DB件数 | DB状態 | 作業ステータス |
| ---: | --- | --- | --- | ---: | ---: | --- | --- |
| 1 | 2026-06-26 | MSC | Marvel Super Heroes Commander | 260 | 0 | 生成DBあり | ✅確認済み・問題なし |
| 2 | 2026-06-26 | MSH | Marvel Super Heroes | 259 | 0 | 生成DBあり | ✅確認済み・問題なし |
| 3 | 2026-04-24 | SOA | Secrets of Strixhaven Mystical Archive | 63 | 0 | 生成DBあり | ✅確認済み・問題なし |
| 4 | 2026-04-24 | SOC | Secrets of Strixhaven Commander | 211 | 0 | 生成DBあり | ✅確認済み・問題なし |
| 5 | 2026-04-24 | SOS | Secrets of Strixhaven | 236 | 0 | 生成DBあり | ✅確認済み・問題なし |
| 6 | 2026-03-06 | PZA | Teenage Mutant Ninja Turtles Source Material | 18 | 0 | 生成DBあり | ✅確認済み・問題なし |
| 7 | 2026-03-06 | TMC | Teenage Mutant Ninja Turtles Eternal | 62 | 0 | 生成DBあり | ✅確認済み・問題なし |
| 8 | 2026-03-06 | TMT | Teenage Mutant Ninja Turtles | 194 | 0 | 生成DBあり | ✅確認済み・問題なし |
| 9 | 2026-01-23 | ECC | Lorwyn Eclipsed Commander | 125 | 0 | 生成DBあり | ✅確認済み・問題なし |
| 10 | 2026-01-23 | ECL | Lorwyn Eclipsed | 263 | 0 | 生成DBあり | ✅確認済み・問題なし |
| 11 | 2026-01-01 | PW26 | Wizards Play Network 2026 | 1 | 0 | 生成DBあり | ✅確認済み・問題なし |
| 12 | 2025-11-21 | TLA | Avatar: The Last Airbender | 279 | 15 | 補完あり | ✅修正済み・ID補完済み |
| 13 | 2025-11-21 | TLE | Avatar: The Last Airbender Eternal | 210 | 0 | 生成DBあり | ✅確認済み・問題なし |
| 14 | 2025-09-26 | MAR | Marvel Universe | 32 | 0 | 生成DBあり | ⏳未確認 |
| 15 | 2025-09-26 | SPE | Marvel's Spider-Man Eternal | 26 | 0 | 生成DBあり | ⏳未確認 |
| 16 | 2025-09-26 | SPM | Marvel's Spider-Man | 181 | 0 | 生成DBあり | ⏳未確認 |
| 17 | 2025-08-01 | EOC | Edge of Eternities Commander | 131 | 0 | 生成DBあり | ⏳未確認 |
| 18 | 2025-08-01 | EOE | Edge of Eternities | 260 | 0 | 生成DBあり | ⏳未確認 |
| 19 | 2025-06-13 | FCA | Final Fantasy: Through the Ages | 54 | 0 | 生成DBあり | ⏳未確認 |
| 20 | 2025-06-13 | FIC | Final Fantasy Commander | 209 | 0 | 生成DBあり | ⏳未確認 |

凡例：

- ✅確認済み・問題なし：カード別監査で基本項目の欠落なし。代表検索も確認済み
- ✅修正済み・ID補完済み：問題を検出し、補完DBを修正済み
- ⏳未確認：生成DBには存在するが、まだカード別監査・検索テスト未実施

最新の進捗表は、次のコマンドで再作成できます。

```powershell
cd C:\Users\xsq11\DDM\mtg-pocket
node scripts\audit-search-db-sets.mjs
```

出力先は以下です。

```text
exports\set-db-progress.csv
```

## カード別に問題を洗い出す

セット単位で、日本語名・英語名・Scryfall ID・Oracle IDなどの欠落を確認できます。

```powershell
cd C:\Users\xsq11\DDM\mtg-pocket
node scripts\audit-search-db-cards.mjs --sets MSH,MSC --out exports\audit-2026-06-marvel-issues.csv
```

問題がある行だけCSVに出力されます。  
全カードを出力したい場合は `--all` を付けます。

```powershell
node scripts\audit-search-db-cards.mjs --sets MSH,MSC --all --out exports\audit-2026-06-marvel-all.csv
```

## セット単位でCSVを出力する

最新セットだけ確認する場合は、`--sets` を使います。

例：Marvel Super Heroes 系を確認する場合

```powershell
node scripts\export-search-db-csv.mjs --source all --sets MSH,MSC --out exports\latest-2026-06-marvel-db.csv
```

例：Secrets of Strixhaven 系を確認する場合

```powershell
node scripts\export-search-db-csv.mjs --source all --sets SOS,SOA,SOC --out exports\latest-2026-04-strixhaven-db.csv
```

例：Teenage Mutant Ninja Turtles 系を確認する場合

```powershell
node scripts\export-search-db-csv.mjs --source all --sets TMT,TMC,PZA --out exports\latest-2026-03-tmnt-db.csv
```

## 補完が必要になりやすいポイント

次のカードは、補完DBで対応する可能性が高いです。

- ScryfallやMTGJSONでは日本語名が拾えないカード
- 公式カードギャラリーにはあるが、生成DBに反映されていないカード
- 日本語名の一部で検索できないカード
- 両面カードで裏面名が検索できないカード
- 日本語画像URLが取得できないカード
- 表記ゆれがあるカード

## 作業時の注意

MTGJSON生成DBの行をそのまま補完DBに丸ごと取り込む必要はありません。

Excelで確認して、補完したい行だけ `source` を `manual` または `csv` に変更してから取り込みます。

取り込み前には必ず `--dry-run` を実行します。

```powershell
node scripts\import-search-db-csv.mjs --in exports\latest-2026-06-marvel-db.csv --dry-run
```

問題なければ取り込みます。

```powershell
node scripts\import-search-db-csv.mjs --in exports\latest-2026-06-marvel-db.csv
```

## 2026-06 Marvel Super Heroes 系の初回確認結果

対象セット：

- `MSH`：Marvel Super Heroes
- `MSC`：Marvel Super Heroes Commander

確認結果：

| 項目 | 結果 |
| --- | ---: |
| 対象カード | 519件 |
| 基本項目の問題 | 0件 |
| Oracle ID欠落 | 0件 |
| Scryfall ID欠落 | 0件 |

代表検索テスト：

| 検索語 | 結果 |
| --- | --- |
| `エージェント13` | ヒットあり |
| `アボミネーション` | ヒットあり |
| `アークリアクター` | ヒットあり |
| `A.I.M. Scientists` | ヒットあり |
| `Abomination` | ヒットあり |
| `Arc Reactor` | ヒットあり |

現時点では、MSH/MSCについて補完DBへ追加必須の欠落は見つかっていません。

## 2026-04 Secrets of Strixhaven 系の初回確認結果

対象セット：

- `SOS`：Secrets of Strixhaven
- `SOA`：Secrets of Strixhaven Mystical Archive
- `SOC`：Secrets of Strixhaven Commander

確認結果：

| 項目 | 結果 |
| --- | ---: |
| 対象カード | 510件 |
| 基本項目の問題 | 0件 |
| Oracle ID欠落 | 0件 |
| Scryfall ID欠落 | 0件 |

代表検索テスト：

| 検索語 | 結果 |
| --- | --- |
| `異形のマナワーム` | ヒットあり |
| `白日の下に` | ヒットあり |
| `Aberrant Manawurm` | ヒットあり |
| `Bring to Light` | ヒットあり |

現時点では、SOS/SOA/SOCについて補完DBへ追加必須の欠落は見つかっていません。

## 2026-03 Teenage Mutant Ninja Turtles 系の初回確認結果

対象セット：

- `TMT`：Teenage Mutant Ninja Turtles
- `TMC`：Teenage Mutant Ninja Turtles Eternal
- `PZA`：Teenage Mutant Ninja Turtles Source Material

確認結果：

| 項目 | 結果 |
| --- | ---: |
| 対象カード | 274件 |
| 基本項目の問題 | 0件 |
| Oracle ID欠落 | 0件 |
| Scryfall ID欠落 | 0件 |

現時点では、TMT/TMC/PZAについて補完DBへ追加必須の欠落は見つかっていません。

## 2026-01 Lorwyn Eclipsed 系の初回確認結果

対象セット：

- `ECL`：Lorwyn Eclipsed
- `ECC`：Lorwyn Eclipsed Commander

確認結果：

| 項目 | 結果 |
| --- | ---: |
| 対象カード | 388件 |
| 基本項目の問題 | 0件 |
| Oracle ID欠落 | 0件 |
| Scryfall ID欠落 | 0件 |

代表検索テスト：

| 検索語 | 結果 |
| --- | --- |
| `口達者な一年生` | ヒットあり |
| `アビゲール` | ヒットあり |
| `ブリジッド` | ヒットあり |
| `Abigale` | ヒットあり |
| `Brigid` | ヒットあり |

現時点では、ECL/ECCについて補完DBへ追加必須の欠落は見つかっていません。

## 2026-01 Wizards Play Network 2026 の初回確認結果

対象セット：

- `PW26`：Wizards Play Network 2026

確認結果：

| 項目 | 結果 |
| --- | ---: |
| 対象カード | 1件 |
| 基本項目の問題 | 0件 |
| Oracle ID欠落 | 0件 |
| Scryfall ID欠落 | 0件 |

## 2025-11 Avatar 系の再確認結果

対象セット：

- `TLA`：Avatar: The Last Airbender
- `TLE`：Avatar: The Last Airbender Eternal

確認結果：

| 項目 | 結果 |
| --- | ---: |
| 対象カード | 504件 |
| 初回監査時の問題 | 15件 |
| ID補完後の問題 | 0件 |

対応内容：

- 補完DB `mtg-jp-card-index.js` に入っていた公式カードギャラリー由来の15件へ、生成DBから `oracleId` / `scryfallId` / `releasedAt` / `setName` を補完
- 補完後、生成DB行と補完DB行が同一カードとして重複排除されるようになった
- セット別CSV `latest-2025-11-avatar-db.csv` は504件から489件に整理

更新前バックアップ：

```text
C:\Users\xsq11\DDM\mtg-pocket-backups\20260730-005017-manual-index-enrich\mtg-jp-card-index.js
```
