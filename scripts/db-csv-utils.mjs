import { readFile } from "node:fs/promises";
import vm from "node:vm";

export const CSV_COLUMNS = [
  "source",
  "sourceUrl",
  "setCode",
  "collectorNumber",
  "setNameJa",
  "jaNames",
  "enNames",
  "scryfallName",
  "oracleId",
  "scryfallId",
  "image",
  "imageNormal",
  "imageBack",
  "releasedAt",
];

export function normalizeName(value) {
  return String(value || "").normalize("NFKC").trim().toLocaleLowerCase("ja");
}

export function splitMultiValue(value) {
  return String(value || "")
    .split("|")
    .map(item => item.trim())
    .filter(Boolean);
}

export function joinMultiValue(values) {
  return [...new Set((values || []).map(value => String(value || "").trim()).filter(Boolean))].join("|");
}

export function csvEscape(value) {
  const text = String(value ?? "");
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

export function toCsv(rows, columns = CSV_COLUMNS) {
  return [
    columns.map(csvEscape).join(","),
    ...rows.map(row => columns.map(column => csvEscape(row[column])).join(",")),
  ].join("\r\n") + "\r\n";
}

export function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];
    if (inQuotes) {
      if (char === '"' && next === '"') {
        field += '"';
        i += 1;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        field += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (char !== "\r") {
      field += char;
    }
  }
  if (field || row.length) {
    row.push(field);
    rows.push(row);
  }
  if (!rows.length) return [];
  const headers = rows.shift().map(header => header.trim());
  return rows
    .filter(values => values.some(value => String(value || "").trim()))
    .map(values => Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""])));
}

export async function loadWindowArray(filePath, globalName) {
  const code = await readFile(filePath, "utf8");
  const sandbox = { window: {} };
  vm.createContext(sandbox);
  vm.runInContext(code, sandbox, { filename: filePath });
  const value = sandbox.window[globalName];
  return Array.isArray(value) ? value : [];
}

export function entryKey(entry) {
  if (entry.oracleId) return `oracle:${entry.oracleId}`;
  if (entry.scryfallId) return `scryfall:${entry.scryfallId}`;
  if (entry.setCode && entry.collectorNumber) return `print:${String(entry.setCode).toLowerCase()}:${entry.collectorNumber}`;
  if (entry.scryfallName) return `name:${normalizeName(entry.scryfallName)}`;
  return "";
}

export function entryToCsvRow(entry) {
  return {
    source: entry.source || "",
    sourceUrl: entry.sourceUrl || "",
    setCode: entry.setCode || "",
    collectorNumber: entry.collectorNumber || "",
    setNameJa: entry.setNameJa || "",
    jaNames: joinMultiValue(entry.jaNames),
    enNames: joinMultiValue(entry.enNames),
    scryfallName: entry.scryfallName || "",
    oracleId: entry.oracleId || "",
    scryfallId: entry.scryfallId || "",
    image: entry.image || "",
    imageNormal: entry.images?.normal || "",
    imageBack: entry.images?.back || "",
    releasedAt: entry.releasedAt || "",
  };
}

export function csvRowToEntry(row) {
  const entry = {
    source: row.source || "csv",
    sourceUrl: row.sourceUrl || "",
    setCode: row.setCode || "",
    collectorNumber: row.collectorNumber || "",
    setNameJa: row.setNameJa || "",
    jaNames: splitMultiValue(row.jaNames),
    enNames: splitMultiValue(row.enNames),
    scryfallName: row.scryfallName || splitMultiValue(row.enNames)[0] || "",
    oracleId: row.oracleId || "",
    scryfallId: row.scryfallId || "",
    image: row.image || "",
    releasedAt: row.releasedAt || "",
  };
  const normal = row.imageNormal || "";
  const back = row.imageBack || "";
  if (normal || back) entry.images = { ...(normal ? { normal } : {}), ...(back ? { back } : {}) };
  Object.keys(entry).forEach(key => {
    if (entry[key] === "" || (Array.isArray(entry[key]) && !entry[key].length)) delete entry[key];
  });
  return entry;
}

export function mergeEntry(base, patch) {
  const merged = { ...base, ...Object.fromEntries(Object.entries(patch).filter(([, value]) => value !== undefined && value !== "")) };
  merged.jaNames = [...new Set([...(base.jaNames || []), ...(patch.jaNames || [])])];
  merged.enNames = [...new Set([...(base.enNames || []), ...(patch.enNames || [])])];
  if (base.images || patch.images) merged.images = { ...(base.images || {}), ...(patch.images || {}) };
  return merged;
}
