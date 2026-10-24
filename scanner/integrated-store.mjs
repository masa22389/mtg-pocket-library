// Scanner drafts and collection consumption use the main application's IndexedDB.
const draftKey='mtg-pocket.scannerHybrid.v1',ownedKey='mtg-pocket.collection.v1';
let queue=Promise.resolve(),failure=null,revision=null;
async function transact(action,snapshot){
 const db=await window.scannerCollection.database();
 return new Promise((resolve,reject)=>{
  const tx=db.transaction('values',action==='read'?'readonly':'readwrite'),store=tx.objectStore('values');let result,error;
  tx.oncomplete=()=>{revision=result?.revision||0;resolve(result);};tx.onabort=()=>reject(error||tx.error||Error('保存が中断されました'));tx.onerror=()=>{};
  const req=store.get(draftKey);req.onsuccess=()=>{try{
   const saved=JSON.parse(req.result||'{"events":[],"logs":[]}');if(!Array.isArray(saved.events)||!Array.isArray(saved.logs))throw Error('スキャンリストを読み込めません');
   if(action!=='read'&&revision!==null&&(saved.revision||0)!==revision)throw Error('別のスキャン画面でリストが変更されました。再読み込みしてください');result=saved;if(action==='save'){result={...snapshot,revision:(saved.revision||0)+1};store.put(JSON.stringify(result),draftKey);}
   if(action==='commit'){
    const confirmed=saved.events.filter(r=>r.confirmed);if(!confirmed.length)throw Error('版・言語・仕様を確認したカードがありません');
    const request=store.get(ownedKey);request.onsuccess=()=>{try{
     const collection=JSON.parse(request.result||'[]');if(!Array.isArray(collection))throw Error('所持データを読み込めません');
     for(const row of confirmed){const card=row.confirmed;if(!card.scryfallId||!Number.isSafeInteger(card.quantity)||card.quantity!==1)throw Error('保存するカード情報が不正です');window.scannerCollection.merge(collection,{...card});}
     result={...saved,revision:(saved.revision||0)+1,events:saved.events.filter(r=>!r.confirmed)};
     store.put(JSON.stringify(collection),ownedKey);store.put(JSON.stringify(result),draftKey);
    }catch(e){error=e;tx.abort();}};
   }
  }catch(e){error=e;tx.abort();}};
 });
}
export const integratedStore={
 async read(){await queue;if(failure)throw failure;return transact('read');},
 save(snapshot){const copy=structuredClone(snapshot);const operation=queue.then(()=>{if(failure)throw failure;return transact('save',copy)});queue=operation.catch(e=>{failure=e});return operation;},
 async commit(){await queue;if(failure)throw failure;const result=await transact('commit');try{sessionStorage.setItem('mtg-pocket.scannerCollectionChanged','1')}catch{}return result;},
 async flush(){await queue;if(failure)throw failure;}
};
export function verifyPrinting(row,printing,card,language,finish){
 const ids=[card.oracle_id,...(card.card_faces||[]).map(f=>f.oracle_id)];
 if(!ids.includes(row.oracleId)||card.set!==printing.set||String(card.collector_number)!==String(printing.number)||card.lang!==language)throw Error('選択したカード・収録版・言語と取得情報が一致しません');
 return window.scannerCollection.compact(card,{language,finish,quantity:1});
}
