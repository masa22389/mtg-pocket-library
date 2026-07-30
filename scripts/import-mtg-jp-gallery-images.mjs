#!/usr/bin/env node

import { copyFile, mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { entryKey, loadWindowArray, mergeEntry, normalizeName, parseCsv } from "./db-csv-utils.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_DIR = path.resolve(__dirname, "..");
const DEFAULT_IN = path.join(PROJECT_DIR, "exports", "mtg-jp-gallery-images.csv");
const MANUAL_INDEX = path.join(PROJECT_DIR, "mtg-jp-card-index.js");
const GENERATED_INDEX = path.join(PROJECT_DIR, "mtgjson-jp-search-index.js");
const DEFAULT_BACKUP_DIR = path.join(PROJECT_DIR, "..", "mtg-pocket-backups");

function usage() {
  console.log(`
MTG日本公式カードギャラリー 画像候補CSVを補完DBへ反映

使い方:
  node scripts/import-mtg-jp-gallery-images.mjs --in exports/mtg-jp-gallery-images.csv --dry-run
  node scripts/import-mtg-jp-gallery-images.mjs --in exports/mtg-jp-gallery-images.csv

オプション:
  --in <file>          画像候補CSV
  --dry-run            DBを書き換えず照合結果だけ表示
  --allow-unmatched    既存DBと照合できない行も最小情報で追加
  --no-backup          更新前バックアップを作成しない
  --help               ヘルプ表示
`);
}

function parseArgs(argv) {
  const args = { in: DEFAULT_IN, dryRun: false, backup: true, allowUnmatched: false };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--help" || arg === "-h") args.help = true;
    else if (arg === "--in") args.in = path.resolve(argv[++i] || DEFAULT_IN);
    else if (arg === "--dry-run") args.dryRun = true;
    else if (arg === "--no-backup") args.backup = false;
    else if (arg === "--allow-unmatched") args.allowUnmatched = true;
    else throw new Error(`未知のオプションです: ${arg}`);
  }
  return args;
}

function indexTargets(entries) {
  const bySetAndJa = new Map();
  const byJa = new Map();
  for (const entry of entries) {
    for (const name of entry.jaNames || []) {
      const jaKey = normalizeName(name);
      if (!jaKey) continue;
      const setCode = String(entry.setCode || "").toUpperCase();
      if (setCode) {
        const key = `${setCode}:${jaKey}`;
        if (!bySetAndJa.has(key)) bySetAndJa.set(key, entry);
      }
      if (!byJa.has(jaKey)) byJa.set(jaKey, entry);
    }
  }
  return { bySetAndJa, byJa };
}

function buildPatchEntry(row, target, allowUnmatched = false) {
  const setCode = String(row.setCode || "").toUpperCase();
  const jaName = String(row.jaName || "").trim();
  const jaNames = String(row.jaNames || "")
    .split("|")
    .map(name => name.trim())
    .filter(Boolean);
  const image = String(row.image || "").trim();
  const imageBack = String(row.imageBack || "").trim();
  if (!setCode || !jaName || !image) return null;
  if (!target && !allowUnmatched) return null;
  return {
    source: "mtg-jp-card-gallery-image",
    sourceUrl: row.sourceUrl || target?.sourceUrl || "",
    setCode,
    collectorNumber: target?.collectorNumber || "",
    setNameJa: target?.setNameJa || "",
    jaNames: jaNames.length ? jaNames : [jaName],
    enNames: target?.enNames || [],
    scryfallName: target?.scryfallName || "",
    oracleId: target?.oracleId || "",
    scryfallId: target?.scryfallId || "",
    images: { normal: image, ...(imageBack ? { back: imageBack } : {}) },
    releasedAt: target?.releasedAt || "",
    setName: target?.setName || "",
  };
}

function sortEntries(entries) {
  return entries.sort((a, b) => {
    const date = String(b.releasedAt || "").localeCompare(String(a.releasedAt || ""));
    if (date) return date;
    const set = String(a.setCode || "").localeCompare(String(b.setCode || ""));
    if (set) return set;
    return String(a.scryfallName || a.jaNames?.[0] || "").localeCompare(String(b.scryfallName || b.jaNames?.[0] || ""), "ja");
  });
}

async function backupCurrent() {
  if (!existsSync(MANUAL_INDEX)) return "";
  const stamp = new Date().toISOString().replaceAll(/[-:]/g, "").replace(/\..+$/, "").replace("T", "-");
  const destDir = path.join(DEFAULT_BACKUP_DIR, `${stamp}-gallery-image-import`);
  await mkdir(destDir, { recursive: true });
  const dest = path.join(destDir, path.basename(MANUAL_INDEX));
  await copyFile(MANUAL_INDEX, dest);
  return dest;
}

async function writeManualIndex(entries) {
  const body = `window.MTG_JP_CARD_INDEX = ${JSON.stringify(sortEntries(entries), null, 2)};\n`;
  const temp = `${MANUAL_INDEX}.tmp`;
  await writeFile(temp, body, "utf8");
  await rename(temp, MANUAL_INDEX);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    usage();
    return;
  }

  const rows = parseCsv((await readFile(args.in, "utf8")).replace(/^\uFEFF/, ""));
  const manual = await loadWindowArray(MANUAL_INDEX, "MTG_JP_CARD_INDEX");
  const generated = await loadWindowArray(GENERATED_INDEX, "MTGJSON_JP_SEARCH_INDEX");
  const targets = indexTargets([...manual, ...generated]);

  const patches = [];
  const skipped = [];
  for (const row of rows) {
    const setCode = String(row.setCode || "").toUpperCase();
    const jaKeys = [
      row.jaName,
      ...String(row.jaNames || "").split("|"),
    ].map(normalizeName).filter(Boolean);
    const target = jaKeys.map(jaKey => targets.bySetAndJa.get(`${setCode}:${jaKey}`)).find(Boolean);
    const patch = buildPatchEntry(row, target, args.allowUnmatched);
    if (patch) patches.push(patch);
    else skipped.push(row);
  }

  const byKey = new Map();
  for (const entry of manual) {
    const key = entryKey(entry);
    if (key) byKey.set(key, entry);
  }
  for (const patch of patches) {
    const key = entryKey(patch) || `gallery:${patch.setCode}:${normalizeName(patch.jaNames?.[0])}`;
    const current = byKey.get(key);
    byKey.set(key, current ? mergeEntry(current, patch) : patch);
  }

  console.log(`入力: ${rows.length.toLocaleString("ja-JP")}件`);
  console.log(`照合・追加候補: ${patches.length.toLocaleString("ja-JP")}件`);
  console.log(`スキップ: ${skipped.length.toLocaleString("ja-JP")}件`);
  if (skipped.length) console.table(skipped.slice(0, 20));

  if (args.dryRun) {
    console.log("dry-run のためDBは更新していません");
    return;
  }

  if (args.backup) {
    const backup = await backupCurrent();
    if (backup) console.log(`更新前バックアップ: ${backup}`);
  }
  await writeManualIndex([...byKey.values()]);
  console.log(`更新しました: ${MANUAL_INDEX}`);
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
