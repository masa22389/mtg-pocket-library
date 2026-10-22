// SPDX-License-Identifier: AGPL-3.0-only
(() => {
  // Motion is only a scheduling hint. Identity confidence comes from the model.
  function createMotion() {
    let previous, settled = 0, attempted;
    const distance = (a,b) => !a || !b ? Infinity : a.reduce((sum,x,i)=>sum+Math.abs(x-b[i]),0)/a.length;
    return {
      observe(sample) {
        const movement=distance(sample,previous); previous=sample;
        settled=movement<4 ? settled+1 : 0;
        return {stable:settled>=3, changed:distance(sample,attempted)>9, movement};
      },
      attempted(sample) { attempted=sample; },
      reset(){previous=null;attempted=null;settled=0;}
    };
  }
  function classify(result) {
    const hits=result.identityCandidates || [];
    const first=hits[0], second=hits[1];
    // Uncalibrated conservative trial thresholds; never interpret as probability.
    return {identity:first?.identity || result.secondaryId || result.cardId,
      automatic:!!result.cardPresent && !!result.cornersValid && !!first && !!second && first.score>=.85 && first.score-second.score>=.06};
  }
  window.scanFlow={createMotion,classify};
})();
