export function provisionalCard(hit,name,candidateOracleIds,{id,at}){
 if(!hit?.oracleId)throw Error('Candidate identity required');
 return {id,oracleId:hit.oracleId,name,printId:null,matchedPrintId:hit.id?.slice(0,36)||null,review:true,identityConfirmed:false,manual:false,at,candidateOracleIds:[...new Set(candidateOracleIds)],origin:'automatic-provisional'};
}
export function correctProvisional(events,rowId,hit,name){
 const row=events.find(e=>e.id===rowId);if(!row||!hit?.oracleId)return false;
 row.oracleId=hit.oracleId;row.name=name;row.printId=null;row.matchedPrintId=hit.id?.slice(0,36)||null;row.printingEstimated=false;row.confirmed=null;row.identityConfirmed=true;row.manual=true;
 return true;
}
