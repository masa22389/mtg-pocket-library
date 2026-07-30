#!/usr/bin/env node

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { csvEscape, loadWindowArray } from "./db-csv-utils.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_DIR = path.resolve(__dirname, "..");
const DEFAULT_OUT = path.join(PROJECT_DIR, "exports", "set-db-progress.csv");

const OUTPUT_COLUMNS = [
  "releasedAt",
  "setCode",
  "setName",
  "generatedCount",
  "manualCount",
  "totalCount",
  "status",
];

function usage() {
  console.log(`
MTG Pocket Library セット別DB進捗確認

使い方:
  node scripts/audit-search-db-sets.mjs
  node scripts/audit-search-db-sets.mjs --limit 30

オプション:
  --out <file>   出力先CSV。省略時は exports\\set-db-progress.csv
  --limit <num>  コンソールに表示する最新セット数。省略時は 30
  --help         このヘルプを表示します
`);
}

function parseArgs(argv) {
  const args = { out: DEFAULT_OUT, limit: 30 };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--help" || arg === "-h") args.help = true;
    else if (arg === "--out") args.out = path.resolve(argv[++i]);
    else if (arg === "--limit") args.limit = Number(argv[++i] || 30);
    else throw new Error(`未知のオプションです: ${arg}`);
  }
  return args;
}

function addEntry(map, entry, kind) {
  const setCode = String(entry.setCode || "").trim().toUpperCase();
  if (!setCode) return;
  const current = map.get(setCode) || {
    releasedAt: "",
    setCode,
    setName: "",
    generatedCount: 0,
    manualCount: 0,
  };
  if (entry.releasedAt && (!current.releasedAt || entry.releasedAt > current.releasedAt)) {
    current.releasedAt = entry.releasedAt;
  }
  if (entry.setName && !current.setName) current.setName = entry.setName;
  if (entry.setNameJa && !current.setName) current.setName = entry.setNameJa;
  if (kind === "generated") current.generatedCount += 1;
  else current.manualCount += 1;
  map.set(setCode, current);
}

function toProgressRows(manualEntries, generatedEntries) {
  const bySet = new Map();
  for (const entry of generatedEntries) addEntry(bySet, entry, "generated");
  for (const entry of manualEntries) addEntry(bySet, entry, "manual");

  return [...bySet.values()]
    .map(row => {
      const totalCount = row.generatedCount + row.manualCount;
      const status = row.manualCount > 0
        ? "補完あり"
        : row.generatedCount > 0
          ? "生成DBあり"
          : "未対応";
      return { ...row, totalCount, status };
    })
    .sort((a, b) => {
      const byDate = String(b.releasedAt || "").localeCompare(String(a.releasedAt || ""));
      if (byDate) return byDate;
      return String(a.setCode).localeCompare(String(b.setCode));
    });
}

function toCsv(rows) {
  return [
    OUTPUT_COLUMNS.map(csvEscape).join(","),
    ...rows.map(row => OUTPUT_COLUMNS.map(column => csvEscape(row[column])).join(",")),
  ].join("\r\n") + "\r\n";
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    usage();
    return;
  }

  const manualEntries = await loadWindowArray(path.join(PROJECT_DIR, "mtg-jp-card-index.js"), "MTG_JP_CARD_INDEX");
  const generatedEntries = await loadWindowArray(path.join(PROJECT_DIR, "mtgjson-jp-search-index.js"), "MTGJSON_JP_SEARCH_INDEX");
  const rows = toProgressRows(manualEntries, generatedEntries);

  await mkdir(path.dirname(args.out), { recursive: true });
  await writeFile(args.out, "\uFEFF" + toCsv(rows), "utf8");

  console.log(`セット別進捗CSVを出力しました: ${args.out}`);
  console.log(`対象セット: ${rows.length.toLocaleString("ja-JP")}件`);
  console.table(rows.slice(0, Number.isFinite(args.limit) ? args.limit : 30));
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
