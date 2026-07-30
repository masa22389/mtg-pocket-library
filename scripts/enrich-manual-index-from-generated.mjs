#!/usr/bin/env node

import { copyFile, mkdir, rename, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { entryKey, loadWindowArray, normalizeName } from "./db-csv-utils.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_DIR = path.resolve(__dirname, "..");
const DEFAULT_OUT = path.join(PROJECT_DIR, "mtg-jp-card-index.js");
const DEFAULT_BACKUP_DIR = path.join(PROJECT_DIR, "..", "mtg-pocket-backups");

function usage() {
  console.log(`
MTG Pocket Library 補完DB ID補充

使い方:
  node scripts/enrich-manual-index-from-generated.mjs --sets TLA,TLE

オプション:
  --sets <codes>  対象セット略号。例: TLA,TLE
  --dry-run       ファイルを書き換えず、件数だけ確認します
  --no-backup     更新前バックアップを作りません
  --help          このヘルプを表示します
`);
}

function parseArgs(argv) {
  const args = { sets: [], dryRun: false, backup: true };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--help" || arg === "-h") args.help = true;
    else if (arg === "--sets") args.sets = String(argv[++i] || "").split(",").map(code => code.trim().toUpperCase()).filter(Boolean);
    else if (arg === "--dry-run") args.dryRun = true;
    else if (arg === "--no-backup") args.backup = false;
    else throw new Error(`未知のオプションです: ${arg}`);
  }
  return args;
}

function printKey(entry) {
  const setCode = String(entry.setCode || "").trim().toUpperCase();
  const collectorNumber = String(entry.collectorNumber || "").trim();
  if (setCode && collectorNumber) return `${setCode}:${collectorNumber}`;
  return "";
}

function nameKey(entry) {
  const names = [
    ...(entry.jaNames || []),
    ...(entry.enNames || []),
    entry.scryfallName,
  ].filter(Boolean).map(normalizeName).sort();
  return names.join("|");
}

function mergeMissingIds(manual, generated) {
  const next = { ...manual };
  let changed = false;
  for (const field of ["oracleId", "scryfallId", "releasedAt", "setName"]) {
    if (!next[field] && generated[field]) {
      next[field] = generated[field];
      changed = true;
    }
  }
  if (!next.scryfallName && generated.scryfallName) {
    next.scryfallName = generated.scryfallName;
    changed = true;
  }
  return { entry: next, changed };
}

async function backupCurrent(outFile) {
  if (!existsSync(outFile)) return "";
  const stamp = new Date().toISOString().replaceAll(/[-:]/g, "").replace(/\..+$/, "").replace("T", "-");
  const destDir = path.join(DEFAULT_BACKUP_DIR, `${stamp}-manual-index-enrich`);
  await mkdir(destDir, { recursive: true });
  const dest = path.join(destDir, path.basename(outFile));
  await copyFile(outFile, dest);
  return dest;
}

async function writeManualIndex(entries) {
  const body = `window.MTG_JP_CARD_INDEX = ${JSON.stringify(entries, null, 2)};\n`;
  const tempFile = `${DEFAULT_OUT}.tmp`;
  await writeFile(tempFile, body, "utf8");
  await rename(tempFile, DEFAULT_OUT);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    usage();
    return;
  }
  if (!args.sets.length) throw new Error("--sets で対象セットを指定してください");

  const manualEntries = await loadWindowArray(DEFAULT_OUT, "MTG_JP_CARD_INDEX");
  const generatedEntries = await loadWindowArray(path.join(PROJECT_DIR, "mtgjson-jp-search-index.js"), "MTGJSON_JP_SEARCH_INDEX");
  const generatedByPrint = new Map();
  const generatedByName = new Map();

  for (const entry of generatedEntries) {
    if (!args.sets.includes(String(entry.setCode || "").toUpperCase())) continue;
    const pKey = printKey(entry);
    if (pKey && !generatedByPrint.has(pKey)) generatedByPrint.set(pKey, entry);
    const nKey = nameKey(entry);
    if (nKey && !generatedByName.has(nKey)) generatedByName.set(nKey, entry);
  }

  let changedCount = 0;
  let matchedCount = 0;
  const nextEntries = manualEntries.map(entry => {
    if (!args.sets.includes(String(entry.setCode || "").toUpperCase())) return entry;
    const generated = generatedByPrint.get(printKey(entry)) || generatedByName.get(nameKey(entry));
    if (!generated) return entry;
    matchedCount += 1;
    const result = mergeMissingIds(entry, generated);
    if (result.changed) changedCount += 1;
    return result.entry;
  });

  console.log(`対象セット: ${args.sets.join(", ")}`);
  console.log(`補完DB件数: ${manualEntries.length.toLocaleString("ja-JP")}件`);
  console.log(`照合できた補完DB行: ${matchedCount.toLocaleString("ja-JP")}件`);
  console.log(`更新対象行: ${changedCount.toLocaleString("ja-JP")}件`);

  if (args.dryRun) {
    console.log("dry-run のためファイルは更新していません");
    return;
  }

  if (!changedCount) {
    console.log("更新対象がないため、ファイルは更新していません");
    return;
  }

  if (args.backup) {
    const backup = await backupCurrent(DEFAULT_OUT);
    if (backup) console.log(`更新前バックアップ: ${backup}`);
  }

  await writeManualIndex(nextEntries);
  console.log(`更新しました: ${DEFAULT_OUT}`);
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});

