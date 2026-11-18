const { makeListPage } = require('../../utils/list-page');
const ui = require('../../utils/ui');
const store = require('../../utils/store');

Page(makeListPage({
  title: '活动报名',
  key: 'events',
  detail: 'event',
  filter: (a, ctx) => (true),
  mapRow: (a) => ({
    id: a.id,
    detail: 'event',
    title: a.title || '活动报名',
      sub1: `${a.publisher || ''} · ${a.place || ''}`,
      sub2: `${a.start || ''} ~ ${a.end || ''}｜名额 ${(a.signups || []).length}/${a.quota || a.total || '—'}`,
      status: a.status || '报名中', tone: ui.toneClass(a.status || '报名中'), canDel: store.allPower()
  })
}));
