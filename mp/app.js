const api = require('./utils/api');
const store = require('./utils/store');

App({
  globalData: {
    db: null,
    cur: null,
    ready: false
  },

  onLaunch() {
    this.bootstrap();
  },

  async bootstrap() {
    let db = await api.loadState();
    if (!db || !db.accounts) {
      db = require('./utils/seed');
    }
    this.globalData.db = store.normalize(db);
    const u = api.getSession();
    if (u) {
      const acc = (this.globalData.db.accounts || []).find((x) => x.username === u);
      if (acc) this.globalData.cur = this.refreshCur(acc);
    }
    this.globalData.ready = true;
  },

  refreshCur(acc) {
    const { db } = this.globalData;
    const mem = store.matchMember(db, acc);
    const cur = Object.assign({}, acc);
    if (mem) {
      ['name', 'gender', 'ethnicity', 'politics', 'class', 'major', 'phone', 'dept', 'title', 'sno'].forEach((k) => {
        if (mem[k] != null && mem[k] !== '' && mem[k] !== '—') cur[k] = mem[k];
      });
    }
    if (!['admin', 'teacher'].includes(cur.role)) cur.role = store.roleFromTitle(cur.title);
    return cur;
  },

  login(username, password) {
    const acc = (this.globalData.db.accounts || []).find((x) => x.username === username && x.password === password);
    if (!acc) return { ok: false, msg: '账号或密码不正确，请联系管理员核实' };
    this.globalData.cur = this.refreshCur(acc);
    api.setSession(acc.username);
    store.commit('登录系统', `账号 ${acc.username}`);
    return { ok: true };
  },

  logout() {
    this.globalData.cur = null;
    api.clearSession();
  },

  /* 页面进入时保证数据已就绪 */
  ensureReady() {
    return new Promise((resolve) => {
      if (this.globalData.ready) return resolve(this.globalData);
      const timer = setInterval(() => {
        if (this.globalData.ready) { clearInterval(timer); resolve(this.globalData); }
      }, 80);
    });
  }
});
