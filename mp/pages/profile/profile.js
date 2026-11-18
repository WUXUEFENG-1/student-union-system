const app = getApp();
const ui = require('../../utils/ui');

Page({
  data: { cur: null, roleName: '' },

  onShow() {
    app.ensureReady().then(() => {
      if (!app.globalData.cur) { wx.reLaunch({ url: '/pages/login/login' }); return; }
      const cur = app.globalData.cur;
      this.setData({ cur, roleName: ui.roleName(cur.role) });
    });
  },

  go(e) { wx.navigateTo({ url: e.currentTarget.dataset.path }); },

  logout() {
    wx.showModal({
      title: '退出登录', content: '确定要退出当前账号吗？',
      success: (res) => {
        if (!res.confirm) return;
        app.logout();
        wx.reLaunch({ url: '/pages/login/login' });
      }
    });
  }
});
