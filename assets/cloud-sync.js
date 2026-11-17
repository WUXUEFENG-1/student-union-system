/* 云端同步：Supabase REST，整份数据存一行，云端为准；本地 localStorage 作为离线兜底。
 * 表 state：id int 主键、data jsonb、updated_at timestamptz。
 * 规则：云端有数据就以云端为准，避免已删除的部门/成员/通知被本机残留数据「复活」。
 * 健壮性：所有云端请求 8 秒超时；无论云端是否可达，最多 10 秒一定放行登录，避免卡在“正在连接云端”。
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

  /* 带超时的 fetch：云端不可达时及时中断，避免请求一直挂起 */
  function fetchJSON(url, opts, ms) {
    const ctrl = new AbortController();
    const timer = setTimeout(function () { ctrl.abort(); }, ms || 8000);
    opts = opts || {};
    opts.signal = ctrl.signal;
    return fetch(url, opts).finally(function () { clearTimeout(timer); });
  }

  function status(text, ok) {
    const el = document.getElementById('cloudStatus');
    if (!el) return;
    el.textContent = text;
    el.style.color = ok ? '#1657a6' : '#b08a2a';
  }

  function readRemote() {
    return fetchJSON(SB_URL + '/rest/v1/' + TABLE + '?id=eq.' + ROW_ID + '&select=data,updated_at', { headers: HEADERS })
      .then(function (r) { if (!r.ok) throw new Error('http ' + r.status); return r.json(); })
      .then(function (arr) { return Array.isArray(arr) && arr[0] ? arr[0] : null; });
  }

  function createRemote(payload) {
    return fetchJSON(SB_URL + '/rest/v1/' + TABLE, { method: 'POST', headers: HEADERS, body: JSON.stringify(payload) });
  }

  function writeRemote(payload) {
    return fetchJSON(SB_URL + '/rest/v1/' + TABLE + '?id=eq.' + ROW_ID, { method: 'PATCH', headers: HEADERS, body: JSON.stringify(payload) });
  }

  function cleanSnapshot() {
    const snap = JSON.parse(JSON.stringify(db));
    delete snap[FLAG];
    return snap;
  }

  let readyResolve;
  const ready = new Promise(function (res) { readyResolve = res; });
  window.__syncReady = false;
  let readyFlag = false;

  function markReady() {
    if (readyFlag) return;
    readyFlag = true;
    window.__syncReady = true;
    readyResolve();
    const btn = document.getElementById('loginBtn');
    if (btn) btn.disabled = false;
  }

  function pushLocal() {
    return readRemote().then(function (row) {
      let snap = cleanSnapshot();
      if (row && row.data) {
        /* 先把云端已有流水并入本机快照，避免整份回写时冲掉他人刚提交、本机尚未拉取的申请/日志 */
        const remote = normalize(JSON.parse(JSON.stringify(row.data)));
        mergeBoth(remote, snap);
        remote.__removed = Object.assign({}, snap.__removed || {}, remote.__removed || {});
        snap = remote;
      }
      const payload = { id: ROW_ID, data: snap, updated_at: iso() };
      return row ? writeRemote(payload) : createRemote(payload);
    }).then(function () {
      localStorage.removeItem(PENDING);
      try { db[FLAG] = payload.updated_at; } catch (e) { /* 忽略 */ }
      localStorage.setItem(STORE_KEY, JSON.stringify(db));
      status('云端已连接 · 名单实时同步', true);
      return true;
    }).catch(function () {
      localStorage.setItem(PENDING, '1');
      status('云端离线 · 改动已暂存在本机', false);
      return false;
    });
  }

  /* 流水类业务表：按唯一键双向合并，任一端新增都不丢失；同一条目取审批轨迹更完整（较新）的一方。
     成员/账号/部门/人事等主数据仍以云端为准，防止已删除项在本机复活。 */
  const UNION_ARRAYS = ['applies', 'logs', 'leaves', 'events', 'notices', 'collects', 'sessions', 'assets', 'assessments', 'joinRequests', 'deptRequests', 'activities'];
  function idOf(x) { return x.id || x.username || (x.name + '|' + x.date + '|' + (x.typeName || x.type || '')); }
  /* 比较两条同 id 记录哪条更新：审批/操作轨迹更长者为新，其次按时间字段 */
  function newer(a, b) {
    const ta = (a.track || []).length, tb = (b.track || []).length;
    if (ta !== tb) return ta > tb ? a : b;
    return String(a.updatedAt || a.date || a.time || '') >= String(b.updatedAt || b.date || b.time || '') ? a : b;
  }
  /* 双向合并流水表到 remote（原地修改并返回）：并集 + 同 id 取较新；被本地删除的墓碑条目不再并回 */
  function mergeBoth(remote, local) {
    const rem = local.__removed || {};
    UNION_ARRAYS.forEach(function (k) {
      const rArr = Array.isArray(remote[k]) ? remote[k] : [];
      const lArr = Array.isArray(local[k]) ? local[k] : [];
      const remIds = new Set(rem[k] || []);
      if (!rArr.length && !lArr.length) return;
      const map = new Map();
      rArr.forEach(function (x) { const id = idOf(x); if (!remIds.has(id)) map.set(id, x); });
      lArr.forEach(function (x) {
        const id = idOf(x);
        map.set(id, map.has(id) ? newer(map.get(id), x) : x);
      });
      remote[k] = Array.from(map.values());
    });
    return remote;
  }

  /* 用云端数据覆盖本机（云端为准，删除才会真正生效）；同时并入本机尚未上云的流水新增，
     若确实并入了本机新增，则把合并结果回推云端落库，避免只留在本机、下次又被旧快照冲掉。 */
  function applyRemote(row) {
    const remote = normalize(JSON.parse(JSON.stringify(row.data)));
    const local = cleanSnapshot();
    const before = JSON.stringify(remote);
    mergeBoth(remote, local);
    /* 本地删除墓碑并入云端快照，持久化后旧副本不再复活 */
    remote.__removed = Object.assign({}, local.__removed || {}, remote.__removed || {});
    Object.keys(db).forEach(function (k) { delete db[k]; });
    Object.assign(db, remote, { [FLAG]: row.updated_at || iso() });
    localStorage.setItem(STORE_KEY, JSON.stringify(db));
    if (JSON.stringify(remote) !== before) pushLocal();
  }

  function pullRemote() {
    const pending = localStorage.getItem(PENDING) === '1';
    const step = pending ? pushLocal() : Promise.resolve(true);
    step.then(function (ok) {
      if (!ok) { markReady(); return; }
      return readRemote().then(function (row) {
        if (!row || !row.data || !Array.isArray(row.data.members)) {
          /* 云端还没有数据：把本机现有数据推上去建立首份副本 */
          pushLocal();
          status('云端已连接 · 已建立首份数据', true);
          markReady();
          return;
        }
        /* 初始拉取一律以云端为准：云端名单覆盖本机残留，避免已删除项复活、旧账号表残留 */
        applyRemote(row);
        status('云端已连接 · 名单实时同步', true);
        markReady();
      });
    }).catch(function () { status('云端离线 · 仅本机数据可用', false); markReady(); });
  }

  /* 对比上一份快照，记录被删除条目的墓碑：本地删除后，下次云端合并不再把旧副本并回来 */
  function markRemovedGone() {
    try {
      const prev = JSON.parse(localStorage.getItem(STORE_KEY) || '{}');
      db.__removed = db.__removed || {};
      UNION_ARRAYS.forEach(function (k) {
        const prevArr = Array.isArray(prev[k]) ? prev[k] : [];
        const curIds = new Set((db[k] || []).map(idOf));
        const gone = prevArr.map(idOf).filter(function (id) { return id && !curIds.has(id); });
        if (gone.length) db.__removed[k] = Array.from(new Set([...(db.__removed[k] || []), ...gone]));
      });
    } catch (e) { /* 快照损坏时忽略墓碑对比 */ }
  }

  /* 包装 save()：先记录删除墓碑，写本地，防抖后回写云端 */
  const _save = save;
  let timer = null;
  save = function () {
    markRemovedGone();
    _save();
    try { db[FLAG] = iso(); } catch (e) { /* 忽略 */ }
    localStorage.setItem(PENDING, '1');
    clearTimeout(timer);
    timer = setTimeout(pushLocal, 300);
  };

  const loginBtn = document.getElementById('loginBtn');
  if (loginBtn) loginBtn.disabled = true;

  /* 供退出登录等关键节点等待推送完成：返回是否成功上云 */
  window.__flushSync = pushLocal;

  /* 页面关闭/刷新前尽力把暂存改动推上云端（卸载请求可能被浏览器中断，本地 localStorage 仍已落盘兜底） */
  window.addEventListener('beforeunload', function () {
    if (localStorage.getItem(PENDING) === '1') pushLocal();
  });

  /* 手机切后台/锁屏时页面常被直接回收，hidden 阶段再尽力推一次，避免提交后未上云即被挂起 */
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden' && localStorage.getItem(PENDING) === '1') pushLocal();
  });

  /* 绝对兜底：云端再慢/再不可达，10 秒内一定放行登录，不再一直停在“正在连接云端” */
  setTimeout(markReady, 10000);

  if (typeof fetch === 'function') pullRemote();
  else { status('当前浏览器不支持联网同步', false); markReady(); }
})();
