"use strict";
// String-valued storage keeps all existing JSON schemas and raw preferences intact.
async function createMtgStorage({ name = "mtg-pocket-data-v1", legacy = localStorage, notify = () => {} } = {}) {
  const db = await new Promise((resolve, reject) => {
    const request = indexedDB.open(name, 1);
    request.onupgradeneeded = () => { request.result.createObjectStore("values"); request.result.createObjectStore("meta"); };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    request.onblocked = () => notify("error", "保存領域を開けません。ほかのアプリ画面を閉じて再読み込みしてください。");
  });
  const complete = tx => new Promise((resolve, reject) => {
    tx.oncomplete = resolve;
    tx.onabort = () => reject(tx.error || new Error("保存処理が中断されました"));
    tx.onerror = () => {}; // onabort determines transaction failure, not individual requests.
  });
  // Marker and every key commit together. A failed migration leaves legacy untouched.
  const migration = db.transaction(["values", "meta"], "readwrite");
  const migrated = migration.objectStore("meta").get("migrated");
  migrated.onsuccess = () => {
    if (migrated.result) return;
    try {
      for (let i = 0; i < legacy.length; i++) {
        const key = legacy.key(i);
        if (key?.startsWith("mtg-pocket.")) migration.objectStore("values").put(legacy.getItem(key), key);
      }
      migration.objectStore("meta").put(true, "migrated");
    } catch { migration.abort(); }
  };
  try { await complete(migration); } catch (error) { db.close(); throw error; }
  const cache = new Map();
  const read = db.transaction("values", "readonly");
  read.objectStore("values").openCursor().onsuccess = event => {
    const cursor = event.target.result;
    if (cursor) { cache.set(cursor.key, cursor.value); cursor.continue(); }
  };
  await complete(read);
  let queue = Promise.resolve(), failed = null, pending = 0;
  db.onversionchange = () => { db.close(); failed = new Error("別の画面で保存領域が更新されました。再読み込みしてください。"); notify("error", failed.message); };
  const api = {
    getItem: key => cache.get(key) ?? null,
    setItem: (key, value) => api.writeBatch([[key, String(value)]]),
    removeItem: key => api.writeBatch([[key, null]]),
    writeBatch(entries) {
      const snapshot = entries.map(([key, value]) => [key, value === null ? null : String(value)]);
      pending++; notify("saving", "端末に保存中…");
      const operation = queue.then(async () => {
        if (failed) throw failed;
        const tx = db.transaction("values", "readwrite");
        const done = complete(tx);
        try {
          for (const [key, value] of snapshot) {
            if (value === null) tx.objectStore("values").delete(key);
            else tx.objectStore("values").put(value, key);
          }
        } catch (error) { tx.abort(); await done.catch(() => {}); throw error; }
        await done;
        for (const [key, value] of snapshot) { if (value === null) cache.delete(key); else cache.set(key, value); }
      });
      queue = operation.then(() => { pending--; if (!pending) notify("saved", ""); }, error => {
        pending--; failed = error;
        notify("error", "保存できませんでした。画面上の変更が未保存の可能性があります。再読み込みして保存済みデータを確認してください。（" + (error.name || "Error") + "）");
      });
      return operation;
    },
    flush: () => queue.then(() => { if (failed) throw failed; }),
    removeLegacy: keys => { for (const key of keys) legacy.removeItem(key); },
    close: () => db.close()
  };
  return api;
}

if (typeof window !== "undefined" && !window.MTG_STORAGE_TEST) {
  const status = document.createElement("div");
  status.id = "storageStatus"; status.setAttribute("role", "status");
  Object.assign(status.style, { position:"fixed", top:"0", left:"0", right:"0", zIndex:"10000", background:"#fff4d7", color:"#272727", padding:"12px", fontSize:"14px" });
  const message = document.createElement("span"); status.append(message); document.body.append(status);
  const notify = (kind, text) => { status.hidden = kind === "saved"; message.textContent = text; };
  const showStartupError = () => {
    notify("error", "保存データを開けませんでした。元データは削除していません。他の画面を閉じて再読み込みしてください。");
    if (!status.querySelector("button")) { const button=document.createElement("button"); button.textContent="再読み込み"; button.onclick=()=>location.reload(); status.append(button); }
  };
  notify("saving", "保存データを準備しています。初回は既存データを引き継ぎます…");
  const ready = createMtgStorage({notify});
  ready.catch(showStartupError);
  window.mtgStorage = {ready, showStartupError};
  ready.then(() => notify("saved", ""), () => {});
}
