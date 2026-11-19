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
  hint: '对考核结果有异议时提交。流程：部长审核 → 主席团审核；申诉记录与对应考核档案绑定留存。',
  stages: ['部长审核', '主席团审核'],
  fields: [
    { key: 'target', label: '关联考核对象（学期 / 被考核人）', required: true, placeholder: '如：2026-2027 学年第一学期 · 本人' },
    { key: 'dim', label: '申诉维度', type: 'select', options: ['出勤', '工作任务', '思想纪律', '群众评价', '总分'] },
    { key: 'reason', label: '申诉理由', type: 'textarea', required: true },
    { key: 'proof', label: '佐证材料（证书 / 记录 / 截图，选填）', type: 'file' }
  ]
};

APPLY_TYPES.actChange = {
  name: '活动变更申请',
  hint: '已审批活动如需变更时间、地点或报名名额，沿用部门申请 → 主席团审核两级流程；终审通过后由负责人同步更新活动信息。',
  stages: ['部门申请', '主席团审核'],
  fields: [
    { key: 'originTitle', label: '原活动名称', required: true },
    { key: 'changeItem', label: '变更项', type: 'select', options: ['活动时间', '活动地点', '报名名额', '其他信息'] },
    { key: 'after', label: '变更后内容', type: 'textarea', required: true },
    { key: 'reason', label: '变更理由', type: 'textarea', required: true },
    { key: 'attach', label: '附件（选填）', type: 'file' }
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

/* ================= 换届竞选：四级签字流程 + 主席团开放报名时段 ================= */

APPLY_TYPES.election = {
  name: '换届竞选报名',
  hint: '报名时段由主席团开放；审批依次为 副部长 → 部长 → 副主席 → 主席 签字。',
  stages: ['副部长审核', '部长审核', '副主席审核', '主席审核'],
  fields: [
    { key: 'title', label: '竞选岗位', required: true },
    { key: 'talents', label: '个人特长', required: true },
    { key: 'intro', label: '个人简介', type: 'textarea', required: true },
    { key: 'deptKnow', label: '部门认识', type: 'textarea', required: true },
    { key: 'manifesto', label: '竞选宣言', type: 'textarea' },
    { key: 'workBrief', label: '学生会工作简述', type: 'textarea' },
    { key: 'awards', label: '评优获奖佐证材料（选填）', type: 'file' },
    { key: 'obey', label: '是否服从岗位调剂', type: 'select', options: ['是', '否'] },
    { key: 'photo', type: 'hidden' }
  ]
};

function electionPeriod() { return db.electionPeriod || { open: false, start: '', end: '' }; }
function electionOpenNow() {
  const p = electionPeriod();
  if (!p.open) return false;
  const now = new Date();
  if (p.start && now < new Date(p.start)) return false;
  if (p.end && now > new Date(p.end)) return false;
  return true;
}
function personOf(a) {
  return db.members.find((m) => m.name === a.name) || db.accounts.find((x) => x.name === a.name) || {};
}
function signOf(a, stage) {
  const s = (a.approveSigns || []).find((x) => x.action === stage);
  return s && s.sign ? s.sign : '';
}
function opinionOf(a, stage) {
  const s = (a.approveSigns || []).find((x) => x.action === stage);
  return s && s.opinion ? s.opinion : '';
}

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
  if (opts && (opts.type === 'publicLeave' || opts.title === '活动公假证明申请')) {
    ['#f_period', '#f_courses'].forEach((sel) => {
      const el = body.querySelector(sel);
      if (el) { const wrap = el.closest('.field'); if (wrap) wrap.style.display = 'none'; el.value = ''; }
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
  if (opts && (opts.type === 'cert' || opts.type === 'volunteer' || opts.title === '任职证明申请' || opts.title === '志愿服务认定申请')) {
    const isCert = opts.type ? opts.type === 'cert' : opts.title === '任职证明申请';
    const srcKey = isCert ? 'range' : 'period';
    const srcEl = body.querySelector('#f_' + srcKey);
    const oldVal = srcEl ? srcEl.value : '';
    if (srcEl) { const wrap = srcEl.closest('.field'); if (wrap) wrap.style.display = 'none'; srcEl.value = ''; }
    let preStart = '', preEnd = '';
    const pm = String(oldVal).split(/\s*至\s*/);
    if (pm.length === 2) { preStart = pm[0].trim(); preEnd = pm[1].trim(); }
    body.insertAdjacentHTML('beforeend', `
      <div class="field"><label>${isCert ? '任职开始日期' : '活动开始日期'}</label><input type="date" id="f_${srcKey}Start" value="${esc(preStart)}" required></div>
      <div class="field"><label>${isCert ? '任职结束日期' : '活动结束日期'}</label><input type="date" id="f_${srcKey}End" value="${esc(preEnd)}" required></div>
    `);
    const origSubmit = modalSubmit;
    modalSubmit = function () {
      const s = body.querySelector('#f_' + srcKey + 'Start').value;
      const e = body.querySelector('#f_' + srcKey + 'End').value;
      if (!s || !e) { toast('请选择完整的起止日期'); return; }
      if (srcEl) srcEl.value = `${s} 至 ${e}`;
      origSubmit();
    };
  }
  if (opts && (opts.type === 'election' || opts.title === '换届竞选报名')) {
    const photoField = document.createElement('div');
    photoField.className = 'field';
    photoField.innerHTML = '<label>一寸证件照（上传后自动填入申请表照片位）</label><input type="file" id="elPhoto" accept="image/png,image/jpeg,image/jpg" class="file-input">';
    body.appendChild(photoField);
    body.querySelector('#elPhoto').onchange = async (e) => {
      const f = e.target.files[0];
      if (!f) return;
      if (f.size > 5 * 1024 * 1024) { toast('证件照请控制在 5MB 以内'); return; }
      try {
        const dataUrl = await compressImage(f, 600, 0.85);
        const h = body.querySelector('#f_photo');
        if (h) h.value = dataUrl;
      } catch (err) { toast('图片读取失败，请更换一张证件照'); }
    };
    const origSubmit = modalSubmit;
    modalSubmit = function () {
      if (!electionOpenNow()) { toast('换届竞选报名尚未开放，请等待主席团开放报名时段'); return; }
      origSubmit();
    };
  }
  return body;
};

/* ================= 审批：各节点采集签字、电话（仅公假证明）与审批意见 ================= */

/* 节点审批权限：按四级岗位严格限定可审节点，不可跨级代审 */
function canApprove(a) {
  if (cur.role === 'admin') return true;
  if (a.type === 'election') {
    const t = cur.title || '';
    if (a.stage === 0) return t === '副部长';
    if (a.stage === 1) return t === '部长';
    if (a.stage === 2) return t === '副主席';
    if (a.stage === 3) return t === '主席';
    return false;
  }
  if (cur.role === 'minister') return a.stage === 0 && cur.dept === a.dept;
  if (cur.role === 'presidium') return a.stage === 1;
  return false;
}

function openApproveForm(a) {
  const cfg = APPLY_TYPES[a.type];
  const stages = (typeof applyStages === 'function') ? applyStages(a) : (cfg.stages || []);
  const stageLabel = stages[a.stage] || '';
  let signFile = '';
  let canvasDirty = false;
  const needPhone = a.type === 'publicLeave';
  const body = openForm({
    title: stageLabel + ' · ' + a.name,
    hint: needPhone ? '请在下方手写签字（或上传签字图片），填写联系电话与审批意见，确认后通过审批。' : '请在下方手写签字（或上传签字图片），可填写审批意见，确认后通过审批。',
    fields: needPhone
      ? [
          { key: 'phone', label: '联系电话', required: true },
          { key: 'opinion', label: '审批意见', type: 'textarea' }
        ]
      : [{ key: 'opinion', label: '审批意见', type: 'textarea' }],
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
      if (needPhone && !d.phone) { toast('请填写联系电话'); return; }
      const signs = (a.approveSigns = a.approveSigns || []);
      signs.push({ sign: signData, phone: d.phone, opinion: d.opinion || '', actor: cur.name, role: ROLE_NAMES[cur.role], action: stageLabel, time: today() });
      if (a.stage === 0) { a.signMinister = signData; a.phoneMinister = d.phone; }
      else { a.signChair = signData; a.phoneChair = d.phone; }
      const last = a.stage >= stages.length - 1;
      const trackNote = (needPhone ? '电话：' + d.phone : '') + (d.opinion ? (needPhone ? '；' : '') + '意见：' + d.opinion : '');
      a.track.push({ actor: cur.name, role: ROLE_NAMES[cur.role], action: stageLabel + '通过', note: trackNote, time: today() });
      if (last) { a.status = a.type === 'feedback' ? '已答复' : '已通过'; applyApproved(a); }
      else { a.stage += 1; a.status = a.type === 'feedback' ? '处理中' : '审核中'; }
      notifyStagePass(a, stageLabel, last ? '' : (stages[a.stage] || ''));
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
    rd.onload = async () => { signFile = await shrinkImageDataUrl(rd.result, 480, 70); };
    rd.readAsDataURL(f);
  };
}

/* 重绑审批通过按钮：所有类型均走“签字（公假另需电话）+意见”审批弹窗 */
function rebindApprovePass() {
  document.querySelectorAll('[data-apply-pass]').forEach((btn) => {
    btn.onclick = () => {
      const a = db.applies.find((x) => x.id === btn.dataset.applyPass);
      if (!a) return;
      if (!canApprove(a)) { toast('当前节点无权审批'); return; }
      openApproveForm(a);
    };
  });
}

/* 详情弹窗：按中文标签展示竞选/各类申请，证件照直接显示 */
function openApplyInfo(a) {
  const v = a.values || {};
  const p = personOf(a);
  const auto = [
    ['姓名', a.name], ['学号', a.sno], ['性别', p.gender || '—'], ['班级', a.class],
    ['民族', p.ethnicity || '—'], ['政治面貌', p.politics || '—'], ['联系方式', p.phone || '—']
  ];
  let rows = auto.map(([l, val]) => `<div><span>${esc(l)}</span><strong>${esc(val)}</strong></div>`).join('');
  const cfg = APPLY_TYPES[a.type];
  if (cfg && cfg.fields) {
    rows += cfg.fields.filter((f) => f.key !== 'photo').map((f) => {
      const val = v[f.key] || '';
      if (f.type === 'file') {
        if (val && v[f.key + 'Data']) return `<div><span>${esc(f.label)}</span><strong><button class="link-btn" data-apply-file="${a.id}" data-fkey="${f.key}">${esc(val)}</button></strong></div>`;
        return `<div><span>${esc(f.label)}</span><strong>${esc(val || '—')}</strong></div>`;
      }
      return `<div><span>${esc(f.label)}</span><strong>${esc(val || '—')}</strong></div>`;
    }).join('');
  }
  if (v.photo) rows += `<div><span>一寸证件照</span><img src="${v.photo}" style="height:96px;border:1px solid #d9e2ec;border-radius:6px"></div>`;
  const trackHtml = (a.track || []).map((t) =>
    `<div class="perm-item"><span class="dot"></span><div>${esc(t.actor)} · ${esc(t.action)}${t.note ? '（' + esc(t.note) + '）' : ''} · ${esc(t.time)}</div></div>`).join('')
    || '<div class="perm-item"><span class="dot"></span>暂无轨迹</div>';
  const showExport = (a.type === 'election' && a.status === '已通过') || a.type === 'volunteer';
  const extra = showExport
    ? `<div class="row-actions" style="margin-top:12px"><button class="primary-btn light" id="elExportBtn">导出申请表</button></div>` : '';
  const noHint = a.volNo ? `<p class="form-hint">认定编号：${esc(a.volNo)}</p>` : '';
  openInfo(a.typeName + ' · ' + a.name,
    `<div class="info-list">${rows}</div>${noHint}${extra}<div class="form-hint" style="margin-top:10px">审批流转（可视化）</div>${flowTimelineHtml(a)}<div class="form-hint" style="margin-top:10px">操作记录</div><div class="perm-list">${trackHtml}</div>`,
    '提交时间：' + a.date);
  const btn = document.getElementById('elExportBtn');
  if (btn) btn.onclick = () => (a.type === 'volunteer' ? volunteerExportPicker(a) : electionExportPicker(a));
  document.querySelectorAll('[data-apply-file]').forEach((b) => {
    b.onclick = () => {
      const rec = (db.applies || []).find((x) => x.id === b.dataset.applyFile);
      if (!rec) return;
      const dk = b.dataset.fkey + 'Data';
      const url = (rec.values && rec.values[dk]) || '';
      const name = (rec.values && rec.values[b.dataset.fkey]) || '附件';
      if (!url) { toast('附件内容缺失'); return; }
      try { downloadDataUrl(url, name); commit('下载申请附件', `${rec.typeName} · ${rec.name}`); }
      catch (e) { toast('附件解析失败'); }
    };
  });
}

function rebindApplyView() {
  document.querySelectorAll('[data-apply-view]').forEach((btn) => {
    btn.onclick = () => {
      const a = db.applies.find((x) => x.id === btn.dataset.applyView);
      if (a) openApplyInfo(a);
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

/* 包装 render：隐藏历史入会申请（仅主席团 / 管理员可见），移除模板设置卡片，并重绑审批按钮 */
const _renderPatch = render;
render = function () {
  ensureDeptRoster();
  _renderPatch();
  document.querySelectorAll('.card').forEach((card) => {
    const h = card.querySelector('h2');
    if (!h) return;
    const title = h.textContent.trim();
    if (title === '历史入会申请' && !['presidium', 'admin'].includes(cur.role)) card.remove();
    if (title === '公假证明模板设置') card.remove();
  });
  // 对齐“我的申请”表：普通学生视角表头无申请人列，移除每行多余的空首格
  document.querySelectorAll('#views table').forEach((table) => {
    const th = table.querySelectorAll('thead th').length;
    table.querySelectorAll('tbody tr').forEach((tr) => {
      const tds = tr.querySelectorAll('td');
      if (tds.length > th && tds[0].textContent.trim() === '') tds[0].remove();
    });
  });
  // 待办列表：部长/副部长只看部门节点，主席团只看主席团节点，不跨级显示
  if (cur.role === 'minister' || cur.role === 'presidium') {
    document.querySelectorAll('.card').forEach((card) => {
      const h2 = card.querySelector('h2');
      if (!h2 || !h2.textContent.includes('待我审批')) return;
      card.querySelectorAll('tbody tr').forEach((tr) => {
        const btn = tr.querySelector('[data-apply-pass],[data-apply-reject]');
        const a = btn && db.applies.find((x) => x.id === (btn.dataset.applyPass || btn.dataset.applyReject));
        if (!a) return;
        if (cur.role === 'minister' && a.type !== 'election' && a.dept !== cur.dept) { tr.remove(); return; }
        let show;
        if (a.type === 'election') {
          show = cur.role === 'minister' ? a.stage <= 1 : a.stage >= 2;
        } else {
          show = cur.role === 'minister' ? a.stage === 0 : a.stage === 1;
        }
        if (!show) tr.remove();
      });
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
  // 主席团/管理员：换届竞选报名时段设置（仅工作台显示）
  if (allPower() && curView === 'dashboard') {
    const p = electionPeriod();
    const wrap = document.createElement('div');
    wrap.className = 'card';
    wrap.innerHTML = `
      <div class="card-head"><div><h2>换届竞选报名时段</h2><div class="sub">开放或关闭竞选报名；关闭后学生不可提交换届竞选报名</div></div></div>
      <div class="field"><label>开放开始时间</label><input type="datetime-local" id="elStart" value="${p.start || ''}"></div>
      <div class="field"><label>开放结束时间</label><input type="datetime-local" id="elEnd" value="${p.end || ''}"></div>
      <div class="row-actions">
        <button class="primary-btn" id="elSaveOpen">保存并开放报名</button>
        <button class="link-btn del" id="elClose">关闭报名</button>
      </div>`;
    $('#views').appendChild(wrap);
    wrap.querySelector('#elSaveOpen').onclick = () => {
      db.electionPeriod = { open: true, start: wrap.querySelector('#elStart').value, end: wrap.querySelector('#elEnd').value };
      commit('设置竞选报名时段', '开放换届竞选报名'); save(); render(); toast('报名时段已开放');
    };
    wrap.querySelector('#elClose').onclick = () => {
      db.electionPeriod = { open: false, start: '', end: '' };
      commit('关闭竞选报名', '关闭换届竞选报名'); save(); render(); toast('报名已关闭');
    };
  }
  rebindApprovePass();
  rebindApplyView();
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
    `兹有${major}专业${a.class}班学生${a.name}，学号：${a.sno}，是我系学生会${a.dept || '—'}${a.title || '成员'}，于${v.period || '—'}在${v.place || '—'}参加「${v.activityName || '—'}」活动。`,
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

/* ================= 换届竞选申请表导出：生成内嵌签字与照片的 .docx ================= */

/* 图片压缩：等比缩放到上限尺寸并按 JPEG 导出，保证入库数据小于 5MB */
function compressImage(file, maxDim, quality) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const cv = document.createElement('canvas');
      cv.width = w; cv.height = h;
      cv.getContext('2d').drawImage(img, 0, 0, w, h);
      resolve(cv.toDataURL('image/jpeg', quality));
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('image load failed')); };
    img.src = url;
  });
}

function dataUrlBytes(u) {  const b = String(u || '').split(',')[1] || '';
  const bin = atob(b);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return arr;
}

function crc32(bytes) {
  let c = ~0;
  for (let i = 0; i < bytes.length; i++) {
    c ^= bytes[i];
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xEDB88320 & (-(c & 1)));
  }
  return (~c) >>> 0;
}

function buildZip(files) {
  const enc = new TextEncoder();
  const chunks = [];
  const central = [];
  let offset = 0;
  files.forEach((f) => {
    const name = enc.encode(f.name);
    const data = f.data;
    const localOffset = offset;
    const crc = crc32(data);
    const lh = new Uint8Array(30);
    const lv = new DataView(lh.buffer);
    lv.setUint32(0, 0x04034b50, true);
    lv.setUint16(4, 20, true);
    lv.setUint16(6, 0, true);
    lv.setUint16(8, 0, true);
    lv.setUint16(10, 0, true);
    lv.setUint16(12, 0x21, true);
    lv.setUint32(14, crc, true);
    lv.setUint32(18, data.length, true);
    lv.setUint32(22, data.length, true);
    lv.setUint16(26, name.length, true);
    lv.setUint16(28, 0, true);
    chunks.push(lh, name, data);
    const ch = new Uint8Array(46);
    const cv = new DataView(ch.buffer);
    cv.setUint32(0, 0x02014b50, true);
    cv.setUint16(4, 20, true);
    cv.setUint16(6, 20, true);
    cv.setUint16(8, 0, true);
    cv.setUint16(10, 0, true);
    cv.setUint16(12, 0, true);
    cv.setUint16(14, 0x21, true);
    cv.setUint32(16, crc, true);
    cv.setUint32(20, data.length, true);
    cv.setUint32(24, data.length, true);
    cv.setUint16(28, name.length, true);
    cv.setUint16(30, 0, true);
    cv.setUint16(32, 0, true);
    cv.setUint16(34, 0, true);
    cv.setUint16(36, 0, true);
    cv.setUint16(38, 0, true);
    cv.setUint32(42, localOffset, true);
    central.push(ch, name);
    offset += 30 + name.length + data.length;
  });
  let cdSize = 0;
  central.forEach((c) => cdSize += c.length);
  const eh = new Uint8Array(22);
  const ev = new DataView(eh.buffer);
  ev.setUint32(0, 0x06054b50, true);
  ev.setUint16(4, 0, true);
  ev.setUint16(6, 0, true);
  ev.setUint16(8, files.length, true);
  ev.setUint16(10, files.length, true);
  ev.setUint32(12, cdSize, true);
  ev.setUint32(16, offset, true);
  ev.setUint16(20, 0, true);
  return new Blob([...chunks, ...central, eh], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
}

function buildElectionDocx(a) {
  const v = a.values || {};
  const p = personOf(a);
  const media = [];
  const addMedia = (url) => {
    if (!url) return '';
    const rid = 'rId' + (media.length + 1);
    const ext = /png/i.test(url) ? 'png' : 'jpeg';
    media.push({ rid, name: 'word/media/image' + media.length + '.' + ext, bytes: dataUrlBytes(url) });
    return rid;
  };
  const escXml = (s) => esc(s);
  const run = (text, o) => `<w:r><w:rPr>${(o && o.bold) ? '<w:b/>' : ''}<w:sz w:val="${(o && o.size) || 21}"/></w:rPr><w:t xml:space="preserve">${escXml(text)}</w:t></w:r>`;
  const imgRun = (rid, w, h) => `<w:r><w:drawing><wp:inline distT="0" distB="0" distL="0" distR="0"><wp:extent cx="${w}" cy="${h}"/><wp:docPr id="${media.length + 1}" name="img${media.length + 1}"/><wp:cNvGraphicFramePr><a:graphicFrameLocks noChangeAspect="1"/></wp:cNvGraphicFramePr><a:graphic><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:pic><pic:nvPicPr><pic:cNvPr id="0" name="img"/><pic:cNvPicPr/></pic:nvPicPr><pic:blipFill><a:blip r:embed="${rid}"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill><pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="${w}" cy="${h}"/></a:xfrm><a:prstGeom prst="rect"/></pic:spPr></pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r>`;
  const cell = (content, opts) => {
    opts = opts || {};
    const span = opts.span || 1;
    const vm = opts.vMerge;
    let pr = `<w:tcPr><w:tcW w:w="1807" w:type="dxa"/>`;
    if (span > 1) pr += `<w:gridSpan w:val="${span}"/>`;
    if (vm) pr += `<w:vMerge w:val="${vm}"/>`;
    pr += '</w:tcPr>';
    return `<w:tc>${pr}<w:p>${content || ''}</w:p></w:tc>`;
  };

  const photoRid = addMedia(v.photo);
  const signRid = {};
  ['副部长审核', '部长审核', '副主席审核', '主席审核'].forEach((s) => { signRid[s] = addMedia(signOf(a, s)); });
  const sigImg = (s) => signRid[s] ? imgRun(signRid[s], 720000, 360000) : '____________';
  const op = (arr) => arr.map((x) => opinionOf(a, x)).filter(Boolean).join('；') || '—';

  const c7 = run(`意见：${op(['副部长审核', '部长审核'])}`) + '<w:r><w:br/></w:r>' + run('部长（签字）：') + sigImg('部长审核') + run('　　副部长（签字）：') + sigImg('副部长审核');
  const c8 = run(`意见：${op(['副主席审核', '主席审核'])}`) + '<w:r><w:br/></w:r>' + run('主席（签字）：') + sigImg('主席审核') + run('　　副主席（签字）：') + sigImg('副主席审核');

  const rows = [
    `<w:tr>${cell(run('姓    名', { bold: true }))}${cell(run(a.name))}${cell(run('性    别', { bold: true }))}${cell(run(p.gender || '—'))}${cell(photoRid ? imgRun(photoRid, 900000, 1260000) : '', { vMerge: 'restart' })}</w:tr>`,
    `<w:tr>${cell(run('学    号', { bold: true }))}${cell(run(a.sno))}${cell(run('联系方式', { bold: true }))}${cell(run(p.phone || '—'))}${cell('', { vMerge: 'continue' })}</w:tr>`,
    `<w:tr>${cell(run('班    级', { bold: true }))}${cell(run(a.class), { span: 2 })}${cell(run('民  族', { bold: true }))}${cell(run(p.ethnicity || '—'))}${cell('', { vMerge: 'continue' })}</w:tr>`,
    `<w:tr>${cell(run('政治面貌', { bold: true }))}${cell(run(p.politics || '—'))}${cell(run('竞选岗位', { bold: true }))}${cell(run(v.title || '—'), { span: 3 })}</w:tr>`,
    `<w:tr>${cell(run('个人特长', { bold: true }))}${cell(run(v.talents || '—'), { span: 5 })}</w:tr>`,
    `<w:tr>${cell(run('个人简介', { bold: true }))}${cell(run(v.intro || '—'), { span: 5 })}</w:tr>`,
    `<w:tr>${cell(run('部门认识', { bold: true }))}${cell(run(v.deptKnow || '—'), { span: 5 })}</w:tr>`,
    `<w:tr>${cell(run('部门初审', { bold: true }))}${cell(c7, { span: 5 })}</w:tr>`,
    `<w:tr>${cell(run('主席团意见', { bold: true }))}${cell(c8, { span: 5 })}</w:tr>`
  ].join('');

  const borders = ['top', 'left', 'bottom', 'right', 'insideH', 'insideV']
    .map((b) => `<w:${b} w:val="single" w:sz="4" w:space="0" w:color="333333"/>`).join('');

  const docXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">
<w:body>
<w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:b/><w:sz w:val="32"/></w:rPr><w:t>应用经济系学生会换届报名申请表</w:t></w:r></w:p>
<w:tbl><w:tblPr><w:tblW w:w="9036" w:type="dxa"/><w:tblBorders>${borders}</w:tblBorders></w:tblPr>
<w:tblGrid><w:gridCol w:w="1807"/><w:gridCol w:w="1807"/><w:gridCol w:w="1807"/><w:gridCol w:w="1807"/><w:gridCol w:w="1807"/></w:tblGrid>
${rows}
</w:tbl>
</w:body></w:document>`;

  const rels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
${media.map((m) => `<Relationship Id="${m.rid}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="${m.name.replace(/^word\//, '')}"/>`).join('')}
</Relationships>`;

  const ct = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="xml" ContentType="application/xml"/>
<Default Extension="png" ContentType="image/png"/>
<Default Extension="jpeg" ContentType="image/jpeg"/>
<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`;

  const rootRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`;

  const enc = new TextEncoder();
  const files = [
    { name: '[Content_Types].xml', data: enc.encode(ct) },
    { name: '_rels/.rels', data: enc.encode(rootRels) },
    { name: 'word/document.xml', data: enc.encode(docXml) },
    { name: 'word/_rels/document.xml.rels', data: enc.encode(rels) }
  ];
  media.forEach((m) => files.push({ name: m.name, data: m.bytes }));
  return buildZip(files);
}

function electionPrintHtml(a) {
  const v = a.values || {};
  const p = personOf(a);
  const sig = (s) => signOf(a, s) ? `<img src="${signOf(a, s)}" style="height:34px;vertical-align:middle">` : '____________';
  const op = (arr) => arr.map((x) => opinionOf(a, x)).filter(Boolean).join('；') || '—';
  const cell = (t) => `<td style="border:1px solid #333;padding:6px 10px">${esc(t || '—')}</td>`;
  const lab = (t) => `<td style="border:1px solid #333;padding:6px 10px;background:#f2f5fa;font-weight:600">${esc(t)}</td>`;
  const photo = v.photo ? `<img src="${v.photo}" style="width:100%;height:100%;object-fit:cover">` : '一寸照';
  return `<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8"><title>换届申请表_${esc(a.name)}</title>
  <style>@page{size:A4;margin:2cm}body{font-family:'FangSong','仿宋',serif;padding:16px}h2{text-align:center}table{border-collapse:collapse;width:100%}td{vertical-align:middle}</style></head>
  <body><h2>应用经济系学生会换届报名申请表</h2>
  <table>
    <tr>${lab('姓名')}${cell(a.name)}${lab('性别')}${cell(p.gender)}<td rowspan="3" style="border:1px solid #333;width:120px;height:150px;text-align:center">${photo}</td></tr>
    <tr>${lab('学号')}${cell(a.sno)}${lab('联系方式')}${cell(p.phone)}</tr>
    <tr>${lab('班级')}${cell(a.class)}${lab('民族')}${cell(p.ethnicity)}</tr>
    <tr>${lab('政治面貌')}${cell(p.politics)}${lab('竞选岗位')}${cell(v.title)}<td></td></tr>
    <tr>${lab('个人特长')}<td colspan="4" style="border:1px solid #333;padding:6px 10px">${esc(v.talents || '—')}</td></tr>
    <tr>${lab('个人简介')}<td colspan="4" style="border:1px solid #333;padding:6px 10px">${esc(v.intro || '—')}</td></tr>
    <tr>${lab('部门认识')}<td colspan="4" style="border:1px solid #333;padding:6px 10px">${esc(v.deptKnow || '—')}</td></tr>
    <tr>${lab('部门初审')}<td colspan="4" style="border:1px solid #333;padding:6px 10px">意见：${op(['副部长审核', '部长审核'])}<br>部长（签字）：${sig('部长审核')}　　副部长（签字）：${sig('副部长审核')}</td></tr>
    <tr>${lab('主席团意见')}<td colspan="4" style="border:1px solid #333;padding:6px 10px">意见：${op(['副主席审核', '主席审核'])}<br>主席（签字）：${sig('主席审核')}　　副主席（签字）：${sig('副主席审核')}</td></tr>
  </table></body></html>`;
}

function electionExportPicker(a) {
  $('#modalTitle').textContent = '导出：' + a.typeName;
  $('#modalOk').classList.add('hidden');
  $('#modalCancel').textContent = '关闭';
  modalSubmit = null;
  $('#modalBody').innerHTML = `<p class="form-hint">选择导出格式，签字与证件照将一并写入文件。</p>
    <div class="export-grid">
      <button class="primary-btn" id="elWord">导出 Word（.docx）</button>
      <button class="primary-btn light" id="elPdf">导出 PDF（打印另存）</button>
    </div>`;
  $('#modalMask').classList.remove('hidden');
  $('#elWord').onclick = () => {
    const blob = buildElectionDocx(a);
    downloadBlob(blob, `换届申请表_${a.name}_${a.sno}.docx`);
    commit('导出换届申请表', `${a.typeName} · ${a.name}`);
    closeModal();
    toast('已导出 Word 文档');
  };
  $('#elPdf').onclick = () => {
    const w = window.open('', '_blank');
    if (!w) { toast('请允许浏览器弹出窗口后再导出 PDF'); return; }
    w.document.write(electionPrintHtml(a));
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 300);
    commit('导出换届申请表 PDF', `${a.typeName} · ${a.name}`);
  };
}

/* 详情弹窗：补显审批签字与电话（只读）；竞选终审通过后提供导出按钮 */
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

/* ================= 志愿服务认定申请表导出：对齐《志愿服务认定申请表》版式 ================= */

function volStageSign(a, stage) {
  return stage === 0 ? (a.signMinister || '') : (a.signChair || '');
}
function ensureVolNo(a) {
  if (a.volNo) return a.volNo;
  const seq = String(db.applies.filter((x) => x.type === 'volunteer' && x.volNo).length + 1).padStart(3, '0');
  a.volNo = 'ZY' + today().replace(/-/g, '') + seq;
  return a.volNo;
}
function volStageOpinion(a, stage) {
  const s = (a.approveSigns || [])[stage];
  return (s && s.opinion) || '';
}
function volStageDate(a, stage) {
  const s = (a.approveSigns || [])[stage] || {};
  return cnDate(s.time || a.approvedAt || a.date);
}

function buildVolunteerDocx(a) {
  const v = a.values || {};
  const p = personOf(a);
  const media = [];
  const addMedia = (url) => {
    if (!url) return '';
    const rid = 'rId' + (media.length + 1);
    const ext = /png/i.test(url) ? 'png' : 'jpeg';
    media.push({ rid, name: 'word/media/image' + media.length + '.' + ext, bytes: dataUrlBytes(url) });
    return rid;
  };
  const escXml = (s) => esc(s);
  const run = (text, o) => `<w:r><w:rPr><w:rFonts w:hint="eastAsia" w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:eastAsia="仿宋"/>${(o && o.bold) ? '<w:b/>' : ''}<w:sz w:val="${(o && o.size) || 32}"/></w:rPr><w:t xml:space="preserve">${escXml(text)}</w:t></w:r>`;
  const imgRun = (rid, w, h) => `<w:r><w:drawing><wp:inline distT="0" distB="0" distL="0" distR="0"><wp:extent cx="${w}" cy="${h}"/><wp:docPr id="${media.length + 1}" name="img${media.length + 1}"/><wp:cNvGraphicFramePr><a:graphicFrameLocks noChangeAspect="1"/></wp:cNvGraphicFramePr><a:graphic><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:pic><pic:nvPicPr><pic:cNvPr id="0" name="img"/><pic:cNvPicPr/></pic:nvPicPr><pic:blipFill><a:blip r:embed="${rid}"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill><pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="${w}" cy="${h}"/></a:xfrm><a:prstGeom prst="rect"/></pic:spPr></pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r>`;
  const cell = (content, opts) => {
    opts = opts || {};
    const span = opts.span || 1;
    let pr = `<w:tcPr><w:tcW w:w="2230" w:type="dxa"/>`;
    if (span > 1) pr += `<w:gridSpan w:val="${span}"/>`;
    pr += '</w:tcPr>';
    return `<w:tc>${pr}<w:p>${content || ''}</w:p></w:tc>`;
  };
  const row = (inner, height) => `<w:tr>${height ? `<w:trPr><w:trHeight w:val="${height}"/></w:trPr>` : ''}${inner}</w:tr>`;

  const sigR0 = addMedia(volStageSign(a, 0));
  const sigR1 = addMedia(volStageSign(a, 1));
  const sigImg = (rid) => rid ? imgRun(rid, 720000, 360000) : '____________';

  const isImg = (u) => /^data:image\//.test(u || '');
  const proofRid = isImg(v.proofData) ? addMedia(v.proofData) : '';

  const briefLines = String(v.brief || '').split(/\r?\n/).filter((x) => x.trim());
  const briefRuns = briefLines.map((ln, i) => (i ? '<w:r><w:br/></w:r>' : '') + run(ln)).join('') || run('—');
  const proofParts = [];
  if (v.proof) proofParts.push(run('附件：' + v.proof));
  if (proofRid) proofParts.push(imgRun(proofRid, 2600000, 1300000));
  const proofContent = proofParts.join('<w:r><w:br/></w:r>') || run('—');

  const approveCell = (stage) => {
    const opinion = volStageOpinion(a, stage) || '—';
    const rid = stage === 0 ? sigR0 : sigR1;
    const date = volStageDate(a, stage);
    return run('意见：' + opinion)
      + '<w:r><w:br/></w:r>'
      + run('签字：') + sigImg(rid)
      + run('　　日期：' + date);
  };

  const rows = [
    row(`${cell(run('姓名'))}${cell(run(a.name || '—'))}${cell(run('学号'))}${cell(run(a.sno || '—'))}`),
    row(`${cell(run('性别'))}${cell(run(p.gender || '—'))}${cell(run('班级'))}${cell(run(a.class || '—'))}`),
    row(`${cell(run('民族'))}${cell(run(p.ethnicity || '—'))}${cell(run('政治面貌'))}${cell(run(p.politics || '—'))}`),
    row(`${cell(run('联系方式'))}${cell(run(p.phone || '—'), { span: 3 })}`),
    row(`${cell(run('志愿活动名称'))}${cell(run(v.activity || '—'), { span: 3 })}`),
    row(`${cell(run('主办单位'))}${cell(run(v.organizer || '—'), { span: 3 })}`),
    row(`${cell(run('起止时间'))}${cell(run(v.period || '—'), { span: 3 })}`),
    row(`${cell(run('总服务时长'))}${cell(run(v.hours ? v.hours + ' 小时' : '—'), { span: 3 })}`),
    row(`${cell(run('活动简介'))}${cell(briefRuns, { span: 3 })}`, 1497),
    row(`${cell(run('证明材料（证书/签到表/截图）'))}${cell(proofContent, { span: 3 })}`, 2041),
    row(`${cell(run('部长初审'))}${cell(approveCell(0), { span: 3 })}`, 1532),
    row(`${cell(run('主席团复核意见'))}${cell(approveCell(1), { span: 3 })}`, 1373)
  ].join('');

  const borders = ['top', 'left', 'bottom', 'right', 'insideH', 'insideV']
    .map((b) => `<w:${b} w:val="single" w:sz="4" w:space="0" w:color="333333"/>`).join('');

  const noLine = a.volNo ? `<w:p><w:pPr><w:jc w:val="right"/></w:pPr>${run('编号：' + a.volNo, { size: 24 })}</w:p>` : '';

  const docXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">
<w:body>
<w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:rFonts w:hint="eastAsia" w:ascii="宋体" w:hAnsi="宋体" w:eastAsia="宋体"/><w:sz w:val="44"/></w:rPr><w:t>应用经济系学生会志愿服务认定申请表</w:t></w:r></w:p>
${noLine}
<w:tbl><w:tblPr><w:tblW w:w="9072" w:type="dxa"/><w:jc w:val="center"/><w:tblBorders>${borders}</w:tblBorders></w:tblPr>
<w:tblGrid><w:gridCol w:w="2230"/><w:gridCol w:w="2306"/><w:gridCol w:w="1928"/><w:gridCol w:w="2608"/></w:tblGrid>
${rows}
</w:tbl>
</w:body></w:document>`;

  const rels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
${media.map((m) => `<Relationship Id="${m.rid}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="${m.name.replace(/^word\//, '')}"/>`).join('')}
</Relationships>`;

  const ct = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="xml" ContentType="application/xml"/>
<Default Extension="png" ContentType="image/png"/>
<Default Extension="jpeg" ContentType="image/jpeg"/>
<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`;

  const rootRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`;

  const enc = new TextEncoder();
  const files = [
    { name: '[Content_Types].xml', data: enc.encode(ct) },
    { name: '_rels/.rels', data: enc.encode(rootRels) },
    { name: 'word/document.xml', data: enc.encode(docXml) },
    { name: 'word/_rels/document.xml.rels', data: enc.encode(rels) }
  ];
  media.forEach((m) => files.push({ name: m.name, data: m.bytes }));
  return buildZip(files);
}

function volunteerPrintHtml(a) {
  const v = a.values || {};
  const p = personOf(a);
  const sig = (stage) => volStageSign(a, stage) ? `<img src="${volStageSign(a, stage)}" style="height:30px;vertical-align:middle">` : '____________';
  const cell = (t) => `<td>${esc(t || '—')}</td>`;
  const lab = (t) => `<td class="lab">${esc(t)}</td>`;
  const wide = (t) => `<td colspan="3">${t}</td>`;
  const proof = [];
  if (v.proof) proof.push(esc(v.proof));
  if (isImgUrl(v.proofData)) proof.push(`<img src="${v.proofData}" style="max-width:240px">`);
  const approveRow = (label, stage) => `<tr>${lab(label)}${wide('意见：' + esc(volStageOpinion(a, stage) || '—') + '<br>签字：' + sig(stage) + '　　日期：' + volStageDate(a, stage))}</tr>`;
  const rows = [
    `<tr>${lab('姓名')}${cell(a.name)}${lab('学号')}${cell(a.sno)}</tr>`,
    `<tr>${lab('性别')}${cell(p.gender)}${lab('班级')}${cell(a.class)}</tr>`,
    `<tr>${lab('民族')}${cell(p.ethnicity)}${lab('政治面貌')}${cell(p.politics)}</tr>`,
    `<tr>${lab('联系方式')}${wide(esc(p.phone || '—'))}</tr>`,
    `<tr>${lab('志愿活动名称')}${wide(esc(v.activity || '—'))}</tr>`,
    `<tr>${lab('主办单位')}${wide(esc(v.organizer || '—'))}</tr>`,
    `<tr>${lab('起止时间')}${wide(esc(v.period || '—'))}</tr>`,
    `<tr>${lab('总服务时长')}${wide(esc(v.hours ? v.hours + ' 小时' : '—'))}</tr>`,
    `<tr>${lab('活动简介')}${wide(esc(v.brief || '—'))}</tr>`,
    `<tr>${lab('证明材料（证书/签到表/截图）')}${wide(proof.join('<br>') || '—')}</tr>`,
    approveRow('部长初审', 0),
    approveRow('主席团复核意见', 1)
  ].join('');
  const noHtml = a.volNo ? `<p style="text-align:right;margin:0 0 8px">编号：${esc(a.volNo)}</p>` : '';
  return `<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8"><title>志愿服务认定申请表_${esc(a.name)}</title>
  <style>@page{size:A4;margin:2cm}body{font-family:'FangSong','仿宋',serif;padding:16px}h2{text-align:center;font-size:18px}table{border-collapse:collapse;width:100%;font-size:13px}td{border:1px solid #333;padding:6px 8px;vertical-align:middle}td.lab{background:#f2f5fa;font-weight:600;width:120px;text-align:center}img{height:30px;vertical-align:middle}</style></head>
  <body><h2>应用经济系学生会志愿服务认定申请表</h2>
  ${noHtml}
  <table>${rows}</table></body></html>`;
}

function isImgUrl(u) { return /^data:image\//.test(u || ''); }

function volunteerExportPicker(a) {
  if (a.status === '已通过' && !a.volNo) { ensureVolNo(a); save(); }
  const noText = a.volNo ? `编号：${esc(a.volNo)}　｜　` : '';
  $('#modalTitle').textContent = '导出：' + a.typeName;
  $('#modalOk').classList.add('hidden');
  $('#modalCancel').textContent = '关闭';
  modalSubmit = null;
  $('#modalBody').innerHTML = `<p class="form-hint">${noText}选择导出格式，审批签字与证明材料将一并写入文件。</p>
    <div class="export-grid">
      <button class="primary-btn" id="elWord">导出 Word（.docx）</button>
      <button class="primary-btn light" id="elPdf">导出 PDF（打印另存）</button>
    </div>`;
  $('#modalMask').classList.remove('hidden');
  $('#elWord').onclick = () => {
    downloadBlob(buildVolunteerDocx(a), `志愿服务认定申请表_${a.volNo || '编号'}_${a.name}_${a.sno}.docx`);
    commit('导出志愿服务认定申请表', `${a.volNo || '—'} · ${a.typeName} · ${a.name}`);
    closeModal();
    toast('已导出 Word 文档');
  };
  $('#elPdf').onclick = () => {
    const w = window.open('', '_blank');
    if (!w) { toast('请允许浏览器弹出窗口后再导出 PDF'); return; }
    w.document.write(volunteerPrintHtml(a));
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 300);
    commit('导出志愿服务认定申请表 PDF', `${a.typeName} · ${a.name}`);
  };
}

/* 列表行：志愿服务认定申请挂导出按钮 */
function bindVolunteerExport() {
  document.querySelectorAll('[data-apply-view]').forEach((btn) => {
    const a = db.applies.find((x) => x.id === btn.dataset.applyView);
    if (!a || a.type !== 'volunteer') return;
    const holder = btn.closest('.row-actions') || btn.parentElement;
    if (!holder) return;
    if (!holder.querySelector(`[data-vol-export="${a.id}"]`)) {
      const eb = document.createElement('button');
      eb.className = 'link-btn';
      eb.dataset.volExport = a.id;
      eb.textContent = '导出';
      holder.appendChild(eb);
    }
  });
  document.querySelectorAll('[data-vol-export]').forEach((b) => {
    b.onclick = (e) => {
      e.stopPropagation();
      const a = db.applies.find((x) => x.id === b.dataset.volExport);
      if (a) volunteerExportPicker(a);
    };
  });
}
