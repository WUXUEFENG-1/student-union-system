const app = getApp();
const store = require('../../utils/store');
const ui = require('../../utils/ui');

Page({
  data: {
    list: [],
    inStock: 0,
    borrowed: 0,
    canManage: false,
    showAdd: false,
    showBorrow: false,
    currentId: '',
    addForm: { name: '', qty: 1 },
    borrowForm: { borrower: '', date: store.today(), due: store.today() }
  },

  onShow() {
    app.ensureReady().then(() => {
      if (!app.globalData.cur) { wx.reLaunch({ url: '/pages/login/login' }); return; }
      this.refresh();
    });
  },

  refresh() {
    const { db, cur } = app.globalData;
    const list = (db.assets || []).map((t) => ({
      id: t.id, name: t.name, qty: t.qty, status: t.status,
      borrower: t.borrower || '—', date: t.date || '—', due: t.due || '—',
      tone: ui.toneClass(t.status)
    }));
    this.setData({
      list,
      inStock: list.filter((t) => t.status === '在库').length,
      borrowed: list.filter((t) => t.status === '借出').length,
      canManage: ['admin', 'teacher', 'presidium', 'minister'].includes(cur.role)
    });
  },

  toggleAdd() { this.setData({ showAdd: !this.data.showAdd, addForm: { name: '', qty: 1 } }); },
  onAddInput(e) { this.setData({ [`addForm.${e.currentTarget.dataset.key}`]: e.detail.value }); },

  addAsset() {
    const { name, qty } = this.data.addForm;
    if (!name.trim()) { wx.showToast({ title: '请填写物资名称', icon: 'none' }); return; }
    app.globalData.db.assets = app.globalData.db.assets || [];
    app.globalData.db.assets.push({ id: store.uid('t'), name: name.trim(), qty: Number(qty) || 1, borrower: '', date: '', due: '', status: '在库' });
    store.commit('新增物资', name.trim());
    this.setData({ showAdd: false });
    this.refresh();
  },

  onBorrowClick(e) {
    const id = e.currentTarget.dataset.id;
    const t = (app.globalData.db.assets || []).find((x) => x.id === id);
    if (!t) return;
    if (t.status === '借出') {
      Object.assign(t, { status: '在库', borrower: '', date: '', due: '' });
      store.commit('物资归还', t.name);
      this.refresh();
      wx.showToast({ title: '已归还入库', icon: 'none' });
      return;
    }
    this.setData({
      showBorrow: true, currentId: id,
      borrowForm: { borrower: app.globalData.cur.dept, date: store.today(), due: store.today() }
    });
  },

  onBorrowInput(e) { this.setData({ [`borrowForm.${e.currentTarget.dataset.key}`]: e.detail.value }); },
  onBorrowDate(e) { this.setData({ [`borrowForm.${e.currentTarget.dataset.key}`]: e.detail.value }); },

  submitBorrow() {
    const t = (app.globalData.db.assets || []).find((x) => x.id === this.data.currentId);
    const { borrower, date, due } = this.data.borrowForm;
    if (!borrower.trim()) { wx.showToast({ title: '请填写借用部门/人', icon: 'none' }); return; }
    Object.assign(t, { borrower: borrower.trim(), date, due, status: '借出' });
    store.commit('物资借出', `${t.name} → ${borrower.trim()}`);
    this.setData({ showBorrow: false });
    this.refresh();
  },

  delAsset(e) {
    const id = e.currentTarget.dataset.id;
    wx.showModal({
      title: '删除物资', content: '删除后不可恢复',
      success: (res) => {
        if (!res.confirm) return;
        app.globalData.db.assets = (app.globalData.db.assets || []).filter((x) => x.id !== id);
        store.commit('删除物资', id);
        this.refresh();
      }
    });
  }
});
