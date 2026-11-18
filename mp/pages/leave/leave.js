const { makeListPage } = require('../../utils/list-page');
const ui = require('../../utils/ui');
const store = require('../../utils/store');

Page(makeListPage({
  title: '请假管理',
  key: 'leaves',
  detail: 'leave',
  filter: (a, ctx) => (true),
  mapRow: (a) => ({
    id: a.id,
    detail: 'leave',
    title: `${a.applicant || a.name || ''} · ${a.type || '请假'}`,
      sub1: `${a.dept || ''} · ${a.reason || ''}`,
      sub2: `${a.start || ''} ~ ${a.end || ''}`,
      status: a.status, tone: ui.toneClass(a.status), canDel: store.allPower()
  })
}));
