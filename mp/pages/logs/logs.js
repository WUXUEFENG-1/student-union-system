const { makeListPage } = require('../../utils/list-page');
const ui = require('../../utils/ui');
const store = require('../../utils/store');

Page(makeListPage({
  title: '操作日志',
  key: 'logs',
  detail: 'log',
  filter: (a, ctx) => (true),
  mapRow: (a) => ({
    id: a.id,
    detail: 'log',
    title: `${a.action || ''}`,
      sub1: `${a.user || ''} · ${a.role || ''}`,
      sub2: `${a.detail || ''} ${a.time || ''}`,
      status: '', tone: 'gray', canDel: false
  })
}));
