const { makeListPage } = require('../../utils/list-page');
const ui = require('../../utils/ui');
const store = require('../../utils/store');

Page(makeListPage({
  title: '活动管理',
  key: 'activities',
  detail: 'activity',
  filter: (a, ctx) => (true),
  mapRow: (a) => ({
    id: a.id,
    detail: 'activity',
    title: a.title,
      sub1: `${a.dept || ''} · ${a.total ? '总人数 ' + a.total : ''}`,
      sub2: `${a.place || ''} ${a.start || ''} ~ ${a.end || ''}`,
      status: a.status, tone: ui.toneClass(a.status), canDel: store.allPower()
  })
}));
