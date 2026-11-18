const { makeListPage } = require('../../utils/list-page');
const ui = require('../../utils/ui');
const store = require('../../utils/store');

Page(makeListPage({
  title: '部门信息',
  key: 'departments',
  detail: 'dept',
  filter: (a, ctx) => (true),
  mapRow: (a) => ({
    id: a.id,
    detail: 'dept',
    title: a.name,
      sub1: `负责人：${a.leader || '—'}`,
      sub2: a.desc || '',
      status: a.status || '正常', tone: ui.toneClass(a.status || '正常'), canDel: false
  })
}));
