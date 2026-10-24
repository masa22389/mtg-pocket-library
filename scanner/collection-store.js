// SPDX-License-Identifier: AGPL-3.0-only
// Read-modify-write in one transaction: never overwrite a stale collection snapshot.
(() => {
  const key = 'mtg-pocket.collection.v1';
  let ready;
  async function database() {
    if (!ready) ready = (async () => {
      const storage = await createMtgStorage(); // Includes the existing legacy migration.
      storage.close();
      return new Promise((resolve, reject) => {
        const request = indexedDB.open('mtg-pocket-data-v1', 1);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    })().catch(error => { ready = null; throw error; });
    return ready;
  }
  function compact(card, {language, finish, quantity}) {
    if (!Number.isSafeInteger(quantity) || quantity < 1) throw new Error('枚数は1以上の整数で入力してください');
    if (!card?.id || card.lang !== language) throw new Error('選択した言語のカード情報を確認してください');
    const apiFinish = finish === 'normal' ? 'nonfoil' : finish;
    if (!(card.finishes || []).includes(apiFinish)) throw new Error('この版には選択した仕様がありません');
    const faces = card.card_faces || [];
    return {
      id: crypto.randomUUID(), scryfallId:card.id, oracleId:card.oracle_id || '', name:card.name,
      printedName:card.printed_name || faces.map(face=>face.printed_name || face.name).join(' // ') || card.name,
      set:card.set.toUpperCase(), setName:card.set_name || '', collectorNumber:card.collector_number,
      illustrationId:card.illustration_id || faces.map(face=>face.illustration_id || '').filter(Boolean).join('/'), illustrationMetadataVersion:1,
      typeLine:card.type_line || '', printedTypeLine:card.printed_type_line || '',
      image:card.image_uris?.normal || faces[0]?.image_uris?.normal || '',
      manaCost:card.mana_cost || faces.map(face=>face.mana_cost).filter(Boolean).join(' // '),
      manaValue:Number(card.cmc || 0), colors:card.colors || [...new Set(faces.flatMap(face=>face.colors || []))], colorIdentity:card.color_identity || [],
      legalities:card.legalities || null, metadataVersion:1, finishes:card.finishes, foil:card.foil === true, nonfoil:card.nonfoil === true,
      priceUsd:card.prices?.usd || null, priceUsdFoil:card.prices?.usd_foil || null, priceUsdEtched:card.prices?.usd_etched || null,
      priceUsdSource:card.prices?.usd ? 'scryfall' : '', priceUsdFoilSource:card.prices?.usd_foil ? 'scryfall' : '', priceUsdEtchedSource:card.prices?.usd_etched ? 'scryfall' : '',
      priceUpdatedAt:Date.now(), quantity, language, finish, condition:'NM', location:'', favorite:false, favoriteGroupIds:[], addedAt:Date.now()
    };
  }
  function merge(collection, incoming) {
    const match = collection.find(card => card.scryfallId === incoming.scryfallId && card.language === incoming.language && card.finish === incoming.finish && (card.condition || 'NM') === 'NM' && (card.location || '') === '');
    if (match) {
      const total = Number(match.quantity || 0) + incoming.quantity;
      if (!Number.isSafeInteger(total)) throw new Error('所持枚数が大きすぎます');
      match.quantity = total;
    } else collection.unshift(incoming);
    return collection;
  }
  async function add(card, options) {
    const incoming = compact(card, options), db = await database();
    await new Promise((resolve, reject) => {
      const tx = db.transaction('values', 'readwrite'), store = tx.objectStore('values');
      let failure;
      tx.oncomplete = resolve;
      tx.onabort = () => reject(failure || tx.error || new Error('保存が中断されました'));
      tx.onerror = () => {};
      const request = store.get(key);
      request.onsuccess = () => {
        try {
          const collection = JSON.parse(request.result || '[]');
          if (!Array.isArray(collection)) throw new Error('保存データの形式を確認できません');
          store.put(JSON.stringify(merge(collection, incoming)), key);
        } catch(error) { failure = error; tx.abort(); }
      };
    });
    try { sessionStorage.setItem('mtg-pocket.scannerCollectionChanged', '1'); } catch {}
  }
  async function language() {
    const db = await database();
    return new Promise((resolve, reject) => {
      const r = db.transaction('values').objectStore('values').get('mtg-pocket.defaultCardLanguage.v1');
      r.onsuccess = () => resolve(r.result === 'ja' ? 'ja' : 'en'); r.onerror = () => reject(r.error);
    });
  }
  window.scannerCollection = {add, language, compact, merge, database};
})();
