// Adds or refreshes whole sets in the scanner catalogue (used for Star Trek in v403).
//
//   node scripts/build-set-scanner-supplement.mjs prepare --sets trk,trc,sds,ttrk,ttrc --work-dir <dir>
//   python scripts/build-set-scanner-embeddings.py --input <dir>/milo-input.json --work-dir <dir> --check <ids>
//   node scripts/build-set-scanner-supplement.mjs phash --work-dir <dir> [--chrome <path to chrome.exe>]
//   node scripts/build-set-scanner-supplement.mjs apply --work-dir <dir>
//   python scanner/tools/refresh-pack.py
//
// prepare: reads every paper print of the sets from Scryfall (English and Japanese).
// phash:   hashes one current Scryfall "small" image per artwork in headless Chrome with scanner/fingerprint.mjs,
//          the same code and image size as the 2026-10-23 catalogue. It first re-hashes a few existing rows of other
//          sets and stops unless they match exactly.
// apply:   replaces the rows these sets already had (their images can have changed since the snapshot) and appends
//          the rest: prints.json, identities.json (with Japanese names), cards.json + phash.bin, milo-cards.json +
//          full-features.f16.bin, print-display.json, the Japanese image buckets and their manifest, coverage.json.
import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync } from "node:fs";
import { createHash } from "node:crypto";
import { spawn } from "node:child_process";
import http from "node:http";
import path from "node:path";
import os from "node:os";

const repo = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")), "..");
const data = path.join(repo, "scanner", "data");
const args = process.argv.slice(2), mode = args[0];
const opt = name => { const i = args.indexOf("--" + name); return i > 0 ? args[i + 1] : undefined; };
const work = opt("work-dir");
if (!mode || !work) throw Error("usage: prepare|phash|apply --work-dir <dir>");
mkdirSync(work, { recursive: true });
const readJson = file => JSON.parse(readFileSync(file, "utf8"));
const writeJson = (file, value) => writeFileSync(file, JSON.stringify(value, null, 0));
const sleep = ms => new Promise(r => setTimeout(r, ms));
const japanese = s => /[ぁ-んァ-ン一-龯]/u.test(s || "");

async function scryfall(query) {
  let url = `https://api.scryfall.com/cards/search?q=${encodeURIComponent(query)}&unique=prints&order=set&include_extras=true&include_variations=true`;
  const out = [];
  while (url) {
    const res = await fetch(url, { headers: { "User-Agent": "MTG-Pocket-Catalog/1.0", Accept: "application/json" } });
    const page = await res.json();
    if (!page.data) { if (page.code === "not_found") return out; throw Error(page.details || "Scryfall error"); }
    out.push(...page.data); url = page.has_more ? page.next_page : ""; await sleep(120);
  }
  return out;
}

if (mode === "prepare") {
  const sets = (opt("sets") || "").split(",").filter(Boolean);
  if (!sets.length) throw Error("--sets required");
  const setQuery = "(" + sets.map(s => `set:${s}`).join(" or ") + ")";
  // Without a lang: filter Scryfall returns each print in its own language (English, or e.g. Klingon for TRK 436-445).
  const english = (await scryfall(`${setQuery} game:paper`)).filter(c => c.lang !== "ja");
  const ja = await scryfall(`${setQuery} lang:ja`);
  const prints = english.map(c => {
    const face = c.image_uris ? c : c.card_faces?.[0] || {};
    return { id: c.id, lang: c.lang, oracleId: c.oracle_id || c.card_faces?.[0]?.oracle_id, set: c.set, number: c.collector_number, finishes: c.finishes,
      name: c.name, illustration: c.illustration_id || c.card_faces?.[0]?.illustration_id || c.id, normal: face.image_uris?.normal, small: face.image_uris?.small,
      setName: c.set_name, released: c.released_at };
  });
  if (prints.some(p => !p.oracleId || !p.normal || !p.small)) throw Error("print without Oracle ID or image");
  const japanesePrints = ja.map(c => {
    const name = c.printed_name || (c.card_faces || []).map(f => f.printed_name).filter(japanese).join(" // ");
    const face = c.image_uris ? c : c.card_faces?.[0] || {};
    return { set: c.set, number: c.collector_number, oracleId: c.oracle_id || c.card_faces?.[0]?.oracle_id, name, normal: face.image_uris?.normal, imageStatus: c.image_status };
  });
  writeJson(path.join(work, "supplement.json"), { sets, fetchedAt: new Date().toISOString(), prints, japanesePrints });
  writeJson(path.join(work, "milo-input.json"), prints.map(p => ({ id: p.id, image: p.normal })));
  const existingCards = new Set(readJson(path.join(data, "cards.json")).map(c => c.id));
  const byArt = new Map();
  for (const p of prints) {
    const old = byArt.get(p.illustration);
    if (!old || (existingCards.has(p.id) && !existingCards.has(old.id))) byArt.set(p.illustration, p);
  }
  writeJson(path.join(work, "phash-input.json"), [...byArt.values()].map(p => ({ id: p.id, image: p.small })));
  const known = new Set(readJson(path.join(data, "milo-cards.json")).map(c => c.id));
  console.log(JSON.stringify({ prints: prints.length, alreadyInScanner: prints.filter(p => known.has(p.id)).length, artworks: byArt.size, japanese: ja.length }));
  console.log("check ids:", prints.filter(p => known.has(p.id)).filter((_, i) => i % 60 === 0).slice(0, 7).map(p => p.id).join(","));
}

if (mode === "phash") {
  const items = readJson(path.join(work, "phash-input.json"));
  const cards = readJson(path.join(data, "cards.json")), bin = readFileSync(path.join(data, "phash.bin"));
  const own = new Set(readJson(path.join(work, "supplement.json")).prints.map(p => p.id));
  const checks = cards.map((c, i) => ({ c, i })).filter(({ c }) => !own.has(c.id)).filter((_, k) => k % 9000 === 17).slice(0, 6)
    .map(({ c, i }) => ({ id: c.id, image: `https://cards.scryfall.io/small/front/${c.id[0]}/${c.id[1]}/${c.id}.jpg`, expected: bin.subarray(i * 32, i * 32 + 32).toString("hex") }));
  const server = http.createServer((req, res) => {
    if (new URL(req.url, "http://x").pathname === "/") { res.writeHead(200, { "Content-Type": "text/html" }); res.end("<!doctype html><title>pHash</title>"); return; }
    const file = path.join(repo, "scanner", decodeURIComponent(new URL(req.url, "http://x").pathname));
    if (!file.startsWith(path.join(repo, "scanner")) || !existsSync(file) || !file.endsWith(".mjs")) { res.writeHead(404); res.end(); return; }
    res.writeHead(200, { "Content-Type": "text/javascript" }); res.end(readFileSync(file));
  });
  await new Promise(r => server.listen(0, "127.0.0.1", r));
  const port = server.address().port, profile = path.join(os.tmpdir(), "mtg-pocket-phash-" + Date.now()), debugPort = 9400 + Math.floor(Math.random() * 400);
  const chrome = spawn(opt("chrome") || "C:/Program Files/Google/Chrome/Application/chrome.exe",
    ["--headless=new", `--remote-debugging-port=${debugPort}`, `--user-data-dir=${profile}`, "--no-first-run", "about:blank"], { stdio: "ignore" });
  try {
    let target;
    for (let i = 0; i < 50 && !target; i++) { await sleep(200); try { target = (await (await fetch(`http://127.0.0.1:${debugPort}/json/list`)).json()).find(t => t.type === "page"); } catch {} }
    const ws = new WebSocket(target.webSocketDebuggerUrl); await new Promise(r => ws.onopen = r);
    let seq = 0; const waiting = new Map(); ws.onmessage = e => { const m = JSON.parse(e.data); m.id && waiting.get(m.id)?.(m); };
    const send = (method, params) => new Promise(r => { const id = ++seq; waiting.set(id, r); ws.send(JSON.stringify({ id, method, params })); });
    await send("Page.enable"); await send("Page.navigate", { url: `http://127.0.0.1:${port}/` }); await sleep(1500);
    const run = async list => {
      const expr = `(async()=>{const {phashCanvas}=await import('http://127.0.0.1:${port}/fingerprint.mjs');const out={};
        for(const it of ${JSON.stringify(list)}){let b;for(let t=0;t<3&&!b;t++){try{const r=await fetch(it.image);if(!r.ok)throw Error(r.status);b=await createImageBitmap(await r.blob());}catch(e){if(t===2)throw Error(it.id+' '+e.message);await new Promise(r=>setTimeout(r,1500));}}
        const c=new OffscreenCanvas(b.width,b.height);c.getContext('2d').drawImage(b,0,0);out[it.id]=phashCanvas(c);await new Promise(r=>setTimeout(r,60));}
        return JSON.stringify(out);})()`;
      const m = await send("Runtime.evaluate", { expression: expr, awaitPromise: true, returnByValue: true });
      if (m.result?.exceptionDetails) throw Error(m.result.exceptionDetails.exception?.description || "evaluate failed");
      return JSON.parse(m.result.result.value);
    };
    const checked = await run(checks);
    for (const c of checks) if (checked[c.id] !== c.expected) throw Error(`existing pHash not reproduced for ${c.id}`);
    console.log("existing rows reproduced:", checks.length);
    const result = {};
    for (let i = 0; i < items.length; i += 100) { Object.assign(result, await run(items.slice(i, i + 100))); console.log("hashed", Math.min(i + 100, items.length), "of", items.length); }
    writeJson(path.join(work, "phash.json"), result);
    ws.close();
  } finally { chrome.kill(); server.close(); await sleep(800); try { rmSync(profile, { recursive: true, force: true }); } catch {} }
}

if (mode === "apply") {
  const sup = readJson(path.join(work, "supplement.json")), hashes = readJson(path.join(work, "phash.json"));
  const embIds = readJson(path.join(work, "embeddings-ids.json")), emb = readFileSync(path.join(work, "embeddings.f16.bin"));
  if (emb.length !== embIds.length * 256) throw Error("embedding size mismatch");
  const byId = new Map(sup.prints.map(p => [p.id, p]));
  if (embIds.length !== sup.prints.length || embIds.some(id => !byId.has(id))) throw Error("embeddings do not cover the prepared prints");
  const report = {};

  // prints.json: one row per paper print in its printed language, as the snapshot had.
  const prints = readJson(path.join(data, "prints.json")), printIndex = new Map(prints.map((p, i) => [p.id, i]));
  let addedPrints = 0;
  for (const p of sup.prints) {
    // The app has no Klingon language setting; the 2026-10-23 snapshot also stored TRK 436-445 as "en".
    const row = { id: p.id, oracleId: p.oracleId, set: p.set, number: p.number, lang: p.lang === "tlh" ? "en" : p.lang, finishes: p.finishes };
    if (printIndex.has(p.id)) prints[printIndex.get(p.id)] = row; else { prints.push(row); addedPrints++; }
  }
  writeFileSync(path.join(data, "prints.json"), JSON.stringify(prints));
  report.addedPrints = addedPrints;

  // identities.json: new Oracle identities, and Japanese names for those that lack one.
  const identities = readJson(path.join(data, "identities.json")), identity = new Map(identities.map(c => [c.oracleId, c]));
  const jaName = new Map(); for (const j of sup.japanesePrints) if (japanese(j.name) && !jaName.has(j.oracleId)) jaName.set(j.oracleId, j.name);
  let addedIdentities = 0, addedNames = 0;
  for (const p of sup.prints) {
    let c = identity.get(p.oracleId);
    if (!c) { c = { oracleId: p.oracleId, name: p.name, aliases: [p.name] }; identities.push(c); identity.set(p.oracleId, c); addedIdentities++; }
    const name = jaName.get(p.oracleId);
    if (name && !(c.aliases || []).some(japanese)) { c.aliases = [name, ...(c.aliases || [])]; addedNames++; }
  }
  writeFileSync(path.join(data, "identities.json"), JSON.stringify(identities));
  Object.assign(report, { addedIdentities, addedNames });

  // cards.json + phash.bin: one fingerprint per artwork.
  const cards = readJson(path.join(data, "cards.json")), cardIndex = new Map(cards.map((c, i) => [c.id, i]));
  const oldBin = readFileSync(path.join(data, "phash.bin")), added = [];
  const bin = Buffer.alloc((cards.length + Object.keys(hashes).filter(id => !cardIndex.has(id)).length) * 32);
  oldBin.copy(bin);
  let replacedHashes = 0;
  for (const [id, hex] of Object.entries(hashes)) {
    if (!/^[0-9a-f]{64}$/.test(hex)) throw Error("bad hash " + id);
    let i = cardIndex.get(id);
    if (i === undefined) { i = cards.length; cards.push({ id, oracleId: byId.get(id).oracleId }); added.push(id); } else replacedHashes++;
    Buffer.from(hex, "hex").copy(bin, i * 32);
  }
  if (bin.length !== cards.length * 32) throw Error("pHash rows mismatch");
  writeFileSync(path.join(data, "cards.json"), JSON.stringify(cards));
  writeFileSync(path.join(data, "phash.bin"), bin);
  const meta = readJson(path.join(data, "phash-meta.json"));
  meta.rows = cards.length; meta.sha256 = createHash("sha256").update(bin).digest("hex"); meta.identityCount = new Set(cards.map(c => c.oracleId)).size;
  meta.supplements = [...(meta.supplements || []).filter(s => s.sets.join() !== sup.sets.join()), { sets: sup.sets, imageSource: "Scryfall small, fetched " + sup.fetchedAt.slice(0, 10), rows: Object.keys(hashes).length }];
  writeFileSync(path.join(data, "phash-meta.json"), JSON.stringify(meta, null, 2));
  Object.assign(report, { addedFingerprints: added.length, refreshedFingerprints: replacedHashes });

  // milo-cards.json + full-features.f16.bin: one embedding per print.
  const milo = readJson(path.join(data, "milo-cards.json")), miloIndex = new Map(milo.map((c, i) => [c.id, i]));
  const oldFeatures = readFileSync(path.join(data, "full-features.f16.bin"));
  const newRows = embIds.filter(id => !miloIndex.has(id)).length;
  const features = Buffer.alloc((milo.length + newRows) * 256); oldFeatures.copy(features);
  let replacedEmbeddings = 0;
  embIds.forEach((id, k) => {
    let i = miloIndex.get(id);
    if (i === undefined) { i = milo.length; milo.push({ id, oracleId: byId.get(id).oracleId }); } else replacedEmbeddings++;
    emb.copy(features, i * 256, k * 256, k * 256 + 256);
  });
  writeFileSync(path.join(data, "milo-cards.json"), JSON.stringify(milo));
  writeFileSync(path.join(data, "full-features.f16.bin"), features);
  const source = readJson(path.join(data, "milo-source.json"));
  source.rows = milo.length;
  source.supplements = [...(source.supplements || []).filter(s => s.sets.join() !== sup.sets.join()), { sets: sup.sets, imageSource: "Scryfall normal, fetched " + sup.fetchedAt.slice(0, 10), rows: embIds.length, preprocessing: "448x448 bilinear, ImageNet mean/std, L2 normalised (scripts/build-set-scanner-embeddings.py)" }];
  writeFileSync(path.join(data, "milo-source.json"), JSON.stringify(source, null, 2));
  Object.assign(report, { addedEmbeddings: newRows, refreshedEmbeddings: replacedEmbeddings });

  // print-display.json: set names and dates; Japanese image buckets for prints with a real Japanese scan.
  const display = readJson(path.join(data, "print-display.json"));
  for (const p of sup.prints) { display.sets[p.set] ||= p.setName; if (!display.releaseDates[p.set] || p.released > display.releaseDates[p.set]) display.releaseDates[p.set] = p.released; }
  const manifest = readJson(path.join(data, "japanese-image-manifest.json"));
  for (const set of sup.sets) {
    const rows = sup.japanesePrints.filter(j => j.set === set && j.normal && !["placeholder", "missing"].includes(j.imageStatus));
    const old = manifest.sets[set];
    if (old) { manifest.total -= old.records; manifest.stats.available -= old.records; manifest.stats.scryfallAvailable -= old.records; }
    if (!rows.length) { delete manifest.sets[set]; delete display.japanesePrintings[set]; continue; }
    const bucket = {};
    for (const j of rows) bucket[String(j.number).replace(/^0+(?=\d)/, "").toLowerCase()] = { set, number: j.number, language: "ja", oracleId: j.oracleId, images: { normal: j.normal }, source: "scryfall-ja-verified", imageStatus: j.imageStatus };
    const text = JSON.stringify(bucket), file = path.join(data, "japanese-image-sets", `set-${set}.json`);
    writeFileSync(file, text);
    const bytes = Buffer.byteLength(text);
    manifest.sets[set] = { path: `./japanese-image-sets/set-${set}.json`, bytes, sha256: createHash("sha256").update(text).digest("hex"), records: rows.length };
    manifest.total += rows.length; manifest.stats.available += rows.length; manifest.stats.scryfallAvailable += rows.length;
    display.japanesePrintings[set] = Object.keys(bucket);
    report["japanese_" + set] = rows.length;
  }
  manifest.buildId = createHash("sha256").update(JSON.stringify(manifest.sets)).digest("hex").slice(0, 12);
  writeFileSync(path.join(data, "japanese-image-manifest.json"), JSON.stringify(manifest));
  writeFileSync(path.join(data, "print-display.json"), JSON.stringify(display));

  const coverage = readJson(path.join(repo, "scanner", "coverage.json"));
  const referenced = new Set(cards.map(c => c.oracleId));
  if (sup.prints.some(p => !referenced.has(p.oracleId))) throw Error("a supplemented identity has no fingerprint row");
  Object.assign(coverage, { paperPrintingIds: new Set(prints.map(p => p.id)).size, printingFaceRecords: prints.length, identityCount: referenced.size, referenceCount: cards.length });
  coverage.supplements = [...(coverage.supplements || []).filter(s => s.sets.join() !== sup.sets.join()), { sets: sup.sets, fetchedAt: sup.fetchedAt.slice(0, 10), prints: sup.prints.length }];
  writeFileSync(path.join(repo, "scanner", "coverage.json"), JSON.stringify(coverage, null, 2) + "\n");
  console.log(JSON.stringify(report));
}
