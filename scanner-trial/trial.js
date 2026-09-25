// SPDX-License-Identifier: AGPL-3.0-only
// Isolated scanner trial. No collection/deck/localStorage writes.
const $ = id => document.getElementById(id);
const DB_NAME = 'mtg-pocket.scanner-trial.assets.v1';
let worker = null, stream = null, readyTask = null, pendingReject = null;
let generation = 0, busy = false, operation = 0;
let requestController = null, watchdog = null;
const status = message => { $('status').textContent = message; };
function releaseCamera() {
  for (const track of stream?.getTracks() || []) track.stop();
  stream = null;
  $('video').srcObject = null;
  $('video').hidden = true;
}
function setBusy(value) {
  busy = value;
  $('capture').disabled = value || $('preview').hidden && !stream;
  $('start').disabled = value;
  $('photo').disabled = value;
  $('sample').disabled = value;
}
function stop(message = '停止しました。もう一度開始できます。') {
  ++generation; ++operation;
  clearTimeout(watchdog);
  requestController?.abort(); requestController = null;
  releaseCamera();
  worker?.terminate(); worker = null;
  pendingReject?.(new DOMException('Stopped', 'AbortError'));
  pendingReject = null; readyTask = null;
  $('progress').hidden = true;
  $('stop').disabled = true;
  setBusy(false);
  status(message);
}
function fail(error) {
  if (error?.name === 'AbortError') return;
  const permission = error?.name === 'NotAllowedError';
  stop(permission ? 'カメラの許可がありません。ブラウザで許可するか「写真を選ぶ」をお使いください。' : `読み込み・認識に失敗しました。再試行できます：${error.message || error}`);
}
async function ensureReady() {
  if (readyTask) return readyTask;
  if (!window.isSecureContext || !window.Worker || !window.OffscreenCanvas || !window.createImageBitmap) throw new Error('このブラウザでは動作できません。HTTPSのページを新しいChromeまたはSafariで開いてください。');
  const token = generation;
  $('stop').disabled = false;
  status('認識データを準備しています… 初回は時間がかかります。');
  requestController = new AbortController();
  readyTask = (async () => {
    const response = await fetch('vendor/manifest.json', {signal:requestController.signal});
    if (!response.ok) throw new Error('認識データの案内を取得できませんでした');
    const manifest = await response.json();
    if (token !== generation) throw new DOMException('Stopped','AbortError');
    await new Promise((resolve, reject) => {
      pendingReject = reject;
      worker = new Worker('vendor/scanner.worker.mjs', {type:'module'});
      watchdog = setTimeout(() => fail(new Error('準備がタイムアウトしました。通信状態を確認してください。')), 180000);
      worker.onerror = event => { reject(new Error(event.message)); fail(new Error(event.message)); };
      worker.onmessage = event => {
        if (token !== generation) return;
        const data = event.data;
        if (data.type === 'progress') {
          const labels = {detector:'カード検出モデル',embedder:'カード認識モデル',catalog:'カード一覧',dewarp:'画像補正',webgpu:'実行環境',milo:'カード認識モデル',cornelius:'カード検出モデル'};
          const percent = Number.isFinite(data.ratio) ? ` ${Math.round(data.ratio*100)}%` : '';
          status(`${labels[data.stage] || '認識データ'}を準備中…${percent}`);
          $('progress').hidden = false;
          if (Number.isFinite(data.ratio)) $('progress').value = data.ratio;
          else $('progress').removeAttribute('value');
        } else if (data.type === 'ready') {
          clearTimeout(watchdog); pendingReject = null;
          $('progress').hidden = true;
          status(`準備できました（${data.catalogRows.toLocaleString()}件）。`);
          resolve();
        } else if (data.type === 'result') {
          clearTimeout(watchdog);
          showResult(data, token).catch(fail);
        } else if (data.type === 'error') {
          reject(new Error(data.message)); fail(new Error(data.message));
        }
      };
      worker.postMessage({type:'init',manifest,assetBasePath:'https://hanclinto.github.io/CollectorVision/assets',enableWebGpu:false,catalogMode:'v1',rotationInvariant:true});
    });
  })();
  return readyTask;
}
async function startCamera() {
  const attempt = ++operation;
  try {
    setBusy(true); $('stop').disabled = false;
    if (!navigator.mediaDevices?.getUserMedia) throw new Error('カメラを使えません。「写真を選ぶ」をお使いください。');
    releaseCamera();
    const media = await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'environment'},width:{ideal:1280},height:{ideal:960}},audio:false});
    if (attempt !== operation) {media.getTracks().forEach(track=>track.stop());return;}
    stream = media; $('video').srcObject = media; $('video').hidden = false;
    $('preview').hidden = true; $('placeholder').hidden = true;
    await $('video').play();
    await ensureReady();
    if (attempt !== operation) return;
    setBusy(false); status('四隅が入るように構え、「この画像を読み取る」を押してください。');
  } catch(error) {if(attempt === operation) fail(error);}
}
function drawPreview(source, width, height) {
  const scale = Math.min(1,1600/Math.max(width,height));
  const canvas = $('preview'); canvas.width = Math.round(width*scale); canvas.height = Math.round(height*scale);
  canvas.getContext('2d').drawImage(source,0,0,canvas.width,canvas.height);
  canvas.hidden = false; $('placeholder').hidden = true;
}
async function loadPhoto(blob) {
  const attempt = ++operation;
  setBusy(true); releaseCamera(); $('stop').disabled = false;
  try {
    const bitmap = await createImageBitmap(blob);
    if(attempt !== operation){bitmap.close();return;}
    drawPreview(bitmap,bitmap.width,bitmap.height); bitmap.close();
    setBusy(false);
    await capture();
  } catch(error){if(attempt === operation) fail(error);}
}
async function capture() {
  if(busy)return;
  const token = generation;
  setBusy(true); $('stop').disabled = false;
  $('results').replaceChildren();
  try {
    if(stream){
      const video = $('video');
      if(!video.videoWidth)throw new Error('カメラの準備を待ってから再試行してください');
      drawPreview(video,video.videoWidth,video.videoHeight);
      releaseCamera();
    }
    if($('preview').hidden)throw new Error('写真を選んでください');
    await ensureReady();
    if(token !== generation)return;
    const bitmap = await createImageBitmap($('preview'));
    if(token !== generation){bitmap.close();return;}
    status('カードを認識しています…');
    watchdog = setTimeout(()=>fail(new Error('認識がタイムアウトしました。')),45000);
    worker.postMessage({type:'frame',bitmap},[bitmap]);
  }catch(error){if(token === generation)fail(error);}
}
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
async function showResult(data, token) {
  if(!data.cardPresent || !data.cornersValid || !data.cardId){setBusy(false);status('カードを検出できませんでした。四隅を入れ、背景とカードを離して撮り直してください。');return;}
  const hits = (data.candidates || [{cardId:data.cardId,score:data.score}]).filter(hit=>uuidPattern.test(hit.cardId)).slice(0,3);
  if(!hits.length)throw new Error('対応するカードIDがありません');
  status('候補のカード情報を取得しています…');
  requestController = new AbortController();
  watchdog = setTimeout(()=>fail(new Error('カード情報の取得がタイムアウトしました。')),30000);
  const response = await fetch('https://api.scryfall.com/cards/collection',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({identifiers:hits.map(hit=>({id:hit.cardId}))}),signal:requestController.signal});
  if(!response.ok)throw new Error('Scryfallから候補を取得できませんでした。再度読み取ってください');
  const result = await response.json();
  if(token !== generation)return;
  clearTimeout(watchdog);
  const cards = new Map((result.data || []).map(card=>[card.id,card]));
  for(const hit of hits){
    const card = cards.get(hit.cardId);if(!card)continue;
    const row = document.createElement('article');row.className='candidate';
    const img = document.createElement('img');img.alt=card.printed_name || card.name;
    const uri = card.image_uris?.small || card.card_faces?.[0]?.image_uris?.small;
    if(uri && new URL(uri).hostname === 'cards.scryfall.io')img.src=uri;
    const body=document.createElement('div'),title=document.createElement('strong'),meta=document.createElement('p'),link=document.createElement('a');
    title.textContent=card.printed_name || card.name;
    meta.textContent=`${card.set_name} · ${card.set.toUpperCase()} #${card.collector_number} · ${card.lang} / 類似度 ${hit.score.toFixed(3)}`;
    link.textContent='この候補をカード詳細で確認';link.href=`../?v=257&scannerCard=${encodeURIComponent(card.id)}`;
    link.addEventListener('click',()=>stop());
    body.append(title,meta,link);row.append(img,body);$('results').append(row);
  }
  setBusy(false);
  if(!$('results').children.length)throw new Error('候補のカード情報が見つかりませんでした');
  status(`候補を表示しました（認識 ${Math.round(data.timing?.totalMs || 0)}ms）。${data.score < .5 ? '類似度が低いため、該当なしの可能性があります。' : '版・言語を確認して選んでください。'}`);
}
$('start').addEventListener('click',startCamera);
$('capture').addEventListener('click',capture);
$('stop').addEventListener('click',()=>stop());
$('photo').addEventListener('change',()=>{const file=$('photo').files[0];$('photo').value='';if(file)loadPhoto(file);});
$('sample').addEventListener('click',async()=>{
  const token=generation;
  try{setBusy(true);const response=await fetch('sample.jpg');if(!response.ok)throw new Error('サンプルを取得できません');const blob=await response.blob();if(token === generation)await loadPhoto(blob);}catch(error){if(token === generation)fail(error);}
});
$('clear').addEventListener('click',()=>{
  stop();
  const request=indexedDB.deleteDatabase(DB_NAME);
  request.onsuccess=()=>status('認識データを削除しました。次回は再ダウンロードします。所持カードやデッキはそのままです。');
  request.onerror=()=>status('削除できませんでした。別のスキャナータブを閉じて再試行してください。');
  request.onblocked=()=>status('別のスキャナータブを閉じると削除が完了します。');
});
window.addEventListener('pagehide',()=>stop());
document.addEventListener('visibilitychange',()=>{if(document.hidden)stop('画面を離れたため停止しました。再開できます。');});
