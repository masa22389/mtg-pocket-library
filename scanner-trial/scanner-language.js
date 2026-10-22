// Language detection is local; photographs are never uploaded.
(() => {
  let active = null;
  function classify(text, confidence) {
    if (!Number.isFinite(confidence) || confidence < 45) return 'unknown';
    const hira = (text.match(/[ぁ-ゖ]/g) || []).length;
    const kata = (text.match(/[ァ-ヺ]/g) || []).length;
    const japanese = (text.match(/[ぁ-ゖァ-ヺ一-鿿]/g) || []).length;
    const latin = (text.match(/[A-Za-z]/g) || []).length;
    return (hira >= 2 || kata >= 3) && japanese >= 6 && japanese > latin ? 'ja' : 'unknown';
  }
  function cancel() { active?.(); }
  async function detect(bitmap, rotated = false) {
    cancel();
    if (!bitmap) { window.scannerLanguage.lastReason = '画像を取得できませんでした'; return 'unknown'; }
    // Only the rules text area is needed; no continuous OCR while aiming.
    const canvas = document.createElement('canvas'); canvas.width = 896; canvas.height = 896;
    const ctx = canvas.getContext('2d');
    if (rotated) { ctx.translate(896,896); ctx.rotate(Math.PI); }
    ctx.drawImage(bitmap,0,0,896,896); bitmap.close();
    const text = document.createElement('canvas'); text.width=896; text.height=360;
    text.getContext('2d').drawImage(canvas,0,500,896,360,0,0,896,360);
    canvas.width=canvas.height=0;
    const image = text.toDataURL('image/png'); text.width=text.height=0;
    return new Promise(resolve => {
      const worker = new Worker('language.worker.js?v=301');
      let done=false;
      const finish=(value,reason)=>{if(done)return;done=true;window.scannerLanguage.lastReason=reason;clearTimeout(timer);worker.terminate();if(active===abort)active=null;resolve(value);};
      const abort=()=>finish('unknown','判定を中断しました');
      const timer=setTimeout(()=>finish('unknown','文字認識が時間切れになりました'),25000);active=abort;
      worker.onmessage=event=>{
        const value=classify(event.data.text || '',event.data.confidence);
        finish(value,event.data.error ? '文字認識の読み込み・実行に失敗しました' : value === 'ja' ? '日本語の文字を検出しました' : '日本語と判定できませんでした');
      };
      worker.onerror=()=>finish('unknown','文字認識を起動できませんでした');
      worker.postMessage(image);
    });
  }
  window.scannerLanguage={detect,cancel,classify};
  window.addEventListener('pagehide',cancel);
})();
