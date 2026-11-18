const app = getApp();
const store = require('../../utils/store');
const ui = require('../../utils/ui');
const { ROLE_NAMES } = require('../../utils/const');

Page({
  data: {
    list: [],
    canSubmit: false,
    showForm: false,
    form: { type: '事假', start: store.today(), end: store.today(), reason: '' },
    typeOptions: ['事假', '病假', '公假']
  },

  onShow() {
    app.ensureReady().then(() => {
      if (!app.globalData.cur) { wx.reLaunch({ url: '/pages/login/login' }); return; }
      this.refresh();
    });
  },

  refresh() {
    const { db, cur } = app.globalData;
    let arr = db.leaves || [];
    if (['admin', 'teacher', 'presidium'].includes(cur.role)) arr = arr.slice();
    else if (cur.role === 'minister') arr = arr.filter((l) => l.reviewer === '部长/副部长' || l.applicant === cur.name);
    else arr = arr.filter((l) => l.applicant === cur.name);

    const list = arr.map((l) => ({
      id: l.id,
      applicant: l.applicant,
      role: ROLE_NAMES[l.applicantRole] || l.applicantRole || '',
      dept: l.dept,
      type: l.type,
      start: l.start, end: l.end, reason: l.reason,
      reviewer: l.reviewer,
      status: l.status, tone: ui.toneClass(l.status),
      canReview: store.canReviewLeave(l),
      canRevoke: l.applicant === cur.name && l.status === '待审核',
      canDelete: l.applicant === cur.name || store.allPower()
    }));
    this.setData({ list, canSubmit: ['presidium', 'minister', 'student'].includes(cur.role) });
  },

  toggleForm() { this.setData({ showForm: !this.data.showForm }); },
  onInput(e) { this.setData({ [`form.${e.currentTarget.dataset.key}`]: e.detail.value }); },
  onType(e) { this.setData({ 'form.type': this.data.typeOptions[Number(e.detail.value)] }); },
  onDate(e) { this.setData({ [`form.${e.currentTarget.dataset.key}`]: e.detail.value }); },

  submit() {
    const { type, start, end, reason } = this.data.form;
    if (!start || !end || !reason.trim()) { wx.showToast({ title: '请填写完整请假信息', icon: 'none' }); return; }
    const cur = app.globalData.cur;
    app.globalData.db.leaves = app.globalData.db.leaves || [];
    app.globalData.db.leaves.push({
      id: store.uid('l'), applicant: cur.name, applicantRole: cur.role, dept: cur.dept,
      type, start, end, reason: reason.trim(), attach: '', attachData: '',
      status: '待审核', reviewer: store.LEAVE_REVIEWER[cur.role] || '部长/副部长', reviewNote: '', date: store.today()
    });
    store.commit('提交请假', `${type} ${start}—${end}`);
    this.setData({ showForm: false });
    this.refresh();
    wx.showToast({ title: '请假申请已提交', icon: 'none' });
  },

  onPass(e) {
    const l = (app.globalData.db.leaves || []).find((x) => x.id === e.currentTarget.dataset.id);
    if (!l || !store.canReviewLeave(l)) return;
    l.status = '已通过'; l.reviewNote = '同意';
    store.commit('请假通过', `${l.applicant} ${l.type}`);
    this.refresh();
  },

  onReject(e) {
    const l = (app.globalData.db.leaves || []).find((x) => x.id === e.currentTarget.dataset.id);
    if (!l || !store.canReviewLeave(l)) return;
    wx.showModal({
      title: '驳回请假', editable: true, placeholderText: '驳回原因',
      success: (res) => {
        if (!res.confirm) return;
        l.status = '已驳回'; l.reviewNote = (res.content || '').trim() || '驳回';
        store.commit('请假驳回', `${l.applicant}：${l.reviewNote}`);
        this.refresh();
      }
    });
  },

  onRevoke(e) {
    const l = (app.globalData.db.leaves || []).find((x) => x.id === e.currentTarget.dataset.id);
    if (!l) return;
    l.status = '已撤回';
    store.commit('撤回请假', l.applicant);
    this.refresh();
  },

  onDel(e) {
    const id = e.currentTarget.dataset.id;
    wx.showModal({
      title: '删除请假记录', content: '删除后不可恢复',
      success: (res) => {
        if (!res.confirm) return;
        app.globalData.db.leaves = (app.globalData.db.leaves || []).filter((x) => x.id !== id);
        store.commit('删除请假记录', id);
        this.refresh();
      }
    });
  }
});
