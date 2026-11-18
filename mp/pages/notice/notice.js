const { makeListPage } = require('../../utils/list-page');
const ui = require('../../utils/ui');
const store = require('../../utils/store');

Page(makeListPage({
  title: '通知公告',
  key: 'notices',
  detail: 'notice',
  filter: (a, ctx) => (true),
  mapRow: (a) => ({
    id: a.id,
    detail: 'notice',
    title: a.title,
      sub1: `${a.type || (a.cat === 'news' ? '新闻动态' : '通知公告')} · ${a.date || ''}`,
      sub2: String(a.content || '').slice(0, 60),
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
          ctx.db['notices'] = (ctx.db['notices'] || []).filter((x) => x.id !== id);
          store.commit('删除记录', id);
          page.refresh();
          wx.showToast({ title: '已删除', icon: 'none' });
        }
      });
    }
  }]
}));
