const app = getApp();

Page({
  data: { username: '', password: '', err: '', loading: false },

  onShow() {
    app.ensureReady().then(() => {
      if (app.globalData.cur) wx.reLaunch({ url: '/pages/dashboard/dashboard' });
    });
  },

  onUser(e) { this.setData({ username: e.detail.value }); },
  onPass(e) { this.setData({ password: e.detail.value }); },

  submit() {
    if (this.data.loading) return;
    const { username, password } = this.data;
    if (!username || !password) { this.setData({ err: '请输入账号和密码' }); return; }
    this.setData({ loading: true, err: '' });
    const res = app.login(username.trim(), password);
    this.setData({ loading: false });
    if (!res.ok) { this.setData({ err: res.msg }); return; }
    wx.reLaunch({ url: '/pages/dashboard/dashboard' });
  }
});
