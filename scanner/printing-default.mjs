// An artwork match suggests a printing; it does not prove the physical edition.
export function suggestPrinting(row,rows,display,referenceId){
 if(row.printId||row.confirmed)return null;
 const candidates=rows.filter(p=>p.oracleId===row.oracleId);if(!candidates.length)return null;
 const ja=p=>display.japanesePrintings?.[p.set]?.includes(String(p.number).toLowerCase());
 const matched=candidates.find(p=>p.id===row.matchedPrintId),reference=candidates.find(p=>p.id===referenceId);
 const preferred=display.japaneseReferences?.[row.oracleId];
 const japanese=candidates.filter(ja);
 const chosen=(matched&&ja(matched)?matched:null)||japanese.find(p=>preferred&&p.set===preferred.set&&String(p.number)===String(preferred.number))||(reference&&ja(reference)?reference:null)||japanese.find(p=>p.finishes?.includes('nonfoil'))||japanese[0]||matched||reference||candidates[0];
 const finish=chosen.finishes?.includes('nonfoil')?'normal':chosen.finishes?.[0]||'normal';
 return {printId:chosen.id,language:ja(chosen)?'ja':chosen.lang||'en',finish,printingEstimated:true,printingSource:chosen===matched?'artwork-candidate':'available-printing'};
}
