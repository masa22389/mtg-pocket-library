const APP_VERSION = "v191";
const KEYS = { collection: "mtg-pocket.collection.v1", decks: "mtg-pocket.decks.v1", fx: "mtg-pocket.fx.v1", favoriteGroups: "mtg-pocket.favoriteGroups.v1", collectionViewMode: "mtg-pocket.collectionViewMode.v2", collectionPriceDisplayMode: "mtg-pocket.collectionPriceDisplayMode.v1", collectionSortStack: "mtg-pocket.collectionSortStack.v1", deckFormatFilter: "mtg-pocket.deckFormatFilter.v1", backgroundTheme: "mtg-pocket.backgroundTheme.v1", sets: "mtg-pocket.sets.v1", backupMeta: "mtg-pocket.backupMeta.v1", cardTrader: "mtg-pocket.cardTrader.v1" };
const DAY_MS = 24 * 60 * 60 * 1000;
const BACKGROUND_THEMES = {
  default: { label: "標準", bg: "#f2f4f1", pageBg: "linear-gradient(150deg,#f8f9f5 0,#eef3ef 48%,#f4f1e8 100%)", paper: "#fffdf8", surface: "#f0f3ee", surfaceStrong: "#eef3ef", surfacePanel: "#ffffff99", surfaceSoft: "#f8faf8", surfaceAccent: "#e7eee9", navBg: "#fffdf8ee", visualBg: "linear-gradient(135deg,#f7f1e4,#e6eef2)" },
  red: { label: "赤", bg: "#f5e9e7", pageBg: "linear-gradient(150deg,#fff8f7 0,#f3d5d2 50%,#f7ece8 100%)", paper: "#fff9f8", surface: "#f8e7e4", surfaceStrong: "#f4dedb", surfacePanel: "#fff7f5cc", surfaceSoft: "#fff6f5", surfaceAccent: "#efd1cd", navBg: "#fff8f7ee", visualBg: "linear-gradient(135deg,#fff5f3,#f0cfca)" },
  orange: { label: "橙", bg: "#f5ece2", pageBg: "linear-gradient(150deg,#fff8f1 0,#f0d7bd 52%,#f8eee4 100%)", paper: "#fffaf4", surface: "#f7eadc", surfaceStrong: "#f2dec7", surfacePanel: "#fff8f0cc", surfaceSoft: "#fff7ef", surfaceAccent: "#edcfad", navBg: "#fff8f1ee", visualBg: "linear-gradient(135deg,#fff3e5,#edcda8)" },
  yellow: { label: "黄", bg: "#f4f0dc", pageBg: "linear-gradient(150deg,#fffdf2 0,#eee4b7 50%,#f7f2dd 100%)", paper: "#fffdf4", surface: "#f5efd5", surfaceStrong: "#eee5be", surfacePanel: "#fffbedcc", surfaceSoft: "#fffbea", surfaceAccent: "#e9dda9", navBg: "#fffdf2ee", visualBg: "linear-gradient(135deg,#fff9dc,#e8dca5)" },
  green: { label: "緑", bg: "#edf5ed", pageBg: "linear-gradient(150deg,#f8fff7 0,#d7eadb 50%,#eef7ed 100%)", paper: "#fbfff9", surface: "#e6f3e8", surfaceStrong: "#dceee0", surfacePanel: "#f7fff7cc", surfaceSoft: "#f6fff6", surfaceAccent: "#cfe5d4", navBg: "#f8fff7ee", visualBg: "linear-gradient(135deg,#f4fff0,#cfebd5)" },
  blue: { label: "青", bg: "#edf3f8", pageBg: "linear-gradient(150deg,#f7fbff 0,#d7e6f3 50%,#edf4fa 100%)", paper: "#f8fcff", surface: "#e4f0f8", surfaceStrong: "#d9e9f5", surfacePanel: "#f5fbffcc", surfaceSoft: "#f4fbff", surfaceAccent: "#cfe0ef", navBg: "#f7fbffee", visualBg: "linear-gradient(135deg,#f2f9ff,#cfe2f2)" },
  indigo: { label: "藍", bg: "#eceef7", pageBg: "linear-gradient(150deg,#f7f8ff 0,#d9ddf0 50%,#eef0fb 100%)", paper: "#fafaff", surface: "#e7eafb", surfaceStrong: "#dde1f4", surfacePanel: "#f7f8ffcc", surfaceSoft: "#f5f6ff", surfaceAccent: "#d1d6ee", navBg: "#f7f8ffee", visualBg: "linear-gradient(135deg,#f4f5ff,#d2d8f1)" },
  violet: { label: "紫", bg: "#f2eaf5", pageBg: "linear-gradient(150deg,#fdf7ff 0,#ead8f0 50%,#f5ecf7 100%)", paper: "#fff9ff", surface: "#f4e6f8", surfaceStrong: "#eadcf1", surfacePanel: "#fdf6ffcc", surfaceSoft: "#fcf5ff", surfaceAccent: "#e2cfe9", navBg: "#fdf7ffee", visualBg: "linear-gradient(135deg,#fcf2ff,#e3cfeb)" },
};
const BACKGROUND_THEME_CHROME = {
  default: { green: "#173f35", green2: "#256453", gold: "#c59746" },
  red: { green: "#7f2f2b", green2: "#a3463f", gold: "#c77f55" },
  orange: { green: "#855116", green2: "#a5641d", gold: "#d08a2d" },
  yellow: { green: "#6a5a12", green2: "#837022", gold: "#b89320" },
  green: { green: "#1e5937", green2: "#2d7048", gold: "#9a8f3a" },
  blue: { green: "#1f4d78", green2: "#2d689b", gold: "#b78a3e" },
  indigo: { green: "#343f82", green2: "#4a55a0", gold: "#b98a45" },
  violet: { green: "#68327c", green2: "#82449a", gold: "#b77a56" },
};
const state = {
  collection: read(KEYS.collection, []),
  decks: read(KEYS.decks, []),
  fx: read(KEYS.fx, { usdJpy: 0, updatedAt: 0, source: "" }),
  cardTrader: read(KEYS.cardTrader, { token: "", expansionMap: null, expansionMapUpdatedAt: 0, blueprintsBySet: {}, blueprintsUpdatedAt: {}, priceUpdatedAt: 0, lastError: "" }),
  favoriteGroups: read(KEYS.favoriteGroups, []),
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
  collectionPriceDisplayMode: localStorage.getItem(KEYS.collectionPriceDisplayMode) || "total",
  collectionSortStack: read(KEYS.collectionSortStack, []),
  deckFormatFilter: localStorage.getItem(KEYS.deckFormatFilter) || "",
  backgroundTheme: localStorage.getItem(KEYS.backgroundTheme) || "default",
  editingDeck: null,
  editingDeckEntry: null,
  deckMissingOpen: false,
  deckStatsOpen: false,
  deckSearchResults: [],
  deckEntryVariants: [],
  installPrompt: null,
};
let deckDragState = null;
let suppressNextDeckCardClick = false;
let deckReorderMode = false;
let deckReorderSelection = null;
let deckListPressState = null;
let suppressNextDeckTileClick = false;
let deckListReorderMode = false;
let deckListReorderSelection = null;
let collectionPressState = null;
let suppressNextCollectionCardClick = false;
let collectionReorderMode = false;
let collectionReorderSelection = null;
let favoriteGroupRenameOpen = false;
let favoriteGroupManagerQuery = "";
let favoriteGroupManagerMode = "view";

const $ = selector => document.querySelector(selector);
const els = {
  totalCards: $("#totalCards"), uniqueCards: $("#uniqueCards"), collectionValue: $("#collectionValue"), priceStatus: $("#priceStatus"), cardSearch: $("#cardSearch"),
  searchButton: $("#searchButton"), clearSearchResults: $("#clearSearchResults"), searchStatus: $("#searchStatus"), searchResults: $("#searchResults"),
  ocrCameraInput: $("#ocrCameraInput"), ocrFileInput: $("#ocrFileInput"), ocrStatus: $("#ocrStatus"),
  searchMatch: $("#searchMatch"), searchColor: $("#searchColor"), searchMana: $("#searchMana"), searchType: $("#searchType"), searchSet: $("#searchSet"), searchSetIncludeExtras: $("#searchSetIncludeExtras"), clearSearchFilters: $("#clearSearchFilters"),
  collectionFilter: $("#collectionFilter"), collectionViewMode: $("#collectionViewMode"), collectionPriceDisplayMode: $("#collectionPriceDisplayMode"), openCollectionAdvanced: $("#openCollectionAdvanced"),
  collectionFilterDialog: $("#collectionFilterDialog"), closeCollectionAdvanced: $("#closeCollectionAdvanced"), collectionFilterSummary: $("#collectionFilterSummary"), collectionColor: $("#collectionColor"),
  collectionMana: $("#collectionMana"), collectionType: $("#collectionType"), collectionPriceFilter: $("#collectionPriceFilter"),
  collectionFavoritesOnly: $("#collectionFavoritesOnly"), collectionFavoriteGroup: $("#collectionFavoriteGroup"),
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
  favoriteGroupPanel: $("#favoriteGroupPanel"), favoriteGroupSummary: $("#favoriteGroupSummary"), newFavoriteGroupName: $("#newFavoriteGroupName"),
  createFavoriteGroupButton: $("#createFavoriteGroupButton"), manageFavoriteGroupsButton: $("#manageFavoriteGroupsButton"), favoriteGroupList: $("#favoriteGroupList"),
  favoriteGroupManagerDialog: $("#favoriteGroupManagerDialog"), closeFavoriteGroupManager: $("#closeFavoriteGroupManager"),
  manageFavoriteGroupSelect: $("#manageFavoriteGroupSelect"), toggleFavoriteGroupRename: $("#toggleFavoriteGroupRename"), toggleFavoriteGroupAdd: $("#toggleFavoriteGroupAdd"),
  manageFavoriteGroupName: $("#manageFavoriteGroupName"), saveFavoriteGroupName: $("#saveFavoriteGroupName"), manageFavoriteGroupSearch: $("#manageFavoriteGroupSearch"),
  deleteManagedFavoriteGroup: $("#deleteManagedFavoriteGroup"), manageFavoriteGroupStatus: $("#manageFavoriteGroupStatus"), manageFavoriteGroupCards: $("#manageFavoriteGroupCards"),
  deckName: $("#deckName"), deckFormat: $("#deckFormat"), deckCount: $("#deckCount"),
  deckMissing: $("#deckMissing"), deckStats: $("#deckStats"), deckMissingList: $("#deckMissingList"), deckDates: $("#deckDates"), deckMemo: $("#deckMemo"), deckCardFilter: $("#deckCardFilter"), deckSection: $("#deckSection"),
  openDeckOwnedAdd: $("#openDeckOwnedAdd"), openDeckSearchAdd: $("#openDeckSearchAdd"),
  deckOwnedAddDialog: $("#deckOwnedAddDialog"), deckSearchAddDialog: $("#deckSearchAddDialog"),
  openDeckOwnedAdvanced: $("#openDeckOwnedAdvanced"), deckOwnedAdvancedPanel: $("#deckOwnedAdvancedPanel"), deckOwnedFilterSummary: $("#deckOwnedFilterSummary"),
  deckOwnedColor: $("#deckOwnedColor"), deckOwnedMana: $("#deckOwnedMana"), deckOwnedType: $("#deckOwnedType"),
  deckOwnedFavoritesOnly: $("#deckOwnedFavoritesOnly"), deckOwnedFavoriteGroup: $("#deckOwnedFavoriteGroup"),
  clearDeckOwnedFilters: $("#clearDeckOwnedFilters"),
  deckOwnedAddStatus: $("#deckOwnedAddStatus"), deckCandidates: $("#deckCandidates"), deckGlobalSearch: $("#deckGlobalSearch"),
  deckGlobalSearchButton: $("#deckGlobalSearchButton"), deckGlobalSearchStatus: $("#deckGlobalSearchStatus"),
  deckSearchMatch: $("#deckSearchMatch"), deckSearchColor: $("#deckSearchColor"), deckSearchMana: $("#deckSearchMana"), deckSearchType: $("#deckSearchType"), deckSearchSet: $("#deckSearchSet"), deckSearchSetIncludeExtras: $("#deckSearchSetIncludeExtras"), clearDeckSearchFilters: $("#clearDeckSearchFilters"),
  deckGlobalSearchResults: $("#deckGlobalSearchResults"), deckCards: $("#deckCards"), duplicateDeckButton: $("#duplicateDeckButton"), deleteDeckButton: $("#deleteDeckButton"),
  openDeckVisual: $("#openDeckVisual"), openDeckOneScreenVisual: $("#openDeckOneScreenVisual"), deckVisualDialog: $("#deckVisualDialog"), deckVisualTitle: $("#deckVisualTitle"),
  deckVisualSummary: $("#deckVisualSummary"), deckVisualBoard: $("#deckVisualBoard"),
  deckOneScreenVisualDialog: $("#deckOneScreenVisualDialog"), deckOneScreenTitle: $("#deckOneScreenTitle"), deckOneScreenSummary: $("#deckOneScreenSummary"), deckOneScreenBoard: $("#deckOneScreenBoard"),
  deckEntryDialog: $("#deckEntryDialog"), deckEntryVariantDialog: $("#deckEntryVariantDialog"), deckEntryImage: $("#deckEntryImage"), openDeckEntryVariants: $("#openDeckEntryVariants"), deckEntrySet: $("#deckEntrySet"),
  deckEntryName: $("#deckEntryName"), deckEntryOwned: $("#deckEntryOwned"), addDeckEntryToCollection: $("#addDeckEntryToCollection"), deckEntryCollectionStatus: $("#deckEntryCollectionStatus"), deckEntrySection: $("#deckEntrySection"),
  deckEntryVariants: $("#deckEntryVariants"), deckEntryVariantFilter: $("#deckEntryVariantFilter"), deckEntryVariantCount: $("#deckEntryVariantCount"),
  deckEntryQuantity: $("#deckEntryQuantity"), decrementDeckEntry: $("#decrementDeckEntry"),
  incrementDeckEntry: $("#incrementDeckEntry"), moveDeckEntryUp: $("#moveDeckEntryUp"), moveDeckEntryDown: $("#moveDeckEntryDown"), removeDeckEntry: $("#removeDeckEntry"),
  mainDeckEntryQuantity: $("#mainDeckEntryQuantity"), sideDeckEntryQuantity: $("#sideDeckEntryQuantity"), commanderDeckEntryQuantity: $("#commanderDeckEntryQuantity"), maybeDeckEntryQuantity: $("#maybeDeckEntryQuantity"),
  decrementMainDeckEntry: $("#decrementMainDeckEntry"), incrementMainDeckEntry: $("#incrementMainDeckEntry"),
  decrementSideDeckEntry: $("#decrementSideDeckEntry"), incrementSideDeckEntry: $("#incrementSideDeckEntry"),
  decrementMaybeDeckEntry: $("#decrementMaybeDeckEntry"), incrementMaybeDeckEntry: $("#incrementMaybeDeckEntry"),
  decrementCommanderDeckEntry: $("#decrementCommanderDeckEntry"), incrementCommanderDeckEntry: $("#incrementCommanderDeckEntry"),
  reorderDeckCards: $("#reorderDeckCards"), sortDeckByName: $("#sortDeckByName"), sortDeckByColor: $("#sortDeckByColor"), sortDeckByMana: $("#sortDeckByMana"), sortDeckByType: $("#sortDeckByType"),
  usdJpyRate: $("#usdJpyRate"), saveFxButton: $("#saveFxButton"), fxHelp: $("#fxHelp"),
  cardTraderToken: $("#cardTraderToken"), saveCardTraderToken: $("#saveCardTraderToken"), clearCardTraderToken: $("#clearCardTraderToken"), cardTraderHelp: $("#cardTraderHelp"),
  installButton: $("#installButton"), backupSummary: $("#backupSummary"), importInput: $("#importInput"), toast: $("#toast"),
  currentAppVersion: $("#currentAppVersion"), backgroundColorChoices: $("#backgroundColorChoices"), backgroundColorStatus: $("#backgroundColorStatus"),
};

if (els.currentAppVersion) els.currentAppVersion.textContent = APP_VERSION;

function applyBackgroundTheme(themeKey = state.backgroundTheme, options = {}) {
  const key = BACKGROUND_THEMES[themeKey] ? themeKey : "default";
  const theme = BACKGROUND_THEMES[key];
  const chrome = BACKGROUND_THEME_CHROME[key] || BACKGROUND_THEME_CHROME.default;
  state.backgroundTheme = key;
  ["bg", "pageBg", "paper", "surface", "surfaceStrong", "surfacePanel", "surfaceSoft", "surfaceAccent", "navBg", "visualBg"].forEach(name => {
    document.documentElement.style.setProperty(`--${name.replace(/[A-Z]/g, match => `-${match.toLowerCase()}`)}`, theme[name]);
  });
  ["green", "green2", "gold"].forEach(name => {
    document.documentElement.style.setProperty(`--${name}`, chrome[name]);
  });
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", chrome.green);
  if (options.persist) localStorage.setItem(KEYS.backgroundTheme, key);
  els.backgroundColorChoices?.querySelectorAll("[data-background-theme]").forEach(button => {
    const active = button.dataset.backgroundTheme === key;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", active ? "true" : "false");
  });
  if (els.backgroundColorStatus) els.backgroundColorStatus.textContent = `現在の背景色：${theme.label}`;
}

applyBackgroundTheme();

function read(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
}

function persist() {
  localStorage.setItem(KEYS.collection, JSON.stringify(state.collection));
  localStorage.setItem(KEYS.decks, JSON.stringify(state.decks));
  localStorage.setItem(KEYS.fx, JSON.stringify(state.fx));
  localStorage.setItem(KEYS.cardTrader, JSON.stringify(state.cardTrader));
  localStorage.setItem(KEYS.favoriteGroups, JSON.stringify(state.favoriteGroups));
}

function uid() { return crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`; }
function esc(value) { return String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;"); }
function normalizeFavoriteGroups() {
  state.favoriteGroups = Array.isArray(state.favoriteGroups) ? state.favoriteGroups
    .filter(group => group && String(group.name || "").trim())
    .map(group => ({ id: group.id || uid(), name: String(group.name).trim(), createdAt: group.createdAt || Date.now(), cardOrder: Array.isArray(group.cardOrder) ? group.cardOrder.map(String) : [] })) : [];
  state.collection.forEach(card => {
    card.favoriteGroupIds = Array.isArray(card.favoriteGroupIds) ? card.favoriteGroupIds.filter(id => state.favoriteGroups.some(group => group.id === id)) : [];
  });
  state.favoriteGroups.forEach(group => {
    const memberIds = new Set(state.collection.filter(card => card.favoriteGroupIds.includes(group.id)).map(card => card.id));
    group.cardOrder = group.cardOrder.filter(id => memberIds.has(id));
  });
}
function favoriteGroupNames(card) {
  const ids = Array.isArray(card?.favoriteGroupIds) ? card.favoriteGroupIds : [];
  return state.favoriteGroups.filter(group => ids.includes(group.id)).map(group => group.name);
}
function favoriteGroupMatch(card, groupId) {
  return !groupId || (Array.isArray(card.favoriteGroupIds) && card.favoriteGroupIds.includes(groupId));
}
function cardsInFavoriteGroup(group) {
  const members = state.collection.filter(card => Array.isArray(card.favoriteGroupIds) && card.favoriteGroupIds.includes(group.id));
  const order = Array.isArray(group.cardOrder) ? group.cardOrder : [];
  const orderIndex = new Map(order.map((id, index) => [id, index]));
  return members.sort((a, b) => {
    const ai = orderIndex.has(a.id) ? orderIndex.get(a.id) : Number.MAX_SAFE_INTEGER;
    const bi = orderIndex.has(b.id) ? orderIndex.get(b.id) : Number.MAX_SAFE_INTEGER;
    if (ai !== bi) return ai - bi;
    return nameOf(a).localeCompare(nameOf(b), "ja");
  });
}
function syncFavoriteGroupOrder(group) {
  if (!group) return;
  const memberIds = new Set(state.collection.filter(card => Array.isArray(card.favoriteGroupIds) && card.favoriteGroupIds.includes(group.id)).map(card => card.id));
  const existing = Array.isArray(group.cardOrder) ? group.cardOrder.filter(id => memberIds.has(id)) : [];
  const known = new Set(existing);
  const added = state.collection.filter(card => memberIds.has(card.id) && !known.has(card.id)).sort((a, b) => nameOf(a).localeCompare(nameOf(b), "ja")).map(card => card.id);
  group.cardOrder = [...existing, ...added];
}
function renderFavoriteGroupOptions() {
  const options = [`<option value="">すべて</option>`, ...state.favoriteGroups.map(group => `<option value="${esc(group.id)}">${esc(group.name)}</option>`)].join("");
  [els.collectionFavoriteGroup, els.deckOwnedFavoriteGroup].forEach(select => {
    if (!select) return;
    const value = select.value;
    select.innerHTML = options;
    select.value = state.favoriteGroups.some(group => group.id === value) ? value : "";
  });
}
function renderFavoriteGroupPanel() {
  const owned = selectedOwnedCard();
  const hidden = state.cardDialogMode === "deck" || !owned;
  if (!els.favoriteGroupPanel) return;
  els.favoriteGroupPanel.hidden = hidden;
  if (hidden) return;
  const ids = Array.isArray(owned.favoriteGroupIds) ? owned.favoriteGroupIds : [];
  if (els.favoriteGroupSummary) {
    els.favoriteGroupSummary.textContent = state.favoriteGroups.length
      ? `${ids.length}/${state.favoriteGroups.length}件`
      : "未作成";
  }
  if (!state.favoriteGroups.length) {
    els.favoriteGroupList.innerHTML = `<p class="muted">グループを作成すると、このカードを分類できます。</p>`;
    return;
  }
  els.favoriteGroupList.innerHTML = state.favoriteGroups.map(group => `
    <label class="favorite-group-item">
      <input type="checkbox" data-favorite-group-id="${esc(group.id)}" ${ids.includes(group.id) ? "checked" : ""}>
      <span>${esc(group.name)}</span>
      <button type="button" class="tiny delete-favorite-group" data-favorite-group-delete="${esc(group.id)}">削除</button>
    </label>
  `).join("");
  els.favoriteGroupList.querySelectorAll("[data-favorite-group-id]").forEach(input => input.addEventListener("change", () => {
    const id = input.dataset.favoriteGroupId;
    const group = state.favoriteGroups.find(item => item.id === id);
    owned.favoriteGroupIds = Array.isArray(owned.favoriteGroupIds) ? owned.favoriteGroupIds : [];
    if (input.checked) {
      owned.favoriteGroupIds = [...new Set([...owned.favoriteGroupIds, id])];
      if (group) {
        group.cardOrder = Array.isArray(group.cardOrder) ? group.cardOrder : [];
        if (!group.cardOrder.includes(owned.id)) group.cardOrder.push(owned.id);
      }
    } else {
      owned.favoriteGroupIds = owned.favoriteGroupIds.filter(groupId => groupId !== id);
      if (group) group.cardOrder = Array.isArray(group.cardOrder) ? group.cardOrder.filter(cardId => cardId !== owned.id) : [];
    }
    persist();
    renderCollection();
    if (state.editingDeck) renderDeckEditor();
    renderFavoriteGroupPanel();
  }));
  els.favoriteGroupList.querySelectorAll("[data-favorite-group-delete]").forEach(button => button.addEventListener("click", () => deleteFavoriteGroup(button.dataset.favoriteGroupDelete)));
}
function renderFavoriteGroupManager(preferredId = "") {
  if (!els.favoriteGroupManagerDialog) return;
  const selectedId = state.favoriteGroups.some(group => group.id === preferredId)
    ? preferredId
    : state.favoriteGroups.some(group => group.id === els.manageFavoriteGroupSelect?.value)
      ? els.manageFavoriteGroupSelect.value
      : state.favoriteGroups[0]?.id || "";
  const group = state.favoriteGroups.find(item => item.id === selectedId);
  if (els.manageFavoriteGroupSelect) {
    els.manageFavoriteGroupSelect.innerHTML = state.favoriteGroups.length
      ? state.favoriteGroups.map(item => `<option value="${esc(item.id)}">${esc(item.name)}</option>`).join("")
      : `<option value="">グループ未作成</option>`;
    els.manageFavoriteGroupSelect.value = selectedId;
    els.manageFavoriteGroupSelect.disabled = !group;
  }
  if (els.manageFavoriteGroupName) {
    els.manageFavoriteGroupName.value = group?.name || "";
    els.manageFavoriteGroupName.disabled = !group;
  }
  if (els.manageFavoriteGroupName?.parentElement) els.manageFavoriteGroupName.parentElement.hidden = !group || !favoriteGroupRenameOpen;
  if (els.toggleFavoriteGroupRename) {
    els.toggleFavoriteGroupRename.disabled = !group;
    els.toggleFavoriteGroupRename.textContent = favoriteGroupRenameOpen ? "名前変更を閉じる" : "名前を変更";
  }
  if (els.toggleFavoriteGroupAdd) {
    els.toggleFavoriteGroupAdd.disabled = !group;
    els.toggleFavoriteGroupAdd.textContent = favoriteGroupManagerMode === "add" ? "追加画面を閉じる" : "グループに追加する";
  }
  if (els.manageFavoriteGroupSearch) {
    els.manageFavoriteGroupSearch.hidden = favoriteGroupManagerMode !== "add";
    els.manageFavoriteGroupSearch.value = favoriteGroupManagerQuery;
    els.manageFavoriteGroupSearch.disabled = !group || !state.collection.length;
  }
  [els.saveFavoriteGroupName, els.deleteManagedFavoriteGroup].forEach(button => { if (button) button.disabled = !group; });
  if (!group) {
    if (els.manageFavoriteGroupStatus) els.manageFavoriteGroupStatus.textContent = "先にグループを作成してください。";
    if (els.manageFavoriteGroupCards) els.manageFavoriteGroupCards.innerHTML = `<div class="empty">カードを登録するグループがありません。</div>`;
    return;
  }
  syncFavoriteGroupOrder(group);
  const allCards = [...state.collection].sort((a, b) => nameOf(a).localeCompare(nameOf(b), "ja"));
  const memberCards = cardsInFavoriteGroup(group);
  if (favoriteGroupManagerMode !== "add") {
    if (els.manageFavoriteGroupStatus) els.manageFavoriteGroupStatus.textContent = `${memberCards.length}枚を登録中`;
    if (!memberCards.length) {
      els.manageFavoriteGroupCards.innerHTML = `<div class="empty">このグループにはまだカードがありません。「グループに追加する」からカードを選んでください。</div>`;
      return;
    }
    els.manageFavoriteGroupCards.innerHTML = memberCards.map((card, index) => `
      <div class="favorite-manage-card favorite-manage-card-view">
        <img src="${esc(card.image)}" alt="" loading="lazy">
        <span><strong>${esc(nameOf(card))}</strong><small>${esc(card.set)} #${esc(card.collectorNumber)} ・ ${Number(card.quantity || 0)}枚</small></span>
        <span class="favorite-manage-card-actions">
          <button type="button" class="ghost" data-favorite-group-move="${esc(card.id)}" data-direction="-1" ${index === 0 ? "disabled" : ""}>↑</button>
          <button type="button" class="ghost" data-favorite-group-move="${esc(card.id)}" data-direction="1" ${index === memberCards.length - 1 ? "disabled" : ""}>↓</button>
          <button type="button" class="danger tiny" data-favorite-group-remove="${esc(card.id)}">解除</button>
        </span>
      </div>
    `).join("");
    els.manageFavoriteGroupCards.querySelectorAll("[data-favorite-group-move]").forEach(button => button.addEventListener("click", () => {
      const cardId = button.dataset.favoriteGroupMove;
      const direction = Number(button.dataset.direction || 0);
      const ids = memberCards.map(card => card.id);
      const from = ids.indexOf(cardId);
      const to = from + direction;
      if (from < 0 || to < 0 || to >= ids.length) return;
      [ids[from], ids[to]] = [ids[to], ids[from]];
      group.cardOrder = ids;
      persist();
      renderFavoriteGroupManager(group.id);
    }));
    els.manageFavoriteGroupCards.querySelectorAll("[data-favorite-group-remove]").forEach(button => button.addEventListener("click", () => {
      const card = state.collection.find(item => item.id === button.dataset.favoriteGroupRemove);
      if (!card) return;
      card.favoriteGroupIds = Array.isArray(card.favoriteGroupIds) ? card.favoriteGroupIds.filter(id => id !== group.id) : [];
      group.cardOrder = Array.isArray(group.cardOrder) ? group.cardOrder.filter(id => id !== card.id) : [];
      persist();
      renderCollection();
      if (state.editingDeck) renderDeckEditor();
      renderFavoriteGroupPanel();
      renderFavoriteGroupManager(group.id);
    }));
    return;
  }
  const query = normalizeCardName(favoriteGroupManagerQuery);
  const cards = query ? allCards.filter(card => {
    const haystack = [
      nameOf(card), card.name, card.printedName, card.printed_name, card.jpName, card.set, card.collectorNumber, card.collector_number
    ].map(normalizeCardName).join(" ");
    return haystack.includes(query);
  }) : allCards;
  const checkedCount = allCards.filter(card => Array.isArray(card.favoriteGroupIds) && card.favoriteGroupIds.includes(group.id)).length;
  if (els.manageFavoriteGroupStatus) els.manageFavoriteGroupStatus.textContent = query
    ? `${checkedCount}/${allCards.length}枚を登録中・${cards.length}枚を表示`
    : `${checkedCount}/${allCards.length}枚を登録中`;
  if (!allCards.length) {
    els.manageFavoriteGroupCards.innerHTML = `<div class="empty">コレクションにカードがありません。</div>`;
    return;
  }
  if (!cards.length) {
    els.manageFavoriteGroupCards.innerHTML = `<div class="empty">条件に一致するカードがありません。</div>`;
    return;
  }
  els.manageFavoriteGroupCards.innerHTML = cards.map(card => {
    const ids = Array.isArray(card.favoriteGroupIds) ? card.favoriteGroupIds : [];
    return `
      <label class="favorite-manage-card">
        <input type="checkbox" data-manage-favorite-card="${esc(card.id)}" ${ids.includes(group.id) ? "checked" : ""}>
        <img src="${esc(card.image)}" alt="" loading="lazy">
        <span><strong>${esc(nameOf(card))}</strong><small>${esc(card.set)} #${esc(card.collectorNumber)} · ×${Number(card.quantity || 0)}</small></span>
      </label>`;
  }).join("");
  els.manageFavoriteGroupCards.querySelectorAll("[data-manage-favorite-card]").forEach(input => input.addEventListener("change", () => {
    const card = state.collection.find(item => item.id === input.dataset.manageFavoriteCard);
    if (!card) return;
    card.favoriteGroupIds = Array.isArray(card.favoriteGroupIds) ? card.favoriteGroupIds : [];
    if (input.checked) {
      card.favoriteGroupIds = [...new Set([...card.favoriteGroupIds, group.id])];
      group.cardOrder = Array.isArray(group.cardOrder) ? group.cardOrder : [];
      if (!group.cardOrder.includes(card.id)) group.cardOrder.push(card.id);
    } else {
      card.favoriteGroupIds = card.favoriteGroupIds.filter(id => id !== group.id);
      group.cardOrder = Array.isArray(group.cardOrder) ? group.cardOrder.filter(id => id !== card.id) : [];
    }
    persist();
    renderCollection();
    if (state.editingDeck) renderDeckEditor();
    renderFavoriteGroupPanel();
    const newCount = state.collection.filter(item => Array.isArray(item.favoriteGroupIds) && item.favoriteGroupIds.includes(group.id)).length;
    if (els.manageFavoriteGroupStatus) els.manageFavoriteGroupStatus.textContent = `${newCount}/${state.collection.length}枚を登録中`;
  }));
}
function openFavoriteGroupManager() {
  if (!els.favoriteGroupManagerDialog) return;
  favoriteGroupRenameOpen = false;
  favoriteGroupManagerQuery = "";
  favoriteGroupManagerMode = "view";
  renderFavoriteGroupManager();
  els.favoriteGroupManagerDialog.showModal();
}
function saveManagedFavoriteGroupName() {
  const id = els.manageFavoriteGroupSelect?.value || "";
  const group = state.favoriteGroups.find(item => item.id === id);
  const name = els.manageFavoriteGroupName?.value.trim();
  if (!group || !name) { showToast("グループ名を入力してください"); return; }
  if (state.favoriteGroups.some(item => item.id !== id && item.name === name)) { showToast("同じ名前のグループがあります"); return; }
  group.name = name;
  persist();
  renderFavoriteGroupOptions();
  renderFavoriteGroupPanel();
  renderCollection();
  if (state.editingDeck) renderDeckEditor();
  favoriteGroupRenameOpen = false;
  renderFavoriteGroupManager(id);
  showToast("グループ名を変更しました");
}
function createFavoriteGroup() {
  const name = els.newFavoriteGroupName?.value.trim();
  if (!name) { showToast("グループ名を入力してください"); return; }
  if (state.favoriteGroups.some(group => group.name === name)) { showToast("同じ名前のグループがあります"); return; }
  state.favoriteGroups.push({ id: uid(), name, createdAt: Date.now(), cardOrder: [] });
  els.newFavoriteGroupName.value = "";
  persist();
  renderFavoriteGroupOptions();
  renderFavoriteGroupPanel();
  renderCollection();
  if (state.editingDeck) renderDeckEditor();
  showToast(`「${name}」を作成しました`);
}
function deleteFavoriteGroup(groupId) {
  const group = state.favoriteGroups.find(item => item.id === groupId);
  if (!group) return;
  if (!confirm(`お気に入りグループ「${group.name}」を削除しますか？\nカード自体は削除されません。`)) return;
  state.favoriteGroups = state.favoriteGroups.filter(item => item.id !== groupId);
  state.collection.forEach(card => {
    if (Array.isArray(card.favoriteGroupIds)) card.favoriteGroupIds = card.favoriteGroupIds.filter(id => id !== groupId);
  });
  persist();
  renderFavoriteGroupOptions();
  renderFavoriteGroupPanel();
  if (els.favoriteGroupManagerDialog?.open) renderFavoriteGroupManager();
  renderCollection();
  if (state.editingDeck) renderDeckEditor();
  showToast(`「${group.name}」を削除しました`);
}
normalizeFavoriteGroups();
function cardLanguage(card) { return String(card?.lang || card?.language || "").toLowerCase(); }
function isJapaneseCard(card) { return cardLanguage(card) === "ja"; }
function isEnglishCard(card) { return cardLanguage(card) === "en"; }
function cardScryfallId(card) { return card?._sourceScryfallId || card?.scryfallId || card?.id || ""; }
function shouldLocalizeDisplay(card) {
  if (isJapaneseCard(card) || card?._supplementalJpVariant) return true;
  if (card?._preferJpDisplay) return true;
  if (isEnglishCard(card)) return false;
  return Boolean(!card?.lang);
}
function prefersJapaneseDisplay(card) { return shouldLocalizeDisplay(card); }
function normalizeDisplayName(value) {
  const text = String(value || "").trim();
  if (!text.includes("//")) return text;
  const parts = text.split(/\s*\/\/\s*/).map(part => part.trim()).filter(Boolean);
  if (parts.length >= 2 && parts.length % 2 === 0) {
    const half = parts.length / 2;
    const left = parts.slice(0, half);
    const right = parts.slice(half);
    if (left.every((part, index) => part === right[index])) return left.join(" // ");
  }
  return parts.join(" // ");
}
function imageOf(card) {
  const canUseLocalizedImage = Boolean(card?._jpImageExact && isJapaneseCard(card));
  const nativeImage = card?.image_uris?.normal || card?.card_faces?.[0]?.image_uris?.normal || card?.image || "";
  const localizedImage = canUseLocalizedImage ? (card?.jpImage || card?.jpImages?.normal || "") : "";
  return localizedImage || nativeImage;
}
function backImageOf(card) {
  const canUseLocalizedImage = Boolean(card?._jpImageExact && isJapaneseCard(card));
  const nativeBackImage = card?.card_faces?.[1]?.image_uris?.normal || "";
  const localizedBackImage = canUseLocalizedImage ? (card?.jpImages?.back || "") : "";
  return localizedBackImage || nativeBackImage;
}
function typeOf(card) { return card.printed_type_line || card.printedTypeLine || card.type_line || card.typeLine || ""; }
function nameOf(card) { return normalizeDisplayName((prefersJapaneseDisplay(card) ? card.jpName : "") || card.printed_name || card.printedName || card.name || "名称不明"); }
function altNameOf(card) {
  const printed = normalizeDisplayName((prefersJapaneseDisplay(card) ? card.jpName : "") || card.printed_name || card.printedName);
  const englishName = normalizeDisplayName(card.name);
  return printed && englishName && printed !== englishName ? englishName : "";
}
function displayLanguageLabel(card) {
  if (card?._supplementalJpVariant) return card?._jpImageExact ? "日本語名 / 日本語画像" : "日本語名 / 英語版画像";
  if (isJapaneseCard(card)) return "日本語";
  if (prefersJapaneseDisplay(card) && card?._jpImageExact) return "日本語名 / 日本語画像";
  if (prefersJapaneseDisplay(card) && card?.jpName) return card?.lang === "en" ? "日本語名 / 英語版" : "日本語名";
  return card?.lang === "en" ? "英語" : "その他";
}
function actualLanguageLabel(card) {
  if (card?._supplementalJpVariant) return "日名";
  if (isJapaneseCard(card)) return "日";
  return card?.lang === "en" ? "英" : "他";
}
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
function selectedPriceSource(card) {
  return card.finish === "foil" ? card.priceUsdFoilSource : card.finish === "etched" ? card.priceUsdEtchedSource : card.priceUsdSource;
}
function selectedPriceUsesEnglish(card) {
  return card.finish === "foil" ? card.priceUsdFoilFromEnglish === true : card.finish === "etched" ? card.priceUsdEtchedFromEnglish === true : card.priceUsdFromEnglish === true;
}
function yenValueOf(card) { const usd = usdPriceOf(card); return usd != null && state.fx.usdJpy ? usd * state.fx.usdJpy * Number(card.quantity || 0) : null; }
function unitYenValueOf(card) { const value = yenValueOf(card); const quantity = Number(card.quantity || 0); return value != null && quantity > 0 ? value / quantity : null; }
function collectionPriceDisplayValue(card) {
  return state.collectionPriceDisplayMode === "unit" ? unitYenValueOf(card) : yenValueOf(card);
}
function collectionPriceLabel(card, compact = false) {
  const value = collectionPriceDisplayValue(card);
  if (value == null) return compact ? "" : "参考価格なし";
  if (compact) return state.collectionPriceDisplayMode === "unit" ? `${formatYen(value)} / 枚` : formatYen(value);
  const prefix = selectedPriceSource(card) === "cardtrader" ? "CardTrader" : selectedPriceUsesEnglish(card) ? "英語版参考" : "参考";
  return state.collectionPriceDisplayMode === "unit"
    ? `${prefix} ${formatYen(value)} / 枚`
    : `${prefix} ${formatYen(value)}`;
}
function updateCollectionPriceModeUi() {
  document.querySelectorAll("[data-collection-price-mode]").forEach(button => {
    const active = button.dataset.collectionPriceMode === state.collectionPriceDisplayMode;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", active ? "true" : "false");
  });
}

const CARDTRADER_API_BASE = "https://api.cardtrader.com/api/v2";
const CARDTRADER_CACHE_MS = 7 * DAY_MS;
let cardTraderMarketplaceCache = new Map();

function cardTraderToken() {
  return String(state.cardTrader?.token || "").trim();
}

function cardTraderStatusText() {
  if (!cardTraderToken()) return "未設定の場合はScryfall価格を使用します。";
  if (state.cardTrader?.lastError) return `CardTrader設定済み。直近の取得エラー：${state.cardTrader.lastError}`;
  if (state.cardTrader?.priceUpdatedAt) return `CardTrader設定済み。最終価格取得：${new Date(state.cardTrader.priceUpdatedAt).toLocaleString("ja-JP")}`;
  return "CardTrader設定済み。次回の価格更新で使用します。";
}

function updateCardTraderSettingsUi() {
  if (els.cardTraderToken && document.activeElement !== els.cardTraderToken) {
    const currentValue = String(els.cardTraderToken.value || "").trim();
    if (cardTraderToken() && (!currentValue || currentValue === "********")) els.cardTraderToken.value = "********";
    if (!cardTraderToken() && currentValue === "********") els.cardTraderToken.value = "";
  }
  if (els.cardTraderHelp) els.cardTraderHelp.textContent = cardTraderStatusText();
}

function cardTraderLanguageForCard(card) {
  if (card.language === "ja") return "jp";
  if (card.language === "en") return "en";
  return "";
}

function cardTraderConditionForCard(card) {
  return ({
    NM: "Near Mint",
    LP: "Slightly Played",
    MP: "Moderately Played",
    HP: "Heavily Played",
    DMG: "Poor",
  })[String(card.condition || "").toUpperCase()] || "";
}

function cardTraderFoilForCard(card) {
  if (card.finish === "foil") return true;
  if (card.finish === "normal") return false;
  return null;
}

function cardTraderPriceFresh(card) {
  return card.cardTraderPriceUpdatedAt && Date.now() - card.cardTraderPriceUpdatedAt < DAY_MS;
}

async function fetchCardTrader(path) {
  const token = cardTraderToken();
  if (!token) throw new Error("APIトークン未設定");
  const response = await fetch(`${CARDTRADER_API_BASE}${path}`, {
    headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

async function cardTraderExpansionMap() {
  if (state.cardTrader.expansionMap && Date.now() - Number(state.cardTrader.expansionMapUpdatedAt || 0) < CARDTRADER_CACHE_MS) {
    return state.cardTrader.expansionMap;
  }
  const expansions = await fetchCardTrader("/expansions");
  const map = {};
  (expansions || []).forEach(expansion => {
    const code = String(expansion.code || "").toLowerCase();
    if (code && !map[code]) map[code] = expansion.id;
  });
  state.cardTrader.expansionMap = map;
  state.cardTrader.expansionMapUpdatedAt = Date.now();
  persist();
  return map;
}

async function cardTraderBlueprintsForSet(setCode) {
  const normalizedSet = String(setCode || "").toLowerCase();
  if (!normalizedSet) return {};
  const cached = state.cardTrader.blueprintsBySet?.[normalizedSet];
  const cachedAt = state.cardTrader.blueprintsUpdatedAt?.[normalizedSet] || 0;
  if (cached && Date.now() - cachedAt < CARDTRADER_CACHE_MS) return cached;
  const expansionId = (await cardTraderExpansionMap())[normalizedSet];
  if (!expansionId) return {};
  const blueprints = await fetchCardTrader(`/blueprints/export?expansion_id=${encodeURIComponent(expansionId)}`);
  const map = {};
  (blueprints || []).forEach(blueprint => {
    if (blueprint.scryfall_id) map[blueprint.scryfall_id] = blueprint.id;
  });
  state.cardTrader.blueprintsBySet = state.cardTrader.blueprintsBySet || {};
  state.cardTrader.blueprintsUpdatedAt = state.cardTrader.blueprintsUpdatedAt || {};
  state.cardTrader.blueprintsBySet[normalizedSet] = map;
  state.cardTrader.blueprintsUpdatedAt[normalizedSet] = Date.now();
  persist();
  return map;
}

async function cardTraderMarketplaceForSet(setCode, language, foil) {
  const normalizedSet = String(setCode || "").toLowerCase();
  const expansionId = (await cardTraderExpansionMap())[normalizedSet];
  if (!expansionId) return {};
  const key = `${expansionId}:${language}:${foil}`;
  if (cardTraderMarketplaceCache.has(key)) return cardTraderMarketplaceCache.get(key);
  const query = new URLSearchParams({ expansion_id: String(expansionId), language });
  query.set("foil", foil ? "true" : "false");
  const data = await fetchCardTrader(`/marketplace/products?${query}`);
  cardTraderMarketplaceCache.set(key, data || {});
  return data || {};
}

function priceAmountToUsd(price) {
  const cents = Number(price?.cents);
  const currency = String(price?.currency || "USD").toUpperCase();
  if (!Number.isFinite(cents)) return null;
  const amount = cents / 100;
  if (currency === "USD") return amount;
  const rate = Number(state.fx?.rates?.[currency] || 0);
  return rate > 0 ? amount / rate : null;
}

function chooseCardTraderProduct(products, card) {
  const language = cardTraderLanguageForCard(card);
  const condition = cardTraderConditionForCard(card);
  const foil = cardTraderFoilForCard(card);
  const candidates = (products || [])
    .filter(product => !product.graded && !product.on_vacation)
    .filter(product => !product.bundle_size || Number(product.bundle_size) === 1)
    .filter(product => product.properties_hash?.mtg_language === language)
    .filter(product => product.properties_hash?.condition === condition)
    .filter(product => product.properties_hash?.mtg_foil === foil)
    .map(product => ({ product, usd: priceAmountToUsd(product.price) }))
    .filter(entry => entry.usd != null)
    .sort((a, b) => a.usd - b.usd);
  return candidates[0] || null;
}

function applyCardTraderPrice(card, usd, product) {
  if (card.finish === "foil") {
    card.priceUsdFoil = String(usd);
    card.priceUsdFoilSource = "cardtrader";
    card.priceUsdFoilFromEnglish = false;
  } else {
    card.priceUsd = String(usd);
    card.priceUsdSource = "cardtrader";
    card.priceUsdFromEnglish = false;
  }
  card.cardTraderPriceUpdatedAt = Date.now();
  card.cardTraderPriceCurrency = product?.price?.currency || "";
  card.cardTraderPriceCents = product?.price?.cents ?? null;
  card.priceUpdatedAt = Date.now();
}

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
  spm: "マーベル スパイダーマン",
  mar: "マーベル・マテリアル",
  spe: "マーベル スパイダーマン ウェルカム・デッキ",
  hob: "ホビット", hoc: "ホビット 統率者",
  msh: "マジック：ザ・ギャザリング | マーベル スーパー・ヒーローズ", msc: "マーベル スーパー・ヒーローズ 統率者",
  sos: "ストリクスヘイヴンの秘密", soa: "ストリクスヘイヴンの秘密 ミスティカルアーカイブ", soc: "ストリクスヘイヴンの秘密 統率者",
  tmt: "ミュータント タートルズ", tmc: "ミュータント タートルズ 統率者", pza: "ミュータント タートルズ ソース・マテリアル",
  ecl: "ローウィンの昏明", ecc: "ローウィンの昏明 統率者",
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

const COMPLETE_SET_OVERRIDES = {
  sos: { setSize: 271 },
};

const PRIMARY_SET_TYPES = new Set(["expansion", "core", "masters", "commander", "draft_innovation", "jumpstart"]);
const HIDDEN_SET_TYPES = new Set(["token", "memorabilia", "alchemy", "funny", "minigame", "promo", "box"]);
const HIDDEN_SET_NAME_PATTERN = /\b(promo|promos|arena|anthology|bonus sheet|alchemy|treasure chest|regional|showdown|love your lgs|through the ages|stellar sights|the big score)\b/i;
const SET_SEARCH_ALIASES = [
  { codes: ["spe"], terms: ["マーベル スパイダーマン ウェルカム・デッキ", "スパイダーマン ウェルカム・デッキ", "Spider-Man Welcome Deck", "SPE"] },
  { codes: ["mar"], terms: ["マーベル・マテリアル", "Marvel Material", "MAR"] },
  { codes: ["spm"], terms: ["マーベル スパイダーマン", "Magic: The Gathering | Marvel's Spider-Man", "SPM"] },
  { codes: ["spm", "mar", "spe"], terms: ["スパイダーマン", "Marvel's Spider-Man", "Spider-Man"] },
  { codes: ["hoc"], terms: ["ホビット統率者", "ホビット 統率者", "The Hobbit Commander", "Hobbit Commander", "HOC"] },
  { codes: ["hob", "hoc"], terms: ["ホビット", "The Hobbit", "Hobbit"] },
];

const FALLBACK_SETS = [
  { code: "spm", name: "Magic: The Gathering | Marvel's Spider-Man", released_at: "2025-09-26", set_type: "expansion" },
  { code: "mar", name: "Marvel's Spider-Man: Marvel Material", released_at: "2025-09-26", set_type: "masterpiece" },
  { code: "spe", name: "Marvel's Spider-Man Welcome Deck", released_at: "2025-09-26", set_type: "starter" },
  { code: "hob", name: "Magic: The Gathering | The Hobbit", released_at: "2026-08-14", set_type: "expansion" },
  { code: "hoc", name: "Magic: The Gathering | The Hobbit Commander", released_at: "2026-08-14", set_type: "commander" },
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

function getAllKnownSets() {
  const merged = new Map();
  [...FALLBACK_SETS, ...(Array.isArray(state.sets) ? state.sets : [])].forEach((set) => {
    const code = normalizeSetCode(set?.code);
    if (!code) return;
    const previous = merged.get(code) || {};
    merged.set(code, {
      ...previous,
      ...set,
      code,
      name: set?.name || previous.name || code.toUpperCase(),
      released_at: set?.released_at || previous.released_at || "",
      set_type: set?.set_type || previous.set_type || "",
    });
  });
  return [...merged.values()];
}

const SET_JA_NAME_CACHE = new Map();

function getSetJapaneseName(code) {
  const normalized = normalizeSetCode(code);
  if (!normalized) return "";
  if (SET_JA_NAME_CACHE.has(normalized)) return SET_JA_NAME_CACHE.get(normalized);

  const direct = SET_JA_NAMES[normalized] || "";
  if (direct) {
    SET_JA_NAME_CACHE.set(normalized, direct);
    return direct;
  }

  const indexed = JP_CARD_SEARCH_INDEX.find(entry =>
    normalizeSetCode(entry?.setCode) === normalized && entry?.setNameJa
  );
  const name = indexed?.setNameJa || "";
  SET_JA_NAME_CACHE.set(normalized, name);
  return name;
}

function resolveSetInput(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  const normalized = normalizeSetCode(raw);
  const sets = getAllKnownSets();
  const matched = sets.find(set => {
    const code = normalizeSetCode(set.code);
    const enName = normalizeSetCode(set.name);
    const jaName = normalizeSetCode(getSetJapaneseName(set.code));
    return code === normalized || enName === normalized || jaName === normalized;
  }) || sets.find(set => {
    const enName = normalizeSetCode(set.name);
    const jaName = normalizeSetCode(getSetJapaneseName(set.code));
    return normalized.length >= 3 && (enName.includes(normalized) || jaName.includes(normalized));
  });
  return normalizeSetCode(matched?.code || raw);
}

function compactSetDisplayName(value) {
  return String(value || "")
    .replace(/^\s*マジック\s*[：:]?\s*ザ\s*[・･]?\s*ギャザリング(?:®|™)?\s*(?:[|｜—–―ー\-:：]+\s*)*/i, "")
    .replace(/^\s*Magic\s*:\s*The\s+Gathering(?:®|™)?\s*(?:[|｜—–―ー\-:：]+\s*)*/i, "")
    .trim();
}

function setDisplayName(set) {
  const code = String(set.code || "").toLowerCase();
  const name = getSetJapaneseName(code) || set.name || code.toUpperCase();
  return `${compactSetDisplayName(name) || code.toUpperCase()}（${code.toUpperCase()}）`;
}

function isUsefulSet(set) {
  return Boolean(set?.code) && !HIDDEN_SET_TYPES.has(set.set_type);
}

function isPrimarySet(set) {
  if (!isUsefulSet(set)) return false;
  if (HIDDEN_SET_NAME_PATTERN.test(set.name || "")) return false;
  if (PRIMARY_SET_TYPES.has(set.set_type)) return true;
  return Boolean(getSetJapaneseName(set.code));
}

function renderSetSelects() {
  const allSets = getAllKnownSets()
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
  renderSetPickers();
}

function normalizeSetPickerText(value) {
  return String(value || "")
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[()\[\]{}（）【】「」『』・:：／/|｜\s_-]+/g, "");
}

function setPickerLabel(set) {
  const code = normalizeSetCode(set?.code);
  const ja = getSetJapaneseName(code);
  const en = set?.name || "";
  return compactSetDisplayName(ja || en) || code.toUpperCase();
}

function isRecentSetForPicker(set) {
  const releasedAt = Date.parse(set?.released_at || "");
  if (!Number.isFinite(releasedAt)) return false;
  return releasedAt >= Date.now() - 180 * DAY_MS;
}

function shouldShowSetInPicker(set) {
  return Boolean(getSetJapaneseName(set?.code)) || isRecentSetForPicker(set);
}

function getSetPickerSets() {
  const seen = new Set();
  return getAllKnownSets()
    .filter(isPrimarySet)
    .filter(shouldShowSetInPicker)
    .filter(set => {
      const code = normalizeSetCode(set?.code);
      if (!code || seen.has(code)) return false;
      seen.add(code);
      return true;
    })
    .sort((a, b) =>
      String(b.released_at || "").localeCompare(String(a.released_at || "")) ||
      String(a.name || "").localeCompare(String(b.name || ""))
    );
}

function setMatchesPickerQuery(set, query) {
  const normalizedQuery = normalizeSetPickerText(query);
  if (!normalizedQuery) return true;
  const code = normalizeSetCode(set?.code);
  const ja = getSetJapaneseName(code);
  const haystack = [
    code,
    set?.name || "",
    ja,
    setPickerLabel(set),
  ].map(normalizeSetPickerText).join(" ");
  return haystack.includes(normalizedQuery);
}

function renderSetPickerList(list, input, query = "") {
  const selected = normalizeSetCode(input?.value);
  const sets = getSetPickerSets().filter(set => setMatchesPickerQuery(set, query));
  if (!sets.length) {
    list.innerHTML = '<p class="muted set-picker-empty">一致するセットがありません</p>';
    return;
  }
  list.innerHTML = sets.map(set => {
    const code = normalizeSetCode(set.code);
    const active = selected && selected === code;
    return `<button type="button" class="set-picker-option ${active ? "active" : ""}" data-set-code="${esc(code)}">
      <span>${esc(setPickerLabel(set))}</span>
      <small>${esc(set.released_at || "")}</small>
    </button>`;
  }).join("");
}

function renderSetPicker(input, pickerId) {
  if (!input) return;
  const label = input.closest("label");
  if (!label) return;
  label.classList.add("set-code-input-label");

  let picker = document.getElementById(pickerId);
  if (!picker) {
    picker = document.createElement("div");
    picker.id = pickerId;
    picker.className = "set-picker";
    label.insertAdjacentElement("afterend", picker);
  }

  const selectedCode = normalizeSetCode(input.value);
  const selectedSet = selectedCode
    ? getSetPickerSets().find(set => normalizeSetCode(set.code) === selectedCode)
    : null;
  const selectedLabel = selectedSet ? setPickerLabel(selectedSet) : (selectedCode ? selectedCode.toUpperCase() : "指定なし");

  picker.innerHTML = `
    <details class="set-picker-accordion">
      <summary>
        <span>エキスパンション</span>
        <strong>${esc(selectedLabel)}</strong>
      </summary>
      <div class="set-picker-body">
        <div class="set-picker-tools">
          <input type="search" class="set-picker-search" placeholder="セット名・略号で絞り込み">
          <button type="button" class="filter-reset set-picker-clear">指定なし</button>
        </div>
        <div class="set-picker-list"></div>
      </div>
    </details>`;

  const search = picker.querySelector(".set-picker-search");
  const list = picker.querySelector(".set-picker-list");
  const refreshList = () => renderSetPickerList(list, input, search?.value || "");
  refreshList();

  search?.addEventListener("input", refreshList);
  picker.querySelector(".set-picker-clear")?.addEventListener("click", () => {
    input.value = "";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    updateAdvancedSearchSummary();
    renderSetSelects();
  });
  list.addEventListener("click", event => {
    const button = event.target.closest("[data-set-code]");
    if (!button) return;
    input.value = button.dataset.setCode || "";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    updateAdvancedSearchSummary();
    renderSetSelects();
  });
}

function renderSetPickers() {
  renderSetPicker(els.searchSet, "searchSetPicker");
  renderSetPicker(els.deckSearchSet, "deckSearchSetPicker");
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

const SCRYFALL_SUBTYPE_ALIASES = new Map([
  ["熊", "Bear"],
  ["狼", "Wolf"],
  ["人間", "Human"],
  ["エルフ", "Elf"],
  ["ゴブリン", "Goblin"],
  ["ゾンビ", "Zombie"],
  ["吸血鬼", "Vampire"],
  ["ウィザード", "Wizard"],
  ["戦士", "Warrior"],
  ["ドルイド", "Druid"],
  ["ドラゴン", "Dragon"],
  ["天使", "Angel"],
  ["デーモン", "Demon"],
  ["エレメンタル", "Elemental"],
  ["ビースト", "Beast"],
  ["猫", "Cat"],
  ["犬", "Dog"],
  ["鳥", "Bird"],
  ["魚", "Fish"],
]);

function normalizeScryfallSubtype(value) {
  const subtype = String(value || "").trim();
  return SCRYFALL_SUBTYPE_ALIASES.get(subtype) || subtype;
}

function localizedSubtypeNeedsClientFilter(value) {
  const subtype = String(value || "").trim();
  return Boolean(subtype && isJapanese(subtype) && normalizeScryfallSubtype(subtype) === subtype);
}

function getCardTypeLines(card) {
  const faces = Array.isArray(card?.card_faces) ? card.card_faces : [];
  return [
    card?.printed_type_line,
    card?.printedTypeLine,
    card?.type_line,
    card?.typeLine,
    ...faces.flatMap((face) => [
      face?.printed_type_line,
      face?.printedTypeLine,
      face?.type_line,
      face?.typeLine,
    ]),
  ].filter(Boolean);
}

function normalizeSubtypeToken(value) {
  return String(value || "")
    .normalize("NFKC")
    .toLocaleLowerCase("ja")
    .replace(/[・･]/g, " ")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getSubtypeSegments(typeLine) {
  return String(typeLine || "")
    .split(/\s*\/\/\s*/)
    .flatMap((face) => {
      const parts = face.split(/\s*[—–]\s*|\s+-\s+/);
      return parts.length > 1 ? parts.slice(1) : [];
    })
    .map(normalizeSubtypeToken)
    .filter(Boolean);
}

function cardMatchesLocalizedSubtype(card, value) {
  const raw = normalizeSubtypeToken(value);
  const translated = normalizeSubtypeToken(normalizeScryfallSubtype(value));
  const needles = [...new Set([raw, translated].filter(Boolean))];
  if (!needles.length) return true;
  return getCardTypeLines(card).some((typeLine) => (
    getSubtypeSegments(typeLine).some((segment) => {
      const tokens = new Set(segment.split(" ").filter(Boolean));
      return needles.some((needle) => (
        needle.split(" ").filter(Boolean).every((token) => tokens.has(token))
      ));
    })
  ));
}

function stripLanguageFilter(filters) {
  return String(filters || "")
    .replace(/(?:^|\s)lang:[^\s)]+/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function buildCardSearchFilters(options = {}) {
  const terms = [buildScryfallFilters("", els.searchMana.value, els.searchType.value, els.searchSet.value)];
  const language = $("#searchLanguage")?.value || "";
  const oracleText = $("#searchOracleText")?.value.trim() || "";
  const format = $("#searchFormat")?.value || "";
  const subtype = options.omitSubtype ? "" : normalizeScryfallSubtype($("#searchSubtype")?.value);
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

function selectedOptionText(select) {
  if (!select || !select.value) return "";
  return select.options[select.selectedIndex]?.textContent?.trim() || select.value;
}

function updateCollectionFilterSummary() {
  if (!els.collectionFilterSummary) return;
  const chips = [];
  const color = selectedOptionText(els.collectionColor);
  const mana = selectedOptionText(els.collectionMana);
  const type = selectedOptionText(els.collectionType);
  const price = selectedOptionText(els.collectionPriceFilter);
  const favoriteGroup = selectedOptionText(els.collectionFavoriteGroup);
  if (color) chips.push(`色:${color}`);
  if (mana) chips.push(`マナ:${mana}`);
  if (type) chips.push(`タイプ:${type}`);
  if (price) chips.push(`価格:${price}`);
  if (els.collectionFavoritesOnly?.checked) chips.push("お気に入りのみ");
  if (favoriteGroup) chips.push(`お気に入り:${favoriteGroup}`);
  els.collectionFilterSummary.textContent = chips.length ? `詳細条件：${chips.join(" / ")}` : "詳細条件：指定なし";
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

function normalizedOcrKey(value) {
  return normalizeAliasKey(value)
    .replaceAll(/ー/g, "")
    .replaceAll(/[^\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}a-z0-9]/gu, "");
}

function ocrCandidateKeys(candidate) {
  const text = String(candidate || "").normalize("NFKC");
  const keys = new Set();
  const fullKey = normalizedOcrKey(text);
  if (fullKey.length >= 2) keys.add(fullKey);

  const japaneseOnly = text
    .replaceAll(/[^\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}ー]/gu, "")
    .replaceAll(/ー{2,}/g, "ー");
  const japaneseKey = normalizedOcrKey(japaneseOnly);
  if (japaneseKey.length >= 2) keys.add(japaneseKey);

  const japaneseChunks = text.match(/[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}ー]{2,}/gu) || [];
  japaneseChunks.forEach(chunk => {
    const key = normalizedOcrKey(chunk);
    if (key.length >= 3) keys.add(key);
  });

  const latinChunks = text.match(/[A-Za-z][A-Za-z'’\- ]{3,}/g) || [];
  latinChunks.forEach(chunk => {
    const key = normalizedOcrKey(chunk);
    if (key.length >= 4) keys.add(key);
  });

  return [...keys].sort((a, b) => b.length - a.length);
}

function levenshteinDistance(a, b, maxDistance = Infinity) {
  if (a === b) return 0;
  if (!a || !b) return Math.max(a.length, b.length);
  if (Math.abs(a.length - b.length) > maxDistance) return maxDistance + 1;
  let previous = Array.from({ length: b.length + 1 }, (_, index) => index);
  for (let i = 1; i <= a.length; i += 1) {
    const current = [i];
    let rowMin = i;
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      const value = Math.min(previous[j] + 1, current[j - 1] + 1, previous[j - 1] + cost);
      current[j] = value;
      rowMin = Math.min(rowMin, value);
    }
    if (rowMin > maxDistance) return maxDistance + 1;
    previous = current;
  }
  return previous[b.length];
}

let OCR_SEARCH_TARGETS = null;
function ocrSearchTargets() {
  if (OCR_SEARCH_TARGETS) return OCR_SEARCH_TARGETS;
  const targets = [];
  const seen = new Set();
  JP_CARD_SEARCH_INDEX.forEach(item => {
    const displayName = displayJaNamesForIndexItem(item)[0] || item.scryfallName || item.enNames?.[0] || "";
    const searchName = item.scryfallName || item.enNames?.[0] || displayName;
    jpIndexNames(item).forEach(name => {
      const cleanName = stripJapaneseReadings(name);
      const key = normalizedOcrKey(cleanName);
      if (key.length < 2) return;
      const id = `${key}:${item.scryfallId || item.oracleId || searchName}`;
      if (seen.has(id)) return;
      seen.add(id);
      targets.push({ key, name: cleanName, displayName, searchName, item });
    });
  });
  OCR_SEARCH_TARGETS = targets;
  return targets;
}

function scoreOcrTarget(candidateKey, targetKey) {
  if (!candidateKey || !targetKey) return 0;
  if (candidateKey === targetKey) return 1000;
  if (candidateKey.length >= 2 && targetKey.includes(candidateKey)) return 850 + Math.min(candidateKey.length, 20);
  if (targetKey.length >= 4 && candidateKey.includes(targetKey)) return 780 + Math.min(targetKey.length, 20);
  if (candidateKey.length < 4 || targetKey.length < 4) return 0;
  if (candidateKey[0] !== targetKey[0] && candidateKey.at(-1) !== targetKey.at(-1)) return 0;
  const maxLen = Math.max(candidateKey.length, targetKey.length);
  const maxDistance = Math.max(2, Math.floor(maxLen * 0.35));
  const distance = levenshteinDistance(candidateKey, targetKey, maxDistance);
  if (distance > maxDistance) return 0;
  return Math.round((1 - (distance / maxLen)) * 700);
}

function ocrDbMatches(candidates, limit = 5) {
  const scored = [];
  const targets = ocrSearchTargets();
  candidates.forEach((candidate, candidateIndex) => {
    const candidateKeys = ocrCandidateKeys(candidate);
    candidateKeys.forEach((candidateKey, keyIndex) => {
      if (candidateKey.length < 2) return;
      targets.forEach(target => {
        const score = scoreOcrTarget(candidateKey, target.key) - candidateIndex * 10 - keyIndex * 3;
        if (score < 520) return;
        scored.push({ ...target, score, ocrText: candidate, matchedKey: candidateKey });
      });
    });
  });
  const unique = [];
  const seen = new Set();
  scored.sort((a, b) => b.score - a.score).forEach(item => {
    const key = item.item?.oracleId || item.item?.scryfallName || item.searchName;
    if (!key || seen.has(key)) return;
    seen.add(key);
    unique.push(item);
  });
  return unique.slice(0, limit);
}

function displayFragmentForOcrKey(matchedKey, matches) {
  if (!matchedKey || !isJapanese(matchedKey)) return "";
  const candidates = [];
  matches.forEach(match => {
    const names = [
      match.name,
      match.displayName,
      ...(match.item?.jaNames || []),
      ...(match.item?.jpNames || []),
    ].filter(Boolean);
    names.forEach(name => {
      const cleanName = stripJapaneseReadings(name);
      for (let start = 0; start < cleanName.length; start += 1) {
        for (let end = start + 2; end <= cleanName.length; end += 1) {
          const fragment = cleanName.slice(start, end).replace(/^[、，・\s/]+|[、，・\s/]+$/g, "");
          if (fragment.length < 2 || !isJapanese(fragment)) continue;
          if (normalizedOcrKey(fragment) !== matchedKey) continue;
          candidates.push(fragment);
        }
      }
    });
  });
  if (!candidates.length) return "";
  return candidates
    .sort((a, b) => {
      const aHasLongMark = a.includes("ー") ? 1 : 0;
      const bHasLongMark = b.includes("ー") ? 1 : 0;
      if (aHasLongMark !== bHasLongMark) return bHasLongMark - aHasLongMark;
      if (a.length !== b.length) return a.length - b.length;
      return a.localeCompare(b, "ja");
    })[0];
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
    const dbMatches = ocrDbMatches(candidates);
    const bestMatch = dbMatches[0];
    if (bestMatch) {
      const nearMatches = dbMatches.filter(item => item.score >= bestMatch.score - 8 && item.matchedKey === bestMatch.matchedKey);
      const useFragmentSearch = isJapanese(bestMatch.matchedKey) && nearMatches.length >= 2;
      const displayFragment = useFragmentSearch ? displayFragmentForOcrKey(bestMatch.matchedKey, nearMatches) : "";
      const searchText = displayFragment || bestMatch.matchedKey;
      els.cardSearch.value = useFragmentSearch ? searchText : bestMatch.searchName;
      const matchLabels = dbMatches.map(item => item.displayName || item.searchName).filter(Boolean);
      setOcrStatus(`読み取り候補: ${candidates.join(" / ")} → DB補正: ${matchLabels.join(" / ")}。${useFragmentSearch ? `断片「${searchText}」` : "先頭候補"}で検索します`);
    } else {
      els.cardSearch.value = candidates[0];
      setOcrStatus(`読み取り候補: ${candidates.join(" / ")}。DB候補が弱いため、先頭候補で検索します`);
    }
    await searchCards();
  } catch (error) {
    console.error(error);
    setOcrStatus("OCRに失敗しました。画像を選び直すか、カード名を手入力してください");
  }
}

async function searchCards() {
  const query = els.cardSearch.value.trim();
  const rawSubtype = $("#searchSubtype")?.value.trim() || "";
  const clientSubtype = rawSubtype;
  const localizedSubtype = localizedSubtypeNeedsClientFilter(rawSubtype) ? rawSubtype : "";
  const filters = buildCardSearchFilters({ omitSubtype: Boolean(localizedSubtype) });
  const exactMatch = Boolean(query) && els.searchMatch.value === "exact";
  const exhaustiveAdvancedSearch = Boolean(filters || clientSubtype);
  const maxCandidates = exhaustiveAdvancedSearch ? Number.POSITIVE_INFINITY : 30;
  if (!query && !filters && !clientSubtype) { els.searchStatus.textContent = "カード名または検索条件を指定してください"; return; }
  els.searchButton.disabled = true;
  els.searchStatus.textContent = navigator.onLine ? "検索中…" : "オフラインのため検索できません";
    state.searchResults = [];
    state.searchGroups = [];
    els.searchResults.innerHTML = "";
    updateClearSearchResultsButton();
    if (!navigator.onLine) { els.searchButton.disabled = false; updateClearSearchResultsButton(); return; }

  const selectedLanguage = $("#searchLanguage")?.value || "";
  const oracleText = $("#searchOracleText")?.value.trim() || "";
  const sourceLang = selectedLanguage || ([query, rawSubtype, oracleText].some(isJapanese) ? "ja" : "en");
  const targetLang = sourceLang === "ja" ? "en" : "ja";
  const applySubtypeFilter = cards => clientSubtype
    ? (cards || []).filter(card => cardMatchesLocalizedSubtype(card, clientSubtype))
    : (cards || []);
  let primaryCards = [];
  let lastError = null;
  try {
    if (isSetScopedCardSearch(query)) {
      els.searchStatus.textContent = "セットの全カードを取得中…";
      const completeSet = await fetchCompleteSetCandidates(els.searchSet.value, filters);
      const matchingSetCards = applySubtypeFilter(completeSet.cards);
      if (!matchingSetCards.length) throw new Error(completeSet.error?.details || "カードが見つかりませんでした");
      const preferJpDisplay = selectedLanguage === "ja";
      state.searchResults = applyJpIndexToCards(matchingSetCards.map(card => (
        preferJpDisplay ? { ...card, _preferJpDisplay: true } : card
      ))).map(card => ({ ...card, _setScopedResult: true }));
      renderSearchResults();
      const uniqueCount = state.searchGroups.length;
      const indexedText = completeSet.indexedCount > uniqueCount ? `（DB登録 ${completeSet.indexedCount}件）` : "";
      els.searchStatus.textContent = `${uniqueCount}種類を表示${indexedText}`;
      return;
    }
    const searchResult = await fetchSearchCandidates(query, filters, sourceLang, exactMatch, maxCandidates, {
      exhaustive: exhaustiveAdvancedSearch,
      localizedSubtype: clientSubtype,
    });
    primaryCards = searchResult.cards;
    lastError = searchResult.error;
    if (!primaryCards.length) throw new Error(lastError?.details || "カードが見つかりませんでした");

    const exactOracleIds = findExactOracleIds(primaryCards, query);
    if (exactMatch && exactOracleIds.length) {
      els.searchStatus.textContent = "同じカードの日英版を取得中…";
      const unifiedPrints = await fetchUnifiedPrints(exactOracleIds.slice(0, 3), filters);
      const unifiedCards = sortUnifiedPrints(unifiedPrints).map(card => sourceLang === "ja" ? { ...card, _preferJpDisplay: true } : card);
      state.searchResults = applySubtypeFilter(applyJpIndexToCards(unifiedCards)).slice(0, 24);
    } else {
      els.searchStatus.textContent = "反対言語のカードも検索中…";
      const counterpartCards = await fetchCounterparts(primaryCards, targetLang, filters);
      const mergedCards = searchResult.source === "local" || exhaustiveAdvancedSearch
        ? [...primaryCards, ...counterpartCards]
        : mergeLanguageResults(primaryCards, counterpartCards);
      const indexedCards = applySubtypeFilter(applyJpIndexToCards(mergedCards));
      state.searchResults = exhaustiveAdvancedSearch ? indexedCards : indexedCards.slice(0, 24);
    }
    renderSearchResults();
    const displayedCards = state.searchGroups.map(group => group.card).filter(Boolean);
    const jaCount = displayedCards.filter(prefersJapaneseDisplay).length;
    const enCount = displayedCards.length - jaCount;
    els.searchStatus.textContent = `${displayedCards.length}種類を表示（日本語 ${jaCount}件・英語 ${enCount}件）`;
  } catch (err) {
    els.searchStatus.textContent = err.message || "検索に失敗しました。通信状態を確認してください";
  } finally {
    els.searchButton.disabled = false;
    updateClearSearchResultsButton();
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
  return stripJapaneseReadings(value).normalize("NFKC").trim().toLocaleLowerCase("ja").replaceAll(/\s+/g, " ");
}

function stripJapaneseReadings(value) {
  return String(value || "").replace(/[\uff08(][\u3041-\u3096\u30a1-\u30fa\u30fc\u30fb\uff65\s]+[\uff09)]/g, "");
}

function normalizeAliasKey(value) {
  return normalizeCardName(value).replaceAll(/[・･\s'’"“”\-‐‑‒–—―]/g, "");
}

async function fetchScryfallCardsByIdChunks(ids) {
  const uniqueIds = [...new Set((ids || []).filter(Boolean))];
  const cards = [];
  let lastError = null;
  for (let index = 0; index < uniqueIds.length; index += 75) {
    const result = await fetchScryfallCardsByIds(uniqueIds.slice(index, index + 75));
    if (result.ok) cards.push(...(result.data.data || []));
    else lastError = result.error;
    if (index + 75 < uniqueIds.length) await new Promise(resolve => setTimeout(resolve, 80));
  }
  return { cards, error: lastError };
}

function setAliasCodesForQuery(query) {
  const key = normalizeAliasKey(query);
  if (!key) return [];
  const match = SET_SEARCH_ALIASES.find(alias => alias.terms.some(term => normalizeAliasKey(term) === key));
  return match ? match.codes : [];
}

function buildSetAliasSearchQuery(codes, filters) {
  const setTerms = [...new Set(codes.map(normalizeSetCode).filter(Boolean))].map(code => `set:${code}`);
  if (!setTerms.length) return "";
  return [`(${setTerms.join(" or ")})`, filters].filter(Boolean).join(" ");
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
  const exactPrint = MTG_JP_CARD_INDEX.find(item => jpIndexImageMatchesCard(item, card));
  if (exactPrint) return exactPrint;
  const oracleId = card.oracle_id || card.oracleId || "";
  if (oracleId && JP_INDEX_BY_ORACLE_ID.has(oracleId)) return JP_INDEX_BY_ORACLE_ID.get(oracleId);
  const names = cardSearchNames(card).map(normalizeCardName);
  for (const name of names) {
    const item = JP_INDEX_BY_EN_NAME.get(name);
    if (item) return item;
  }
  return MTG_JP_CARD_INDEX.find(item => jpIndexMatchesCard(item, card)) || null;
}

function jpIndexImageMatchesCard(item, card) {
  if (!item || !card) return false;
  const cardScryfallId = card.id || card.scryfallId || "";
  if (item.scryfallId && cardScryfallId && item.scryfallId === cardScryfallId) return true;
  const cardSet = String(card.set || card.setCode || "").toLowerCase();
  const itemSet = String(item.setCode || "").toLowerCase();
  const cardNumber = String(card.collector_number || card.collectorNumber || "");
  const itemNumber = String(item.collectorNumber || "");
  return Boolean(cardSet && itemSet && cardNumber && itemNumber && cardSet === itemSet && cardNumber === itemNumber);
}

function displayJaNamesForIndexItem(item) {
  const names = item?.jaNames || [];
  const cleanNames = names.map(stripJapaneseReadings).map(normalizeDisplayName).filter(Boolean);
  const japaneseNames = cleanNames.filter(isJapanese);
  const preferred = japaneseNames.length ? japaneseNames : cleanNames;
  return preferred.length ? sortJapaneseDisplayNames(preferred) : names.map(normalizeDisplayName);
}

function scoreJapaneseDisplayName(name) {
  const normalized = normalizeDisplayName(stripJapaneseReadings(name));
  const parts = String(normalized).split(/\s*\/\/\s*/).map(normalizeDisplayName).filter(Boolean);
  if (!parts.length) return 0;
  const japaneseParts = parts.filter(isJapanese).length;
  const latinParts = parts.filter((part) => /[A-Za-z]/.test(part)).length;
  const allFacesJapanese = parts.length > 1 && japaneseParts === parts.length;
  return (allFacesJapanese ? 10000 : 0) + japaneseParts * 1000 - latinParts * 200 - normalized.length * 0.01;
}

function sortJapaneseDisplayNames(names) {
  return [...names].sort((a, b) => scoreJapaneseDisplayName(b) - scoreJapaneseDisplayName(a));
}

function splitDisplayNamesForFaces(names, faceCount = 0) {
  const clean = sortJapaneseDisplayNames((names || []).map(normalizeDisplayName).filter(Boolean));
  if (!faceCount || faceCount <= 1) return clean;
  const expanded = [];
  clean.forEach((name) => {
    const parts = String(name).split(/\s*\/\/\s*/).map(normalizeDisplayName).filter(Boolean);
    if (parts.length > 1) expanded.push(...parts);
    else expanded.push(name);
  });
  return expanded.length >= faceCount ? expanded.slice(0, faceCount) : clean;
}

function joinedDisplayNameForFaces(faceNames, fallback = "") {
  const clean = (faceNames || []).map(normalizeDisplayName).filter(Boolean);
  return normalizeDisplayName(clean.length > 1 ? clean.join(" // ") : (clean[0] || fallback));
}

function applyJpIndexToCard(card) {
  const item = jpIndexForCard(card);
  if (!item) return card;
  const localizeDisplay = shouldLocalizeDisplay(card);
  const localizeImage = jpIndexImageMatchesCard(item, card);
  const canUseJpImage = isJapaneseCard(card) || Boolean(card._supplementalJpVariant);
  const localizeTopImage = canUseJpImage && localizeImage;
  const rawDisplayJaNames = displayJaNamesForIndexItem(item).map(normalizeDisplayName);
  const faceCount = Array.isArray(card.card_faces) ? card.card_faces.length : 0;
  const faceJaNames = splitDisplayNamesForFaces(rawDisplayJaNames, faceCount);
  const displayJaNames = faceJaNames.length ? faceJaNames : rawDisplayJaNames;
  const displayJaName = joinedDisplayNameForFaces(faceJaNames, rawDisplayJaNames[0] || card.jpName);
  const faces = Array.isArray(card.card_faces) ? card.card_faces.map((face, index) => ({
    ...face,
    printed_name: normalizeDisplayName(localizeDisplay ? (faceJaNames[index] || displayJaNames[index] || face.printed_name) : face.printed_name),
    image_uris: localizeTopImage ? {
      ...(face.image_uris || {}),
      normal: index === 0 ? (item.images?.normal || face.image_uris?.normal) : (item.images?.back || face.image_uris?.normal),
    } : face.image_uris,
  })) : card.card_faces;
  return {
    ...card,
    lang: card.lang || (localizeDisplay ? "ja" : card.lang),
    image_uris: localizeTopImage && item.images?.normal ? { ...(card.image_uris || {}), normal: item.images.normal } : card.image_uris,
    jpName: displayJaName,
    jpAltName: normalizeDisplayName(faceJaNames[1] || displayJaNames[1] || ""),
    jpImage: localizeTopImage ? (item.images?.normal || item.image || "") : "",
    jpImages: localizeTopImage ? (item.images || null) : null,
    _jpImageExact: localizeTopImage,
    jpSourceUrl: item.sourceUrl || "",
    card_faces: faces,
    printed_name: normalizeDisplayName(localizeDisplay ? (displayJaName || card.printed_name) : card.printed_name),
    printed_type_line: card.printed_type_line || card.type_line,
  };
}

function applyJpIndexToCards(cards) {
  return cards.map(applyJpIndexToCard);
}

function supplementalJpVariantForCard(card) {
  const item = jpIndexForCard(card);
  if (!item || isJapaneseCard(card)) return null;
  const displayJaNames = displayJaNamesForIndexItem(item);
  if (!displayJaNames.length) return null;
  const sourceId = cardScryfallId(card);
  return applyJpIndexToCard({
    ...card,
    id: `${sourceId || item.scryfallId || item.oracleId || item.scryfallName}-jp-name`,
    lang: "ja",
    _preferJpDisplay: true,
    _supplementalJpVariant: true,
    _sourceScryfallId: sourceId,
  });
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

function buildLocalIndexScryfallQueryChunks(items, filters, options = {}) {
  const nameChunkSize = Number(options.nameChunkSize || 8);
  const oracleChunkSize = Number(options.oracleChunkSize || 16);
  const names = [...new Set(items.flatMap(item => [item.scryfallName, ...(item.enNames || [])]).filter(Boolean))];
  const queries = [];
  for (let i = 0; i < names.length; i += nameChunkSize) {
    const chunk = names.slice(i, i + nameChunkSize);
    if (chunk.length) queries.push(`(${chunk.map(scryfallNameQuery).join(" or ")}) ${filters}`.trim());
  }
  if (queries.length) return queries;
  const oracleIds = [...new Set(items.map(item => item.oracleId).filter(Boolean))];
  for (let i = 0; i < oracleIds.length; i += oracleChunkSize) {
    const chunk = oracleIds.slice(i, i + oracleChunkSize);
    if (chunk.length) queries.push(`(${chunk.map(id => `oracleid:${id}`).join(" or ")}) ${filters}`.trim());
  }
  return queries;
}

async function fetchLocalSearchCandidates(query, filters, exactMatch, maxCards = 30) {
  const queryKey = normalizeAliasKey(query);
  const isShortJapaneseQuery = /^[\u3041-\u3093\u30a1-\u30f6\u30fc]{1,3}$/.test(queryKey);
  const localLimit = exactMatch ? 20 : isShortJapaneseQuery ? 80 : 48;
  const localItems = localSearchIndexMatches(query, exactMatch, localLimit);
  if (!localItems.length) return { cards: [], items: [], error: null };
  const queries = exactMatch
    ? [buildLocalIndexScryfallQuery(localItems, filters)].filter(Boolean)
    : buildLocalIndexScryfallQueryChunks(localItems, filters);
  if (!queries.length) return { cards: [], items: localItems, error: null };
  const localOrder = new Map(localItems.map((item, index) => [item, index]));
  const localByOracle = new Map(localItems.map(item => [item.oracleId, item]).filter(([key]) => key));
  const localByName = new Map();
  localItems.forEach(item => jpIndexNames(item).forEach(name => localByName.set(normalizeCardName(name), item)));
  const cards = [];
  const seen = new Set();
  let lastError = null;
  for (const scryfallQuery of queries) {
    const result = await fetchScryfallSearch(scryfallQuery, exactMatch
      ? { unique: "prints", order: "released", dir: "desc" }
      : { unique: "cards", order: "name" });
    if (!result.ok) {
      lastError = result.error;
      continue;
    }
    for (const card of result.data.data || []) {
      const key = exactMatch ? card.id : (card.oracle_id || card.id);
      if (!key || seen.has(key)) continue;
      seen.add(key);
      cards.push(card);
    }
    if (!exactMatch && cards.length >= maxCards) break;
    await new Promise(resolve => setTimeout(resolve, 80));
  }
  if (!cards.length && lastError) return { cards: [], items: localItems, error: lastError };
  const ordered = cards
    .map(card => ({
      card,
      item: localByOracle.get(card.oracle_id) || cardSearchNames(card).map(normalizeCardName).map(name => localByName.get(name)).find(Boolean) || null,
    }))
    .filter(entry => !exactMatch || cardNameMatchesExactly(applyJpIndexToCard(entry.card), query))
    .sort((a, b) => (localOrder.get(a.item) ?? 9999) - (localOrder.get(b.item) ?? 9999));
  const preferJpDisplay = isJapanese(query);
  return {
    cards: ordered.map(entry => (preferJpDisplay && entry.item ? { ...entry.card, _preferJpDisplay: true } : entry.card)).slice(0, maxCards),
    items: localItems,
    error: null,
  };
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
      ? [`lang:en name:"${String(query).replaceAll('"', '\\"')}" ${filters}`.trim(), `lang:en ${searchTerms}`, searchTerms]
      : [searchTerms];
  return [...new Set([...aliasSearches, ...baseSearches].filter(Boolean))];
}

function localIndexItemsForSet(setCode) {
  const normalizedSet = String(resolveSetInput(setCode) || setCode || "").trim().toLocaleLowerCase("en");
  if (!normalizedSet) return [];
  return JP_CARD_SEARCH_INDEX.filter(item => String(item.setCode || "").trim().toLocaleLowerCase("en") === normalizedSet);
}

function hasLanguageFilter(filters) {
  return /\blang:[^\s)]+/i.test(String(filters || ""));
}

function collectorNumberSortValue(card) {
  const match = String(card?.collector_number || card?.collectorNumber || "").match(/^\d+/);
  return match ? Number(match[0]) : Number.MAX_SAFE_INTEGER;
}

function completeSetOverrideCards(setCode, cards) {
  const override = COMPLETE_SET_OVERRIDES[String(setCode || "").toLocaleLowerCase("en")];
  if (!override?.setSize) return cards || [];
  return (cards || []).filter(card => (
    String(card?.set || "").toLocaleLowerCase("en") === String(setCode || "").toLocaleLowerCase("en") &&
    collectorNumberSortValue(card) >= 1 &&
    collectorNumberSortValue(card) <= override.setSize
  ));
}

function isSetScopedCardSearch(query) {
  if (String(query || "").trim() || !els.searchSet?.value) return false;
  return Boolean(resolveSetInput(els.searchSet.value));
}

async function fetchCompleteSetCandidates(setCode, filters) {
  const normalizedSet = resolveSetInput(setCode);
  const localItems = localIndexItemsForSet(normalizedSet);
  const normalizedFilters = String(filters || "").trim().replace(/\s+/g, " ");
  const neutralFilters = stripLanguageFilter(normalizedFilters);
  const setOnly = neutralFilters === `set:${normalizedSet}`;
  const setLanguageOnly = setOnly && hasLanguageFilter(normalizedFilters);
  // IDから取得したローカル補完カードは追加条件で絞り込まれていない。
  // セット単独または言語のみ追加の検索では、日本語DB未登録の収録カードも落とさず補完する。
  const localCards = setOnly
    ? await fetchScryfallCardsByIdChunks(localItems.map(item => item.scryfallId))
    : { cards: [], error: null };
  const liveResult = await fetchAllScryfallSearch(normalizedFilters, { unique: "cards", order: "name" });
  const completeSetFallback = setLanguageOnly && COMPLETE_SET_OVERRIDES[normalizedSet]
    ? await fetchAllScryfallSearch(`set:${normalizedSet} lang:en`, { unique: "cards", order: "set" })
    : { ok: true, data: { data: [] }, error: null };
  const cards = [];
  const seen = new Set();
  const push = card => {
    if (!card) return;
    const key = card.id || `${card.oracle_id || card.name}:${card.set}:${card.collector_number}`;
    if (!key || seen.has(key)) return;
    seen.add(key);
    cards.push(card);
  };
  localCards.cards.forEach(push);
  if (liveResult.ok) (liveResult.data.data || []).forEach(push);
  if (completeSetFallback.ok) completeSetOverrideCards(normalizedSet, completeSetFallback.data.data).forEach(push);

  const orderById = new Map(localItems.map((item, index) => [item.scryfallId, index]));
  const orderByOracle = new Map(localItems.map((item, index) => [item.oracleId, index]).filter(([key]) => key));
  cards.sort((a, b) => {
    const numberOrder = collectorNumberSortValue(a) - collectorNumberSortValue(b);
    if (setOnly && numberOrder) return numberOrder;
    const aOrder = orderById.get(a.id) ?? orderByOracle.get(a.oracle_id) ?? Number.MAX_SAFE_INTEGER;
    const bOrder = orderById.get(b.id) ?? orderByOracle.get(b.oracle_id) ?? Number.MAX_SAFE_INTEGER;
    if (aOrder !== bOrder) return aOrder - bOrder;
    if (numberOrder) return numberOrder;
    return String(a.name || "").localeCompare(String(b.name || ""), "ja");
  });
  return {
    cards,
    error: liveResult.ok ? (completeSetFallback.error || localCards.error) : (liveResult.error || completeSetFallback.error || localCards.error),
    indexedCount: setOnly ? Math.max(localItems.length, COMPLETE_SET_OVERRIDES[normalizedSet]?.setSize || 0) : localItems.length,
  };
}

async function fetchSearchCandidates(query, filters, preferredLang, exactMatch, maxCards = 30, options = {}) {
  const exhaustive = Boolean(options.exhaustive);
  const localizedSubtype = String(options.localizedSubtype || "").trim();
  const runSearch = exhaustive ? fetchAllScryfallSearch : fetchScryfallSearch;
  const applyClientFilters = source => localizedSubtype
    ? (source || []).filter(card => cardMatchesLocalizedSubtype(card, localizedSubtype))
    : (source || []);
  const limitCards = source => Number.isFinite(maxCards) ? source.slice(0, maxCards) : source;
  const localMaxCards = Number.isFinite(maxCards) ? maxCards : 5000;
  const setAliasCodes = exactMatch ? [] : setAliasCodesForQuery(query);
  if (setAliasCodes.length) {
    const setAliasQuery = buildSetAliasSearchQuery(setAliasCodes, filters);
    if (setAliasQuery) {
      const result = await runSearch(setAliasQuery, { unique: "cards", order: "name" });
      if (result.ok && result.data.data?.length) {
        const matches = applyClientFilters(result.data.data);
        if (matches.length) return { cards: limitCards(matches), error: null, source: "set-alias" };
      }
    }
  }
  let localFallbackCards = [];
  if (String(query || "").trim()) {
    const localResult = await fetchLocalSearchCandidates(query, filters, exactMatch, localMaxCards);
    if (localResult.cards.length) {
      const matches = applyClientFilters(localResult.cards);
      if (!exhaustive && (exactMatch || preferredLang === "ja")) {
        return { cards: limitCards(matches), error: null, source: "local" };
      }
      localFallbackCards = matches;
    }
  }
  const candidates = buildSearchCandidates(query, filters, preferredLang, exactMatch);
  const aliasCount = (preferredLang === "ja" || exactMatch) ? aliasTargetsForQuery(query, { exactOnly: exactMatch, limit: exactMatch ? 20 : 8 }).length : 0;
  const shouldCollectMany = aliasCount > 1;
  const cards = [];
  const seen = new Set();
  let lastError = null;
  for (const q of candidates) {
    const result = await runSearch(q, { unique: "cards" });
    if (result.ok) {
      const nameMatches = exactMatch ? result.data.data.filter(card => cardNameMatchesExactly(card, query)) : result.data.data;
      const matches = applyClientFilters(nameMatches);
      for (const card of matches) {
        if (!seen.has(card.id)) {
          seen.add(card.id);
          cards.push(card);
        }
      }
      if (!exhaustive && cards.length && (!shouldCollectMany || cards.length >= maxCards)) break;
    }
    lastError = result.error;
    if (shouldCollectMany) await new Promise(resolve => setTimeout(resolve, 60));
  }
  for (const card of localFallbackCards) {
    const key = card.id || card.oracle_id || card.name;
    if (key && !seen.has(key)) {
      seen.add(key);
      cards.push(card);
    }
  }
  return { cards: limitCards(cards), error: lastError };
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
  const neutralFilters = stripLanguageFilter(extraFilters);
  for (const oracleId of oracleIds) {
    for (const lang of ["ja", "en"]) {
      const result = await fetchAllScryfallSearch(`oracleid:${oracleId} lang:${lang} ${neutralFilters}`.trim(), { order: "released", dir: "desc" });
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
  const neutralFilters = stripLanguageFilter(extraFilters);
  for (const card of uniqueCards) {
    const exactName = String(card.name || "").replaceAll('"', '\\"');
    if (!exactName) continue;
    const result = await fetchScryfallSearch(`!\"${exactName}\" lang:${targetLang} ${neutralFilters}`.trim());
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
    const key = card._setScopedResult
      ? `${String(card.set || "").toLocaleLowerCase("en")}:${card.collector_number || card.id || card.name}`
      : card.oracle_id || card.name;
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
  updateClearSearchResultsButton();
}

function updateClearSearchResultsButton() {
  if (!els.clearSearchResults) return;
  const hasResults =
    (state.searchResults?.length || 0) > 0 ||
    (state.searchGroups?.length || 0) > 0 ||
    Boolean(els.searchResults?.innerHTML.trim());
  els.clearSearchResults.disabled = !hasResults;
}

function clearSearchResults() {
  state.searchResults = [];
  state.searchGroups = [];
  if (els.searchResults) els.searchResults.innerHTML = "";
  if (els.searchStatus) els.searchStatus.textContent = "検索結果をクリアしました";
  updateClearSearchResultsButton();
  showToast("検索結果をクリアしました");
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
    const shouldPreferJpDisplay = Boolean(card._preferJpDisplay);
    const variantSource = sortUnifiedPrints(prints.length ? prints : [card]).map(item => shouldPreferJpDisplay ? { ...item, _preferJpDisplay: true } : item);
    variants = applyJpIndexToCards(variantSource);
    if (shouldPreferJpDisplay && !variants.some(isJapaneseCard)) {
      const supplementalVariant = supplementalJpVariantForCard(card);
      if (supplementalVariant) variants = [supplementalVariant, ...variants];
    }
    state.variantCache.set(key, variants);
  }
  state.cardVariants = variants;
  const sameVariant = variants.find(item => item.id === card.id) || variants[0] || card;
  selectVariant(sameVariant);
}

function selectedOwnedQuantity() {
  return Number(selectedOwnedCard()?.quantity || 0);
}

function selectedOwnedCard() {
  const selectedId = cardScryfallId(state.selectedCard);
  if (!selectedId || !state.selectedOwnedId) return null;
  const pinned = state.collection.find(card => card.id === state.selectedOwnedId && card.scryfallId === selectedId);
  return pinned || null;
}

function updateCardOwnedActions() {
  const owned = selectedOwnedCard();
  const hidden = state.cardDialogMode === "deck" || !owned;
  if (els.favoriteCardButton) els.favoriteCardButton.hidden = true;
  els.deleteCardButton.hidden = hidden;
  if (!owned) { renderFavoriteGroupPanel(); return; }
  if (els.favoriteCardButton) {
    els.favoriteCardButton.classList.toggle("active", owned.favorite === true);
    els.favoriteCardButton.textContent = owned.favorite ? "★ お気に入り" : "☆ お気に入り";
    els.favoriteCardButton.setAttribute("aria-pressed", owned.favorite ? "true" : "false");
  }
  renderFavoriteGroupPanel();
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

function reorderOwnedCard(sourceId, targetId) {
  if (!sourceId || !targetId || sourceId === targetId) return false;
  const fromIndex = state.collection.findIndex(card => card.id === sourceId);
  const toIndex = state.collection.findIndex(card => card.id === targetId);
  if (fromIndex < 0 || toIndex < 0) return false;
  const movingCard = state.collection[fromIndex];
  state.collection[fromIndex] = state.collection[toIndex];
  state.collection[toIndex] = movingCard;
  if (state.collectionSortStack?.length) {
    state.collectionSortStack = [];
    saveCollectionSortStack();
  }
  persist();
  return true;
}

function endCollectionPress() {
  if (collectionPressState?.timer) window.clearTimeout(collectionPressState.timer);
  collectionPressState = null;
}

function finishCollectionReorderMode() {
  collectionReorderMode = false;
  collectionReorderSelection = null;
  document.body.classList.remove("collection-reordering");
}

function handleCollectionReorderClick(button) {
  const targetId = button.dataset.id;
  if (!collectionReorderSelection || targetId === collectionReorderSelection) {
    finishCollectionReorderMode();
    renderCollection();
    showToast("並び替えを解除しました");
    return;
  }
  const moved = reorderOwnedCard(collectionReorderSelection, targetId);
  finishCollectionReorderMode();
  renderCollection();
  showToast(moved ? "コレクションの並び順を変更しました" : "並び替えできませんでした");
}

function startCollectionReorderFromLongPress(button) {
  if (!collectionPressState || collectionPressState.button !== button) return;
  collectionPressState = null;
  collectionReorderMode = true;
  collectionReorderSelection = button.dataset.id;
  suppressNextCollectionCardClick = true;
  document.body.classList.add("collection-reordering");
  button.classList.add("collection-reorder-selected");
  showToast("移動先のカードを選んでください");
}

function attachCollectionCardHandlers(button, card) {
  button.dataset.id = card.id;
  button.classList.toggle(
    "collection-reorder-selected",
    collectionReorderMode && collectionReorderSelection === card.id,
  );
  button.addEventListener("click", () => {
    if (suppressNextCollectionCardClick) {
      suppressNextCollectionCardClick = false;
      if (collectionReorderMode && button.dataset.id !== collectionReorderSelection) {
        handleCollectionReorderClick(button);
      }
      return;
    }
    if (collectionReorderMode) {
      handleCollectionReorderClick(button);
      return;
    }
    openOwnedCard(card);
  });
  button.addEventListener("pointerdown", event => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    if (collectionReorderMode) return;
    endCollectionPress();
    collectionPressState = {
      button,
      startX: event.clientX,
      startY: event.clientY,
      timer: window.setTimeout(() => startCollectionReorderFromLongPress(button), 450),
    };
  });
  button.addEventListener("pointermove", event => {
    if (!collectionPressState || collectionPressState.button !== button) return;
    if (Math.hypot(
      event.clientX - collectionPressState.startX,
      event.clientY - collectionPressState.startY,
    ) > 18) {
      endCollectionPress();
    }
  });
  button.addEventListener("pointerup", endCollectionPress);
  button.addEventListener("pointercancel", endCollectionPress);
  button.addEventListener("lostpointercapture", endCollectionPress);
  button.addEventListener("contextmenu", event => event.preventDefault());
  button.addEventListener("dragstart", event => event.preventDefault());
}

function renderSelectedVariant() {
  const card = state.selectedCard;
  const owned = selectedOwnedCard();
  const backImage = backImageOf(card);
  els.cardPreview.innerHTML = `<div class="card-detail-preview"><div class="card-detail-images"><img class="card-detail-image" src="${esc(imageOf(card))}" alt="${esc(nameOf(card))}">${backImage ? `<img class="card-detail-image card-detail-back" src="${esc(backImage)}" alt="${esc(altNameOf(card) || nameOf(card))} 裏面">` : ""}</div><div><span class="eyebrow">${esc((card.set || "").toUpperCase())} #${esc(card.collector_number)} · ${displayLanguageLabel(card)}</span><h2>${esc(nameOf(card))}</h2><p class="muted">${altNameOf(card) ? `${esc(altNameOf(card))}<br>` : ""}${esc(typeOf(card))}</p></div></div>`;
  els.cardQuantity.value = selectedOwnedQuantity();
  els.cardCondition.value = owned?.condition || "NM";
  els.cardFinish.value = owned?.finish || "normal";
  els.cardLanguage.value = owned?.language || (card.lang === "ja" ? "ja" : card.lang === "en" ? "en" : "other");
  els.cardLocation.value = owned?.location || "";
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
    <button type="button" class="variant-option ${card.id === state.selectedCard.id ? "selected" : ""}" data-id="${card.id}" aria-label="${esc(nameOf(card))} ${(card.set || "").toUpperCase()} ${card.collector_number || ""} ${displayLanguageLabel(card)}">
      <img src="${esc(imageOf(card))}" alt="" loading="lazy"><span>${actualLanguageLabel(card)} · ${esc((card.set || "").toUpperCase())}</span>
    </button>`).join("");
  els.cardVariants.querySelectorAll("button").forEach(button => button.addEventListener("click", () => {
    const card = state.cardVariants.find(item => item.id === button.dataset.id);
    if (card) selectVariant(card);
  }));
}

function selectVariant(card) {
  state.selectedCard = card;
  if (!state.collection.some(item => item.id === state.selectedOwnedId && item.scryfallId === cardScryfallId(card))) state.selectedOwnedId = null;
  renderSelectedVariant();
  renderVariantGallery();
}

function compactCard(card) {
  return {
    id: uid(), scryfallId: cardScryfallId(card), oracleId: card.oracle_id || "", name: card.name || "", printedName: nameOf(card) || card.printed_name || "",
    set: (card.set || "").toUpperCase(), setName: card.set_name || "", collectorNumber: card.collector_number || "",
    typeLine: card.type_line || "", printedTypeLine: card.printed_type_line || "", image: imageOf(card),
    manaCost: card.mana_cost || card.card_faces?.map(face => face.mana_cost).filter(Boolean).join(" // ") || "",
    manaValue: Number(card.cmc || 0), colors: card.colors || [], colorIdentity: card.color_identity || [], metadataVersion: 1,
    priceUsd: card.prices?.usd || null, priceUsdFoil: card.prices?.usd_foil || null, priceUsdEtched: card.prices?.usd_etched || null,
    priceUsdSource: card.prices?.usd ? "scryfall" : "", priceUsdFoilSource: card.prices?.usd_foil ? "scryfall" : "", priceUsdEtchedSource: card.prices?.usd_etched ? "scryfall" : "",
    priceUsdFromEnglish: false, priceUsdFoilFromEnglish: false, priceUsdEtchedFromEnglish: false, priceUpdatedAt: Date.now(),
    quantity: Math.max(1, Number(els.cardQuantity.value || 1)), condition: els.cardCondition.value,
    finish: els.cardFinish.value, language: els.cardLanguage.value, location: els.cardLocation.value.trim(), favorite: false, favoriteGroupIds: [], addedAt: Date.now(),
  };
}

function saveSelectedCardQuantity() {
  const target = Math.max(0, Number(els.cardQuantity.value || 0));
  const selectedId = cardScryfallId(state.selectedCard);
  const owned = selectedOwnedCard();
  if (target <= 0) {
    if (owned) state.collection = state.collection.filter(card => card.id !== owned.id);
    state.selectedOwnedId = null;
  } else {
    const incoming = compactCard(state.selectedCard);
    incoming.quantity = target;
    const sameLot = card =>
      card.id !== owned?.id &&
      card.scryfallId === selectedId &&
      card.condition === incoming.condition &&
      card.finish === incoming.finish &&
      card.language === incoming.language &&
      card.location === incoming.location;
    const mergeTarget = state.collection.find(sameLot);
    if (mergeTarget) {
      mergeTarget.quantity = Number(mergeTarget.quantity || 0) + target;
      mergeTarget.favorite = mergeTarget.favorite || owned?.favorite || false;
      mergeTarget.favoriteGroupIds = [...new Set([...(mergeTarget.favoriteGroupIds || []), ...(owned?.favoriteGroupIds || [])])];
      if (owned) state.collection = state.collection.filter(card => card.id !== owned.id);
      state.selectedOwnedId = mergeTarget.id;
    } else if (owned) {
      Object.assign(owned, incoming, {
        id: owned.id,
        quantity: target,
        favorite: owned.favorite || false,
        favoriteGroupIds: Array.isArray(owned.favoriteGroupIds) ? owned.favoriteGroupIds : [],
        addedAt: owned.addedAt || incoming.addedAt,
      });
      state.selectedOwnedId = owned.id;
    } else {
      state.collection.unshift(incoming);
      state.selectedOwnedId = incoming.id;
    }
  }
  persist();
  renderCollection();
  if (state.editingDeck && els.deckDialog.open) renderDeckEditor();
  els.cardQuantity.value = selectedOwnedQuantity();
  hydrateEnglishPriceFallbacks();
  hydrateCardTraderPrices({ force: true });
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
  const favoriteGroupId = els.collectionFavoriteGroup?.value || "";
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
    const favoriteMatch = (!favoritesOnly || card.favorite === true) && favoriteGroupMatch(card, favoriteGroupId);
    return textMatch && colorMatch && manaMatch && typeMatch && priceMatch && favoriteMatch;
  });
  cards = sortedCollectionCards(cards);
  updateCollectionSortUi();
  updateCollectionFilterSummary();
  els.totalCards.textContent = state.collection.reduce((sum, card) => sum + Number(card.quantity), 0);
  els.uniqueCards.textContent = state.collection.length;
  const valuedCards = state.collection.map(yenValueOf).filter(value => value != null);
  els.collectionValue.textContent = state.fx.usdJpy && valuedCards.length ? formatYen(valuedCards.reduce((sum, value) => sum + value, 0)) : "--";
  const priceSourceText = cardTraderToken() ? " · CardTrader優先" : "";
  els.priceStatus.textContent = state.fx.updatedAt ? `USD/JPY ${state.fx.usdJpy.toFixed(2)} · ${state.fx.source === "auto" ? new Date(state.fx.updatedAt).toLocaleDateString("ja-JP") + "更新" : "概算"}${priceSourceText}` : "為替取得中";
  if (document.activeElement !== els.usdJpyRate) els.usdJpyRate.value = state.fx.usdJpy || "";
  els.fxHelp.textContent = state.fx.usdJpy ? `現在の換算レート：1 USD = ${state.fx.usdJpy.toFixed(2)}円（${state.fx.source === "auto" ? "自動取得" : "手動・概算"}）` : "為替を取得できない場合に手動で変更できます。";
  updateCardTraderSettingsUi();
  const hiddenMode = state.collectionViewMode === "hidden";
  const imageMode = state.collectionViewMode === "images";
  if (els.collectionPriceDisplayMode) els.collectionPriceDisplayMode.value = state.collectionPriceDisplayMode;
  updateCollectionPriceModeUi();
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
        <span class="collection-qty-badge">×${Number(card.quantity || 0)}</span>
        ${collectionPriceDisplayValue(card) != null ? `<span class="collection-price-badge">${esc(collectionPriceLabel(card, true))}</span>` : ""}
      </button>`).join("");
  els.collectionList.querySelectorAll(".collection-image-card").forEach(button => {
    const card = state.collection.find(item => item.id === button.dataset.id);
    attachCollectionCardHandlers(button, card);
  });
    return;
  }
  const visibleIds = cards.map(card => card.id);
  els.collectionList.innerHTML = cards.map((card, index) => `
    <article class="list-item" data-id="${card.id}">
      <button class="collection-card-open" type="button" aria-label="${esc(nameOf(card))}の詳細を開く">
        <span class="collection-thumb-wrap"><img class="thumb" src="${esc(card.image)}" alt="" loading="lazy"><span class="collection-qty-badge">×${Number(card.quantity || 0)}</span></span>
        <span class="item-main"><strong>${esc(nameOf(card))}</strong><small>${esc(card.set)} #${esc(card.collectorNumber)} · ${esc(card.condition)} · ${card.finish === "normal" ? "通常" : esc(card.finish)}${card.metadataVersion ? ` · MV ${esc(card.manaValue)}` : ""}</small><span class="asset-value">${esc(collectionPriceLabel(card))}</span>${favoriteGroupNames(card).map(name => `<span class="chip">★ ${esc(name)}</span>`).join("")}${card.location ? `<span class="chip">${esc(card.location)}</span>` : ""}</span>
      </button>
      <div class="item-actions"><button class="tiny move-owned-up" aria-label="${esc(nameOf(card))}を前へ移動" ${index === 0 ? "disabled" : ""}>↑</button><button class="tiny move-owned-down" aria-label="${esc(nameOf(card))}を後へ移動" ${index === cards.length - 1 ? "disabled" : ""}>↓</button><button class="tiny minus" aria-label="1枚減らす">−</button><span class="qty-pill">×${card.quantity}</span><button class="tiny plus" aria-label="1枚増やす">＋</button><button class="tiny favorite-owned ${card.favorite ? "active" : ""}" aria-label="${esc(nameOf(card))}を${card.favorite ? "お気に入りから外す" : "お気に入りに追加"}" aria-pressed="${card.favorite ? "true" : "false"}">${card.favorite ? "★" : "☆"}</button><button class="tiny delete-owned" aria-label="${esc(nameOf(card))}をコレクションから削除">削除</button></div>
    </article>`).join("");
  els.collectionList.querySelectorAll(".list-item").forEach(row => {
    const card = state.collection.find(item => item.id === row.dataset.id);
    attachCollectionCardHandlers(row.querySelector(".collection-card-open"), card);
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
  const keepCardTraderNormal = ownedCard.priceUsdSource === "cardtrader" && cardTraderPriceFresh(ownedCard);
  const keepCardTraderFoil = ownedCard.priceUsdFoilSource === "cardtrader" && cardTraderPriceFresh(ownedCard);
  const keepCardTraderEtched = ownedCard.priceUsdEtchedSource === "cardtrader" && cardTraderPriceFresh(ownedCard);
  ownedCard.oracleId = apiCard.oracle_id || ownedCard.oracleId || "";
  ownedCard.typeLine = apiCard.type_line || ownedCard.typeLine || "";
  ownedCard.printedTypeLine = apiCard.printed_type_line || ownedCard.printedTypeLine || "";
  ownedCard.manaCost = apiCard.mana_cost || apiCard.card_faces?.map(face => face.mana_cost).filter(Boolean).join(" // ") || "";
  ownedCard.manaValue = Number(apiCard.cmc || 0);
  ownedCard.colors = apiCard.colors || [];
  ownedCard.colorIdentity = apiCard.color_identity || [];
  if (!keepCardTraderNormal) {
    ownedCard.priceUsd = apiCard.prices?.usd || null;
    ownedCard.priceUsdSource = apiCard.prices?.usd ? "scryfall" : "";
    ownedCard.priceUsdFromEnglish = false;
  }
  if (!keepCardTraderFoil) {
    ownedCard.priceUsdFoil = apiCard.prices?.usd_foil || null;
    ownedCard.priceUsdFoilSource = apiCard.prices?.usd_foil ? "scryfall" : "";
    ownedCard.priceUsdFoilFromEnglish = false;
  }
  if (!keepCardTraderEtched) {
    ownedCard.priceUsdEtched = apiCard.prices?.usd_etched || null;
    ownedCard.priceUsdEtchedSource = apiCard.prices?.usd_etched ? "scryfall" : "";
    ownedCard.priceUsdEtchedFromEnglish = false;
  }
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
          if (!card.priceUsd && englishCard.prices?.usd && card.priceUsdSource !== "cardtrader") { card.priceUsd = englishCard.prices.usd; card.priceUsdSource = "scryfall"; card.priceUsdFromEnglish = true; }
          if (!card.priceUsdFoil && englishCard.prices?.usd_foil && card.priceUsdFoilSource !== "cardtrader") { card.priceUsdFoil = englishCard.prices.usd_foil; card.priceUsdFoilSource = "scryfall"; card.priceUsdFoilFromEnglish = true; }
          if (!card.priceUsdEtched && englishCard.prices?.usd_etched && card.priceUsdEtchedSource !== "cardtrader") { card.priceUsdEtched = englishCard.prices.usd_etched; card.priceUsdEtchedSource = "scryfall"; card.priceUsdEtchedFromEnglish = true; }
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
  await hydrateCardTraderPrices();
}

async function hydrateCardTraderPrices(options = {}) {
  if (!navigator.onLine || !cardTraderToken()) { updateCardTraderSettingsUi(); return; }
  if (!state.fx?.usdJpy || !state.fx?.rates?.EUR) await refreshExchangeRate();
  const force = options.force === true;
  const candidates = state.collection.filter(card => (
    card.scryfallId &&
    !card.scryfallId.startsWith("sample-") &&
    cardTraderLanguageForCard(card) &&
    cardTraderFoilForCard(card) !== null &&
    (force || !card.cardTraderPriceUpdatedAt || Date.now() - card.cardTraderPriceUpdatedAt > DAY_MS)
  ));
  const groups = new Map();
  candidates.forEach(card => {
    const key = `${String(card.set || "").toLowerCase()}:${cardTraderLanguageForCard(card)}:${cardTraderFoilForCard(card)}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(card);
  });
  let changed = false;
  try {
    state.cardTrader.lastError = "";
    for (const groupCards of groups.values()) {
      const sample = groupCards[0];
      const setCode = String(sample.set || "").toLowerCase();
      const blueprints = await cardTraderBlueprintsForSet(setCode);
      const marketplace = await cardTraderMarketplaceForSet(setCode, cardTraderLanguageForCard(sample), cardTraderFoilForCard(sample));
      for (const card of groupCards) {
        const blueprintId = blueprints[card.scryfallId];
        const chosen = blueprintId ? chooseCardTraderProduct(marketplace[String(blueprintId)] || [], card) : null;
        card.cardTraderPriceUpdatedAt = Date.now();
        if (chosen) applyCardTraderPrice(card, chosen.usd, chosen.product);
        changed = true;
      }
    }
    if (changed) state.cardTrader.priceUpdatedAt = Date.now();
  } catch (error) {
    state.cardTrader.lastError = error?.message || "取得に失敗しました";
  }
  if (changed || state.cardTrader.lastError) { persist(); renderCollection(); }
  updateCardTraderSettingsUi();
}

async function refreshExchangeRate() {
  if (!navigator.onLine || (state.fx.usdJpy && state.fx.rates?.EUR && Date.now() - state.fx.updatedAt < DAY_MS)) { renderCollection(); return; }
  const endpoints = [
    "https://api.frankfurter.dev/v1/latest?base=USD&symbols=JPY,EUR,GBP,CAD,AUD,CHF",
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
      state.fx = { usdJpy: rate, rates: { ...(data.rates || data.conversion_rates || {}), USD: 1 }, updatedAt: Date.now(), source: "auto" };
      persist(); renderCollection();
      return;
    } catch { /* 次の取得先を試す */ }
    finally { clearTimeout(timer); }
  }
  if (!state.fx.usdJpy) state.fx = { usdJpy: 150, rates: { USD: 1, JPY: 150 }, updatedAt: Date.now(), source: "fallback" };
  persist(); renderCollection();
}

function saveExchangeRate() {
  const rate = Number(els.usdJpyRate.value || 0);
  if (!rate || rate <= 0) { showToast("正しい換算レートを入力してください"); return; }
  state.fx = { ...state.fx, usdJpy: rate, rates: { ...(state.fx.rates || {}), USD: 1, JPY: rate }, updatedAt: Date.now(), source: "manual" };
  persist(); renderCollection();
  showToast("円換算レートを保存しました");
}

function saveCardTraderToken() {
  const typed = String(els.cardTraderToken?.value || "").trim();
  if (!typed || typed === "********") { showToast("CardTrader APIトークンを入力してください"); return; }
  state.cardTrader.token = typed;
  state.cardTrader.lastError = "";
  state.collection.forEach(card => { card.cardTraderPriceUpdatedAt = 0; });
  cardTraderMarketplaceCache = new Map();
  persist();
  if (els.cardTraderToken) els.cardTraderToken.value = "********";
  updateCardTraderSettingsUi();
  showToast("CardTrader APIトークンを保存しました");
  hydrateCardTraderPrices({ force: true });
}

function clearCardTraderToken() {
  state.cardTrader = { token: "", expansionMap: null, expansionMapUpdatedAt: 0, blueprintsBySet: {}, blueprintsUpdatedAt: {}, priceUpdatedAt: 0, lastError: "" };
  state.collection.forEach(card => {
    if (card.priceUsdSource === "cardtrader") { card.priceUsd = null; card.priceUsdSource = ""; }
    if (card.priceUsdFoilSource === "cardtrader") { card.priceUsdFoil = null; card.priceUsdFoilSource = ""; }
    if (card.priceUsdEtchedSource === "cardtrader") { card.priceUsdEtched = null; card.priceUsdEtchedSource = ""; }
    card.cardTraderPriceUpdatedAt = 0;
    card.priceUpdatedAt = 0;
  });
  cardTraderMarketplaceCache = new Map();
  persist();
  if (els.cardTraderToken) els.cardTraderToken.value = "";
  updateCardTraderSettingsUi();
  renderCollection();
  hydrateCollectionMetadata();
  showToast("CardTrader設定を削除しました");
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

function endDeckListPress() {
  if (deckListPressState?.timer) window.clearTimeout(deckListPressState.timer);
  deckListPressState = null;
}

function finishDeckListReorderMode() {
  deckListReorderMode = false;
  deckListReorderSelection = null;
  document.body.classList.remove("deck-list-reordering");
}

function reorderDeck(deckId, targetId) {
  const fromIndex = state.decks.findIndex(deck => deck.id === deckId);
  let targetIndex = state.decks.findIndex(deck => deck.id === targetId);
  if (fromIndex < 0 || targetIndex < 0 || fromIndex === targetIndex) return false;
  const [movingDeck] = state.decks.splice(fromIndex, 1);
  state.decks.splice(targetIndex, 0, movingDeck);
  persist();
  return true;
}

function handleDeckListReorderClick(button) {
  const targetId = button.dataset.id;
  if (!deckListReorderSelection || targetId === deckListReorderSelection) {
    finishDeckListReorderMode();
    renderDecks();
    showToast("並び替えを解除しました");
    return;
  }
  const moved = reorderDeck(deckListReorderSelection, targetId);
  finishDeckListReorderMode();
  renderDecks();
  showToast(moved ? "デッキの並び順を変更しました" : "並び替えできませんでした");
}

function startDeckListReorderFromLongPress(button) {
  if (!deckListPressState || deckListPressState.button !== button) return;
  deckListPressState = null;
  deckListReorderMode = true;
  deckListReorderSelection = button.dataset.id;
  suppressNextDeckTileClick = true;
  document.body.classList.add("deck-list-reordering");
  button.classList.add("deck-list-reorder-selected");
  showToast("移動先のデッキを選んでください");
}

function attachDeckTileHandlers(button, deck) {
  if (!deck) return;
  button.dataset.id = deck.id;
  button.classList.toggle(
    "deck-list-reorder-selected",
    deckListReorderMode && deckListReorderSelection === deck.id,
  );
  button.addEventListener("click", () => {
    if (suppressNextDeckTileClick) {
      suppressNextDeckTileClick = false;
      if (deckListReorderMode && button.dataset.id !== deckListReorderSelection) {
        handleDeckListReorderClick(button);
      }
      return;
    }
    if (deckListReorderMode) {
      handleDeckListReorderClick(button);
      return;
    }
    openDeck(deck.id);
  });
  button.addEventListener("pointerdown", event => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    if (deckListReorderMode) return;
    endDeckListPress();
    deckListPressState = {
      button,
      startX: event.clientX,
      startY: event.clientY,
      timer: window.setTimeout(() => startDeckListReorderFromLongPress(button), 450),
    };
  });
  button.addEventListener("pointermove", event => {
    if (!deckListPressState || deckListPressState.button !== button) return;
    if (Math.hypot(
      event.clientX - deckListPressState.startX,
      event.clientY - deckListPressState.startY,
    ) > 18) {
      endDeckListPress();
    }
  });
  button.addEventListener("pointerup", endDeckListPress);
  button.addEventListener("pointercancel", endDeckListPress);
  button.addEventListener("lostpointercapture", endDeckListPress);
  button.addEventListener("contextmenu", event => event.preventDefault());
  button.addEventListener("dragstart", event => event.preventDefault());
}

function renderDecks() {
  renderDeckFormatFilter();
  if (!state.decks.length) {
    finishDeckListReorderMode();
    els.deckList.innerHTML = '<div class="empty">「新規デッキ」からデッキを作成できます</div>';
    return;
  }
  let migrated = false;
  const visibleDecks = state.deckFormatFilter ? state.decks.filter(deck => deck.format === state.deckFormatFilter) : state.decks;
  if (!visibleDecks.length) {
    finishDeckListReorderMode();
    els.deckList.innerHTML = `<div class="empty">${esc(state.deckFormatFilter)}のデッキはまだありません</div>`;
    return;
  }
  if (deckListReorderSelection && !visibleDecks.some(deck => deck.id === deckListReorderSelection)) {
    finishDeckListReorderMode();
  }
  els.deckList.innerHTML = visibleDecks.map(deck => {
    migrated = ensureDeckDates(deck) || migrated;
    const total = deck.entries.filter(entry => isDeckBuildSection(entry.section)).reduce((sum, entry) => sum + entry.quantity, 0);
    const missing = missingCount(deck);
    const memo = String(deck.memo || "").trim();
    const memoPreview = memo ? `<p class="deck-memo-preview">${esc(memo.slice(0, 90))}${memo.length > 90 ? "…" : ""}</p>` : "";
    const selected = deckListReorderMode && deckListReorderSelection === deck.id;
    return `<button type="button" class="deck-tile${selected ? " deck-list-reorder-selected" : ""}" data-id="${deck.id}"><span class="eyebrow">${esc(deck.format)}</span><h2>${esc(deck.name)}</h2><span class="deck-total">${total}</span> 枚<p>${deck.entries.length}種類${missing ? ` · <b>${missing}枚不足</b>` : " · 所持内で構築可能"}</p>${memoPreview}<small class="deck-date-line">作成 ${formatDeckDate(deck.createdAt)} · 更新 ${formatDeckDate(deck.updatedAt)}</small></button>`;
  }).join("");
  if (migrated) persist();
  els.deckList.querySelectorAll(".deck-tile").forEach(button => {
    const deck = state.decks.find(item => item.id === button.dataset.id);
    attachDeckTileHandlers(button, deck);
  });
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
  if (els.deckOwnedFavoritesOnly) els.deckOwnedFavoritesOnly.checked = false;
  els.deckGlobalSearch.value = "";
  els.deckGlobalSearchStatus.textContent = "未所持のカードもデッキに追加できます";
  state.deckSearchResults = [];
  state.deckMissingOpen = false;
  renderDeckEditor();
  els.deckDialog.showModal();
}

function deckCardSnapshot(card) {
  return {
    scryfallId: cardScryfallId(card), oracleId: card.oracleId || card.oracle_id || "",
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

function deckEntryMatchesCard(entry, card) {
  if (!entry || !card) return false;
  const entryCard = cardForDeckEntry(entry);
  if (entry.cardId && card.id && entry.cardId === card.id) return true;
  const entryScryfallId = entryCard?.scryfallId || "";
  const cardScryfallIdValue = card.scryfallId || cardScryfallId(card) || "";
  if (entryScryfallId && cardScryfallIdValue && entryScryfallId === cardScryfallIdValue) return true;
  const entryOracleId = entryCard?.oracleId || entryCard?.oracle_id || "";
  const cardOracleId = card.oracleId || card.oracle_id || "";
  if (entryOracleId && cardOracleId && entryOracleId === cardOracleId) return true;
  const entrySet = String(entryCard?.set || "").toUpperCase();
  const cardSet = String(card.set || "").toUpperCase();
  const entryNumber = String(entryCard?.collectorNumber || entryCard?.collector_number || "");
  const cardNumber = String(card.collectorNumber || card.collector_number || "");
  if (entrySet && cardSet && entryNumber && cardNumber && entrySet === cardSet && entryNumber === cardNumber) return true;
  return false;
}

function ownedQuantityForDeckCard(card) {
  if (!card) return 0;
  return state.collection
    .filter(item => deckEntryMatchesCard({ cardId: item.id, card: item }, card))
    .reduce((sum, item) => sum + Number(item.quantity || 0), 0);
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
  const statsOpen = state.deckStatsOpen === true;
  els.deckStats.hidden = false;
  els.deckStats.innerHTML = `<button type="button" class="deck-stats-title" aria-expanded="${statsOpen}">
      <span><b>デッキ統計</b><small>土地 ${stats.lands}枚 / 非土地 ${stats.nonlands}枚</small></span>
      <em>${statsOpen ? "▲" : "▼"}</em>
    </button>
    <div class="deck-stats-body" ${statsOpen ? "" : "hidden"}>
      <div class="deck-stat-summary">
        <span><b>${stats.total}</b>総枚数</span>
        <span><b>${stats.lands}</b>土地</span>
        <span><b>${stats.nonlands}</b>非土地</span>
      </div>
      <div class="deck-stat-grid">
        <section><h4>色分布</h4>${renderStatBars(stats.colors, maxColor, "color")}</section>
        <section><h4>マナカーブ</h4>${renderStatBars(stats.mana, maxMana, "mana")}</section>
        <section><h4>タイプ内訳</h4>${renderStatBars(stats.types, maxType, "type")}</section>
      </div>
    </div>`;
  els.deckStats.querySelector(".deck-stats-title")?.addEventListener("click", () => {
    state.deckStatsOpen = !statsOpen;
    renderDeckStats();
  });
}

function groupedOwnedDeckCards(query) {
  const groups = new Map();
  const color = els.deckOwnedColor.value;
  const mana = els.deckOwnedMana.value;
  const type = els.deckOwnedType.value;
  const favoriteGroupId = els.deckOwnedFavoriteGroup?.value || "";
  state.collection.filter(card => {
    const textMatch = [card.name, card.printedName, card.setName, card.typeLine, card.printedTypeLine].join(" ").toLowerCase().includes(query);
    const identity = card.colorIdentity || card.colors || [];
    const colorMatch = !color || (color === "C" ? identity.length === 0 : color === "M" ? identity.length > 1 : identity.includes(color));
    const manaValue = Number(card.manaValue || 0);
    const manaMatch = !mana || (mana === "7+" ? manaValue >= 7 : manaValue === Number(mana));
    const typeMatch = !type || String(card.typeLine || "").toLowerCase().includes(type.toLowerCase());
    const favoriteMatch = favoriteGroupMatch(card, favoriteGroupId);
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
  state.editingDeck.entries.forEach(entry => {
    if (deckEntryMatchesCard(entry, card) && counts[entry.section] != null) counts[entry.section] += Number(entry.quantity || 0);
  });
  return counts;
}

function updateDeckOwnedFilterSummary() {
  const chips = [];
  const colorText = els.deckOwnedColor.selectedOptions[0]?.textContent || "";
  const manaText = els.deckOwnedMana.selectedOptions[0]?.textContent || "";
  const typeText = els.deckOwnedType.selectedOptions[0]?.textContent || "";
  const favoriteGroupText = selectedOptionText(els.deckOwnedFavoriteGroup);
  if (els.deckOwnedColor.value) chips.push(`色:${colorText}`);
  if (els.deckOwnedMana.value) chips.push(`マナ:${manaText}`);
  if (els.deckOwnedType.value) chips.push(`タイプ:${typeText}`);
  if (favoriteGroupText) chips.push(`お気に入り:${favoriteGroupText}`);
  els.deckOwnedFilterSummary.textContent = chips.length ? `詳細条件：${chips.join("・")}` : "詳細条件：指定なし";
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
  const count = entries.reduce((sum, entry) => sum + Number(entry.quantity || 0), 0);
  const content = entries.length ? `
    <div class="deck-content-grid">
      ${entries.map(entry => {
        const card = cardForDeckEntry(entry);
        const missing = section === "maybe" ? 0 : missingQuantityForEntry(entry);
        const dragging = deckDragState?.dragging && deckDragState.cardId === entry.cardId && deckDragState.section === entry.section;
        const selected = deckReorderSelection?.cardId === entry.cardId && deckReorderSelection?.section === entry.section;
        const classes = ["deck-content-card", missing ? "missing-card" : "", dragging ? "deck-dragging-card" : "", deckReorderMode ? "deck-reorder-mode-card" : "", selected ? "deck-reorder-selected" : ""].filter(Boolean).join(" ");
        const cardName = card ? nameOf(card) : "削除済みカード";
        return `<button type="button" class="${classes}" draggable="false" data-card-id="${esc(entry.cardId)}" data-section="${esc(entry.section)}" aria-label="${esc(`${cardName} ${label} ${entry.quantity}枚を編集${missing ? `、${missing}枚不足` : ""}`)}"><img src="${esc(card?.image || "")}" alt="" loading="lazy" draggable="false"><span class="deck-card-quantity" aria-hidden="true">${entry.quantity}</span>${missing ? `<span class="deck-missing-badge">不足 ${missing}</span>` : ""}</button>`;
      }).join("")}
    </div>` : `<div class="deck-section-empty">${esc(emptyText || `${label}にカードがありません`)}</div>`;
  return `<section class="deck-section deck-section-${esc(section)}"><div class="deck-section-title"><span>${esc(label)}</span><b>${count}枚</b></div>${content}</section>`;
}

function reorderDeckEntryWithinSection(section, cardId, targetCardId) {
  if (!state.editingDeck || cardId === targetCardId) return false;
  const sections = deckDisplaySections();
  const sectionEntries = state.editingDeck.entries.filter(entry => entry.section === section);
  const fromIndex = sectionEntries.findIndex(entry => entry.cardId === cardId);
  const targetIndex = sectionEntries.findIndex(entry => entry.cardId === targetCardId);
  if (fromIndex < 0 || targetIndex < 0 || fromIndex === targetIndex) return false;
  const [dragged] = sectionEntries.splice(fromIndex, 1);
  sectionEntries.splice(targetIndex, 0, dragged);
  const bySection = new Map();
  sections.forEach(item => bySection.set(item, state.editingDeck.entries.filter(entry => entry.section === item)));
  bySection.set(section, sectionEntries);
  const extras = state.editingDeck.entries.filter(entry => !sections.includes(entry.section));
  state.editingDeck.entries = sections.flatMap(item => bySection.get(item) || []).concat(extras);
  return true;
}

function endDeckDrag() {
  if (deckDragState?.timer) clearTimeout(deckDragState.timer);
  if (deckDragState?.dragging) {
    suppressNextDeckCardClick = true;
    window.setTimeout(() => { suppressNextDeckCardClick = false; }, 350);
  }
  deckDragState = null;
  document.body.classList.remove("deck-dragging");
  document.removeEventListener("pointermove", handleDeckDragMove);
  document.removeEventListener("pointerup", endDeckDrag);
  document.removeEventListener("pointercancel", endDeckDrag);
}

function handleDeckDragMove(event) {
  if (!deckDragState) return;
  const dx = event.clientX - deckDragState.startX;
  const dy = event.clientY - deckDragState.startY;
  if (!deckDragState.dragging) {
    if (Math.hypot(dx, dy) > 18) endDeckDrag();
    return;
  }
  event.preventDefault();
  const target = document.elementFromPoint(event.clientX, event.clientY)?.closest(".deck-content-card");
  if (!target || !els.deckCards.contains(target)) return;
  if (target.dataset.section !== deckDragState.section || target.dataset.cardId === deckDragState.cardId) return;
  if (!reorderDeckEntryWithinSection(deckDragState.section, deckDragState.cardId, target.dataset.cardId)) return;
  autoSaveEditingDeck();
  renderDeckEditor();
}

function startDeckDrag(button, event) {
  if (!deckDragState || deckDragState.button !== button) return;
  deckDragState.dragging = true;
  document.body.classList.add("deck-dragging");
  button.classList.add("deck-dragging-card");
  button.setPointerCapture?.(event.pointerId);
  showToast("カードを動かして並び替え");
  document.addEventListener("pointermove", handleDeckDragMove, { passive: false });
  document.addEventListener("pointerup", endDeckDrag, { once: true });
  document.addEventListener("pointercancel", endDeckDrag, { once: true });
}

function attachDeckContentCardHandlers(button) {
  button.addEventListener("click", () => {
    if (suppressNextDeckCardClick) {
      suppressNextDeckCardClick = false;
      return;
    }
    openDeckEntryEditor(button.dataset.cardId, button.dataset.section);
  });
  button.addEventListener("pointerdown", event => {
    if (event.button && event.button !== 0) return;
    endDeckDrag();
    button.setPointerCapture?.(event.pointerId);
    deckDragState = {
      button,
      cardId: button.dataset.cardId,
      section: button.dataset.section,
      startX: event.clientX,
      startY: event.clientY,
      pointerId: event.pointerId,
      dragging: false,
      timer: window.setTimeout(() => startDeckDrag(button, event), 300),
    };
  });
  button.addEventListener("pointermove", event => {
    if (deckDragState && !deckDragState.dragging) handleDeckDragMove(event);
  });
  button.addEventListener("pointerup", endDeckDrag);
  button.addEventListener("pointercancel", endDeckDrag);
  button.addEventListener("lostpointercapture", () => {
    if (!deckDragState?.dragging) endDeckDrag();
  });
  button.addEventListener("contextmenu", event => {
    if (!deckDragState?.dragging) return;
    event.preventDefault();
  });
  button.addEventListener("dragstart", event => {
    deckDragState = {
      button,
      cardId: button.dataset.cardId,
      section: button.dataset.section,
      startX: event.clientX,
      startY: event.clientY,
      pointerId: null,
      dragging: true,
      timer: null,
    };
    suppressNextDeckCardClick = true;
    document.body.classList.add("deck-dragging");
    button.classList.add("deck-dragging-card");
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", `${button.dataset.section}:${button.dataset.cardId}`);
  });
  button.addEventListener("dragover", event => {
    if (!deckDragState?.dragging) return;
    if (button.dataset.section !== deckDragState.section || button.dataset.cardId === deckDragState.cardId) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  });
  button.addEventListener("drop", event => {
    if (!deckDragState?.dragging) return;
    event.preventDefault();
    if (button.dataset.section !== deckDragState.section || button.dataset.cardId === deckDragState.cardId) return;
    if (reorderDeckEntryWithinSection(deckDragState.section, deckDragState.cardId, button.dataset.cardId)) {
      autoSaveEditingDeck();
      renderDeckEditor();
    }
    endDeckDrag();
  });
  button.addEventListener("dragend", endDeckDrag);
}

function updateDeckReorderButton() {
  if (!els.reorderDeckCards) return;
  els.reorderDeckCards.classList.toggle("active", deckReorderMode);
  els.reorderDeckCards.textContent = deckReorderMode ? "並び替え中" : "並び替え";
}

function endDeckDrag() {
  if (deckDragState?.timer) clearTimeout(deckDragState.timer);
  deckDragState = null;
  document.body.classList.remove("deck-dragging");
}

function clearDeckReorderSelection() {
  deckReorderSelection = null;
  document.activeElement?.blur?.();
}

function finishDeckReorderMode() {
  deckReorderMode = false;
  clearDeckReorderSelection();
  updateDeckReorderButton();
}

function setDeckReorderMode(enabled, selection = null) {
  endDeckDrag();
  deckReorderMode = enabled;
  deckReorderSelection = selection;
  updateDeckReorderButton();
  renderDeckEditor();
  showToast(enabled ? (selection ? "移動先のカードを選んでください" : "並び替えモードです") : "並び替えモードを終了しました");
}

function handleDeckReorderClick(button) {
  const cardId = button.dataset.cardId;
  const section = button.dataset.section;
  if (!deckReorderSelection) {
    deckReorderSelection = { cardId, section };
    showToast("移動先のカードを選んでください");
    renderDeckEditor();
    return;
  }
  if (deckReorderSelection.cardId === cardId && deckReorderSelection.section === section) {
    finishDeckReorderMode();
    showToast("選択を解除しました");
    renderDeckEditor();
    return;
  }
  if (deckReorderSelection.section !== section) {
    deckReorderSelection = { cardId, section };
    showToast("同じ区分内で移動先を選んでください");
    renderDeckEditor();
    return;
  }
  if (reorderDeckEntryWithinSection(section, deckReorderSelection.cardId, cardId)) {
    autoSaveEditingDeck();
    finishDeckReorderMode();
    showToast("並び替えました");
    renderDeckEditor();
  }
}

function startDeckReorderFromLongPress(button) {
  if (!deckDragState || deckDragState.button !== button) return;
  setDeckReorderMode(true, { cardId: button.dataset.cardId, section: button.dataset.section });
}

function attachDeckContentCardHandlers(button) {
  button.addEventListener("click", () => {
    document.activeElement?.blur?.();
    if (deckReorderMode) {
      handleDeckReorderClick(button);
      return;
    }
    if (suppressNextDeckCardClick) {
      suppressNextDeckCardClick = false;
      return;
    }
    openDeckEntryEditor(button.dataset.cardId, button.dataset.section);
  });
  button.addEventListener("pointerdown", event => {
    if (event.button && event.button !== 0) return;
    if (deckReorderMode) return;
    endDeckDrag();
    deckDragState = {
      button,
      startX: event.clientX,
      startY: event.clientY,
      timer: window.setTimeout(() => startDeckReorderFromLongPress(button), 450),
    };
  });
  button.addEventListener("pointermove", event => {
    if (!deckDragState) return;
    const dx = event.clientX - deckDragState.startX;
    const dy = event.clientY - deckDragState.startY;
    if (Math.hypot(dx, dy) > 18) endDeckDrag();
  });
  button.addEventListener("pointerup", endDeckDrag);
  button.addEventListener("pointercancel", endDeckDrag);
  button.addEventListener("contextmenu", event => event.preventDefault());
  button.addEventListener("dragstart", event => event.preventDefault());
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

function renderOneScreenCard(entry, compact = false) {
  const card = cardForDeckEntry(entry);
  const qty = Math.max(1, Number(entry.quantity || 1));
  const layers = Array.from({ length: Math.min(qty, compact ? 4 : 4) }, (_, index) => {
    const src = imageOf(card) || card?.image || "";
    return `<img src="${esc(src)}" alt="${esc(card ? nameOf(card) : "")}" loading="lazy" style="--i:${index}">`;
  }).join("");
  return `<div class="one-screen-card" title="${esc(card ? nameOf(card) : "")} ×${qty}">
    <div class="one-screen-stack">${layers}</div>
    <span class="one-screen-qty">×${qty}</span>
  </div>`;
}

function oneScreenOrderedEntries(entries) {
  const typeOrder = ["creature", "instant", "sorcery", "artifact", "enchantment", "planeswalker", "battle", "land", "other"];
  return [...entries].sort((a, b) => {
    const aIndex = typeOrder.indexOf(deckVisualTypeGroup(cardForDeckEntry(a)).key);
    const bIndex = typeOrder.indexOf(deckVisualTypeGroup(cardForDeckEntry(b)).key);
    if (aIndex !== bIndex) return aIndex - bIndex;
    return String(nameOf(cardForDeckEntry(a))).localeCompare(String(nameOf(cardForDeckEntry(b))), "ja");
  });
}

function renderOneScreenGrid(entries, compact = false) {
  return `<div class="one-screen-grid">${oneScreenOrderedEntries(entries).map(entry => renderOneScreenCard(entry, compact)).join("")}</div>`;
}

function renderOneScreenPanel(title, entries, className = "", compact = false) {
  const total = entries.reduce((sum, entry) => sum + Number(entry.quantity || 0), 0);
  return `<section class="one-screen-panel ${className}">
    <div class="one-screen-panel-title"><span>${esc(title)}</span><b>${total}</b></div>
    ${entries.length ? renderOneScreenGrid(entries, compact) : '<div class="deck-section-empty">カードがありません</div>'}
  </section>`;
}

function renderDeckOneScreenVisualView() {
  const deck = state.editingDeck;
  if (!deck) return;
  const mainEntries = deck.entries.filter(entry => entry.section === "main");
  const sideEntries = deck.entries.filter(entry => entry.section === "side");
  const commanderEntries = deck.entries.filter(entry => entry.section === "commander");
  const total = deck.entries.filter(entry => isDeckBuildSection(entry.section)).reduce((sum, entry) => sum + Number(entry.quantity || 0), 0);
  els.deckOneScreenTitle.textContent = deck.name || "一画面表示";
  els.deckOneScreenSummary.textContent = `${deck.format}・${total}枚`;
  const mainContent = [
    isCommanderDeck() && commanderEntries.length ? renderOneScreenPanel("Commander", commanderEntries, "one-screen-commander") : "",
    renderOneScreenPanel("Main", mainEntries, "one-screen-main"),
  ].join("");
  els.deckOneScreenBoard.innerHTML = `
    <div class="one-screen-left">${mainContent}</div>
    <div class="one-screen-right">${renderOneScreenPanel("Sideboard", sideEntries, "one-screen-side", true)}</div>
  `;
}

function openDeckOneScreenVisualView() {
  renderDeckOneScreenVisualView();
  els.deckOneScreenVisualDialog.showModal();
}

function deckVisualExportSections(deck = state.editingDeck) {
  if (!deck) return [];
  const sections = [];
  const commanderEntries = deck.entries.filter(entry => entry.section === "commander");
  const mainEntries = deck.entries.filter(entry => entry.section === "main");
  const sideEntries = deck.entries.filter(entry => entry.section === "side");
  if (isCommanderDeck(deck) && commanderEntries.length) sections.push({ title: "Commander", entries: commanderEntries });
  sections.push({ title: "Main", entries: mainEntries });
  if (sideEntries.length) sections.push({ title: "Sideboard", entries: sideEntries });
  return sections;
}

function sanitizeDownloadName(name) {
  return String(name || "deck").replace(/[\\/:*?"<>|]/g, "_").replace(/\s+/g, "_").slice(0, 80) || "deck";
}

function loadCanvasImage(src) {
  return new Promise(resolve => {
    if (!src) return resolve(null);
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.referrerPolicy = "no-referrer";
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

async function canvasSafeImageSource(src) {
  if (!src) return "";
  if (src.startsWith("data:") || src.startsWith("blob:")) return src;
  try {
    const response = await fetch(src, { mode: "cors", cache: "force-cache" });
    if (!response.ok) throw new Error(`image fetch failed: ${response.status}`);
    const blob = await response.blob();
    return await new Promise(resolve => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () => resolve("");
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.warn("Visual export image fetch failed", src, error);
    return src;
  }
}

function roundRect(ctx, x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function wrapCanvasText(ctx, text, x, y, maxWidth, lineHeight, maxLines = 2) {
  const chars = String(text || "").split("");
  const lines = [];
  let line = "";
  chars.forEach(ch => {
    const next = line + ch;
    if (ctx.measureText(next).width > maxWidth && line) {
      lines.push(line);
      line = ch;
    } else {
      line = next;
    }
  });
  if (line) lines.push(line);
  lines.slice(0, maxLines).forEach((part, index) => ctx.fillText(part, x, y + index * lineHeight));
}

function downloadTextFile(content, fileName, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function deckVisualSvgText(deck, sectionLayouts, canvasW, canvasH, cardW, cardH, gap, margin, titleH, typeHeadH, captionH) {
  const total = deck.entries.filter(entry => isDeckBuildSection(entry.section)).reduce((sum, entry) => sum + Number(entry.quantity || 0), 0);
  const parts = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${canvasW}" height="${canvasH}" viewBox="0 0 ${canvasW} ${canvasH}">`,
    `<rect width="100%" height="100%" fill="#f7f3ea"/>`,
    `<linearGradient id="head" x1="0" x2="1"><stop offset="0" stop-color="#123f35"/><stop offset="1" stop-color="#d6b254"/></linearGradient>`,
    `<rect width="${canvasW}" height="${titleH + 22}" fill="url(#head)"/>`,
    `<text x="${margin}" y="62" fill="#fff" font-family="Segoe UI, Yu Gothic, sans-serif" font-size="42" font-weight="700">${esc(deck.name || "MTG Pocket Library Deck")}</text>`,
    `<text x="${margin}" y="94" fill="#fff" font-family="Segoe UI, Yu Gothic, sans-serif" font-size="22" font-weight="600">${esc(deck.format || "")} / ${total} cards</text>`,
  ];
  sectionLayouts.forEach(section => {
    parts.push(`<rect x="${margin - 18}" y="${section.y}" width="${canvasW - margin * 2 + 36}" height="${section.height}" rx="24" fill="#fff"/>`);
    const sectionTotal = section.entries.reduce((sum, entry) => sum + Number(entry.quantity || 0), 0);
    parts.push(`<text x="${margin}" y="${section.y + 34}" fill="#123f35" font-family="Segoe UI, Yu Gothic, sans-serif" font-size="30" font-weight="800">${esc(section.title)} ${sectionTotal}</text>`);
    let y = section.y + 46;
    section.groupLayouts.forEach(group => {
      const groupTotal = group.entries.reduce((sum, entry) => sum + Number(entry.quantity || 0), 0);
      parts.push(`<rect x="${margin - 4}" y="${y}" width="${canvasW - margin * 2 + 8}" height="34" rx="12" fill="#e9f1ed"/>`);
      parts.push(`<text x="${margin + 10}" y="${y + 23}" fill="#123f35" font-family="Segoe UI, Yu Gothic, sans-serif" font-size="20" font-weight="800">${esc(group.label)} ${groupTotal}</text>`);
      y += typeHeadH + 12;
      group.entries.forEach((entry, index) => {
        const col = index % Math.max(1, Math.floor((canvasW - margin * 2 + gap) / (cardW + gap)));
        const row = Math.floor(index / Math.max(1, Math.floor((canvasW - margin * 2 + gap) / (cardW + gap))));
        const x = margin + col * (cardW + gap);
        const cardY = y + row * (cardH + captionH + gap);
        const card = cardForDeckEntry(entry);
        const src = card?.image || imageOf(card);
        parts.push(`<rect x="${x}" y="${cardY}" width="${cardW}" height="${cardH}" rx="12" fill="#d9dedb"/>`);
        if (src) parts.push(`<image href="${esc(src)}" x="${x}" y="${cardY}" width="${cardW}" height="${cardH}" preserveAspectRatio="xMidYMid slice"/>`);
        parts.push(`<rect x="${x}" y="${cardY}" width="${cardW}" height="${cardH}" rx="12" fill="none" stroke="#fff" stroke-width="4"/>`);
        parts.push(`<rect x="${x + 8}" y="${cardY + 8}" width="48" height="34" rx="17" fill="#123f35"/>`);
        parts.push(`<text x="${x + 32}" y="${cardY + 31}" text-anchor="middle" fill="#fff" font-family="Segoe UI, Yu Gothic, sans-serif" font-size="18" font-weight="800">×${Number(entry.quantity || 0)}</text>`);
        const title = esc(nameOf(card));
        parts.push(`<text x="${x}" y="${cardY + cardH + 24}" fill="#1e2926" font-family="Segoe UI, Yu Gothic, sans-serif" font-size="19" font-weight="700">${title.length > 24 ? `${title.slice(0, 24)}...` : title}</text>`);
      });
      y += group.rows * (cardH + captionH + gap) + 10;
    });
  });
  parts.push("</svg>");
  return parts.join("");
}

async function downloadDeckVisualImage() {
  const deck = state.editingDeck;
  if (!deck) return;
  const button = els.downloadDeckVisual;
  const originalText = button?.textContent || "";
  if (button) { button.disabled = true; button.textContent = "作成中..."; }
  try {
    const sections = deckVisualExportSections(deck);
    const typeOrder = ["creature", "instant", "sorcery", "artifact", "enchantment", "planeswalker", "battle", "land", "other"];
    const cardW = 220;
    const cardH = Math.round(cardW * 680 / 488);
    const gap = 28;
    const margin = 52;
    const titleH = 96;
    const sectionHeadH = 46;
    const typeHeadH = 30;
    const captionH = 50;
    const canvasW = 1800;
    const columns = Math.max(1, Math.floor((canvasW - margin * 2 + gap) / (cardW + gap)));
    const imageCache = new Map();
    const sectionLayouts = [];
    let canvasH = margin + titleH;
    sections.forEach(section => {
      const groups = new Map();
      section.entries.forEach(entry => {
        const card = cardForDeckEntry(entry);
        const group = deckVisualTypeGroup(card);
        if (!groups.has(group.key)) groups.set(group.key, { label: group.label, entries: [] });
        groups.get(group.key).entries.push(entry);
      });
      const groupLayouts = typeOrder.filter(key => groups.has(key)).map(key => {
        const group = groups.get(key);
        const rows = Math.ceil(group.entries.length / columns) || 1;
        const height = typeHeadH + rows * (cardH + captionH + gap) + 12;
        return { ...group, key, rows, height };
      });
      const height = sectionHeadH + groupLayouts.reduce((sum, group) => sum + group.height, 0) + 32;
      sectionLayouts.push({ ...section, groupLayouts, y: canvasH, height });
      canvasH += height + 30;
    });
    canvasH = Math.max(900, canvasH + margin);
    const svgText = deckVisualSvgText(deck, sectionLayouts, canvasW, canvasH, cardW, cardH, gap, margin, titleH, typeHeadH, captionH);
    showToast("Visual View画像を作成中です");
    const allCards = sections.flatMap(section => section.entries.map(entry => cardForDeckEntry(entry))).filter(Boolean);
    let failedImageCount = 0;
    await Promise.all(allCards.map(async card => {
      const src = card?.image || imageOf(card);
      if (!src) { failedImageCount += 1; return; }
      if (imageCache.has(src)) return;
      const safeSrc = await canvasSafeImageSource(src);
      const img = await loadCanvasImage(safeSrc);
      if (!img) failedImageCount += 1;
      imageCache.set(src, img);
    }));
    if (failedImageCount > 0) {
      downloadTextFile(svgText, `${sanitizeDownloadName(deck.name)}-visual.svg`, "image/svg+xml;charset=utf-8");
      showToast("PNG用の画像取得に失敗したためSVGで保存しました");
      return;
    }
    const canvas = document.createElement("canvas");
    canvas.width = canvasW;
    canvas.height = canvasH;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#f7f3ea";
    ctx.fillRect(0, 0, canvasW, canvasH);
    const bg = ctx.createLinearGradient(0, 0, canvasW, 0);
    bg.addColorStop(0, "#123f35");
    bg.addColorStop(1, "#d6b254");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, canvasW, titleH + 22);
    ctx.fillStyle = "#fff";
    ctx.font = "700 42px 'Segoe UI','Yu Gothic',sans-serif";
    ctx.fillText(deck.name || "MTG Pocket Library Deck", margin, 62);
    const total = deck.entries.filter(entry => isDeckBuildSection(entry.section)).reduce((sum, entry) => sum + Number(entry.quantity || 0), 0);
    ctx.font = "600 22px 'Segoe UI','Yu Gothic',sans-serif";
    ctx.fillText(`${deck.format || ""} / ${total} cards`, margin, 94);
    sectionLayouts.forEach(section => {
      ctx.fillStyle = "#ffffff";
      roundRect(ctx, margin - 18, section.y, canvasW - margin * 2 + 36, section.height, 24);
      ctx.fill();
      ctx.fillStyle = "#123f35";
      ctx.font = "800 30px 'Segoe UI','Yu Gothic',sans-serif";
      const sectionTotal = section.entries.reduce((sum, entry) => sum + Number(entry.quantity || 0), 0);
      ctx.fillText(`${section.title}  ${sectionTotal}`, margin, section.y + 34);
      let y = section.y + sectionHeadH;
      section.groupLayouts.forEach(group => {
        ctx.fillStyle = "#e9f1ed";
        roundRect(ctx, margin - 4, y, canvasW - margin * 2 + 8, 34, 12);
        ctx.fill();
        ctx.fillStyle = "#123f35";
        ctx.font = "800 20px 'Segoe UI','Yu Gothic',sans-serif";
        const groupTotal = group.entries.reduce((sum, entry) => sum + Number(entry.quantity || 0), 0);
        ctx.fillText(`${group.label}  ${groupTotal}`, margin + 10, y + 23);
        y += typeHeadH + 12;
        group.entries.forEach((entry, index) => {
          const col = index % columns;
          const row = Math.floor(index / columns);
          const x = margin + col * (cardW + gap);
          const cardY = y + row * (cardH + captionH + gap);
          const card = cardForDeckEntry(entry);
          const src = card?.image || imageOf(card);
          const img = imageCache.get(src);
          ctx.fillStyle = "#d9dedb";
          roundRect(ctx, x, cardY, cardW, cardH, 12);
          ctx.fill();
          if (img) {
            ctx.save();
            roundRect(ctx, x, cardY, cardW, cardH, 12);
            ctx.clip();
            ctx.drawImage(img, x, cardY, cardW, cardH);
            ctx.restore();
          }
          ctx.strokeStyle = "#ffffff";
          ctx.lineWidth = 4;
          roundRect(ctx, x, cardY, cardW, cardH, 12);
          ctx.stroke();
          ctx.fillStyle = "#123f35";
          roundRect(ctx, x + 8, cardY + 8, 44, 34, 17);
          ctx.fill();
          ctx.fillStyle = "#fff";
          ctx.font = "800 18px 'Segoe UI','Yu Gothic',sans-serif";
          ctx.textAlign = "center";
          ctx.fillText(`×${Number(entry.quantity || 0)}`, x + 30, cardY + 31);
          ctx.textAlign = "left";
          ctx.fillStyle = "#1e2926";
          ctx.font = "700 19px 'Segoe UI','Yu Gothic',sans-serif";
          wrapCanvasText(ctx, nameOf(card), x, cardY + cardH + 24, cardW, 23, 2);
        });
        y += group.rows * (cardH + captionH + gap) + 10;
      });
    });
    canvas.toBlob(blob => {
      if (!blob) {
        alert("画像の作成に失敗しました。カード画像の読み込み制限が原因の可能性があります。");
        return;
      }
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${sanitizeDownloadName(deck.name)}-visual.png`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      showToast("Visual View画像を保存しました");
    }, "image/png");
  } catch (error) {
    console.error(error);
    alert("画像の作成に失敗しました。カード画像の取得制限が原因の可能性があります。");
  } finally {
    if (button) { button.disabled = false; button.textContent = originalText || "画像保存"; }
  }
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
  updateDeckReorderButton();

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
    attachDeckContentCardHandlers(button);
  });
  if (els.deckVisualDialog.open) renderDeckVisualView();
  if (els.deckOneScreenVisualDialog?.open) renderDeckOneScreenVisualView();
}

function renderDeckOwnedAddDialog() {
  const keepScroll = els.deckOwnedAddDialog.open;
  const dialogForm = els.deckOwnedAddDialog.querySelector(".deck-add-dialog");
  const dialogScrollTop = keepScroll && dialogForm ? dialogForm.scrollTop : 0;
  if (keepScroll && els.deckCandidates.contains(document.activeElement)) document.activeElement.blur();
  const query = els.deckCardFilter.value.trim().toLowerCase();
  const candidates = groupedOwnedDeckCards(query);
  updateDeckOwnedFilterSummary();
  els.deckCandidates.innerHTML = candidates.length ? candidates.map(({ card }) => deckOwnedChoiceButton(card)).join("") : '<span class="deck-search-empty">追加できる所持カードがありません</span>';
  els.deckCandidates.querySelectorAll("[data-owned-add-section]").forEach(button => {
    button.addEventListener("click", () => addOwnedToDeck(button.dataset.id, button.dataset.ownedAddSection));
  });
  els.deckCandidates.querySelectorAll(".deck-owned-choice").forEach(button => {
    button.addEventListener("click", () => openOwnedDeckCardEditor(button.dataset.id));
  });
  if (keepScroll) requestAnimationFrame(() => {
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
  els.deckOwnedAdvancedPanel.hidden = true;
  els.openDeckOwnedAdvanced.setAttribute("aria-expanded", "false");
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
  const exact = state.editingDeck.entries.find(entry => entry.cardId === state.editingDeckEntry.cardId && entry.section === state.editingDeckEntry.section);
  if (exact) return exact;
  const reference = deckEntryReferenceCard();
  return state.editingDeck.entries.find(entry => entry.section === state.editingDeckEntry.section && deckEntryMatchesCard(entry, reference)) || null;
}

function deckEntriesForCurrentCard() {
  if (!state.editingDeckEntry) return [];
  const reference = deckEntryReferenceCard();
  return state.editingDeck.entries.filter(entry => entry.cardId === state.editingDeckEntry.cardId || deckEntryMatchesCard(entry, reference));
}

function deckEntryReferenceCard() {
  if (!state.editingDeckEntry) return null;
  const exact = state.editingDeck.entries.find(entry => entry.cardId === state.editingDeckEntry.cardId);
  if (exact) return cardForDeckEntry(exact);
  return state.editingDeckEntry.draftCard || state.collection.find(card => card.id === state.editingDeckEntry.cardId) || null;
}

function deckEntryForCurrentCardSection(section) {
  return deckEntriesForCurrentCard().find(entry => entry.section === section) || null;
}

function currentDeckCardTemplate() {
  const entry = currentDeckEntry() || deckEntriesForCurrentCard()[0];
  if (entry) return { cardId: entry.cardId, card: entry.card || cardForDeckEntry(entry) };
  if (state.editingDeckEntry?.draftCard) return { cardId: state.editingDeckEntry.cardId, card: state.editingDeckEntry.draftCard };
  return null;
}

function openDeckEntryEditor(cardId, section) {
  state.editingDeckEntry = { cardId, section };
  renderDeckEntryEditor();
  els.deckEntryDialog.showModal();
}

function openOwnedDeckCardEditor(cardId) {
  const owned = state.collection.find(card => card.id === cardId);
  const existing = owned ? state.editingDeck.entries.find(entry => deckEntryMatchesCard(entry, owned)) : state.editingDeck.entries.find(entry => entry.cardId === cardId);
  if (!existing && !owned) return;
  state.editingDeckEntry = existing
    ? { cardId: existing.cardId, section: existing.section }
    : { cardId, section: "main", draftCard: deckCardSnapshot(owned) };
  if (els.deckOwnedAddDialog.open) els.deckOwnedAddDialog.close();
  renderDeckEntryEditor();
  els.deckEntryDialog.showModal();
}

function deckEntryCurrentCard() {
  const entry = currentDeckEntry() || deckEntriesForCurrentCard()[0];
  return entry ? cardForDeckEntry(entry) : state.editingDeckEntry?.draftCard || null;
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
  const template = currentDeckCardTemplate();
  if (!entry && !template) { els.deckEntryDialog.close(); return; }
  if (entry) state.editingDeckEntry = { cardId: entry.cardId, section: entry.section };
  const card = entry ? cardForDeckEntry(entry) : template.card;
  const owned = entry ? ownedQuantityForEntry(entry) : ownedQuantityForDeckCard(card);
  const deckTotalForCard = deckEntriesForCurrentCard().filter(item => isDeckBuildSection(item.section)).reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  els.deckEntryImage.src = card?.image || "";
  els.deckEntryImage.alt = card ? nameOf(card) : "削除済みカード";
  els.deckEntrySet.textContent = `${card?.set || ""} #${card?.collectorNumber || ""}`;
  els.deckEntryName.textContent = card ? nameOf(card) : "削除済みカード";
  els.deckEntryOwned.textContent = `所持 ${owned}枚・デッキ ${deckTotalForCard}枚${deckTotalForCard > owned ? `・${deckTotalForCard - owned}枚不足` : "・不足なし"}`;
  syncCommanderOptions();
  els.deckEntrySection.value = entry?.section || state.editingDeckEntry?.section || "main";
  els.deckEntryQuantity.value = entry?.quantity || 1;
  els.mainDeckEntryQuantity.value = deckEntryForCurrentCardSection("main")?.quantity || 0;
  els.sideDeckEntryQuantity.value = deckEntryForCurrentCardSection("side")?.quantity || 0;
  els.commanderDeckEntryQuantity.value = deckEntryForCurrentCardSection("commander")?.quantity || 0;
  els.maybeDeckEntryQuantity.value = deckEntryForCurrentCardSection("maybe")?.quantity || 0;
  const commanderRow = document.querySelector('[data-section-row="commander"]');
  if (commanderRow) commanderRow.hidden = !isCommanderDeck();
  const sectionEntries = entry ? state.editingDeck.entries.filter(item => item.section === entry.section) : [];
  const sectionIndex = entry ? sectionEntries.findIndex(item => item === entry) : -1;
  els.moveDeckEntryUp.disabled = sectionIndex <= 0;
  els.moveDeckEntryDown.disabled = sectionIndex < 0 || sectionIndex >= sectionEntries.length - 1;
}

function collectionLanguageForDeckCard(card) {
  if (card?.language) return card.language;
  if (card?.lang) return card.lang;
  return isJapanese(card?.printedName || card?.jpName || "") ? "ja" : "en";
}

function collectionCardFromDeckCard(card) {
  const language = collectionLanguageForDeckCard(card);
  return {
    id: uid(),
    scryfallId: card.scryfallId || card.id || "",
    oracleId: card.oracleId || card.oracle_id || "",
    name: card.name || card.printedName || "",
    printedName: card.printedName || card.printed_name || nameOf(card),
    set: (card.set || "").toUpperCase(),
    setName: card.setName || card.set_name || "",
    collectorNumber: card.collectorNumber || card.collector_number || "",
    typeLine: card.typeLine || card.type_line || "",
    printedTypeLine: card.printedTypeLine || card.printed_type_line || "",
    image: imageOf(card),
    manaCost: card.manaCost || card.mana_cost || "",
    manaValue: Number(card.manaValue ?? card.cmc ?? 0),
    colors: card.colors || [],
    colorIdentity: card.colorIdentity || card.color_identity || card.colors || [],
    metadataVersion: 1,
    priceUsd: card.priceUsd || card.prices?.usd || null,
    priceUsdFoil: card.priceUsdFoil || card.prices?.usd_foil || null,
    priceUsdEtched: card.priceUsdEtched || card.prices?.usd_etched || null,
    priceUsdSource: card.priceUsdSource || (card.prices?.usd ? "scryfall" : ""),
    priceUsdFoilSource: card.priceUsdFoilSource || (card.prices?.usd_foil ? "scryfall" : ""),
    priceUsdEtchedSource: card.priceUsdEtchedSource || (card.prices?.usd_etched ? "scryfall" : ""),
    priceUsdFromEnglish: Boolean(card.priceUsdFromEnglish),
    priceUsdFoilFromEnglish: Boolean(card.priceUsdFoilFromEnglish),
    priceUsdEtchedFromEnglish: Boolean(card.priceUsdEtchedFromEnglish),
    priceUpdatedAt: card.priceUpdatedAt || Date.now(),
    quantity: 1,
    condition: "NM",
    finish: "normal",
    language,
    location: "",
    favorite: false,
    favoriteGroupIds: [],
    addedAt: Date.now(),
  };
}

function addCurrentDeckEntryToCollection() {
  const entry = currentDeckEntry() || deckEntriesForCurrentCard()[0];
  if (!entry) return;
  const card = cardForDeckEntry(entry);
  if (!card) return;
  const incoming = collectionCardFromDeckCard(card);
  const exactEntryLot = state.collection.find(item => item.id === entry.cardId);
  const matchingLot = exactEntryLot || state.collection.find(item =>
    incoming.scryfallId
      ? item.scryfallId === incoming.scryfallId && item.condition === incoming.condition && item.finish === incoming.finish && item.language === incoming.language && !item.location
      : item.name === incoming.name && item.printedName === incoming.printedName && item.set === incoming.set && item.collectorNumber === incoming.collectorNumber && item.condition === incoming.condition && item.finish === incoming.finish && item.language === incoming.language && !item.location
  );
  const lot = matchingLot || incoming;
  if (matchingLot) {
    matchingLot.quantity = Number(matchingLot.quantity || 0) + 1;
  } else {
    state.collection.unshift(incoming);
  }
  if (!incoming.scryfallId && entry.cardId !== lot.id) {
    state.editingDeck.entries.forEach(item => {
      if (item.cardId === entry.cardId) item.cardId = lot.id;
    });
    state.editingDeckEntry = { cardId: lot.id, section: entry.section };
  }
  persist();
  renderCollection();
  renderDeckEditor();
  renderDeckEntryEditor();
  hydrateEnglishPriceFallbacks();
  showInlineStatus(els.deckEntryCollectionStatus, `${nameOf(card)}を所持カードに1枚追加しました`);
  showToast("所持カードに1枚追加しました");
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
  state.editingDeckEntry = active ? { cardId: template.cardId, section: active.section } : { cardId: template.cardId, section, draftCard: template.card };
  autoSaveEditingDeck();
  renderDeckEditor();
  renderDeckEntryEditor();
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
  addDeckEntry(`scryfall-${cardScryfallId(card)}`, deckCardSnapshot(card), section);
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
    favoriteGroups: state.favoriteGroups,
    settings: { backgroundTheme: state.backgroundTheme },
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
    state.favoriteGroups = Array.isArray(data.favoriteGroups) ? data.favoriteGroups : [];
    if (data.settings?.backgroundTheme && BACKGROUND_THEMES[data.settings.backgroundTheme]) {
      applyBackgroundTheme(data.settings.backgroundTheme, { persist: true });
    }
    normalizeFavoriteGroups();
    renderFavoriteGroupOptions();
    persist(); renderCollection(); renderDecks(); renderBackupSummary(); showToast("バックアップを復元しました");
  } catch { showToast("正しいバックアップファイルではありません"); }
  els.importInput.value = "";
}

document.querySelectorAll(".bottom-nav button").forEach(button => button.addEventListener("click", () => showView(button.dataset.view)));
document.addEventListener("contextmenu", event => {
  if (event.target?.closest?.(".deck-content-card, .collection-image-card, .collection-card-open")) {
    event.preventDefault();
  }
}, { capture: true });
renderFavoriteGroupOptions();
initAdvancedSearchUi();
els.deckSearchSetIncludeExtras?.closest("label")?.remove();
els.searchButton.addEventListener("click", searchCards);
els.clearSearchResults?.addEventListener("click", clearSearchResults);
els.cardSearch.addEventListener("keydown", event => { if (event.key === "Enter") searchCards(); });
els.searchSet.addEventListener("keydown", event => { if (event.key === "Enter") searchCards(); });
els.ocrCameraInput?.addEventListener("change", async event => {
  if (event.target.disabled) return;
  await readCardNameFromImage(event.target.files?.[0]);
  event.target.value = "";
});
els.ocrFileInput?.addEventListener("change", async event => {
  if (event.target.disabled) return;
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
els.openCollectionAdvanced?.addEventListener("click", () => {
  updateCollectionFilterSummary();
  els.collectionFilterDialog?.showModal();
});
els.closeCollectionAdvanced?.addEventListener("click", () => els.collectionFilterDialog?.close());
els.collectionViewMode.value = state.collectionViewMode;
els.collectionViewMode.addEventListener("change", () => {
  state.collectionViewMode = els.collectionViewMode.value;
  localStorage.setItem(KEYS.collectionViewMode, state.collectionViewMode);
  renderCollection();
});
if (els.collectionPriceDisplayMode) {
  els.collectionPriceDisplayMode.value = state.collectionPriceDisplayMode;
  els.collectionPriceDisplayMode.addEventListener("change", () => {
    state.collectionPriceDisplayMode = els.collectionPriceDisplayMode.value;
    localStorage.setItem(KEYS.collectionPriceDisplayMode, state.collectionPriceDisplayMode);
    renderCollection();
  });
}
document.querySelectorAll("[data-collection-price-mode]").forEach(button => button.addEventListener("click", () => {
  state.collectionPriceDisplayMode = button.dataset.collectionPriceMode;
  localStorage.setItem(KEYS.collectionPriceDisplayMode, state.collectionPriceDisplayMode);
  renderCollection();
}));
[els.collectionColor, els.collectionMana, els.collectionType, els.collectionPriceFilter, els.collectionFavoriteGroup].filter(Boolean).forEach(filter => filter.addEventListener("change", renderCollection));
els.collectionFavoritesOnly.addEventListener("change", renderCollection);
els.clearCollectionFilters.addEventListener("click", () => {
  els.collectionColor.value = ""; els.collectionMana.value = ""; els.collectionType.value = ""; els.collectionPriceFilter.value = ""; if (els.collectionFavoriteGroup) els.collectionFavoriteGroup.value = ""; els.collectionFavoritesOnly.checked = false; renderCollection();
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
els.favoriteCardButton?.addEventListener("click", toggleSelectedFavorite);
els.deleteCardButton.addEventListener("click", deleteSelectedOwned);
els.createFavoriteGroupButton?.addEventListener("click", createFavoriteGroup);
els.manageFavoriteGroupsButton?.addEventListener("click", openFavoriteGroupManager);
els.closeFavoriteGroupManager?.addEventListener("click", () => els.favoriteGroupManagerDialog?.close());
els.manageFavoriteGroupSelect?.addEventListener("change", () => {
  favoriteGroupRenameOpen = false;
  favoriteGroupManagerMode = "view";
  favoriteGroupManagerQuery = "";
  renderFavoriteGroupManager(els.manageFavoriteGroupSelect.value);
});
els.toggleFavoriteGroupRename?.addEventListener("click", () => {
  favoriteGroupRenameOpen = !favoriteGroupRenameOpen;
  renderFavoriteGroupManager(els.manageFavoriteGroupSelect?.value || "");
  if (favoriteGroupRenameOpen) setTimeout(() => els.manageFavoriteGroupName?.focus(), 0);
});
els.toggleFavoriteGroupAdd?.addEventListener("click", () => {
  favoriteGroupManagerMode = favoriteGroupManagerMode === "add" ? "view" : "add";
  favoriteGroupManagerQuery = "";
  renderFavoriteGroupManager(els.manageFavoriteGroupSelect?.value || "");
  if (favoriteGroupManagerMode === "add") setTimeout(() => els.manageFavoriteGroupSearch?.focus(), 0);
});
els.saveFavoriteGroupName?.addEventListener("click", saveManagedFavoriteGroupName);
els.manageFavoriteGroupName?.addEventListener("keydown", event => {
  if (event.key === "Enter") { event.preventDefault(); saveManagedFavoriteGroupName(); }
});
els.manageFavoriteGroupSearch?.addEventListener("input", () => {
  favoriteGroupManagerQuery = els.manageFavoriteGroupSearch.value.trim();
  renderFavoriteGroupManager(els.manageFavoriteGroupSelect?.value || "");
});
els.deleteManagedFavoriteGroup?.addEventListener("click", () => {
  const id = els.manageFavoriteGroupSelect?.value || "";
  deleteFavoriteGroup(id);
});
els.newFavoriteGroupName?.addEventListener("keydown", event => {
  if (event.key === "Enter") { event.preventDefault(); createFavoriteGroup(); }
});
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
els.backgroundColorChoices?.querySelectorAll("[data-background-theme]").forEach(button => button.addEventListener("click", () => {
  applyBackgroundTheme(button.dataset.backgroundTheme, { persist: true });
  showToast(`背景色を${BACKGROUND_THEMES[state.backgroundTheme].label}にしました`);
}));
els.openDeckOwnedAdd.addEventListener("click", openDeckOwnedAddDialog);
els.openDeckSearchAdd.addEventListener("click", openDeckSearchAddDialog);
els.deckSearchAddDialog.addEventListener("close", resetDeckSearchAddForm);
els.openDeckVisual.addEventListener("click", openDeckVisualView);
els.openDeckOneScreenVisual?.addEventListener("click", openDeckOneScreenVisualView);
els.reorderDeckCards?.addEventListener("click", () => setDeckReorderMode(!deckReorderMode));
els.deckName.addEventListener("input", autoSaveEditingDeck);
els.deckMemo.addEventListener("input", autoSaveEditingDeck);
els.deckFormat.addEventListener("change", () => { renderDeckEditor(); autoSaveEditingDeck(); });
els.deckCardFilter.addEventListener("input", renderDeckEditor);
els.openDeckOwnedAdvanced.addEventListener("click", () => {
  const nextOpen = els.deckOwnedAdvancedPanel.hidden;
  els.deckOwnedAdvancedPanel.hidden = !nextOpen;
  els.openDeckOwnedAdvanced.setAttribute("aria-expanded", nextOpen ? "true" : "false");
});
els.deckSection.addEventListener("change", renderDeckEditor);
document.querySelectorAll("[data-deck-section-target]").forEach(button => button.addEventListener("click", () => {
  els.deckSection.value = button.dataset.deckSectionTarget;
  renderDeckEditor();
}));
[els.deckOwnedColor, els.deckOwnedMana, els.deckOwnedType, els.deckOwnedFavoriteGroup].filter(Boolean).forEach(filter => filter.addEventListener("change", renderDeckEditor));
els.deckOwnedFavoritesOnly?.addEventListener("change", renderDeckEditor);
els.clearDeckOwnedFilters.addEventListener("click", () => {
  els.deckCardFilter.value = ""; els.deckOwnedColor.value = ""; els.deckOwnedMana.value = ""; els.deckOwnedType.value = ""; if (els.deckOwnedFavoriteGroup) els.deckOwnedFavoriteGroup.value = ""; if (els.deckOwnedFavoritesOnly) els.deckOwnedFavoritesOnly.checked = false; renderDeckEditor();
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
els.addDeckEntryToCollection?.addEventListener("click", addCurrentDeckEntryToCollection);
els.removeDeckEntry.addEventListener("click", removeCurrentDeckEntry);
els.deckEntryDialog.querySelector(".dialog-close")?.addEventListener("click", event => {
  event.preventDefault();
  state.editingDeckEntry = null;
  els.deckEntryDialog.close();
});
els.sortDeckByName.addEventListener("click", () => sortDeckEntries("name"));
els.sortDeckByColor.addEventListener("click", () => sortDeckEntries("color"));
els.sortDeckByMana.addEventListener("click", () => sortDeckEntries("mana"));
els.sortDeckByType.addEventListener("click", () => sortDeckEntries("type"));
$("#saveDeckButton").addEventListener("click", saveDeck);
els.duplicateDeckButton.addEventListener("click", duplicateDeck);
els.deleteDeckButton.addEventListener("click", deleteDeck);
$("#exportButton").addEventListener("click", exportBackup);
els.saveFxButton.addEventListener("click", saveExchangeRate);
els.saveCardTraderToken?.addEventListener("click", saveCardTraderToken);
els.clearCardTraderToken?.addEventListener("click", clearCardTraderToken);
els.cardTraderToken?.addEventListener("focus", () => {
  if (els.cardTraderToken.value === "********") els.cardTraderToken.value = "";
});
els.cardTraderToken?.addEventListener("blur", updateCardTraderSettingsUi);
els.importInput.addEventListener("change", () => els.importInput.files[0] && importBackup(els.importInput.files[0]));
$("#clearButton").addEventListener("click", () => { if (!confirm("所持カードとデッキをすべて削除しますか？")) return; state.collection = []; state.decks = []; persist(); renderCollection(); renderDecks(); renderBackupSummary(); showToast("すべて削除しました"); });

window.addEventListener("beforeinstallprompt", event => { event.preventDefault(); state.installPrompt = event; els.installButton.hidden = false; });
els.installButton.addEventListener("click", async () => { if (!state.installPrompt) return; state.installPrompt.prompt(); await state.installPrompt.userChoice; state.installPrompt = null; els.installButton.hidden = true; });
window.addEventListener("appinstalled", () => { els.installButton.hidden = true; showToast("アプリをインストールしました"); });
window.addEventListener("online", () => { els.searchStatus.textContent = "オンライン：カードを検索できます"; refreshExchangeRate(); hydrateCollectionMetadata(); hydrateSetOptions(); });
window.addEventListener("offline", () => { els.searchStatus.textContent = "オフライン：保存済みデータは利用できます"; });

if ("serviceWorker" in navigator) window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js"));
renderSetSelects(); renderCollection(); renderDecks(); renderBackupSummary(); refreshExchangeRate(); hydrateCollectionMetadata(); hydrateSetOptions();
