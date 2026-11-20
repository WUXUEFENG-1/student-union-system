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

/* 拉取云端；失败则回退本地缓存 */
async function loadState() {
  try {
    const arr = await request('GET', `${SB_URL}/rest/v1/${TABLE}?id=eq.${ROW_ID}&select=data,updated_at`);
    if (Array.isArray(arr) && arr[0] && arr[0].data) {
      const remote = arr[0].data;
      const local = readLocal();
      if (local && local.accounts) mergePasswords(remote, local);
      writeLocal(remote);
      return remote;
    }
    return readLocal();
  } catch (e) {
    return readLocal();
  }
}

/* 整份回写云端；失败仅保留本地，下次进入再补推 */
async function saveState(db) {
  writeLocal(db);
  try {
    let remote = null;
    try {
      const arr = await request('GET', `${SB_URL}/rest/v1/${TABLE}?id=eq.${ROW_ID}&select=data`);
      if (Array.isArray(arr) && arr[0] && arr[0].data) remote = arr[0].data;
    } catch (e) { remote = null; }
    if (remote && remote.accounts) mergePasswords(db, remote);
    const payload = { id: ROW_ID, data: db, updated_at: new Date().toISOString() };
    await request('PATCH', `${SB_URL}/rest/v1/${TABLE}?id=eq.${ROW_ID}`, payload);
  } catch (e) {
    try { wx.setStorageSync('__pendingPush', '1'); } catch (err) {}
  }
}

function getSession() { return wx.getStorageSync(SESS_KEY) || ''; }
function setSession(u) { wx.setStorageSync(SESS_KEY, u); }
function clearSession() { wx.removeStorageSync(SESS_KEY); }

module.exports = { loadState, saveState, readLocal, writeLocal, getSession, setSession, clearSession, STORE_KEY };
