#!/usr/bin/env node

// The large search indexes are referenced by a content hash (?h=...) instead of the app version (?v=...),
// so an app update downloads them again only when their contents change.
// Run after updating mtg-jp-card-index.js or mtgjson-jp-search-index.js. --check only verifies.
import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const PROJECT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const HASHED_ASSETS = ["mtg-jp-card-index.js", "mtgjson-jp-search-index.js"];
const REFERENCING_FILES = ["index.html", "sw.js"];

export async function assetHash(name) {
  return createHash("sha256").update(await readFile(path.join(PROJECT_DIR, name))).digest("hex").slice(0, 12);
}

const escape = text => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export async function updateAssetHashes({ check = false } = {}) {
  const hashes = Object.fromEntries(await Promise.all(HASHED_ASSETS.map(async name => [name, await assetHash(name)])));
  const problems = [];
  for (const file of REFERENCING_FILES) {
    const fullPath = path.join(PROJECT_DIR, file);
    let text = await readFile(fullPath, "utf8");
    for (const [name, hash] of Object.entries(hashes)) {
      const pattern = new RegExp(`${escape(name)}\\?[hv]=[0-9a-z]+`, "g");
      const found = text.match(pattern) || [];
      if (!found.length) problems.push(`${file}: ${name} の参照が見つかりません`);
      for (const reference of found) if (reference !== `${name}?h=${hash}`) problems.push(`${file}: ${reference} → ${name}?h=${hash}`);
      text = text.replace(pattern, `${name}?h=${hash}`);
    }
    if (!check) await writeFile(fullPath, text);
  }
  return { hashes, problems };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const check = process.argv.includes("--check");
  const { hashes, problems } = await updateAssetHashes({ check });
  for (const [name, hash] of Object.entries(hashes)) console.log(`${name}?h=${hash}`);
  if (check && problems.length) {
    console.error("ハッシュが最新ではありません。node scripts/update-asset-hashes.mjs を実行してください。");
    for (const problem of problems) console.error("  " + problem);
    process.exitCode = 1;
  } else if (!check) {
    console.log(problems.length ? `${problems.length}か所を更新しました。` : "変更はありません。");
  }
}
