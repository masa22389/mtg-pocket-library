// SPDX-License-Identifier: AGPL-3.0-only
(() => {
  const el = id => document.getElementById(id);
  let busy = false;
  function render(rows) {
    el('scanRows').replaceChildren();
    let count = 0;
    for (const row of rows) {
      count += row.quantity;
      const item = document.createElement('li'), label = document.createElement('span'), remove = document.createElement('button');
      label.textContent = `${row.printedName || row.name} · ${row.set} #${row.collectorNumber} · ${row.language} · ${row.finish === 'normal' ? '通常' : row.finish} · ${row.quantity}枚`;
      remove.textContent = '取り除く'; remove.className = 'secondary'; remove.disabled = busy;
      remove.addEventListener('click', () => run(() => window.scannerDraft.remove(row.id), 'リストから取り除きました。'));
      item.append(label, remove); el('scanRows').append(item);
    }
    el('scanCount').textContent = `スキャンリスト：${count}枚`;
    el('scanCommit').disabled = busy || !rows.length;
  }
  async function refresh() { render(await window.scannerDraft.read()); }
  async function run(action, message) {
    if (busy) return;
    busy = true; el('scanCommit').disabled = true;
    try { await action(); el('scanMessage').textContent = message; }
    catch (error) { el('scanMessage').textContent = `保存できませんでした：${error.message}`; }
    finally { busy = false; await refresh().catch(error => { el('scanMessage').textContent = error.message; }); }
  }
  el('scanCommit').addEventListener('click', () => run(() => window.scannerDraft.commit(), 'コレクションに保存しました。'));
  window.scannerListUI = {refresh};
  refresh().catch(error => { el('scanMessage').textContent = `リストを読み込めません：${error.message}`; });
})();
