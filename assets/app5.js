/* ================= 职务选项：干事 → 责任教师 ================= */
(function () {
  const di = TITLES.indexOf('干事');
  if (di >= 0) TITLES[di] = '责任教师';
  const _roleFromTitle = roleFromTitle;
  roleFromTitle = function (title) {
    if (title === '责任教师') return 'teacher';
    return _roleFromTitle(title);
  };
})();

/* 增补申请事项：考核申诉、活动变更申请（在 app4 的 APPLY_TYPES 上扩展） */

APPLY_TYPES.appeal = {
  name: '考核申诉申请',
  hint: '对考核结果有异议时提交。流程：部长审核 → 主席团审核 → 责任教师终审；申诉记录与对应考核档案绑定留存。',
  stages: ['部长审核', '主席团审核', '责任教师终审'],
  fields: [
    { key: 'target', label: '关联考核对象（学期 / 被考核人）', required: true, placeholder: '如：2026-2027 学年第一学期 · 本人' },
    { key: 'dim', label: '申诉维度', type: 'select', options: ['出勤', '工作任务', '思想纪律', '群众评价', '总分'] },
    { key: 'reason', label: '申诉理由', type: 'textarea', required: true },
    { key: 'proof', label: '佐证材料（证书 / 记录 / 截图文件名）' }
  ]
};

APPLY_TYPES.actChange = {
  name: '活动变更申请',
  hint: '已审批活动如需变更时间、地点或报名名额，沿用部门申请 → 主席团审核 → 责任教师审核三级流程；终审通过后由负责人同步更新活动信息。',
  stages: ['部门申请', '主席团审核', '责任教师审核'],
  fields: [
    { key: 'originTitle', label: '原活动名称', required: true },
    { key: 'changeItem', label: '变更项', type: 'select', options: ['活动时间', '活动地点', '报名名额', '其他信息'] },
    { key: 'after', label: '变更后内容', type: 'textarea', required: true },
    { key: 'reason', label: '变更理由', type: 'textarea', required: true },
    { key: 'attach', label: '附件（选填）' }
  ]
};

/* ================= 公假证明：辅助方法 ================= */

/* 由班级名反推专业：去掉末尾编号与“班”，如 计算机网络技术2501班 → 计算机网络技术 */
function majorFromClass(cls) {
  const s = String(cls || '').trim();
  if (!s || s === '—') return '';
  return s.replace(/\s*\d+\s*班$/, '').replace(/班$/, '').trim();
}

/* 两个 datetime-local 值拼成“x年x月x日 HH:MM 至 HH:MM” */
function formatPeriod(start, end) {
  const fmt = (dt) => {
    const [d, t] = String(dt).split('T');
    const [y, m, dd] = (d || '').split('-');
    return { date: `${y}年${Number(m)}月${Number(dd)}日`, time: t || '' };
  };
  const a = fmt(start), b = fmt(end);
  if (a.date === b.date) return `${a.date} ${a.time} 至 ${b.time}`;
  return `${a.date} ${a.time} 至 ${b.date} ${b.time}`;
}

/* 固定节次时间段（按教务作息表） */
const SLOT_OPTIONS = [
  '第一大节（01、02 小节）08:30–10:10',
  '第二大节（03、04 小节）10:20–12:00',
  '第三大节（05、06 小节）14:30–16:10',
  '第四大节（07、08 小节）16:20–18:00',
  '第五大节（09、10 小节）19:00–21:00'
];

/* 登录后若账号未填专业，按班级自动补全 */
const _enterAppPatch = enterApp;
enterApp = function (acc) {
  if (acc && !acc.major) acc.major = majorFromClass(acc.class);
  _enterAppPatch(acc);
};

/* 包装通用表单：为公假证明注入时间选择器、节次下拉与课程名称框 */
const _openFormPatch = openForm;
openForm = function (opts) {
  const body = _openFormPatch(opts);
  if (opts && opts.title === '活动公假证明申请') {
    ['#f_period', '#f_courses'].forEach((sel) => {
      const el = body.querySelector(sel);
      if (el) { el.type = 'hidden'; el.value = ''; }
    });
    body.insertAdjacentHTML('beforeend', `
      <div class="field"><label>活动开始时间</label><input type="datetime-local" id="plStart" required></div>
      <div class="field"><label>活动结束时间</label><input type="datetime-local" id="plEnd" required></div>
      <div class="field"><label>请假星期</label><select id="plWeekday">${['周一', '周二', '周三', '周四', '周五', '周六', '周日'].map((w) => `<option value="${w}">${w}</option>`).join('')}</select></div>
      <div class="field"><label>请假节次</label><select id="plSlot">${SLOT_OPTIONS.map((o) => `<option value="${esc(o)}">${esc(o)}</option>`).join('')}</select></div>
      <div class="field"><label>请假课程名称</label><input id="plCourse" placeholder="填写请假课程名称" required></div>
    `);
    const origSubmit = modalSubmit;
    modalSubmit = function () {
      const start = body.querySelector('#plStart').value;
      const end = body.querySelector('#plEnd').value;
      const course = body.querySelector('#plCourse').value.trim();
      if (!start || !end) { toast('请选择活动起止时间'); return; }
      if (!course) { toast('请填写请假课程名称'); return; }
      const weekday = body.querySelector('#plWeekday').value;
      const slot = body.querySelector('#plSlot').value;
      const fp = body.querySelector('#f_period');
      if (fp) fp.value = formatPeriod(start, end);
      const fc = body.querySelector('#f_courses');
      if (fc) fc.value = `${weekday}，${slot}，课程名称：${course}`;
      origSubmit();
    };
  }
  return body;
};

/* ================= 审批：部长 / 负责人节点采集签字与联系电话 ================= */

function genericApprove(a) {
  const cfg = APPLY_TYPES[a.type];
  const last = a.stage >= cfg.stages.length - 1;
  const stageLabel = cfg.stages[a.stage] || '';
  a.track.push({ actor: cur.name, role: ROLE_NAMES[cur.role], action: stageLabel + '通过', note: '', time: today() });
  if (last) { a.status = a.type === 'feedback' ? '已答复' : '已通过'; applyApproved(a); }
  else { a.stage += 1; a.status = a.type === 'feedback' ? '处理中' : '审核中'; }
  commit('审批申请', `${a.typeName} · ${a.name} → ${a.status}`);
  save(); render();
  toast(last ? '申请已通过' : '已流转至下一审批节点');
}

/* 节点审批权限：管理员/主席团/责任教师可审批后续节点；部长仅能审批第一节点，不可代审 */
function canApprove(a) {
  if (allPower()) return true;
  if (cur.role === 'minister') return a.stage === 0;
  return false;
}

function openApproveForm(a) {
  const cfg = APPLY_TYPES[a.type];
  const stageLabel = cfg.stages[a.stage] || '';
  let signFile = '';
  let canvasDirty = false;
  const body = openForm({
    title: stageLabel + ' · ' + a.name,
    hint: '请在下方手写签字（或上传签字图片），并填写联系电话，确认后通过审批。',
    fields: [{ key: 'phone', label: '联系电话', required: true }],
    extra: `
      <div class="field"><label>手写签字（可直接在线书写，或点“选择文件”上传签字图片）</label>
        <canvas id="apCanvas" width="320" height="120" style="border:1px solid #d9e2ec;border-radius:8px;background:#fff;touch-action:none"></canvas>
        <div class="row-actions" style="margin-top:8px">
          <button type="button" class="link-btn" id="apClear">清除重写</button>
          <input type="file" id="apSign" accept="image/png,image/jpeg,image/jpg" class="file-input">
        </div>
      </div>`,
    onSubmit(d) {
      const signData = signFile || (canvasDirty ? body.querySelector('#apCanvas').toDataURL('image/png') : '');
      if (!signData) { toast('请先手写签字或上传签字图片'); return; }
      const signs = (a.approveSigns = a.approveSigns || []);
      signs.push({ sign: signData, phone: d.phone, actor: cur.name, role: ROLE_NAMES[cur.role], action: stageLabel, time: today() });
      if (a.stage === 0) { a.signMinister = signData; a.phoneMinister = d.phone; }
      else { a.signChair = signData; a.phoneChair = d.phone; }
      const last = a.stage >= cfg.stages.length - 1;
      a.track.push({ actor: cur.name, role: ROLE_NAMES[cur.role], action: stageLabel + '通过', note: '电话：' + d.phone, time: today() });
      if (last) { a.status = a.type === 'feedback' ? '已答复' : '已通过'; applyApproved(a); }
      else { a.stage += 1; a.status = a.type === 'feedback' ? '处理中' : '审核中'; }
      commit('审批申请', `${a.typeName} · ${a.name} → ${a.status}`);
      save(); render();
      toast(last ? '申请已通过' : '已流转至下一审批节点');
    }
  });
  const cv = body.querySelector('#apCanvas');
  const ctx = cv.getContext('2d');
  let drawing = false;
  const pos = (e) => { const r = cv.getBoundingClientRect(); const p = e.touches ? e.touches[0] : e; return { x: p.clientX - r.left, y: p.clientY - r.top }; };
  cv.addEventListener('pointerdown', (e) => { drawing = true; canvasDirty = true; ctx.beginPath(); const p = pos(e); ctx.moveTo(p.x, p.y); });
  cv.addEventListener('pointermove', (e) => { if (!drawing) return; const p = pos(e); ctx.lineTo(p.x, p.y); ctx.strokeStyle = '#111'; ctx.lineWidth = 2; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.stroke(); });
  const stop = () => { drawing = false; };
  cv.addEventListener('pointerup', stop);
  cv.addEventListener('pointerleave', stop);
  body.querySelector('#apClear').onclick = () => { ctx.clearRect(0, 0, cv.width, cv.height); canvasDirty = false; };
  body.querySelector('#apSign').onchange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    if (f.size > 512 * 1024) { toast('签字图片请控制在 512KB 以内'); return; }
    const rd = new FileReader();
    rd.onload = () => { signFile = rd.result; };
    rd.readAsDataURL(f);
  };
}

/* 重绑审批通过按钮：公假证明走“签字+电话”审批弹窗，其余类型沿用原流程 */
function rebindApprovePass() {
  document.querySelectorAll('[data-apply-pass]').forEach((btn) => {
    btn.onclick = () => {
      const a = db.applies.find((x) => x.id === btn.dataset.applyPass);
      if (!a) return;
      if (!canApprove(a)) { toast('当前节点无权审批'); return; }
      if (a.type === 'publicLeave') openApproveForm(a);
      else genericApprove(a);
    };
  });
}

/* 部门台账兜底：成员中存在、但部门信息表缺失的部门，按部长/主席补齐记录 */
function ensureDeptRoster() {
  if (!db || !db.members) return;
  const known = new Set(db.departments.map((d) => d.name));
  db.members.forEach((m) => {
    if (!m.dept || known.has(m.dept)) return;
    const head = db.members.find((x) => x.dept === m.dept && (x.title === '部长' || x.title === '主席'));
    db.departments.push({
      id: 'd_' + m.dept,
      name: m.dept,
      leader: head ? head.name : '—',
      desc: '部门事务统筹与成员管理。',
      status: '正常'
    });
    known.add(m.dept);
  });
}

/* 包装 render：隐藏历史入会申请（仅主席团 / 管理员可见），并重绑审批按钮 */
const _renderPatch = render;
render = function () {
  ensureDeptRoster();
  _renderPatch();
  document.querySelectorAll('.card').forEach((card) => {
    const h = card.querySelector('h2');
    if (h && h.textContent.trim() === '历史入会申请' && !['presidium', 'admin'].includes(cur.role)) card.remove();
  });
  // 对齐“我的申请”表：普通学生视角表头无申请人列，移除每行多余的空首格
  document.querySelectorAll('#views table').forEach((table) => {
    const th = table.querySelectorAll('thead th').length;
    table.querySelectorAll('tbody tr').forEach((tr) => {
      const tds = tr.querySelectorAll('td');
      if (tds.length > th && tds[0].textContent.trim() === '') tds[0].remove();
    });
  });
  // 部长仅能审批第一节点；已流转到主席团/教师节点的记录不再出现在部长待办
  if (cur.role === 'minister') {
    document.querySelectorAll('.card').forEach((card) => {
      const h2 = card.querySelector('h2');
      if (h2 && h2.textContent.includes('待我审批')) {
        card.querySelectorAll('tbody tr').forEach((tr) => {
          const btn = tr.querySelector('[data-apply-pass],[data-apply-reject]');
          const a = btn && db.applies.find((x) => x.id === (btn.dataset.applyPass || btn.dataset.applyReject));
          if (a && a.stage > 0) tr.remove();
        });
      }
    });
  }
  // 部门信息表 / 人员信息表：非主席团、管理员、责任教师仅可见本部门
  if (!allPower()) {
    document.querySelectorAll('.card').forEach((card) => {
      const h2 = card.querySelector('h2');
      if (!h2) return;
      const title = h2.textContent.trim();
      if (title === '部门信息表') {
        card.querySelectorAll('tbody tr').forEach((tr) => {
          const dept = tr.querySelector('td strong');
          if (dept && dept.textContent.trim() !== cur.dept) tr.remove();
        });
      } else if (title === '人员信息表') {
        card.querySelectorAll('tbody tr').forEach((tr) => {
          const badge = tr.querySelector('.badge.blue');
          const dept = badge ? badge.textContent.trim() : '';
          if (dept && dept !== cur.dept) tr.remove();
        });
      }
    });
  }
  rebindApprovePass();
};

/* ================= 证明导出版式（按上传模板排版） ================= */

function proofSignHtml(sign, phone, label) {
  const img = sign ? `<img src="${sign}" alt="${esc(label)}" style="height:48px;vertical-align:middle">` : '____________';
  return `<p style="margin:0 0 18px">${label}：${img}　联系电话：${esc(phone || '—')}</p>`;
}

plProofHtml = function (a) {
  const v = a.values || {};
  const major = a.major || majorFromClass(a.class) || '—';
  const signs = a.approveSigns || [];
  const signMinister = a.signMinister || signs[0]?.sign || '';
  const signChair = a.signChair || signs[1]?.sign || '';
  const phoneMinister = a.phoneMinister || (signs[0] && signs[0].phone) || v.phone || '—';
  const phoneChair = a.phoneChair || (signs[1] && signs[1].phone) || v.phone || '—';
  const paras = [
    `兹有${major}专业${a.class}学生${a.name}，学号：${a.sno}，是我系学生会${a.dept || '—'}成员，于${v.period || '—'}在${v.place || '—'}参加「${v.activityName || '—'}」活动。`,
    `因参加本次活动，需请假课程为：${v.courses || '—'}。`,
    '活动期间该生将按要求完成活动任务，后续会主动补齐课堂笔记、完成作业，不影响学业。',
    '特此证明。'
  ];
  const paraHtml = paras.map((ln, i) => `<p style="margin:0 0 ${i === 0 ? '18px' : '12px'};text-indent:2em">${esc(ln)}</p>`).join('');
  return `<div style="font-family:'FangSong','方正仿宋_GBK','仿宋',serif;font-size:16pt;line-height:1.9;max-width:760px;margin:0 auto;padding:32px 24px">
    <h2 style="text-align:center;font-size:18pt;font-weight:bold;margin:0 0 28px">应用经济系学生会证明</h2>
    ${paraHtml}
    <div style="margin-top:36px;padding-left:2em">
      ${proofSignHtml(signMinister, phoneMinister, '部长签字')}
      ${proofSignHtml(signChair, phoneChair, '负责人签字')}
      <p style="margin:0 0 18px">日期：${esc(cnDate(a.approvedAt))}</p>
      <p style="margin:0 0 18px">证明编号：${esc(a.proofNo || '—')}</p>
    </div>
  </div>`;
};

/* 详情弹窗：补显审批签字与电话（只读） */
const _openInfoPatch = openInfo;
openInfo = function (title, html, foot) {
  _openInfoPatch(title, html, foot);
  const rec = db.applies.find((a) => title && title.indexOf(a.typeName + ' · ') === 0);
  if (rec && rec.type === 'publicLeave') {
    const box = document.getElementById('modalBody');
    const rows = [];
    if (rec.phoneMinister) rows.push(`部长联系电话：${esc(rec.phoneMinister)}`);
    if (rec.phoneChair) rows.push(`负责人联系电话：${esc(rec.phoneChair)}`);
    if (rec.signMinister) rows.push(`部长签字已上传`);
    if (rec.signChair) rows.push(`负责人签字已上传`);
    if (rows.length) {
      const p = document.createElement('p');
      p.className = 'form-hint';
      p.style.marginTop = '8px';
      p.textContent = rows.join('　｜　');
      box.appendChild(p);
    }
  }
};
