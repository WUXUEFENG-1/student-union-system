/* 云端同步：与网页端同一 Supabase REST 行（state id=1, data jsonb）；本地缓存兜底 */
const SB_URL = 'https://btyhldpdniccreccxnru.supabase.co';
const SB_KEY = 'sb_publishable_1xGqZG96WDbm-_9VqtyS7Q_bdi_pVhy';
const TABLE = 'state';
const ROW_ID = 1;
const STORE_KEY = 'su_ms_v4';
const SESS_KEY = 'su_current';

function request(method, url, data) {
  return new Promise((resolve, reject) => {
    wx.request({
      url,
      method,
      data,
      header: {
        apikey: SB_KEY,
        Authorization: 'Bearer ' + SB_KEY,
        'Content-Type': 'application/json',
        Prefer: 'return=representation'
      },
      timeout: 30000,
      success: (res) => resolve(res.data),
      fail: reject
    });
  });
}

function readLocal() {
  try {
    const raw = wx.getStorageSync(STORE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) { return null; }
}

function writeLocal(db) {
  try { wx.setStorageSync(STORE_KEY, JSON.stringify(db)); } catch (e) {}
}

function accKey(a) { return a && (a.username || a.account); }

/* 账号密码按 pwdAt 择优：较新修改的密码不被较旧快照覆盖 */
function mergePasswords(target, source) {
  const tMap = {};
  (target.accounts || []).forEach((a) => { const k = accKey(a); if (k) tMap[k] = a; });
  (source.accounts || []).forEach((s) => {
    const k = accKey(s);
    if (!k || !s.pwdAt) return;
    const t = tMap[k];
    if (t && (!t.pwdAt || s.pwdAt > t.pwdAt)) { t.password = s.password; t.pwdAt = s.pwdAt; }
  });
}

/* 流水类业务表：按唯一键双向合并，任一端新增都不丢失；同一条目取审批轨迹更完整的一方。
   成员/账号/部门等主数据仍以本机为准。 */
const UNION_ARRAYS = ['applies', 'logs', 'leaves', 'events', 'notices', 'collects', 'sessions', 'assets', 'assessments', 'joinRequests', 'deptRequests', 'activities', 'msgs'];
function idOf(x) { return x.id || x.username || (x.name + '|' + x.date + '|' + (x.typeName || x.type || '')); }
function newer(a, b) {
  const ta = (a.track || []).length, tb = (b.track || []).length;
  if (ta !== tb) return ta > tb ? a : b;
  return String(a.updatedAt || a.date || a.time || '') >= String(b.updatedAt || b.date || b.time || '') ? a : b;
}
function mergeUnionsInto(target, source, gone) {
  gone = gone || {};
  UNION_ARRAYS.forEach((k) => {
    const tArr = Array.isArray(target[k]) ? target[k] : [];
    const sArr = Array.isArray(source[k]) ? source[k] : [];
    if (!tArr.length && !sArr.length) return;
    const remIds = new Set(gone[k] || []);
    const map = new Map();
    tArr.forEach((x) => { const id = idOf(x); if (!remIds.has(id)) map.set(id, x); });
    sArr.forEach((x) => {
      const id = idOf(x);
      if (remIds.has(id)) return;
      map.set(id, map.has(id) ? newer(map.get(id), x) : x);
    });
    target[k] = Array.from(map.values());
  });
  return target;
}
function mergeGone(a, b) {
  const out = Object.assign({}, a || {});
  Object.keys(b || {}).forEach((k) => {
    out[k] = Array.from(new Set([...(out[k] || []), ...((b || {})[k] || [])]));
  });
  return out;
}

/* 拉取云端；失败则回退本地缓存。拉取时把本机尚未上云的新增流水并进来，避免被旧快照覆盖；
   若确实并入了本机新增/墓碑，回推云端落库，避免只留在本机、下次又被云端旧快照冲掉（对齐网页端 applyRemote）。 */
async function loadState() {
  try {
    const arr = await request('GET', `${SB_URL}/rest/v1/${TABLE}?id=eq.${ROW_ID}&select=data,updated_at`);
    if (Array.isArray(arr) && arr[0] && arr[0].data) {
      const remote = arr[0].data;
      const local = readLocal();
      let merged = false;
      if (local && local.accounts) {
        mergePasswords(remote, local);
        const before = JSON.stringify(remote);
        mergeUnionsInto(remote, local, local.__removed || {});
        remote.__removed = mergeGone(local.__removed, remote.__removed);
        merged = JSON.stringify(remote) !== before;
      }
      writeLocal(remote);
      if (merged) { try { await saveState(remote); } catch (e) { /* 回推失败保留本地，下次 commit 再补 */ } }
      return remote;
    }
    return readLocal();
  } catch (e) {
    return readLocal();
  }
}

/* 整份回写云端：以本机为底稿，流水表与云端并集合并，避免旧缓存把云端真实数据整段覆盖；
   失败仅保留本地，下次进入再补推 */
async function saveState(db) {
  writeLocal(db);
  try {
    let remote = null;
    try {
      const arr = await request('GET', `${SB_URL}/rest/v1/${TABLE}?id=eq.${ROW_ID}&select=data`);
      if (Array.isArray(arr) && arr[0] && arr[0].data) remote = arr[0].data;
    } catch (e) { remote = null; }
    const snap = JSON.parse(JSON.stringify(db));
    if (remote && remote.accounts) {
      const gone = mergeGone(snap.__removed, remote.__removed || {});
      mergeUnionsInto(snap, remote, gone);
      mergePasswords(snap, remote);
      snap.__removed = gone;
      /* 防御：本机为空种子台账而云端有真实名单时，主数据保留云端，避免空台账覆盖 */
      const seedLike = !(snap.members || []).length && !(snap.accounts || []).filter((a) => !['admin', 'teacher'].includes(a.role)).length;
      if (seedLike && (remote.members || []).length) {
        snap.members = remote.members;
        snap.accounts = remote.accounts;
        if (remote.departments) snap.departments = remote.departments;
      }
    }
    const payload = { id: ROW_ID, data: snap, updated_at: new Date().toISOString() };
    await request('PATCH', `${SB_URL}/rest/v1/${TABLE}?id=eq.${ROW_ID}`, payload);
  } catch (e) {
    try { wx.setStorageSync('__pendingPush', '1'); } catch (err) {}
  }
}

function getSession() { return wx.getStorageSync(SESS_KEY) || ''; }
function setSession(u) { wx.setStorageSync(SESS_KEY, u); }
function clearSession() { wx.removeStorageSync(SESS_KEY); }

module.exports = { loadState, saveState, readLocal, writeLocal, getSession, setSession, clearSession, STORE_KEY };
