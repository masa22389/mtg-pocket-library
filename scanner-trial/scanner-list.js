// SPDX-License-Identifier: AGPL-3.0-only
// Draft and collection writes share a transaction, including consumption of the draft.
(() => {
  const draftKey = 'mtg-pocket.scannerDraft.v1', collectionKey = 'mtg-pocket.collection.v1';
  async function transact(action, payload) {
    const db = await window.scannerCollection.database();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('values', action === 'read' ? 'readonly' : 'readwrite');
      const store = tx.objectStore('values'); let result, failure;
      tx.oncomplete = () => resolve(result);
      tx.onabort = () => reject(failure || tx.error || new Error('保存が中断されました'));
      tx.onerror = () => {};
      const read = store.get(draftKey);
      read.onsuccess = () => {
        try {
          const draft = JSON.parse(read.result || '[]');
          if (!Array.isArray(draft)) throw new Error('スキャンリストの形式を確認できません');
          result = draft;
          if (action === 'read') return;
          if (action === 'add') window.scannerCollection.merge(draft, payload);
          if (action === 'remove') result = draft.filter(row => row.id !== payload);
          if (action === 'commit') {
            const owned = store.get(collectionKey);
            owned.onsuccess = () => {
              try {
                const collection = JSON.parse(owned.result || '[]');
                if (!Array.isArray(collection)) throw new Error('所持データの形式を確認できません');
                for (const row of draft) {
                  if (!row.scryfallId || !Number.isSafeInteger(row.quantity) || row.quantity < 1) throw new Error('スキャンリストの枚数を確認してください');
                  window.scannerCollection.merge(collection, row);
                }
                store.put(JSON.stringify(collection), collectionKey);
                store.put('[]', draftKey);
                result = [];
              } catch (error) { failure = error; tx.abort(); }
            };
          } else store.put(JSON.stringify(result), draftKey);
        } catch (error) { failure = error; tx.abort(); }
      };
    });
  }
  const api = {
    read: () => transact('read'),
    add: (card, options) => transact('add', window.scannerCollection.compact(card, options)),
    remove: id => transact('remove', id),
    commit: async () => {
      const result = await transact('commit');
      try { sessionStorage.setItem('mtg-pocket.scannerCollectionChanged', '1'); } catch {}
      return result;
    }
  };
  window.scannerDraft = api;
})();
