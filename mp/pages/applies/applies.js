const { makeListPage } = require('../../utils/list-page');
const ui = require('../../utils/ui');
const store = require('../../utils/store');
const exp = require('../../utils/export');

const page = makeListPage({
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
});

page.onExport = function () {
  const { db, cur } = getApp().globalData;
  const rows = (db.applies || []).filter((a) => a.name === cur.name).map((a) => [
    a.name, a.sno || '—', store.typeName(a), a.dept, a.title, a.status,
    ui.flowLabel(a), a.date || '', ui.trackText(a)
  ]);
  exp.exportCSV(`我的申请_${store.today()}`, ['姓名', '学号', '申请事项', '部门', '职务', '状态', '流程', '提交时间', '审批轨迹'], rows);
};

Page(page);
