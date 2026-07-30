# DB対応進捗サマリー

最終更新: 2026-07-30  
現在のアプリ反映版: v109

## 方針

- 生成DB（MTGJSON由来）を基本DBとして使う
- 生成DBで日本語名・ID・両面情報などが不足するカードだけ、補完DB（`mtg-jp-card-index.js`）で補う
- セットごとに監査CSVを出力し、問題0件になったものを「確認済み」とする
- DB更新後はAndroid側へ確実に反映されるよう、アプリバージョンを上げる

## 確認済みセット

| 状態 | セット | 内容 | 監査結果 |
| --- | --- | --- | --- |
| 確認済み | MSC / MSH | Marvel Super Heroes系 | 問題なし |
| 確認済み | SOA / SOC / SOS | Secrets of Strixhaven系 | 問題なし |
| 確認済み | PZA / TMC / TMT | Teenage Mutant Ninja Turtles系 | 問題なし |
| 確認済み | ECC / ECL | Lorwyn Eclipsed系 | 問題なし |
| 確認済み | PW26 | Wizards Play Network 2026 | 問題なし |
| 補完済み | TLA / TLE | Avatar系 | TLAの一部を補完済み |
| 確認済み | MAR / SPE / SPM | Marvel's Spider-Man系 | 問題なし |
| 確認済み | EOC / EOE | Edge of Eternities系 | 問題なし |
| 補完済み | FCA / FIC / FIN | Final Fantasy系 | 6件補完後、問題なし |
| 確認済み | TDC / TDM | Tarkir: Dragonstorm系 | 問題なし |
| 確認済み | DFT / DRC | Aetherdrift系 | 問題なし |
| 確認済み | FDN / J25 | Foundations系 | 問題なし |
| 補完済み | DSK / DSC | Duskmourn系 | DSCの5件を補完後、問題なし |
| 確認済み | BLB / BLC | Bloomburrow系 | 問題なし |
| 補完済み | MH3 / M3C | Modern Horizons 3系 | ID補完後、問題なし |
| 確認済み | OTJ / OTC | Outlaws of Thunder Junction系 | 問題なし |
| 確認済み | MKM / MKC | Murders at Karlov Manor系 | 問題なし |
| 補完済み | LCI / LCC | Lost Caverns of Ixalan系 | 4件補完後、問題なし |
| 確認済み | WOE / WOC | Wilds of Eldraine系 | 問題なし |
| 確認済み | MOM / MOC / MAT | March of the Machine系 | 問題なし |
| 確認済み | ONE / ONC | Phyrexia: All Will Be One系 | 問題なし |
| 確認済み | BRO / BRC | The Brothers' War系 | 問題なし |
| 補完済み | DMU / DMC | Dominaria United系 | 8件補完後、問題なし |
| 補完済み | SNC / NCC | Streets of New Capenna系 | 1件補完後、問題なし |
| 補完済み | NEO / NEC | Kamigawa: Neon Dynasty系 | 1件補完後、問題なし |
| 確認済み | VOW / VOC | Innistrad: Crimson Vow系 | 問題なし |
| 確認済み | MID / MIC | Innistrad: Midnight Hunt系 | 問題なし |
| 補完済み | AFR / AFC | Adventures in the Forgotten Realms系 | 1件補完後、問題なし |
| 確認済み | STX / C21 / STA | Strixhaven系 | 問題なし |
| 確認済み | KHM / KHC | Kaldheim系 | 問題なし |
| 確認済み | ZNR / ZNC | Zendikar Rising系 | 問題なし |
| 確認済み | M21 / JMP | Core Set 2021 / Jumpstart系 | 問題なし |
| 確認済み | IKO / C20 | Ikoria系 | 問題なし |
| 確認済み | THB | Theros Beyond Death | 問題なし |
| 確認済み | ELD | Throne of Eldraine | 問題なし |
| 確認済み | M20 | Core Set 2020 | 問題なし |
| 確認済み | WAR | War of the Spark | 問題なし |
| 確認済み | RNA | Ravnica Allegiance | 問題なし |
| 確認済み | GRN | Guilds of Ravnica | 問題なし |
| 確認済み | DOM | Dominaria | 問題なし |
| 確認済み | RIX / XLN | Ixalanブロック | 問題なし |
| 確認済み | HOU / AKH | Amonkhetブロック | 問題なし |
| 確認済み | AER / KLD | Kaladeshブロック | 問題なし |
| 確認済み | SOI / EMN | Shadows over Innistradブロック | 問題なし |
| 確認済み | BFZ / OGW | Battle for Zendikarブロック | 問題なし |
| 確認済み | ORI | Magic Origins | 問題なし |
| 確認済み | DTK / FRF / KTK | Tarkirブロック | 問題なし |
| 確認済み | M15 | Magic 2015 | 問題なし |
| 確認済み | JOU / BNG / THS | Therosブロック | 問題なし |
| 確認済み | M14 | Magic 2014 | 問題なし |
| 確認済み | DGM / GTC / RTR | Return to Ravnicaブロック | 問題なし |
| 確認済み | AVR / DKA / ISD | Innistradブロック | 問題なし |
| 確認済み | M13 | Magic 2013 | 問題なし |
| 確認済み | NPH / MBS / SOM | Scars of Mirrodinブロック | 問題なし |
| 確認済み | ROE / WWK / ZEN | Zendikarブロック | 問題なし |
| 確認済み | M12 | Magic 2012 | 問題なし |
| 確認済み | M11 | Magic 2011 | 問題なし |
| 確認済み | ALA / CON / ARB | Shards of Alaraブロック | 問題なし |
| 確認済み | LRW / MOR / SHM / EVE | Lorwyn / Shadowmoorブロック | 問題なし |
| 確認済み | 10E | Tenth Edition | 問題なし |
| 確認済み | TSP / PLC / FUT | Time Spiralブロック | 問題なし |
| 確認済み | CSP | Coldsnap | 問題なし |
| 補完済み | RAV / GPT / DIS | Ravnicaブロック | DISの8件を補完後、問題なし |
| 確認済み | 9ED | Ninth Edition | 問題なし |
| 確認済み | SOK / BOK / CHK | Kamigawaブロック | 問題なし |
| 確認済み | 5DN / DST / MRD | Mirrodinブロック | 問題なし |
| 確認済み | 8ED | Eighth Edition | 問題なし |
| 確認済み | SCG / LGN / ONS | Onslaughtブロック | 問題なし |
| 確認済み | 7ED | Seventh Edition | 問題なし |
| 確認済み | JUD / TOR / ODY | Odysseyブロック | 問題なし |
| 確認済み | APC / PLS / INV | Invasionブロック | 問題なし |
| 補完済み | 6ED | Sixth Edition | 1件補完後、問題なし |
| 補完済み | UDS / ULG / USG | Urzaブロック | 1件補完後、問題なし |
| 確認済み | STH / EXO / TMP | Tempestブロック | 問題なし |
| 確認済み | 5ED | Fifth Edition | 問題なし |
| 確認済み | POR / P02 | Portal系 | 問題なし |
| 確認済み | WTH / VIS / MIR | Mirageブロック | 問題なし |
| 確認済み | 4BB | Fourth Edition Foreign Black Border | 問題なし |
| 確認済み | PTK | Portal Three Kingdoms | 問題なし |
| 確認済み | MMQ / NEM / PCY | Mercadian Masquesブロック | 問題なし |
| 確認済み | M10 | Magic 2010 | 問題なし |
| 補完済み | TSB / TSR | Time Spiral Bonus / Remastered | TSRの3件を補完後、問題なし |
| 補完済み | MH1 / MH2 | Modern Horizons 1・2 | MH2の3件を補完後、問題なし |
| 確認済み | 2X2 / 2XM / UMA / IMA / EMA / A25 / MM3 / MM2 | Masters系 | 問題なし |
| 確認済み | DMR / RVR / CMM / CMR | Remastered / Commander Masters系 | 問題なし |
| 補完済み | LTC / LTR / WHO / PIP / 40K / CLB | Universes Beyond / Commander大型系 | 5件補完・2件例外登録後、問題なし |
| 補完済み | C13 / C14 / C15 / C16 / C17 / C18 / C19 | Commander 2013〜2019 | C16の1件を補完後、問題なし |
| 確認済み | CMD / CN2 / CNS / BBD | Commander / Conspiracy / Battlebond系 | 問題なし |
| 補完済み | SPG / OTP / BIG / MUL / BRR / WOT / ZNE / REX / ACR | Bonus sheet / Special Guests系 | OTPの1件を補完後、問題なし |
| 確認済み | DD2 / DDE / DDF / DDI / DDJ / DDK / DDL / DDM / DDN / DDO / DDP / DDQ / DDR / DDS / DDT / DDU | Duel Decks系 | 問題なし |
| 補完済み | GK1 / GK2 | Guild Kit系 | GK1の1件を補完後、問題なし |
| 確認済み | PC2 / OPC2 / OHOP | Planechase系 | 問題なし |
| 確認済み | J22 / J25 / GN3 / BCHR / CST / UGIN | Jumpstart / Box / Collection系 | 問題なし |
| 確認済み | DCI / W16 / W17 / P30H / PF25 / PJSC / PL21 / PMDA / PWCS / PWWK / PWAR / PLST | 小型プロモ系 | 問題なし |

## 今回 v102 で追加補完したカード

### LCI / LCC

| セット | No. | 英語名 | 補完した日本語名 |
| --- | ---: | --- | --- |
| LCI | 89 | Acolyte of Aclazotz | アクロゾズの侍祭 |
| LCI | 103 | Defossilize | 非化石化 |
| LCI | 106 | Fungal Fortitude | 不屈の菌類 |
| LCI | 259 | Runaway Boulder | 遁走する岩石 |

### DMU / DMC

| セット | No. | 英語名 | 補完した日本語名 |
| --- | ---: | --- | --- |
| DMU | 1 | Karn, Living Legacy | 生けるレガシー、カーン |
| DMU | 7 | Benalish Faithbonder | ベナリアの信仰繋ぎ |
| DMU | 75 | Vodalian Hexcatcher | ヴォーデイリアの呪詛抑え |
| DMU | 77 | Volshe Tideturner | 潮廻しのヴォルシェ |
| DMU | 139 | Molten Monstrosity | 溶鉄の大怪物 |
| DMU | 159 | Deathbloom Gardener | 死花の庭師 |
| DMU | 176 | Scout the Wilderness | 荒野の偵察 |
| DMU | 192 | Ajani, Sleeper Agent | 潜伏工作員、アジャニ |

### SNC / NCC

| セット | No. | 英語名 | 補完した日本語名 |
| --- | ---: | --- | --- |
| NCC | 46 | Indulge // Excess | 放蕩 / 三昧 |

### NEO / NEC

| セット | No. | 英語名 | 補完した日本語名 |
| --- | ---: | --- | --- |
| NEO | 219 | Gloomshrieker | 闇叫び |

### AFR / AFC

| セット | No. | 英語名 | 補完した日本語名 |
| --- | ---: | --- | --- |
| AFR | 346 | Trelasarra, Moon Dancer | 月の踊り手、トレラッサーラ |

### RAV / GPT / DIS

| セット | No. | 英語名 | 補完した日本語名 |
| --- | ---: | --- | --- |
| DIS | 149 | Bound // Determined | 拘束 / 決心 |
| DIS | 151 | Hide // Seek | 隠匿 / 探求 |
| DIS | 152 | Hit // Run | 打撃 / 力走 |
| DIS | 153 | Odds // Ends | 確率 / 結末 |
| DIS | 154 | Pure // Simple | 純粋 / 単純 |
| DIS | 155 | Research // Development | 研究 / 開発 |
| DIS | 156 | Rise // Fall | 隆盛 / 下落 |
| DIS | 157 | Supply // Demand | 供給 / 需要 |

### 6ED / Urzaブロック

| セット | No. | 英語名 | 補完した日本語名 |
| --- | ---: | --- | --- |
| 6ED | 163 | Aether Flash | 上天の閃光 |
| USG | 161 | Tainted Aether | 上天のしみ |

### TSR / MH2 / 特殊セット

| セット | No. | 英語名 | 補完した日本語名 |
| --- | ---: | --- | --- |
| TSR | 156 | Boom // Bust | 爆裂 / 破綻 |
| TSR | 161 | Dead // Gone | 死亡 / 退場 |
| TSR | 186 | Rough // Tumble | 乱暴 / 転落 |
| MH2 | 60 | Said // Done | 任務 / 完了 |
| MH2 | 123 | Fast // Furious | 疾走 / 爆走 |
| MH2 | 376 | Road // Ruin | 路傍 / 瓦解 |
| CLB | 246 | Owlbear Cub | アウルベアの子 |
| LTR | 221 | Rise of the Witch-king | 魔王の台頭 |
| PIP | 222 | Wear // Tear | 摩耗 / 損耗 |
| C16 | 239 | Trial // Error | 試行 / 錯誤 |
| OTP | 39 | Crime // Punishment | 罪 / 罰 |
| GK1 | 45 | Turn // Burn | 変化 / 点火 |

### 監査例外として扱う英字公式名

以下は日本語版でもカード名が英字表記のため、「日本語文字なし」でも問題なしとして扱います。

| セット | No. | カード名 |
| --- | ---: | --- |
| PIP | 50 | V.A.T.S. |
| PIP | 129 | C.A.M.P. |

## 監査結果

### 全生成DB監査

v109で、生成DBに存在する全セット・全カードを一括監査しました。

```text
exports/audit-all-generated-db-after-all-option.csv
```

結果:

- 対象カード: 30,216件
- 問題あり: 0件

あわせて、全件CSVも出力済みです。

```text
exports/latest-all-search-db.csv
```

### 重点セット監査

最新のまとめ監査:

```text
exports/audit-expanded-special-promos-final-issues.csv
```

対象セット:

```text
FDN,J25,DSK,DSC,BLB,BLC,MH3,M3C,OTJ,OTC,MKM,MKC,LCI,LCC,WOE,WOC,MOM,MOC,MAT,ONE,ONC,BRO,BRC,DMU,DMC,SNC,NCC,NEO,NEC,VOW,VOC,MID,MIC,AFR,AFC,STX,C21,STA,KHM,KHC,ZNR,ZNC,M21,JMP,IKO,C20,THB,ELD,M20,WAR,RNA,GRN,DOM,RIX,XLN,HOU,AKH,AER,KLD,SOI,EMN,BFZ,OGW,ORI,DTK,FRF,KTK,M15,JOU,BNG,THS,M14,DGM,GTC,RTR,AVR,DKA,ISD,M13,NPH,MBS,SOM,ROE,WWK,ZEN,M12,M11,ALA,CON,ARB,LRW,MOR,SHM,EVE,10E,TSP,PLC,FUT,CSP,RAV,GPT,DIS,9ED,SOK,BOK,CHK,5DN,DST,MRD,8ED,SCG,LGN,ONS,7ED,JUD,TOR,ODY,APC,PLS,INV,6ED,UDS,ULG,USG,STH,EXO,TMP,5ED,POR,P02,WTH,VIS,MIR,4BB,PTK,MMQ,NEM,PCY,M10,TSB,TSR,MH1,MH2,2X2,2XM,UMA,IMA,EMA,A25,MM3,MM2,DMR,RVR,CMM,CMR,LTC,LTR,WHO,PIP,40K,CLB,C13,C14,C15,C16,C17,C18,C19,CMD,CN2,CNS,BBD,SPG,OTP,BIG,MUL,BRR,WOT,ZNE,REX,ACR,DD2,DDE,DDF,DDI,DDJ,DDK,DDL,DDM,DDN,DDO,DDP,DDQ,DDR,DDS,DDT,DDU,GK1,GK2,PC2,OPC2,OHOP,J22,GN3,BCHR,CST,UGIN,DCI,W16,W17,P30H,PF25,PJSC,PL21,PMDA,PWCS,PWWK,PWAR,PLST
```

結果:

- 対象カード: 25,842件
- 問題あり: 0件

## 出力済みCSV

| 用途 | ファイル |
| --- | --- |
| 全生成DB監査 | `exports/audit-all-generated-db-after-all-option.csv` |
| 全検索DB | `exports/latest-all-search-db.csv` |
| まとめ監査 | `exports/audit-expanded-special-promos-final-issues.csv` |
| Outlaws of Thunder Junction系DB | `exports/latest-2024-04-outlaws-thunder-junction-db.csv` |
| Murders at Karlov Manor系DB | `exports/latest-2024-02-murders-karlov-db.csv` |
| Lost Caverns of Ixalan系DB | `exports/latest-2023-11-lost-caverns-ixalan-db.csv` |
| Wilds of Eldraine系DB | `exports/latest-2023-09-wilds-eldraine-db.csv` |
| March of the Machine系DB | `exports/latest-2023-04-march-machine-db.csv` |
| Phyrexia: All Will Be One系DB | `exports/latest-2023-02-all-will-be-one-db.csv` |
| The Brothers' War系DB | `exports/latest-2022-11-brothers-war-db.csv` |
| Dominaria United系DB | `exports/latest-2022-09-dominaria-united-db.csv` |
| Streets of New Capenna系DB | `exports/latest-2022-04-new-capenna-db.csv` |
| Kamigawa: Neon Dynasty系DB | `exports/latest-2022-02-kamigawa-neon-dynasty-db.csv` |
| Innistrad: Crimson Vow系DB | `exports/latest-2021-11-crimson-vow-db.csv` |
| Innistrad: Midnight Hunt系DB | `exports/latest-2021-09-midnight-hunt-db.csv` |
| Forgotten Realms系DB | `exports/latest-2021-07-forgotten-realms-db.csv` |
| Strixhaven系DB | `exports/latest-2021-04-strixhaven-db.csv` |
| Kaldheim系DB | `exports/latest-2021-02-kaldheim-db.csv` |
| Zendikar Rising系DB | `exports/latest-2020-09-zendikar-rising-db.csv` |
| Core Set 2021 / Jumpstart系DB | `exports/latest-2020-07-core-2021-jumpstart-db.csv` |
| Ikoria系DB | `exports/latest-2020-04-ikoria-db.csv` |
| Theros Beyond Death DB | `exports/latest-2020-01-theros-beyond-death-db.csv` |
| Throne of Eldraine DB | `exports/latest-2019-10-throne-eldraine-db.csv` |
| Core Set 2020 DB | `exports/latest-2019-07-core-2020-db.csv` |
| War of the Spark DB | `exports/latest-2019-05-war-spark-db.csv` |
| Ravnica Allegiance DB | `exports/latest-2019-01-ravnica-allegiance-db.csv` |
| Guilds of Ravnica DB | `exports/latest-2018-10-guilds-ravnica-db.csv` |
| Dominaria DB | `exports/latest-2018-04-dominaria-db.csv` |
| IxalanブロックDB | `exports/latest-2017-2018-ixalan-block-db.csv` |
| AmonkhetブロックDB | `exports/latest-2017-amonkhet-block-db.csv` |
| KaladeshブロックDB | `exports/latest-2016-2017-kaladesh-block-db.csv` |
| Shadows over InnistradブロックDB | `exports/latest-2016-shadows-eldritch-moon-db.csv` |
| Battle for ZendikarブロックDB | `exports/latest-2015-2016-battle-zendikar-block-db.csv` |
| Magic Origins DB | `exports/latest-2015-magic-origins-db.csv` |
| TarkirブロックDB | `exports/latest-2014-2015-tarkir-block-db.csv` |
| Magic 2015 DB | `exports/latest-2014-magic-2015-db.csv` |
| TherosブロックDB | `exports/latest-2013-2014-theros-block-db.csv` |
| Magic 2014 DB | `exports/latest-2013-magic-2014-db.csv` |
| Return to RavnicaブロックDB | `exports/latest-2012-2013-return-ravnica-block-db.csv` |
| InnistradブロックDB | `exports/latest-2011-2012-innistrad-block-db.csv` |
| Magic 2013 DB | `exports/latest-2012-magic-2013-db.csv` |
| Scars of MirrodinブロックDB | `exports/latest-2010-2011-scars-mirrodin-block-db.csv` |
| ZendikarブロックDB | `exports/latest-2009-2010-zendikar-block-db.csv` |
| Magic 2012 DB | `exports/latest-2011-magic-2012-db.csv` |
| Magic 2011 DB | `exports/latest-2010-magic-2011-db.csv` |
| Shards of AlaraブロックDB | `exports/latest-2008-2009-shards-alara-block-db.csv` |
| Lorwyn / ShadowmoorブロックDB | `exports/latest-2007-2008-lorwyn-shadowmoor-block-db.csv` |
| Tenth Edition DB | `exports/latest-2007-tenth-edition-db.csv` |
| Time SpiralブロックDB | `exports/latest-2006-2007-time-spiral-block-db.csv` |
| Coldsnap DB | `exports/latest-2006-coldsnap-db.csv` |
| RavnicaブロックDB | `exports/latest-2005-2006-ravnica-block-db.csv` |
| Ninth Edition DB | `exports/latest-2005-ninth-edition-db.csv` |
| KamigawaブロックDB | `exports/latest-2004-2005-kamigawa-block-db.csv` |
| MirrodinブロックDB | `exports/latest-2003-2004-mirrodin-block-db.csv` |
| Eighth Edition DB | `exports/latest-2003-eighth-edition-db.csv` |
| OnslaughtブロックDB | `exports/latest-2002-2003-onslaught-block-db.csv` |
| Seventh Edition DB | `exports/latest-2001-seventh-edition-db.csv` |
| OdysseyブロックDB | `exports/latest-2001-2002-odyssey-block-db.csv` |
| InvasionブロックDB | `exports/latest-2000-2001-invasion-block-db.csv` |
| Sixth Edition DB | `exports/latest-1999-sixth-edition-db.csv` |
| UrzaブロックDB | `exports/latest-1998-1999-urza-block-db.csv` |
| TempestブロックDB | `exports/latest-1997-1998-tempest-block-db.csv` |
| Fifth Edition DB | `exports/latest-1997-fifth-edition-db.csv` |
| Portal系DB | `exports/latest-1997-1998-portal-db.csv` |
| MirageブロックDB | `exports/latest-1996-1997-mirage-block-db.csv` |
| Fourth Edition Foreign Black Border DB | `exports/latest-1995-fourth-edition-black-border-db.csv` |
| Portal Three Kingdoms DB | `exports/latest-1999-portal-three-kingdoms-db.csv` |
| Mercadian MasquesブロックDB | `exports/latest-1999-2000-masques-block-db.csv` |
| Magic 2010 DB | `exports/latest-2009-magic-2010-db.csv` |
| Time Spiral Bonus / Remastered DB | `exports/latest-time-spiral-bonus-remastered-db.csv` |
| Modern Horizons 1・2 DB | `exports/latest-modern-horizons-1-2-db.csv` |
| Masters系DB | `exports/latest-masters-sets-db.csv` |
| Remastered / Commander Masters系DB | `exports/latest-remastered-commander-masters-db.csv` |
| Universes Beyond / Commander大型系DB | `exports/latest-universes-commander-large-db.csv` |
| Commander 2013〜2019 DB | `exports/latest-commander-2013-2019-db.csv` |
| Commander / Conspiracy / Battlebond系DB | `exports/latest-commander-conspiracy-battlebond-db.csv` |
| Bonus sheet / Special Guests系DB | `exports/latest-bonus-special-guests-db.csv` |
| Duel Decks系DB | `exports/latest-duel-decks-db.csv` |
| Guild Kit系DB | `exports/latest-guild-kits-db.csv` |
| Planechase系DB | `exports/latest-planechase-db.csv` |
| Jumpstart / Box / Collection系DB | `exports/latest-jumpstart-box-collection-db.csv` |
| 小型プロモ系DB | `exports/latest-promo-small-db.csv` |
| Universes Beyond再確認DB | `exports/latest-universes-beyond-repeat-db.csv` |
| 高利用再録・Modern系DB | `exports/latest-high-use-reprint-modern-db.csv` |

## 次に進める候補

次回は以下のどれかから進めるとよさそうです。

1. ALL / ICE / HML: アイスエイジ・ブロック（現状は生成DBの対象0件のため要方針確認）
2. 日本語画像優先表示の改善
3. 検索結果で英語版が先に出るケースの改善
4. 全件監査を定期的に実行する運用整理
