// SPDX-License-Identifier: AGPL-3.0-only
(() => {
  const el = id => document.getElementById(id);
  let original, selected, loading = false, saving = false, saved = false, revision = 0, controller;
  const message = text => { el('quickStatus').textContent = text; };
  function enabled() {
    el('quickSave').disabled = loading || saving || saved || !selected;
    for (const id of ['quickLanguage','quickFinish','quickQuantity','quickOther']) el(id).disabled = saving || saved;
    el('quickClose').disabled = saving;
    el('quickNext').hidden = !saved;
  }
  function display(card) {
    el('quickName').textContent = card.printed_name || card.card_faces?.map(face=>face.printed_name || face.name).join(' // ') || card.name;
    el('quickMeta').textContent = `${card.set.toUpperCase()} #${card.collector_number} · ${card.lang}`;
    el('quickImage').src = card.image_uris?.normal || card.card_faces?.[0]?.image_uris?.normal || '';
    el('quickImage').alt = el('quickName').textContent;
    const previous = el('quickFinish').value;
    el('quickFinish').replaceChildren();
    for (const [api, value, label] of [['nonfoil','normal','通常'],['foil','foil','Foil'],['etched','etched','エッチングFoil']]) {
      if ((card.finishes || []).includes(api)) el('quickFinish').add(new Option(label,value));
    }
    if ([...el('quickFinish').options].some(option=>option.value === previous)) el('quickFinish').value = previous;
  }
  async function changeLanguage() {
    const request = ++revision, language = el('quickLanguage').value;
    controller?.abort(); controller = new AbortController();
    const currentController = controller, signal = controller.signal;
    selected = null; loading = true; enabled(); message('選択した言語の収録版を確認しています…');
    const timeout = setTimeout(()=>currentController.abort(),15000);
    try {
      let card = original;
      if (card.lang !== language) {
        const response = await fetch(`https://api.scryfall.com/cards/${encodeURIComponent(card.set)}/${encodeURIComponent(card.collector_number)}/${encodeURIComponent(language)}`,{signal});
        if (!response.ok) throw new Error('この言語の同じ収録版を取得できません。言語を変更するか、別の候補から確認してください。');
        card = await response.json();
      }
      if (request !== revision) return;
      if (card.lang !== language || card.set !== original.set || card.collector_number !== original.collector_number || card.oracle_id !== original.oracle_id) throw new Error('同じ収録版を確認できませんでした');
      selected = card; display(card); message('状態：NM・保管場所：未指定で追加します。');
    } catch(error) {
      if (request === revision) message(error.name === 'AbortError' ? '取得が中断されました。言語を選び直してください。' : error.message);
    } finally { clearTimeout(timeout); if (request === revision) { loading = false; enabled(); } }
  }
  async function open(card, initialLanguage = card.lang) {
    original = card; selected = null; saved = false; saving = false;
    el('quickQuantity').value = 1; el('quickFinish').value = 'normal';
    display(card);
    el('quickLanguage').replaceChildren();
    for (const [value,label] of [['ja','日本語'],['en','英語'], ...(!['ja','en'].includes(card.lang) ? [[card.lang,card.lang]] : [])]) el('quickLanguage').add(new Option(label,value));
    el('quickLanguage').value = initialLanguage;
    el('quickDialog').showModal();
    await changeLanguage();
  }
  el('quickLanguage').addEventListener('change',changeLanguage);
  el('quickSave').addEventListener('click',async()=>{
    if (saving || saved || loading || !selected) return;
    const quantity = Number(el('quickQuantity').value);
    if (!Number.isSafeInteger(quantity) || quantity < 1) { message('枚数は1以上の整数で入力してください。'); return; }
    saving = true; enabled(); message('保存しています…');
    try {
      await window.scannerCollection.add(selected,{language:el('quickLanguage').value,finish:el('quickFinish').value,quantity});
      saved = true; message(`${quantity}枚をコレクションに追加しました。`);
    } catch(error) { message(error.name === 'QuotaExceededError' ? '保存できませんでした：端末保存領域が不足しています。' : `保存できませんでした：${error.message}`); }
    finally { saving = false; enabled(); }
  });
  el('quickDialog').addEventListener('cancel',event=>{if(saving)event.preventDefault();});
  el('quickDialog').addEventListener('close',()=>{++revision;controller?.abort();});
  el('quickClose').addEventListener('click',()=>el('quickDialog').close());
  el('quickOther').addEventListener('click',()=>{
    el('quickDialog').close(); el('results').hidden = false; el('results').scrollIntoView({block:'start',behavior:'smooth'});
  });
  el('quickNext').addEventListener('click',()=>{el('quickDialog').close();el('next').click();});
  window.scannerQuickAdd = {open};
})();
