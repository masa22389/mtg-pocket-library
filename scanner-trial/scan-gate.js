// SPDX-License-Identifier: AGPL-3.0-only
// Thresholds are conservative trial settings, not probabilities of correctness.
(() => {
  function create() {
    let last = '', candidate = '', repeats = 0, empty = 0, strong = false;
    return {
      observe(data) {
        if (!data.cardPresent) {
          candidate = ''; repeats = 0;
          if (++empty >= 2) last = '';
          return {action:'empty'};
        }
        empty = 0;
        if (!data.cornersValid || !data.cardId) { candidate=''; repeats=0; return {action:'wait'}; }
        const identity = data.secondaryId || data.cardId;
        if (identity === last) {candidate=''; repeats=0; return {action:'duplicate'};}
        const hits = [...(data.candidates || [])].sort((a,b)=>b.score-a.score);
        const score = Number(data.score), margin = hits.length > 1 ? score - hits[1].score : 0;
        const confident = Number.isFinite(score) && score >= .85 && margin >= .06;
        if (candidate === data.cardId) { repeats++; strong = strong && confident; }
        else {candidate=data.cardId; repeats=1;strong=confident;}
        if (repeats < 2) return {action:'wait'};
        last=identity; candidate=''; repeats=0;
        return {action:'candidate', automatic:strong};
      }
    };
  }
  window.scannerGate = {create};
})();
