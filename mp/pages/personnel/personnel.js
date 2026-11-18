const { makeListPage } = require('../../utils/list-page');
const ui = require('../../utils/ui');
const store = require('../../utils/store');

Page(makeListPage({
  title: '人事管理',
  key: 'members',
  detail: 'member',
  filter: (a, ctx) => (true),
  mapRow: (a) => ({
    id: a.id,
    detail: 'member',
    title: `${a.name || ''}`,
      sub1: `${a.dept || ''} · ${a.title || ''}`,
      sub2: `${a.class || ''} · ${a.sno || ''}`,
      status: a.status || '在任', tone: ui.toneClass(a.status || '在任'), canDel: store.allPower()
  }),
  actions: [{
    act: 'del',
    run(page, id, ctx) {
      wx.showModal({
        title: '确认删除', content: '删除后记录不可恢复',
        success: (res) => {
          if (!res.confirm) return;
          ctx.db['members'] = (ctx.db['members'] || []).filter((x) => x.id !== id);
          store.commit('删除记录', id);
          page.refresh();
          wx.showToast({ title: '已删除', icon: 'none' });
        }
      });
    }
  }]
}));
