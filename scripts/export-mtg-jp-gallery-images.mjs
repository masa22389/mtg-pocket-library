#!/usr/bin/env node

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_DIR = path.resolve(__dirname, "..");
const DEFAULT_OUT = path.join(PROJECT_DIR, "exports", "mtg-jp-gallery-images.csv");
const BASE = "https://mtg-jp.com";

function usage() {
  console.log(`
MTG日本公式カードギャラリー 画像候補CSV出力

使い方:
  node scripts/export-mtg-jp-gallery-images.mjs --gallery https://mtg-jp.com/products/card-gallery/0000276/ --set MH3

オプション:
  --gallery <url>  公式カードギャラリーのセットURL
  --set <code>     セット略号。例: MH3
  --out <file>     出力CSV。省略時は exports/mtg-jp-gallery-images.csv
  --limit <n>      取得件数上限。テスト用
  --help           ヘルプ表示
`);
}

function parseArgs(argv) {
  const args = { gallery: "", set: "", out: DEFAULT_OUT, limit: 0 };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--help" || arg === "-h") args.help = true;
    else if (arg === "--gallery") args.gallery = argv[++i] || "";
    else if (arg === "--set") args.set = String(argv[++i] || "").toUpperCase();
    else if (arg === "--out") args.out = path.resolve(argv[++i] || DEFAULT_OUT);
    else if (arg === "--limit") args.limit = Number(argv[++i] || 0);
    else throw new Error(`未知のオプションです: ${arg}`);
  }
  return args;
}

function csvEscape(value) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

function absoluteUrl(url) {
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;
  return `${BASE}${url.startsWith("/") ? "" : "/"}${url}`;
}

function decodeHtml(value) {
  return String(value || "")
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#039;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">");
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function extractDetailLinks(html, galleryUrl) {
  const galleryPath = new URL(galleryUrl).pathname.replace(/\/?$/, "/");
  const links = [];
  const pattern = /href=["']([^"']+)["']/gi;
  let match;
  while ((match = pattern.exec(html))) {
    const href = decodeHtml(match[1]);
    const url = new URL(href, BASE);
    if (!url.pathname.startsWith(galleryPath)) continue;
    if (url.pathname === galleryPath) continue;
    if (!/\/\d+\/?$/.test(url.pathname)) continue;
    links.push(url.toString());
  }
  return unique(links);
}

function extractMeta(html, property) {
  const escaped = property.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`<meta[^>]+property=["']${escaped}["'][^>]+content=["']([^"']+)["']`, "i");
  return decodeHtml(html.match(pattern)?.[1] || "");
}

function extractTitleName(html) {
  const ogTitle = extractMeta(html, "og:title");
  return ogTitle.split("｜")[0]?.trim() || "";
}

function extractCardImage(html) {
  return absoluteUrl(extractMeta(html, "og:image"));
}

function extractCardDetails(html) {
  const names = [...html.matchAll(/<h2>《([^》]+)》<\/h2>/g)].map(match => decodeHtml(match[1]).trim());
  const images = [...html.matchAll(/<figure class=["']card-img["']>\s*<img src=["']([^"']+)["']/g)]
    .map(match => absoluteUrl(decodeHtml(match[1]).trim()));
  return {
    names: unique(names),
    images: unique(images),
  };
}

async function fetchText(url) {
  const response = await fetch(url, {
    headers: {
      Accept: "text/html,application/xhtml+xml",
      "User-Agent": "MTG Pocket Library local gallery image audit",
    },
  });
  if (!response.ok) throw new Error(`取得失敗 HTTP ${response.status}: ${url}`);
  return response.text();
}

function toCsv(rows) {
  const columns = ["setCode", "jaName", "jaNames", "image", "imageBack", "sourceUrl"];
  return [
    columns.join(","),
    ...rows.map(row => columns.map(column => csvEscape(row[column])).join(",")),
  ].join("\r\n") + "\r\n";
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    usage();
    return;
  }
  if (!args.gallery) throw new Error("--gallery を指定してください");
  if (!args.set) throw new Error("--set を指定してください");

  const galleryHtml = await fetchText(args.gallery);
  let links = extractDetailLinks(galleryHtml, args.gallery);
  if (args.limit > 0) links = links.slice(0, args.limit);
  if (!links.length) throw new Error("カード詳細リンクを取得できませんでした");

  const rows = [];
  for (let index = 0; index < links.length; index += 1) {
    const sourceUrl = links[index];
    process.stdout.write(`\r取得中 ${index + 1}/${links.length}`);
    try {
      const html = await fetchText(sourceUrl);
      const detail = extractCardDetails(html);
      const jaName = detail.names[0] || extractTitleName(html);
      const image = detail.images[0] || extractCardImage(html);
      if (jaName && image) rows.push({
        setCode: args.set,
        jaName,
        jaNames: detail.names.join("|"),
        image,
        imageBack: detail.images[1] || "",
        sourceUrl,
      });
      await new Promise(resolve => setTimeout(resolve, 120));
    } catch (error) {
      process.stdout.write("\n");
      console.warn(`警告: ${sourceUrl} をスキップしました: ${error.message}`);
    }
  }
  process.stdout.write("\n");

  await mkdir(path.dirname(args.out), { recursive: true });
  await writeFile(args.out, "\uFEFF" + toCsv(rows), "utf8");
  console.log(`出力しました: ${args.out}`);
  console.log(`画像候補: ${rows.length.toLocaleString("ja-JP")}件`);
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
