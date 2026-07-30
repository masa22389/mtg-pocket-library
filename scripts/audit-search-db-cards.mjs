#!/usr/bin/env node

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { csvEscape, entryKey, loadWindowArray, mergeEntry } from "./db-csv-utils.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_DIR = path.resolve(__dirname, "..");
const DEFAULT_OUT = path.join(PROJECT_DIR, "exports", "card-db-audit.csv");

const OUTPUT_COLUMNS = [
  "issue",
  "source",
  "setCode",
  "collectorNumber",
  "jaNames",
  "enNames",
  "scryfallName",
  "oracleId",
  "scryfallId",
  "releasedAt",
];

const ENGLISH_TITLE_JA_PRINT_ALLOWLIST = new Set([
  // Scryfallの日本語版データでもカード名が英語表記のままの特殊例
  "2588f348-d7a3-46c8-9ace-dca53ed5ef99", // MH3 #237 Ajani, Nacatl Pariah // Ajani, Nacatl Avenger
  "d077d54c-6f1b-4795-a241-6073b0dc1dc8", // PIP #50 V.A.T.S.
  "9bf498ce-6d6d-462f-9ec3-b36a2184aff7", // PIP #129 C.A.M.P.
]);

function usage() {
  console.log(`
MTG Pocket Library カード別DB監査

使い方:
  node scripts/audit-search-db-cards.mjs --sets MSH,MSC

オプション:
  --sets <codes>  セット略号。例: MSH,MSC
  --out <file>    出力先CSV。省略時は exports/card-db-audit.csv
  --all           問題あり行だけでなく対象全行を出力します
  --help          このヘルプを表示します
`);
}

function parseArgs(argv) {
  const args = { sets: [], out: DEFAULT_OUT, all: false };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--help" || arg === "-h") args.help = true;
    else if (arg === "--sets") args.sets = String(argv[++i] || "").split(",").map(code => code.trim().toUpperCase()).filter(Boolean);
    else if (arg === "--out") args.out = path.resolve(argv[++i]);
    else if (arg === "--all") {
      args.all = true;
      args.sets = ["__ALL__"];
    }
    else throw new Error(`未知のオプションです: ${arg}`);
  }
  return args;
}

function hasJapanese(text) {
  return /[\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Han}ー、]/u.test(String(text || ""));
}

function hasEnglish(text) {
  return /[A-Za-z]/.test(String(text || ""));
}

function uniqueIssue(issues) {
  return [...new Set(issues)].join(" / ");
}

function inspectEntry(entry) {
  const jaNames = entry.jaNames || [];
  const enNames = entry.enNames || [];
  const issues = [];
  const allowsEnglishTitle = ENGLISH_TITLE_JA_PRINT_ALLOWLIST.has(entry.oracleId) || ENGLISH_TITLE_JA_PRINT_ALLOWLIST.has(entry.scryfallId);

  if (!jaNames.length) issues.push("日本語名なし");
  else if (!jaNames.some(hasJapanese) && !allowsEnglishTitle) issues.push("日本語文字なし");

  if (!enNames.length && !entry.scryfallName) issues.push("英語名なし");
  else if (![...enNames, entry.scryfallName].some(hasEnglish)) issues.push("英語文字なし");

  if (!entry.scryfallName) issues.push("Scryfall名なし");
  if (!entry.oracleId) issues.push("Oracle IDなし");
  if (!entry.scryfallId) issues.push("Scryfall IDなし");
  if (!entry.setCode) issues.push("セット略号なし");
  if (!entry.collectorNumber) issues.push("コレクター番号なし");

  const normalizedJa = jaNames.map(name => String(name || "").normalize("NFKC").trim()).filter(Boolean);
  if (normalizedJa.length !== new Set(normalizedJa).size) issues.push("日本語名重複");

  const normalizedEn = enNames.map(name => String(name || "").normalize("NFKC").trim().toLowerCase()).filter(Boolean);
  if (normalizedEn.length !== new Set(normalizedEn).size) issues.push("英語名重複");

  return uniqueIssue(issues);
}

function entryToRow(entry, issue) {
  return {
    issue,
    source: entry.source || "",
    setCode: entry.setCode || "",
    collectorNumber: entry.collectorNumber || "",
    jaNames: (entry.jaNames || []).join("|"),
    enNames: (entry.enNames || []).join("|"),
    scryfallName: entry.scryfallName || "",
    oracleId: entry.oracleId || "",
    scryfallId: entry.scryfallId || "",
    releasedAt: entry.releasedAt || "",
  };
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
  if (!args.sets.length) throw new Error("--sets で監査対象セットを指定してください");

  const manualEntries = await loadWindowArray(path.join(PROJECT_DIR, "mtg-jp-card-index.js"), "MTG_JP_CARD_INDEX");
  const generatedEntries = await loadWindowArray(path.join(PROJECT_DIR, "mtgjson-jp-search-index.js"), "MTGJSON_JP_SEARCH_INDEX");
  const mergedByKey = new Map();

  [...manualEntries, ...generatedEntries].forEach(entry => {
    const key = entryKey(entry);
    if (!key) return;
    const current = mergedByKey.get(key);
    mergedByKey.set(key, current ? mergeEntry(current, entry) : entry);
  });

  const entries = [...mergedByKey.values()]
    .filter(entry => args.all || args.sets.includes(String(entry.setCode || "").toUpperCase()))
    .sort((a, b) => {
      const setCompare = String(a.setCode || "").localeCompare(String(b.setCode || ""));
      if (setCompare) return setCompare;
      return Number.parseInt(a.collectorNumber, 10) - Number.parseInt(b.collectorNumber, 10)
        || String(a.collectorNumber || "").localeCompare(String(b.collectorNumber || ""), "en", { numeric: true });
    });

  const rows = entries
    .map(entry => entryToRow(entry, inspectEntry(entry)))
    .filter(row => args.all || row.issue);

  await mkdir(path.dirname(args.out), { recursive: true });
  await writeFile(args.out, "\uFEFF" + toCsv(rows), "utf8");

  console.log(`カード別監査CSVを出力しました: ${args.out}`);
  console.log(`対象カード: ${entries.length.toLocaleString("ja-JP")}件`);
  console.log(`問題あり: ${rows.filter(row => row.issue).length.toLocaleString("ja-JP")}件`);
  if (rows.some(row => row.issue)) console.table(rows.slice(0, 30));
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
