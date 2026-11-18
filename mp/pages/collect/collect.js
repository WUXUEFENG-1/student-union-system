const { makeListPage } = require('../../utils/list-page');
const ui = require('../../utils/ui');
const store = require('../../utils/store');

Page(makeListPage({
  title: '信息收集',
  key: 'collects',
  detail: 'collect',
  filter: (a, ctx) => (true),
  mapRow: (a) => ({
    id: a.id,
    detail: 'collect',
    title: a.title || '信息收集',
      sub1: `${a.publisher || ''} · 截止 ${a.deadline || '—'}`,
      sub2: String(a.desc || a.content || '').slice(0, 60),
      status: a.status || '进行中', tone: ui.toneClass(a.status || '进行中'), canDel: store.allPower()
  })
}));
