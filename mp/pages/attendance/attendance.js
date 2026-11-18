const app = getApp();
const store = require('../../utils/store');

Page({
  data: {
    sessions: [],
    sessionId: '',
    sessionTitle: '',
    members: [],
    records: {},
    present: 0,
    total: 0,
    rate: 0,
    canManage: false,
    showForm: false,
    form: { title: '部门例会', date: store.today() }
  },

  onShow() {
    app.ensureReady().then(() => {
      if (!app.globalData.cur) { wx.reLaunch({ url: '/pages/login/login' }); return; }
      this.refresh();
    });
  },

  refresh() {
    const { db, cur } = app.globalData;
    const sessions = db.sessions || [];
    const canManage = ['admin', 'teacher', 'presidium', 'minister'].includes(cur.role);
    let members = (db.members || []).filter((m) => m.status === '在任');
    if (cur.role === 'minister') members = members.filter((m) => m.dept === cur.dept);
    let sessionId = this.data.sessionId;
    if (!sessions.some((s) => s.id === sessionId) && sessions.length) sessionId = sessions[0].id;
    const session = sessions.find((s) => s.id === sessionId) || null;
    const records = session ? session.records || {} : {};
    const present = members.filter((m) => records[m.id]).length;
    this.setData({
      sessions, sessionId, sessionTitle: session ? `${session.date} · ${session.title}` : '—',
      members, records,
      present, total: members.length,
      rate: members.length ? Math.round((present / members.length) * 100) : 0,
      canManage
    });
  },

  onSession(e) {
    this.setData({ sessionId: this.data.sessions[Number(e.detail.value)].id });
    this.refresh();
  },

  toggleForm() { this.setData({ showForm: !this.data.showForm }); },

  onFormInput(e) {
    const key = e.currentTarget.dataset.key;
    this.setData({ [`form.${key}`]: e.detail.value });
  },

  onFormDate(e) { this.setData({ 'form.date': e.detail.value }); },

  createSession() {
    const { title, date } = this.data.form;
    if (!title.trim() || !date) { wx.showToast({ title: '请填写主题和日期', icon: 'none' }); return; }
    const s = { id: store.uid('s'), title: title.trim(), date, records: {} };
    app.globalData.db.sessions = app.globalData.db.sessions || [];
    app.globalData.db.sessions.unshift(s);
    store.commit('新建例会', title);
    this.setData({ sessionId: s.id, showForm: false });
    this.refresh();
    wx.showToast({ title: '例会已创建', icon: 'none' });
  },

  toggleAtt(e) {
    if (!this.data.canManage) return;
    const mid = e.currentTarget.dataset.id;
    const session = (app.globalData.db.sessions || []).find((s) => s.id === this.data.sessionId);
    if (!session) return;
    session.records = session.records || {};
    session.records[mid] = !session.records[mid];
    store.commit('例会签到', `${session.title} · ${mid}`);
    this.refresh();
  }
});
