// SPDX-License-Identifier: AGPL-3.0-only
(() => {
  const key='mtg-pocket.scannerPending.v1', ownedKey='mtg-pocket.collection.v1';
  async function transaction(action,payload) {
    const db=await scannerCollection.database();
    return new Promise((resolve,reject)=>{
      const tx=db.transaction('values',action==='read'?'readonly':'readwrite'), store=tx.objectStore('values');
      let result,error;
      tx.oncomplete=()=>resolve(result);tx.onabort=()=>reject(error||tx.error||new Error('保存が中断されました'));tx.onerror=()=>{};
      const req=store.get(key);
      req.onsuccess=()=>{try{
        let rows=JSON.parse(req.result||'[]');if(!Array.isArray(rows))throw new Error('リストの形式が不正です');
        if(action==='add')rows.push(payload);
        if(action==='remove')rows=rows.filter(r=>r.id!==payload);
        if(action==='confirm'){
          const row=rows.find(r=>r.id===payload.id);if(!row)throw new Error('対象がありません');
          row.confirmed=payload.card;row.review=false;row.name=payload.card.printedName || payload.card.name;
        }
        if(action==='commit'){
          if(rows.some(r=>r.review||!r.confirmed))throw new Error('要確認のカードを確認してください');
          const owned=store.get(ownedKey);owned.onsuccess=()=>{try{
            const collection=JSON.parse(owned.result||'[]');if(!Array.isArray(collection))throw new Error('所持データの形式が不正です');
            for(const row of rows){
              const card=row.confirmed;
              if(!card.scryfallId||!Number.isSafeInteger(card.quantity)||card.quantity<1)throw new Error('保存内容を確認してください');
              scannerCollection.merge(collection,{...card});
            }
            store.put(JSON.stringify(collection),ownedKey);store.put('[]',key);result=[];
          }catch(e){error=e;tx.abort();}};
        }else{result=rows;if(action!=='read')store.put(JSON.stringify(rows),key);}
      }catch(e){error=e;tx.abort();}};
    });
  }
  window.continuousDraft={
    read:()=>transaction('read'),
    add:row=>transaction('add',{...row,id:crypto.randomUUID(),review:true,confirmed:null}),
    remove:id=>transaction('remove',id),
    confirm:(id,card,options)=>transaction('confirm',{id,card:scannerCollection.compact(card,{...options,quantity:1})}),
    commit:async()=>{const rows=await transaction('commit');try{sessionStorage.setItem('mtg-pocket.scannerCollectionChanged','1');}catch{}return rows;}
  };
})();
