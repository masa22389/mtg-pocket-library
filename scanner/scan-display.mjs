export function localizedScanName(identity,fallback=''){
 return identity?.aliases?.find(n=>/[ぁ-んァ-ン一-龯]/u.test(n))||identity?.name||fallback;
}
export function unselectedJapaneseReference(row,display){
 if(row.confirmed||row.printId||(row.language||'ja')!=='ja')return null;
 return display.japaneseReferences?.[row.oracleId]||null;
}
