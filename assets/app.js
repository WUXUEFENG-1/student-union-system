/* 学生会信息管理系统 —— 五角色权限 + 审批流程（数据存 localStorage） */
const STORE_KEY = 'su_ms_v2';
const SESS_KEY = 'su_current';

const ICONS = {
  dashboard: '<rect x="3" y="3" width="8" height="8" rx="2"/><rect x="13" y="3" width="8" height="8" rx="2"/><rect x="3" y="13" width="8" height="8" rx="2"/><rect x="13" y="13" width="8" height="8" rx="2"/>',
  activity: '<rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 9.5h17M8 3v3.5M16 3v3.5M8 14h3"/>',
  personnel: '<circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5"/><path d="M17.5 11.5v6M14.5 14.5h6"/>',
  dept: '<path d="M4 21V6l8-3 8 3v15M4 21h16M9 21v-5h6v5M9 9h2M13 9h2M9 12h2M13 12h2"/>',
  assess: '<path d="M5 4h14v16H5z"/><path d="M8.5 9h7M8.5 12.5h7M8.5 16h4"/>',
  notice: '<path d="M4 10.5v3a2 2 0 0 0 2 2h2l5 4V4.5L8 8.5H6a2 2 0 0 0-2 2z"/><path d="M17 8.5a5 5 0 0 1 0 7"/>',
  leave: '<rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 9.5h17M8 3v3.5M16 3v3.5M12 12v4M10 16h4"/>',
  join: '<circle cx="12" cy="8" r="3.4"/><path d="M5.5 20c0-3.6 3-6 6.5-6 2 0 3.7.9 4.9 2.4"/><path d="M17.5 15v6M14.5 18h6"/>',
  attendance: '<circle cx="12" cy="12" r="8.5"/><path d="M8 12.2l2.8 2.8L16.5 9"/>',
  asset: '<path d="M3.5 8.2l8.5-4 8.5 4-8.5 4z"/><path d="M3.5 8.2v7.6l8.5 4 8.5-4V8.2M12 12.2v7.6"/>',
  profile: '<circle cx="12" cy="8" r="3.4"/><path d="M4.5 20c0-3.9 3.3-6.4 7.5-6.4s7.5 2.5 7.5 6.4"/>'
};

/* 各角色可见菜单（依据需求文档） */
const MENU = {
  teacher: [
    ['dashboard', '工作台'], ['activity', '活动审批'], ['personnel', '人事管理'],
    ['dept', '部门审核'], ['assess', '考核管理'], ['notice', '通知管理'], ['leave', '请假审批']
  ],
  presidium: [
    ['dashboard', '工作台'], ['activity', '活动审批'], ['personnel', '人事管理'],
    ['dept', '部门管理'], ['assess', '考核管理'], ['notice', '通知管理'], ['leave', '请假管理']
  ],
  minister: [
    ['dashboard', '工作台'], ['dept', '部门信息'], ['activity', '活动管理'], ['assess', '干事考核'],
    ['leave', '请假管理'], ['join', '加入申请'], ['notice', '通知管理'], ['attendance', '考勤签到'], ['asset', '物资借还']
  ],
  staff: [
    ['dashboard', '工作台'], ['notice', '通知公告'], ['leave', '我的请假'], ['profile', '个人信息']
  ],
  student: [
    ['dashboard', '工作台'], ['dept', '部门信息'], ['join', '我的申请'], ['notice', '通知公告']
  ]
};

const PAGE_META = {
  dashboard: ['工作台', '今日待办与审批概览'],
  activity: ['活动与审批', '活动申请、审批、撤回全流程'],
  personnel: ['人事管理', '职务任免与人事异动记录'],
  dept: ['部门管理', '部门信息维护与新增、罢免审核'],
  assess: ['考核管理', '按层级开展年度任务完成度考核'],
  notice: ['通知公告', '通知与活动通知的发布、撤回'],
  leave: ['请假管理', '请假申请与逐级审核'],
  join: ['加入申请', '普通学生入会申请与审核'],
  attendance: ['考勤签到', '例会签到与出勤统计（部长团附加）'],
  asset: ['物资借还', '物资台账与借还登记（部长团附加）'],
  profile: ['个人信息', '个人资料维护与权限说明']
};

let db = load();
let cur = null;

/* ---------------- 数据 ---------------- */
function load() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) { /* 损坏则重建 */ }
  const fresh = JSON.parse(JSON.stringify(SEED));
  localStorage.setItem(STORE_KEY, JSON.stringify(fresh));
  return fresh;
}
function save() { localStorage.setItem(STORE_KEY, JSON.stringify(db)); }
function uid(p) { return p + Date.now().toString(36).slice(-4) + Math.random().toString(36).slice(2, 4); }

/* ---------------- 通用工具 ---------------- */
const $ = (s) => document.querySelector(s);
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const today = () => new Date().toISOString().slice(0, 10);

function tone(status) {
  if (['已通过', '在任', '已发布', '正常', '在库'].includes(status)) return 'green';
  if (['待审核', '待审批', '待老师审核', '借出'].includes(status)) return 'amber';
  if (['已驳回', '已否决', '已罢免', '离任'].includes(status)) return 'red';
  return 'gray';
}
function badge(text) { return `<span class="badge ${tone(text)}">${esc(text)}</span>`; }

function toast(msg) {
  const el = $('#toast');
  el.textContent = msg;
  el.classList.remove('hidden');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => el.classList.add('hidden'), 2200);
}

let modalSubmit = null;
function openForm({ title, fields, values = {}, okText = '保存', hint = '', onSubmit }) {
  $('#modalTitle').textContent = title;
  $('#modalOk').textContent = okText;
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
  }).join('');
  modalSubmit = () => {
    const data = {};
    for (const f of fields) {
      const el = $('#f_' + f.key);
      const val = el.value.trim();
      if (f.required && !val) { el.focus(); toast('请填写' + f.label); return; }
      data[f.key] = f.type === 'number' ? Number(val || 0) : val;
    }
    onSubmit(data);
    closeModal();
  };
  $('#modalMask').classList.remove('hidden');
}
function closeModal() { $('#modalMask').classList.add('hidden'); modalSubmit = null; }
$('#modalClose').onclick = closeModal;
$('#modalCancel').onclick = closeModal;
$('#modalOk').onclick = () => modalSubmit && modalSubmit();
$('#modalMask').onclick = (e) => { if (e.target.id === 'modalMask') closeModal(); };

/* ---------------- 登录 ---------------- */
function buildDemoAccounts() {
  $('#demoAccounts').innerHTML = ACCOUNTS.map((a) => `
    <button class="chip" data-u="${a.username}" data-p="${a.password}">
      ${esc(ROLE_NAMES[a.role])}<span>${esc(a.username)}</span>
    </button>`).join('');
  document.querySelectorAll('.chip').forEach((b) => {
    b.onclick = () => {
      $('#loginUser').value = b.dataset.u;
      $('#loginPass').value = b.dataset.p;
      $('#loginErr').classList.add('hidden');
    };
  });
}

function doLogin() {
  const u = $('#loginUser').value.trim();
  const p = $('#loginPass').value;
  const acc = ACCOUNTS.find((a) => a.username === u && a.password === p);
  if (!acc) {
    $('#loginErr').textContent = '账号或密码不正确，可点击下方演示账号自动填充';
    $('#loginErr').classList.remove('hidden');
    return;
  }
  sessionStorage.setItem(SESS_KEY, acc.username);
  enterApp(acc);
}

function enterApp(acc) {
  cur = acc;
  $('#loginPage').classList.add('hidden');
  $('#shell').classList.remove('hidden');
  $('#userName').textContent = acc.name;
  $('#userTitle').textContent = acc.title + (acc.dept && acc.dept !== '未加入' ? ' · ' + acc.dept : '');
  $('#userAvatar').textContent = acc.name.slice(-1);
  $('#roleBadge').textContent = ROLE_NAMES[acc.role];

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
  sessionStorage.removeItem(SESS_KEY);
  location.reload();
};
$('#menuBtn').onclick = (e) => {
  e.stopPropagation();
  document.querySelector('.sidebar').classList.toggle('open');
};
document.addEventListener('click', (e) => {
  if (!e.target.closest('.sidebar') && !e.target.closest('#menuBtn')) document.querySelector('.sidebar').classList.remove('open');
});

/* ---------------- 视图切换 ---------------- */
let curView = 'dashboard';
function switchView(view) {
  curView = view;
  document.querySelectorAll('.nav-item').forEach((b) => b.classList.toggle('active', b.dataset.view === view));
  $('#pageTitle').textContent = PAGE_META[view][0];
  $('#pageSub').textContent = PAGE_META[view][1];
  render();
}
function render() {
  const map = {
    dashboard: renderDashboard, activity: renderActivity, personnel: renderPersonnel, dept: renderDept,
    assess: renderAssess, notice: renderNotice, leave: renderLeave, join: renderJoin,
    attendance: renderAttendance, asset: renderAsset, profile: renderProfile
  };
  $('#views').innerHTML = '';
  (map[curView] || renderDashboard)();
}

/* ---------------- 工作台 ---------------- */
function pendingTasks() {
  const t = [];
  if (cur.role === 'teacher' || cur.role === 'presidium') {
    const acts = db.activities.filter((a) => a.status === '待审批').length;
    if (acts) t.push(['活动待审批', acts, 'activity']);
  }
  if (cur.role === 'teacher') {
    const dr = db.deptRequests.filter((r) => r.status === '待老师审核').length;
    if (dr) t.push(['部门申请待审核', dr, 'dept']);
  }
  if (cur.role === 'presidium') {
    const k = db.assessments.filter((a) => a.targetRole === 'staff' && a.status === '待审核').length;
    if (k) t.push(['干事考核待复核', k, 'assess']);
  }
  const leaveReviewer = { teacher: '指导老师', presidium: '主席团', minister: '部长团' }[cur.role];
  if (leaveReviewer) {
    const l = db.leaves.filter((x) => x.status === '待审核' && x.reviewer === leaveReviewer).length;
    if (l) t.push(['请假待审核', l, 'leave']);
  }
  if (cur.role === 'minister') {
    const j = db.joinRequests.filter((x) => x.status === '待审核').length;
    if (j) t.push(['入会申请待审核', j, 'join']);
  }
  if (cur.role === 'staff') {
    const mine = db.leaves.filter((x) => x.applicant === cur.name && x.status === '待审核').length;
    if (mine) t.push(['我的请假审批中', mine, 'leave']);
  }
  return t;
}

function renderDashboard() {
  const tasks = pendingTasks();
  const activeMembers = db.members.filter((m) => m.status === '在任').length;
  const acts = db.activities.length;
  const published = db.notices.filter((n) => n.status === '已发布').length;
  const leavesPending = db.leaves.filter((l) => l.status === '待审核').length;

  const roleBrief = {
    teacher: '您拥有最高权限：人事任免、部门终审、活动终审与一票否决、主席团考核、请假审批。',
    presidium: '您可审批部门活动、罢免成员职务、提交部门新增/罢免请求、考核部长、审批部长请假。',
    minister: '您可维护本部门信息、申请与修改活动、考核干事并提交审核、审批干事请假与入会申请。',
    staff: '您可维护个人信息、查看通知、提交请假申请并查看审批进度。',
    student: '您可查看各部门信息、提交加入部门申请、查看通知公告。'
  };

  $('#views').innerHTML = `
    <div class="hero">
      <div>
        <h2>${esc(ROLE_NAMES[cur.role])} · ${esc(cur.name)}</h2>
        <p>${roleBrief[cur.role]}</p>
      </div>
      <span class="pill">${esc(ROLE_NAMES[cur.role])}权限视图</span>
    </div>
    <div class="stats">
      <div class="stat"><div class="k">待我处理</div><div class="v">${tasks.reduce((s, x) => s + x[1], 0)}</div><div class="t">${tasks.length ? tasks.map((x) => x[0]).join('、') : '暂无待办'}</div></div>
      <div class="stat"><div class="k">在任成员</div><div class="v">${activeMembers}</div><div class="t">覆盖 ${db.departments.length} 个部门</div></div>
      <div class="stat"><div class="k">活动总数</div><div class="v">${acts}</div><div class="t">已通过 ${db.activities.filter((a) => a.status === '已通过').length} 项</div></div>
      <div class="stat"><div class="k">已发布通知</div><div class="v">${published}</div><div class="t">请假待审 ${leavesPending} 条</div></div>
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
            <div class="notice-meta">${n.date} · ${esc(n.publisherName)}（${esc(n.publisher)}）</div>
          </div>`).join('') || '<div class="empty">暂无通知</div>'}
        </div>
      </div>
    </div>`;

  document.querySelectorAll('[data-go]').forEach((el) => {
    el.onclick = (e) => { e.stopPropagation(); switchView(el.dataset.go); };
  });
}

/* ---------------- 活动管理 / 审批 ---------------- */
function actRows() {
  return db.activities.map((a) => {
    const collab = a.collaborators.length ? a.collaborators.map((c) => `${c.dept} ${c.count}人`).join('、') : '无';
    const ops = [];
    if (a.status === '待审批' && (cur.role === 'teacher' || cur.role === 'presidium')) {
      ops.push(`<button class="link-btn" data-act-pass="${a.id}">通过</button>`);
      ops.push(`<button class="link-btn del" data-act-reject="${a.id}">驳回</button>`);
    }
    if (a.status === '已通过' && cur.role === 'teacher') {
      ops.push(`<button class="link-btn del" data-act-veto="${a.id}">一票否决</button>`);
    }
    if (cur.role === 'minister' && a.dept === cur.dept) {
      if (a.status === '待审批' || a.status === '已驳回') ops.push(`<button class="link-btn" data-act-edit="${a.id}">修改</button>`);
      if (a.status === '待审批' || a.status === '已通过') ops.push(`<button class="link-btn del" data-act-revoke="${a.id}">撤销</button>`);
    }
    return `<tr>
      <td><strong>${esc(a.title)}</strong><div class="cell-sub">${esc(a.content).slice(0, 42)}</div></td>
      <td><span class="badge blue">${esc(a.dept)}</span></td>
      <td>${esc(collab)}</td>
      <td>${a.total}</td>
      <td class="nowrap">${esc(a.start)}<br>— ${esc(a.end)}</td>
      <td>${esc(a.place)}</td>
      <td>${badge(a.status)}${a.reason ? `<div class="cell-sub">${esc(a.reason)}</div>` : ''}</td>
      <td><div class="row-actions">${ops.join('') || '<span class="cell-sub">—</span>'}</div></td>
    </tr>`;
  }).join('') || '<tr><td colspan="8" class="empty">暂无活动</td></tr>';
}

function renderActivity() {
  $('#views').innerHTML = `
    <div class="card">
      <div class="card-head">
        <div><h2>活动信息表</h2><div class="sub">审批规则：主席团或指导老师任一方同意即通过；指导老师具有一票否决权</div></div>
        ${cur.role === 'minister' ? '<button class="primary-btn" id="addAct">+ 申请部门活动</button>' : ''}
      </div>
      <div class="table-wrap"><table>
        <thead><tr><th>活动名称</th><th>承办部门</th><th>协同部门及人数</th><th>总人数</th><th>时间</th><th>地点</th><th>状态</th><th>操作</th></tr></thead>
        <tbody>${actRows()}</tbody>
      </table></div>
    </div>`;

  if ($('#addAct')) $('#addAct').onclick = () => actForm(null);
  document.querySelectorAll('[data-act-pass]').forEach((b) => {
    b.onclick = () => {
      const a = db.activities.find((x) => x.id === b.dataset.actPass);
      a.status = '已通过'; a.approver = ROLE_NAMES[cur.role]; a.reason = '';
      save(); render(); toast('已通过：' + a.title);
    };
  });
  document.querySelectorAll('[data-act-reject]').forEach((b) => {
    b.onclick = () => {
      const a = db.activities.find((x) => x.id === b.dataset.actReject);
      openForm({
        title: '驳回活动 · ' + a.title,
        fields: [{ key: 'reason', label: '驳回原因', type: 'textarea', required: true }],
        onSubmit(d) {
          a.status = '已驳回'; a.approver = ROLE_NAMES[cur.role]; a.reason = d.reason;
          save(); render(); toast('已驳回');
        }
      });
    };
  });
  document.querySelectorAll('[data-act-veto]').forEach((b) => {
    b.onclick = () => {
      const a = db.activities.find((x) => x.id === b.dataset.actVeto);
      openForm({
        title: '一票否决 · ' + a.title,
        fields: [{ key: 'reason', label: '否决原因', type: 'textarea', required: true }],
        onSubmit(d) {
          a.status = '已否决'; a.approver = '指导老师'; a.reason = d.reason;
          save(); render(); toast('已行使一票否决');
        }
      });
    };
  });
  document.querySelectorAll('[data-act-revoke]').forEach((b) => {
    b.onclick = () => {
      const a = db.activities.find((x) => x.id === b.dataset.actRevoke);
      if (!confirm(`确定撤销活动「${a.title}」？`)) return;
      a.status = '已撤回'; a.reason = '承办部门撤销申请';
      save(); render(); toast('活动已撤销');
    };
  });
  document.querySelectorAll('[data-act-edit]').forEach((b) => { b.onclick = () => actForm(b.dataset.actEdit); });
}

function actForm(id) {
  const a = id ? db.activities.find((x) => x.id === id) : {};
  const others = db.departments.filter((d) => d.name !== cur.dept && d.status === '正常').map((d) => d.name);
  const c1 = a.collaborators && a.collaborators[0] ? a.collaborators[0] : { dept: '无', count: 0 };
  const c2 = a.collaborators && a.collaborators[1] ? a.collaborators[1] : { dept: '无', count: 0 };
  openForm({
    title: id ? '修改活动申请' : '申请部门活动',
    okText: id ? '保存修改' : '提交审批',
    hint: '依据需求文档，需确定协同部门及参与人数、总参与人数、时间地点与活动内容。',
    fields: [
      { key: 'title', label: '活动名称', required: true },
      { key: 'cdept1', label: '协同部门一', type: 'select', options: ['无'].concat(others) },
      { key: 'cnum1', label: '协同部门一参与人数', type: 'number' },
      { key: 'cdept2', label: '协同部门二', type: 'select', options: ['无'].concat(others) },
      { key: 'cnum2', label: '协同部门二参与人数', type: 'number' },
      { key: 'total', label: '总参与人数', type: 'number', required: true },
      { key: 'start', label: '开始时间', placeholder: '2026-11-20 09:00', required: true },
      { key: 'end', label: '结束时间', placeholder: '2026-11-20 17:00', required: true },
      { key: 'place', label: '活动地点', required: true },
      { key: 'content', label: '活动内容', type: 'textarea', required: true }
    ],
    values: Object.assign({ cdept1: others[0], cnum1: 5, cdept2: '无', cnum2: 0, total: 20, start: '2026-11-20 09:00', end: '2026-11-20 17:00', place: '学院广场', content: '' },
      a.id ? { cdept1: c1.dept, cnum1: c1.count, cdept2: c2.dept, cnum2: c2.count } : {}, a),
    onSubmit(d) {
      const collaborators = [];
      if (d.cdept1 !== '无') collaborators.push({ dept: d.cdept1, count: d.cnum1 });
      if (d.cdept2 !== '无') collaborators.push({ dept: d.cdept2, count: d.cnum2 });
      const payload = {
        title: d.title, dept: cur.dept, collaborators, total: d.total,
        start: d.start, end: d.end, place: d.place, content: d.content,
        status: '待审批', approver: '', reason: ''
      };
      if (id) Object.assign(a, payload);
      else db.activities.push(Object.assign({ id: uid('a') }, payload));
      save(); render(); toast(id ? '已提交修改，等待审批' : '活动申请已提交，等待审批');
    }
  });
}

/* ---------------- 人事管理 ---------------- */
function canRemove(member) {
  if (cur.role === 'teacher') return true;
  if (cur.role === 'presidium') return member.title !== '主席' && member.title !== '副主席';
  if (cur.role === 'minister') return member.title === '干事' && member.dept === cur.dept;
  return false;
}
function canPromote() { return cur.role === 'teacher'; }

function renderPersonnel() {
  const list = db.members.filter((m) => m.status === '在任');
  $('#views').innerHTML = `
    <div class="card">
      <div class="card-head">
        <div><h2>人员信息表</h2><div class="sub">${cur.role === 'teacher' ? '可提升或罢免任何成员职务' : cur.role === 'presidium' ? '可罢免成员职务（主席团成员除外），部门变动需提交老师审核' : '可罢免本部门干事'}</div></div>
      </div>
      <div class="table-wrap"><table>
        <thead><tr><th>姓名</th><th>学号</th><th>部门</th><th>职务</th><th>联系方式</th><th>入会时间</th><th>状态</th><th>操作</th></tr></thead>
        <tbody>${list.map((m) => `
          <tr>
            <td><div class="name-cell"><span class="mini-avatar">${esc(m.name.slice(-1))}</span>${esc(m.name)}</div></td>
            <td>${esc(m.sno)}</td>
            <td><span class="badge blue">${esc(m.dept)}</span></td>
            <td>${esc(m.title)}</td>
            <td>${esc(m.phone)}</td>
            <td>${esc(m.joined)}</td>
            <td>${badge(m.status)}</td>
            <td><div class="row-actions">
              ${canPromote() ? `<button class="link-btn" data-promote="${m.id}">职务调整</button>` : ''}
              ${canRemove(m) ? `<button class="link-btn del" data-remove="${m.id}">罢免</button>` : ''}
            </div></td>
          </tr>`).join('')}</tbody>
      </table></div>
    </div>
    <div class="card">
      <div class="card-head"><div><h2>人事异动记录</h2><div class="sub">共 ${db.personnel.length} 条</div></div></div>
      <div class="table-wrap"><table>
        <thead><tr><th>姓名</th><th>类型</th><th>变更</th><th>操作人</th><th>日期</th></tr></thead>
        <tbody>${db.personnel.slice().reverse().map((p) => `<tr><td>${esc(p.name)}</td><td>${p.action === '提升' ? '<span class="badge green">提升</span>' : '<span class="badge red">罢免</span>'}</td><td>${esc(p.from)} → ${esc(p.to)}</td><td>${esc(p.operator)}</td><td>${esc(p.date)}</td></tr>`).join('')}</tbody>
      </table></div>
    </div>`;

  document.querySelectorAll('[data-promote]').forEach((b) => {
    b.onclick = () => {
      const m = db.members.find((x) => x.id === b.dataset.promote);
      openForm({
        title: '职务调整 · ' + m.name,
        fields: [
          { key: 'title', label: '新职务', type: 'select', options: TITLES },
          { key: 'dept', label: '所属部门', type: 'select', options: DEPTS }
        ],
        values: { title: m.title, dept: m.dept },
        onSubmit(d) {
          db.personnel.push({ id: uid('p'), name: m.name, action: '提升', from: m.title, to: d.title, operator: cur.name, date: today() });
          m.title = d.title; m.dept = d.dept;
          save(); render(); toast('职务已调整');
        }
      });
    };
  });
  document.querySelectorAll('[data-remove]').forEach((b) => {
    b.onclick = () => {
      const m = db.members.find((x) => x.id === b.dataset.remove);
      if (!confirm(`确定罢免「${m.name}」的职务？罢免后状态为离任。`)) return;
      db.personnel.push({ id: uid('p'), name: m.name, action: '罢免', from: m.title, to: '离任', operator: cur.name, date: today() });
      m.status = '离任';
      save(); render(); toast('成员已罢免');
    };
  });
}

/* ---------------- 部门管理 / 审核 ---------------- */
function renderDept() {
  const canEdit = cur.role === 'teacher' || cur.role === 'presidium' || cur.role === 'minister';
  const myDeptOnly = cur.role === 'minister';
  $('#views').innerHTML = `
    <div class="card">
      <div class="card-head">
        <div><h2>部门信息表</h2><div class="sub">${cur.role === 'student' ? '普通学生可查询部门信息并申请加入' : myDeptOnly ? '部长团可添加并修改本部门详细信息' : '主席团可编辑部门信息；新增与罢免需提交指导老师审核'}</div></div>
        <div class="toolbar">
          ${canEdit ? `<button class="primary-btn" id="addDept">+ 新增部门</button>` : ''}
          ${cur.role === 'student' ? '<button class="primary-btn light" id="toJoin">提交加入申请</button>' : ''}
        </div>
      </div>
      <div class="table-wrap"><table>
        <thead><tr><th>部门</th><th>负责人</th><th>人数</th><th>职责说明</th><th>状态</th><th>操作</th></tr></thead>
        <tbody>${db.departments.map((d) => `
          <tr>
            <td><strong>${esc(d.name)}</strong></td>
            <td>${esc(d.leader)}</td>
            <td>${d.memberCount}</td>
            <td>${esc(d.desc)}</td>
            <td>${badge(d.status)}</td>
            <td><div class="row-actions">
              ${canEdit && (!myDeptOnly || d.name === cur.dept) ? `<button class="link-btn" data-edit-dept="${d.id}">编辑</button>` : ''}
              ${cur.role === 'presidium' ? `<button class="link-btn del" data-dissolve="${d.id}">申请罢免</button>` : ''}
            </div></td>
          </tr>`).join('')}</tbody>
      </table></div>
    </div>
    ${cur.role === 'teacher' || cur.role === 'presidium' ? `
    <div class="card">
      <div class="card-head"><div><h2>部门申请表</h2><div class="sub">${cur.role === 'teacher' ? '指导老师对部门一切信息进行审核，可批准新增或罢免' : '主席团提交申请，由指导老师终审'}</div></div></div>
      <div class="table-wrap"><table>
        <thead><tr><th>类型</th><th>部门</th><th>申请说明</th><th>提交人</th><th>日期</th><th>状态</th><th>操作</th></tr></thead>
        <tbody>${db.deptRequests.slice().reverse().map((r) => `
          <tr>
            <td>${esc(r.type)}</td>
            <td>${esc(r.dept)}</td>
            <td>${esc(r.reason)}</td>
            <td>${esc(r.submitter)}</td>
            <td>${esc(r.date)}</td>
            <td>${badge(r.status)}</td>
            <td><div class="row-actions">
              ${cur.role === 'teacher' && r.status === '待老师审核' ? `
                <button class="link-btn" data-dept-pass="${r.id}">通过</button>
                <button class="link-btn del" data-dept-reject="${r.id}">驳回</button>` : '<span class="cell-sub">—</span>'}
            </div></td>
          </tr>`).join('')}</tbody>
      </table></div>
    </div>` : ''}`;

  if ($('#addDept')) $('#addDept').onclick = () => {
    if (cur.role === 'presidium') {
      openForm({
        title: '提交新增部门申请',
        hint: '主席团提交后由指导老师审核，通过后部门生效。',
        fields: [
          { key: 'name', label: '部门名称', required: true },
          { key: 'leader', label: '负责人', required: true },
          { key: 'reason', label: '申请说明', type: 'textarea', required: true }
        ],
        onSubmit(d) {
          db.deptRequests.push({ id: uid('dr'), type: '新增', dept: d.name, reason: d.reason, submitter: cur.name, date: today(), status: '待老师审核' });
          save(); render(); toast('新增部门申请已提交');
        }
      });
    } else {
      openForm({
        title: '新增部门',
        fields: [
          { key: 'name', label: '部门名称', required: true },
          { key: 'leader', label: '负责人', required: true },
          { key: 'memberCount', label: '人数', type: 'number' },
          { key: 'desc', label: '职责说明', type: 'textarea' }
        ],
        values: { memberCount: 1 },
        onSubmit(d) {
          db.departments.push(Object.assign({ id: uid('d'), status: '正常' }, d));
          save(); render(); toast('部门已新增');
        }
      });
    }
  };

  if ($('#toJoin')) $('#toJoin').onclick = () => switchView('join');

  document.querySelectorAll('[data-edit-dept]').forEach((b) => {
    b.onclick = () => {
      const d = db.departments.find((x) => x.id === b.dataset.editDept);
      openForm({
        title: '编辑部门 · ' + d.name,
        fields: [
          { key: 'leader', label: '负责人', required: true },
          { key: 'memberCount', label: '人数', type: 'number' },
          { key: 'desc', label: '职责说明', type: 'textarea' }
        ],
        values: { leader: d.leader, memberCount: d.memberCount, desc: d.desc },
        onSubmit(v) {
          Object.assign(d, v);
          save(); render(); toast('部门信息已更新');
        }
      });
    };
  });

  document.querySelectorAll('[data-dissolve]').forEach((b) => {
    b.onclick = () => {
      const d = db.departments.find((x) => x.id === b.dataset.dissolve);
      openForm({
        title: '申请罢免部门 · ' + d.name,
        hint: '主席团提交罢免请求，由指导老师审核。',
        fields: [{ key: 'reason', label: '申请说明', type: 'textarea', required: true }],
        onSubmit(v) {
          db.deptRequests.push({ id: uid('dr'), type: '罢免', dept: d.name, reason: v.reason, submitter: cur.name, date: today(), status: '待老师审核' });
          save(); render(); toast('罢免申请已提交老师审核');
        }
      });
    };
  });

  document.querySelectorAll('[data-dept-pass]').forEach((b) => {
    b.onclick = () => {
      const r = db.deptRequests.find((x) => x.id === b.dataset.deptPass);
      r.status = '已通过';
      const d = db.departments.find((x) => x.name === r.dept);
      if (r.type === '新增') db.departments.push({ id: uid('d'), name: r.dept, leader: r.submitter, memberCount: 0, desc: r.reason, status: '正常' });
      if (r.type === '罢免' && d) d.status = '已罢免';
      save(); render(); toast('审核通过');
    };
  });
  document.querySelectorAll('[data-dept-reject]').forEach((b) => {
    b.onclick = () => {
      const r = db.deptRequests.find((x) => x.id === b.dataset.deptReject);
      r.status = '已驳回';
      save(); render(); toast('已驳回申请');
    };
  });
}

/* ---------------- 考核 ---------------- */
function renderAssess() {
  const targetRole = { teacher: 'presidium', presidium: 'minister', minister: 'staff' }[cur.role];
  const targets = db.members.filter((m) => {
    if (m.status !== '在任') return false;
    if (targetRole === 'presidium') return ['主席', '副主席'].includes(m.title);
    if (targetRole === 'minister') return ['部长', '副部长'].includes(m.title);
    return m.title === '干事' && (cur.role === 'minister' ? m.dept === cur.dept : true);
  });
  const rows = db.assessments.filter((a) => a.targetRole === targetRole || (cur.role === 'presidium' && a.targetRole === 'staff'));

  $('#views').innerHTML = `
    <div class="card">
      <div class="card-head">
        <div><h2>${cur.role === 'teacher' ? '主席团考核' : cur.role === 'presidium' ? '部长团考核' : '干事考核'}</h2>
          <div class="sub">${cur.role === 'teacher' ? '指导老师对主席团年度任务完成度进行考核' : cur.role === 'presidium' ? '主席团对部长年度任务完成度进行考核，并复核部长提交的干事考核' : '汇总活动参加情况与任务完成度评分，提交主席团审核'}</div></div>
        <div class="toolbar">
          ${targets.length ? `<select class="filter" id="assessTarget">${targets.map((m) => `<option value="${m.name}">${esc(m.name)}（${esc(m.dept)}·${esc(m.title)}）</option>`).join('')}</select>
          <button class="primary-btn" id="addAssess">+ 新建考核</button>` : ''}
        </div>
      </div>
      <div class="table-wrap"><table>
        <thead><tr><th>被考核人</th><th>部门</th><th>周期</th><th>评分</th><th>评语</th><th>状态</th><th>提交人</th><th>操作</th></tr></thead>
        <tbody>${rows.length ? rows.slice().reverse().map((k) => `
          <tr>
            <td><strong>${esc(k.target)}</strong></td>
            <td>${esc(k.dept)}</td>
            <td>${esc(k.period)}</td>
            <td><span class="score">${k.score}</span></td>
            <td>${esc(k.comment)}</td>
            <td>${badge(k.status)}</td>
            <td>${esc(k.submitter)}</td>
            <td><div class="row-actions">
              ${cur.role === 'presidium' && k.targetRole === 'staff' && k.status === '待审核' ? `<button class="link-btn" data-assess-pass="${k.id}">审核通过</button>` : ''}
              ${k.status === '待审核' && k.submitter === cur.name ? `<button class="link-btn del" data-assess-del="${k.id}">撤回</button>` : ''}
            </div></td>
          </tr>`).join('') : '<tr><td colspan="8" class="empty">暂无考核记录</td></tr>'}</tbody>
      </table></div>
    </div>`;

  if ($('#addAssess')) $('#addAssess').onclick = () => {
    const target = $('#assessTarget').value;
    const m = db.members.find((x) => x.name === target);
    openForm({
      title: '考核 · ' + target,
      hint: cur.role === 'minister' ? '评分将提交主席团审核后生效。' : '考核结果由您直接确认。',
      fields: [
        { key: 'period', label: '考核周期', required: true },
        { key: 'score', label: '评分（0-100）', type: 'number', required: true },
        { key: 'comment', label: '考核评语', type: 'textarea', required: true }
      ],
      values: { period: '2026 年度', score: 85, comment: '' },
      onSubmit(d) {
        db.assessments.push({
          id: uid('k'), targetRole, target, dept: m ? m.dept : cur.dept, period: d.period, score: d.score,
          comment: d.comment, status: cur.role === 'minister' ? '待审核' : '已通过', submitter: cur.name, date: today()
        });
        save(); render(); toast(cur.role === 'minister' ? '考核已提交审核' : '考核已完成');
      }
    });
  };

  document.querySelectorAll('[data-assess-pass]').forEach((b) => {
    b.onclick = () => {
      const k = db.assessments.find((x) => x.id === b.dataset.assessPass);
      k.status = '已通过';
      save(); render(); toast('考核已审核通过');
    };
  });
  document.querySelectorAll('[data-assess-del]').forEach((b) => {
    b.onclick = () => {
      db.assessments = db.assessments.filter((x) => x.id !== b.dataset.assessDel);
      save(); render(); toast('考核记录已撤回');
    };
  });
}

/* ---------------- 通知管理 ---------------- */
function renderNotice() {
  const canPublish = ['teacher', 'presidium', 'minister'].includes(cur.role);
  $('#views').innerHTML = `
    <div class="card">
      <div class="card-head">
        <div><h2>通知公告</h2><div class="sub">共 ${db.notices.length} 条，已发布 ${db.notices.filter((n) => n.status === '已发布').length} 条</div></div>
        ${canPublish ? '<button class="primary-btn" id="addNotice">+ 发布通知</button>' : ''}
      </div>
      <div class="notice-list">${db.notices.slice().reverse().map((n) => `
        <div class="notice-item${n.status === '已撤回' ? ' muted' : ''}">
          <h4><span class="badge blue">${esc(n.type)}</span>${esc(n.title)}</h4>
          <p>${esc(n.content)}</p>
          <div class="notice-meta" style="display:flex;justify-content:space-between;align-items:center;gap:10px">
            <span>${esc(n.date)} · ${esc(n.publisherName)}（${esc(n.publisher)}）${n.status === '已撤回' ? ' · 已撤回' : ''}</span>
            <span class="row-actions">${canPublish && n.status === '已发布' ? `<button class="link-btn del" data-notice-withdraw="${n.id}">撤回通知</button>` : ''}</span>
          </div>
        </div>`).join('') || '<div class="empty">暂无通知</div>'}
      </div>
    </div>`;

  if ($('#addNotice')) $('#addNotice').onclick = () => {
    openForm({
      title: '发布通知',
      fields: [
        { key: 'type', label: '通知类型', type: 'select', options: ['活动通知', '其他通知'] },
        { key: 'title', label: '通知标题', required: true },
        { key: 'content', label: '通知内容', type: 'textarea', required: true }
      ],
      onSubmit(d) {
        db.notices.push({
          id: uid('n'), type: d.type, title: d.title, content: d.content, date: today(),
          publisher: ROLE_NAMES[cur.role], publisherName: cur.name, status: '已发布'
        });
        save(); render(); toast('通知已发布');
      }
    });
  };
  document.querySelectorAll('[data-notice-withdraw]').forEach((b) => {
    b.onclick = () => {
      const n = db.notices.find((x) => x.id === b.dataset.noticeWithdraw);
      if (!confirm(`确定撤回通知「${n.title}」？`)) return;
      n.status = '已撤回';
      save(); render(); toast('通知已撤回');
    };
  });
}

/* ---------------- 请假管理 ---------------- */
const LEAVE_REVIEWER = { presidium: '指导老师', minister: '主席团', staff: '部长团' };

function canSubmitLeave() { return ['presidium', 'minister', 'staff'].includes(cur.role); }
function canReviewLeave(l) {
  const map = { teacher: '指导老师', presidium: '主席团', minister: '部长团' };
  return map[cur.role] === l.reviewer && l.status === '待审核';
}

function renderLeave() {
  const mine = db.leaves.filter((l) => l.applicant === cur.name);
  const visible = cur.role === 'teacher' ? db.leaves
    : cur.role === 'presidium' ? db.leaves
    : cur.role === 'minister' ? db.leaves.filter((l) => l.reviewer === '部长团' || l.applicant === cur.name)
    : mine;

  $('#views').innerHTML = `
    <div class="card">
      <div class="card-head">
        <div><h2>请假表</h2><div class="sub">${cur.role === 'teacher' ? '审核主席团请假' : cur.role === 'presidium' ? '可提交本人请假、撤销申请，并审核部长请假' : cur.role === 'minister' ? '可提交本人请假，并审核本部门干事请假' : '提交请假申请并查看审批进度'}</div></div>
        ${canSubmitLeave() ? '<button class="primary-btn" id="addLeave">+ 提交请假申请</button>' : ''}
      </div>
      <div class="table-wrap"><table>
        <thead><tr><th>申请人</th><th>身份</th><th>部门</th><th>类型</th><th>起止时间</th><th>事由</th><th>审核人</th><th>状态</th><th>操作</th></tr></thead>
        <tbody>${visible.length ? visible.slice().reverse().map((l) => `
          <tr>
            <td><strong>${esc(l.applicant)}</strong></td>
            <td>${esc(ROLE_NAMES[l.applicantRole])}</td>
            <td>${esc(l.dept)}</td>
            <td>${esc(l.type)}</td>
            <td class="nowrap">${esc(l.start)}<br>${esc(l.end)}</td>
            <td>${esc(l.reason)}${l.reviewNote ? `<div class="cell-sub">审核意见：${esc(l.reviewNote)}</div>` : ''}</td>
            <td>${esc(l.reviewer)}</td>
            <td>${badge(l.status)}</td>
            <td><div class="row-actions">
              ${canReviewLeave(l) ? `<button class="link-btn" data-leave-pass="${l.id}">通过</button><button class="link-btn del" data-leave-reject="${l.id}">驳回</button>` : ''}
              ${l.applicant === cur.name && l.status === '待审核' ? `<button class="link-btn del" data-leave-revoke="${l.id}">撤销申请</button>` : ''}
            </div></td>
          </tr>`).join('') : '<tr><td colspan="9" class="empty">暂无请假记录</td></tr>'}</tbody>
      </table></div>
    </div>`;

  if ($('#addLeave')) $('#addLeave').onclick = () => {
    openForm({
      title: '提交请假申请',
      hint: `您的请假将由「${LEAVE_REVIEWER[cur.role]}」审核。`,
      fields: [
        { key: 'type', label: '请假类型', type: 'select', options: ['事假', '病假', '公假'] },
        { key: 'start', label: '开始日期', type: 'date', required: true },
        { key: 'end', label: '结束日期', type: 'date', required: true },
        { key: 'reason', label: '请假原因', type: 'textarea', required: true, placeholder: '请填写具体事由与相关证明' }
      ],
      values: { start: today(), end: today() },
      onSubmit(d) {
        db.leaves.push({
          id: uid('l'), applicant: cur.name, applicantRole: cur.role, dept: cur.dept, type: d.type,
          start: d.start, end: d.end, reason: d.reason, status: '待审核', reviewer: LEAVE_REVIEWER[cur.role], reviewNote: '', date: today()
        });
        save(); render(); toast('请假申请已提交');
      }
    });
  };

  document.querySelectorAll('[data-leave-pass]').forEach((b) => {
    b.onclick = () => {
      const l = db.leaves.find((x) => x.id === b.dataset.leavePass);
      openForm({
        title: '通过请假 · ' + l.applicant,
        fields: [{ key: 'note', label: '审核意见' }],
        values: { note: '同意' },
        onSubmit(d) {
          l.status = '已通过'; l.reviewNote = d.note;
          save(); render(); toast('已通过请假申请');
        }
      });
    };
  });
  document.querySelectorAll('[data-leave-reject]').forEach((b) => {
    b.onclick = () => {
      const l = db.leaves.find((x) => x.id === b.dataset.leaveReject);
      openForm({
        title: '驳回请假 · ' + l.applicant,
        fields: [{ key: 'note', label: '驳回原因', type: 'textarea', required: true }],
        onSubmit(d) {
          l.status = '已驳回'; l.reviewNote = d.note;
          save(); render(); toast('已驳回请假申请');
        }
      });
    };
  });
  document.querySelectorAll('[data-leave-revoke]').forEach((b) => {
    b.onclick = () => {
      const l = db.leaves.find((x) => x.id === b.dataset.leaveRevoke);
      if (!confirm('确定撤销这条请假申请？')) return;
      l.status = '已撤销';
      save(); render(); toast('请假申请已撤销');
    };
  });
}

/* ---------------- 加入申请 ---------------- */
function renderJoin() {
  if (cur.role === 'student') {
    const mine = db.joinRequests.filter((j) => j.name === cur.name);
    $('#views').innerHTML = `
      <div class="card">
        <div class="card-head">
          <div><h2>我的入会申请</h2><div class="sub">提交后由所申请部门的部长团审核</div></div>
          <button class="primary-btn" id="addJoin">+ 提交加入申请</button>
        </div>
        <div class="table-wrap"><table>
          <thead><tr><th>申请部门</th><th>申请理由</th><th>提交日期</th><th>状态</th><th>操作</th></tr></thead>
          <tbody>${mine.length ? mine.map((j) => `<tr><td><span class="badge blue">${esc(j.dept)}</span></td><td>${esc(j.reason)}</td><td>${esc(j.date)}</td><td>${badge(j.status)}</td>
            <td>${j.status === '待审核' ? `<button class="link-btn del" data-join-del="${j.id}">撤回</button>` : '<span class="cell-sub">—</span>'}</td></tr>`).join('')
            : '<tr><td colspan="5" class="empty">还没有提交申请</td></tr>'}</tbody>
        </table></div>
      </div>`;
    $('#addJoin').onclick = () => {
      openForm({
        title: '提交加入部门申请',
        fields: [
          { key: 'dept', label: '申请部门', type: 'select', options: db.departments.filter((d) => d.status === '正常').map((d) => d.name) },
          { key: 'reason', label: '申请理由', type: 'textarea', required: true, placeholder: '可填写特长、意向与可投入时间' }
        ],
        onSubmit(d) {
          db.joinRequests.push({ id: uid('j'), name: cur.name, sno: '—', dept: d.dept, reason: d.reason, date: today(), status: '待审核' });
          save(); render(); toast('申请已提交');
        }
      });
    };
    document.querySelectorAll('[data-join-del]').forEach((b) => {
      b.onclick = () => {
        db.joinRequests = db.joinRequests.filter((x) => x.id !== b.dataset.joinDel);
        save(); render(); toast('申请已撤回');
      };
    });
    return;
  }

  const list = cur.role === 'minister' ? db.joinRequests.filter((j) => j.dept === cur.dept) : db.joinRequests;
  $('#views').innerHTML = `
    <div class="card">
      <div class="card-head">
        <div><h2>部门申请表</h2><div class="sub">${cur.role === 'minister' ? '审核普通学生加入本部门的申请' : '普通学生入会申请总览'}</div></div>
      </div>
      <div class="table-wrap"><table>
        <thead><tr><th>姓名</th><th>学号</th><th>申请部门</th><th>申请理由</th><th>日期</th><th>状态</th><th>操作</th></tr></thead>
        <tbody>${list.length ? list.slice().reverse().map((j) => `
          <tr>
            <td><strong>${esc(j.name)}</strong></td>
            <td>${esc(j.sno)}</td>
            <td><span class="badge blue">${esc(j.dept)}</span></td>
            <td>${esc(j.reason)}</td>
            <td>${esc(j.date)}</td>
            <td>${badge(j.status)}</td>
            <td><div class="row-actions">${cur.role === 'minister' && j.status === '待审核'
              ? `<button class="link-btn" data-join-pass="${j.id}">通过</button><button class="link-btn del" data-join-reject="${j.id}">驳回</button>` : '<span class="cell-sub">—</span>'}</div></td>
          </tr>`).join('') : '<tr><td colspan="7" class="empty">暂无申请</td></tr>'}</tbody>
      </table></div>
    </div>`;

  document.querySelectorAll('[data-join-pass]').forEach((b) => {
    b.onclick = () => {
      const j = db.joinRequests.find((x) => x.id === b.dataset.joinPass);
      j.status = '已通过';
      db.members.push({ id: uid('m'), name: j.name, sno: j.sno === '—' ? '待补录' : j.sno, dept: j.dept, title: '干事', phone: '', status: '在任', joined: today() });
      const d = db.departments.find((x) => x.name === j.dept);
      if (d) d.memberCount = (d.memberCount || 0) + 1;
      save(); render(); toast('已通过，成员已加入部门');
    };
  });
  document.querySelectorAll('[data-join-reject]').forEach((b) => {
    b.onclick = () => {
      const j = db.joinRequests.find((x) => x.id === b.dataset.joinReject);
      j.status = '已驳回';
      save(); render(); toast('已驳回申请');
    };
  });
}

/* ---------------- 考勤（部长团附加） ---------------- */
let curSessionId = null;
function renderAttendance() {
  const active = db.members.filter((m) => m.status === '在任' && m.dept === cur.dept);
  if (!db.sessions.length) {
    $('#views').innerHTML = `<div class="card"><div class="card-head"><div><h2>考勤签到</h2></div>
      <button class="primary-btn" id="addSession">+ 新建例会</button></div><div class="empty">还没有例会记录</div></div>`;
    $('#addSession').onclick = () => sessionForm();
    return;
  }
  if (!curSessionId || !db.sessions.some((s) => s.id === curSessionId)) curSessionId = db.sessions[0].id;
  const s = db.sessions.find((x) => x.id === curSessionId);
  const present = active.filter((m) => s.records[m.id]).length;

  $('#views').innerHTML = `
    <div class="card">
      <div class="card-head">
        <div><h2>例会签到</h2><div class="sub">点击姓名切换「已到 / 未到」，改动自动保存（仅统计本部门在任成员）</div></div>
        <div class="toolbar">
          <select class="filter" id="sessionPick">${db.sessions.map((x) => `<option value="${x.id}"${x.id === s.id ? ' selected' : ''}>${esc(x.date)} · ${esc(x.title)}</option>`).join('')}</select>
          <button class="primary-btn light" id="addSession">+ 新建例会</button>
        </div>
      </div>
      <div class="att-grid">${active.map((m) => `<button class="att-chip${s.records[m.id] ? ' on' : ''}" data-att="${m.id}">${esc(m.name)} · ${esc(m.dept)}</button>`).join('') || '<span class="empty">本部门暂无在任成员</span>'}</div>
      <div class="att-summary">
        <span>应到 ${active.length} 人</span>
        <span>实到 <strong style="color:#14915b">${present}</strong> 人</span>
        <span>出勤率 ${active.length ? Math.round((present / active.length) * 100) : 0}%</span>
      </div>
    </div>`;

  $('#sessionPick').onchange = (e) => { curSessionId = e.target.value; renderAttendance(); };
  $('#addSession').onclick = () => sessionForm();
  document.querySelectorAll('[data-att]').forEach((b) => {
    b.onclick = () => {
      const mid = b.dataset.att;
      s.records[mid] = !s.records[mid];
      save(); renderAttendance(); toast(s.records[mid] ? '已签到' : '已取消签到');
    };
  });
}
function sessionForm() {
  openForm({
    title: '新建例会',
    fields: [
      { key: 'title', label: '例会主题', required: true },
      { key: 'date', label: '会议日期', type: 'date', required: true }
    ],
    values: { title: '部门例会', date: today() },
    onSubmit(d) {
      const s = Object.assign({ id: uid('s'), records: {} }, d);
      db.sessions.push(s); curSessionId = s.id;
      save(); renderAttendance(); toast('例会已创建');
    }
  });
}

/* ---------------- 物资借还（部长团附加） ---------------- */
function renderAsset() {
  $('#views').innerHTML = `
    <div class="card">
      <div class="card-head">
        <div><h2>物资台账</h2><div class="sub">在库 ${db.assets.filter((t) => t.status === '在库').length} 项，借出 ${db.assets.filter((t) => t.status === '借出').length} 项</div></div>
        <button class="primary-btn" id="addAsset">+ 新增物资</button>
      </div>
      <div class="table-wrap"><table>
        <thead><tr><th>物资名称</th><th>数量</th><th>状态</th><th>借用部门 / 人</th><th>借出日期</th><th>应还日期</th><th>操作</th></tr></thead>
        <tbody>${db.assets.map((t) => `
          <tr>
            <td><strong>${esc(t.name)}</strong></td>
            <td>${t.qty}</td>
            <td>${badge(t.status)}</td>
            <td>${esc(t.borrower) || '—'}</td>
            <td>${esc(t.date) || '—'}</td>
            <td>${esc(t.due) || '—'}</td>
            <td><div class="row-actions">
              <button class="link-btn" data-borrow="${t.id}">${t.status === '在库' ? '借出登记' : '归还入库'}</button>
              <button class="link-btn del" data-asset-del="${t.id}">删除</button>
            </div></td>
          </tr>`).join('')}</tbody>
      </table></div>
    </div>`;

  $('#addAsset').onclick = () => {
    openForm({
      title: '新增物资',
      fields: [
        { key: 'name', label: '物资名称', required: true },
        { key: 'qty', label: '数量', type: 'number', required: true }
      ],
      values: { qty: 1 },
      onSubmit(d) {
        db.assets.push({ id: uid('t'), name: d.name, qty: d.qty, borrower: '', date: '', due: '', status: '在库' });
        save(); renderAsset(); toast('物资已添加');
      }
    });
  };
  document.querySelectorAll('[data-asset-del]').forEach((b) => {
    b.onclick = () => {
      db.assets = db.assets.filter((x) => x.id !== b.dataset.assetDel);
      save(); renderAsset(); toast('物资已删除');
    };
  });
  document.querySelectorAll('[data-borrow]').forEach((b) => {
    b.onclick = () => {
      const t = db.assets.find((x) => x.id === b.dataset.borrow);
      if (t.status === '借出') {
        Object.assign(t, { status: '在库', borrower: '', date: '', due: '' });
        save(); renderAsset(); toast('已归还入库');
        return;
      }
      openForm({
        title: '借出登记 · ' + t.name,
        fields: [
          { key: 'borrower', label: '借用部门 / 人', required: true },
          { key: 'date', label: '借出日期', type: 'date', required: true },
          { key: 'due', label: '应还日期', type: 'date', required: true }
        ],
        values: { borrower: cur.dept, date: today(), due: today() },
        onSubmit(d) { Object.assign(t, d, { status: '借出' }); save(); renderAsset(); toast('借出登记完成'); }
      });
    };
  });
}

/* ---------------- 个人信息 ---------------- */
const PERMISSIONS = {
  teacher: ['提升或罢免学生会成员职务', '审核部门（新增、编辑、罢免部门）', '活动最终审批（一票否决权）', '主席团年度考核', '发布/撤回活动通知与其他通知', '审核主席团请假'],
  presidium: ['罢免学生会成员职务', '编辑部门信息，提交新增/罢免部门请求给指导老师', '活动审批（与老师任一方同意即通过）', '部长年度考核', '发布/撤回通知', '提交/撤销本人请假，审核部长请假'],
  minister: ['罢免本部门干事', '添加与修改本部门详细信息', '申请/修改/撤销部门活动（协同部门与人数、总人数、时间地点、内容）', '汇总干事活动参与与任务完成度并评分，提交审核', '提交/撤销本人请假，审核干事请假', '审核普通学生入会申请', '发布/撤回通知'],
  staff: ['修改个人基本信息', '查看各类通知', '提交请假申请并填写具体事由'],
  student: ['查看部门信息', '提交加入部门申请']
};

function renderProfile() {
  const acc = ACCOUNTS.find((a) => a.username === cur.username);
  $('#views').innerHTML = `
    <div class="grid-2">
      <div class="card">
        <div class="card-head"><div><h2>个人信息</h2><div class="sub">干事可修改个人信息；数据仅保存在本机</div></div></div>
        <div class="info-list">
          <div><span>姓名</span><strong>${esc(acc.name)}</strong></div>
          <div><span>账号</span><strong>${esc(acc.username)}</strong></div>
          <div><span>角色</span><strong>${esc(ROLE_NAMES[acc.role])}</strong></div>
          <div><span>所属单位</span><strong>${esc(acc.dept)}</strong></div>
          <div><span>职务</span><strong>${esc(acc.title)}</strong></div>
        </div>
        <div class="row-actions" style="margin-top:16px">
          <button class="primary-btn light" id="editSelf">修改信息</button>
          ${cur.role === 'staff' ? '<button class="ghost-btn danger-outline" id="delSelf">删除账号</button>' : ''}
        </div>
      </div>
      <div class="card">
        <div class="card-head"><div><h2>我的权限</h2><div class="sub">依据需求文档的角色分工</div></div></div>
        <div class="perm-list">${PERMISSIONS[cur.role].map((p) => `<div class="perm-item"><span class="dot"></span>${esc(p)}</div>`).join('')}</div>
      </div>
    </div>`;

  $('#editSelf').onclick = () => {
    openForm({
      title: '修改个人信息',
      fields: [
        { key: 'name', label: '姓名', required: true },
        { key: 'phone', label: '联系方式' }
      ],
      values: { name: acc.name, phone: acc.phone || '' },
      onSubmit(d) {
        acc.name = d.name;
        acc.phone = d.phone;
        cur.name = d.name;
        $('#userName').textContent = d.name;
        $('#userAvatar').textContent = d.name.slice(-1);
        save(); render(); toast('个人信息已更新');
      }
    });
  };
  if ($('#delSelf')) $('#delSelf').onclick = () => {
    if (!confirm('删除后当前账号信息将被清除，确定继续？')) return;
    sessionStorage.removeItem(SESS_KEY);
    toast('账号信息已删除');
    setTimeout(() => location.reload(), 900);
  };
}

/* ---------------- 启动 ---------------- */
buildDemoAccounts();
$('#today').textContent = new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' });
const savedAcc = sessionStorage.getItem(SESS_KEY);
const initAcc = savedAcc && ACCOUNTS.find((a) => a.username === savedAcc);
if (initAcc) enterApp(initAcc);
