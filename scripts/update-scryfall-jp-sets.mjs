import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputPath = path.join(root, "mtg-jp-card-index.js");
const requestedSets = (process.argv.find(arg => arg.startsWith("--sets="))?.split("=")[1] || "")
  .split(",")
  .map(value => value.trim().toLowerCase())
  .filter(Boolean);
const dryRun = process.argv.includes("--dry-run");

if (!requestedSets.length) {
  throw new Error("Specify target sets with --sets=HOB,HOC");
}

const setNameJa = {
  hob: "\u30db\u30d3\u30c3\u30c8",
  hoc: "\u30db\u30d3\u30c3\u30c8 \u7d71\u7387\u8005"
};

function readCurrentIndex() {
  const source = fs.readFileSync(outputPath, "utf8");
  const sandbox = { window: {} };
  vm.runInNewContext(source, sandbox, { filename: outputPath });
  return Array.from(sandbox.window.MTG_JP_CARD_INDEX || [], item => JSON.parse(JSON.stringify(item)));
}

function imageUris(card) {
  const front = card.image_uris || card.card_faces?.[0]?.image_uris || {};
  const back = card.card_faces?.[1]?.image_uris || {};
  const images = {};
  if (front.normal) images.normal = front.normal;
  if (back.normal) images.back = back.normal;
  return images;
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function toIndexRow(card) {
  const jaNames = unique([
    card.printed_name,
    ...(card.card_faces || []).map(face => face.printed_name)
  ]);
  const enNames = unique([
    card.name,
    ...(card.card_faces || []).map(face => face.name)
  ]);
  return {
    source: "scryfall-ja",
    sourceUrl: card.scryfall_uri,
    setCode: card.set.toUpperCase(),
    collectorNumber: card.collector_number,
    scryfallId: card.id,
    oracleId: card.oracle_id,
    setNameJa: setNameJa[card.set] || card.set_name,
    jaNames,
    enNames,
    scryfallName: card.name,
    images: imageUris(card),
    releasedAt: card.released_at,
    setName: card.set_name
  };
}

async function fetchSet(setCode) {
  let url = `https://api.scryfall.com/cards/search?unique=prints&order=set&q=${encodeURIComponent(`set:${setCode} lang:ja`)}`;
  const cards = [];
  while (url) {
    const response = await fetch(url, { headers: { "User-Agent": "MTG-Pocket-Library-DB-Updater/1.0" } });
    if (!response.ok) throw new Error(`${setCode}: Scryfall ${response.status} ${response.statusText}`);
    const body = await response.json();
    cards.push(...body.data);
    url = body.has_more ? body.next_page : null;
    if (url) await new Promise(resolve => setTimeout(resolve, 100));
  }
  return cards.map(toIndexRow);
}

const current = readCurrentIndex();
const targetSet = new Set(requestedSets.map(value => value.toUpperCase()));
const retained = current.filter(item => !targetSet.has(String(item.setCode || "").toUpperCase()));
const added = [];

for (const setCode of requestedSets) {
  const rows = await fetchSet(setCode);
  console.log(`${setCode.toUpperCase()}: ${rows.length} records`);
  added.push(...rows);
}

added.sort((a, b) =>
  String(a.setCode || "").localeCompare(String(b.setCode || ""), "en") ||
  String(a.collectorNumber || "").localeCompare(String(b.collectorNumber || ""), "en", { numeric: true }) ||
  String(a.scryfallId || "").localeCompare(String(b.scryfallId || ""), "en")
);
const next = [...retained, ...added];

console.log(`Database: ${current.length} -> ${next.length} records`);
if (!dryRun) {
  fs.writeFileSync(outputPath, `window.MTG_JP_CARD_INDEX = ${JSON.stringify(next, null, 2)};\n`, "utf8");
  console.log(`Updated: ${outputPath}`);
}
