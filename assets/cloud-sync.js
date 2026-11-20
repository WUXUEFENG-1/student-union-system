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

  /* 带超时的 fetch：云端不可达时及时中断；大快照（含内嵌图片）拉取放宽到 40 秒，回写 30 秒 */
  function fetchJSON(url, opts, ms) {
    const ctrl = new AbortController();
    const timer = setTimeout(function () { ctrl.abort(); }, ms || 30000);
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
    return fetchJSON(SB_URL + '/rest/v1/' + TABLE + '?id=eq.' + ROW_ID + '&select=data,updated_at', { headers: HEADERS }, 40000)
      .then(function (r) {
        if (!r.ok) {
          /* 57014=语句超时、500/502/503/504=网关或服务端抖动：属于可重试的临时故障 */
          const err = new Error('http ' + r.status);
          err.status = r.status;
          throw err;
        }
        return r.json();
      })
      .then(function (arr) { return Array.isArray(arr) && arr[0] ? arr[0] : null; });
  }

  /* 拉取重试：大快照在云端偶发语句超时/网关抖动，单次失败不应直接判离线 */
  const RETRY_DELAYS = [1200, 2500, 4000, 6000];
  function isRetryable(err) {
    if (!err) return true;
    if (err.name === 'AbortError') return true;
    if (err.status) return err.status >= 500 || err.status === 429;
    return true; /* 网络层错误（断网、DNS、CORS）同样重试 */
  }
  function readRemoteRetry(attempt) {
    attempt = attempt || 0;
    return readRemote().catch(function (err) {
      if (attempt >= RETRY_DELAYS.length || !isRetryable(err)) throw err;
      return new Promise(function (res) { setTimeout(res, RETRY_DELAYS[attempt]); })
        .then(function () { return readRemoteRetry(attempt + 1); });
    });
  }

  function createRemote(payload) {
    return fetchJSON(SB_URL + '/rest/v1/' + TABLE, { method: 'POST', headers: HEADERS, body: JSON.stringify(payload) }, 60000);
  }

  function writeRemote(payload) {
    return fetchJSON(SB_URL + '/rest/v1/' + TABLE + '?id=eq.' + ROW_ID, { method: 'PATCH', headers: HEADERS, body: JSON.stringify(payload) }, 60000);
  }

  /* 回写重试：整份快照 PATCH 偶发语句超时，PATCH 为幂等覆盖，可安全重试 */
  function writeRemoteRetry(payload, create, attempt) {
    attempt = attempt || 0;
    const body = { id: payload.id, data: payload.data, updated_at: payload.updated_at };
    const doCall = function () { return create ? createRemote(body) : writeRemote(body); };
    return doCall().then(function (r) {
      /* 409 = 并发下记录已存在，等同写入成功 */
      if (r && !r.ok && r.status !== 409) {
        const err = new Error('http ' + r.status); err.status = r.status; throw err;
      }
      return r;
    }).catch(function (err) {
      if (attempt >= 2 || (err.status && err.status < 500)) throw err;
      return new Promise(function (res) { setTimeout(res, RETRY_DELAYS[attempt] || 4000); })
        .then(function () { return writeRemoteRetry(payload, create, attempt + 1); });
    });
  }

  function cleanSnapshot() {
    const snap = JSON.parse(JSON.stringify(db));
    delete snap[FLAG];
    return snap;
  }

  /* 本地兜底落盘：快照超过浏览器 localStorage 配额时只在内存保留台账，不能让配额异常中断云端同步 */
  function persistLocal() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(db)); } catch (e) { /* 配额超限：本会话以内存台账为准 */ }
  }

  let readyResolve;
  const ready = new Promise(function (res) { readyResolve = res; });
  window.__syncReady = false;
  let readyFlag = false;
  let remoteReached = false;
  let localPersisted = false;

  function markReady() {
    if (readyFlag) return;
    readyFlag = true;
    window.__syncReady = true;
    readyResolve();
    const btn = document.getElementById('loginBtn');
    if (btn) btn.disabled = false;
  }

  /* 墓碑按数组并集合并：浅拷贝 Object.assign 会让云端旧数组整段覆盖本机新增墓碑，
     导致刚删除的记录下一次合并又被并回（删除复活）。 */
  function mergeGone(a, b) {
    const out = Object.assign({}, a || {});
    Object.keys(b || {}).forEach(function (k) {
      out[k] = Array.from(new Set([...(out[k] || []), ...((b || {})[k] || [])]));
    });
    return out;
  }

  function accKey(a) { return a && (a.username || a.account); }

  /* 账号密码按 pwdAt 时间戳择优合并：较新修改的密码不被较旧快照覆盖；
     没有 pwdAt 的历史记录视为最旧，只在对方无更新时间时被采纳。 */
  function mergePasswords(target, source) {
    const tMap = {};
    (target.accounts || []).forEach(function (a) { const k = accKey(a); if (k) tMap[k] = a; });
    (source.accounts || []).forEach(function (s) {
      const k = accKey(s);
      if (!k || !s.pwdAt) return;
      const t = tMap[k];
      if (t && (!t.pwdAt || s.pwdAt > t.pwdAt)) { t.password = s.password; t.pwdAt = s.pwdAt; }
    });
  }

  function pushLocal() {
    return readRemoteRetry().then(function (row) {
      /* 以本机快照为底稿推送：成员/账号/部门等主数据的增删改都以本机为准，
         否则「以云端为底稿」会把刚删除的成员、刚改的密码瞬间覆盖回旧值。 */
      let snap = cleanSnapshot();
      if (row && row.data) {
        const remote = normalize(JSON.parse(JSON.stringify(row.data)));
        /* 只把云端的流水记录并入本机，避免冲掉他人刚提交、本机尚未拉取的申请/日志 */
        const gone = mergeGone(snap.__removed, remote.__removed);
        mergeUnionsInto(snap, remote, gone);
        mergePasswords(snap, remote);
        snap.__removed = gone;
        /* 防御：本机为空种子台账（无成员、无普通账号）而云端有真实名单时，主数据保留云端，避免空台账把云端名单整份覆盖 */
        const seedLike = !(snap.members || []).length && !(snap.accounts || []).filter((a) => !['admin', 'teacher'].includes(a.role)).length;
        if (seedLike && (remote.members || []).length) {
          snap.members = remote.members;
          snap.accounts = remote.accounts;
          if (remote.departments) snap.departments = remote.departments;
        }
      }
      const payload = { id: ROW_ID, data: snap, updated_at: iso() };
      return writeRemoteRetry(payload, !row).then(function () {
        localStorage.removeItem(PENDING);
        try { db[FLAG] = payload.updated_at; } catch (e) { /* 忽略 */ }
        persistLocal();
        remoteReached = true;
        status('云端已连接 · 名单实时同步', true);
        stopReconnect();
        return true;
      });
    }).catch(function (err) {
      localStorage.setItem(PENDING, '1');
      const http = err && err.status ? `HTTP ${err.status}` : '网络中断';
      status(remoteReached ? '连接中断 · 改动将在重连后同步' : `云端离线 · 改动已暂存本机（${http}）`, false);
      scheduleReconnect();
      return false;
    });
  }

  /* 流水类业务表：按唯一键双向合并，任一端新增都不丢失；同一条目取审批轨迹更完整（较新）的一方。
     成员/账号/部门/人事等主数据仍以云端为准，防止已删除项在本机复活。 */
  const UNION_ARRAYS = ['applies', 'logs', 'leaves', 'events', 'notices', 'collects', 'sessions', 'assets', 'assessments', 'joinRequests', 'deptRequests', 'activities', 'msgs'];
  function idOf(x) { return x.id || x.username || (x.name + '|' + x.date + '|' + (x.typeName || x.type || '')); }
  /* 比较两条同 id 记录哪条更新：审批/操作轨迹更长者为新，其次按时间字段 */
  function newer(a, b) {
    const ta = (a.track || []).length, tb = (b.track || []).length;
    if (ta !== tb) return ta > tb ? a : b;
    return String(a.updatedAt || a.date || a.time || '') >= String(b.updatedAt || b.date || b.time || '') ? a : b;
  }
  /* 把 source 的流水表并入 target（原地修改并返回）：并集 + 同 id 取较新；gone 里的墓碑条目不再并回 */
  function mergeUnionsInto(target, source, gone) {
    gone = gone || {};
    UNION_ARRAYS.forEach(function (k) {
      const tArr = Array.isArray(target[k]) ? target[k] : [];
      const sArr = Array.isArray(source[k]) ? source[k] : [];
      if (!tArr.length && !sArr.length) return;
      const remIds = new Set(gone[k] || []);
      const map = new Map();
      tArr.forEach(function (x) { const id = idOf(x); if (!remIds.has(id)) map.set(id, x); });
      sArr.forEach(function (x) {
        const id = idOf(x);
        if (remIds.has(id)) return;
        map.set(id, map.has(id) ? newer(map.get(id), x) : x);
      });
      target[k] = Array.from(map.values());
    });
    return target;
  }

  /* 把 local 的流水并入 remote（拉取云端时用） */
  function mergeBoth(remote, local) {
    return mergeUnionsInto(remote, local, local.__removed || {});
  }

  /* 用云端数据覆盖本机（云端为准，删除才会真正生效）；同时并入本机尚未上云的流水新增，
     若确实并入了本机新增，则把合并结果回推云端落库，避免只留在本机、下次又被旧快照冲掉。 */
  function applyRemote(row) {
    const remote = normalize(JSON.parse(JSON.stringify(row.data)));
    const local = cleanSnapshot();
    const before = JSON.stringify(remote);
    mergeBoth(remote, local);
    /* 本机较新的密码不被云端旧快照覆盖（按 pwdAt 择优） */
    mergePasswords(remote, local);
    /* 本地删除墓碑并入云端快照，持久化后旧副本不再复活 */
    remote.__removed = mergeGone(local.__removed, remote.__removed);
    Object.keys(db).forEach(function (k) { delete db[k]; });
    Object.assign(db, remote, { [FLAG]: row.updated_at || iso() });
    persistLocal();
    localStorage.removeItem(PENDING);
    if (localPersisted && JSON.stringify(remote) !== before) pushLocal();
  }

  function pullRemote() {
    localPersisted = !!localStorage.getItem(STORE_KEY);
    /* 启动一律先拉云端：避免本地残留的“待推送”标记把大快照回写排在拉取之前，
       导致读不到云端台账、空本地缓存无法登录。本地流水新增由 applyRemote 合并后再回推。 */
    readRemoteRetry().then(function (row) {
      remoteReached = true;
      stopReconnect();
      if (!row || !row.data || !Array.isArray(row.data.members)) {
        pushLocal();
        status('云端已连接 · 已建立首份数据', true);
        markReady();
        return;
      }
      applyRemote(row);
      status('云端已连接 · 名单实时同步', true);
      markReady();
    }).catch(function (err) {
      const hasLocal = !!localStorage.getItem(STORE_KEY);
      const http = err && err.status ? `（HTTP ${err.status}，云端响应超时）` : '（网络不可达）';
      status(hasLocal ? `云端离线 · 仅本机数据可用${http}` : `云端离线 · 暂无可用台账${http}`, false);
      markReady();
      scheduleReconnect();
    });
  }

  /* ---------- 自动重连：离线后不再必须刷新页面，恢复网络/云端负载回落后自动拉回 ----------
   * 间隔 8 秒起、逐步放宽到 60 秒；切到后台暂停，回到前台立即补一次。 */
  let reconnectTimer = null;
  let reconnectCount = 0;

  function stopReconnect() {
    if (reconnectTimer) { clearTimeout(reconnectTimer); reconnectTimer = null; }
    reconnectCount = 0;
  }

  function scheduleReconnect(delay) {
    if (reconnectTimer) return; /* 已在排队，避免叠加多个定时器 */
    const wait = delay || Math.min(8000 + reconnectCount * 4000, 60000);
    reconnectTimer = setTimeout(function () {
      reconnectTimer = null;
      if (document.visibilityState === 'hidden') { scheduleReconnect(30000); return; }
      reconnectCount += 1;
      readRemoteRetry().then(function (row) {
        remoteReached = true;
        reconnectCount = 0;
        if (!row || !row.data) { scheduleReconnect(); return; }
        applyRemote(row);
        status('云端已连接 · 名单实时同步', true);
        stopReconnect();
        if (localStorage.getItem(PENDING) === '1') pushLocal();
        /* 登录后重连成功：重绘当前页面，让拉回的最新台账立即生效 */
        try { if (cur && typeof render === 'function') render(); } catch (e) { /* 忽略 */ }
      }).catch(function () {
        status('云端离线 · 正在自动重试连接…', false);
        scheduleReconnect();
      });
    }, wait);
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
    if (document.visibilityState === 'hidden') {
      if (localStorage.getItem(PENDING) === '1') pushLocal();
      return;
    }
    /* 回到前台：若此前离线或仍有改动未上云，立即补一次连接 */
    if (!remoteReached || localStorage.getItem(PENDING) === '1') {
      stopReconnect();
      scheduleReconnect(800);
    }
  });

  /* 兜底：云端再慢/不可达，45 秒内一定放行登录；大快照拉取可能超过 10 秒，不能提前锁死空台账 */
  setTimeout(markReady, 45000);

  if (typeof fetch === 'function') pullRemote();
  else { status('当前浏览器不支持联网同步', false); markReady(); }
})();
