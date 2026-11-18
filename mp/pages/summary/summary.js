const { makeListPage } = require('../../utils/list-page');
const ui = require('../../utils/ui');
const store = require('../../utils/store');

Page(makeListPage({
  title: '申请事宜汇总',
  key: 'applies',
  detail: 'apply',
  filter: (a, ctx) => (ctx.cur.role === 'minister' && ctx.cur.dept !== '秘书部' ? a.dept === ctx.cur.dept : true),
  mapRow: (a) => ({
    id: a.id,
    detail: 'apply',
    title: `${a.name} · ${store.typeName(a)}`,
      sub1: `${a.dept} · ${a.title}`,
      sub2: `${ui.flowLabel(a)}｜${ui.trackText(a)}`,
      status: a.status, tone: ui.toneClass(a.status),
      canDel: store.allPower()
  }),
  actions: [{
    act: 'del',
    run(page, id, ctx) {
      wx.showModal({
        title: '确认删除', content: '删除后记录不可恢复',
        success: (res) => {
          if (!res.confirm) return;
          ctx.db['applies'] = (ctx.db['applies'] || []).filter((x) => x.id !== id);
          store.commit('删除记录', id);
          page.refresh();
          wx.showToast({ title: '已删除', icon: 'none' });
        }
      });
    }
  }]
}));
