/* 云南工业信息职业学院应用经济系学生会管理系统 */
const STORE_KEY = 'su_ms_v4';
const SESS_KEY = 'su_current';

const ICONS = {
  dashboard: '<rect x="3" y="3" width="8" height="8" rx="2"/><rect x="13" y="3" width="8" height="8" rx="2"/><rect x="3" y="13" width="8" height="8" rx="2"/><rect x="13" y="13" width="8" height="8" rx="2"/>',
  monitor: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
  logs: '<path d="M5 5h14M5 10h14M5 15h9M5 20h9"/><circle cx="18" cy="15" r="2.2"/>',
  activity: '<rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 9.5h17M8 3v3.5M16 3v3.5M8 14h3"/>',
  personnel: '<circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5"/><path d="M17.5 11.5v6M14.5 14.5h6"/>',
  accounts: '<rect x="4" y="10" width="16" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/><circle cx="12" cy="15" r="1.4"/>',
  dept: '<path d="M4 21V6l8-3 8 3v15M4 21h16M9 21v-5h6v5M9 9h2M13 9h2M9 12h2M13 12h2"/>',
  assess: '<path d="M5 4h14v16H5z"/><path d="M8.5 9h7M8.5 12.5h7M8.5 16h4"/>',
  notice: '<path d="M4 10.5v3a2 2 0 0 0 2 2h2l5 4V4.5L8 8.5H6a2 2 0 0 0-2 2z"/><path d="M17 8.5a5 5 0 0 1 0 7"/>',
  leave: '<rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 9.5h17M8 3v3.5M16 3v3.5M12 12v4M10 16h4"/>',
  join: '<circle cx="12" cy="8" r="3.4"/><path d="M5.5 20c0-3.6 3-6 6.5-6 2 0 3.7.9 4.9 2.4"/><path d="M17.5 15v6M14.5 18h6"/>',
  attendance: '<circle cx="12" cy="12" r="8.5"/><path d="M8 12.2l2.8 2.8L16.5 9"/>',
  asset: '<path d="M3.5 8.2l8.5-4 8.5 4-8.5 4z"/><path d="M3.5 8.2v7.6l8.5 4 8.5-4V8.2M12 12.2v7.6"/>',
  profile: '<circle cx="12" cy="8" r="3.4"/><path d="M4.5 20c0-3.9 3.3-6.4 7.5-6.4s7.5 2.5 7.5 6.4"/>',
  collect: '<path d="M4.5 5h15v14h-15z"/><path d="M8 9h8M8 12.5h8M8 16h4.5"/>',
  event: '<rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 9.5h17M8 3v3.5M16 3v3.5M9 14l1.7 1.7L14 12.2"/>'
};

const MENU = {
  admin: [
    ['dashboard', '工作台'], ['monitor', '系统监测'], ['logs', '操作日志'], ['activity', '活动审批'],
    ['personnel', '人事管理'], ['accounts', '账号管理'], ['dept', '部门审核'], ['assess', '考核管理'], ['notice', '通知管理'],
    ['leave', '请假审批'], ['join', '加入申请'], ['collect', '信息收集'], ['event', '活动报名'], ['profile', '个人信息']
  ],
  presidium: [
    ['dashboard', '工作台'], ['activity', '活动审批'], ['personnel', '人事管理'], ['dept', '部门管理'],
    ['assess', '考核管理'], ['notice', '通知管理'], ['leave', '请假管理'], ['join', '加入申请'],
    ['collect', '信息收集'], ['event', '活动报名'], ['profile', '个人信息']
  ],
  minister: [
    ['dashboard', '工作台'], ['dept', '部门信息'], ['activity', '活动管理'], ['assess', '成员考核'],
    ['leave', '请假管理'], ['join', '加入申请'], ['notice', '通知管理'], ['collect', '信息收集'],
    ['event', '活动报名'], ['attendance', '考勤签到'], ['asset', '物资借还'], ['profile', '个人信息']
  ],
  student: [
    ['dashboard', '工作台'], ['dept', '部门信息'], ['join', '我的申请'], ['notice', '通知公告'],
    ['leave', '我的请假'], ['event', '活动报名'], ['collect', '信息上传'], ['profile', '个人信息']
  ]
};

const PAGE_META = {
  dashboard: ['工作台', '今日待办与审批概览'],
  monitor: ['系统监测', '数据规模、存储占用与运行状态'],
  logs: ['操作日志', '账号关键操作留痕，可导出与检索'],
  activity: ['活动与审批', '活动申请、部长/副部长审批、撤回全流程'],
  personnel: ['人事管理', '成员信息、批量导入与任免记录'],
  accounts: ['账号管理', '管理员导入登录账号、重置密码与移除账号'],
  dept: ['部门管理', '部门信息与成员同步'],
  assess: ['考核管理', '按层级开展任务完成度考核'],
  notice: ['通知公告', '通知的发布与撤回'],
  leave: ['请假管理', '请假申请与逐级审核'],
  join: ['加入申请', '普通学生入会申请与审核'],
  attendance: ['考勤签到', '例会签到与出勤统计（部长团附加）'],
  asset: ['物资借还', '物资台账与借还登记（部长团附加）'],
  profile: ['个人信息', '资料维护、密码修改与权限说明']
};

let db = load();
let cur = null;

/* ---------------- 数据 ---------------- */
function normalize(db) {
  (db.accounts || []).forEach((a) => {
    a.gender = a.gender || ''; a.ethnicity = a.ethnicity || '汉族'; a.politics = a.politics || '';
    a.account = a.account || a.username;
  });
  (db.members || []).forEach((m) => {
    m.gender = m.gender || ''; m.ethnicity = m.ethnicity || '汉族'; m.politics = m.politics || '';
    if (!m.account) { const acc = db.accounts.find((a) => a.name === m.name && (a.sno === m.sno || a.sno === '—')); if (acc) m.account = acc.username; }
  });
  return db;
}
function load() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      if (data && data.members && data.accounts) return normalize(data);
    }
  } catch (e) { /* 损坏则重建 */ }
  const fresh = JSON.parse(JSON.stringify(SEED));
  localStorage.setItem(STORE_KEY, JSON.stringify(fresh));
  return normalize(fresh);
}
function save() { localStorage.setItem(STORE_KEY, JSON.stringify(db)); }
function uid(p) { return p + Date.now().toString(36).slice(-4) + Math.random().toString(36).slice(2, 4); }

function log(action, detail = '') {
  db.logs = db.logs || [];
  db.logs.unshift({
    id: uid('g'),
    time: new Date().toLocaleString('zh-CN', { hour12: false }),
    user: cur ? cur.name : '系统',
    role: cur ? ROLE_NAMES[cur.role] : '系统',
    action, detail
  });
  if (db.logs.length > 300) db.logs.length = 300;
}
function commit(action, detail) { log(action, detail); save(); }

/* ---------------- 通用工具 ---------------- */
const $ = (s) => document.querySelector(s);
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const today = () => new Date().toISOString().slice(0, 10);
const allPower = () => ['admin', 'presidium'].includes(cur.role);
const isPublisher = () => ['admin', 'presidium', 'minister'].includes(cur.role);

function tone(status) {
  if (['已通过', '在任', '已发布', '正常', '在库', '进行中', '报名中'].includes(status)) return 'green';
  if (['待审核', '待审批', '待管理员审核', '借出'].includes(status)) return 'amber';
  if (['已驳回', '已罢免', '离任', '已截止'].includes(status)) return 'red';
  return 'gray';
}
function badge(text) { return `<span class="badge ${tone(text)}">${esc(text)}</span>`; }

function toast(msg) {
  const el = $('#toast');
  el.textContent = msg;
  el.classList.remove('hidden');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => el.classList.add('hidden'), 2400);
}

function exportCsv(filename, headers, rows) {
  const cell = (v) => `"${String(v == null ? '' : v).replace(/"/g, '""')}"`;
  const text = '\ufeff' + [headers, ...rows].map((r) => r.map(cell).join(',')).join('\r\n');
  const blob = new Blob([text], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename.endsWith('.csv') ? filename : filename + '.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  toast('已导出 ' + a.download);
}

/* ---------------- 多格式导出（Excel / Word / PDF / CSV） ---------------- */
function downloadBlob(blob, filename) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}

function buildTableHtml(headers, rows) {
  const th = headers.map((h) => `<th>${esc(h)}</th>`).join('');
  const trs = rows.map((r) => `<tr>${r.map((c) => `<td>${esc(c == null ? '' : c)}</td>`).join('')}</tr>`).join('');
  const empty = `<tr><td colspan="${headers.length}" class="empty">暂无数据</td></tr>`;
  return `<table border="1" cellspacing="0" cellpadding="6" style="border-collapse:collapse;font-family:'Microsoft YaHei',sans-serif;font-size:13px;width:100%"><thead><tr>${th}</tr></thead><tbody>${trs || empty}</tbody></table>`;
}

function exportTable(format, filename, headers, rows) {
  rows = rows || [];
  if (format === 'csv') return exportCsv(filename, headers, rows);

  if (format === 'excel') {
    const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel">
      <head><meta charset="UTF-8"><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>Sheet1</x:Name></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head>
      <body><h3 style="font-family:'Microsoft YaHei',sans-serif">${esc(filename)}</h3>${buildTableHtml(headers, rows)}</body></html>`;
    downloadBlob(new Blob(['\ufeff' + html], { type: 'application/vnd.ms-excel;charset=utf-8' }), filename + '.xls');
    toast('已导出 Excel：' + filename + '.xls');
    return;
  }

  if (format === 'word') {
    const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word">
      <head><meta charset="UTF-8"><style>body{font-family:'Microsoft YaHei',sans-serif}h3{font-size:16px}table{border-collapse:collapse;width:100%}th,td{border:1px solid #333;padding:6px;font-size:13px}th{background:#eef3fb}</style></head>
      <body><h3>${esc(filename)}</h3>${buildTableHtml(headers, rows)}</body></html>`;
    downloadBlob(new Blob(['\ufeff' + html], { type: 'application/msword;charset=utf-8' }), filename + '.doc');
    toast('已导出 Word：' + filename + '.doc');
    return;
  }

  if (format === 'pdf') {
    const w = window.open('', '_blank');
    if (!w) { toast('请允许浏览器弹出窗口后再导出 PDF'); return; }
    w.document.write(`<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8"><title>${esc(filename)}</title>
      <style>body{font-family:'Microsoft YaHei',sans-serif;padding:24px}h3{font-size:16px;margin:0 0 6px}p.sub{color:#666;font-size:12px;margin:0 0 12px}table{border-collapse:collapse;width:100%}th,td{border:1px solid #333;padding:6px;font-size:12px}th{background:#eef3fb}</style></head>
      <body><h3>${esc(SYSTEM.full)}</h3><p class="sub">${esc(filename)}</p>${buildTableHtml(headers, rows)}</body></html>`);
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 300);
    toast('已打开打印窗口，可另存为 PDF');
  }
}

function openExportPicker(filename, headers, rows) {
  $('#modalTitle').textContent = '导出：' + filename;
  $('#modalOk').classList.add('hidden');
  $('#modalCancel').textContent = '关闭';
  modalSubmit = null;
  $('#modalBody').innerHTML = `<p class="form-hint">选择导出格式，将按当前表格数据生成文件。</p>
    <div class="export-grid">
      <button class="primary-btn" data-fmt="excel">导出 Excel（.xls）</button>
      <button class="primary-btn light" data-fmt="word">导出 Word（.doc）</button>
      <button class="primary-btn light" data-fmt="pdf">导出 PDF（打印另存）</button>
      <button class="primary-btn light" data-fmt="csv">导出 CSV（.csv）</button>
    </div>`;
  $('#modalMask').classList.remove('hidden');
  document.querySelectorAll('#modalBody [data-fmt]').forEach((b) => {
    b.onclick = () => {
      exportTable(b.dataset.fmt, filename, headers, rows);
      if (b.dataset.fmt !== 'pdf') closeModal();
    };
  });
}

/* ---------------- 弹窗 ---------------- */
let modalSubmit = null;
function openForm({ title, fields = [], values = {}, okText = '保存', hint = '', extra = '', onSubmit }) {
  $('#modalTitle').textContent = title;
  $('#modalOk').textContent = okText;
  $('#modalOk').classList.remove('hidden');
  $('#modalCancel').textContent = '取消';
  $('#modalBody').innerHTML = (hint ? `<p class="form-hint">${hint}</p>` : '') + fields.map((f) => {
    const v = values[f.key] == null ? '' : values[f.key];
    const req = f.required ? ' required' : '';
    const ph = f.placeholder ? ` placeholder="${esc(f.placeholder)}"` : '';
    if (f.type === 'select') {
      const opts = f.options.map((o) => `<option value="${esc(o)}"${o === v ? ' selected' : ''}>${esc(o)}</option>`).join('');
      return `<div class="field"><label>${esc(f.label)}</label><select id="f_${f.key}"${req}>${opts}</select></div>`;
    }
    if (f.type === 'textarea') {
      return `<div class="field"><label>${esc(f.label)}</label><textarea id="f_${f.key}"${req}${ph}>${esc(v)}</textarea></div>`;
    }
    return `<div class="field"><label>${esc(f.label)}</label><input id="f_${f.key}" type="${f.type || 'text'}" value="${esc(v)}"${req}${ph}></div>`;
  }).join('') + extra;
  modalSubmit = () => {
    const data = {};
    for (const f of fields) {
      const el = $('#f_' + f.key);
      if (!el) continue;
      const val = el.value.trim();
      if (f.required && !val) { el.focus(); toast('请填写' + f.label); return; }
      data[f.key] = f.type === 'number' ? Number(val || 0) : val;
    }
    onSubmit(data);
    closeModal();
  };
  $('#modalMask').classList.remove('hidden');
  return $('#modalBody');
}

function openInfo(title, html, footNote) {
  $('#modalTitle').textContent = title;
  $('#modalOk').classList.add('hidden');
  $('#modalCancel').textContent = '关闭';
  $('#modalBody').innerHTML = html + (footNote ? `<p class="form-hint">${footNote}</p>` : '');
  modalSubmit = null;
  $('#modalMask').classList.remove('hidden');
}

function closeModal() { $('#modalMask').classList.add('hidden'); modalSubmit = null; }
$('#modalClose').onclick = closeModal;
$('#modalCancel').onclick = closeModal;
$('#modalOk').onclick = () => modalSubmit && modalSubmit();
$('#modalMask').onclick = (e) => { if (e.target.id === 'modalMask') closeModal(); };

/* ---------------- 登录 ---------------- */
function doLogin() {
  const u = $('#loginUser').value.trim();
  const p = $('#loginPass').value;
  const acc = db.accounts.find((a) => a.username === u && a.password === p);
  if (!acc) {
    $('#loginErr').textContent = '账号或密码不正确，请联系管理员核实';
    $('#loginErr').classList.remove('hidden');
    return;
  }
  sessionStorage.setItem(SESS_KEY, acc.username);
  enterApp(acc);
  commit('登录系统', `账号 ${acc.username}`);
}

function enterApp(acc) {
  cur = Object.assign({}, acc);
  $('#loginPage').classList.add('hidden');
  $('#shell').classList.remove('hidden');
  $('#userName').textContent = acc.name;
  $('#userTitle').textContent = acc.title + (acc.dept && acc.dept !== '未加入' ? ' · ' + acc.dept : '');
  $('#userAvatar').textContent = acc.name.slice(-1);
  $('#roleBadge').textContent = ROLE_NAMES[acc.role];
  document.title = SYSTEM.full;

  $('#nav').innerHTML = MENU[acc.role].map(([key, label], i) => `
    <button class="nav-item${i === 0 ? ' active' : ''}" data-view="${key}">
      <svg viewBox="0 0 24 24" aria-hidden="true">${ICONS[key]}</svg>${label}</button>`).join('');
  document.querySelectorAll('.nav-item').forEach((b) => {
    b.onclick = () => {
      document.querySelector('.sidebar').classList.remove('open');
      switchView(b.dataset.view);
    };
  });
  switchView(MENU[acc.role][0][0]);
}

$('#loginBtn').onclick = doLogin;
$('#loginPass').addEventListener('keydown', (e) => { if (e.key === 'Enter') doLogin(); });
$('#loginUser').addEventListener('keydown', (e) => { if (e.key === 'Enter') $('#loginPass').focus(); });
$('#logoutBtn').onclick = () => {
  commit('退出登录', `账号 ${cur.username}`);
  sessionStorage.removeItem(SESS_KEY);
  location.reload();
};
$('#menuBtn').onclick = (e) => { e.stopPropagation(); document.querySelector('.sidebar').classList.toggle('open'); };
document.addEventListener('click', (e) => {
  if (!e.target.closest('.sidebar') && !e.target.closest('#menuBtn')) document.querySelector('.sidebar').classList.remove('open');
});

/* ---------------- 视图 ---------------- */
let curView = 'dashboard';
function pageMeta(view) {
  if (view === 'collect') return isPublisher() ? ['信息收集', '发布收集任务，查看统计与导出'] : ['信息上传', '填写已发布的信息收集表并提交'];
  if (view === 'event') return isPublisher() ? ['活动报名', '发布报名活动，查看与导出报名名单'] : ['活动报名', '选择活动报名，或取消已报名活动'];
  if (view === 'leave') return cur.role === 'admin' ? ['请假审批', '审核主席团请假']
    : cur.role === 'presidium' ? ['请假管理', '提交本人请假并审核部长请假']
    : ['我的请假', '提交请假申请并查看审批进度'];
  return PAGE_META[view];
}

function switchView(view) {
  curView = view;
  document.querySelectorAll('.nav-item').forEach((b) => b.classList.toggle('active', b.dataset.view === view));
  const meta = pageMeta(view);
  $('#pageTitle').textContent = meta[0];
  $('#pageSub').textContent = meta[1];
  render();
}
function render() {
  const map = {
    dashboard: renderDashboard, activity: renderActivity, personnel: renderPersonnel, accounts: renderAccounts, dept: renderDept,
    assess: renderAssess, notice: renderNotice, leave: renderLeave, join: renderJoin,
    attendance: renderAttendance, asset: renderAsset, profile: renderProfile,
    collect: renderCollect, event: renderEvent, monitor: renderMonitor, logs: renderLogs
  };
  $('#views').innerHTML = '';
  (map[curView] || renderDashboard)();
}

/* ---------------- 工作台 ---------------- */
function pendingTasks() {
  const t = [];
  if (allPower() || cur.role === 'minister') {
    const acts = db.activities.filter((a) => a.status === '待审批').length;
    if (acts) t.push(['活动待审批', acts, 'activity']);
  }
  if (cur.role === 'admin') {
    const dr = db.deptRequests.filter((r) => r.status === '待管理员审核').length;
    if (dr) t.push(['部门申请待审核', dr, 'dept']);
  }
  if (cur.role === 'presidium' || cur.role === 'admin') {
    const k = db.assessments.filter((a) => a.targetRole === 'member' && a.status === '待审核').length;
    if (k) t.push(['成员考核待复核', k, 'assess']);
  }
  const leaveReviewer = { admin: '管理员', presidium: '主席团', minister: '部长/副部长' }[cur.role];
  if (leaveReviewer) {
    const l = db.leaves.filter((x) => x.status === '待审核' && x.reviewer === leaveReviewer).length;
    if (l) t.push(['请假待审核', l, 'leave']);
  }
  if (cur.role === 'minister') {
    const j = db.joinRequests.filter((x) => x.dept === cur.dept && x.status === '待审核').length;
    if (j) t.push(['入会申请待审核', j, 'join']);
  }
  const todo = db.collects.filter((c) => c.status === '进行中' && !c.submissions.some((s) => s.name === cur.name)).length;
  if (todo && cur.role === 'student') t.push(['待填写信息收集', todo, 'collect']);
  return t;
}

function renderDashboard() {
  const tasks = pendingTasks();
  const activeMembers = db.members.filter((m) => m.status === '在任').length;
  const openEvents = db.events.filter((e) => e.status === '报名中').length;

  const roleBrief = {
    admin: '管理员拥有全部权限，并可查看系统监测数据与操作日志。',
    presidium: '主席、副主席拥有全部权限：审批活动与请假、任免成员、管理部门、考核部长、发布收集与报名。',
    minister: '您可维护本部门信息与成员、申请活动、考核部内成员、审批请假与入会申请、发布收集与活动报名。',
    student: '您可查看部门信息、申请加入部门、提交请假、报名活动、填写信息收集表。'
  };

  $('#views').innerHTML = `
    <div class="hero">
      <div>
        <h2>${esc(ROLE_NAMES[cur.role])} · ${esc(cur.name)}</h2>
        <p>${roleBrief[cur.role]}</p>
      </div>
      <span class="pill">${esc(SYSTEM.school)} · ${esc(SYSTEM.dept)}</span>
    </div>
    <div class="stats">
      <div class="stat"><div class="k">待我处理</div><div class="v">${tasks.reduce((s, x) => s + x[1], 0)}</div><div class="t">${tasks.length ? tasks.map((x) => x[0]).join('、') : '暂无待办'}</div></div>
      <div class="stat"><div class="k">在任成员</div><div class="v">${activeMembers}</div><div class="t">覆盖 ${db.departments.filter((d) => d.status === '正常').length} 个部门</div></div>
      <div class="stat"><div class="k">进行中收集</div><div class="v">${db.collects.filter((c) => c.status === '进行中').length}</div><div class="t">已提交 ${db.collects.reduce((s, c) => s + c.submissions.length, 0)} 份</div></div>
      <div class="stat"><div class="k">可报名活动</div><div class="v">${openEvents}</div><div class="t">报名总人次 ${db.events.reduce((s, e) => s + e.signups.length, 0)}</div></div>
    </div>
    <div class="grid-2">
      <div class="card">
        <div class="card-head"><div><h2>我的待办</h2><div class="sub">按当前角色权限汇总</div></div></div>
        ${tasks.length ? `<div class="notice-list">${tasks.map(([label, n, key]) => `
          <div class="notice-item todo-item" data-go="${key}">
            <h4>${esc(label)}<span class="badge amber">${n}</span></h4>
            <p>点击进入处理</p>
          </div>`).join('')}</div>` : '<div class="empty">当前没有需要您处理的审批事项</div>'}
      </div>
      <div class="card">
        <div class="card-head"><div><h2>最新通知</h2><div class="sub">仅显示已发布公告</div></div>
          <button class="primary-btn light" data-go="notice">查看全部</button></div>
        <div class="notice-list">${db.notices.filter((n) => n.status === '已发布').slice(0, 3).map((n) => `
          <div class="notice-item">
            <h4><span class="badge blue">${esc(n.type)}</span>${esc(n.title)}</h4>
            <p>${esc(n.content)}</p>
            <div class="notice-meta">${esc(n.date)} · ${esc(n.publisherName)}（${esc(n.publisher)}）</div>
          </div>`).join('') || '<div class="empty">暂无通知</div>'}
        </div>
      </div>
    </div>`;

  document.querySelectorAll('[data-go]').forEach((el) => {
    el.onclick = (e) => { e.stopPropagation(); switchView(el.dataset.go); };
  });
}

/* ---------------- 系统监测 ---------------- */
function renderMonitor() {
  const bytes = new Blob([localStorage.getItem(STORE_KEY) || '']).size;
  const kb = (bytes / 1024).toFixed(1);
  const tableStats = [
    ['账号', db.accounts.length], ['成员', db.members.length], ['部门', db.departments.length],
    ['活动', db.activities.length], ['通知', db.notices.length], ['请假', db.leaves.length],
    ['考核', db.assessments.length], ['入会申请', db.joinRequests.length],
    ['信息收集', db.collects.length], ['收集提交', db.collects.reduce((s, c) => s + c.submissions.length, 0)],
    ['活动报名', db.events.length], ['报名人次', db.events.reduce((s, e) => s + e.signups.length, 0)],
    ['操作日志', (db.logs || []).length]
  ];
  const roleCounts = {};
  db.accounts.forEach((a) => { roleCounts[ROLE_NAMES[a.role]] = (roleCounts[ROLE_NAMES[a.role]] || 0) + 1; });
  const recent = (db.logs || []).slice(0, 6);

  $('#views').innerHTML = `
    <div class="stats">
      <div class="stat"><div class="k">本地存储占用</div><div class="v">${kb}<span style="font-size:13px"> KB</span></div><div class="t">浏览器 localStorage 存储</div></div>
      <div class="stat"><div class="k">在任成员</div><div class="v">${db.members.filter((m) => m.status === '在任').length}</div><div class="t">共 ${db.members.length} 条成员记录</div></div>
      <div class="stat"><div class="k">账号数量</div><div class="v">${db.accounts.length}</div><div class="t">${Object.entries(roleCounts).map(([r, n]) => esc(r) + ' ' + n).join(' · ')}</div></div>
      <div class="stat"><div class="k">最近操作</div><div class="v">${recent.length ? recent[0].time.slice(5, 16) : '—'}</div><div class="t">${recent.length ? esc(recent[0].user) + ' · ' + esc(recent[0].action) : '暂无日志'}</div></div>
    </div>
    <div class="grid-2">
      <div class="card">
        <div class="card-head"><div><h2>数据规模</h2><div class="sub">各业务表当前记录条数</div></div></div>
        <div class="table-wrap"><table>
          <thead><tr><th>数据表</th><th>记录数</th></tr></thead>
          <tbody>${tableStats.map(([k, v]) => `<tr><td>${esc(k)}</td><td><strong>${v}</strong></td></tr>`).join('')}</tbody>
        </table></div>
      </div>
      <div class="card">
        <div class="card-head"><div><h2>最近操作日志</h2><div class="sub">完整日志在「操作日志」页查看</div></div>
          <button class="primary-btn light" data-go="logs">进入日志</button></div>
        <div class="notice-list">${recent.map((g) => `
          <div class="notice-item">
            <h4>${esc(g.action)} <span class="cell-sub">${esc(g.user)}（${esc(g.role)}）</span></h4>
            <p>${esc(g.detail || '—')}</p>
            <div class="notice-meta">${esc(g.time)}</div>
          </div>`).join('') || '<div class="empty">暂无日志</div>'}
        </div>
      </div>
    </div>`;
  document.querySelectorAll('[data-go]').forEach((el) => { el.onclick = () => switchView(el.dataset.go); });
}

/* ---------------- 操作日志 ---------------- */
function renderLogs() {
  const logs = db.logs || [];
  $('#views').innerHTML = `
    <div class="card">
      <div class="card-head">
        <div><h2>操作日志</h2><div class="sub">账号关键操作自动留痕，保留最近 300 条</div></div>
        <div class="toolbar">
          <select class="filter" id="logFilter">
            <option value="">全部操作人</option>
            ${[...new Set(logs.map((g) => g.user))].map((u) => `<option value="${esc(u)}">${esc(u)}</option>`).join('')}
          </select>
          <button class="primary-btn light" id="exportLogs">导出日志</button>
          <button class="primary-btn light" id="clearLogs">清空日志</button>
        </div>
      </div>
      <div class="table-wrap"><table>
        <thead><tr><th>时间</th><th>操作人</th><th>角色</th><th>操作</th><th>详情</th></tr></thead>
        <tbody id="logBody"></tbody>
      </table></div>
    </div>`;

  function drawLogs(filter = '') {
    const rows = logs.filter((g) => !filter || g.user === filter);
    $('#logBody').innerHTML = rows.map((g) => `
      <tr><td class="nowrap">${esc(g.time)}</td><td><strong>${esc(g.user)}</strong></td><td>${esc(g.role)}</td>
      <td>${esc(g.action)}</td><td>${esc(g.detail || '—')}</td></tr>`).join('')
      || '<tr><td colspan="5" class="empty">暂无日志</td></tr>';
  }
  drawLogs();
  $('#logFilter').onchange = (e) => drawLogs(e.target.value);

  $('#exportLogs').onclick = () => {
    const rows = logs.map((g) => [g.time, g.user, g.role, g.action, g.detail]);
    openExportPicker('操作日志_' + today(), ['时间', '操作人', '角色', '操作', '详情'], rows);
  };
  $('#clearLogs').onclick = () => {
    if (!confirm('确定清空全部操作日志？此操作不可恢复。')) return;
    db.logs = [];
    commit('清空日志', '清空全部操作记录');
    save(); render();
  };
}
