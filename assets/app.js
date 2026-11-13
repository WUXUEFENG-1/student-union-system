/* 学生会信息管理系统 —— 纯前端版（数据保存在浏览器 localStorage） */
const STORE_KEY = 'su_ms_v1';

const DEPTS = ['秘书处', '组织部', '宣传部', '学习部', '文艺部', '体育部', '实践部', '生活部'];
const ROLES = ['主席', '副主席', '部长', '副部长', '干事'];

const SEED = {
  members: [
    { id: 'm1', name: '吴雪枫', sno: '20260001', dept: '秘书处', role: '主席', phone: '138****6621', joined: '2026-09-01', status: '在任' },
    { id: 'm2', name: '李思远', sno: '20260012', dept: '组织部', role: '副主席', phone: '139****3308', joined: '2026-09-01', status: '在任' },
    { id: 'm3', name: '陈雨桐', sno: '20260023', dept: '宣传部', role: '部长', phone: '137****9915', joined: '2026-09-03', status: '在任' },
    { id: 'm4', name: '赵一鸣', sno: '20260034', dept: '学习部', role: '部长', phone: '150****2244', joined: '2026-09-03', status: '在任' },
    { id: 'm5', name: '孙嘉禾', sno: '20260045', dept: '文艺部', role: '部长', phone: '188****7610', joined: '2026-09-05', status: '在任' },
    { id: 'm6', name: '周立新', sno: '20260056', dept: '体育部', role: '副部长', phone: '135****4487', joined: '2026-09-05', status: '在任' },
    { id: 'm7', name: '黄婉清', sno: '20260067', dept: '实践部', role: '部长', phone: '176****0192', joined: '2026-09-08', status: '在任' },
    { id: 'm8', name: '徐子航', sno: '20260078', dept: '生活部', role: '部长', phone: '131****5566', joined: '2026-09-08', status: '在任' },
    { id: 'm9', name: '何佳颖', sno: '20260089', dept: '宣传部', role: '干事', phone: '187****3344', joined: '2026-09-15', status: '在任' },
    { id: 'm10', name: '马晨阳', sno: '20260090', dept: '组织部', role: '干事', phone: '152****8877', joined: '2026-09-15', status: '在任' },
    { id: 'm11', name: '杨梦洁', sno: '20260091', dept: '文艺部', role: '干事', phone: '156****1102', joined: '2026-09-20', status: '在任' },
    { id: 'm12', name: '罗开元', sno: '20250033', dept: '体育部', role: '干事', phone: '133****9900', joined: '2025-09-18', status: '离任' }
  ],
  activities: [
    { id: 'a1', title: '第三届青春杯篮球赛', date: '2026-11-20', place: '学院篮球场', dept: '体育部', quota: 30, desc: '以班级为单位组队，11月20日开赛，报名截止11月18日。', signups: ['m6', 'm8', 'm10', 'm2'] },
    { id: 'a2', title: '长征精神主题演讲比赛', date: '2026-11-25', place: '教学楼报告厅', dept: '组织部', quota: 20, desc: '围绕长征精神与青年担当，初赛11月25日，决赛12月2日。', signups: ['m3', 'm9', 'm11', 'm4', 'm10'] },
    { id: 'a3', title: '国家网络安全宣传周反诈宣传', date: '2026-11-16', place: '学院广场', dept: '宣传部', quota: 15, desc: '现场反诈知识问答与短视频拍摄，招募志愿者。', signups: ['m1', 'm3', 'm9'] },
    { id: 'a4', title: '学生会新干事培训会', date: '2026-11-14', place: '学生会办公室', dept: '秘书处', quota: 25, desc: '制度学习、公文写作与办公软件培训。', signups: ['m1', 'm2', 'm4', 'm5', 'm7', 'm8'] }
  ],
  notices: [
    { id: 'n1', title: '关于举办第三届青春杯篮球赛的通知', content: '各部门、各班级：为丰富课余生活，学院定于11月20日举办第三届青春杯篮球赛，请各班于18日前完成组队报名。', date: '2026-11-10', pinned: true },
    { id: 'n2', title: '学生会值班安排调整说明', content: '自11月16日起，办公室值班时间调整为每周一至周五 17:30—19:00，请值班部门按时到岗并填写签到表。', date: '2026-11-09', pinned: false },
    { id: 'n3', title: '国家网络安全宣传周志愿者招募', content: '宣传周活动需要现场志愿者10名，负责反诈知识讲解与短视频拍摄，请有意向的同学联系宣传部。', date: '2026-11-06', pinned: false }
  ],
  sessions: [
    { id: 's1', title: '十一月第一次全体例会', date: '2026-11-08', records: { m1: true, m2: true, m3: true, m4: true, m5: false, m6: true, m7: true, m8: true, m9: true, m10: false, m11: true } },
    { id: 's2', title: '宣传周活动筹备会', date: '2026-11-12', records: { m1: true, m3: true, m9: true } }
  ],
  assets: [
    { id: 't1', name: '音响设备（含话筒）', qty: 1, borrower: '文艺部', date: '2026-11-12', due: '2026-11-18', status: '借出' },
    { id: 't2', name: '折叠桌', qty: 4, borrower: '生活部', date: '2026-11-10', due: '2026-11-15', status: '借出' },
    { id: 't3', name: '横幅支架', qty: 6, borrower: '', date: '', due: '', status: '在库' },
    { id: 't4', name: '志愿者马甲', qty: 20, borrower: '', date: '', due: '', status: '在库' }
  ]
};

let db = load();
const ui = { view: 'dashboard', mSearch: '', mDept: 'all', session: null, editing: null };

function load() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) { /* 数据损坏则重建 */ }
  const fresh = JSON.parse(JSON.stringify(SEED));
  localStorage.setItem(STORE_KEY, JSON.stringify(fresh));
  return fresh;
}
function save() { localStorage.setItem(STORE_KEY, JSON.stringify(db)); }
function uid(p) { return p + Date.now().toString(36).slice(-4) + Math.random().toString(36).slice(2, 4); }

/* ---------------- 通用 ---------------- */
const $ = (s) => document.querySelector(s);
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function toast(msg) {
  const el = $('#toast');
  el.textContent = msg;
  el.classList.remove('hidden');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => el.classList.add('hidden'), 2200);
}

let modalSubmit = null;
function openForm({ title, fields, values = {}, okText = '保存', onSubmit }) {
  $('#modalTitle').textContent = title;
  $('#modalOk').textContent = okText;
  $('#modalBody').innerHTML = fields.map((f) => {
    const v = values[f.key] == null ? '' : values[f.key];
    const req = f.required ? ' required' : '';
    if (f.type === 'select') {
      const opts = f.options.map((o) => `<option value="${esc(o)}"${o === v ? ' selected' : ''}>${esc(o)}</option>`).join('');
      return `<div class="field"><label>${esc(f.label)}</label><select id="f_${f.key}"${req}>${opts}</select></div>`;
    }
    if (f.type === 'textarea') {
      return `<div class="field"><label>${esc(f.label)}</label><textarea id="f_${f.key}"${req}>${esc(v)}</textarea></div>`;
    }
    return `<div class="field"><label>${esc(f.label)}</label><input id="f_${f.key}" type="${f.type || 'text'}" value="${esc(v)}"${req}></div>`;
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

/* ---------------- 视图切换 ---------------- */
const TITLES = {
  dashboard: ['工作台', '学生会日常事务总览'],
  members: ['成员与部门', '名册、部门归属与职务管理'],
  activities: ['活动与报名', '活动发布、报名登记与名单统计'],
  notices: ['通知公告', '公告发布、置顶与归档'],
  attendance: ['考勤签到', '例会签到与出勤率统计'],
  assets: ['物资借还', '物资台账、借出与归还登记']
};

function switchView(view) {
  ui.view = view;
  document.querySelectorAll('.nav-item').forEach((b) => b.classList.toggle('active', b.dataset.view === view));
  ['dashboard', 'members', 'activities', 'notices', 'attendance', 'assets'].forEach((v) => {
    $('#view-' + v).classList.toggle('hidden', v !== view);
  });
  $('#pageTitle').textContent = TITLES[view][0];
  $('#pageSub').textContent = TITLES[view][1];
  render();
}

function render() {
  const map = { dashboard: renderDashboard, members: renderMembers, activities: renderActivities, notices: renderNotices, attendance: renderAttendance, assets: renderAssets };
  map[ui.view]();
}

/* ---------------- 工作台 ---------------- */
function renderDashboard() {
  const active = db.members.filter((m) => m.status === '在任');
  const running = db.activities.filter((a) => a.date >= '2026-11-01');
  const lent = db.assets.filter((t) => t.status === '借出');
  const avgRate = attendanceRate();

  $('#view-dashboard').innerHTML = `
    <div class="hero">
      <div>
        <h2>应用经济学院学生会 · 2026 秋季学期</h2>
        <p>当前在任 ${active.length} 人，覆盖 ${DEPTS.length} 个部门，共 ${db.activities.length} 项活动在册。</p>
      </div>
      <span class="pill">数据本地存储 · 演示版</span>
    </div>
    <div class="stats">
      <div class="stat"><div class="k">在任成员</div><div class="v">${active.length}</div><div class="t">含 ${db.members.filter((m) => ['主席', '副主席'].includes(m.role)).length} 名主席团成员</div></div>
      <div class="stat"><div class="k">部门</div><div class="v">${DEPTS.length}</div><div class="t">各部部长均已到岗</div></div>
      <div class="stat"><div class="k">活动报名人次</div><div class="v">${db.activities.reduce((s, a) => s + a.signups.length, 0)}</div><div class="t">共 ${db.activities.length} 项活动</div></div>
      <div class="stat"><div class="k">例会平均出勤率</div><div class="v">${avgRate}%</div><div class="t">已记录 ${db.sessions.length} 次例会</div></div>
    </div>
    <div class="grid-2">
      <div class="card">
        <div class="card-head"><div><h2>近期公告</h2><div class="sub">置顶公告优先展示</div></div>
          <button class="primary-btn light" data-go="notices">查看全部</button></div>
        <div class="notice-list">${db.notices.slice().sort((a, b) => (b.pinned - a.pinned) || (b.date > a.date ? 1 : -1)).slice(0, 3).map((n) => `
          <div class="notice-item">
            <h4>${n.pinned ? '<span class="badge red">置顶</span>' : ''}${esc(n.title)}</h4>
            <p>${esc(n.content)}</p>
            <div class="notice-meta">${n.date}</div>
          </div>`).join('') || '<div class="empty">暂无公告</div>'}
        </div>
      </div>
      <div class="card">
        <div class="card-head"><div><h2>活动报名进展</h2><div class="sub">按已报名人数排序</div></div></div>
        <div class="notice-list">${db.activities.slice().sort((a, b) => b.signups.length - a.signups.length).map((a) => {
          const pct = Math.min(100, Math.round((a.signups.length / (a.quota || 1)) * 100));
          return `<div class="notice-item">
            <h4>${esc(a.title)}</h4>
            <div style="height:6px;background:#eef3f9;border-radius:6px;margin-top:8px;overflow:hidden">
              <div style="height:100%;width:${pct}%;background:#1e6fd9"></div>
            </div>
            <div class="notice-meta">${a.date} · ${a.dept} · ${a.signups.length}/${a.quota} 人</div>
          </div>`;
        }).join('') || '<div class="empty">暂无活动</div>'}
        </div>
      </div>
    </div>
    <div class="card">
      <div class="card-head"><div><h2>物资借出提醒</h2><div class="sub">共 ${lent.length} 项物资在外</div></div>
        <button class="primary-btn light" data-go="assets">物资台账</button></div>
      <div class="table-wrap"><table>
        <thead><tr><th>物资</th><th>数量</th><th>借用部门</th><th>借出日期</th><th>应还日期</th></tr></thead>
        <tbody>${lent.map((t) => `<tr><td>${esc(t.name)}</td><td>${t.qty}</td><td>${esc(t.borrower)}</td><td>${t.date}</td>
          <td>${t.due <= '2026-11-16' ? `<span class="badge amber">${t.due} 即将到期</span>` : t.due}</td></tr>`).join('')
          || '<tr><td colspan="5" class="empty">所有物资均在库</td></tr>'}</tbody>
      </table></div>
    </div>`;
}

function attendanceRate() {
  const active = db.members.filter((m) => m.status === '在任');
  if (!db.sessions.length || !active.length) return 0;
  let total = 0, present = 0;
  db.sessions.forEach((s) => {
    active.forEach((m) => { total++; if (s.records[m.id]) present++; });
  });
  return Math.round((present / total) * 100);
}

/* ---------------- 成员与部门 ---------------- */
function renderMembers() {
  const list = db.members.filter((m) => (ui.mDept === 'all' || m.dept === ui.mDept) &&
    (!ui.mSearch || (m.name + m.sno + m.role + m.dept).includes(ui.mSearch)));

  $('#view-members').innerHTML = `
    <div class="card">
      <div class="card-head">
        <div><h2>成员名册</h2><div class="sub">共 ${db.members.length} 人，当前筛选 ${list.length} 人</div></div>
        <div class="toolbar">
          <input class="search" id="mSearch" placeholder="搜索姓名 / 学号 / 职务" value="${esc(ui.mSearch)}">
          <select class="filter" id="mDept">
            <option value="all">全部部门</option>
            ${DEPTS.map((d) => `<option value="${d}"${ui.mDept === d ? ' selected' : ''}>${d}</option>`).join('')}
          </select>
          <button class="primary-btn" id="addMember">+ 新增成员</button>
        </div>
      </div>
      <div class="table-wrap"><table>
        <thead><tr><th>姓名</th><th>学号</th><th>部门</th><th>职务</th><th>联系方式</th><th>入会时间</th><th>状态</th><th>操作</th></tr></thead>
        <tbody>${list.map((m) => `
          <tr>
            <td><div class="name-cell"><span class="mini-avatar">${esc(m.name.slice(-1))}</span>${esc(m.name)}</div></td>
            <td>${esc(m.sno)}</td>
            <td><span class="badge blue">${esc(m.dept)}</span></td>
            <td>${esc(m.role)}</td>
            <td>${esc(m.phone)}</td>
            <td>${esc(m.joined)}</td>
            <td><span class="badge ${m.status === '在任' ? 'green' : 'gray'}">${esc(m.status)}</span></td>
            <td><div class="row-actions">
              <button class="link-btn" data-edit-member="${m.id}">编辑</button>
              <button class="link-btn del" data-del-member="${m.id}">删除</button>
            </div></td>
          </tr>`).join('') || '<tr><td colspan="8" class="empty">没有匹配的成员</td></tr>'}
        </tbody>
      </table></div>
    </div>
    <div class="card">
      <div class="card-head"><div><h2>部门人数分布</h2><div class="sub">仅统计在任成员</div></div></div>
      <div class="table-wrap"><table>
        <thead><tr><th>部门</th><th>在任人数</th><th>负责人</th><th>占在任成员比例</th></tr></thead>
        <tbody>${DEPTS.map((d) => {
          const ms = db.members.filter((m) => m.dept === d && m.status === '在任');
          const head = db.members.find((m) => m.dept === d && ['部长', '副部长', '主席', '副主席'].includes(m.role));
          const activeTotal = db.members.filter((m) => m.status === '在任').length || 1;
          return `<tr><td>${d}</td><td>${ms.length}</td><td>${head ? esc(head.name) + '（' + head.role + '）' : '—'}</td>
            <td>${Math.round((ms.length / activeTotal) * 100)}%</td></tr>`;
        }).join('')}</tbody>
      </table></div>
    </div>`;

  $('#mSearch').oninput = (e) => { ui.mSearch = e.target.value; renderMembers(); $('#mSearch').focus(); };
  $('#mDept').onchange = (e) => { ui.mDept = e.target.value; renderMembers(); };
  $('#addMember').onclick = () => memberForm(null);
  document.querySelectorAll('[data-edit-member]').forEach((b) => { b.onclick = () => memberForm(b.dataset.editMember); });
  document.querySelectorAll('[data-del-member]').forEach((b) => {
    b.onclick = () => {
      const m = db.members.find((x) => x.id === b.dataset.delMember);
      if (!confirm(`确定删除成员「${m.name}」？其活动报名与考勤记录将一并清除。`)) return;
      db.members = db.members.filter((x) => x.id !== m.id);
      db.activities.forEach((a) => { a.signups = a.signups.filter((id) => id !== m.id); });
      db.sessions.forEach((s) => { delete s.records[m.id]; });
      save(); renderMembers(); toast('成员已删除');
    };
  });
}

function memberForm(id) {
  const cur = id ? db.members.find((m) => m.id === id) : {};
  openForm({
    title: id ? '编辑成员' : '新增成员',
    fields: [
      { key: 'name', label: '姓名', required: true },
      { key: 'sno', label: '学号', required: true },
      { key: 'dept', label: '所属部门', type: 'select', options: DEPTS },
      { key: 'role', label: '职务', type: 'select', options: ROLES },
      { key: 'phone', label: '联系方式' },
      { key: 'joined', label: '入会时间', type: 'date' },
      { key: 'status', label: '状态', type: 'select', options: ['在任', '离任'] }
    ],
    values: Object.assign({ dept: DEPTS[0], role: '干事', joined: '2026-11-13', status: '在任' }, cur),
    onSubmit(data) {
      if (id) Object.assign(cur, data); else db.members.push(Object.assign({ id: uid('m') }, data));
      save();
      ui.view === 'members' ? renderMembers() : render();
      toast(id ? '成员信息已更新' : '成员已添加');
    }
  });
}

/* ---------------- 活动与报名 ---------------- */
function renderActivities() {
  $('#view-activities').innerHTML = `
    <div class="card">
      <div class="card-head">
        <div><h2>活动列表</h2><div class="sub">共 ${db.activities.length} 项活动，报名合计 ${db.activities.reduce((s, a) => s + a.signups.length, 0)} 人次</div></div>
        <button class="primary-btn" id="addAct">+ 发布活动</button>
      </div>
      <div class="table-wrap"><table>
        <thead><tr><th>活动名称</th><th>日期</th><th>地点</th><th>承办部门</th><th>报名 / 名额</th><th>操作</th></tr></thead>
        <tbody>${db.activities.slice().sort((a, b) => (a.date > b.date ? 1 : -1)).map((a) => `
          <tr>
            <td><strong>${esc(a.title)}</strong><div style="font-size:11.5px;color:#6b7d90;margin-top:4px">${esc(a.desc).slice(0, 40)}</div></td>
            <td>${esc(a.date)}</td>
            <td>${esc(a.place)}</td>
            <td><span class="badge blue">${esc(a.dept)}</span></td>
            <td><span class="badge ${a.signups.length >= a.quota ? 'amber' : 'green'}">${a.signups.length} / ${a.quota}</span></td>
            <td><div class="row-actions">
              <button class="link-btn" data-signup="${a.id}">报名名单</button>
              <button class="link-btn" data-edit-act="${a.id}">编辑</button>
              <button class="link-btn del" data-del-act="${a.id}">删除</button>
            </div></td>
          </tr>`).join('') || '<tr><td colspan="6" class="empty">暂无活动</td></tr>'}
        </tbody>
      </table></div>
    </div>`;

  $('#addAct').onclick = () => actForm(null);
  document.querySelectorAll('[data-edit-act]').forEach((b) => { b.onclick = () => actForm(b.dataset.editAct); });
  document.querySelectorAll('[data-signup]').forEach((b) => { b.onclick = () => signupPanel(b.dataset.signup); });
  document.querySelectorAll('[data-del-act]').forEach((b) => {
    b.onclick = () => {
      const a = db.activities.find((x) => x.id === b.dataset.delAct);
      if (!confirm(`确定删除活动「${a.title}」？`)) return;
      db.activities = db.activities.filter((x) => x.id !== a.id);
      save(); renderActivities(); toast('活动已删除');
    };
  });
}

function actForm(id) {
  const cur = id ? db.activities.find((a) => a.id === id) : {};
  openForm({
    title: id ? '编辑活动' : '发布活动',
    fields: [
      { key: 'title', label: '活动名称', required: true },
      { key: 'date', label: '活动日期', type: 'date', required: true },
      { key: 'place', label: '活动地点' },
      { key: 'dept', label: '承办部门', type: 'select', options: DEPTS },
      { key: 'quota', label: '名额', type: 'number' },
      { key: 'desc', label: '活动说明', type: 'textarea' }
    ],
    values: Object.assign({ date: '2026-11-20', dept: '组织部', quota: 20 }, cur),
    onSubmit(data) {
      if (id) Object.assign(cur, data);
      else db.activities.push(Object.assign({ id: uid('a'), signups: [] }, data));
      save(); renderActivities(); toast(id ? '活动已更新' : '活动已发布');
    }
  });
}

function signupPanel(id) {
  const act = db.activities.find((a) => a.id === id);
  const active = db.members.filter((m) => m.status === '在任');
  const checked = new Set(act.signups);
  $('#modalTitle').textContent = '报名名单 · ' + act.title;
  $('#modalOk').textContent = '保存名单';
  $('#modalBody').innerHTML = `
    <p style="font-size:12.5px;color:#6b7d90">名额 ${act.quota} 人，当前报名 <strong>${checked.size}</strong> 人。勾选即视为已报名。</p>
    <div class="att-grid">${active.map((m) => `<button type="button" class="att-chip${checked.has(m.id) ? ' on' : ''}" data-pick="${m.id}">${esc(m.name)} · ${esc(m.dept)}</button>`).join('') || '<span class="empty">暂无在任成员</span>'}</div>`;
  $('#modalBody').querySelectorAll('[data-pick]').forEach((btn) => {
    btn.onclick = () => {
      const mid = btn.dataset.pick;
      if (checked.has(mid)) { checked.delete(mid); btn.classList.remove('on'); }
      else {
        if (checked.size >= act.quota) { toast('已达名额上限（' + act.quota + ' 人）'); return; }
        checked.add(mid); btn.classList.add('on');
      }
    };
  });
  modalSubmit = () => {
    act.signups = Array.from(checked);
    save(); closeModal(); renderActivities(); toast('报名名单已保存');
  };
  $('#modalMask').classList.remove('hidden');
}

/* ---------------- 通知公告 ---------------- */
function renderNotices() {
  const sorted = db.notices.slice().sort((a, b) => (b.pinned - a.pinned) || (b.date > a.date ? 1 : -1));
  $('#view-notices').innerHTML = `
    <div class="card">
      <div class="card-head">
        <div><h2>通知公告</h2><div class="sub">共 ${db.notices.length} 条，置顶 ${db.notices.filter((n) => n.pinned).length} 条</div></div>
        <button class="primary-btn" id="addNotice">+ 发布公告</button>
      </div>
      <div class="notice-list">${sorted.map((n) => `
        <div class="notice-item">
          <h4>${n.pinned ? '<span class="badge red">置顶</span>' : ''}${esc(n.title)}</h4>
          <p>${esc(n.content)}</p>
          <div class="notice-meta" style="display:flex;justify-content:space-between;align-items:center;gap:10px">
            <span>${esc(n.date)}</span>
            <span class="row-actions">
              <button class="link-btn" data-pin="${n.id}">${n.pinned ? '取消置顶' : '置顶'}</button>
              <button class="link-btn" data-edit-notice="${n.id}">编辑</button>
              <button class="link-btn del" data-del-notice="${n.id}">删除</button>
            </span>
          </div>
        </div>`).join('') || '<div class="empty">暂无公告，点击右上角发布</div>'}
      </div>
    </div>`;

  $('#addNotice').onclick = () => noticeForm(null);
  document.querySelectorAll('[data-edit-notice]').forEach((b) => { b.onclick = () => noticeForm(b.dataset.editNotice); });
  document.querySelectorAll('[data-pin]').forEach((b) => {
    b.onclick = () => {
      const n = db.notices.find((x) => x.id === b.dataset.pin);
      n.pinned = !n.pinned; save(); renderNotices(); toast(n.pinned ? '已置顶' : '已取消置顶');
    };
  });
  document.querySelectorAll('[data-del-notice]').forEach((b) => {
    b.onclick = () => {
      if (!confirm('确定删除这条公告？')) return;
      db.notices = db.notices.filter((x) => x.id !== b.dataset.delNotice);
      save(); renderNotices(); toast('公告已删除');
    };
  });
}

function noticeForm(id) {
  const cur = id ? db.notices.find((n) => n.id === id) : {};
  openForm({
    title: id ? '编辑公告' : '发布公告',
    fields: [
      { key: 'title', label: '公告标题', required: true },
      { key: 'date', label: '发布日期', type: 'date', required: true },
      { key: 'content', label: '公告内容', type: 'textarea', required: true },
      { key: 'pinned', label: '是否置顶', type: 'select', options: ['否', '是'] }
    ],
    values: Object.assign({ date: '2026-11-13', pinned: '否' }, cur, cur.id ? { pinned: cur.pinned ? '是' : '否' } : {}),
    onSubmit(data) {
      const payload = { title: data.title, date: data.date, content: data.content, pinned: data.pinned === '是' };
      if (id) Object.assign(cur, payload); else db.notices.push(Object.assign({ id: uid('n') }, payload));
      save(); renderNotices(); toast(id ? '公告已更新' : '公告已发布');
    }
  });
}

/* ---------------- 考勤签到 ---------------- */
function renderAttendance() {
  const active = db.members.filter((m) => m.status === '在任');
  if (!db.sessions.length) {
    $('#view-attendance').innerHTML = `<div class="card"><div class="card-head"><div><h2>考勤签到</h2></div>
      <button class="primary-btn" id="addSession">+ 新建例会</button></div><div class="empty">还没有例会记录，先新建一次例会</div></div>`;
    $('#addSession').onclick = () => sessionForm();
    return;
  }
  if (!ui.session || !db.sessions.some((s) => s.id === ui.session)) ui.session = db.sessions[0].id;
  const cur = db.sessions.find((s) => s.id === ui.session);
  const present = Object.keys(cur.records).filter((k) => cur.records[k]).length;

  $('#view-attendance').innerHTML = `
    <div class="card">
      <div class="card-head">
        <div><h2>例会签到</h2><div class="sub">点击成员姓名即切换「已到 / 未到」，改动自动保存</div></div>
        <div class="toolbar">
          <select class="filter" id="sessionPick">
            ${db.sessions.map((s) => `<option value="${s.id}"${s.id === cur.id ? ' selected' : ''}>${s.date} · ${esc(s.title)}</option>`).join('')}
          </select>
          <button class="primary-btn light" id="addSession">+ 新建例会</button>
          <button class="ghost-btn" id="delSession" style="border-color:#e3eaf3;color:#c33b3b">删除本次</button>
        </div>
      </div>
      <div class="att-grid">${active.map((m) => `<button class="att-chip${cur.records[m.id] ? ' on' : ''}" data-att="${m.id}">${esc(m.name)} · ${esc(m.dept)}</button>`).join('')}</div>
      <div class="att-summary">
        <span>应到 ${active.length} 人</span>
        <span>实到 <strong style="color:#14915b">${present}</strong> 人</span>
        <span>缺席 <strong style="color:#c33b3b">${Math.max(0, active.length - present)}</strong> 人</span>
        <span>出勤率 ${active.length ? Math.round((present / active.length) * 100) : 0}%</span>
      </div>
    </div>
    <div class="card">
      <div class="card-head"><div><h2>历次例会出勤</h2><div class="sub">按日期倒序</div></div></div>
      <div class="table-wrap"><table>
        <thead><tr><th>例会</th><th>日期</th><th>实到 / 应到</th><th>出勤率</th><th>缺席人员</th></tr></thead>
        <tbody>${db.sessions.slice().sort((a, b) => (a.date > b.date ? -1 : 1)).map((s) => {
          const p = Object.keys(s.records).filter((k) => s.records[k]);
          const absent = active.filter((m) => !s.records[m.id]).map((m) => m.name);
          return `<tr><td>${esc(s.title)}</td><td>${s.date}</td><td>${p.length} / ${active.length}</td>
            <td><span class="badge ${p.length / (active.length || 1) >= .8 ? 'green' : 'amber'}">${active.length ? Math.round((p.length / active.length) * 100) : 0}%</span></td>
            <td>${absent.length ? esc(absent.join('、')) : '无'}</td></tr>`;
        }).join('')}</tbody>
      </table></div>
    </div>`;

  $('#sessionPick').onchange = (e) => { ui.session = e.target.value; renderAttendance(); };
  $('#addSession').onclick = () => sessionForm();
  $('#delSession').onclick = () => {
    if (!confirm(`确定删除例会「${cur.title}」的记录？`)) return;
    db.sessions = db.sessions.filter((s) => s.id !== cur.id);
    ui.session = null; save(); renderAttendance(); toast('例会记录已删除');
  };
  document.querySelectorAll('[data-att]').forEach((btn) => {
    btn.onclick = () => {
      const mid = btn.dataset.att;
      const next = !cur.records[mid];
      cur.records[mid] = next;
      btn.classList.toggle('on', next);
      save(); renderAttendance();
      toast(next ? '已签到' : '已取消签到');
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
    values: { title: '全体例会', date: '2026-11-13' },
    onSubmit(data) {
      const s = Object.assign({ id: uid('s'), records: {} }, data);
      db.sessions.push(s);
      ui.session = s.id;
      save(); renderAttendance(); toast('例会已创建，可开始签到');
    }
  });
}

/* ---------------- 物资借还 ---------------- */
function renderAssets() {
  $('#view-assets').innerHTML = `
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
            <td><span class="badge ${t.status === '在库' ? 'green' : 'amber'}">${esc(t.status)}</span></td>
            <td>${esc(t.borrower) || '—'}</td>
            <td>${esc(t.date) || '—'}</td>
            <td>${esc(t.due) || '—'}</td>
            <td><div class="row-actions">
              <button class="link-btn" data-borrow="${t.id}">${t.status === '在库' ? '借出登记' : '归还入库'}</button>
              <button class="link-btn" data-edit-asset="${t.id}">编辑</button>
              <button class="link-btn del" data-del-asset="${t.id}">删除</button>
            </div></td>
          </tr>`).join('') || '<tr><td colspan="7" class="empty">暂无物资</td></tr>'}
        </tbody>
      </table></div>
    </div>`;

  $('#addAsset').onclick = () => assetForm(null);
  document.querySelectorAll('[data-edit-asset]').forEach((b) => { b.onclick = () => assetForm(b.dataset.editAsset); });
  document.querySelectorAll('[data-del-asset]').forEach((b) => {
    b.onclick = () => {
      if (!confirm('确定删除该物资？')) return;
      db.assets = db.assets.filter((x) => x.id !== b.dataset.delAsset);
      save(); renderAssets(); toast('物资已删除');
    };
  });
  document.querySelectorAll('[data-borrow]').forEach((b) => {
    b.onclick = () => {
      const t = db.assets.find((x) => x.id === b.dataset.borrow);
      if (t.status === '借出') {
        t.status = '在库'; t.borrower = ''; t.date = ''; t.due = '';
        save(); renderAssets(); toast('已归还入库');
        return;
      }
      openForm({
        title: '借出登记 · ' + t.name,
        fields: [
          { key: 'borrower', label: '借用部门 / 人', required: true },
          { key: 'date', label: '借出日期', type: 'date', required: true },
          { key: 'due', label: '应还日期', type: 'date', required: true }
        ],
        values: { date: '2026-11-13', due: '2026-11-20' },
        onSubmit(data) {
          Object.assign(t, data, { status: '借出' });
          save(); renderAssets(); toast('借出登记完成');
        }
      });
    };
  });
}

function assetForm(id) {
  const cur = id ? db.assets.find((t) => t.id === id) : {};
  openForm({
    title: id ? '编辑物资' : '新增物资',
    fields: [
      { key: 'name', label: '物资名称', required: true },
      { key: 'qty', label: '数量', type: 'number', required: true },
      { key: 'status', label: '状态', type: 'select', options: ['在库', '借出'] }
    ],
    values: Object.assign({ qty: 1, status: '在库' }, cur),
    onSubmit(data) {
      if (id) Object.assign(cur, data);
      else db.assets.push(Object.assign({ id: uid('t'), borrower: '', date: '', due: '' }, data));
      save(); renderAssets(); toast(id ? '物资已更新' : '物资已添加');
    }
  });
}

/* ---------------- 顶部与全局 ---------------- */
$('#today').textContent = new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' });

document.querySelectorAll('.nav-item').forEach((b) => {
  b.onclick = () => {
    document.querySelector('.sidebar').classList.remove('open');
    switchView(b.dataset.view);
  };
});
$('#menuBtn').onclick = (e) => {
  e.stopPropagation();
  document.querySelector('.sidebar').classList.toggle('open');
};
document.addEventListener('click', (e) => {
  if (!e.target.closest('.sidebar') && !e.target.closest('#menuBtn')) document.querySelector('.sidebar').classList.remove('open');
});
document.addEventListener('click', (e) => {
  const go = e.target.closest('[data-go]');
  if (go) switchView(go.dataset.go);
});
$('#exportBtn').onclick = () => {
  const blob = new Blob([JSON.stringify(db, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = '学生会数据-' + new Date().toISOString().slice(0, 10) + '.json';
  a.click(); URL.revokeObjectURL(a.href);
  toast('数据已导出为 JSON');
};
$('#resetBtn').onclick = () => {
  if (!confirm('将清空当前所有改动并恢复演示数据，确定继续？')) return;
  localStorage.removeItem(STORE_KEY);
  db = load(); ui.session = null;
  switchView(ui.view); toast('已恢复演示数据');
};

switchView('dashboard');
