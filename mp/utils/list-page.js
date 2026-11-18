/* 通用列表页工厂：减少各台账页面重复代码 */
const app = getApp();
const ui = require('./ui');

function makeListPage(cfg) {
  return {
    data: { list: [], title: '' },

    onShow() {
      app.ensureReady().then(() => {
        if (!app.globalData.cur) { wx.reLaunch({ url: '/pages/login/login' }); return; }
        this.refresh();
      });
    },

    refresh() {
      const { db, cur } = app.globalData;
      const ctx = { db, cur, app };
      let arr = (db[cfg.key] || []).slice();
      if (cfg.filter) arr = arr.filter((a) => cfg.filter(a, ctx));
      const list = arr.map((a, i) => Object.assign({ _idx: i }, cfg.mapRow(a, ctx, i)));
      this.setData({ list, title: cfg.title });
    },

    onView(e) {
      const { type, id } = e.currentTarget.dataset;
      ui.goDetail(type, id);
    },

    onAction(e) {
      const { act, id } = e.currentTarget.dataset;
      const handler = (cfg.actions || []).find((x) => x.act === act);
      if (handler) handler.run(this, id, { db: app.globalData.db, cur: app.globalData.cur, app });
    }
  };
}

module.exports = { makeListPage };
