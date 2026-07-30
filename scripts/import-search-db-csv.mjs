#!/usr/bin/env node

import { copyFile, mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { csvRowToEntry, entryKey, loadWindowArray, mergeEntry, parseCsv } from "./db-csv-utils.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_DIR = path.resolve(__dirname, "..");
const DEFAULT_OUT = path.join(PROJECT_DIR, "mtg-jp-card-index.js");
const DEFAULT_BACKUP_DIR = path.join(PROJECT_DIR, "..", "mtg-pocket-backups");

function usage() {
  console.log(`
MTG Pocket Library CSV補完DB読み込み

使い方:
  node scripts/import-search-db-csv.mjs --in C:\\path\\to\\search-db-edited.csv

オプション:
  --in <file>       読み込むCSV。必須
  --out <file>      出力先。省略時は mtg-jp-card-index.js
  --dry-run         ファイルを書き換えず、追加/更新件数だけ確認します
  --include-generated
                    source が mtgjson の行も取り込みます。通常は不要です
  --no-backup       更新前バックアップを作りません
  --help            このヘルプを表示します

注意:
  CSVは補完DB mtg-jp-card-index.js に反映します。
  mtgjson-jp-search-index.js は生成DBなので直接編集対象にしません。
  標準では source が mtgjson の行はスキップします。
  MTGJSON由来の行を補完DBへ移したい場合は、CSV上で source を manual/csv 等に変更するか、
  --include-generated を指定してください。
`);
}

function parseArgs(argv) {
  const args = { in: "", out: DEFAULT_OUT, dryRun: false, backup: true, includeGenerated: false };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--help" || arg === "-h") args.help = true;
    else if (arg === "--in") args.in = path.resolve(argv[++i]);
    else if (arg === "--out") args.out = path.resolve(argv[++i]);
    else if (arg === "--dry-run") args.dryRun = true;
    else if (arg === "--include-generated") args.includeGenerated = true;
    else if (arg === "--no-backup") args.backup = false;
    else throw new Error(`未知のオプションです: ${arg}`);
  }
  return args;
}

function shouldImportEntry(entry, args) {
  if (!args.includeGenerated && String(entry.source || "").toLowerCase() === "mtgjson") return false;
  return Boolean((entry.jaNames || []).length && ((entry.enNames || []).length || entry.scryfallName));
}

async function backupCurrent(outFile) {
  if (!existsSync(outFile)) return "";
  const stamp = new Date().toISOString().replaceAll(/[-:]/g, "").replace(/\..+$/, "").replace("T", "-");
  const destDir = path.join(DEFAULT_BACKUP_DIR, `${stamp}-csv-import`);
  await mkdir(destDir, { recursive: true });
  const dest = path.join(destDir, path.basename(outFile));
  await copyFile(outFile, dest);
  return dest;
}

async function writeManualIndex(outFile, entries) {
  const body = `window.MTG_JP_CARD_INDEX = ${JSON.stringify(entries, null, 2)};\n`;
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
  if (!args.in) throw new Error("--in でCSVファイルを指定してください");

  const existing = await loadWindowArray(args.out, "MTG_JP_CARD_INDEX");
  const byKey = new Map(existing.map(entry => [entryKey(entry), entry]).filter(([key]) => key));
  const anonymous = existing.filter(entry => !entryKey(entry));
  const rows = parseCsv((await readFile(args.in, "utf8")).replace(/^\uFEFF/, ""));
  let added = 0;
  let updated = 0;
  let skipped = 0;

  for (const row of rows) {
    const entry = csvRowToEntry(row);
    if (!shouldImportEntry(entry, args)) {
      skipped += 1;
      continue;
    }
    const key = entryKey(entry);
    if (!key) {
      skipped += 1;
      continue;
    }
    if (byKey.has(key)) {
      byKey.set(key, mergeEntry(byKey.get(key), entry));
      updated += 1;
    } else {
      byKey.set(key, { source: entry.source || "csv", ...entry });
      added += 1;
    }
  }

  const nextEntries = [...anonymous, ...byKey.values()].sort((a, b) =>
    String(a.scryfallName || a.enNames?.[0] || a.jaNames?.[0] || "").localeCompare(
      String(b.scryfallName || b.enNames?.[0] || b.jaNames?.[0] || ""),
      "en",
    )
  );

  console.log(`CSV行: ${rows.length.toLocaleString("ja-JP")}件`);
  console.log(`追加: ${added.toLocaleString("ja-JP")}件 / 更新: ${updated.toLocaleString("ja-JP")}件 / スキップ: ${skipped.toLocaleString("ja-JP")}件`);
  console.log(`補完DB出力件数: ${nextEntries.length.toLocaleString("ja-JP")}件`);

  if (args.dryRun) {
    console.log("dry-run のためファイルは更新していません");
    return;
  }

  if (args.backup) {
    const backup = await backupCurrent(args.out);
    if (backup) console.log(`更新前バックアップ: ${backup}`);
  }

  await writeManualIndex(args.out, nextEntries);
  console.log(`更新しました: ${args.out}`);
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
