const { makeListPage } = require('../../utils/list-page');
const ui = require('../../utils/ui');
const store = require('../../utils/store');

Page(makeListPage({
  title: '考核管理',
  key: 'assessments',
  detail: 'assess',
  filter: (a, ctx) => (true),
  mapRow: (a) => ({
    id: a.id,
    detail: 'assess',
    title: a.target || a.name || '考核记录',
      sub1: `${a.dept || ''} · ${a.period || ''} · 提交人 ${a.submitter || '—'}`,
      sub2: `总分 ${a.score != null ? a.score : '—'}`,
      status: a.status || '', tone: ui.toneClass(a.status || ''), canDel: store.allPower()
  })
}));
