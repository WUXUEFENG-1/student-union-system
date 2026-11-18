const { makeListPage } = require('../../utils/list-page');
const ui = require('../../utils/ui');
const store = require('../../utils/store');

Page(makeListPage({
  title: '我的申请',
  key: 'applies',
  filter: (a, ctx) => a.name === ctx.cur.name,
  mapRow: (a) => ({
    id: a.id,
    name: a.name,
    typeName: store.typeName(a),
    dept: a.dept,
    title: a.title,
    status: a.status,
    tone: ui.toneClass(a.status),
    flow: ui.flowLabel(a),
    track: ui.trackText(a)
  })
}));
