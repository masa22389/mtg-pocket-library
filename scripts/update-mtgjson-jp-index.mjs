#!/usr/bin/env node

import { copyFile, mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_DIR = path.resolve(__dirname, "..");
const MTGJSON_BASE = "https://mtgjson.com/api/v5";
const DEFAULT_SOURCE = "mtgjson-sets";
const DEFAULT_OUT = path.join(PROJECT_DIR, "mtgjson-jp-search-index.js");
const DEFAULT_BACKUP_DIR = path.join(PROJECT_DIR, "..", "mtg-pocket-backups");

function usage() {
  console.log(`
MTG Pocket Library 日本語検索DB更新

使い方:
  node scripts/update-mtgjson-jp-index.mjs
  node scripts/update-mtgjson-jp-index.mjs --source C:\\path\\to\\AllPrintings.json
  node scripts/update-mtgjson-jp-index.mjs --dry-run

オプション:
  --source <url|file>  入力元。省略時は MTGJSON の各セットJSONを順次取得します
  --out <file>         出力先。省略時は mtgjson-jp-search-index.js
  --dry-run            ファイルを書き換えず、件数だけ確認します
  --sets <codes>       取得するセット略号をカンマ区切りで制限します。例: --sets MH3,FIN,TLA
  --no-backup          更新前バックアップを作りません
  --help               このヘルプを表示します
`);
}

function parseArgs(argv) {
  const args = {
    source: DEFAULT_SOURCE,
    out: DEFAULT_OUT,
    dryRun: false,
    backup: true,
    sets: "",
  };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--help" || arg === "-h") args.help = true;
    else if (arg === "--dry-run") args.dryRun = true;
    else if (arg === "--no-backup") args.backup = false;
    else if (arg === "--source") args.source = argv[++i];
    else if (arg === "--out") args.out = path.resolve(argv[++i]);
    else if (arg === "--sets") args.sets = argv[++i];
    else throw new Error(`未知のオプションです: ${arg}`);
  }
  return args;
}

function normalizeName(value) {
  return String(value || "").normalize("NFKC").trim().toLocaleLowerCase("ja");
}

function addUnique(target, values) {
  for (const value of values.filter(Boolean)) {
    if (!target.some(existing => normalizeName(existing) === normalizeName(value))) target.push(value);
  }
}

function cardJapaneseNames(card) {
  return (card.foreignData || [])
    .filter(data => data.language === "Japanese" && data.name)
    .map(data => data.name);
}

function bestScryfallId(card) {
  return card.identifiers?.scryfallId
    || card.identifiers?.scryfallIllustrationId
    || card.foreignData?.find(data => data.language === "Japanese")?.identifiers?.scryfallId
    || "";
}

function oracleId(card) {
  return card.identifiers?.scryfallOracleId || card.identifiers?.scryfallOracleIdBack || "";
}

function mergeIndexEntry(map, setCode, setName, releaseDate, card) {
  const jaNames = cardJapaneseNames(card);
  if (!jaNames.length || !card.name) return;

  const key = oracleId(card) || `name:${normalizeName(card.name)}`;
  const existing = map.get(key) || {
    source: "mtgjson",
    jaNames: [],
    enNames: [],
    scryfallName: card.name,
    oracleId: oracleId(card),
    scryfallId: bestScryfallId(card),
    setCode,
    setName,
    collectorNumber: card.number || "",
    releasedAt: releaseDate || "",
  };

  addUnique(existing.jaNames, jaNames);
  addUnique(existing.enNames, [card.name, ...(card.faceName ? [card.faceName] : [])]);
  if (!existing.scryfallName && card.name) existing.scryfallName = card.name;
  if (!existing.oracleId && oracleId(card)) existing.oracleId = oracleId(card);

  const nextDate = releaseDate || "";
  if (!existing.scryfallId || String(nextDate).localeCompare(String(existing.releasedAt || "")) > 0) {
    existing.scryfallId = bestScryfallId(card) || existing.scryfallId;
    existing.setCode = setCode || existing.setCode;
    existing.setName = setName || existing.setName;
    existing.collectorNumber = card.number || existing.collectorNumber;
    existing.releasedAt = nextDate || existing.releasedAt;
  }

  map.set(key, existing);
}

function processSetData(byCard, setCode, setData) {
  const cards = Array.isArray(setData.cards) ? setData.cards : [];
  for (const card of cards) {
    mergeIndexEntry(byCard, setCode, setData.name || "", setData.releaseDate || "", card);
  }
}

function finalizeIndex(byCard) {
  return [...byCard.values()]
    .map(item => ({
      source: item.source,
      jaNames: item.jaNames.sort((a, b) => a.localeCompare(b, "ja")),
      enNames: item.enNames.sort((a, b) => a.localeCompare(b, "en")),
      scryfallName: item.scryfallName,
      oracleId: item.oracleId,
      scryfallId: item.scryfallId,
      setCode: item.setCode,
      setName: item.setName,
      collectorNumber: item.collectorNumber,
      releasedAt: item.releasedAt,
    }))
    .filter(item => item.jaNames.length && item.enNames.length)
    .sort((a, b) => a.scryfallName.localeCompare(b.scryfallName, "en"));
}

function buildIndex(allPrintings) {
  const sets = allPrintings?.data;
  if (!sets || typeof sets !== "object") throw new Error("MTGJSON AllPrintings の形式を認識できませんでした");
  const byCard = new Map();
  for (const [setCode, setData] of Object.entries(sets)) {
    processSetData(byCard, setCode, setData);
  }
  return finalizeIndex(byCard);
}

async function fetchJson(url) {
  const response = await fetch(url, { headers: { Accept: "application/json" } });
  if (!response.ok) throw new Error(`取得に失敗しました: HTTP ${response.status} ${url}`);
  return response.json();
}

async function buildIndexFromMtgJsonSets(onlySets = "") {
  console.log("MTGJSONのセット一覧を取得中...");
  const setList = await fetchJson(`${MTGJSON_BASE}/SetList.json`);
  const requested = new Set(String(onlySets || "").split(",").map(value => value.trim().toUpperCase()).filter(Boolean));
  const sets = (setList.data || [])
    .filter(set => set.code && (!requested.size || requested.has(String(set.code).toUpperCase())))
    .sort((a, b) => String(a.releaseDate || "").localeCompare(String(b.releaseDate || "")));
  if (!sets.length) throw new Error("処理対象のセットがありません");

  const byCard = new Map();
  for (let index = 0; index < sets.length; index += 1) {
    const set = sets[index];
    const code = String(set.code).toUpperCase();
    process.stdout.write(`\rセット取得中 ${index + 1}/${sets.length}: ${code}        `);
    try {
      const setJson = await fetchJson(`${MTGJSON_BASE}/${encodeURIComponent(code)}.json`);
      processSetData(byCard, code, setJson.data || {});
    } catch (error) {
      process.stdout.write("\n");
      console.warn(`警告: ${code} の取得をスキップしました: ${error.message}`);
    }
  }
  process.stdout.write("\n");
  return finalizeIndex(byCard);
}

async function loadSource(source, onlySets = "") {
  if (source === "mtgjson-sets") return buildIndexFromMtgJsonSets(onlySets);
  if (/^https?:\/\//i.test(source)) {
    console.log(`MTGJSONを取得中: ${source}`);
    return buildIndex(await fetchJson(source));
  }
  const filePath = path.resolve(source);
  console.log(`ローカルJSONを読み込み中: ${filePath}`);
  return buildIndex(JSON.parse(await readFile(filePath, "utf8")));
}

async function backupCurrent(outFile) {
  if (!existsSync(outFile)) return "";
  const stamp = new Date().toISOString().replaceAll(/[-:]/g, "").replace(/\..+$/, "").replace("T", "-");
  const destDir = path.join(DEFAULT_BACKUP_DIR, `${stamp}-db-update`);
  await mkdir(destDir, { recursive: true });
  const dest = path.join(destDir, path.basename(outFile));
  await copyFile(outFile, dest);
  return dest;
}

async function writeIndex(outFile, index) {
  const body = `window.MTGJSON_JP_SEARCH_INDEX = ${JSON.stringify(index)};\n`;
  const tempFile = `${outFile}.tmp`;
  await writeFile(tempFile, body, "utf8");
  await rename(tempFile, outFile);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    usage();
    return;
  }

  const index = await loadSource(args.source, args.sets);
  const jaNameCount = index.reduce((sum, item) => sum + item.jaNames.length, 0);
  console.log(`生成結果: ${index.length.toLocaleString("ja-JP")}カード / 日本語名 ${jaNameCount.toLocaleString("ja-JP")}件`);

  if (args.dryRun) {
    console.log("dry-run のためファイルは更新していません");
    return;
  }

  if (args.backup) {
    const backup = await backupCurrent(args.out);
    if (backup) console.log(`更新前バックアップ: ${backup}`);
  }

  await writeIndex(args.out, index);
  console.log(`更新しました: ${args.out}`);
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
