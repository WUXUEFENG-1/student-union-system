/* 云端同步：Supabase REST，整份名单存一行；本地 localStorage 作为离线兜底。
 * 表 state：id int 主键、data jsonb、updated_at timestamptz。
 */
(function () {
  const SB_URL = 'https://btyhldpdniccreccxnru.supabase.co';
  const SB_KEY = 'sb_publishable_1xGqZG96WDbm-_9VqtyS7Q_bdi_pVhy';
  const TABLE = 'state';
  const ROW_ID = 1;
  const FLAG = '__syncedAt';

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

  function pushLocal() {
    const payload = { id: ROW_ID, data: cleanSnapshot(), updated_at: iso() };
    return readRemote().then(function (row) {
      return row ? writeRemote(payload) : createRemote(payload);
    }).catch(function () { status('云端离线 · 仅本地数据', false); });
  }

  function unionById(localList, remoteList) {
    const map = new Map((remoteList || []).map(function (x) { return [x.id || JSON.stringify(x), x]; }));
    (localList || []).forEach(function (x) {
      const id = x.id || JSON.stringify(x);
      if (!map.has(id)) map.set(id, x);
    });
    return Array.from(map.values());
  }

  /* 首次同步：把本机已有名单与云端合并，避免被云端旧数据覆盖 */
  function mergeRemote(remoteData) {
    const base = normalize(JSON.parse(JSON.stringify(remoteData)));
    const accMap = new Map((base.accounts || []).map(function (a) { return [a.username, a]; }));
    (db.accounts || []).forEach(function (a) { if (!accMap.has(a.username)) accMap.set(a.username, a); });
    base.accounts = Array.from(accMap.values());

    const memMap = new Map((base.members || []).map(function (m) { return [m.sno || m.name, m]; }));
    (db.members || []).forEach(function (m) {
      const key = m.sno || m.name;
      if (!memMap.has(key)) memMap.set(key, m);
    });
    base.members = Array.from(memMap.values());

    ['notices', 'leaves', 'joinRequests', 'deptRequests', 'collects', 'events', 'activities', 'assets', 'logs', 'departments', 'assessments', 'personnel', 'sessions'].forEach(function (k) {
      if (Array.isArray(base[k])) base[k] = unionById(db[k], base[k]);
    });
    return base;
  }

  function pullRemote() {
    return readRemote().then(function (row) {
      if (!row || !row.data || !row.data.members || !row.data.accounts) {
        /* 云端还没有数据：把本机现有名单推上去建立首份副本 */
        pushLocal();
        status('云端已连接 · 已建立首份名单', true);
        return;
      }
      const remoteAt = row.updated_at || '';
      const localAt = db[FLAG] || '';
      let merged;
      if (!localAt) {
        merged = mergeRemote(row.data);
      } else if (remoteAt > localAt) {
        merged = normalize(row.data);
      } else {
        status('云端已连接 · 名单实时同步', true);
        return;
      }
      Object.keys(db).forEach(function (k) { delete db[k]; });
      Object.assign(db, merged, { [FLAG]: remoteAt || iso() });
      localStorage.setItem(STORE_KEY, JSON.stringify(db));
      /* 合并后把更全的本机名单回写云端 */
      pushLocal();
      status('云端已连接 · 名单实时同步', true);
    }).catch(function () { status('云端离线 · 仅本机数据可用', false); });
  }

  /* 包装 save()：先写本地，防抖后回写云端 */
  const _save = save;
  let timer = null;
  save = function () {
    _save();
    try { db[FLAG] = iso(); } catch (e) { /* 忽略 */ }
    clearTimeout(timer);
    timer = setTimeout(pushLocal, 600);
  };

  if (typeof fetch === 'function') pullRemote();
  else status('当前浏览器不支持联网同步', false);
})();
