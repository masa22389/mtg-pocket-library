const APP_VERSION = "v112";
const KEYS = { collection: "mtg-pocket.collection.v1", decks: "mtg-pocket.decks.v1", fx: "mtg-pocket.fx.v1", collectionViewMode: "mtg-pocket.collectionViewMode.v2", collectionSortStack: "mtg-pocket.collectionSortStack.v1", deckFormatFilter: "mtg-pocket.deckFormatFilter.v1", sets: "mtg-pocket.sets.v1", backupMeta: "mtg-pocket.backupMeta.v1" };
const DAY_MS = 24 * 60 * 60 * 1000;
const state = {
  collection: read(KEYS.collection, []),
  decks: read(KEYS.decks, []),
  fx: read(KEYS.fx, { usdJpy: 0, updatedAt: 0, source: "" }),
  backupMeta: read(KEYS.backupMeta, { lastExportedAt: 0 }),
  searchResults: [],
  searchGroups: [],
  sets: read(KEYS.sets, []),
  selectedCard: null,
  cardVariants: [],
  cardDialogMode: "collection",
  variantCache: new Map(),
  selectedOwnedId: null,
  collectionViewMode: localStorage.getItem(KEYS.collectionViewMode) || "hidden",
  collectionSortStack: read(KEYS.collectionSortStack, []),
  deckFormatFilter: localStorage.getItem(KEYS.deckFormatFilter) || "",
  editingDeck: null,
  editingDeckEntry: null,
  deckMissingOpen: false,
  deckSearchResults: [],
  deckEntryVariants: [],
  installPrompt: null,
};

const $ = selector => document.querySelector(selector);
const els = {
  totalCards: $("#totalCards"), uniqueCards: $("#uniqueCards"), collectionValue: $("#collectionValue"), priceStatus: $("#priceStatus"), cardSearch: $("#cardSearch"),
  searchButton: $("#searchButton"), searchStatus: $("#searchStatus"), searchResults: $("#searchResults"),
  ocrCameraInput: $("#ocrCameraInput"), ocrFileInput: $("#ocrFileInput"), ocrStatus: $("#ocrStatus"),
  searchMatch: $("#searchMatch"), searchColor: $("#searchColor"), searchMana: $("#searchMana"), searchType: $("#searchType"), searchSet: $("#searchSet"), searchSetIncludeExtras: $("#searchSetIncludeExtras"), clearSearchFilters: $("#clearSearchFilters"),
  collectionFilter: $("#collectionFilter"), collectionViewMode: $("#collectionViewMode"), collectionColor: $("#collectionColor"),
  collectionMana: $("#collectionMana"), collectionType: $("#collectionType"), collectionPriceFilter: $("#collectionPriceFilter"),
  collectionFavoritesOnly: $("#collectionFavoritesOnly"),
  sortCollectionByName: $("#sortCollectionByName"), sortCollectionByColor: $("#sortCollectionByColor"),
  sortCollectionByMana: $("#sortCollectionByMana"), sortCollectionByType: $("#sortCollectionByType"),
  sortCollectionByValue: $("#sortCollectionByValue"), sortCollectionByUnitPrice: $("#sortCollectionByUnitPrice"),
  resetCollectionSort: $("#resetCollectionSort"), collectionSortStatus: $("#collectionSortStatus"),
  clearCollectionFilters: $("#clearCollectionFilters"), collectionList: $("#collectionList"), deckFormatFilter: $("#deckFormatFilter"), deckList: $("#deckList"), deckImportInput: $("#deckImportInput"),
  cardDialog: $("#cardDialog"), cardPreview: $("#cardPreview"), cardQuantity: $("#cardQuantity"),
  cardVariants: $("#cardVariants"), variantFilter: $("#variantFilter"), variantCount: $("#variantCount"),
  decrementQuantity: $("#decrementQuantity"), incrementQuantity: $("#incrementQuantity"),
  cardCondition: $("#cardCondition"), cardFinish: $("#cardFinish"), cardLanguage: $("#cardLanguage"),
  cardLocation: $("#cardLocation"), addCardButton: $("#addCardButton"), addCardToDeckButton: $("#addCardToDeckButton"),
  cardActionStatus: $("#cardActionStatus"), deckDialog: $("#deckDialog"),
  favoriteCardButton: $("#favoriteCardButton"), deleteCardButton: $("#deleteCardButton"),
  deckName: $("#deckName"), deckFormat: $("#deckFormat"), deckCount: $("#deckCount"),
  deckMissing: $("#deckMissing"), deckStats: $("#deckStats"), deckMissingList: $("#deckMissingList"), deckDates: $("#deckDates"), deckMemo: $("#deckMemo"), deckCardFilter: $("#deckCardFilter"), deckSection: $("#deckSection"),
  openDeckOwnedAdd: $("#openDeckOwnedAdd"), openDeckSearchAdd: $("#openDeckSearchAdd"),
  deckOwnedAddDialog: $("#deckOwnedAddDialog"), deckSearchAddDialog: $("#deckSearchAddDialog"),
  deckOwnedColor: $("#deckOwnedColor"), deckOwnedMana: $("#deckOwnedMana"), deckOwnedType: $("#deckOwnedType"),
  deckOwnedFavoritesOnly: $("#deckOwnedFavoritesOnly"),
  clearDeckOwnedFilters: $("#clearDeckOwnedFilters"),
  deckOwnedAddStatus: $("#deckOwnedAddStatus"), deckCandidates: $("#deckCandidates"), deckGlobalSearch: $("#deckGlobalSearch"),
  deckGlobalSearchButton: $("#deckGlobalSearchButton"), deckGlobalSearchStatus: $("#deckGlobalSearchStatus"),
  deckSearchMatch: $("#deckSearchMatch"), deckSearchColor: $("#deckSearchColor"), deckSearchMana: $("#deckSearchMana"), deckSearchType: $("#deckSearchType"), deckSearchSet: $("#deckSearchSet"), deckSearchSetIncludeExtras: $("#deckSearchSetIncludeExtras"), clearDeckSearchFilters: $("#clearDeckSearchFilters"),
  deckGlobalSearchResults: $("#deckGlobalSearchResults"), deckCards: $("#deckCards"), duplicateDeckButton: $("#duplicateDeckButton"), deleteDeckButton: $("#deleteDeckButton"),
  openDeckVisual: $("#openDeckVisual"), deckVisualDialog: $("#deckVisualDialog"), deckVisualTitle: $("#deckVisualTitle"),
  deckVisualSummary: $("#deckVisualSummary"), deckVisualBoard: $("#deckVisualBoard"),
  deckEntryDialog: $("#deckEntryDialog"), deckEntryVariantDialog: $("#deckEntryVariantDialog"), deckEntryImage: $("#deckEntryImage"), openDeckEntryVariants: $("#openDeckEntryVariants"), deckEntrySet: $("#deckEntrySet"),
  deckEntryName: $("#deckEntryName"), deckEntryOwned: $("#deckEntryOwned"), deckEntrySection: $("#deckEntrySection"),
  deckEntryVariants: $("#deckEntryVariants"), deckEntryVariantFilter: $("#deckEntryVariantFilter"), deckEntryVariantCount: $("#deckEntryVariantCount"),
  deckEntryQuantity: $("#deckEntryQuantity"), decrementDeckEntry: $("#decrementDeckEntry"),
  incrementDeckEntry: $("#incrementDeckEntry"), moveDeckEntryUp: $("#moveDeckEntryUp"), moveDeckEntryDown: $("#moveDeckEntryDown"), removeDeckEntry: $("#removeDeckEntry"),
  mainDeckEntryQuantity: $("#mainDeckEntryQuantity"), sideDeckEntryQuantity: $("#sideDeckEntryQuantity"), commanderDeckEntryQuantity: $("#commanderDeckEntryQuantity"), maybeDeckEntryQuantity: $("#maybeDeckEntryQuantity"),
  decrementMainDeckEntry: $("#decrementMainDeckEntry"), incrementMainDeckEntry: $("#incrementMainDeckEntry"),
  decrementSideDeckEntry: $("#decrementSideDeckEntry"), incrementSideDeckEntry: $("#incrementSideDeckEntry"),
  decrementMaybeDeckEntry: $("#decrementMaybeDeckEntry"), incrementMaybeDeckEntry: $("#incrementMaybeDeckEntry"),
  decrementCommanderDeckEntry: $("#decrementCommanderDeckEntry"), incrementCommanderDeckEntry: $("#incrementCommanderDeckEntry"),
  sortDeckByName: $("#sortDeckByName"), sortDeckByColor: $("#sortDeckByColor"), sortDeckByMana: $("#sortDeckByMana"), sortDeckByType: $("#sortDeckByType"),
  usdJpyRate: $("#usdJpyRate"), saveFxButton: $("#saveFxButton"), fxHelp: $("#fxHelp"),
  installButton: $("#installButton"), backupSummary: $("#backupSummary"), importInput: $("#importInput"), toast: $("#toast"),
};

function read(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
}

function persist() {
  localStorage.setItem(KEYS.collection, JSON.stringify(state.collection));
  localStorage.setItem(KEYS.decks, JSON.stringify(state.decks));
  localStorage.setItem(KEYS.fx, JSON.stringify(state.fx));
}

function uid() { return crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`; }
function esc(value) { return String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;"); }
function isJapaneseCard(card) { return (card?.lang || card?.language || "") === "ja"; }
function imageOf(card) { return card?.jpImage || card?.jpImages?.normal || card?.image_uris?.normal || card?.card_faces?.[0]?.image_uris?.normal || card?.image || ""; }
function backImageOf(card) { return card?.jpImages?.back || card?.card_faces?.[1]?.image_uris?.normal || ""; }
function typeOf(card) { return card.printed_type_line || card.printedTypeLine || card.type_line || card.typeLine || ""; }
function nameOf(card) { return (isJapaneseCard(card) ? card.jpName : "") || card.printed_name || card.printedName || card.name || "名称不明"; }
function altNameOf(card) { const printed = (isJapaneseCard(card) ? card.jpName : "") || card.printed_name || card.printedName; return printed && printed !== card.name ? card.name : ""; }
function isJapanese(text) { return /[\u3040-\u30ff\u3400-\u9fff]/.test(text); }
function formatYen(value) { return new Intl.NumberFormat("ja-JP", { style: "currency", currency: "JPY", maximumFractionDigits: 0 }).format(value); }
function formatDeckDate(value) { return value ? new Date(value).toLocaleDateString("ja-JP") : "-"; }
function formatDateTime(value) { return value ? new Date(value).toLocaleString("ja-JP", { dateStyle: "short", timeStyle: "short" }) : "未作成"; }
function backupFileStamp(value = new Date()) {
  const pad = number => String(number).padStart(2, "0");
  return `${value.getFullYear()}${pad(value.getMonth() + 1)}${pad(value.getDate())}-${pad(value.getHours())}${pad(value.getMinutes())}`;
}
function ensureDeckDates(deck) {
  if (!deck) return false;
  let changed = false;
  const now = Date.now();
  if (!deck.createdAt) { deck.createdAt = deck.updatedAt || now; changed = true; }
  if (!deck.updatedAt) { deck.updatedAt = deck.createdAt; changed = true; }
  return changed;
}
function usdPriceOf(card) {
  const value = card.finish === "foil" ? card.priceUsdFoil : card.finish === "etched" ? card.priceUsdEtched : card.priceUsd;
  return value == null || value === "" ? null : Number(value);
}
function selectedPriceUsesEnglish(card) {
  return card.finish === "foil" ? card.priceUsdFoilFromEnglish === true : card.finish === "etched" ? card.priceUsdEtchedFromEnglish === true : card.priceUsdFromEnglish === true;
}
function yenValueOf(card) { const usd = usdPriceOf(card); return usd != null && state.fx.usdJpy ? usd * state.fx.usdJpy * Number(card.quantity || 0) : null; }
function unitYenValueOf(card) { const value = yenValueOf(card); const quantity = Number(card.quantity || 0); return value != null && quantity > 0 ? value / quantity : null; }

const CARD_NAME_ALIASES = [
  {
    source: "manual",
    target: "Avatar Aang",
    aliases: ["アバター・アン", "アバター アン", "アバターアン"],
  },
];
const MTG_JP_CARD_INDEX = Array.isArray(window.MTG_JP_CARD_INDEX) ? window.MTG_JP_CARD_INDEX : [];
const MTGJSON_JP_SEARCH_INDEX = Array.isArray(window.MTGJSON_JP_SEARCH_INDEX) ? window.MTGJSON_JP_SEARCH_INDEX : [];
const JP_CARD_SEARCH_INDEX = [...MTG_JP_CARD_INDEX, ...MTGJSON_JP_SEARCH_INDEX];
const JP_INDEX_BY_SCRYFALL_ID = new Map();
const JP_INDEX_BY_ORACLE_ID = new Map();
const JP_INDEX_BY_EN_NAME = new Map();
const JP_ALIAS_TARGETS_EXACT = new Map();
const JP_ALIAS_TARGET_CACHE = new Map();

const SET_JA_NAMES = {
  eoe: "久遠の終端", eoc: "久遠の終端 統率者",
  inr: "イニストラード・リマスター",
  fin: "マジック：ザ・ギャザリング——FINAL FANTASY", fic: "FINAL FANTASY 統率者",
  tdm: "タルキール：龍嵐録", tdc: "タルキール：龍嵐録 統率者",
  dft: "霊気走破", drc: "霊気走破 統率者",
  fdn: "ファウンデーションズ", j25: "ジャンプスタート2025",
  dsk: "ダスクモーン：戦慄の館", dsc: "ダスクモーン：戦慄の館 統率者",
  blb: "ブルームバロウ", blc: "ブルームバロウ 統率者",
  mh3: "モダンホライゾン3", m3c: "モダンホライゾン3 統率者",
  otj: "サンダー・ジャンクションの無法者", otc: "サンダー・ジャンクションの無法者 統率者",
  mkm: "カルロフ邸殺人事件", mkc: "カルロフ邸殺人事件 統率者",
  lci: "イクサラン：失われし洞窟", lcc: "イクサラン：失われし洞窟 統率者",
  woe: "エルドレインの森", woc: "エルドレインの森 統率者",
  ltr: "指輪物語：中つ国の伝承", ltc: "指輪物語：中つ国の伝承 統率者",
  mat: "機械兵団の進軍：決戦の後に", mom: "機械兵団の進軍", moc: "機械兵団の進軍 統率者",
  one: "ファイレクシア：完全なる統一", onc: "ファイレクシア：完全なる統一 統率者",
  bro: "兄弟戦争", brc: "兄弟戦争 統率者",
  dmu: "団結のドミナリア", dmc: "団結のドミナリア 統率者",
  snc: "ニューカペナの街角", ncc: "ニューカペナの街角 統率者",
  neo: "神河：輝ける世界", nec: "神河：輝ける世界 統率者",
  vow: "イニストラード：真紅の契り", voc: "真紅の契り 統率者",
  mid: "イニストラード：真夜中の狩り", mic: "真夜中の狩り 統率者",
  afr: "フォーゴトン・レルム探訪", afc: "フォーゴトン・レルム探訪 統率者",
  stx: "ストリクスヘイヴン：魔法学院", c21: "統率者2021",
  khm: "カルドハイム", khc: "カルドハイム 統率者",
  znr: "ゼンディカーの夜明け", znc: "ゼンディカーの夜明け 統率者",
  iko: "イコリア：巨獣の棲処", c20: "統率者2020",
  thb: "テーロス還魂記", eld: "エルドレインの王権",
  m21: "基本セット2021", m20: "基本セット2020", m19: "基本セット2019",
  war: "灯争大戦", rna: "ラヴニカの献身", grn: "ラヴニカのギルド",
  dom: "ドミナリア", rix: "イクサランの相克", xln: "イクサラン",
  spg: "スペシャルゲスト", mb2: "ミステリーブースター2",
  "2x2": "ダブルマスターズ2022", "2xm": "ダブルマスターズ", cmm: "統率者マスターズ",
  dm2: "ドミナリア・リマスター", dmr: "ドミナリア・リマスター", tsr: "時のらせんリマスター",
  rvr: "ラヴニカ・リマスター", cma: "統率者アンソロジー", cm2: "統率者アンソロジー Volume II",
  clb: "統率者レジェンズ：バルダーズ・ゲートの戦い", cmr: "統率者レジェンズ",
  "40k": "ウォーハンマー40,000 統率者デッキ", who: "ドクター・フー 統率者デッキ",
  pip: "Fallout 統率者デッキ", sld: "Secret Lair Drop",
  j22: "ジャンプスタート2022", j21: "ジャンプスタート：ヒストリック・ホライゾン", jmp: "ジャンプスタート",
  m25: "マスターズ25th", ima: "アイコニックマスターズ", a25: "マスターズ25th",
  ema: "エターナルマスターズ", mm3: "モダンマスターズ2017", mm2: "モダンマスターズ2015", mma: "モダンマスターズ",
  vma: "ヴィンテージマスターズ", uma: "アルティメットマスターズ", mh2: "モダンホライゾン2", mh1: "モダンホライゾン",
  c19: "統率者2019", c18: "統率者2018", c17: "統率者2017", c16: "統率者2016", c15: "統率者2015", c14: "統率者2014", c13: "統率者2013",
  cns: "コンスピラシー", cn2: "コンスピラシー：王位争奪", c12: "統率者", cmd: "統率者",
  bbd: "バトルボンド", ust: "Unstable", unr: "Unhinged", ulg: "ウルザズ・レガシー",
  m18: "基本セット2018", hou: "破滅の刻", akh: "アモンケット", akr: "アモンケットリマスター", aer: "霊気紛争", kld: "カラデシュ", klr: "カラデシュリマスター",
  emn: "異界月", soi: "イニストラードを覆う影", ogw: "ゲートウォッチの誓い", bfz: "戦乱のゼンディカー",
  ori: "マジック・オリジン", dtk: "タルキール龍紀伝", frf: "運命再編", ktk: "タルキール覇王譚", v17: "From the Vault: Transform",
  m15: "基本セット2015", jou: "ニクスへの旅", bng: "神々の軍勢", ths: "テーロス",
  m14: "基本セット2014", dgm: "ドラゴンの迷路", gtc: "ギルド門侵犯", rtr: "ラヴニカへの回帰",
  m13: "基本セット2013", avr: "アヴァシンの帰還", dka: "闇の隆盛", isd: "イニストラード",
  m12: "基本セット2012", nph: "新たなるファイレクシア", mbs: "ミラディン包囲戦", som: "ミラディンの傷跡",
  m11: "基本セット2011", roe: "エルドラージ覚醒", wwk: "ワールドウェイク", zen: "ゼンディカー",
  m10: "基本セット2010", arb: "アラーラ再誕", con: "コンフラックス", ala: "アラーラの断片",
  "10e": "第10版", eve: "イーブンタイド", shm: "シャドウムーア", mor: "モーニングタイド", lrw: "ローウィン", lor: "ローウィン",
  fut: "未来予知", plc: "次元の混乱", tsp: "時のらせん",
  csp: "コールドスナップ", dis: "ディセンション", gpt: "ギルドパクト", rav: "ラヴニカ：ギルドの都",
  sok: "神河救済", bok: "神河謀叛", chk: "神河物語",
  "5dn": "フィフス・ドーン", dst: "ダークスティール", mrd: "ミラディン",
  scg: "スカージ", lgn: "レギオン", ons: "オンスロート",
  jud: "ジャッジメント", tor: "トーメント", ody: "オデッセイ",
  apc: "アポカリプス", pls: "プレーンシフト", inv: "インベイジョン",
  pcy: "プロフェシー", nem: "ネメシス", mmq: "メルカディアン・マスクス",
  uds: "ウルザズ・デスティニー", usg: "ウルザズ・サーガ",
  exo: "エクソダス", sth: "ストロングホールド", tmp: "テンペスト",
  wth: "ウェザーライト", vis: "ビジョンズ", mir: "ミラージュ",
  hml: "ホームランド", ice: "アイスエイジ", chr: "クロニクル",
  drk: "ザ・ダーク", leg: "レジェンド", atq: "アンティキティー", arn: "アラビアンナイト",
  "9ed": "第9版", "8ed": "第8版", "7ed": "第7版", "6ed": "第6版", "5ed": "第5版", "4ed": "第4版", "3ed": "リバイズド", "2ed": "アンリミテッド", lea: "リミテッド・エディション アルファ", leb: "リミテッド・エディション ベータ",
};

const PRIMARY_SET_TYPES = new Set(["expansion", "core", "masters", "commander", "draft_innovation", "jumpstart"]);
const HIDDEN_SET_TYPES = new Set(["token", "memorabilia", "alchemy", "funny", "minigame", "promo", "box"]);
const HIDDEN_SET_NAME_PATTERN = /\b(promo|promos|arena|anthology|bonus sheet|alchemy|treasure chest|regional|showdown|love your lgs|through the ages|stellar sights|the big score)\b/i;

const FALLBACK_SETS = [
  { code: "fin", name: "Magic: The Gathering—FINAL FANTASY", released_at: "2025-06-13", set_type: "expansion" },
  { code: "tdm", name: "Tarkir: Dragonstorm", released_at: "2025-04-11", set_type: "expansion" },
  { code: "dft", name: "Aetherdrift", released_at: "2025-02-14", set_type: "expansion" },
  { code: "fdn", name: "Magic: The Gathering Foundations", released_at: "2024-11-15", set_type: "core" },
  { code: "dsk", name: "Duskmourn: House of Horror", released_at: "2024-09-27", set_type: "expansion" },
  { code: "blb", name: "Bloomburrow", released_at: "2024-08-02", set_type: "expansion" },
  { code: "mh3", name: "Modern Horizons 3", released_at: "2024-06-14", set_type: "draft_innovation" },
  { code: "otj", name: "Outlaws of Thunder Junction", released_at: "2024-04-19", set_type: "expansion" },
  { code: "mkm", name: "Murders at Karlov Manor", released_at: "2024-02-09", set_type: "expansion" },
  { code: "lci", name: "The Lost Caverns of Ixalan", released_at: "2023-11-17", set_type: "expansion" },
  { code: "woe", name: "Wilds of Eldraine", released_at: "2023-09-08", set_type: "expansion" },
  { code: "ltr", name: "The Lord of the Rings: Tales of Middle-earth", released_at: "2023-06-23", set_type: "draft_innovation" },
  { code: "mom", name: "March of the Machine", released_at: "2023-04-21", set_type: "expansion" },
  { code: "one", name: "Phyrexia: All Will Be One", released_at: "2023-02-03", set_type: "expansion" },
  { code: "bro", name: "The Brothers' War", released_at: "2022-11-18", set_type: "expansion" },
  { code: "dmu", name: "Dominaria United", released_at: "2022-09-09", set_type: "expansion" },
  { code: "neo", name: "Kamigawa: Neon Dynasty", released_at: "2022-02-18", set_type: "expansion" },
];

function normalizeSetCode(value) {
  return String(value || "").trim().toLowerCase().replace(/[^a-z0-9]/g, "");
}

function resolveSetInput(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  const normalized = normalizeSetCode(raw);
  const sets = state.sets.length ? state.sets : FALLBACK_SETS;
  const matched = sets.find(set => {
    const code = normalizeSetCode(set.code);
    const enName = normalizeSetCode(set.name);
    const jaName = normalizeSetCode(SET_JA_NAMES[String(set.code || "").toLowerCase()] || "");
    return code === normalized || enName === normalized || jaName === normalized;
  }) || sets.find(set => {
    const enName = normalizeSetCode(set.name);
    const jaName = normalizeSetCode(SET_JA_NAMES[String(set.code || "").toLowerCase()] || "");
    return normalized.length >= 3 && (enName.includes(normalized) || jaName.includes(normalized));
  });
  return normalizeSetCode(matched?.code || raw);
}

function setDisplayName(set) {
  const code = String(set.code || "").toLowerCase();
  return `${SET_JA_NAMES[code] || set.name || code.toUpperCase()}（${code.toUpperCase()}）`;
}

function isUsefulSet(set) {
  return Boolean(set?.code) && !HIDDEN_SET_TYPES.has(set.set_type);
}

function isPrimarySet(set) {
  if (!isUsefulSet(set)) return false;
  if (HIDDEN_SET_NAME_PATTERN.test(set.name || "")) return false;
  if (PRIMARY_SET_TYPES.has(set.set_type)) return true;
  return Boolean(SET_JA_NAMES[String(set.code || "").toLowerCase()]);
}

function renderSetSelects() {
  const allSets = (state.sets.length ? state.sets : FALLBACK_SETS)
    .filter(isUsefulSet)
    .sort((a, b) => String(b.released_at || "").localeCompare(String(a.released_at || "")));
  [els.searchSet, els.deckSearchSet].forEach(select => {
    if (!select) return;
    if (select.tagName !== "SELECT") return;
    const sets = allSets.filter(isPrimarySet);
    const options = ['<option value="">すべて</option>'].concat(
      sets.map(set => `<option value="${esc(normalizeSetCode(set.code))}">${esc(setDisplayName(set))}</option>`)
    ).join("");
    const current = select.value;
    select.innerHTML = options;
    if ([...select.options].some(option => option.value === current)) select.value = current;
  });
}

async function hydrateSetOptions() {
  renderSetSelects();
  if (!navigator.onLine) return;
  try {
    const response = await fetch("https://api.scryfall.com/sets", { headers: { Accept: "application/json" } });
    if (!response.ok) throw new Error();
    const data = await response.json();
    state.sets = (data.data || []).map(set => ({
      code: set.code,
      name: set.name,
      released_at: set.released_at,
      set_type: set.set_type,
    }));
    localStorage.setItem(KEYS.sets, JSON.stringify(state.sets));
    renderSetSelects();
  } catch {
    renderSetSelects();
  }
}

function buildScryfallFilters(color, mana, type, setCode = "") {
  const terms = [];
  if (color === "C") terms.push("id=c");
  else if (color === "M") terms.push("is:multicolor");
  else if (color) terms.push(`id>=${color.toLowerCase()}`);
  if (mana === "7+") terms.push("mv>=7");
  else if (mana !== "") terms.push(`mv=${mana}`);
  if (type) terms.push(`t:${type.toLowerCase()}`);
  const normalizedSet = resolveSetInput(setCode);
  if (normalizedSet) terms.push(`set:${normalizedSet}`);
  return terms.join(" ");
}

function quoteScryfall(value) {
  return String(value || "").trim().replaceAll('"', '\\"');
}

function selectedSearchColors() {
  return [...document.querySelectorAll("[data-search-color]:checked")].map(input => input.value);
}

function buildSearchColorFilter() {
  const colors = selectedSearchColors();
  if (!colors.length) return "";
  const order = ["W", "U", "B", "R", "G"];
  const nonColorless = order.filter(color => colors.includes(color));
  const hasColorless = colors.includes("C");
  const mode = $("#searchColorMode")?.value || "and";
  const colorText = nonColorless.join("").toLowerCase();
  const exactTerms = [];
  if (hasColorless) exactTerms.push("c=c");
  if (colorText) exactTerms.push(`c=${colorText}`);
  if (mode === "or") {
    return `(${colors.map(color => color === "C" ? "c=c" : `c:${color.toLowerCase()}`).join(" or ")})`;
  }
  if (mode === "exact") {
    return exactTerms.length > 1 ? `(${exactTerms.join(" or ")})` : exactTerms[0];
  }
  if (hasColorless && !colorText) return "c=c";
  if (hasColorless && colorText) return `c=c c>=${colorText}`;
  return `c>=${colorText}`;
}

function buildCardSearchFilters() {
  const terms = [buildScryfallFilters("", els.searchMana.value, els.searchType.value, els.searchSet.value)];
  const language = $("#searchLanguage")?.value || "";
  const oracleText = $("#searchOracleText")?.value.trim() || "";
  const format = $("#searchFormat")?.value || "";
  const subtype = $("#searchSubtype")?.value.trim() || "";
  const rarity = $("#searchRarity")?.value || "";
  const colorFilter = buildSearchColorFilter();
  if (language) terms.push(`lang:${language}`);
  if (oracleText) terms.push(`o:"${quoteScryfall(oracleText)}"`);
  if (format) terms.push(`legal:${format}`);
  if (subtype) terms.push(`t:"${quoteScryfall(subtype)}"`);
  if (rarity) terms.push(`rarity:${rarity}`);
  if (colorFilter) terms.push(colorFilter);
  return terms.filter(Boolean).join(" ");
}

function updateAdvancedSearchSummary() {
  const summary = $("#advancedSearchSummary");
  if (!summary) return;
  const chips = [];
  if (els.searchMatch?.value === "exact") chips.push("完全一致");
  if (els.searchSet?.value) chips.push(`セット:${els.searchSet.value}`);
  const language = $("#searchLanguage")?.value || "";
  if (language) chips.push(`言語:${$("#searchLanguage").selectedOptions[0]?.textContent || language}`);
  if ($("#searchOracleText")?.value.trim()) chips.push("テキストあり");
  if ($("#searchFormat")?.value) chips.push(`フォーマット:${$("#searchFormat").selectedOptions[0]?.textContent}`);
  if (els.searchType?.value) chips.push(`タイプ:${els.searchType.options[els.searchType.selectedIndex]?.textContent || els.searchType.value}`);
  if ($("#searchSubtype")?.value.trim()) chips.push(`サブタイプ:${$("#searchSubtype").value.trim()}`);
  const colors = selectedSearchColors();
  if (colors.length) chips.push(`色:${colors.join("")}/${$("#searchColorMode")?.selectedOptions[0]?.textContent || "AND"}`);
  if (els.searchMana?.value) chips.push(`マナ:${els.searchMana.value}`);
  if ($("#searchRarity")?.value) chips.push(`レア:${$("#searchRarity").selectedOptions[0]?.textContent}`);
  summary.textContent = chips.length ? `詳細条件：${chips.join(" / ")}` : "詳細条件：指定なし";
}

function initAdvancedSearchUi() {
  const searchCard = document.querySelector(".search-card");
  const panel = searchCard?.querySelector(".search-filters");
  const row = els.cardSearch?.closest(".search-row");
  if (!searchCard || !panel || !row || $("#openAdvancedSearch")) return;

  const openButton = document.createElement("button");
  openButton.id = "openAdvancedSearch";
  openButton.type = "button";
  openButton.className = "ghost advanced-search-open";
  openButton.textContent = "詳細検索";
  row.append(openButton);

  const summary = document.createElement("p");
  summary.id = "advancedSearchSummary";
  summary.className = "advanced-search-summary";
  searchCard.insertBefore(summary, els.searchStatus);

  const dialog = document.createElement("dialog");
  dialog.id = "searchAdvancedDialog";
  dialog.innerHTML = `
    <form method="dialog" class="dialog-card advanced-search-dialog">
      <button class="dialog-close" value="cancel" aria-label="閉じる">×</button>
      <div>
        <span class="eyebrow">ADVANCED SEARCH</span>
        <h2>詳細検索</h2>
        <p class="muted">セット略号は <a href="https://scryfall.com/sets" target="_blank" rel="noopener">Scryfallのセット一覧</a> でも確認できます。</p>
      </div>
      <div id="advancedSearchPanelMount"></div>
      <div class="advanced-search-actions">
        <button id="applyAdvancedSearch" type="button">条件を適用</button>
        <button id="closeAdvancedSearch" class="filter-reset" type="button">閉じる</button>
      </div>
    </form>`;
  document.body.append(dialog);

  panel.classList.add("advanced-search-panel");
  $("#advancedSearchPanelMount").append(panel);
  els.searchSetIncludeExtras?.closest("label")?.remove();
  els.searchColor.closest("label").hidden = true;

  const extra = document.createElement("div");
  extra.className = "advanced-extra-fields";
  extra.innerHTML = `
    <label>言語<select id="searchLanguage">
      <option value="">指定なし</option><option value="ja">日本語</option><option value="en">英語</option><option value="zhs">中国語・簡体字</option><option value="zht">中国語・繁体字</option><option value="ko">韓国語</option><option value="fr">フランス語</option><option value="de">ドイツ語</option><option value="it">イタリア語</option><option value="es">スペイン語</option><option value="pt">ポルトガル語</option><option value="ru">ロシア語</option>
    </select></label>
    <label>カードテキスト検索<input id="searchOracleText" type="search" placeholder="例：draw a card"></label>
    <label>フォーマット<select id="searchFormat">
      <option value="">指定なし</option><option value="standard">スタンダード</option><option value="pioneer">パイオニア</option><option value="modern">モダン</option><option value="legacy">レガシー</option><option value="vintage">ヴィンテージ</option><option value="commander">統率者</option><option value="pauper">パウパー</option><option value="brawl">ブロール</option>
    </select></label>
    <label>サブタイプ検索<input id="searchSubtype" type="search" placeholder="例：Goblin / Samurai"></label>
    <label>レアリティ<select id="searchRarity">
      <option value="">指定なし</option><option value="common">コモン</option><option value="uncommon">アンコモン</option><option value="rare">レア</option><option value="mythic">神話レア</option><option value="special">特殊</option><option value="bonus">ボーナス</option>
    </select></label>
    <label>カラー条件<select id="searchColorMode"><option value="and">AND検索</option><option value="or">OR検索</option><option value="exact">完全一致</option></select></label>
    <fieldset class="advanced-color-box">
      <legend>カラー</legend>
      <label><input type="checkbox" data-search-color value="W">白</label>
      <label><input type="checkbox" data-search-color value="U">青</label>
      <label><input type="checkbox" data-search-color value="B">黒</label>
      <label><input type="checkbox" data-search-color value="R">赤</label>
      <label><input type="checkbox" data-search-color value="G">緑</label>
      <label><input type="checkbox" data-search-color value="C">無色</label>
    </fieldset>`;
  panel.insertBefore(extra, els.clearSearchFilters);
  $("#searchRarity")?.querySelector('option[value="special"]')?.remove();
  $("#searchRarity")?.querySelector('option[value="bonus"]')?.remove();

  openButton.addEventListener("click", () => { updateAdvancedSearchSummary(); dialog.showModal(); });
  $("#closeAdvancedSearch").addEventListener("click", () => { updateAdvancedSearchSummary(); dialog.close(); });
  $("#applyAdvancedSearch").addEventListener("click", () => { updateAdvancedSearchSummary(); dialog.close(); });
  panel.addEventListener("change", updateAdvancedSearchSummary);
  panel.addEventListener("input", updateAdvancedSearchSummary);
  updateAdvancedSearchSummary();
}

function showToast(message) {
  els.toast.textContent = message;
  els.toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => els.toast.classList.remove("show"), 2200);
}

function showInlineStatus(element, message) {
  if (!element) return;
  element.textContent = message;
  element.classList.add("show");
  clearTimeout(element.statusTimer);
  element.statusTimer = setTimeout(() => element.classList.remove("show"), 2200);
}

function showView(name) {
  document.querySelectorAll(".view").forEach(view => view.classList.toggle("active", view.id === `${name}View`));
  document.querySelectorAll(".bottom-nav button").forEach(button => button.classList.toggle("active", button.dataset.view === name));
  if (name === "decks") renderDecks();
  if (name === "settings") renderBackupSummary();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function renderBackupSummary() {
  if (!els.backupSummary) return;
  const totalCards = state.collection.reduce((sum, card) => sum + Number(card.quantity || 0), 0);
  const uniqueCards = state.collection.length;
  const decks = state.decks.length;
  const lastExportedAt = state.backupMeta?.lastExportedAt || 0;
  els.backupSummary.innerHTML = `
    <span><b>${totalCards.toLocaleString("ja-JP")}</b><small>所持枚数</small></span>
    <span><b>${uniqueCards.toLocaleString("ja-JP")}</b><small>種類</small></span>
    <span><b>${decks.toLocaleString("ja-JP")}</b><small>デッキ</small></span>
    <span><b>${esc(formatDateTime(lastExportedAt))}</b><small>最終バックアップ</small></span>`;
}

function setOcrStatus(message) {
  if (els.ocrStatus) els.ocrStatus.textContent = message || "";
}

function loadScriptOnce(src, globalName) {
  if (globalName && window[globalName]) return Promise.resolve(window[globalName]);
  return new Promise((resolve, reject) => {
    const existing = [...document.scripts].find(script => script.src === src);
    if (existing) {
      existing.addEventListener("load", () => resolve(globalName ? window[globalName] : true), { once: true });
      existing.addEventListener("error", reject, { once: true });
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = () => resolve(globalName ? window[globalName] : true);
    script.onerror = () => reject(new Error("OCRエンジンを読み込めませんでした"));
    document.head.appendChild(script);
  });
}

async function loadOcrEngine() {
  return loadScriptOnce("https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js", "Tesseract");
}

function cleanupOcrLine(line) {
  return String(line || "")
    .normalize("NFKC")
    .replace(/[|{}[\]()<>]/g, " ")
    .replace(/\s+/g, " ")
    .replace(/^[0-9]+\s*x?\s+/i, "")
    .replace(/\s+\d{1,2}$/g, "")
    .trim();
}

function isLikelyCardNameLine(line) {
  const text = cleanupOcrLine(line);
  if (text.length < 2 || text.length > 70) return false;
  const digitCount = (text.match(/\d/g) || []).length;
  const hasJapanese = /[\u3040-\u30ff\u3400-\u9fff]/.test(text);
  const meaningfulText = text.replace(/[ー－―‐‑‒–—一\s。、，,.・･/\\|!！?？:;#~〜＝=]+/g, "");
  const kanaOrLatinCount = (meaningfulText.match(/[A-Za-z\u3040-\u30ff]/g) || []).length;
  const cjkCount = (meaningfulText.match(/[\u3400-\u9fff]/g) || []).length;
  const latinWords = text.match(/[A-Za-z]{2,}/g) || [];
  if (meaningfulText.length < 2) return false;
  if (kanaOrLatinCount === 0 && cjkCount < 2) return false;
  if (!hasJapanese && !latinWords.some(word => word.length >= 4)) return false;
  if (!hasJapanese && latinWords.length <= 3 && /^[A-Z]{2,5}$/.test(latinWords[latinWords.length - 1] || "")) return false;
  if (!hasJapanese && digitCount >= 3) return false;
  if (digitCount / Math.max(1, text.length) > 0.25) return false;
  if (/^[0-9\s#・\-–—/.,:;]+$/.test(text)) return false;
  if (/©|™|illus|illustrated|wizards|collector|not available/i.test(text)) return false;
  if (/^[A-Z0-9]{2,6}\s*#?\d+[a-z]?$/i.test(text)) return false;
  if (/\b(instant|sorcery|creature|artifact|enchantment|planeswalker|battle|land|legendary|basic)\b/i.test(text)) return false;
  if (/(インスタント|ソーサリー|クリーチャー|アーティファクト|エンチャント|プレインズウォーカー|土地|バトル|伝説の|基本)/.test(text)) return false;
  if (/(あなた|対象|ターン|戦場|墓地|カード|マナ|クリーチャー|呪文|プレイヤー|ライブラリー)/.test(text) && text.length > 12) return false;
  return /[A-Za-z\u3040-\u30ff\u3400-\u9fff]/.test(text);
}

function ocrCardNameCandidates(text) {
  const lines = String(text || "").split(/\n+/).map(cleanupOcrLine).filter(Boolean);
  const candidates = [];
  lines.forEach((line, index) => {
    if (!isLikelyCardNameLine(line)) return;
    const score = (index < 6 ? 8 - index : 1)
      + (/[A-Z][a-z]+/.test(line) ? 2 : 0)
      + (/[\u3040-\u30ff\u3400-\u9fff]/.test(line) ? 2 : 0)
      - (line.split(" ").length > 6 ? 4 : 0);
    candidates.push({ line, score });
  });
  return [...new Map(candidates.sort((a, b) => b.score - a.score).map(item => [item.line, item.line])).values()].slice(0, 5);
}

function loadImageFromFile(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("image load failed"));
    };
    image.src = url;
  });
}

function clampNumber(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

async function preprocessOcrRegion(file, region = "title") {
  const image = await loadImageFromFile(file);
  const sourceWidth = image.naturalWidth || image.width;
  const sourceHeight = image.naturalHeight || image.height;
  if (!sourceWidth || !sourceHeight) return file;

  const crop = {
    titleStrip: { x: 0.055, y: 0.025, w: 0.79, h: 0.095 },
    titleWide: { x: 0.035, y: 0.015, w: 0.93, h: 0.145 },
    title: { x: 0.035, y: 0.015, w: 0.93, h: 0.22 },
    upper: { x: 0, y: 0, w: 1, h: 0.45 },
  }[region] || { x: 0, y: 0, w: 1, h: 0.28 };
  const sx = Math.max(0, Math.floor(sourceWidth * crop.x));
  const sy = Math.max(0, Math.floor(sourceHeight * crop.y));
  const sw = Math.max(1, Math.min(sourceWidth - sx, Math.floor(sourceWidth * crop.w)));
  const sh = Math.max(1, Math.min(sourceHeight - sy, Math.floor(sourceHeight * crop.h)));
  const scale = clampNumber(2200 / sw, 3, 7);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(sw * scale);
  canvas.height = Math.round(sh * scale);
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return file;

  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(image, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    let gray = (data[i] * 0.299) + (data[i + 1] * 0.587) + (data[i + 2] * 0.114);
    gray = clampNumber(((gray - 128) * 1.55) + 128, 0, 255);
    if (gray > 238) gray = 255;
    if (gray < 35) gray = 0;
    data[i] = gray;
    data[i + 1] = gray;
    data[i + 2] = gray;
  }
  ctx.putImageData(imageData, 0, 0);

  const blob = await new Promise(resolve => canvas.toBlob(resolve, "image/png"));
  return blob || file;
}

async function recognizeOcrImage(Tesseract, image, label, pageSegMode = "6") {
  const result = await Tesseract.recognize(image, "eng+jpn", {
    tessedit_pageseg_mode: pageSegMode,
    preserve_interword_spaces: "1",
    logger: info => {
      if (info.status === "recognizing text" && info.progress != null) {
        setOcrStatus(`${label}を読み取り中…${Math.round(info.progress * 100)}%`);
      }
    },
  });
  return result?.data?.text || "";
}

function multiverseIdFromImageFile(file) {
  const name = String(file?.name || "");
  const match = name.match(/(?:^|[^\d])(\d{5,8})(?:[^\d]|$)/);
  return match ? match[1] : "";
}

async function findCardByImageFileName(file) {
  const multiverseId = multiverseIdFromImageFile(file);
  if (!multiverseId) return null;
  setOcrStatus(`画像ファイル名のID ${multiverseId} からカードを確認中…`);
  try {
    const response = await fetch(`https://api.scryfall.com/cards/multiverse/${encodeURIComponent(multiverseId)}`, {
      headers: { Accept: "application/json" },
    });
    if (!response.ok) return null;
    const card = await response.json();
    const cardName = card.printed_name || card.name || "";
    if (!cardName) return null;
    return { card, cardName, multiverseId };
  } catch {
    return null;
  }
}

async function readCardNameFromImage(file) {
  if (!file) return;
  if (!navigator.onLine) {
    setOcrStatus("OCRエンジンの読み込みに通信が必要です");
    return;
  }
  try {
    const fileNameCard = await findCardByImageFileName(file);
    if (fileNameCard) {
      els.cardSearch.value = fileNameCard.cardName;
      setOcrStatus(`ファイル名IDから候補: ${fileNameCard.cardName}。この名前で検索します`);
      await searchCards();
      return;
    }
    setOcrStatus("OCRエンジンを読み込み中…初回は少し時間がかかります");
    const Tesseract = await loadOcrEngine();
    setOcrStatus("カード名部分を切り出し中…");
    const titleStripImage = await preprocessOcrRegion(file, "titleStrip");
    const titleWideImage = await preprocessOcrRegion(file, "titleWide");
    const titleImage = await preprocessOcrRegion(file, "title");
    const upperImage = await preprocessOcrRegion(file, "upper");
    const texts = [];
    texts.push(await recognizeOcrImage(Tesseract, titleStripImage, "カード名欄", "7"));
    let candidates = ocrCardNameCandidates(texts.join("\n"));
    if (!candidates.length) {
      texts.push(await recognizeOcrImage(Tesseract, titleWideImage, "カード名欄の周辺", "6"));
      candidates = ocrCardNameCandidates(texts.join("\n"));
    }
    if (!candidates.length) {
      texts.push(await recognizeOcrImage(Tesseract, titleImage, "カード上部", "6"));
      candidates = ocrCardNameCandidates(texts.join("\n"));
    }
    if (!candidates.length) {
      texts.push(await recognizeOcrImage(Tesseract, upperImage, "カード上半分", "6"));
      candidates = ocrCardNameCandidates(texts.join("\n"));
    }
    if (!candidates.length) {
      texts.push(await recognizeOcrImage(Tesseract, file, "画像全体", "6"));
      candidates = ocrCardNameCandidates(texts.join("\n"));
    }
    if (!candidates.length) {
      setOcrStatus("カード名を読み取れませんでした。カード名部分が大きく写るように撮り直してください");
      return;
    }
    els.cardSearch.value = candidates[0];
    setOcrStatus(`読み取り候補: ${candidates.join(" / ")}。先頭候補で検索します`);
    await searchCards();
  } catch (error) {
    console.error(error);
    setOcrStatus("OCRに失敗しました。画像を選び直すか、カード名を手入力してください");
  }
}

async function searchCards() {
  const query = els.cardSearch.value.trim();
  const filters = buildCardSearchFilters();
  const exactMatch = Boolean(query) && els.searchMatch.value === "exact";
  if (!query && !filters) { els.searchStatus.textContent = "カード名または検索条件を指定してください"; return; }
  els.searchButton.disabled = true;
  els.searchStatus.textContent = navigator.onLine ? "検索中…" : "オフラインのため検索できません";
  els.searchResults.innerHTML = "";
  if (!navigator.onLine) { els.searchButton.disabled = false; return; }

  const sourceLang = isJapanese(query) ? "ja" : "en";
  const targetLang = sourceLang === "ja" ? "en" : "ja";
  let primaryCards = [];
  let lastError = null;
  try {
    const searchResult = await fetchSearchCandidates(query, filters, sourceLang, exactMatch, 30);
    primaryCards = searchResult.cards;
    lastError = searchResult.error;
    if (!primaryCards.length) throw new Error(lastError?.details || "カードが見つかりませんでした");

    const exactOracleIds = findExactOracleIds(primaryCards, query);
    if (exactMatch && exactOracleIds.length) {
      els.searchStatus.textContent = "同じカードの日英版を取得中…";
      const unifiedPrints = await fetchUnifiedPrints(exactOracleIds.slice(0, 3), filters);
      state.searchResults = applyJpIndexToCards(sortUnifiedPrints(unifiedPrints)).slice(0, 24);
    } else {
      els.searchStatus.textContent = "反対言語のカードも検索中…";
      const counterpartCards = await fetchCounterparts(primaryCards, targetLang, filters);
      const mergedCards = searchResult.source === "local"
        ? [...primaryCards, ...counterpartCards]
        : mergeLanguageResults(primaryCards, counterpartCards);
      state.searchResults = applyJpIndexToCards(mergedCards).slice(0, 24);
    }
    renderSearchResults();
    const jaCount = state.searchResults.filter(card => card.lang === "ja").length;
    const enCount = state.searchResults.filter(card => card.lang === "en").length;
    els.searchStatus.textContent = `日本語 ${jaCount}件・英語 ${enCount}件を表示`;
  } catch (err) {
    els.searchStatus.textContent = err.message || "検索に失敗しました。通信状態を確認してください";
  } finally {
    els.searchButton.disabled = false;
  }
}

async function fetchScryfallSearch(q, options = {}) {
  const params = new URLSearchParams({ q, unique: options.unique || "prints", order: options.order || "name", include_multilingual: "true" });
  if (options.dir) params.set("dir", options.dir);
  try {
    const response = await fetch(`https://api.scryfall.com/cards/search?${params}`, { headers: { Accept: "application/json" } });
    if (response.ok) return { ok: true, data: await response.json() };
    return { ok: false, error: await response.json().catch(() => null) };
  } catch {
    return { ok: false, error: { details: "Scryfallへの通信に失敗しました。時間をおいて再検索してください。" } };
  }
}

async function fetchScryfallCardsByIds(ids) {
  const uniqueIds = [...new Set((ids || []).filter(Boolean))].slice(0, 75);
  if (!uniqueIds.length) return { ok: true, data: { data: [] } };
  try {
    const response = await fetch("https://api.scryfall.com/cards/collection", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ identifiers: uniqueIds.map(id => ({ id })) }),
    });
    if (response.ok) return { ok: true, data: await response.json() };
    return { ok: false, error: await response.json().catch(() => null) };
  } catch {
    return { ok: false, error: { details: "Scryfallへの通信に失敗しました。時間をおいて再検索してください。" } };
  }
}

async function fetchAllScryfallSearch(q, options = {}) {
  const first = await fetchScryfallSearch(q, options);
  if (!first.ok) return first;
  const cards = [...first.data.data];
  let nextPage = first.data.has_more ? first.data.next_page : null;
  while (nextPage) {
    await new Promise(resolve => setTimeout(resolve, 80));
    const response = await fetch(nextPage, { headers: { Accept: "application/json" } });
    if (!response.ok) return { ok: false, error: await response.json().catch(() => null) };
    const page = await response.json();
    cards.push(...page.data);
    nextPage = page.has_more ? page.next_page : null;
  }
  return { ok: true, data: { ...first.data, data: cards, has_more: false, next_page: null } };
}

function normalizeCardName(value) {
  return String(value || "").normalize("NFKC").trim().toLocaleLowerCase("ja").replaceAll(/\s+/g, " ");
}

function normalizeAliasKey(value) {
  return normalizeCardName(value).replaceAll(/[・･\s'’"“”\-‐‑‒–—―]/g, "");
}

function cardSearchNames(card) {
  return [
    card.name,
    card.printed_name,
    card.jpName,
    ...(card.card_faces || []).flatMap(face => [face.name, face.printed_name]),
  ].filter(Boolean);
}

function pushUniqueTarget(map, key, targets) {
  if (!key || !targets.length) return;
  const existing = map.get(key) || [];
  targets.forEach(target => {
    if (target && !existing.includes(target)) existing.push(target);
  });
  map.set(key, existing);
}

function buildJpSearchIndexes() {
  JP_CARD_SEARCH_INDEX.forEach(item => {
    const targets = [item.scryfallName, ...(item.enNames || [])].filter(Boolean);
    if (item.scryfallId && !JP_INDEX_BY_SCRYFALL_ID.has(item.scryfallId)) JP_INDEX_BY_SCRYFALL_ID.set(item.scryfallId, item);
    if (item.oracleId && !JP_INDEX_BY_ORACLE_ID.has(item.oracleId)) JP_INDEX_BY_ORACLE_ID.set(item.oracleId, item);
    targets.forEach(name => {
      const key = normalizeCardName(name);
      if (key && !JP_INDEX_BY_EN_NAME.has(key)) JP_INDEX_BY_EN_NAME.set(key, item);
    });
    [...(item.jaNames || []), ...(item.enNames || []), item.scryfallName].filter(Boolean).forEach(name => {
      pushUniqueTarget(JP_ALIAS_TARGETS_EXACT, normalizeAliasKey(name), targets);
    });
  });
}

buildJpSearchIndexes();

function jpIndexMatchesCard(item, card) {
  const cardScryfallId = card.id || card.scryfallId || "";
  if (item.scryfallId && cardScryfallId && item.scryfallId === cardScryfallId) return true;
  const cardOracleId = card.oracle_id || card.oracleId || "";
  if (item.oracleId && cardOracleId && item.oracleId === cardOracleId) return true;
  const setMatch = !item.setCode || String(card.set || card.setCode || "").toLowerCase() === String(item.setCode).toLowerCase();
  const numberMatch = item.collectorNumber && String(card.collector_number || card.collectorNumber || "") === String(item.collectorNumber);
  if (setMatch && numberMatch) return true;
  if (item.collectorNumber && String(card.collector_number || card.collectorNumber || "")) return false;
  const names = cardSearchNames(card).map(normalizeCardName);
  const indexNames = [item.scryfallName, ...(item.enNames || [])].filter(Boolean).map(normalizeCardName);
  return indexNames.some(name => names.includes(name));
}

function jpIndexForCard(card) {
  const scryfallId = card.id || card.scryfallId || "";
  if (scryfallId && JP_INDEX_BY_SCRYFALL_ID.has(scryfallId)) return JP_INDEX_BY_SCRYFALL_ID.get(scryfallId);
  const oracleId = card.oracle_id || card.oracleId || "";
  if (oracleId && JP_INDEX_BY_ORACLE_ID.has(oracleId)) return JP_INDEX_BY_ORACLE_ID.get(oracleId);
  const names = cardSearchNames(card).map(normalizeCardName);
  for (const name of names) {
    const item = JP_INDEX_BY_EN_NAME.get(name);
    if (item) return item;
  }
  return MTG_JP_CARD_INDEX.find(item => jpIndexMatchesCard(item, card)) || null;
}

function displayJaNamesForIndexItem(item) {
  const names = item?.jaNames || [];
  const japaneseNames = names.filter(isJapanese);
  return japaneseNames.length ? japaneseNames : names;
}

function applyJpIndexToCard(card) {
  const item = jpIndexForCard(card);
  if (!item) return card;
  const localizeDisplay = isJapaneseCard(card) || !card.lang;
  const displayJaNames = displayJaNamesForIndexItem(item);
  const faces = Array.isArray(card.card_faces) ? card.card_faces.map((face, index) => ({
    ...face,
    printed_name: localizeDisplay ? (displayJaNames[index] || face.printed_name) : face.printed_name,
    image_uris: localizeDisplay ? {
      ...(face.image_uris || {}),
      normal: index === 0 ? (item.images?.normal || face.image_uris?.normal) : (item.images?.back || face.image_uris?.normal),
    } : face.image_uris,
  })) : card.card_faces;
  return {
    ...card,
    lang: card.lang || "ja",
    jpName: displayJaNames[0] || card.jpName,
    jpAltName: displayJaNames[1] || "",
    jpImage: item.images?.normal || item.image || card.jpImage,
    jpImages: item.images || null,
    jpSourceUrl: item.sourceUrl || "",
    card_faces: faces,
    printed_name: localizeDisplay ? (displayJaNames[0] || card.printed_name) : card.printed_name,
    printed_type_line: card.printed_type_line || card.type_line,
  };
}

function applyJpIndexToCards(cards) {
  return cards.map(applyJpIndexToCard);
}

function aliasTargetsForQuery(query, options = {}) {
  const key = normalizeAliasKey(query);
  if (!key) return [];
  const exactOnly = options.exactOnly === true;
  const limit = Number(options.limit || (exactOnly ? 20 : 12));
  const cacheKey = `${exactOnly ? "exact" : "partial"}:${limit}:${key}`;
  if (JP_ALIAS_TARGET_CACHE.has(cacheKey)) return JP_ALIAS_TARGET_CACHE.get(cacheKey);
  const manualTargets = CARD_NAME_ALIASES
    .filter(item => item.aliases.some(alias => normalizeAliasKey(alias) === key))
    .map(item => item.target)
    .filter(Boolean);
  const exactTargets = JP_ALIAS_TARGETS_EXACT.get(key) || [];
  const partialTargets = [];
  if (!exactOnly && key.length >= 2 && exactTargets.length < limit) for (const item of JP_CARD_SEARCH_INDEX) {
      const names = [...(item.jaNames || []), ...(item.enNames || []), item.scryfallName].filter(Boolean);
      let partialHit = false;
      for (const name of names) {
        const nameKey = normalizeAliasKey(name);
        if (nameKey !== key && nameKey.includes(key)) partialHit = true;
      }
      const targets = [item.scryfallName, ...(item.enNames || [])].filter(Boolean);
      if (partialHit) partialTargets.push(...targets);
      if (partialTargets.length >= limit * 3) break;
  }
  const result = [...new Set([...manualTargets, ...exactTargets, ...partialTargets])].slice(0, limit);
  JP_ALIAS_TARGET_CACHE.set(cacheKey, result);
  return result;
}

function jpIndexNames(item) {
  return [...(item.jaNames || []), ...(item.enNames || []), item.scryfallName].filter(Boolean);
}

function jpIndexMatchesQuery(item, query, exactMatch = false) {
  const needle = normalizeAliasKey(query);
  if (!needle) return true;
  const names = jpIndexNames(item);
  return names.some(name => {
    const key = normalizeAliasKey(name);
    return exactMatch ? key === needle : key.includes(needle);
  });
}

function jpIndexMatchesSetFilter(item) {
  const setValue = String(els.searchSet?.value || "").trim();
  if (!setValue) return true;
  const needle = normalizeAliasKey(setValue);
  const candidates = [item.setCode, item.setNameJa, item.setName, item.setNameEn].filter(Boolean);
  return candidates.some(value => normalizeAliasKey(value).includes(needle));
}

function localSearchIndexMatches(query, exactMatch = false, limit = 16) {
  const matches = [];
  const needle = normalizeAliasKey(query);
  const isShortKanaNeedle = /^[\u3041-\u3093\u30a1-\u30f6\u30fc]{1,3}$/.test(needle);
  for (const item of JP_CARD_SEARCH_INDEX) {
    // セット指定はScryfall側の set: 条件で絞り込む。
    // ローカルDBは「日本語名から英語名/Oracle IDへ解決する」役割に寄せることで、
    // 代表収録版が別セットにあるカードでも、古いセット指定検索で拾えるようにする。
    if (!jpIndexMatchesQuery(item, query, exactMatch)) continue;
    const names = jpIndexNames(item);
    const score = names.reduce((best, name) => {
      const key = normalizeAliasKey(name);
      if (!needle) return Math.max(best, 1);
      if (key === needle) return Math.max(best, 100);
      if (key.startsWith(needle)) return Math.max(best, 70);
      if (isShortKanaNeedle && (key.endsWith(needle) || key.includes(`\u3001${needle}`) || key.includes(`//${needle}`))) return Math.max(best, 78);
      if (key.includes(needle)) return Math.max(best, 40);
      return best;
    }, 0) + (item.source === "mtg-jp-card-gallery" ? 8 : 0) + (item.scryfallId ? 4 : 0);
    matches.push({ item, score });
  }
  const seen = new Set();
  return matches
    .sort((a, b) => b.score - a.score)
    .map(({ item }) => item)
    .filter(item => {
      const key = item.oracleId || item.scryfallId || item.scryfallName || jpIndexNames(item)[0];
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, limit);
}

function scryfallNameQuery(name) {
  return `!"${String(name || "").replaceAll('"', '\\"')}"`;
}

function buildLocalIndexScryfallQuery(items, filters) {
  const names = [...new Set(items.flatMap(item => [item.scryfallName, ...(item.enNames || [])]).filter(Boolean))].slice(0, 8);
  if (names.length) return `(${names.map(scryfallNameQuery).join(" or ")}) ${filters}`.trim();
  const oracleIds = [...new Set(items.map(item => item.oracleId).filter(Boolean))].slice(0, 16);
  if (oracleIds.length) return `(${oracleIds.map(id => `oracleid:${id}`).join(" or ")}) ${filters}`.trim();
  return "";
}

async function fetchLocalSearchCandidates(query, filters, exactMatch, maxCards = 30) {
  const queryKey = normalizeAliasKey(query);
  const isShortJapaneseQuery = /^[\u3041-\u3093\u30a1-\u30f6\u30fc]{1,3}$/.test(queryKey);
  const localLimit = exactMatch ? 20 : isShortJapaneseQuery ? 32 : 20;
  const localItems = localSearchIndexMatches(query, exactMatch, localLimit);
  if (!localItems.length) return { cards: [], items: [], error: null };
  const scryfallQuery = buildLocalIndexScryfallQuery(localItems, filters);
  if (!scryfallQuery) return { cards: [], items: localItems, error: null };
  const result = await fetchScryfallSearch(scryfallQuery, { unique: "prints", order: "released", dir: "desc" });
  if (!result.ok) return { cards: [], items: localItems, error: result.error };
  const localOrder = new Map(localItems.map((item, index) => [item, index]));
  const localByOracle = new Map(localItems.map(item => [item.oracleId, item]).filter(([key]) => key));
  const localByName = new Map();
  localItems.forEach(item => jpIndexNames(item).forEach(name => localByName.set(normalizeCardName(name), item)));
  const ordered = result.data.data
    .map(card => ({
      card,
      item: localByOracle.get(card.oracle_id) || cardSearchNames(card).map(normalizeCardName).map(name => localByName.get(name)).find(Boolean) || null,
    }))
    .filter(entry => !exactMatch || cardNameMatchesExactly(applyJpIndexToCard(entry.card), query))
    .sort((a, b) => (localOrder.get(a.item) ?? 9999) - (localOrder.get(b.item) ?? 9999));
  return { cards: ordered.map(entry => entry.card).slice(0, maxCards), items: localItems, error: null };
}

function buildSearchCandidates(query, filters, preferredLang = "", exactMatch = false) {
  const searchTerms = [query, filters].filter(Boolean).join(" ");
  const shouldUseAliases = preferredLang === "ja" || exactMatch;
  const aliases = shouldUseAliases ? aliasTargetsForQuery(query, { exactOnly: exactMatch, limit: exactMatch ? 20 : 8 }) : [];
  const aliasSearches = aliases.flatMap(target => [
    `!"${String(target).replaceAll('"', '\\"')}" ${filters}`.trim(),
    exactMatch ? "" : `name:"${String(target).replaceAll('"', '\\"')}" ${filters}`.trim(),
  ]);
  const baseSearches = preferredLang === "ja"
    ? [`lang:ja ${searchTerms}`, `lang:ja name:"${query}" ${filters}`.trim(), searchTerms]
    : preferredLang === "en"
      ? [`lang:en ${searchTerms}`, searchTerms]
      : [searchTerms];
  return [...new Set([...aliasSearches, ...baseSearches].filter(Boolean))];
}

async function fetchSearchCandidates(query, filters, preferredLang, exactMatch, maxCards = 30) {
  if (String(query || "").trim()) {
    const localResult = await fetchLocalSearchCandidates(query, filters, exactMatch, maxCards);
    if (localResult.cards.length) {
      return { cards: localResult.cards, error: null, source: "local" };
    }
  }
  const candidates = buildSearchCandidates(query, filters, preferredLang, exactMatch);
  const aliasCount = (preferredLang === "ja" || exactMatch) ? aliasTargetsForQuery(query, { exactOnly: exactMatch, limit: exactMatch ? 20 : 8 }).length : 0;
  const shouldCollectMany = aliasCount > 1;
  const cards = [];
  const seen = new Set();
  let lastError = null;
  for (const q of candidates) {
    const result = await fetchScryfallSearch(q, { unique: "cards" });
    if (result.ok) {
      const matches = exactMatch ? result.data.data.filter(card => cardNameMatchesExactly(card, query)) : result.data.data;
      for (const card of matches) {
        if (!seen.has(card.id)) {
          seen.add(card.id);
          cards.push(card);
        }
      }
      if (cards.length && (!shouldCollectMany || cards.length >= maxCards)) break;
    }
    lastError = result.error;
    if (shouldCollectMany) await new Promise(resolve => setTimeout(resolve, 60));
  }
  return { cards: cards.slice(0, maxCards), error: lastError };
}

function cardNameMatchesExactly(card, query) {
  const needle = normalizeCardName(query);
  const aliasNeedles = aliasTargetsForQuery(query, { exactOnly: true }).map(normalizeCardName);
  return Boolean(needle) && cardSearchNames(card).some(name => {
    const normalized = normalizeCardName(name);
    return normalized === needle || aliasNeedles.includes(normalized);
  });
}

function findExactOracleIds(cards, query) {
  const needle = normalizeCardName(query);
  const aliasNeedles = aliasTargetsForQuery(query, { exactOnly: true }).map(normalizeCardName);
  if (!needle) return [];
  return [...new Set(cards
    .filter(card => cardSearchNames(card).some(name => {
      const normalized = normalizeCardName(name);
      return normalized === needle || aliasNeedles.includes(normalized);
    }))
    .map(card => card.oracle_id)
    .filter(Boolean))];
}

async function fetchUnifiedPrints(oracleIds, extraFilters = "") {
  const prints = [];
  for (const oracleId of oracleIds) {
    for (const lang of ["ja", "en"]) {
      const result = await fetchAllScryfallSearch(`oracleid:${oracleId} lang:${lang} ${extraFilters}`.trim(), { order: "released", dir: "desc" });
      if (result.ok) prints.push(...result.data.data);
      await new Promise(resolve => setTimeout(resolve, 80));
    }
  }
  return [...new Map(prints.map(card => [card.id, card])).values()];
}

function sortUnifiedPrints(cards) {
  return [...cards].sort((a, b) => {
    const dateOrder = String(b.released_at || "").localeCompare(String(a.released_at || ""));
    if (dateOrder) return dateOrder;
    const printOrder = `${a.set || ""}:${a.collector_number || ""}`.localeCompare(
      `${b.set || ""}:${b.collector_number || ""}`, undefined, { numeric: true }
    );
    if (printOrder) return printOrder;
    return (a.lang === "ja" ? 0 : 1) - (b.lang === "ja" ? 0 : 1);
  });
}

async function fetchCounterparts(cards, targetLang, extraFilters = "") {
  const uniqueCards = [];
  const seen = new Set();
  for (const card of cards) {
    const key = card.oracle_id || card.name;
    if (!key || seen.has(key)) continue;
    seen.add(key);
    uniqueCards.push(card);
    if (uniqueCards.length >= 8) break;
  }

  const counterparts = [];
  for (const card of uniqueCards) {
    const exactName = String(card.name || "").replaceAll('"', '\\"');
    if (!exactName) continue;
    const result = await fetchScryfallSearch(`!\"${exactName}\" lang:${targetLang} ${extraFilters}`.trim());
    if (result.ok && result.data.data[0]) counterparts.push(result.data.data[0]);
    await new Promise(resolve => setTimeout(resolve, 80));
  }
  return counterparts;
}

function mergeLanguageResults(primaryCards, counterpartCards) {
  const peers = new Map(counterpartCards.map(card => [card.oracle_id || card.name, card]));
  const merged = [];
  const usedIds = new Set();
  const push = card => {
    if (!card || usedIds.has(card.id)) return;
    usedIds.add(card.id);
    merged.push(card);
  };

  for (const card of primaryCards) {
    push(card);
    const key = card.oracle_id || card.name;
    if (peers.has(key)) { push(peers.get(key)); peers.delete(key); }
    if (merged.length >= 24) break;
  }
  peers.forEach(push);
  return merged;
}

function renderSearchResults() {
  const groups = new Map();
  for (const card of state.searchResults) {
    const key = card.oracle_id || card.name;
    if (!groups.has(key)) groups.set(key, { key, card, cards: [] });
    groups.get(key).cards.push(card);
  }
  state.searchGroups = [...groups.values()];
  els.searchResults.innerHTML = state.searchGroups.map((group, index) => `
    <button class="search-result" data-index="${index}">
      <img src="${esc(imageOf(group.card))}" alt="" loading="lazy">
      <span><strong>${esc(nameOf(group.card))}</strong><small><span class="language-tag">日英版</span>${altNameOf(group.card) ? `${esc(altNameOf(group.card))} · ` : ""}タップして別イラストを選択</small></span>
    </button>`).join("");
  els.searchResults.querySelectorAll("button").forEach(button => button.addEventListener("click", () => openCardDialog(state.searchGroups[Number(button.dataset.index)].card)));
}

async function openCardDialog(card, mode = "collection", ownedId = null) {
  state.selectedCard = card;
  state.cardDialogMode = mode;
  state.selectedOwnedId = ownedId;
  state.cardVariants = [];
  els.cardActionStatus.textContent = "";
  els.cardActionStatus.classList.remove("show");
  els.addCardToDeckButton.hidden = mode !== "deck";
  document.querySelectorAll(".card-deck-targets").forEach(element => element.hidden = mode !== "deck");
  els.variantFilter.value = "";
  renderSelectedVariant();
  els.cardVariants.innerHTML = '<span class="muted">収録版を読み込み中…</span>';
  els.cardDialog.showModal();

  const key = card.oracle_id || card.name;
  let variants = state.variantCache.get(key);
  if (!variants) {
    const prints = card.oracle_id ? await fetchUnifiedPrints([card.oracle_id]) : [card];
    variants = applyJpIndexToCards(sortUnifiedPrints(prints.length ? prints : [card]));
    state.variantCache.set(key, variants);
  }
  state.cardVariants = variants;
  const sameVariant = variants.find(item => item.id === card.id) || variants[0] || card;
  selectVariant(sameVariant);
}

function selectedOwnedQuantity() {
  return state.collection
    .filter(card => card.scryfallId === state.selectedCard?.id)
    .reduce((sum, card) => sum + Number(card.quantity || 0), 0);
}

function selectedOwnedCard() {
  const selectedId = state.selectedCard?.id;
  if (!selectedId) return null;
  const pinned = state.collection.find(card => card.id === state.selectedOwnedId && card.scryfallId === selectedId);
  return pinned || state.collection.find(card => card.scryfallId === selectedId) || null;
}

function updateCardOwnedActions() {
  const owned = selectedOwnedCard();
  const hidden = state.cardDialogMode === "deck" || !owned;
  els.favoriteCardButton.hidden = hidden;
  els.deleteCardButton.hidden = hidden;
  if (!owned) return;
  els.favoriteCardButton.classList.toggle("active", owned.favorite === true);
  els.favoriteCardButton.textContent = owned.favorite ? "★ お気に入り" : "☆ お気に入り";
  els.favoriteCardButton.setAttribute("aria-pressed", owned.favorite ? "true" : "false");
}

function collectionSortLabel(mode) {
  return { name: "名前", color: "色", mana: "マナ", type: "タイプ", value: "資産額", unitPrice: "単価" }[mode] || mode;
}

function saveCollectionSortStack() {
  localStorage.setItem(KEYS.collectionSortStack, JSON.stringify(state.collectionSortStack));
}

function collectionTypeRank(card) {
  const type = String(card.typeLine || card.type_line || "");
  const groups = ["Creature", "Instant", "Sorcery", "Artifact", "Enchantment", "Planeswalker", "Battle", "Land"];
  const index = groups.findIndex(group => type.includes(group));
  return index >= 0 ? index : groups.length;
}

function collectionColorRank(card) {
  const type = String(card.typeLine || card.type_line || "");
  if (type.includes("Land")) return "0";
  const identity = card.colorIdentity || card.color_identity || card.colors || [];
  if (!identity.length) return "0";
  if (identity.length > 1) return `8-${identity.slice().sort().join("")}`;
  const order = { W: "1", U: "2", B: "3", R: "4", G: "5" };
  return order[identity[0]] || "9";
}

function collectionSortValue(card, mode) {
  if (mode === "name") return normalizeCardName(nameOf(card));
  if (mode === "color") return collectionColorRank(card);
  if (mode === "mana") return Number(card.manaValue ?? card.cmc ?? 0);
  if (mode === "type") return collectionTypeRank(card);
  if (mode === "value") return yenValueOf(card) == null ? Number.POSITIVE_INFINITY : -yenValueOf(card);
  if (mode === "unitPrice") return unitYenValueOf(card) == null ? Number.POSITIVE_INFINITY : -unitYenValueOf(card);
  return "";
}

function compareCollectionItems(a, b) {
  const stack = Array.isArray(state.collectionSortStack) ? state.collectionSortStack : [];
  for (const mode of [...stack].reverse()) {
    const av = collectionSortValue(a.card, mode);
    const bv = collectionSortValue(b.card, mode);
    const result = typeof av === "number" || typeof bv === "number"
      ? Number(av) - Number(bv)
      : String(av).localeCompare(String(bv), "ja");
    if (result) return result;
  }
  return a.index - b.index;
}

function sortedCollectionCards(cards) {
  if (!state.collectionSortStack?.length) return cards;
  const indexById = new Map(state.collection.map((card, index) => [card.id, index]));
  return cards.map(card => ({ card, index: indexById.get(card.id) ?? 0 })).sort(compareCollectionItems).map(item => item.card);
}

function updateCollectionSortUi() {
  const stack = Array.isArray(state.collectionSortStack) ? state.collectionSortStack : [];
  const buttons = {
    name: els.sortCollectionByName,
    color: els.sortCollectionByColor,
    mana: els.sortCollectionByMana,
    type: els.sortCollectionByType,
    value: els.sortCollectionByValue,
    unitPrice: els.sortCollectionByUnitPrice,
  };
  Object.entries(buttons).forEach(([mode, button]) => button?.classList.toggle("active", stack.includes(mode)));
  els.collectionSortStatus.textContent = stack.length
    ? `ソート：${stack.map(collectionSortLabel).join(" → ")}`
    : "ソートなし";
}

function applyCollectionSort(mode) {
  const stack = Array.isArray(state.collectionSortStack) ? state.collectionSortStack : [];
  const alreadyActive = stack.includes(mode);
  state.collectionSortStack = stack.filter(item => item !== mode);
  if (!alreadyActive) state.collectionSortStack.push(mode);
  saveCollectionSortStack();
  renderCollection();
  showToast(`${collectionSortLabel(mode)}順を反映しました`);
}

function resetCollectionSortOrder() {
  state.collectionSortStack = [];
  saveCollectionSortStack();
  renderCollection();
  showToast("コレクションのソートを初期化しました");
}

function moveOwnedCard(cardId, direction, visibleIds = []) {
  const orderedIds = visibleIds.length ? visibleIds : state.collection.map(card => card.id);
  const visibleIndex = orderedIds.indexOf(cardId);
  const targetId = orderedIds[visibleIndex + direction];
  if (!targetId) return;
  const fromIndex = state.collection.findIndex(card => card.id === cardId);
  const movingCard = state.collection[fromIndex];
  if (!movingCard) return;
  state.collection.splice(fromIndex, 1);
  const targetIndex = state.collection.findIndex(card => card.id === targetId);
  if (targetIndex < 0) {
    state.collection.splice(fromIndex, 0, movingCard);
    return;
  }
  state.collection.splice(direction > 0 ? targetIndex + 1 : targetIndex, 0, movingCard);
  if (state.collectionSortStack?.length) {
    state.collectionSortStack = [];
    saveCollectionSortStack();
  }
  persist();
  renderCollection();
  showToast("コレクションの並び順を変更しました");
}

function renderSelectedVariant() {
  const card = state.selectedCard;
  const backImage = backImageOf(card);
  els.cardPreview.innerHTML = `<div class="card-detail-preview"><div class="card-detail-images"><img class="card-detail-image" src="${esc(imageOf(card))}" alt="${esc(nameOf(card))}">${backImage ? `<img class="card-detail-image card-detail-back" src="${esc(backImage)}" alt="${esc(altNameOf(card) || nameOf(card))} 裏面">` : ""}</div><div><span class="eyebrow">${esc((card.set || "").toUpperCase())} #${esc(card.collector_number)} · ${card.lang === "ja" ? "日本語" : "英語"}</span><h2>${esc(nameOf(card))}</h2><p class="muted">${altNameOf(card) ? `${esc(altNameOf(card))}<br>` : ""}${esc(typeOf(card))}</p></div></div>`;
  els.cardQuantity.value = selectedOwnedQuantity();
  els.cardLanguage.value = card.lang === "ja" ? "ja" : card.lang === "en" ? "en" : "other";
  updateCardOwnedActions();
}

function renderVariantGallery() {
  const lang = els.variantFilter.value;
  const variants = state.cardVariants.filter(card => !lang || card.lang === lang);
  const jaCount = state.cardVariants.filter(card => card.lang === "ja").length;
  const enCount = state.cardVariants.filter(card => card.lang === "en").length;
  els.variantCount.textContent = lang ? `${variants.length}版` : `${state.cardVariants.length}版（日${jaCount}・英${enCount}）`;
  if (!variants.length) { els.cardVariants.innerHTML = '<span class="muted">該当する収録版がありません</span>'; return; }
  els.cardVariants.innerHTML = variants.map(card => `
    <button type="button" class="variant-option ${card.id === state.selectedCard.id ? "selected" : ""}" data-id="${card.id}" aria-label="${esc(nameOf(card))} ${(card.set || "").toUpperCase()} ${card.collector_number || ""} ${card.lang === "ja" ? "日本語" : "英語"}">
      <img src="${esc(imageOf(card))}" alt="" loading="lazy"><span>${card.lang === "ja" ? "日" : "英"} · ${esc((card.set || "").toUpperCase())}</span>
    </button>`).join("");
  els.cardVariants.querySelectorAll("button").forEach(button => button.addEventListener("click", () => {
    const card = state.cardVariants.find(item => item.id === button.dataset.id);
    if (card) selectVariant(card);
  }));
}

function selectVariant(card) {
  state.selectedCard = card;
  if (!state.collection.some(item => item.id === state.selectedOwnedId && item.scryfallId === card.id)) state.selectedOwnedId = null;
  renderSelectedVariant();
  renderVariantGallery();
}

function compactCard(card) {
  return {
    id: uid(), scryfallId: card.id || "", oracleId: card.oracle_id || "", name: card.name || "", printedName: nameOf(card) || card.printed_name || "",
    set: (card.set || "").toUpperCase(), setName: card.set_name || "", collectorNumber: card.collector_number || "",
    typeLine: card.type_line || "", printedTypeLine: card.printed_type_line || "", image: imageOf(card),
    manaCost: card.mana_cost || card.card_faces?.map(face => face.mana_cost).filter(Boolean).join(" // ") || "",
    manaValue: Number(card.cmc || 0), colors: card.colors || [], colorIdentity: card.color_identity || [], metadataVersion: 1,
    priceUsd: card.prices?.usd || null, priceUsdFoil: card.prices?.usd_foil || null, priceUsdEtched: card.prices?.usd_etched || null,
    priceUsdFromEnglish: false, priceUsdFoilFromEnglish: false, priceUsdEtchedFromEnglish: false, priceUpdatedAt: Date.now(),
    quantity: Math.max(1, Number(els.cardQuantity.value || 1)), condition: els.cardCondition.value,
    finish: els.cardFinish.value, language: els.cardLanguage.value, location: els.cardLocation.value.trim(), favorite: false, addedAt: Date.now(),
  };
}

function saveSelectedCardQuantity() {
  const target = Math.max(0, Number(els.cardQuantity.value || 0));
  const matching = state.collection.filter(card => card.scryfallId === state.selectedCard.id);
  const current = matching.reduce((sum, card) => sum + Number(card.quantity || 0), 0);
  if (target > current) {
    const incoming = compactCard(state.selectedCard);
    incoming.quantity = target - current;
    const lot = matching.find(card => card.condition === incoming.condition && card.finish === incoming.finish && card.language === incoming.language && card.location === incoming.location);
    if (lot) { lot.quantity += incoming.quantity; state.selectedOwnedId = lot.id; } else { state.collection.unshift(incoming); state.selectedOwnedId = incoming.id; }
  } else if (target < current) {
    let remove = current - target;
    for (const card of matching) {
      const amount = Math.min(remove, card.quantity);
      card.quantity -= amount;
      remove -= amount;
      if (!remove) break;
    }
    state.collection = state.collection.filter(card => card.quantity > 0);
    if (!state.collection.some(card => card.id === state.selectedOwnedId)) state.selectedOwnedId = selectedOwnedCard()?.id || null;
  }
  persist();
  renderCollection();
  if (state.editingDeck && els.deckDialog.open) renderDeckEditor();
  els.cardQuantity.value = selectedOwnedQuantity();
  hydrateEnglishPriceFallbacks();
  updateCardOwnedActions();
  showInlineStatus(els.cardActionStatus, `${nameOf(state.selectedCard)}をコレクションに保存しました`);
  showToast("所持枚数を保存しました");
}

function renderCollection() {
  const query = els.collectionFilter.value.trim().toLowerCase();
  const color = els.collectionColor.value;
  const mana = els.collectionMana.value;
  const type = els.collectionType.value;
  const priceFilter = els.collectionPriceFilter.value;
  const favoritesOnly = els.collectionFavoritesOnly.checked;
  let cards = state.collection.filter(card => {
    const textMatch = [card.name, card.printedName, card.setName, card.typeLine, card.printedTypeLine, card.location].join(" ").toLowerCase().includes(query);
    const identity = card.colorIdentity || card.colors || [];
    const colorMatch = !color || (color === "C" ? identity.length === 0 : color === "M" ? identity.length > 1 : identity.includes(color));
    const manaValue = Number(card.manaValue || 0);
    const manaMatch = !mana || (mana === "7+" ? manaValue >= 7 : manaValue === Number(mana));
    const typeMatch = !type || String(card.typeLine || "").toLowerCase().includes(type.toLowerCase());
    const yenValue = yenValueOf(card);
    const priceMatch = !priceFilter
      || (priceFilter === "priced" && yenValue != null)
      || (priceFilter === "missing" && yenValue == null)
      || (priceFilter === "english" && selectedPriceUsesEnglish(card))
      || (priceFilter === "over10000" && yenValue != null && yenValue >= 10000)
      || (priceFilter === "over50000" && yenValue != null && yenValue >= 50000);
    const favoriteMatch = !favoritesOnly || card.favorite === true;
    return textMatch && colorMatch && manaMatch && typeMatch && priceMatch && favoriteMatch;
  });
  cards = sortedCollectionCards(cards);
  updateCollectionSortUi();
  els.totalCards.textContent = state.collection.reduce((sum, card) => sum + Number(card.quantity), 0);
  els.uniqueCards.textContent = state.collection.length;
  const valuedCards = state.collection.map(yenValueOf).filter(value => value != null);
  els.collectionValue.textContent = state.fx.usdJpy && valuedCards.length ? formatYen(valuedCards.reduce((sum, value) => sum + value, 0)) : "--";
  els.priceStatus.textContent = state.fx.updatedAt ? `USD/JPY ${state.fx.usdJpy.toFixed(2)} · ${state.fx.source === "auto" ? new Date(state.fx.updatedAt).toLocaleDateString("ja-JP") + "更新" : "概算"}` : "為替取得中";
  if (document.activeElement !== els.usdJpyRate) els.usdJpyRate.value = state.fx.usdJpy || "";
  els.fxHelp.textContent = state.fx.usdJpy ? `現在の換算レート：1 USD = ${state.fx.usdJpy.toFixed(2)}円（${state.fx.source === "auto" ? "自動取得" : "手動・概算"}）` : "為替を取得できない場合に手動で変更できます。";
  const hiddenMode = state.collectionViewMode === "hidden";
  const imageMode = state.collectionViewMode === "images";
  els.collectionList.className = imageMode ? "collection-image-grid" : "item-list";
  if (hiddenMode) {
    els.collectionList.innerHTML = `<div class="empty">コレクション一覧は非表示です。表示方法から「詳細表示」または「イラスト表示」を選んでください。</div>`;
    return;
  }
  if (!cards.length) { els.collectionList.innerHTML = `<div class="empty">${state.collection.length ? "条件に合うカードがありません" : "検索から最初のカードを追加しましょう"}</div>`; return; }
  if (imageMode) {
    els.collectionList.innerHTML = cards.map(card => `
      <button type="button" class="collection-image-card" data-id="${card.id}" aria-label="${esc(nameOf(card))}の詳細を開く">
        <img src="${esc(card.image)}" alt="" loading="lazy">
        ${yenValueOf(card) != null ? `<span class="collection-price-badge">${formatYen(yenValueOf(card))}</span>` : ""}
      </button>`).join("");
    els.collectionList.querySelectorAll(".collection-image-card").forEach(button => {
      const card = state.collection.find(item => item.id === button.dataset.id);
      button.addEventListener("click", () => openOwnedCard(card));
    });
    return;
  }
  const visibleIds = cards.map(card => card.id);
  els.collectionList.innerHTML = cards.map((card, index) => `
    <article class="list-item" data-id="${card.id}">
      <button class="collection-card-open" type="button" aria-label="${esc(nameOf(card))}の詳細を開く">
        <img class="thumb" src="${esc(card.image)}" alt="" loading="lazy">
        <span class="item-main"><strong>${esc(nameOf(card))}</strong><small>${esc(card.set)} #${esc(card.collectorNumber)} · ${esc(card.condition)} · ${card.finish === "normal" ? "通常" : esc(card.finish)}${card.metadataVersion ? ` · MV ${esc(card.manaValue)}` : ""}</small>${yenValueOf(card) != null ? `<span class="asset-value">${selectedPriceUsesEnglish(card) ? "英語版参考" : "参考"} ${formatYen(yenValueOf(card))}（1枚 ${formatYen(yenValueOf(card) / card.quantity)}）</span>` : '<span class="asset-value">参考価格なし</span>'}${card.location ? `<span class="chip">${esc(card.location)}</span>` : ""}</span>
      </button>
      <div class="item-actions"><button class="tiny move-owned-up" aria-label="${esc(nameOf(card))}を前へ移動" ${index === 0 ? "disabled" : ""}>↑</button><button class="tiny move-owned-down" aria-label="${esc(nameOf(card))}を後へ移動" ${index === cards.length - 1 ? "disabled" : ""}>↓</button><button class="tiny minus" aria-label="1枚減らす">−</button><span class="qty-pill">×${card.quantity}</span><button class="tiny plus" aria-label="1枚増やす">＋</button><button class="tiny favorite-owned ${card.favorite ? "active" : ""}" aria-label="${esc(nameOf(card))}を${card.favorite ? "お気に入りから外す" : "お気に入りに追加"}" aria-pressed="${card.favorite ? "true" : "false"}">${card.favorite ? "★" : "☆"}</button><button class="tiny delete-owned" aria-label="${esc(nameOf(card))}をコレクションから削除">削除</button></div>
    </article>`).join("");
  els.collectionList.querySelectorAll(".list-item").forEach(row => {
    const card = state.collection.find(item => item.id === row.dataset.id);
    row.querySelector(".collection-card-open").addEventListener("click", () => openOwnedCard(card));
    row.querySelector(".move-owned-up").addEventListener("click", () => moveOwnedCard(card.id, -1, visibleIds));
    row.querySelector(".move-owned-down").addEventListener("click", () => moveOwnedCard(card.id, 1, visibleIds));
    row.querySelector(".plus").addEventListener("click", () => changeOwned(card, 1));
    row.querySelector(".minus").addEventListener("click", () => changeOwned(card, -1));
    row.querySelector(".favorite-owned").addEventListener("click", () => toggleFavorite(card));
    row.querySelector(".delete-owned").addEventListener("click", () => deleteOwned(card));
  });
}

function ownedCardToApiCard(card) {
  return {
    id: card.scryfallId,
    oracle_id: card.oracleId || "",
    name: card.name,
    printed_name: card.printedName,
    set: String(card.set || "").toLowerCase(),
    set_name: card.setName,
    collector_number: card.collectorNumber,
    type_line: card.typeLine,
    printed_type_line: card.printedTypeLine,
    mana_cost: card.manaCost,
    cmc: card.manaValue,
    colors: card.colors || [],
    color_identity: card.colorIdentity || [],
    prices: { usd: card.priceUsd || null, usd_foil: card.priceUsdFoil || null, usd_etched: card.priceUsdEtched || null },
    image_uris: { normal: card.image },
    lang: card.language,
  };
}

function applyCardMetadata(ownedCard, apiCard) {
  ownedCard.oracleId = apiCard.oracle_id || ownedCard.oracleId || "";
  ownedCard.typeLine = apiCard.type_line || ownedCard.typeLine || "";
  ownedCard.printedTypeLine = apiCard.printed_type_line || ownedCard.printedTypeLine || "";
  ownedCard.manaCost = apiCard.mana_cost || apiCard.card_faces?.map(face => face.mana_cost).filter(Boolean).join(" // ") || "";
  ownedCard.manaValue = Number(apiCard.cmc || 0);
  ownedCard.colors = apiCard.colors || [];
  ownedCard.colorIdentity = apiCard.color_identity || [];
  ownedCard.priceUsd = apiCard.prices?.usd || null;
  ownedCard.priceUsdFoil = apiCard.prices?.usd_foil || null;
  ownedCard.priceUsdEtched = apiCard.prices?.usd_etched || null;
  ownedCard.priceUsdFromEnglish = false;
  ownedCard.priceUsdFoilFromEnglish = false;
  ownedCard.priceUsdEtchedFromEnglish = false;
  ownedCard.englishPriceUpdatedAt = 0;
  ownedCard.priceUpdatedAt = Date.now();
  ownedCard.metadataVersion = 1;
}

async function hydrateEnglishPriceFallbacks() {
  if (!navigator.onLine) return;
  const candidates = state.collection.filter(card =>
    card.language === "ja" && card.set && card.collectorNumber &&
    (!card.englishPriceUpdatedAt || Date.now() - card.englishPriceUpdatedAt > DAY_MS) &&
    (!card.priceUsd || !card.priceUsdFoil || !card.priceUsdEtched));
  const printings = [...new Map(candidates.map(card => [`${card.set}:${card.collectorNumber}`, card])).values()];
  let changed = false;
  for (const printing of printings) {
    try {
      const set = encodeURIComponent(String(printing.set).toLowerCase());
      const number = encodeURIComponent(printing.collectorNumber);
      const response = await fetch(`https://api.scryfall.com/cards/${set}/${number}/en`, { headers: { Accept: "application/json" } });
      const englishCard = response.ok ? await response.json() : null;
      state.collection.filter(card => card.language === "ja" && card.set === printing.set && card.collectorNumber === printing.collectorNumber).forEach(card => {
        card.englishPriceUpdatedAt = Date.now();
        if (englishCard) {
          if (!card.priceUsd && englishCard.prices?.usd) { card.priceUsd = englishCard.prices.usd; card.priceUsdFromEnglish = true; }
          if (!card.priceUsdFoil && englishCard.prices?.usd_foil) { card.priceUsdFoil = englishCard.prices.usd_foil; card.priceUsdFoilFromEnglish = true; }
          if (!card.priceUsdEtched && englishCard.prices?.usd_etched) { card.priceUsdEtched = englishCard.prices.usd_etched; card.priceUsdEtchedFromEnglish = true; }
        }
        changed = true;
      });
    } catch { /* 次回オンライン時に再試行 */ }
  }
  if (changed) { persist(); renderCollection(); }
}

async function hydrateCollectionMetadata() {
  if (!navigator.onLine) return;
  const pendingIds = [...new Set(state.collection
    .filter(card => (!card.metadataVersion || !card.priceUpdatedAt || Date.now() - card.priceUpdatedAt > DAY_MS) && card.scryfallId && !card.scryfallId.startsWith("sample-"))
    .map(card => card.scryfallId))];
  let changed = false;
  for (let index = 0; index < pendingIds.length; index += 75) {
    const identifiers = pendingIds.slice(index, index + 75).map(id => ({ id }));
    try {
      const response = await fetch("https://api.scryfall.com/cards/collection", {
        method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify({ identifiers }),
      });
      if (!response.ok) continue;
      const data = await response.json();
      for (const apiCard of data.data) {
        state.collection.filter(card => card.scryfallId === apiCard.id).forEach(card => applyCardMetadata(card, apiCard));
        changed = true;
      }
    } catch { /* 次回オンライン時に再試行 */ }
  }
  if (changed) { persist(); renderCollection(); }
  await hydrateEnglishPriceFallbacks();
}

async function refreshExchangeRate() {
  if (!navigator.onLine || (state.fx.usdJpy && Date.now() - state.fx.updatedAt < DAY_MS)) { renderCollection(); return; }
  const endpoints = [
    "https://api.frankfurter.dev/v1/latest?base=USD&symbols=JPY",
    "https://open.er-api.com/v6/latest/USD",
  ];
  for (const url of endpoints) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4500);
    try {
      const response = await fetch(url, { signal: controller.signal });
      if (!response.ok) continue;
      const data = await response.json();
      const rate = Number(data.rates?.JPY || data.conversion_rates?.JPY || 0);
      if (!rate) continue;
      state.fx = { usdJpy: rate, updatedAt: Date.now(), source: "auto" };
      persist(); renderCollection();
      return;
    } catch { /* 次の取得先を試す */ }
    finally { clearTimeout(timer); }
  }
  if (!state.fx.usdJpy) state.fx = { usdJpy: 150, updatedAt: Date.now(), source: "fallback" };
  persist(); renderCollection();
}

function saveExchangeRate() {
  const rate = Number(els.usdJpyRate.value || 0);
  if (!rate || rate <= 0) { showToast("正しい換算レートを入力してください"); return; }
  state.fx = { usdJpy: rate, updatedAt: Date.now(), source: "manual" };
  persist(); renderCollection();
  showToast("円換算レートを保存しました");
}

async function openOwnedCard(ownedCard) {
  let card = ownedCardToApiCard(ownedCard);
  if (navigator.onLine && ownedCard.scryfallId && !ownedCard.scryfallId.startsWith("sample-")) {
    try {
      const response = await fetch(`https://api.scryfall.com/cards/${encodeURIComponent(ownedCard.scryfallId)}`, { headers: { Accept: "application/json" } });
      if (response.ok) {
        card = await response.json();
        state.collection.filter(item => item.scryfallId === ownedCard.scryfallId).forEach(item => applyCardMetadata(item, card));
        persist();
      }
    } catch {
      showToast("オフライン情報で開きます");
    }
  }
  openCardDialog(card, "collection", ownedCard.id);
}

function changeOwned(card, delta) {
  if (card.quantity + delta <= 0) {
    deleteOwned(card);
    return;
  } else card.quantity += delta;
  persist(); renderCollection();
}

function deleteOwned(card) {
  if (!confirm(`${nameOf(card)}をコレクションから削除しますか？\nこの収録版の所持データがすべて削除されます。`)) return;
  state.collection = state.collection.filter(item => item.id !== card.id);
  persist(); renderCollection(); renderDecks();
  showToast("コレクションから削除しました");
}

function toggleFavorite(card) {
  card.favorite = !card.favorite;
  persist(); renderCollection();
  showToast(card.favorite ? "お気に入りに追加しました" : "お気に入りから外しました");
}

function toggleSelectedFavorite() {
  const card = selectedOwnedCard();
  if (!card) return;
  card.favorite = !card.favorite;
  persist(); renderCollection(); updateCardOwnedActions();
  showToast(card.favorite ? "お気に入りに追加しました" : "お気に入りから外しました");
}

function deleteSelectedOwned() {
  const card = selectedOwnedCard();
  if (!card) return;
  deleteOwned(card);
  els.cardDialog.close();
}

function deckFormats() {
  const fromDecks = state.decks.map(deck => deck.format).filter(Boolean);
  const fromEditor = els.deckFormat ? [...els.deckFormat.options].map(option => option.value || option.textContent).filter(Boolean) : [];
  return [...new Set([...fromEditor, ...fromDecks])];
}

function renderDeckFormatFilter() {
  if (!els.deckFormatFilter) return;
  const current = state.deckFormatFilter || "";
  els.deckFormatFilter.innerHTML = `<option value="">すべて</option>${deckFormats().map(format => `<option value="${esc(format)}">${esc(format)}</option>`).join("")}`;
  els.deckFormatFilter.value = deckFormats().includes(current) ? current : "";
  state.deckFormatFilter = els.deckFormatFilter.value;
  localStorage.setItem(KEYS.deckFormatFilter, state.deckFormatFilter);
}

function renderDecks() {
  renderDeckFormatFilter();
  if (!state.decks.length) { els.deckList.innerHTML = '<div class="empty">「新規デッキ」からデッキを作成できます</div>'; return; }
  let migrated = false;
  const visibleDecks = state.deckFormatFilter ? state.decks.filter(deck => deck.format === state.deckFormatFilter) : state.decks;
  if (!visibleDecks.length) { els.deckList.innerHTML = `<div class="empty">${esc(state.deckFormatFilter)}のデッキはまだありません</div>`; return; }
  els.deckList.innerHTML = visibleDecks.map(deck => {
    migrated = ensureDeckDates(deck) || migrated;
    const total = deck.entries.filter(entry => isDeckBuildSection(entry.section)).reduce((sum, entry) => sum + entry.quantity, 0);
    const missing = missingCount(deck);
    const memo = String(deck.memo || "").trim();
    const memoPreview = memo ? `<p class="deck-memo-preview">${esc(memo.slice(0, 90))}${memo.length > 90 ? "…" : ""}</p>` : "";
    return `<button class="deck-tile" data-id="${deck.id}"><span class="eyebrow">${esc(deck.format)}</span><h2>${esc(deck.name)}</h2><span class="deck-total">${total}</span> 枚<p>${deck.entries.length}種類${missing ? ` · <b>${missing}枚不足</b>` : " · 所持内で構築可能"}</p>${memoPreview}<small class="deck-date-line">作成 ${formatDeckDate(deck.createdAt)} · 更新 ${formatDeckDate(deck.updatedAt)}</small></button>`;
  }).join("");
  if (migrated) persist();
  els.deckList.querySelectorAll("button").forEach(button => button.addEventListener("click", () => openDeck(button.dataset.id)));
}

function newDeck() {
  const now = Date.now();
  state.editingDeck = { id: uid(), name: "新しいデッキ", format: state.deckFormatFilter || "統率者戦", memo: "", entries: [], createdAt: now, updatedAt: now };
  els.deleteDeckButton.hidden = true;
  fillDeckDialog();
}

function parseDeckImportText(text) {
  const rows = [];
  const skipped = [];
  let section = "main";
  let sawCards = false;
  String(text || "").replace(/\r/g, "").split("\n").forEach((rawLine, index) => {
    const line = rawLine.trim();
    if (!line) {
      if (sawCards) section = "side";
      return;
    }
    if (/^(sideboard|side board|サイド|サイドボード)$/i.test(line)) {
      section = "side";
      return;
    }
    const match = line.match(/^(\d+)\s*x?\s+(.+)$/i);
    if (!match) {
      skipped.push({ line: index + 1, text: line, reason: "形式を読み取れませんでした" });
      return;
    }
    const quantity = Number(match[1]);
    const name = match[2].trim();
    if (!quantity || !name) {
      skipped.push({ line: index + 1, text: line, reason: "枚数またはカード名が不正です" });
      return;
    }
    rows.push({ line: index + 1, quantity, name, section });
    sawCards = true;
  });
  return { rows, skipped };
}

function escapeScryfallText(value) {
  return String(value || "").replaceAll("\\", "\\\\").replaceAll('"', '\\"');
}

async function findCardForDeckImport(name) {
  const preferredLang = isJapanese(name) ? "ja" : "en";
  const exactName = escapeScryfallText(name);
  const exactQueries = [`!"${exactName}" lang:${preferredLang}`, `!"${exactName}"`];
  for (const query of exactQueries) {
    const result = await fetchScryfallSearch(query, { unique: "cards", order: "name" });
    if (result.ok && result.data.data?.length) return applyJpIndexToCard(result.data.data[0]);
  }
  const exactCandidates = await fetchSearchCandidates(name, "", preferredLang, true, 5);
  if (exactCandidates.cards.length) return applyJpIndexToCard(exactCandidates.cards[0]);
  const looseCandidates = await fetchSearchCandidates(name, "", preferredLang, false, 5);
  return looseCandidates.cards.length ? applyJpIndexToCard(looseCandidates.cards[0]) : null;
}

function pushImportedDeckEntry(entries, cardId, card, section, quantity) {
  const existing = entries.find(entry => entry.cardId === cardId && entry.section === section);
  if (existing) existing.quantity += quantity;
  else entries.push({ cardId, card, section, quantity });
}

function deckImportMemo(fileName, imported, skipped) {
  const lines = [
    `インポート元: ${fileName}`,
    `読み込み成功: ${imported.reduce((sum, item) => sum + item.quantity, 0)}枚 / ${imported.length}行`,
  ];
  if (skipped.length) {
    lines.push("", "読み込めなかったカード:");
    skipped.forEach(item => {
      lines.push(`- ${item.quantity ? `${item.quantity} ` : ""}${item.name || item.text || ""}${item.section ? `（${sectionLabel(item.section)}）` : ""}: ${item.reason}`);
    });
  }
  return lines.join("\n");
}

async function importDeckFromTextFile(file) {
  if (!file) return;
  if (!navigator.onLine) {
    showToast("オンライン時のみデッキをインポートできます");
    return;
  }
  showToast("デッキをインポート中です");
  const text = await file.text();
  const { rows, skipped } = parseDeckImportText(text);
  if (!rows.length) {
    showToast("読み込めるカード行がありませんでした");
    return;
  }
  const now = Date.now();
  const deck = {
    id: uid(),
    name: file.name.replace(/\.[^.]+$/, "") || "インポートデッキ",
    format: state.deckFormatFilter || "カジュアル",
    memo: "",
    entries: [],
    createdAt: now,
    updatedAt: now,
  };
  const imported = [];
  for (const row of rows) {
    const card = await findCardForDeckImport(row.name);
    if (!card) {
      skipped.push({ ...row, reason: "カード検索で見つかりませんでした" });
      continue;
    }
    const cardId = `scryfall-${card.id}`;
    pushImportedDeckEntry(deck.entries, cardId, deckCardSnapshot(card), row.section, row.quantity);
    imported.push(row);
    await new Promise(resolve => setTimeout(resolve, 80));
  }
  deck.memo = deckImportMemo(file.name, imported, skipped);
  state.decks.unshift(deck);
  state.editingDeck = structuredClone(deck);
  persist();
  renderDecks();
  els.deleteDeckButton.hidden = false;
  fillDeckDialog();
  showToast(`デッキをインポートしました（${imported.length}/${rows.length}行）`);
}

function openDeck(id) {
  const deck = state.decks.find(item => item.id === id);
  ensureDeckDates(deck);
  state.editingDeck = structuredClone(deck);
  els.deleteDeckButton.hidden = false;
  fillDeckDialog();
}

function fillDeckDialog() {
  ensureDeckDates(state.editingDeck);
  els.deckName.value = state.editingDeck.name;
  els.deckFormat.value = state.editingDeck.format;
  els.deckDates.textContent = `作成日 ${formatDeckDate(state.editingDeck.createdAt)}・更新日 ${formatDeckDate(state.editingDeck.updatedAt)}`;
  els.deckMemo.value = state.editingDeck.memo || "";
  els.deckCardFilter.value = "";
  els.deckOwnedColor.value = "";
  els.deckOwnedMana.value = "";
  els.deckOwnedType.value = "";
  els.deckOwnedFavoritesOnly.checked = false;
  els.deckGlobalSearch.value = "";
  els.deckGlobalSearchStatus.textContent = "未所持のカードもデッキに追加できます";
  state.deckSearchResults = [];
  state.deckMissingOpen = false;
  renderDeckEditor();
  els.deckDialog.showModal();
}

function deckCardSnapshot(card) {
  return {
    scryfallId: card.scryfallId || card.id || "", oracleId: card.oracleId || card.oracle_id || "",
    name: card.name || "", printedName: nameOf(card) || card.printedName || card.printed_name || "",
    set: (card.set || "").toUpperCase(), collectorNumber: card.collectorNumber || card.collector_number || "",
    image: imageOf(card), typeLine: card.typeLine || card.type_line || "",
    manaValue: Number(card.manaValue ?? card.cmc ?? 0), colorIdentity: card.colorIdentity || card.color_identity || card.colors || [],
  };
}

function cardForDeckEntry(entry) {
  return state.collection.find(item => item.id === entry.cardId) || entry.card || null;
}

function ownedQuantityForEntry(entry) {
  const card = cardForDeckEntry(entry);
  const scryfallId = card?.scryfallId || "";
  if (scryfallId) return state.collection.filter(item => item.scryfallId === scryfallId).reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  return state.collection.find(item => item.id === entry.cardId)?.quantity || 0;
}

function isSameDeckCard(a, b) {
  const aCard = cardForDeckEntry(a);
  const bCard = cardForDeckEntry(b);
  const aScryfallId = aCard?.scryfallId || "";
  const bScryfallId = bCard?.scryfallId || "";
  return aScryfallId && bScryfallId ? aScryfallId === bScryfallId : a.cardId === b.cardId;
}

function deckQuantityForEntry(entry, deck = state.editingDeck) {
  if (!deck?.entries?.length) return 0;
  return deck.entries.filter(item => isDeckBuildSection(item.section) && isSameDeckCard(item, entry)).reduce((sum, item) => sum + Number(item.quantity || 0), 0);
}

function missingQuantityForEntry(entry, deck = state.editingDeck) {
  return Math.max(0, deckQuantityForEntry(entry, deck) - ownedQuantityForEntry(entry));
}

function deckMissingGroups(deck = state.editingDeck) {
  const groups = new Map();
  (deck?.entries || []).filter(entry => isDeckBuildSection(entry.section)).forEach(entry => {
    const card = cardForDeckEntry(entry);
    const key = card?.scryfallId || entry.cardId;
    if (!groups.has(key)) groups.set(key, {
      key,
      entry,
      card,
      required: 0,
      sections: { commander: 0, main: 0, side: 0 },
    });
    const group = groups.get(key);
    group.required += Number(entry.quantity || 0);
    group.sections[entry.section] = (group.sections[entry.section] || 0) + Number(entry.quantity || 0);
  });
  return [...groups.values()].map(group => {
    const owned = ownedQuantityForEntry(group.entry);
    return { ...group, owned, missing: Math.max(0, group.required - owned) };
  }).filter(group => group.missing > 0);
}

function renderDeckMissingList() {
  const groups = deckMissingGroups();
  if (!groups.length) {
    els.deckMissingList.hidden = true;
    els.deckMissingList.innerHTML = "";
    return;
  }
  els.deckMissingList.hidden = false;
  const missingTotal = groups.reduce((sum, group) => sum + group.missing, 0);
  els.deckMissingList.innerHTML = `<button type="button" class="deck-missing-title" aria-expanded="${state.deckMissingOpen}">
      <b>不足カード一覧</b><span>${missingTotal}枚不足・${groups.length}種類 <em>${state.deckMissingOpen ? "▲" : "▼"}</em></span>
    </button>
    <div class="deck-missing-items" ${state.deckMissingOpen ? "" : "hidden"}>
      ${groups.map(group => {
        const card = group.card;
        const sectionText = [
          group.sections.commander ? `統率者 ${group.sections.commander}` : "",
          group.sections.main ? `メイン ${group.sections.main}` : "",
          group.sections.side ? `サイド ${group.sections.side}` : "",
        ].filter(Boolean).join("・");
        return `<button type="button" class="deck-missing-item" data-card-id="${esc(group.entry.cardId)}" data-section="${esc(group.entry.section)}">
          <img src="${esc(card?.image || "")}" alt="" loading="lazy">
          <span class="deck-missing-main"><strong>${esc(card ? nameOf(card) : "削除済みカード")}</strong><small>${esc(card?.set || "")} #${esc(card?.collectorNumber || "")}${sectionText ? ` · ${esc(sectionText)}` : ""}</small></span>
          <span class="deck-missing-count"><b>不足 ${group.missing}</b><small>必要 ${group.required} / 所持 ${group.owned}</small></span>
        </button>`;
      }).join("")}
    </div>`;
  els.deckMissingList.querySelector(".deck-missing-title").addEventListener("click", () => {
    state.deckMissingOpen = !state.deckMissingOpen;
    renderDeckMissingList();
  });
  els.deckMissingList.querySelectorAll(".deck-missing-item").forEach(button => {
    button.addEventListener("click", () => openDeckEntryEditor(button.dataset.cardId, button.dataset.section));
  });
}

function deckTypeLabel(card) {
  const group = deckVisualTypeGroup(card);
  return group.key === "land" ? "土地" :
    group.key === "creature" ? "クリーチャー" :
    group.key === "instant" ? "インスタント" :
    group.key === "sorcery" ? "ソーサリー" :
    group.key === "artifact" ? "アーティファクト" :
    group.key === "enchantment" ? "エンチャント" :
    group.key === "planeswalker" ? "プレインズウォーカー" :
    group.key === "battle" ? "バトル" : "その他";
}

function deckColorLabel(identity) {
  if (!identity.length) return "無色";
  if (identity.length > 1) return "多色";
  return ({ W: "白", U: "青", B: "黒", R: "赤", G: "緑" })[identity[0]] || "その他";
}

function deckStatsForEntries(entries) {
  const stats = {
    total: 0,
    lands: 0,
    nonlands: 0,
    colors: new Map([["白", 0], ["青", 0], ["黒", 0], ["赤", 0], ["緑", 0], ["多色", 0], ["無色", 0]]),
    mana: new Map(["0", "1", "2", "3", "4", "5", "6", "7+"].map(key => [key, 0])),
    types: new Map(["クリーチャー", "インスタント", "ソーサリー", "アーティファクト", "エンチャント", "プレインズウォーカー", "バトル", "土地", "その他"].map(key => [key, 0])),
  };
  entries.forEach(entry => {
    const card = cardForDeckEntry(entry);
    const qty = Number(entry.quantity || 0);
    const type = String(card?.typeLine || card?.type_line || "");
    const isLand = type.includes("Land");
    const identity = card?.colorIdentity || card?.color_identity || card?.colors || [];
    const colorLabel = deckColorLabel(identity);
    const typeLabel = deckTypeLabel(card);
    const manaValue = Math.max(0, Math.floor(Number(card?.manaValue ?? card?.cmc ?? 0)));
    const manaKey = manaValue >= 7 ? "7+" : String(manaValue);
    stats.total += qty;
    if (isLand) stats.lands += qty; else stats.nonlands += qty;
    stats.colors.set(colorLabel, (stats.colors.get(colorLabel) || 0) + qty);
    stats.types.set(typeLabel, (stats.types.get(typeLabel) || 0) + qty);
    if (!isLand) stats.mana.set(manaKey, (stats.mana.get(manaKey) || 0) + qty);
  });
  return stats;
}

function renderStatBars(map, maxValue, className = "") {
  return [...map.entries()].filter(([, value]) => value > 0).map(([label, value]) => {
    const pct = maxValue ? Math.max(6, Math.round((value / maxValue) * 100)) : 0;
    return `<div class="deck-stat-bar ${className}"><span>${esc(label)}</span><b>${value}</b><i style="--w:${pct}%"></i></div>`;
  }).join("") || '<p class="muted">データなし</p>';
}

function renderDeckStats() {
  const deck = state.editingDeck;
  if (!deck?.entries?.length) {
    els.deckStats.hidden = true;
    els.deckStats.innerHTML = "";
    return;
  }
  const stats = deckStatsForEntries(deck.entries.filter(entry => isDeckBuildSection(entry.section)));
  const maxColor = Math.max(1, ...stats.colors.values());
  const maxMana = Math.max(1, ...stats.mana.values());
  const maxType = Math.max(1, ...stats.types.values());
  els.deckStats.hidden = false;
  els.deckStats.innerHTML = `<div class="deck-stats-head"><b>デッキ統計</b><span>土地 ${stats.lands}枚 / 非土地 ${stats.nonlands}枚</span></div>
    <div class="deck-stat-summary">
      <span><b>${stats.total}</b>総枚数</span>
      <span><b>${stats.lands}</b>土地</span>
      <span><b>${stats.nonlands}</b>非土地</span>
    </div>
    <div class="deck-stat-grid">
      <section><h4>色分布</h4>${renderStatBars(stats.colors, maxColor, "color")}</section>
      <section><h4>マナカーブ</h4>${renderStatBars(stats.mana, maxMana, "mana")}</section>
      <section><h4>タイプ内訳</h4>${renderStatBars(stats.types, maxType, "type")}</section>
    </div>`;
}

function groupedOwnedDeckCards(query) {
  const groups = new Map();
  const color = els.deckOwnedColor.value;
  const mana = els.deckOwnedMana.value;
  const type = els.deckOwnedType.value;
  const favoritesOnly = els.deckOwnedFavoritesOnly.checked;
  state.collection.filter(card => {
    const textMatch = [card.name, card.printedName, card.setName, card.typeLine, card.printedTypeLine].join(" ").toLowerCase().includes(query);
    const identity = card.colorIdentity || card.colors || [];
    const colorMatch = !color || (color === "C" ? identity.length === 0 : color === "M" ? identity.length > 1 : identity.includes(color));
    const manaValue = Number(card.manaValue || 0);
    const manaMatch = !mana || (mana === "7+" ? manaValue >= 7 : manaValue === Number(mana));
    const typeMatch = !type || String(card.typeLine || "").toLowerCase().includes(type.toLowerCase());
    const favoriteMatch = !favoritesOnly || card.favorite === true;
    return textMatch && colorMatch && manaMatch && typeMatch && favoriteMatch;
  }).forEach(card => {
    const key = card.scryfallId || `${card.name}:${card.image}`;
    if (!groups.has(key)) groups.set(key, { card, quantity: 0 });
    groups.get(key).quantity += Number(card.quantity || 0);
  });
  return [...groups.values()].slice(0, 40);
}

function deckImageButton(card, metadata, attributes, action = "デッキに追加") {
  return `<button type="button" class="deck-card-choice" ${attributes} aria-label="${esc(nameOf(card))}の${action}"><img src="${esc(imageOf(card))}" alt="" loading="lazy"><span><b>${esc(nameOf(card))}</b>${esc(metadata)}</span></button>`;
}

function deckCountsForCard(card) {
  const counts = { commander: 0, main: 0, side: 0, maybe: 0 };
  const scryfallId = card.scryfallId || "";
  state.editingDeck.entries.forEach(entry => {
    const entryCard = cardForDeckEntry(entry);
    const sameCard = scryfallId ? (entryCard?.scryfallId === scryfallId) : entry.cardId === card.id;
    if (sameCard && counts[entry.section] != null) counts[entry.section] += Number(entry.quantity || 0);
  });
  return counts;
}

function deckCountBadgesForCard(card) {
  const counts = deckCountsForCard(card);
  const sections = deckDisplaySections();
  const badges = sections.filter(section => counts[section] > 0).map(section => `<span>${sectionLabel(section)} ${counts[section]}</span>`);
  return badges.length ? badges.join("") : "<span>未追加</span>";
}

function deckOwnedChoiceButton(card) {
  const meta = `${esc(card.set || "")} #${esc(card.collectorNumber || "")}${card.typeLine ? ` · ${esc(card.typeLine)}` : ""}`;
  const sections = deckDisplaySections();
  const buttons = sections.map(section => `<button type="button" data-owned-add-section="${section}" data-id="${esc(card.id)}">${sectionLabel(section)}＋</button>`).join("");
  return `<div class="deck-owned-choice" data-id="${esc(card.id)}">
    <img src="${esc(imageOf(card))}" alt="" loading="lazy">
    <span class="deck-owned-main"><strong>${esc(nameOf(card))}</strong><small>${meta}</small></span>
    <span class="deck-added-counts">${deckCountBadgesForCard(card)}</span>
    <span class="deck-owned-add-buttons">${buttons}</span>
  </div>`;
}

function isCommanderDeck(deck = state.editingDeck) {
  return deck?.format === "統率者戦";
}

function sectionLabel(section) {
  return { main: "メイン", side: "サイド", commander: "統率者" }[section] || "メイン";
}

function isDeckBuildSection(section) {
  return section === "main" || section === "side" || section === "commander";
}

function deckDisplaySections() {
  return isCommanderDeck() ? ["commander", "main", "side", "maybe"] : ["main", "side", "maybe"];
}

function sectionLabel(section) {
  return { main: "メイン", side: "サイド", commander: "統率者", maybe: "候補" }[section] || "メイン";
}

function mergeDeckEntryInto(cardId, card, section, quantity) {
  const entry = state.editingDeck.entries.find(item => item.cardId === cardId && item.section === section);
  if (entry) entry.quantity += quantity; else state.editingDeck.entries.push({ cardId, card, section, quantity });
}

function normalizeDeckSectionsForFormat() {
  if (isCommanderDeck()) return;
  const commanderEntries = state.editingDeck.entries.filter(entry => entry.section === "commander");
  if (!commanderEntries.length) return;
  state.editingDeck.entries = state.editingDeck.entries.filter(entry => entry.section !== "commander");
  commanderEntries.forEach(entry => mergeDeckEntryInto(entry.cardId, entry.card, "main", entry.quantity));
  if (state.editingDeckEntry?.section === "commander") state.editingDeckEntry.section = "main";
}

function applyDeckFormFields() {
  if (!state.editingDeck) return;
  state.editingDeck.name = els.deckName.value.trim() || "名称未設定のデッキ";
  state.editingDeck.format = els.deckFormat.value;
  state.editingDeck.memo = els.deckMemo.value.trim();
  normalizeDeckSectionsForFormat();
  if (!state.editingDeck.createdAt) state.editingDeck.createdAt = Date.now();
  state.editingDeck.updatedAt = Date.now();
  if (els.deckDates) els.deckDates.textContent = `作成日 ${formatDeckDate(state.editingDeck.createdAt)}・更新日 ${formatDeckDate(state.editingDeck.updatedAt)}`;
}

function autoSaveEditingDeck() {
  if (!state.editingDeck) return;
  applyDeckFormFields();
  const savedDeck = structuredClone(state.editingDeck);
  const index = state.decks.findIndex(item => item.id === savedDeck.id);
  if (index >= 0) state.decks[index] = savedDeck; else state.decks.unshift(savedDeck);
  persist();
  renderDecks();
}

function syncCommanderOptions() {
  const allowCommander = isCommanderDeck();
  [els.deckSection, els.deckEntrySection].forEach(select => {
    const option = select.querySelector('option[value="commander"]');
    if (!option) return;
    option.hidden = !allowCommander;
    option.disabled = !allowCommander;
    if (!allowCommander && select.value === "commander") select.value = "main";
  });
  document.querySelectorAll("[data-deck-section-target]").forEach(button => {
    const disabled = button.dataset.deckSectionTarget === "commander" && !allowCommander;
    button.hidden = disabled;
    button.disabled = disabled;
    button.classList.toggle("active", button.dataset.deckSectionTarget === els.deckSection.value);
  });
}

function renderDeckSection(section, entries, emptyText = "") {
  const label = sectionLabel(section);
  const content = entries.length ? `
    <div class="deck-content-grid">
      ${entries.map(entry => {
        const card = cardForDeckEntry(entry);
        const missing = section === "maybe" ? 0 : missingQuantityForEntry(entry);
        return `<button type="button" class="deck-content-card ${missing ? "missing-card" : ""}" data-card-id="${esc(entry.cardId)}" data-section="${entry.section}" aria-label="${esc(card ? nameOf(card) : "削除済みカード")} ${label} ${entry.quantity}枚を編集${missing ? `、${missing}枚不足` : ""}"><img src="${esc(card?.image || "")}" alt="" loading="lazy"><span class="deck-card-quantity" aria-hidden="true">${entry.quantity}</span>${missing ? `<span class="deck-missing-badge">不足 ${missing}</span>` : ""}</button>`;
      }).join("")}
    </div>` : `<div class="deck-section-empty">${esc(emptyText || `${label}にカードがありません`)}</div>`;
  return `<section class="deck-section deck-section-${section}"><div class="deck-section-title"><span>${esc(label)}</span><b>${entries.reduce((sum, entry) => sum + Number(entry.quantity || 0), 0)}枚</b></div>${content}</section>`;
}

function deckVisualTypeGroup(card) {
  const type = String(card?.typeLine || card?.type_line || "");
  if (type.includes("Land")) return { key: "land", label: "Land" };
  if (type.includes("Creature")) return { key: "creature", label: "Creature" };
  if (type.includes("Artifact")) return { key: "artifact", label: "Artifact" };
  if (type.includes("Enchantment")) return { key: "enchantment", label: "Enchantment" };
  if (type.includes("Planeswalker")) return { key: "planeswalker", label: "Planeswalker" };
  if (type.includes("Instant")) return { key: "instant", label: "Instant" };
  if (type.includes("Sorcery")) return { key: "sorcery", label: "Sorcery" };
  if (type.includes("Battle")) return { key: "battle", label: "Battle" };
  return { key: "other", label: "Other" };
}

function renderVisualStack(entry) {
  const card = cardForDeckEntry(entry);
  const copies = Math.max(1, Math.min(8, Number(entry.quantity || 1)));
  const layers = Array.from({ length: copies }, (_, index) => `<img src="${esc(card?.image || "")}" alt="" loading="lazy" style="--i:${index}">`).join("");
  return `<div class="visual-stack" title="${esc(card ? nameOf(card) : "")} ×${entry.quantity}">
    <div class="visual-stack-images">${layers}</div>
    <span class="visual-stack-count">×${entry.quantity}</span>
  </div>`;
}

function renderVisualSection(title, entries, className = "") {
  const typeOrder = ["creature", "instant", "sorcery", "artifact", "enchantment", "planeswalker", "battle", "land", "other"];
  const groups = new Map();
  entries.forEach(entry => {
    const group = deckVisualTypeGroup(cardForDeckEntry(entry));
    if (!groups.has(group.key)) groups.set(group.key, { label: group.label, entries: [] });
    groups.get(group.key).entries.push(entry);
  });
  const content = typeOrder.filter(key => groups.has(key)).map(key => {
    const group = groups.get(key);
    const total = group.entries.reduce((sum, entry) => sum + Number(entry.quantity || 0), 0);
    return `<section class="visual-type-column visual-type-${key}">
      <div class="visual-type-title"><span>${group.label}</span><b>${total}</b></div>
      <div class="visual-stack-row">${group.entries.map(renderVisualStack).join("")}</div>
    </section>`;
  }).join("");
  return `<section class="visual-board-section ${className}">
    <div class="visual-board-title"><span>${esc(title)}</span><b>${entries.reduce((sum, entry) => sum + Number(entry.quantity || 0), 0)}</b></div>
    ${entries.length ? content : '<div class="deck-section-empty">カードがありません</div>'}
  </section>`;
}

function renderDeckVisualView() {
  const deck = state.editingDeck;
  if (!deck) return;
  const mainEntries = deck.entries.filter(entry => entry.section === "main");
  const sideEntries = deck.entries.filter(entry => entry.section === "side");
  const commanderEntries = deck.entries.filter(entry => entry.section === "commander");
  const maybeEntries = deck.entries.filter(entry => entry.section === "maybe");
  const total = deck.entries.filter(entry => isDeckBuildSection(entry.section)).reduce((sum, entry) => sum + Number(entry.quantity || 0), 0);
  els.deckVisualTitle.textContent = deck.name || "デッキ表示";
  els.deckVisualSummary.textContent = `${deck.format}・${total}枚`;
  els.deckVisualBoard.innerHTML = [
    isCommanderDeck() && commanderEntries.length ? renderVisualSection("Commander", commanderEntries, "visual-commander") : "",
    renderVisualSection("Main", mainEntries),
    renderVisualSection("Sideboard", sideEntries, "visual-sideboard"),
  ].join("");
}

function openDeckVisualView() {
  renderDeckVisualView();
  els.deckVisualDialog.showModal();
}

function renderDeckEditor() {
  const deck = state.editingDeck;
  deck.format = els.deckFormat.value;
  normalizeDeckSectionsForFormat();
  syncCommanderOptions();
  const total = deck.entries.filter(entry => isDeckBuildSection(entry.section)).reduce((sum, entry) => sum + entry.quantity, 0);
  const missing = missingCount(deck);
  els.deckCount.textContent = `${total}枚`;
  els.deckMissing.textContent = missing ? `${missing}枚不足` : "不足なし";
  els.deckMissing.style.color = missing ? "#9b332f" : "";
  renderDeckStats();
  renderDeckMissingList();

  renderDeckOwnedAddDialog();
  renderDeckSearchAddDialog();

  const mainEntries = deck.entries.filter(entry => entry.section === "main");
  const sideEntries = deck.entries.filter(entry => entry.section === "side");
  const commanderEntries = deck.entries.filter(entry => entry.section === "commander");
  const maybeEntries = deck.entries.filter(entry => entry.section === "maybe");
  const hasEntries = deck.entries.length > 0;
  els.deckCards.className = "deck-section-list";
  els.deckCards.innerHTML = hasEntries ? [
    isCommanderDeck() ? renderDeckSection("commander", commanderEntries, "統率者をここに追加できます") : "",
    renderDeckSection("main", mainEntries),
    renderDeckSection("side", sideEntries),
    renderDeckSection("maybe", maybeEntries, "採用を悩んでいるカードをここに置けます"),
  ].join("") : '<div class="empty">「所持カードから追加」または「全カードから検索」から追加できます</div>';
  els.deckCards.querySelectorAll(".deck-content-card").forEach(button => {
    button.addEventListener("click", () => openDeckEntryEditor(button.dataset.cardId, button.dataset.section));
  });
  if (els.deckVisualDialog.open) renderDeckVisualView();
}

function renderDeckOwnedAddDialog() {
  const keepScroll = els.deckOwnedAddDialog.open;
  const listScrollTop = keepScroll ? els.deckCandidates.scrollTop : 0;
  const listScrollLeft = keepScroll ? els.deckCandidates.scrollLeft : 0;
  const dialogForm = els.deckOwnedAddDialog.querySelector(".deck-add-dialog");
  const dialogScrollTop = keepScroll && dialogForm ? dialogForm.scrollTop : 0;
  if (keepScroll && els.deckCandidates.contains(document.activeElement)) document.activeElement.blur();
  const query = els.deckCardFilter.value.trim().toLowerCase();
  const candidates = groupedOwnedDeckCards(query);
  els.deckCandidates.innerHTML = candidates.length ? candidates.map(({ card }) => deckOwnedChoiceButton(card)).join("") : '<span class="deck-search-empty">追加できる所持カードがありません</span>';
  els.deckCandidates.querySelectorAll("[data-owned-add-section]").forEach(button => {
    button.addEventListener("click", () => addOwnedToDeck(button.dataset.id, button.dataset.ownedAddSection));
  });
  if (keepScroll) requestAnimationFrame(() => {
    els.deckCandidates.scrollTop = listScrollTop;
    els.deckCandidates.scrollLeft = listScrollLeft;
    if (dialogForm) dialogForm.scrollTop = dialogScrollTop;
  });
}

function renderDeckSearchAddDialog() {
  els.deckGlobalSearchResults.innerHTML = state.deckSearchResults.map((card, index) => deckImageButton(card, `${(card.set || "").toUpperCase()} #${card.collector_number || ""}`, `data-index="${index}"`, "詳細とイラストを選択")).join("");
  els.deckGlobalSearchResults.querySelectorAll("button").forEach(button => button.addEventListener("click", () => openDeckSearchCard(Number(button.dataset.index))));
}

function openDeckOwnedAddDialog() {
  els.deckOwnedAddStatus.textContent = "";
  els.deckOwnedAddStatus.classList.remove("show");
  syncCommanderOptions();
  renderDeckOwnedAddDialog();
  els.deckOwnedAddDialog.showModal();
}

function resetDeckSearchAddForm() {
  els.deckGlobalSearch.value = "";
  els.deckSearchMatch.value = "partial";
  els.deckSearchColor.value = "";
  els.deckSearchMana.value = "";
  els.deckSearchType.value = "";
  els.deckSearchSet.value = "";
  if (els.deckSearchSetIncludeExtras) els.deckSearchSetIncludeExtras.checked = false;
  state.deckSearchResults = [];
  els.deckGlobalSearchStatus.textContent = "";
  renderSetSelects();
  renderDeckSearchAddDialog();
}

function openDeckSearchAddDialog() {
  resetDeckSearchAddForm();
  syncCommanderOptions();
  renderDeckSearchAddDialog();
  els.deckSearchAddDialog.showModal();
}

function currentDeckEntry() {
  if (!state.editingDeckEntry) return null;
  return state.editingDeck.entries.find(entry => entry.cardId === state.editingDeckEntry.cardId && entry.section === state.editingDeckEntry.section) || null;
}

function deckEntriesForCurrentCard() {
  if (!state.editingDeckEntry) return [];
  return state.editingDeck.entries.filter(entry => entry.cardId === state.editingDeckEntry.cardId);
}

function deckEntryForCurrentCardSection(section) {
  return deckEntriesForCurrentCard().find(entry => entry.section === section) || null;
}

function currentDeckCardTemplate() {
  const entry = currentDeckEntry() || deckEntriesForCurrentCard()[0];
  return entry ? { cardId: entry.cardId, card: entry.card || cardForDeckEntry(entry) } : null;
}

function openDeckEntryEditor(cardId, section) {
  state.editingDeckEntry = { cardId, section };
  renderDeckEntryEditor();
  els.deckEntryDialog.showModal();
}

function deckEntryCurrentCard() {
  const entry = currentDeckEntry() || deckEntriesForCurrentCard()[0];
  return entry ? cardForDeckEntry(entry) : null;
}

function deckEntryCurrentScryfallId() {
  const card = deckEntryCurrentCard();
  return card?.scryfallId || card?.id || "";
}

function apiSeedFromDeckCard(card) {
  if (!card) return null;
  return {
    id: card.scryfallId || card.id || "",
    oracle_id: card.oracleId || card.oracle_id || "",
    name: card.name || card.printedName || "",
    printed_name: card.printedName || "",
    set: String(card.set || "").toLowerCase(),
    collector_number: card.collectorNumber || "",
    image: card.image || "",
    image_uris: card.image ? { normal: card.image } : undefined,
    type_line: card.typeLine || "",
    cmc: card.manaValue || 0,
    color_identity: card.colorIdentity || [],
  };
}

async function loadDeckEntryVariants() {
  const card = deckEntryCurrentCard();
  if (!card || !els.deckEntryVariants) return;
  state.deckEntryVariants = [];
  els.deckEntryVariantFilter.value = "";
  els.deckEntryVariantCount.textContent = "";
  els.deckEntryVariants.innerHTML = '<span class="muted">収録版を読み込み中…</span>';
  const seed = apiSeedFromDeckCard(card);
  const key = seed.oracle_id || seed.name || seed.id;
  let variants = state.variantCache.get(`deck:${key}`);
  if (!variants) {
    let prints = [];
    if (seed.oracle_id) prints = await fetchUnifiedPrints([seed.oracle_id]);
    if (!prints.length && seed.name) {
      const result = await fetchSearchCandidates(seed.name, "", isJapanese(seed.name) ? "ja" : "en", true, 40);
      prints = result.cards;
    }
    variants = applyJpIndexToCards(sortUnifiedPrints(prints.length ? prints : [seed]));
    state.variantCache.set(`deck:${key}`, variants);
  }
  state.deckEntryVariants = variants;
  renderDeckEntryVariantGallery();
}

async function openDeckEntryVariantDialog() {
  if (!state.editingDeckEntry) return;
  els.deckEntryVariantDialog.showModal();
  await loadDeckEntryVariants();
}

function renderDeckEntryVariantGallery() {
  const currentId = deckEntryCurrentScryfallId();
  const lang = els.deckEntryVariantFilter?.value || "";
  const variants = state.deckEntryVariants.filter(card => !lang || card.lang === lang);
  const jaCount = state.deckEntryVariants.filter(card => card.lang === "ja").length;
  const enCount = state.deckEntryVariants.filter(card => card.lang === "en").length;
  els.deckEntryVariantCount.textContent = lang ? `${variants.length}版` : `${state.deckEntryVariants.length}版（日${jaCount}・英${enCount}）`;
  if (!variants.length) {
    els.deckEntryVariants.innerHTML = '<span class="muted">該当する収録版がありません</span>';
    return;
  }
  els.deckEntryVariants.innerHTML = variants.map(card => `
    <button type="button" class="variant-option ${card.id === currentId ? "selected" : ""}" data-id="${esc(card.id)}" aria-label="${esc(nameOf(card))} ${(card.set || "").toUpperCase()} ${card.collector_number || ""}">
      <img src="${esc(imageOf(card))}" alt="" loading="lazy"><span>${card.lang === "ja" ? "日" : "英"} · ${esc((card.set || "").toUpperCase())}</span>
    </button>`).join("");
  els.deckEntryVariants.querySelectorAll("button").forEach(button => button.addEventListener("click", () => {
    const card = state.deckEntryVariants.find(item => item.id === button.dataset.id);
    if (card) replaceDeckEntryVariant(card);
  }));
}

function replaceDeckEntryVariant(card) {
  const active = state.editingDeckEntry;
  if (!active || !card) return;
  const oldCardId = active.cardId;
  const newCardId = `scryfall-${card.id}`;
  const snapshot = deckCardSnapshot(card);
  state.editingDeck.entries.forEach(entry => {
    if (entry.cardId === oldCardId) {
      entry.cardId = newCardId;
      entry.card = snapshot;
    }
  });
  const merged = [];
  state.editingDeck.entries.forEach(entry => {
    const existing = merged.find(item => item.cardId === entry.cardId && item.section === entry.section);
    if (existing) existing.quantity += Number(entry.quantity || 0);
    else merged.push(entry);
  });
  state.editingDeck.entries = merged;
  const nextEntry = state.editingDeck.entries.find(entry => entry.cardId === newCardId && entry.section === active.section)
    || state.editingDeck.entries.find(entry => entry.cardId === newCardId);
  state.editingDeckEntry = nextEntry ? { cardId: newCardId, section: nextEntry.section } : null;
  autoSaveEditingDeck();
  renderDeckEditor();
  if (state.editingDeckEntry) renderDeckEntryEditor();
  renderDeckEntryVariantGallery();
  if (els.deckEntryVariantDialog.open) els.deckEntryVariantDialog.close();
  showToast("デッキ内カードのイラストを変更しました");
}

function renderDeckEntryEditor() {
  const entry = currentDeckEntry() || deckEntriesForCurrentCard()[0];
  if (!entry) { els.deckEntryDialog.close(); return; }
  state.editingDeckEntry = { cardId: entry.cardId, section: entry.section };
  const card = cardForDeckEntry(entry);
  const owned = ownedQuantityForEntry(entry);
  const deckTotalForCard = deckEntriesForCurrentCard().filter(item => isDeckBuildSection(item.section)).reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  els.deckEntryImage.src = card?.image || "";
  els.deckEntryImage.alt = card ? nameOf(card) : "削除済みカード";
  els.deckEntrySet.textContent = `${card?.set || ""} #${card?.collectorNumber || ""}`;
  els.deckEntryName.textContent = card ? nameOf(card) : "削除済みカード";
  els.deckEntryOwned.textContent = `所持 ${owned}枚・デッキ ${deckTotalForCard}枚${deckTotalForCard > owned ? `・${deckTotalForCard - owned}枚不足` : "・不足なし"}`;
  syncCommanderOptions();
  els.deckEntrySection.value = entry.section;
  els.deckEntryQuantity.value = entry.quantity;
  els.mainDeckEntryQuantity.value = deckEntryForCurrentCardSection("main")?.quantity || 0;
  els.sideDeckEntryQuantity.value = deckEntryForCurrentCardSection("side")?.quantity || 0;
  els.commanderDeckEntryQuantity.value = deckEntryForCurrentCardSection("commander")?.quantity || 0;
  els.maybeDeckEntryQuantity.value = deckEntryForCurrentCardSection("maybe")?.quantity || 0;
  const commanderRow = document.querySelector('[data-section-row="commander"]');
  if (commanderRow) commanderRow.hidden = !isCommanderDeck();
  const sectionEntries = state.editingDeck.entries.filter(item => item.section === entry.section);
  const sectionIndex = sectionEntries.findIndex(item => item === entry);
  els.moveDeckEntryUp.disabled = sectionIndex <= 0;
  els.moveDeckEntryDown.disabled = sectionIndex < 0 || sectionIndex >= sectionEntries.length - 1;
}

function setDeckEntrySectionQuantity(section, quantity) {
  const template = currentDeckCardTemplate();
  if (!template) return;
  if (!isCommanderDeck() && section === "commander") return;
  const value = Math.max(0, Number(quantity || 0));
  const entry = deckEntryForCurrentCardSection(section);
  if (value <= 0) {
    if (entry) state.editingDeck.entries = state.editingDeck.entries.filter(item => item !== entry);
  } else if (entry) {
    entry.quantity = value;
  } else {
    state.editingDeck.entries.push({ cardId: template.cardId, card: template.card, section, quantity: value });
  }
  const remaining = state.editingDeck.entries.filter(item => item.cardId === template.cardId);
  const active = remaining.find(item => item.section === section) || remaining[0] || null;
  state.editingDeckEntry = active ? { cardId: template.cardId, section: active.section } : null;
  autoSaveEditingDeck();
  renderDeckEditor();
  if (state.editingDeckEntry) renderDeckEntryEditor(); else els.deckEntryDialog.close();
}

function adjustDeckEntrySectionQuantity(section, delta) {
  const current = deckEntryForCurrentCardSection(section)?.quantity || 0;
  setDeckEntrySectionQuantity(section, current + delta);
}

function setDeckEntryQuantity(quantity) {
  const entry = currentDeckEntry();
  if (!entry) return;
  entry.quantity = Math.max(1, Number(quantity || 1));
  autoSaveEditingDeck();
  renderDeckEditor(); renderDeckEntryEditor();
}

function moveDeckEntrySection(section) {
  const entry = currentDeckEntry();
  if (!entry || entry.section === section) return;
  const existing = state.editingDeck.entries.find(item => item !== entry && item.cardId === entry.cardId && item.section === section);
  if (existing) {
    existing.quantity += entry.quantity;
    state.editingDeck.entries = state.editingDeck.entries.filter(item => item !== entry);
    state.editingDeckEntry = { cardId: existing.cardId, section: existing.section };
  } else {
    entry.section = section;
    state.editingDeckEntry.section = section;
  }
  autoSaveEditingDeck();
  renderDeckEditor(); renderDeckEntryEditor();
}

function removeCurrentDeckEntry() {
  const entry = currentDeckEntry();
  if (!entry) return;
  state.editingDeck.entries = state.editingDeck.entries.filter(item => item !== entry);
  state.editingDeckEntry = null;
  els.deckEntryDialog.close();
  autoSaveEditingDeck();
  renderDeckEditor();
  showToast("デッキから削除しました");
}

function deckEntrySortValue(entry, mode) {
  const card = cardForDeckEntry(entry) || {};
  if (mode === "name") return nameOf(card).toLowerCase();
  if (mode === "mana") return Number(card.manaValue ?? card.cmc ?? 0);
  if (mode === "color") {
    const type = String(card.typeLine || card.type_line || "");
    if (type.includes("Land")) return "0";
    const identity = card.colorIdentity || card.color_identity || card.colors || [];
    const order = { W: "1", U: "2", B: "3", R: "4", G: "5" };
    return identity.length ? identity.map(color => order[color] || "9").sort().join("") : "0";
  }
  if (mode === "type") {
    const type = String(card.typeLine || card.type_line || "");
    const groups = ["Creature", "Instant", "Sorcery", "Artifact", "Enchantment", "Planeswalker", "Battle", "Land"];
    const index = groups.findIndex(group => type.includes(group));
    return index >= 0 ? index : 99;
  }
  return "";
}

function compareDeckEntries(mode) {
  return (a, b) => {
    const av = deckEntrySortValue(a, mode);
    const bv = deckEntrySortValue(b, mode);
    const primary = typeof av === "number" || typeof bv === "number" ? Number(av) - Number(bv) : String(av).localeCompare(String(bv), "ja");
    if (primary) return primary;
    return nameOf(cardForDeckEntry(a) || {}).localeCompare(nameOf(cardForDeckEntry(b) || {}), "ja");
  };
}

function sortDeckEntries(mode) {
  const sections = deckDisplaySections();
  const sorted = [];
  sections.forEach(section => sorted.push(...state.editingDeck.entries.filter(entry => entry.section === section).sort(compareDeckEntries(mode))));
  state.editingDeck.entries.filter(entry => !sections.includes(entry.section)).forEach(entry => sorted.push(entry));
  state.editingDeck.entries = sorted;
  autoSaveEditingDeck();
  renderDeckEditor();
  showToast(`${{ name: "名前順", color: "色順", mana: "マナ総量順", type: "カードタイプ順" }[mode]}に並び替えました`);
}

function moveCurrentDeckEntry(direction) {
  const entry = currentDeckEntry();
  if (!entry) return;
  const sectionEntries = state.editingDeck.entries.filter(item => item.section === entry.section);
  const sectionIndex = sectionEntries.findIndex(item => item === entry);
  const targetSectionEntry = sectionEntries[sectionIndex + direction];
  if (!targetSectionEntry) return;
  const currentIndex = state.editingDeck.entries.indexOf(entry);
  const targetIndex = state.editingDeck.entries.indexOf(targetSectionEntry);
  [state.editingDeck.entries[currentIndex], state.editingDeck.entries[targetIndex]] = [state.editingDeck.entries[targetIndex], state.editingDeck.entries[currentIndex]];
  autoSaveEditingDeck();
  renderDeckEditor(); renderDeckEntryEditor();
}

function addDeckEntry(cardId, card, targetSection = els.deckSection.value) {
  const section = !isCommanderDeck() && targetSection === "commander" ? "main" : targetSection;
  const entry = state.editingDeck.entries.find(item => item.cardId === cardId && item.section === section);
  if (entry) entry.quantity += 1; else state.editingDeck.entries.push({ cardId, card, section, quantity: 1 });
  autoSaveEditingDeck();
  renderDeckEditor();
}

function addOwnedToDeck(cardId, section = els.deckSection.value) {
  const card = state.collection.find(item => item.id === cardId);
  if (card) {
    addDeckEntry(cardId, deckCardSnapshot(card), section);
    showInlineStatus(els.deckOwnedAddStatus, `${nameOf(card)}を${sectionLabel(section)}に追加しました`);
    showToast("デッキに追加しました");
  }
}

function openDeckSearchCard(index) {
  const card = state.deckSearchResults[index];
  if (card) openCardDialog(card, "deck");
}

function addSelectedCardToDeck() {
  const card = state.selectedCard;
  if (!card || !state.editingDeck) return;
  const section = els.deckSection.value;
  addDeckEntry(`scryfall-${card.id}`, deckCardSnapshot(card), section);
  showInlineStatus(els.cardActionStatus, `${nameOf(card)}を${sectionLabel(section)}に追加しました`);
  showToast("選択したイラストをデッキに追加しました");
}

async function searchDeckCards() {
  const query = els.deckGlobalSearch.value.trim();
  const filters = buildScryfallFilters(els.deckSearchColor.value, els.deckSearchMana.value, els.deckSearchType.value, els.deckSearchSet.value);
  const exactMatch = Boolean(query) && els.deckSearchMatch.value === "exact";
  if ((!query && !filters) || !navigator.onLine) {
    els.deckGlobalSearchStatus.textContent = navigator.onLine ? "カード名または検索条件を指定してください" : "オフラインのため検索できません";
    return;
  }
  els.deckGlobalSearchButton.disabled = true;
  els.deckGlobalSearchStatus.textContent = "検索中…";
  state.deckSearchResults = [];
  renderDeckEditor();
  try {
    let cards = (await fetchSearchCandidates(query, filters, isJapanese(query) ? "ja" : "en", exactMatch, 40)).cards;
    const needle = normalizeCardName(query);
    const aliasNeedles = aliasTargetsForQuery(query, { exactOnly: exactMatch }).map(normalizeCardName);
    cards.sort((a, b) => {
      const aExact = cardSearchNames(a).some(name => {
        const normalized = normalizeCardName(name);
        return normalized === needle || aliasNeedles.includes(normalized);
      }) ? 1 : 0;
      const bExact = cardSearchNames(b).some(name => {
        const normalized = normalizeCardName(name);
        return normalized === needle || aliasNeedles.includes(normalized);
      }) ? 1 : 0;
      return bExact - aExact;
    });
    cards = applyJpIndexToCards(cards);
    const groups = new Map();
    cards.forEach(card => { const key = card.oracle_id || card.name; if (!groups.has(key)) groups.set(key, card); });
    state.deckSearchResults = [...groups.values()].slice(0, 30);
    els.deckGlobalSearchStatus.textContent = state.deckSearchResults.length ? `${state.deckSearchResults.length}種類を表示` : "カードが見つかりませんでした";
    renderDeckEditor();
  } catch {
    els.deckGlobalSearchStatus.textContent = "検索に失敗しました。通信状態を確認してください";
  } finally {
    els.deckGlobalSearchButton.disabled = false;
  }
}

function changeDeckEntry(cardId, section, delta) {
  const entry = state.editingDeck.entries.find(item => item.cardId === cardId && item.section === section);
  entry.quantity += delta;
  if (entry.quantity <= 0) state.editingDeck.entries = state.editingDeck.entries.filter(item => item !== entry);
  autoSaveEditingDeck();
  renderDeckEditor();
}

function missingCount(deck) {
  const seen = new Set();
  return deck.entries.reduce((sum, entry) => {
    const card = cardForDeckEntry(entry);
    const key = card?.scryfallId || entry.cardId;
    if (seen.has(key)) return sum;
    seen.add(key);
    return sum + missingQuantityForEntry(entry, deck);
  }, 0);
}

function saveDeck() {
  const deck = state.editingDeck;
  deck.name = els.deckName.value.trim() || "名称未設定のデッキ";
  deck.format = els.deckFormat.value;
  deck.memo = els.deckMemo.value.trim();
  normalizeDeckSectionsForFormat();
  deck.updatedAt = Date.now();
  const index = state.decks.findIndex(item => item.id === deck.id);
  if (index >= 0) state.decks[index] = deck; else state.decks.unshift(deck);
  persist(); els.deckDialog.close(); renderDecks(); showToast("デッキを保存しました");
}

function duplicateDeck() {
  if (!state.editingDeck) return;
  const sourceName = els.deckName.value.trim() || state.editingDeck.name || "\u540d\u79f0\u672a\u8a2d\u5b9a\u306e\u30c7\u30c3\u30ad";
  if (!confirm(`\u300c${sourceName}\u300d\u3092\u30b3\u30d4\u30fc\u3057\u307e\u3059\u304b\uff1f`)) return;
  const now = Date.now();
  state.editingDeck.name = els.deckName.value.trim() || state.editingDeck.name || "名称未設定のデッキ";
  state.editingDeck.format = els.deckFormat.value;
  state.editingDeck.name = sourceName;
  state.editingDeck.memo = els.deckMemo.value.trim();
  normalizeDeckSectionsForFormat();
  const source = structuredClone(state.editingDeck);
  const copy = structuredClone(source);
  copy.id = uid();
  copy.name = `${source.name} コピー`;
  copy.createdAt = now;
  copy.updatedAt = now;
  state.decks.unshift(copy);
  state.editingDeck = structuredClone(copy);
  persist();
  els.deleteDeckButton.hidden = false;
  fillDeckDialog();
  renderDecks();
  setTimeout(() => showToast("\u30c7\u30c3\u30ad\u3092\u30b3\u30d4\u30fc\u3057\u307e\u3057\u305f"), 0);
  showToast("デッキをコピーしました");
}

function deleteDeck() {
  if (!confirm(`「${state.editingDeck.name}」を削除しますか？`)) return;
  state.decks = state.decks.filter(deck => deck.id !== state.editingDeck.id);
  persist(); els.deckDialog.close(); renderDecks(); showToast("デッキを削除しました");
}

function backupPayload() {
  return {
    version: 2,
    appVersion: APP_VERSION,
    exportedAt: new Date().toISOString(),
    counts: {
      collectionLots: state.collection.length,
      totalCards: state.collection.reduce((sum, card) => sum + Number(card.quantity || 0), 0),
      decks: state.decks.length,
    },
    collection: state.collection,
    decks: state.decks,
    fx: state.fx,
  };
}

function saveBackupMeta() {
  state.backupMeta = { lastExportedAt: Date.now() };
  localStorage.setItem(KEYS.backupMeta, JSON.stringify(state.backupMeta));
  renderBackupSummary();
}

function exportBackup() {
  const payload = backupPayload();
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob); link.download = `mtg-pocket-${backupFileStamp()}.json`; link.click();
  setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  saveBackupMeta();
  showToast("バックアップを保存しました");
}

async function importBackup(file) {
  try {
    const data = JSON.parse(await file.text());
    if (!Array.isArray(data.collection) || !Array.isArray(data.decks)) throw new Error();
    const incomingTotal = data.collection.reduce((sum, card) => sum + Number(card.quantity || 0), 0);
    const currentTotal = state.collection.reduce((sum, card) => sum + Number(card.quantity || 0), 0);
    const exportedAt = data.exportedAt ? new Date(data.exportedAt).toLocaleString("ja-JP") : "不明";
    const message = [
      "バックアップを復元すると、現在この端末にあるデータは置き換わります。",
      "",
      `復元するデータ：所持${incomingTotal}枚 / ${data.collection.length}種類、デッキ${data.decks.length}件`,
      `バックアップ作成日時：${exportedAt}`,
      "",
      `現在のデータ：所持${currentTotal}枚 / ${state.collection.length}種類、デッキ${state.decks.length}件`,
      "",
      "復元してよろしいですか？",
    ].join("\n");
    if (!confirm(message)) { els.importInput.value = ""; return; }
    state.collection = data.collection;
    state.decks = data.decks;
    if (data.fx && typeof data.fx === "object") state.fx = data.fx;
    persist(); renderCollection(); renderDecks(); renderBackupSummary(); showToast("バックアップを復元しました");
  } catch { showToast("正しいバックアップファイルではありません"); }
  els.importInput.value = "";
}

document.querySelectorAll(".bottom-nav button").forEach(button => button.addEventListener("click", () => showView(button.dataset.view)));
initAdvancedSearchUi();
els.deckSearchSetIncludeExtras?.closest("label")?.remove();
els.searchButton.addEventListener("click", searchCards);
els.cardSearch.addEventListener("keydown", event => { if (event.key === "Enter") searchCards(); });
els.searchSet.addEventListener("keydown", event => { if (event.key === "Enter") searchCards(); });
els.ocrCameraInput?.addEventListener("change", async event => {
  await readCardNameFromImage(event.target.files?.[0]);
  event.target.value = "";
});
els.ocrFileInput?.addEventListener("change", async event => {
  await readCardNameFromImage(event.target.files?.[0]);
  event.target.value = "";
});
els.searchSetIncludeExtras?.addEventListener("change", renderSetSelects);
els.clearSearchFilters.addEventListener("click", () => {
  els.searchMatch.value = "partial"; els.searchColor.value = ""; els.searchMana.value = ""; els.searchType.value = ""; els.searchSet.value = ""; if (els.searchSetIncludeExtras) els.searchSetIncludeExtras.checked = false; renderSetSelects();
  const resetIds = ["searchLanguage", "searchOracleText", "searchFormat", "searchSubtype", "searchRarity"];
  resetIds.forEach(id => { const field = $(`#${id}`); if (field) field.value = ""; });
  const colorMode = $("#searchColorMode"); if (colorMode) colorMode.value = "and";
  document.querySelectorAll("[data-search-color]").forEach(input => { input.checked = false; });
  updateAdvancedSearchSummary();
});
els.collectionFilter.addEventListener("input", renderCollection);
els.collectionViewMode.value = state.collectionViewMode;
els.collectionViewMode.addEventListener("change", () => {
  state.collectionViewMode = els.collectionViewMode.value;
  localStorage.setItem(KEYS.collectionViewMode, state.collectionViewMode);
  renderCollection();
});
[els.collectionColor, els.collectionMana, els.collectionType, els.collectionPriceFilter].forEach(filter => filter.addEventListener("change", renderCollection));
els.collectionFavoritesOnly.addEventListener("change", renderCollection);
els.clearCollectionFilters.addEventListener("click", () => {
  els.collectionFilter.value = ""; els.collectionColor.value = ""; els.collectionMana.value = ""; els.collectionType.value = ""; els.collectionPriceFilter.value = ""; els.collectionFavoritesOnly.checked = false; renderCollection();
});
els.sortCollectionByName.addEventListener("click", () => applyCollectionSort("name"));
els.sortCollectionByColor.addEventListener("click", () => applyCollectionSort("color"));
els.sortCollectionByMana.addEventListener("click", () => applyCollectionSort("mana"));
els.sortCollectionByType.addEventListener("click", () => applyCollectionSort("type"));
els.sortCollectionByValue.addEventListener("click", () => applyCollectionSort("value"));
els.sortCollectionByUnitPrice.addEventListener("click", () => applyCollectionSort("unitPrice"));
els.resetCollectionSort.addEventListener("click", resetCollectionSortOrder);
els.addCardButton.addEventListener("click", saveSelectedCardQuantity);
els.addCardToDeckButton.addEventListener("click", addSelectedCardToDeck);
els.favoriteCardButton.addEventListener("click", toggleSelectedFavorite);
els.deleteCardButton.addEventListener("click", deleteSelectedOwned);
els.decrementQuantity.addEventListener("click", () => { els.cardQuantity.value = Math.max(0, Number(els.cardQuantity.value || 0) - 1); });
els.incrementQuantity.addEventListener("click", () => { els.cardQuantity.value = Math.max(0, Number(els.cardQuantity.value || 0) + 1); });
els.variantFilter.addEventListener("change", renderVariantGallery);
$("#newDeckButton").addEventListener("click", newDeck);
els.deckImportInput?.addEventListener("change", async event => {
  const file = event.target.files?.[0];
  try {
    await importDeckFromTextFile(file);
  } catch (error) {
    console.error(error);
    showToast("デッキのインポートに失敗しました");
  } finally {
    event.target.value = "";
  }
});
els.deckFormatFilter.addEventListener("change", () => {
  state.deckFormatFilter = els.deckFormatFilter.value;
  localStorage.setItem(KEYS.deckFormatFilter, state.deckFormatFilter);
  renderDecks();
});
els.openDeckOwnedAdd.addEventListener("click", openDeckOwnedAddDialog);
els.openDeckSearchAdd.addEventListener("click", openDeckSearchAddDialog);
els.deckSearchAddDialog.addEventListener("close", resetDeckSearchAddForm);
els.openDeckVisual.addEventListener("click", openDeckVisualView);
els.deckName.addEventListener("input", autoSaveEditingDeck);
els.deckMemo.addEventListener("input", autoSaveEditingDeck);
els.deckFormat.addEventListener("change", () => { renderDeckEditor(); autoSaveEditingDeck(); });
els.deckCardFilter.addEventListener("input", renderDeckEditor);
els.deckSection.addEventListener("change", renderDeckEditor);
document.querySelectorAll("[data-deck-section-target]").forEach(button => button.addEventListener("click", () => {
  els.deckSection.value = button.dataset.deckSectionTarget;
  renderDeckEditor();
}));
[els.deckOwnedColor, els.deckOwnedMana, els.deckOwnedType].forEach(filter => filter.addEventListener("change", renderDeckEditor));
els.deckOwnedFavoritesOnly.addEventListener("change", renderDeckEditor);
els.clearDeckOwnedFilters.addEventListener("click", () => {
  els.deckCardFilter.value = ""; els.deckOwnedColor.value = ""; els.deckOwnedMana.value = ""; els.deckOwnedType.value = ""; els.deckOwnedFavoritesOnly.checked = false; renderDeckEditor();
});
els.deckGlobalSearchButton.addEventListener("click", searchDeckCards);
els.deckGlobalSearch.addEventListener("keydown", event => { if (event.key === "Enter") { event.preventDefault(); searchDeckCards(); } });
els.deckSearchSet.addEventListener("keydown", event => { if (event.key === "Enter") { event.preventDefault(); searchDeckCards(); } });
els.deckSearchSetIncludeExtras?.addEventListener("change", renderSetSelects);
els.clearDeckSearchFilters.addEventListener("click", resetDeckSearchAddForm);
els.decrementDeckEntry.addEventListener("click", () => setDeckEntryQuantity(Number(els.deckEntryQuantity.value || 1) - 1));
els.incrementDeckEntry.addEventListener("click", () => setDeckEntryQuantity(Number(els.deckEntryQuantity.value || 1) + 1));
els.decrementMainDeckEntry.addEventListener("click", () => adjustDeckEntrySectionQuantity("main", -1));
els.incrementMainDeckEntry.addEventListener("click", () => adjustDeckEntrySectionQuantity("main", 1));
els.mainDeckEntryQuantity.addEventListener("change", () => setDeckEntrySectionQuantity("main", els.mainDeckEntryQuantity.value));
els.decrementSideDeckEntry.addEventListener("click", () => adjustDeckEntrySectionQuantity("side", -1));
els.incrementSideDeckEntry.addEventListener("click", () => adjustDeckEntrySectionQuantity("side", 1));
els.sideDeckEntryQuantity.addEventListener("change", () => setDeckEntrySectionQuantity("side", els.sideDeckEntryQuantity.value));
els.decrementMaybeDeckEntry.addEventListener("click", () => adjustDeckEntrySectionQuantity("maybe", -1));
els.incrementMaybeDeckEntry.addEventListener("click", () => adjustDeckEntrySectionQuantity("maybe", 1));
els.maybeDeckEntryQuantity.addEventListener("change", () => setDeckEntrySectionQuantity("maybe", els.maybeDeckEntryQuantity.value));
els.decrementCommanderDeckEntry.addEventListener("click", () => adjustDeckEntrySectionQuantity("commander", -1));
els.incrementCommanderDeckEntry.addEventListener("click", () => adjustDeckEntrySectionQuantity("commander", 1));
els.commanderDeckEntryQuantity.addEventListener("change", () => setDeckEntrySectionQuantity("commander", els.commanderDeckEntryQuantity.value));
els.moveDeckEntryUp.addEventListener("click", () => moveCurrentDeckEntry(-1));
els.moveDeckEntryDown.addEventListener("click", () => moveCurrentDeckEntry(1));
els.deckEntryQuantity.addEventListener("change", () => setDeckEntryQuantity(els.deckEntryQuantity.value));
els.deckEntrySection.addEventListener("change", () => moveDeckEntrySection(els.deckEntrySection.value));
els.openDeckEntryVariants?.addEventListener("click", openDeckEntryVariantDialog);
els.deckEntryVariantFilter?.addEventListener("change", renderDeckEntryVariantGallery);
els.removeDeckEntry.addEventListener("click", removeCurrentDeckEntry);
els.sortDeckByName.addEventListener("click", () => sortDeckEntries("name"));
els.sortDeckByColor.addEventListener("click", () => sortDeckEntries("color"));
els.sortDeckByMana.addEventListener("click", () => sortDeckEntries("mana"));
els.sortDeckByType.addEventListener("click", () => sortDeckEntries("type"));
$("#saveDeckButton").addEventListener("click", saveDeck);
els.duplicateDeckButton.addEventListener("click", duplicateDeck);
els.deleteDeckButton.addEventListener("click", deleteDeck);
$("#exportButton").addEventListener("click", exportBackup);
els.saveFxButton.addEventListener("click", saveExchangeRate);
els.importInput.addEventListener("change", () => els.importInput.files[0] && importBackup(els.importInput.files[0]));
$("#clearButton").addEventListener("click", () => { if (!confirm("所持カードとデッキをすべて削除しますか？")) return; state.collection = []; state.decks = []; persist(); renderCollection(); renderDecks(); renderBackupSummary(); showToast("すべて削除しました"); });

window.addEventListener("beforeinstallprompt", event => { event.preventDefault(); state.installPrompt = event; els.installButton.hidden = false; });
els.installButton.addEventListener("click", async () => { if (!state.installPrompt) return; state.installPrompt.prompt(); await state.installPrompt.userChoice; state.installPrompt = null; els.installButton.hidden = true; });
window.addEventListener("appinstalled", () => { els.installButton.hidden = true; showToast("アプリをインストールしました"); });
window.addEventListener("online", () => { els.searchStatus.textContent = "オンライン：カードを検索できます"; refreshExchangeRate(); hydrateCollectionMetadata(); hydrateSetOptions(); });
window.addEventListener("offline", () => { els.searchStatus.textContent = "オフライン：保存済みデータは利用できます"; });

if ("serviceWorker" in navigator) window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js"));
renderSetSelects(); renderCollection(); renderDecks(); renderBackupSummary(); refreshExchangeRate(); hydrateCollectionMetadata(); hydrateSetOptions();
