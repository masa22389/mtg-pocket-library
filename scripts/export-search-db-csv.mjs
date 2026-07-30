#!/usr/bin/env node

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { CSV_COLUMNS, entryKey, entryToCsvRow, loadWindowArray, toCsv } from "./db-csv-utils.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_DIR = path.resolve(__dirname, "..");
const DEFAULT_OUT = path.join(PROJECT_DIR, "exports", "search-db.csv");

function usage() {
  console.log(`
MTG Pocket Library 検索DB CSV出力

使い方:
  node scripts/export-search-db-csv.mjs
  node scripts/export-search-db-csv.mjs --out C:\\path\\to\\search-db.csv

オプション:
  --source all|manual|mtgjson  出力対象。省略時は all
  --sets <codes>                セット略号で絞り込み。例: MSH,MSC
  --out <file>                 出力先CSV
  --help                       このヘルプを表示します
`);
}

function parseArgs(argv) {
  const args = { source: "all", out: DEFAULT_OUT, sets: [] };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--help" || arg === "-h") args.help = true;
    else if (arg === "--source") args.source = argv[++i];
    else if (arg === "--sets") args.sets = String(argv[++i] || "").split(",").map(code => code.trim().toUpperCase()).filter(Boolean);
    else if (arg === "--out") args.out = path.resolve(argv[++i]);
    else throw new Error(`未知のオプションです: ${arg}`);
  }
  return args;
}

async function loadEntries(source) {
  const manual = source === "all" || source === "manual"
    ? await loadWindowArray(path.join(PROJECT_DIR, "mtg-jp-card-index.js"), "MTG_JP_CARD_INDEX")
    : [];
  const mtgjson = source === "all" || source === "mtgjson"
    ? await loadWindowArray(path.join(PROJECT_DIR, "mtgjson-jp-search-index.js"), "MTGJSON_JP_SEARCH_INDEX")
    : [];
  const entries = [...manual, ...mtgjson];
  const deduped = new Map();
  for (const entry of entries) {
    const key = entryKey(entry) || `${deduped.size}`;
    if (!deduped.has(key)) deduped.set(key, entry);
  }
  return [...deduped.values()];
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    usage();
    return;
  }
  if (!["all", "manual", "mtgjson"].includes(args.source)) throw new Error("--source は all/manual/mtgjson のいずれかです");

  const entries = await loadEntries(args.source);
  const filteredEntries = args.sets.length
    ? entries.filter(entry => args.sets.includes(String(entry.setCode || "").toUpperCase()))
    : entries;
  const rows = filteredEntries.map(entryToCsvRow);
  await mkdir(path.dirname(args.out), { recursive: true });
  await writeFile(args.out, "\uFEFF" + toCsv(rows, CSV_COLUMNS), "utf8");
  console.log(`CSVを出力しました: ${args.out}`);
  if (args.sets.length) console.log(`セット絞り込み: ${args.sets.join(", ")}`);
  console.log(`件数: ${rows.length.toLocaleString("ja-JP")}件`);
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
