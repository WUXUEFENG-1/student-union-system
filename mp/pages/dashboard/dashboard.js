const app = getApp();
const store = require('../../utils/store');
const ui = require('../../utils/ui');

Page({
  data: { cur: null, menu: [], stats: {}, roleName: '' },

  onShow() {
    app.ensureReady().then(() => {
      if (!app.globalData.cur) { wx.reLaunch({ url: '/pages/login/login' }); return; }
      this.refresh();
    });
  },

  refresh() {
    const { db, cur } = app.globalData;
    const review = store.myReviewApplies();
    const acts = (db.activities || []).filter((a) => ['待审批', '待主席审核', '待主席团审核'].includes(a.status));
    const pendNotices = (db.notices || []).filter((n) => ['待副主席审核', '待主席审核'].includes(n.status));
    const unread = (db.msgs || []).filter((m) => m.to === cur.name && !m.read);
    this.setData({
      cur,
      roleName: ui.roleName(cur.role),
      menu: ui.menuItems(cur.role),
      stats: { review: review.length, acts: acts.length, notices: pendNotices.length, msgs: unread.length }
    });
  },

  onMenu(e) {
    const { path } = e.currentTarget.dataset;
    wx.navigateTo({ url: path });
  },

  goReview() { wx.navigateTo({ url: '/pages/review/review' }); }
});
