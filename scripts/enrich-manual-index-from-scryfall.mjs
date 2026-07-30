#!/usr/bin/env node

import { copyFile, mkdir, rename, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadWindowArray } from "./db-csv-utils.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_DIR = path.resolve(__dirname, "..");
const DEFAULT_OUT = path.join(PROJECT_DIR, "mtg-jp-card-index.js");
const DEFAULT_BACKUP_DIR = path.join(PROJECT_DIR, "..", "mtg-pocket-backups");
const USER_AGENT = "MTG Pocket Library local DB maintenance";

function usage() {
  console.log(`
MTG Pocket Library 補完DB Scryfall ID補完

使い方:
  node scripts/enrich-manual-index-from-scryfall.mjs --sets MH3,M3C

オプション:
  --sets <codes>  対象セット略号。例: MH3,M3C
  --dry-run       ファイルを更新せず、件数だけ確認します
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

function needsScryfallEnrich(entry) {
  return Boolean(entry.setCode && entry.collectorNumber && (!entry.oracleId || !entry.scryfallId || !entry.releasedAt || !entry.setName));
}

async function fetchScryfallPrint(entry) {
  const setCode = String(entry.setCode || "").toLowerCase();
  const collectorNumber = encodeURIComponent(String(entry.collectorNumber || "").trim());
  const url = `https://api.scryfall.com/cards/${setCode}/${collectorNumber}/ja`;
  const response = await fetch(url, { headers: { "User-Agent": USER_AGENT, Accept: "application/json" } });
  if (response.status === 404) return null;
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`${entry.setCode}:${entry.collectorNumber} Scryfall取得失敗 ${response.status} ${text}`);
  }
  return response.json();
}

function mergeScryfallPrint(entry, card) {
  if (!card) return { entry, changed: false };
  const next = { ...entry };
  let changed = false;
  const fields = [
    ["oracleId", card.oracle_id],
    ["scryfallId", card.id],
    ["releasedAt", card.released_at],
    ["setName", card.set_name],
    ["scryfallName", card.name],
  ];
  for (const [field, value] of fields) {
    if (!next[field] && value) {
      next[field] = value;
      changed = true;
    }
  }
  if (card.image_uris?.normal || card.card_faces?.[0]?.image_uris?.normal) {
    const normal = card.image_uris?.normal || card.card_faces?.[0]?.image_uris?.normal;
    const back = card.card_faces?.[1]?.image_uris?.normal;
    const images = { ...(next.images || {}) };
    if (!images.normal && normal) {
      images.normal = normal;
      changed = true;
    }
    if (!images.back && back) {
      images.back = back;
      changed = true;
    }
    if (Object.keys(images).length) next.images = images;
  }
  return { entry: next, changed };
}

async function backupCurrent(outFile) {
  if (!existsSync(outFile)) return "";
  const stamp = new Date().toISOString().replaceAll(/[-:]/g, "").replace(/\..+$/, "").replace("T", "-");
  const destDir = path.join(DEFAULT_BACKUP_DIR, `${stamp}-manual-index-scryfall-enrich`);
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
  const targets = manualEntries
    .map((entry, index) => ({ entry, index }))
    .filter(({ entry }) => args.sets.includes(String(entry.setCode || "").toUpperCase()) && needsScryfallEnrich(entry));

  let changedCount = 0;
  let foundCount = 0;
  let missingCount = 0;
  const nextEntries = [...manualEntries];

  for (const { entry, index } of targets) {
    await new Promise(resolve => setTimeout(resolve, 75));
    const card = await fetchScryfallPrint(entry);
    if (!card) {
      missingCount += 1;
      continue;
    }
    foundCount += 1;
    const result = mergeScryfallPrint(entry, card);
    if (result.changed) {
      changedCount += 1;
      nextEntries[index] = result.entry;
    }
  }

  console.log(`対象セット: ${args.sets.join(", ")}`);
  console.log(`補完候補: ${targets.length.toLocaleString("ja-JP")}件`);
  console.log(`Scryfall取得成功: ${foundCount.toLocaleString("ja-JP")}件`);
  console.log(`Scryfall未取得: ${missingCount.toLocaleString("ja-JP")}件`);
  console.log(`更新対象: ${changedCount.toLocaleString("ja-JP")}件`);

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

