/* ================= app6：退会申请补丁层（叠加在 app5 之上） ================= */

/* 退会申请：四级签字流程，与换届竞选一致 */
APPLY_TYPES.leaveclub = {
  name: '退会申请',
  hint: '按申请人职务逐级审批：干部由上级审批至主席后报责任教师终审；成员经副部长、部长、副主席、主席审批。全部通过后成员状态标记为已退会，档案转为只读。',
  stages: ['副部长审核', '部长审核', '副主席审核', '主席审核'],
  fields: [
    { key: 'reason', label: '退会原因', type: 'textarea', required: true },
    { key: 'handover', label: '工作交接情况', type: 'textarea', required: true },
    { key: 'applicantSign', type: 'hidden' }
  ]
};

/* 四级岗位严格隔离的申请类型 */
const FOUR_LEVEL_TYPES = ['election', 'leaveclub'];

/* ---------- 退会动态审批链：按申请人职务，从上级逐级审批，干部由责任教师终审 ---------- */
const RESIGN_NODES = {
  '副部长审核': { role: 'minister', title: '副部长' },
  '部长审核': { role: 'minister', title: '部长' },
  '副主席审核': { role: 'presidium', title: '副主席' },
  '主席审核': { role: 'presidium', title: '主席' },
  '责任教师审核': { role: 'teacher', title: '责任教师' }
};

function resignFlow(title) {
  const t = normalizeTitle(title);
  if (t === '副部长') return ['部长审核', '副主席审核', '主席审核', '责任教师审核'];
  if (t === '部长') return ['副主席审核', '主席审核', '责任教师审核'];
  if (t === '副主席') return ['主席审核', '责任教师审核'];
  if (t === '主席') return ['责任教师审核'];
  return ['副部长审核', '部长审核', '副主席审核', '主席审核'];
}

function ensureFlow(a) {
  if (a.type !== 'leaveclub') return;
  if (!Array.isArray(a.flow) || !a.flow.length) a.flow = resignFlow(a.title);
}

/* ---------- 公假证明动态审批链：按申请人职务分流 ---------- */
function plFlow(title) {
  const t = normalizeTitle(title);
  if (t === '副部长') return ['部长审核', '主席审核'];
  if (t === '部长') return ['主席审核'];
  if (t === '副主席') return ['主席审核'];
  if (t === '主席') return ['责任教师审核'];
  return ['部长审核', '主席团审核确认签字'];
}
function ensurePlFlow(a) {
  if (a.type !== 'publicLeave') return;
  if (!Array.isArray(a.flow) || !a.flow.length) a.flow = plFlow(a.title);
}
APPLY_TYPES.publicLeave.hint = '按申请人职务分流：副部长经部长、主席签字；部长、副主席经主席签字；主席由责任教师终审；成员经部长、主席团签字。活动名称、时间、地点全部本人手工填写，不与系统活动模块关联校验；公假证明仅作纸质材料，不自动生成请假记录，请假需另行单独提交请假申请。';

/* 审批人身份称谓（导出表落款用） */
function nodeIdentity(label, dept) {
  switch (label) {
    case '副部长审核': return '副部长';
    case '部长审核': return '部长';
    case '副主席审核': return '副主席';
    case '主席审核': return '主席';
    case '责任教师审核': return '责任教师';
    default: return label;
  }
}

/* 按审批人姓名反查其职务称谓（公假证明导出落款用） */
function actorIdentity(name) {
  if (!name) return '';
  const acc = (db.accounts || []).find((x) => x.name === name);
  const mem = (db.members || []).find((x) => x.name === name);
  const rec = acc || mem || {};
  if (rec.role === 'teacher') return '责任教师';
  const t = normalizeTitle(rec.title || '');
  const dept = rec.dept || '';
  if (t === '部长') return `是我系学生会 ${dept} 部长`;
  if (t === '副部长') return `是我系学生会 ${dept} 副部长`;
  if (t === '副主席') return '是我系学生会副主席';
  if (t === '主席') return '是我系学生会主席';
  return rec.title || ROLE_NAMES[rec.role] || name;
}

/* 是否为当前用户本人提交的申请（本人不可审批本人） */
function isSelf(a) {
  if (!cur || !a) return false;
  if (a.sno && cur.sno) return String(a.sno) === String(cur.sno);
  return a.name === cur.name && (!a.dept || !cur.dept || a.dept === cur.dept);
}

/* ---------- 1) 审批权限：按动态节点岗位严格限定，不可跨级代审 ---------- */
const _canApprove6 = canApprove;
canApprove = function (a) {
  if (isSelf(a)) return false;
  if (cur.role === 'admin') return true;
  if (a.type === 'leaveclub') {
    ensureFlow(a);
    const node = RESIGN_NODES[a.flow[a.stage]];
    if (!node) return false;
    if (node.role === 'teacher') return cur.role === 'teacher';
    if (node.role === 'minister') return cur.role === 'minister' && cur.title === node.title && cur.dept === a.dept;
    if (node.role === 'presidium') return cur.title === node.title;
    return false;
  }
  if (a.type === 'election') {
    const t = cur.title || '';
    if (a.stage === 0) return t === '副部长';
    if (a.stage === 1) return t === '部长';
    if (a.stage === 2) return t === '副主席';
    if (a.stage === 3) return t === '主席';
    return false;
  }
  if (a.type === 'publicLeave') {
    ensurePlFlow(a);
    const node = RESIGN_NODES[a.flow[a.stage]];
    if (node) {
      if (node.role === 'teacher') return cur.role === 'teacher';
      if (node.role === 'minister') return cur.role === 'minister' && cur.title === node.title && cur.dept === a.dept;
      if (node.role === 'presidium') return cur.title === node.title;
      return false;
    }
    if (cur.role === 'minister') return a.stage === 0;
    if (cur.role === 'presidium') return a.stage === 1;
    return false;
  }
  return _canApprove6(a);
};

/* ---------- 1b) 工作台待办计数：只统计当前岗位真正可审批的申请，与待我审批列表口径一致 ---------- */
const PENDING_STATUS6 = ['待审核', '审核中', '待分派', '处理中'];
function myReviewApplies() {
  return (db.applies || []).filter((x) => {
    if (!PENDING_STATUS6.includes(x.status)) return false;
    if (isSelf(x)) return false;
    if (cur.role === 'admin') return true;
    if (cur.role === 'minister' && x.dept !== cur.dept) return false;
    return canApprove(x);
  });
}
const _pendingTasks6 = pendingTasks;
pendingTasks = function () {
  const t = _pendingTasks6();
  const idx = t.findIndex((x) => x[0] === '申请待审批');
  if (idx >= 0) {
    const n = myReviewApplies().length;
    if (n) t[idx][1] = n;
    else t.splice(idx, 1);
  }
  return t;
};

/* ---------- 2) 退会专用审批弹窗：按动态节点流转，签字入 approveSigns ---------- */
function openResignApproveForm(a) {
  ensureFlow(a);
  const label = a.flow[a.stage] || '审核';
  let signFile = '';
  let canvasDirty = false;
  const body = openForm({
    title: label + ' · ' + a.name,
    hint: '请在下方手写签字（或上传签字图片），可填写审批意见，确认后通过审批。',
    fields: [{ key: 'opinion', label: '审批意见', type: 'textarea' }],
    extra: `<div class="field"><label>手写签字（可直接在线书写，或点“选择文件”上传签字图片）</label>
      <canvas id="apCanvas" width="320" height="120" style="border:1px solid #d9e2ec;border-radius:8px;background:#fff;touch-action:none"></canvas>
      <div class="row-actions" style="margin-top:8px">
        <button type="button" class="link-btn" id="apClear">清除重写</button>
        <input type="file" id="apSign" accept="image/png,image/jpeg,image/jpg" class="file-input">
      </div></div>`,
    onSubmit(d) {
      const signData = signFile || (canvasDirty ? body.querySelector('#apCanvas').toDataURL('image/png') : '');
      if (!signData) { toast('请先手写签字或上传签字图片'); return; }
      const signs = (a.approveSigns = a.approveSigns || []);
      signs.push({ sign: signData, phone: '', opinion: d.opinion || '', actor: cur.name, role: ROLE_NAMES[cur.role], action: label, time: today() });
      const last = a.stage >= a.flow.length - 1;
      const note = d.opinion ? '意见：' + d.opinion : '';
      a.track.push({ actor: cur.name, role: ROLE_NAMES[cur.role], action: label + '通过', note, time: today() });
      if (last) { a.status = '已通过'; applyApproved(a); }
      else { a.stage += 1; a.status = '审核中'; }
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
  cv.addEventListener('pointermove', (e) => { if (!drawing) return; const p = pos(e); ctx.lineTo(p.x, p.y); ctx.stroke(); });
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

/* ---------- 2b) 公假证明审批弹窗：按动态 flow 节点流转 ---------- */
const _openApproveForm6 = openApproveForm;
openApproveForm = function (a) {
  if (a.type !== 'publicLeave') return _openApproveForm6(a);
  ensurePlFlow(a);
  const cfg = APPLY_TYPES[a.type];
  const flow = a.flow || cfg.stages;
  const stageLabel = flow[a.stage] || cfg.stages[a.stage] || '';
  let signFile = '';
  let canvasDirty = false;
  const body = openForm({
    title: stageLabel + ' · ' + a.name,
    hint: '请在下方手写签字（或上传签字图片），填写联系电话与审批意见，确认后通过审批。',
    fields: [
      { key: 'phone', label: '联系电话', required: true },
      { key: 'opinion', label: '审批意见', type: 'textarea' }
    ],
    extra: `<div class="field"><label>手写签字（可直接在线书写，或点“选择文件”上传签字图片）</label>
      <canvas id="apCanvas" width="320" height="120" style="border:1px solid #d9e2ec;border-radius:8px;background:#fff;touch-action:none"></canvas>
      <div class="row-actions" style="margin-top:8px">
        <button type="button" class="link-btn" id="apClear">清除重写</button>
        <input type="file" id="apSign" accept="image/png,image/jpeg,image/jpg" class="file-input">
      </div></div>`,
    onSubmit(d) {
      const signData = signFile || (canvasDirty ? body.querySelector('#apCanvas').toDataURL('image/png') : '');
      if (!signData) { toast('请先手写签字或上传签字图片'); return; }
      if (!d.phone) { toast('请填写联系电话'); return; }
      const signs = (a.approveSigns = a.approveSigns || []);
      signs.push({ sign: signData, phone: d.phone, opinion: d.opinion || '', actor: cur.name, role: ROLE_NAMES[cur.role], action: stageLabel, time: today() });
      if (a.stage === 0) { a.signMinister = signData; a.phoneMinister = d.phone; }
      else { a.signChair = signData; a.phoneChair = d.phone; }
      const last = a.stage >= flow.length - 1;
      const trackNote = '电话：' + d.phone + (d.opinion ? '；意见：' + d.opinion : '');
      a.track.push({ actor: cur.name, role: ROLE_NAMES[cur.role], action: stageLabel + '通过', note: trackNote, time: today() });
      if (last) { a.status = '已通过'; applyApproved(a); }
      else { a.stage += 1; a.status = '审核中'; }
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
  cv.addEventListener('pointermove', (e) => { if (!drawing) return; const p = pos(e); ctx.lineTo(p.x, p.y); ctx.stroke(); });
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
};

/* ---------- 3) 申请表单：手写签名板 + 上传签字照片 ---------- */
const _openForm6 = openForm;
openForm = function (opts) {
  const body = _openForm6(opts);
  if (!opts || opts.title !== '退会申请') return body;

  const signField = document.createElement('div');
  signField.className = 'field';
  signField.innerHTML = `
    <label>申请人签字（直接在下方框内手写）</label>
    <div id="lcPadBox" style="position:relative;height:150px;border:1px dashed #9db4d0;border-radius:8px;background:#fff;touch-action:none;overflow:hidden">
      <canvas id="lcPad" style="display:block;width:100%;height:100%"></canvas>
      <span id="lcPadPh" style="position:absolute;left:0;right:0;top:64px;text-align:center;color:#9aa9bb;font-size:13px;pointer-events:none">在此处手写签名</span>
    </div>
    <div class="row-actions" style="margin:8px 0 14px">
      <button type="button" class="ghost-btn" id="lcClear">清空重写</button>
    </div>
    <label>或上传已签好的签字照片</label>
    <input type="file" id="lcSign" accept="image/png,image/jpeg,image/jpg" class="file-input">`;
  body.appendChild(signField);

  const pad = signField.querySelector('#lcPad');
  const box = signField.querySelector('#lcPadBox');
  const ph = signField.querySelector('#lcPadPh');
  const hidden = () => body.querySelector('#f_applicantSign');
  const dpr = window.devicePixelRatio || 1;
  let ctx = null;
  let drawing = false;

  const size = () => {
    const w = box.clientWidth || 300;
    const h = box.clientHeight || 150;
    return { w, h };
  };
  (function init() {
    const { w, h } = size();
    pad.width = Math.round(w * dpr);
    pad.height = Math.round(h * dpr);
    ctx = pad.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.strokeStyle = '#111';
    ctx.lineWidth = 2.6;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  })();

  const point = (e) => {
    const r = pad.getBoundingClientRect();
    const t = (e.touches && e.touches[0]) || (e.changedTouches && e.changedTouches[0]) || e;
    return { x: t.clientX - r.left, y: t.clientY - r.top };
  };
  const begin = (e) => {
    e.preventDefault();
    drawing = true;
    ph.style.display = 'none';
    const p = point(e);
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
  };
  const move = (e) => {
    if (!drawing) return;
    e.preventDefault();
    const p = point(e);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
  };
  const end = (e) => {
    if (!drawing) return;
    if (e && e.preventDefault) e.preventDefault();
    drawing = false;
    ctx.closePath();
    const h = hidden();
    if (h) h.value = pad.toDataURL('image/png');
  };

  pad.addEventListener('touchstart', begin, { passive: false });
  pad.addEventListener('touchmove', move, { passive: false });
  pad.addEventListener('touchend', end, { passive: false });
  pad.addEventListener('touchcancel', end, { passive: false });
  pad.addEventListener('mousedown', begin);
  pad.addEventListener('mousemove', move);
  pad.addEventListener('mouseup', end);
  pad.addEventListener('mouseleave', end);

  signField.querySelector('#lcClear').onclick = () => {
    const { w, h } = size();
    ctx.clearRect(0, 0, w, h);
    ph.style.display = 'block';
    const hid = hidden();
    if (hid) hid.value = '';
  };

  signField.querySelector('#lcSign').onchange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    if (f.size > 512 * 1024) { toast('签字图片请控制在 512KB 以内'); return; }
    const rd = new FileReader();
    rd.onload = () => {
      const h = hidden();
      if (h) h.value = rd.result;
      ph.style.display = 'none';
      const { w, h: hh } = size();
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, w, hh);
        const sc = Math.min(w / img.width, hh / img.height);
        const dw = img.width * sc;
        const dh = img.height * sc;
        ctx.drawImage(img, (w - dw) / 2, (hh - dh) / 2, dw, dh);
      };
      img.src = rd.result;
    };
    rd.readAsDataURL(f);
  };

  const origSubmit = modalSubmit;
  modalSubmit = function () {
    const h = hidden();
    if (!h || !h.value) { toast('请先手写签名或上传签字照片'); return; }
    origSubmit();
  };
  return body;
};

/* ---------- 3) 详情视图：退会信息回显（导出入口常显） ---------- */
/* 公假证明：已终审记录在详情弹窗补回 下载 / 导出存档 / 作废 入口（基线 app5 详情漏掉） */
function attachPlArchiveButtons(a) {
  const approved = a.status === '已通过' && !!a.proofNo;
  if (!approved) return;
  const isOwner = a.name === cur.name;
  const canArchive = allPower() || ['presidium', 'minister', 'teacher'].includes(cur.role);
  let html = '';
  if (isOwner) html += `<button class="primary-btn" id="plDownload">下载证明</button>`;
  if (canArchive) html += `<button class="primary-btn light" id="plArchive">导出证明存档</button>`;
  if (isOwner || cur.role === 'admin') html += `<button class="link-btn del" id="plVoid">作废申请</button>`;
  if (!html) return;
  const body = document.getElementById('modalBody');
  if (!body) return;
  const bar = document.createElement('div');
  bar.className = 'row-actions';
  bar.style.marginTop = '12px';
  bar.innerHTML = html;
  body.appendChild(bar);
  const dl = document.getElementById('plDownload'), ar = document.getElementById('plArchive'), vd = document.getElementById('plVoid');
  if (dl) dl.onclick = () => plFormatPicker(a, false);
  if (ar) ar.onclick = () => plFormatPicker(a, true);
  if (vd) vd.onclick = () => {
    if (!confirm('作废后该证明不可再下载，记录保留归档；信息有误需重新提交新申请。确定作废这条申请？')) return;
    a.status = '已作废'; a.locked = true;
    a.track.push({ actor: cur.name, role: ROLE_NAMES[cur.role], action: '作废申请', note: '证明作废，归档保留', time: today() });
    commit('作废公假证明', `${a.proofNo} · ${a.name}`); save(); closeModal(); render(); toast('申请已作废，记录归档');
  };
}
const _openApplyInfo6 = openApplyInfo;
openApplyInfo = function (a) {
  if (a.type !== 'leaveclub') {
    _openApplyInfo6(a);
    if (a.type === 'publicLeave') attachPlArchiveButtons(a);
    return;
  }
  const v = a.values || {};
  const p = personOf(a);
  const auto = [
    ['姓名', a.name], ['学号', a.sno], ['性别', p.gender || '—'], ['班级', a.class],
    ['民族', p.ethnicity || '—'], ['政治面貌', p.politics || '—'], ['联系方式', p.phone || '—'],
    ['所在部门', a.dept || p.dept || '—'], ['现任职务', a.title || p.title || '—'], ['入会时间', p.joined || '—']
  ];
  let rows = auto.map(([l, val]) => `<div><span>${esc(l)}</span><strong>${esc(val)}</strong></div>`).join('');
  rows += `<div><span>退会原因</span><strong>${esc(v.reason || '—')}</strong></div>`;
  rows += `<div><span>工作交接情况</span><strong>${esc(v.handover || '—')}</strong></div>`;
  if (v.applicantSign) rows += `<div><span>申请人签字</span><img src="${v.applicantSign}" style="height:48px;border:1px solid #d9e2ec;border-radius:6px;background:#fff"></div>`;
  const trackHtml = (a.track || []).map((t) =>
    `<div class="perm-item"><span class="dot"></span><div>${esc(t.actor)} · ${esc(t.action)}${t.note ? '（' + esc(t.note) + '）' : ''} · ${esc(t.time)}</div></div>`).join('')
    || '<div class="perm-item"><span class="dot"></span>暂无轨迹</div>';
  const extra = `<div class="row-actions" style="margin-top:12px"><button class="primary-btn light" id="elExportBtn">导出申请表（Word / PDF）</button></div>`;
  openInfo(a.typeName + ' · ' + a.name,
    `<div class="info-list">${rows}</div>${extra}<div class="form-hint" style="margin-top:10px">审批流转（可视化）</div>${flowTimelineHtml(a)}<div class="form-hint" style="margin-top:10px">操作记录</div><div class="perm-list">${trackHtml}</div>`,
    '提交时间：' + a.date);
  const btn = document.getElementById('elExportBtn');
  if (btn) btn.onclick = () => electionExportPicker(a);
};

/* ---------- 4) 导出选择器：退会 / 竞选分流 ---------- */
const _picker6 = electionExportPicker;
electionExportPicker = function (a) {
  if (a.type !== 'leaveclub') return _picker6(a);
  $('#modalTitle').textContent = '导出：' + a.typeName;
  $('#modalOk').classList.add('hidden');
  $('#modalCancel').textContent = '关闭';
  modalSubmit = null;
  $('#modalBody').innerHTML = `<p class="form-hint">选择导出格式，申请人签字与各节点审批签字将一并写入文件。</p>
    <div class="export-grid">
      <button class="primary-btn" id="elWord">导出 Word（.docx）</button>
      <button class="primary-btn light" id="elPdf">导出 PDF（打印 / 另存）</button>
    </div>`;
  $('#modalMask').classList.remove('hidden');
  $('#elWord').onclick = () => {
    downloadBlob(buildResignDocx(a), `退会申请表_${a.name}_${a.sno}.docx`);
    commit('导出退会申请表', `${a.typeName} · ${a.name}`);
    closeModal();
    toast('已导出 Word 文档');
  };
  $('#elPdf').onclick = () => {
    closeModal();
    printResign(a);
    commit('导出退会申请表 PDF', `${a.typeName} · ${a.name}`);
  };
};

/* ---------- 5) 待办/我的申请：补齐退会行并挂导出 ---------- */
function resignRow(a) {
  const track = (a.track || []).map((t) => `${esc(t.action)}·${esc(t.actor)}`).join('；');
  const ops = [`<button class="link-btn" data-apply-view="${a.id}">查看</button>`];
  if (canApprove(a)) {
    ops.push(`<button class="link-btn" data-apply-pass="${a.id}">通过</button>`);
    ops.push(`<button class="link-btn del" data-apply-reject="${a.id}">驳回</button>`);
  }
  ops.push(`<button class="link-btn" data-resign-export="${a.id}">导出</button>`);
  return `<tr><td><strong>${esc(a.name)}</strong><div class="cell-sub">${esc(a.sno)}</div></td><td><span class="badge blue">${esc(a.typeName)}</span></td><td>${esc(a.dept)}</td><td class="nowrap">${esc(a.date)}</td><td>${badge(a.status)}</td><td><span class="cell-sub">${track}</span></td><td><div class="row-actions">${ops.join('')}</div></td></tr>`;
}

function bindResignExport() {
  // 统一处理：所有列表（我的申请 / 待我审批 / 存档）里的退会记录，都挂上查看与导出
  document.querySelectorAll('[data-apply-view]').forEach((btn) => {
    const a = (db.applies || []).find((x) => x.id === btn.dataset.applyView);
    if (!a || a.type !== 'leaveclub') return;
    btn.onclick = (e) => {
      if (e) e.stopPropagation();
      openApplyInfo(a);
    };
    const holder = btn.closest('.row-actions') || btn.parentElement;
    if (!holder) return;
    if (!holder.querySelector(`[data-resign-export="${a.id}"]`)) {
      const eb = document.createElement('button');
      eb.className = 'link-btn';
      eb.dataset.resignExport = a.id;
      eb.textContent = '导出';
      holder.appendChild(eb);
    }
  });
  document.querySelectorAll('[data-resign-export]').forEach((b) => {
    b.onclick = (e) => {
      if (e) e.stopPropagation();
      const a = (db.applies || []).find((x) => x.id === b.dataset.resignExport);
      if (a) electionExportPicker(a);
    };
  });
}

const _render6 = render;

/* 四级岗位 ↔ 审批节点顺序：副部长 → 部长 → 副主席 → 主席（竞选沿用） */
const STAGE_TITLE6 = ['副部长', '部长', '副主席', '主席'];

/* 当前用户是否可见这条待办：统一按当前节点审批权限判定，本人不可见 */
function resignTodoVisible(a) {
  if (isSelf(a)) return false;
  if (cur.role === 'admin') return true;
  return canApprove(a);
}

/* 重绑审批的通过 / 驳回按钮：岗位不符的直接移除，避免跨级操作 */
function bindResignActions() {
  document.querySelectorAll('[data-apply-pass]').forEach((btn) => {
    const a = (db.applies || []).find((x) => x.id === btn.dataset.applyPass);
    if (!a) return;
    if (!canApprove(a)) { btn.remove(); return; }
    btn.onclick = () => (a.type === 'leaveclub' ? openResignApproveForm(a) : openApproveForm(a));
  });
  document.querySelectorAll('[data-apply-reject]').forEach((btn) => {
    const a = (db.applies || []).find((x) => x.id === btn.dataset.applyReject);
    if (!a) return;
    if (!canApprove(a)) { btn.remove(); return; }
    btn.onclick = () => {
      openForm({
        title: '驳回申请 · ' + a.name,
        fields: [{ key: 'note', label: '驳回原因', type: 'textarea', required: true }],
        onSubmit(d) {
          a.status = '已驳回';
          a.track.push({ actor: cur.name, role: ROLE_NAMES[cur.role], action: '驳回', note: d.note, time: today() });
          commit('驳回申请', `${a.typeName} · ${a.name}：${d.note}`);
          save(); render(); toast('已驳回申请');
        }
      });
    };
  });
}

/* 待我审批列表：移除当前岗位无权处理的行，并把副标题计数改成剩余条数 */
function filterResignTodo() {
  document.querySelectorAll('.card').forEach((card) => {
    const h2 = card.querySelector('h2');
    if (!h2 || !h2.textContent.includes('待我审批')) return;
    const tbody = card.querySelector('tbody');
    if (!tbody) return;
    let kept = 0;
    tbody.querySelectorAll('tr').forEach((tr) => {
      const btn = tr.querySelector('[data-apply-view],[data-apply-pass],[data-apply-reject]');
      const a = btn && db.applies.find((x) => x.id === (btn.dataset.applyView || btn.dataset.applyPass || btn.dataset.applyReject));
      if (!a) return;
      if (!resignTodoVisible(a)) { tr.remove(); return; }
      kept += 1;
    });
    const sub = card.querySelector('.sub');
    if (sub) sub.textContent = `共 ${kept} 条待处理申请`;
  });
}

render = function () {
  _render6();
  if (['minister', 'presidium', 'teacher'].includes(cur.role)) {
    document.querySelectorAll('.card').forEach((card) => {
      const h2 = card.querySelector('h2');
      if (!h2 || !h2.textContent.includes('待我审批')) return;
      const tbody = card.querySelector('tbody');
      if (!tbody) return;
      db.applies.forEach((a) => {
        if (!PENDING_STATUS6.includes(a.status)) return;
        if (tbody.querySelector(`[data-apply-view="${a.id}"]`)) return;
        if (!canApprove(a)) return;
        const rowHtml = a.type === 'leaveclub' ? resignRow(a) : applyRow(a, true);
        tbody.insertAdjacentHTML('beforeend', rowHtml);
      });
    });
  }
  rebindApprovePass();
  rebindApplyView();
  bindResignExport();
  bindResignActions();
  filterResignTodo();
};

/* ---------- 6) 退会申请表 Word（.docx）生成 ---------- */
function buildResignDocx(a) {
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
    let pr = `<w:tcPr><w:tcW w:w="2259" w:type="dxa"/>`;
    if (span > 1) pr += `<w:gridSpan w:val="${span}"/>`;
    pr += '</w:tcPr>';
    return `<w:tc>${pr}<w:p>${content || ''}</w:p></w:tc>`;
  };

  ensureFlow(a);
  const flow = a.flow;
  const deptName = a.dept || p.dept || '';
  const appRid = addMedia(v.applicantSign);
  const signRid = {};
  flow.forEach((s) => { signRid[s] = addMedia(signOf(a, s)); });
  const sigImg = (s) => signRid[s] ? imgRun(signRid[s], 720000, 360000) : '____________';
  const appSig = appRid ? imgRun(appRid, 720000, 360000) : '____________';
  const op = (arr) => arr.map((x) => opinionOf(a, x)).filter(Boolean).join('；') || '—';
  const dateStr = cnDate(a.approvedAt || a.date);

  const groupLine = (labels) => {
    if (!labels.length) return '';
    let html = run(`意见：${op(labels)}`);
    labels.forEach((s) => {
      html += '<w:r><w:br/></w:r>' + run(nodeIdentity(s, deptName) + '签字：') + sigImg(s);
    });
    html += '<w:r><w:br/></w:r>' + run(`日期：${dateStr}`);
    return html;
  };
  const deptNodes = flow.filter((s) => RESIGN_NODES[s] && RESIGN_NODES[s].role === 'minister');
  const presNodes = flow.filter((s) => RESIGN_NODES[s] && RESIGN_NODES[s].role === 'presidium');
  const teacherNodes = flow.filter((s) => RESIGN_NODES[s] && RESIGN_NODES[s].role === 'teacher');

  const statement = '本人自愿申请退出应用经济系学生会。退出后不再以系学生会成员身份参与工作，已交回学生会配发物资、在办事项及相关工作资料，无遗留纠纷。';
  const cStatement = run(statement) + '<w:r><w:br/></w:r>' + run('申请人（签字）：') + appSig + run(`　　日期：${dateStr}`);

  const rows = [
    `<w:tr>${cell(run('姓    名', { bold: true }))}${cell(run(a.name))}${cell(run('性    别', { bold: true }))}${cell(run(p.gender || '—'))}</w:tr>`,
    `<w:tr>${cell(run('学    号', { bold: true }))}${cell(run(a.sno))}${cell(run('联系方式', { bold: true }))}${cell(run(p.phone || '—'))}</w:tr>`,
    `<w:tr>${cell(run('班    级', { bold: true }))}${cell(run(a.class))}${cell(run('民  族', { bold: true }))}${cell(run(p.ethnicity || '—'))}</w:tr>`,
    `<w:tr>${cell(run('政治面貌', { bold: true }))}${cell(run(p.politics || '—'))}${cell(run('所在部门', { bold: true }))}${cell(run(a.dept || p.dept || '—'))}</w:tr>`,
    `<w:tr>${cell(run('现任职务', { bold: true }))}${cell(run(a.title || p.title || '—'))}${cell(run('入会时间', { bold: true }))}${cell(run(p.joined || '—'))}</w:tr>`,
    `<w:tr>${cell(run('退会原因', { bold: true }))}${cell(run(v.reason || '—'), { span: 3 })}</w:tr>`,
    `<w:tr>${cell(run('工作交接情况', { bold: true }))}${cell(run(v.handover || '—'), { span: 3 })}</w:tr>`,
    `<w:tr>${cell(run('本人声明', { bold: true }))}${cell(cStatement, { span: 3 })}</w:tr>`
  ];
  if (deptNodes.length) rows.push(`<w:tr>${cell(run('部门意见', { bold: true }))}${cell(groupLine(deptNodes), { span: 3 })}</w:tr>`);
  if (presNodes.length) rows.push(`<w:tr>${cell(run('主席团意见', { bold: true }))}${cell(groupLine(presNodes), { span: 3 })}</w:tr>`);
  if (teacherNodes.length) rows.push(`<w:tr>${cell(run('责任教师意见', { bold: true }))}${cell(groupLine(teacherNodes), { span: 3 })}</w:tr>`);
  const rowsXml = rows.join('');

  const borders = ['top', 'left', 'bottom', 'right', 'insideH', 'insideV']
    .map((b) => `<w:${b} w:val="single" w:sz="4" w:space="0" w:color="333333"/>`).join('');

  const docXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">
<w:body>
<w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:b/><w:sz w:val="32"/></w:rPr><w:t>应用经济系学生会退会申请表</w:t></w:r></w:p>
<w:tbl><w:tblPr><w:tblW w:w="9036" w:type="dxa"/><w:tblBorders>${borders}</w:tblBorders></w:tblPr>
<w:tblGrid><w:gridCol w:w="2259"/><w:gridCol w:w="2259"/><w:gridCol w:w="2259"/><w:gridCol w:w="2259"/></w:tblGrid>
${rowsXml}
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

/* ---------- 7) 退会申请表 PDF：页内排版 + 系统打印 ---------- */
function resignPrintBody(a) {
  const v = a.values || {};
  const p = personOf(a);
  ensureFlow(a);
  const flow = a.flow;
  const deptName = a.dept || p.dept || '';
  const sig = (s) => signOf(a, s) ? `<img src="${signOf(a, s)}" style="height:30px;vertical-align:middle">` : '____________';
  const appSig = v.applicantSign ? `<img src="${v.applicantSign}" style="height:30px;vertical-align:middle">` : '____________';
  const op = (arr) => arr.map((x) => opinionOf(a, x)).filter(Boolean).join('；') || '—';
  const cell = (t) => `<td>${esc(t || '—')}</td>`;
  const lab = (t) => `<td class="lab">${esc(t)}</td>`;
  const wide = (t) => `<td colspan="3">${t}</td>`;
  const dateStr = cnDate(a.approvedAt || a.date);
  const statement = '本人自愿申请退出应用经济系学生会。退出后不再以系学生会成员身份参与工作，已交回学生会配发物资、在办事项及相关工作资料，无遗留纠纷。';
  const groupRow = (label, labels) => {
    if (!labels.length) return '';
    const lines = labels.map((s) => `${nodeIdentity(s, deptName)}签字：${sig(s)}`).join('　　');
    return `<tr>${lab(label)}${wide(`意见：${op(labels)}<br>${lines}<br>日期：${dateStr}`)}</tr>`;
  };
  const deptNodes = flow.filter((s) => RESIGN_NODES[s] && RESIGN_NODES[s].role === 'minister');
  const presNodes = flow.filter((s) => RESIGN_NODES[s] && RESIGN_NODES[s].role === 'presidium');
  const teacherNodes = flow.filter((s) => RESIGN_NODES[s] && RESIGN_NODES[s].role === 'teacher');
  const rows = [
    `<tr>${lab('姓名')}${cell(a.name)}${lab('性别')}${cell(p.gender)}</tr>`,
    `<tr>${lab('学号')}${cell(a.sno)}${lab('联系方式')}${cell(p.phone)}</tr>`,
    `<tr>${lab('班级')}${cell(a.class)}${lab('民族')}${cell(p.ethnicity)}</tr>`,
    `<tr>${lab('政治面貌')}${cell(p.politics)}${lab('所在部门')}${cell(a.dept || p.dept)}</tr>`,
    `<tr>${lab('现任职务')}${cell(a.title || p.title)}${lab('入会时间')}${cell(p.joined)}</tr>`,
    `<tr>${lab('退会原因')}${wide(esc(v.reason || '—'))}</tr>`,
    `<tr>${lab('工作交接情况')}${wide(esc(v.handover || '—'))}</tr>`,
    `<tr>${lab('本人声明')}${wide(`${esc(statement)}<br>申请人（签字）：${appSig}　　日期：${dateStr}`)}</tr>`,
    groupRow('部门意见', deptNodes),
    groupRow('主席团意见', presNodes),
    groupRow('责任教师意见', teacherNodes)
  ].filter(Boolean).join('');
  return `<h2>应用经济系学生会退会申请表</h2>
  <table>${rows}</table>`;
}

function resignPrintHtml(a) {
  return `<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8"><title>退会申请表_${esc(a.name)}</title>
  <style>@page{size:A4;margin:2cm}body{font-family:'FangSong','仿宋',serif;padding:16px}h2{text-align:center;font-size:18px}table{border-collapse:collapse;width:100%;font-size:13px}td{border:1px solid #333;padding:6px 8px;vertical-align:middle}td.lab{background:#f2f5fa;font-weight:600;width:88px;text-align:center}img{height:30px;vertical-align:middle}</style></head>
  <body>${resignPrintBody(a)}</body></html>`;
}

function ensureResignPrintCss() {
  if (document.getElementById('resignPrintCss')) return;
  const st = document.createElement('style');
  st.id = 'resignPrintCss';
  st.textContent = `
  #resignPrintWrap{position:fixed;left:0;top:0;right:0;bottom:0;z-index:99999;background:#fff;overflow:auto;padding:16px 14px;font-family:'FangSong','STFangsong','仿宋',serif;-webkit-overflow-scrolling:touch}
  #resignPrintWrap h2{text-align:center;font-size:18px;margin:4px 0 14px;color:#1c2b3a}
  #resignPrintWrap table{border-collapse:collapse;width:100%;font-size:13px}
  #resignPrintWrap td{border:1px solid #333;padding:6px 8px;vertical-align:middle}
  #resignPrintWrap td.lab{background:#f2f5fa;font-weight:600;width:88px;text-align:center}
  #resignPrintWrap img{height:30px;vertical-align:middle}
  #resignPrintBar{display:flex;justify-content:space-between;align-items:center;font-size:12px;color:#607089;margin-bottom:10px;gap:8px}
  #resignPrintBar button{border:1px solid #cfdae7;background:#f5f8fc;color:#1657a6;border-radius:6px;padding:4px 10px;font-size:12px}
  @page{size:A4;margin:2cm}
  @media print{
    body>*:not(#resignPrintWrap){display:none!important}
    #resignPrintWrap{position:static!important;padding:0!important;overflow:visible!important;height:auto!important}
    #resignPrintBar{display:none!important}
  }`;
  document.head.appendChild(st);
}

function printResign(a) {
  ensureResignPrintCss();
  const wrap = document.createElement('div');
  wrap.id = 'resignPrintWrap';
  wrap.innerHTML = `<div id="resignPrintBar"><span>申请表预览 · 导出的 PDF 与下方版式一致</span><button id="resignPrintClose">关闭预览</button></div>` + resignPrintBody(a);
  document.body.appendChild(wrap);
  wrap.querySelector('#resignPrintClose').onclick = () => wrap.remove();

  const bridge = window.AndroidPrint;
  if (bridge && typeof bridge.printPage === 'function') {
    setTimeout(() => {
      try { bridge.printPage('退会申请表_' + a.name); }
      catch (err) { toast('调起打印失败，可截图保存预览'); }
    }, 200);
    toast('已调起系统打印，请选择「另存为 PDF」');
    return;
  }
  setTimeout(() => {
    window.print();
    setTimeout(() => wrap.remove(), 1200);
  }, 150);
}

/* ---------- 8) 公假证明导出：落款按审批人岗位称谓签字 ---------- */
plProofHtml = function (a) {
  const v = a.values || {};
  const map = {
    '{姓名}': a.name, '{学号}': a.sno || '—', '{专业}': a.major || '—', '{班级}': a.class || '—',
    '{所属部门}': a.dept || '—', '{职务}': a.title || '成员', '{活动名称}': v.activityName || '—', '{活动起止时间}': v.period || '—',
    '{活动地点}': v.place || '—', '{请假课程及日期}': v.courses || '—', '{申请说明}': v.explanation || '',
    '{联系电话}': v.phone || '—', '{申请份数与用途}': v.copiesPurpose || '—',
    '{证明编号}': a.proofNo || '—', '{出具日期}': cnDate(a.approvedAt)
  };
  let body = plTemplate().body;
  Object.keys(map).forEach((k) => { body = body.split(k).join(String(map[k] == null ? '—' : map[k])); });
  const lines = esc(body).split('\n');
  const paras = lines.map((ln) => `<p style="margin:0 0 12px;text-indent:2em">${ln}</p>`).join('');
  const signs = a.approveSigns || [];
  const minister = signs.find((s) => /部长审核/.test(s.action || '')) || signs[0];
  const chair = signs.find((s) => !/部长审核/.test(s.action || '')) || signs[signs.length - 1];
  const signPair = (s) => {
    const img = s && s.sign ? `<img src="${s.sign}" style="height:30px;vertical-align:middle">` : '____________';
    const ph = s && s.phone ? esc(s.phone) : '____________';
    return `${img}　　联系电话：${ph}`;
  };
  return `<div style="font-family:'FangSong','方正仿宋_GBK','仿宋',serif;font-size:16pt;line-height:28pt;max-width:760px;margin:0 auto;padding:32px 24px">
    <h2 style="text-align:center;font-size:18pt;font-weight:bold;margin:0 0 28px;line-height:28pt">${esc(plTemplate().title || '证明')}</h2>
    ${paras}
    <div style="margin-top:36px">
      <p style="margin:0 0 16px">部长签字：${signPair(minister)}</p>
      <p style="margin:0 0 16px">负责人签字：${signPair(chair)}</p>
      <p style="margin:0 0 16px;text-align:right">日期：${esc(map['{出具日期}'])}</p>
      <p style="margin:0 0 16px">证明编号：${esc(a.proofNo || '—')}</p>
    </div>
  </div>`;
};
