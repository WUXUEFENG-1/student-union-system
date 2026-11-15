/* 云端同步：Supabase REST，整份数据存一行，云端为准；本地 localStorage 作为离线兜底。
 * 表 state：id int 主键、data jsonb、updated_at timestamptz。
 * 规则：云端有数据就以云端为准，避免已删除的部门/成员/通知被本机残留数据「复活」。
 */
(function () {
  const SB_URL = 'https://btyhldpdniccreccxnru.supabase.co';
  const SB_KEY = 'sb_publishable_1xGqZG96WDbm-_9VqtyS7Q_bdi_pVhy';
  const TABLE = 'state';
  const ROW_ID = 1;
  const FLAG = '__syncedAt';
  const PENDING = '__pendingPush';

  const HEADERS = {
    apikey: SB_KEY,
    Authorization: 'Bearer ' + SB_KEY,
    'Content-Type': 'application/json',
    Prefer: 'return=representation'
  };

  function iso() { return new Date().toISOString(); }

  function status(text, ok) {
    const el = document.getElementById('cloudStatus');
    if (!el) return;
    el.textContent = text;
    el.style.color = ok ? '#1657a6' : '#b08a2a';
  }

  function readRemote() {
    return fetch(SB_URL + '/rest/v1/' + TABLE + '?id=eq.' + ROW_ID + '&select=data,updated_at', { headers: HEADERS })
      .then(function (r) { if (!r.ok) throw new Error('http ' + r.status); return r.json(); })
      .then(function (arr) { return Array.isArray(arr) && arr[0] ? arr[0] : null; });
  }

  function createRemote(payload) {
    return fetch(SB_URL + '/rest/v1/' + TABLE, { method: 'POST', headers: HEADERS, body: JSON.stringify(payload) });
  }

  function writeRemote(payload) {
    return fetch(SB_URL + '/rest/v1/' + TABLE + '?id=eq.' + ROW_ID, { method: 'PATCH', headers: HEADERS, body: JSON.stringify(payload) });
  }

  function cleanSnapshot() {
    const snap = JSON.parse(JSON.stringify(db));
    delete snap[FLAG];
    return snap;
  }

  /* 初始云端同步就绪前，本机快照一律不上推，避免空种子覆盖云端已有名单 */
  let readyResolve;
  const ready = new Promise(function (res) { readyResolve = res; });
  window.__syncReady = false;

  function pushLocal() {
    return ready.then(function () {
      const payload = { id: ROW_ID, data: cleanSnapshot(), updated_at: iso() };
      return readRemote().then(function (row) {
        return row ? writeRemote(payload) : createRemote(payload);
      }).then(function () {
        localStorage.removeItem(PENDING);
        try { db[FLAG] = payload.updated_at; } catch (e) { /* 忽略 */ }
        localStorage.setItem(STORE_KEY, JSON.stringify(db));
        status('云端已连接 · 名单实时同步', true);
        return true;
      });
    }).catch(function () {
      localStorage.setItem(PENDING, '1');
      status('云端离线 · 改动已暂存在本机', false);
      return false;
    });
  }

  /* 用云端数据覆盖本机（云端为准，删除才会真正生效） */
  function applyRemote(row) {
    const remote = normalize(JSON.parse(JSON.stringify(row.data)));
    Object.keys(db).forEach(function (k) { delete db[k]; });
    Object.assign(db, remote, { [FLAG]: row.updated_at || iso() });
    localStorage.setItem(STORE_KEY, JSON.stringify(db));
  }

  function markReady() {
    window.__syncReady = true;
    readyResolve();
    const btn = document.getElementById('loginBtn');
    if (btn) btn.disabled = false;
  }

  function pullRemote() {
    const pending = localStorage.getItem(PENDING) === '1';
    const step = pending ? pushLocal() : Promise.resolve(true);
    return step.then(function (ok) {
      if (!ok) { markReady(); return; }
      return readRemote().then(function (row) {
        if (!row || !row.data || !Array.isArray(row.data.members)) {
          /* 云端还没有数据：把本机现有数据推上去建立首份副本 */
          pushLocal();
          status('云端已连接 · 已建立首份数据', true);
          markReady();
          return;
        }
        const remoteAt = row.updated_at || '';
        const localAt = db[FLAG] || '';
        if (!localAt || remoteAt > localAt) {
          applyRemote(row);
        }
        status('云端已连接 · 名单实时同步', true);
        markReady();
      });
    }).catch(function () { status('云端离线 · 仅本机数据可用', false); markReady(); });
  }

  /* 包装 save()：先写本地，防抖后回写云端 */
  const _save = save;
  let timer = null;
  save = function () {
    _save();
    try { db[FLAG] = iso(); } catch (e) { /* 忽略 */ }
    localStorage.setItem(PENDING, '1');
    clearTimeout(timer);
    timer = setTimeout(pushLocal, 500);
  };

  const loginBtn = document.getElementById('loginBtn');
  if (loginBtn) loginBtn.disabled = true;

  if (typeof fetch === 'function') pullRemote();
  else { status('当前浏览器不支持联网同步', false); markReady(); }
})();
