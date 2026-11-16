/* ---------------- 我的申请中心 ---------------- */
const APPLY_TYPES = {
  adjust: {
    name: '部门调整申请',
    hint: '在岗成员常规调整所属部门或岗位。流程：原部门负责人 → 目标部门负责人 → 主席团。',
    stages: ['原部门负责人', '目标部门负责人', '主席团'],
    fields: [
      { key: 'toDept', label: '意向调入部门', type: 'select', options: DEPTS },
      { key: 'toTitle', label: '意向岗位', type: 'select', options: TITLES },
      { key: 'reason', label: '调整理由', type: 'textarea', required: true },
      { key: 'handover', label: '原部门待办工作安排', type: 'textarea' },
      { key: 'agree', label: '是否征得原部门初步同意', type: 'select', options: ['是', '否'] },
      { key: 'attach', label: '附件（可选）' }
    ]
  },
  transfer: {
    name: '部门调动申请',
    hint: '面向跨部门人员流动办理。流程：原部门负责人 → 目标部门负责人 → 主席团；通过后考核归属随部门切换，历史考核保留。',
    stages: ['原部门负责人', '目标部门负责人', '主席团'],
    fields: [
      { key: 'toDept', label: '意向调入部门', type: 'select', options: DEPTS },
      { key: 'toTitle', label: '意向岗位', type: 'select', options: TITLES },
      { key: 'reason', label: '调动理由', type: 'textarea', required: true },
      { key: 'handover', label: '原部门待办工作安排', type: 'textarea' },
      { key: 'agree', label: '是否征得原部门初步同意', type: 'select', options: ['是', '否'] },
      { key: 'attach', label: '附件（可选）' }
    ]
  },
  leaveclub: {
    name: '退会申请',
    hint: '流程：部长 → 主席团。全部通过后终止考核、移出排班与例会推送，档案转为只读。',
    stages: ['部长', '主席团'],
    fields: [
      { key: 'leaveType', label: '退会类型', type: 'select', options: ['自愿申请', '其他'] },
      { key: 'reason', label: '退会理由', type: 'textarea', required: true },
      { key: 'handoverDone', label: '是否完成工作交接', type: 'select', options: ['是', '否'] },
      { key: 'handoverNote', label: '交接说明', type: 'textarea' },
      { key: 'attach', label: '附件（可选，交接清单）' },
      { key: 'promise', label: '承诺勾选（填写"已知晓并承诺"）', required: true }
    ]
  },
  feedback: {
    name: '意见反馈与诉求',
    hint: '由主席团分派至对应部门负责人处理并回复；全部记录永久留痕。',
    stages: ['主席团分派', '部门负责人回复'],
    fields: [
      { key: 'anonymous', label: '提交方式', type: 'select', options: ['实名', '匿名'] },
      { key: 'category', label: '诉求分类', type: 'select', options: ['提案', '投诉', '建议', '求助'] },
      { key: 'title', label: '诉求标题', required: true },
      { key: 'detail', label: '详细内容', type: 'textarea', required: true },
      { key: 'targetDept', label: '指定对接部门', type: 'select', options: DEPTS },
      { key: 'contact', label: '联系方式（匿名模式下隐藏）' },
      { key: 'attach', label: '佐证附件' }
    ]
  },
  report: {
    name: '述职申请',
    visible: (r) => ['minister', 'presidium'].includes(r),
    hint: '仅部长团与主席团成员可提交；主席团查阅归档，述职材料与本学期考核记录绑定存档。',
    stages: ['主席团查阅归档'],
    fields: [
      { key: 'period', label: '述职学期', required: true },
      { key: 'summary', label: '述职摘要', type: 'textarea', required: true },
      { key: 'reportFile', label: '述职报告文件名（Word / PDF）' },
      { key: 'selfEval', label: '工作自评', type: 'textarea' },
      { key: 'plan', label: '后续工作规划', type: 'textarea' }
    ]
  },
  election: {
    name: '换届竞选报名',
    hint: '流程：主席团资格预审 → 责任老师终审；未在开放时段内不可报名。',
    stages: ['主席团资格预审', '责任老师终审'],
    fields: [
      { key: 'title', label: '竞选岗位', required: true },
      { key: 'manifesto', label: '竞选宣言', type: 'textarea', required: true },
      { key: 'workBrief', label: '学生会工作简述', type: 'textarea' },
      { key: 'awards', label: '评优获奖佐证材料' },
      { key: 'obey', label: '是否服从岗位调剂', type: 'select', options: ['是', '否'] }
    ]
  },
  cert: {
    name: '任职证明申请',
    hint: '主席团审核；通过后按统一模板导出带签字栏证明，生成唯一编号并留存导出日志。',
    stages: ['主席团审核'],
    fields: [
      { key: 'range', label: '任职起止时间', placeholder: '2025-09-01 至 2026-07-01' },
      { key: 'usage', label: '用途', required: true },
      { key: 'copies', label: '申请份数', type: 'number' },
      { key: 'note', label: '备注' }
    ]
  },
  volunteer: {
    name: '志愿服务认定申请',
    hint: '流程：部长初审 → 主席团复核；通过后时长计入个人档案并累计，同时计入考核加分项。',
    stages: ['部长初审', '主席团复核'],
    fields: [
      { key: 'activity', label: '志愿活动名称', required: true },
      { key: 'organizer', label: '主办单位', required: true },
      { key: 'period', label: '起止时间', required: true },
      { key: 'hours', label: '总服务时长（小时）', type: 'number', required: true },
      { key: 'brief', label: '活动简介', type: 'textarea' },
      { key: 'proof', label: '证明材料（证书 / 签到表 / 截图文件名）' }
    ]
  },
  publicLeave: {
    name: '活动公假证明申请',
    hint: '流程：部长审核 → 主席团审核确认签字。活动名称、时间、地点全部本人手工填写，不与系统活动模块关联校验；公假证明仅作纸质材料，不自动生成请假记录，请假需另行单独提交请假申请。',
    stages: ['部长审核', '主席团审核确认签字'],
    fields: [
      { key: 'activityName', label: '参加活动名称', required: true, placeholder: '填写活动全称' },
      { key: 'period', label: '活动起止时间', required: true, placeholder: '20xx年xx月xx日 14:00 至 17:00' },
      { key: 'place', label: '活动地点', required: true, placeholder: '填写实际活动地点' },
      { key: 'courses', label: '请假课程及日期', required: true, placeholder: '填写需要请假的课程、星期节次' },
      { key: 'explanation', label: '申请说明', type: 'textarea', required: true },
      { key: 'phone', label: '联系电话', required: true },
      { key: 'copiesPurpose', label: '申请份数与用途', required: true, placeholder: '填写使用用途、需要份数' },
      { key: 'attach', label: '活动通知或策划附件（选填）' }
    ]
  }
};

function applyTypesVisible() {
  return Object.entries(APPLY_TYPES).filter(([, t]) => !t.visible || t.visible(cur.role));
}
function applyTrackHtml(a) {
  return (a.track || []).map((t) => `${esc(t.action)}·${esc(t.actor)}`).join('；') || '—';
}
function applyApproved(a) {
  const mem = db.members.find((m) => m.name === a.name) || db.members.find((m) => m.sno === a.sno);
  const acc = db.accounts.find((x) => x.name === a.name);
  if ((a.type === 'adjust' || a.type === 'transfer') && mem) {
    mem.dept = a.values.toDept; mem.title = a.values.toTitle;
    if (acc) { acc.dept = mem.dept; acc.title = mem.title; if (acc.role !== 'admin' && acc.role !== 'teacher') acc.role = roleFromTitle(mem.title); }
  }
  if (a.type === 'leaveclub' && mem) { mem.status = '已退会'; if (acc && acc.role !== 'admin' && acc.role !== 'teacher') acc.role = 'student'; }
  if (a.type === 'volunteer' && mem) { mem.volunteerHours = (Number(mem.volunteerHours) || 0) + Number(a.values.hours || 0); }
  if (a.type === 'cert') { a.certNo = 'RZ' + String(Date.now()).slice(-8); }
  if (a.type === 'publicLeave') {
    const seq = String(db.applies.filter((x) => x.type === 'publicLeave' && x.proofNo).length + 1).padStart(3, '0');
    a.proofNo = 'GY' + today().replace(/-/g, '') + seq;
    a.locked = true;
    a.approvedAt = today();
  }
}

/* ---------------- 活动公假证明：模板回填与导出 ---------------- */
const DEFAULT_PL_TEMPLATE = {
  title: '应用经济系学生会证明',
  body: '兹有{专业}专业{班级}班学生{姓名}，学号：{学号}，是我系学生会{所属部门}{职务}，于{活动起止时间}在{活动地点}参加「{活动名称}」活动。\n因参加本次活动，需请假课程为：{请假课程及日期}。\n活动期间该生将按要求完成活动任务，后续会主动补齐课堂笔记、完成作业，不影响学业。{申请说明}\n特此证明。'
};
function plTemplate() { return (db.templates && db.templates.publicLeave) || DEFAULT_PL_TEMPLATE; }
function cnDate(s) {
  const [y, m, d] = String(s || '').split('-');
  if (!y) return today();
  return `${y}年${Number(m)}月${Number(d)}日`;
}
function plProofHtml(a) {
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
}
function plFormatPicker(a, archive) {
  $('#modalTitle').textContent = archive ? '导出证明存档' : '下载证明';
  $('#modalOk').classList.add('hidden');
  $('#modalCancel').textContent = '关闭';
  modalSubmit = null;
  $('#modalBody').innerHTML = `<p class="form-hint">选择导出格式（${archive ? '供后台存档' : '本人留存'}），编号：${esc(a.proofNo)}</p>
    <div class="export-grid">
      <button class="primary-btn" data-pl="word">导出 Word（.doc）</button>
      <button class="primary-btn light" data-pl="pdf">导出 PDF（打印另存）</button>
    </div>`;
  $('#modalMask').classList.remove('hidden');
  document.querySelectorAll('#modalBody [data-pl]').forEach((b) => {
    b.onclick = () => { exportPublicLeave(a, b.dataset.pl, archive); if (b.dataset.pl !== 'pdf') closeModal(); };
  });
}
function exportPublicLeave(a, fmt, archive) {
  const html = plProofHtml(a);
  const stamp = (a.proofNo || '证明') + '_' + a.name;
  const pageStyle = '@page{size:A4;margin:2.54cm 3.17cm}body{font-family:\'FangSong\',\'方正仿宋_GBK\',\'仿宋\',serif}';
  if (fmt === 'word') {
    const doc = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word"><head><meta charset="UTF-8"><style>${pageStyle}</style></head><body>${html}</body></html>`;
    downloadBlob(new Blob(['\ufeff' + doc], { type: 'application/msword;charset=utf-8' }), stamp + '_公假证明.doc');
  } else {
    const w = window.open('', '_blank');
    if (!w) { toast('请允许弹出窗口后再导出 PDF'); return; }
    w.document.write(`<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8"><title>${esc(stamp)}</title><style>${pageStyle}</style></head><body>${html}</body></html>`);
    w.document.close(); w.focus(); setTimeout(() => w.print(), 300);
  }
  commit(archive ? '导出公假证明存档' : '下载公假证明', `${a.proofNo} · ${a.name}（${ROLE_NAMES[cur.role]}）`);
}
function applyRow(a, review) {
  const canReview = allPower() || (cur.role === 'minister' && a.dept === cur.dept);
  const pending = ['待审核', '审核中', '待分派', '处理中'].includes(a.status);
  const ops = [];
  ops.push(`<button class="link-btn" data-apply-view="${a.id}">查看</button>`);
  if (!review && ['待审核', '审核中', '待分派', '处理中'].includes(a.status)) {
    ops.push(`<button class="link-btn del" data-apply-cancel="${a.id}">撤回</button>`);
  }
  if (review && canReview && pending) {
    ops.push(`<button class="link-btn" data-apply-pass="${a.id}">通过</button>`);
    ops.push(`<button class="link-btn del" data-apply-reject="${a.id}">驳回</button>`);
  }
  const who = review ? `<td><strong>${esc(a.name)}</strong><div class="cell-sub">${esc(a.sno)}</div></td>` : '<td></td>';
  return `<tr>${who}<td><span class="badge blue">${esc(a.typeName)}</span></td><td>${esc(a.dept)}</td><td class="nowrap">${esc(a.date)}</td><td>${badge(a.status)}</td><td><span class="cell-sub">${applyTrackHtml(a)}</span></td><td><div class="row-actions">${ops.join('')}</div></td></tr>`;
}

function renderJoin() {
  db.applies = db.applies || [];
  const mine = db.applies.filter((a) => a.name === cur.name);
  const pending = db.applies.filter((a) => ['待审核', '审核中', '待分派', '处理中'].includes(a.status));
  const canReview = allPower() || cur.role === 'minister';
  const reviewList = cur.role === 'minister' ? pending.filter((a) => a.dept === cur.dept) : pending;
  const archiveView = allPower() || ['minister', 'presidium', 'teacher'].includes(cur.role);
  const archiveList = db.applies.filter((a) => a.type === 'publicLeave' && ['已通过', '已作废'].includes(a.status));
  const legacy = cur.role === 'minister' ? db.joinRequests.filter((j) => j.dept === cur.dept) : db.joinRequests;

  $('#views').innerHTML = `
    <div class="card">
      <div class="card-head">
        <div><h2>我的申请</h2><div class="sub">部门调整/调动、退会、反馈、述职、竞选、任职证明、志愿认定、活动公假证明等事项，审批轨迹全程留痕</div></div>
        <button class="primary-btn" id="addApply">+ 提交申请</button>
      </div>
      <div class="table-wrap"><table>
        <thead><tr>${canReview ? '<th>申请人</th>' : ''}<th>申请类型</th><th>部门</th><th>提交时间</th><th>状态</th><th>审批轨迹</th><th>操作</th></tr></thead>
        <tbody>${mine.length ? mine.slice().reverse().map((a) => applyRow(a, false)).join('') : '<tr><td colspan="7" class="empty">还没有提交申请</td></tr>'}</tbody>
      </table></div>
    </div>
    ${allPower() ? `
    <div class="card">
      <div class="card-head"><div><h2>公假证明模板设置</h2><div class="sub">主席团/管理员维护证明排版；导出时按占位符回填申请信息并预留签字位置</div></div></div>
      <div class="field"><label>证明标题</label><input id="plTplTitle"></div>
      <div class="field"><label>证明正文（可用占位符：{姓名} {学号} {专业} {班级} {所属部门} {活动名称} {活动起止时间} {活动地点} {请假课程及日期} {申请说明} {联系电话} {申请份数与用途} {证明编号} {出具日期}）</label><textarea id="plTplBody" rows="6"></textarea></div>
      <div class="row-actions"><button class="primary-btn" id="plTplSave">保存模板</button></div>
    </div>` : ''}
    ${canReview ? `
    <div class="card">
      <div class="card-head"><div><h2>待我审批</h2><div class="sub">共 ${reviewList.length} 条待处理申请</div></div></div>
      <div class="table-wrap"><table>
        <thead><tr><th>申请人</th><th>类型</th><th>部门</th><th>提交时间</th><th>状态</th><th>轨迹</th><th>操作</th></tr></thead>
        <tbody>${reviewList.length ? reviewList.slice().reverse().map((a) => applyRow(a, true)).join('') : '<tr><td colspan="7" class="empty">暂无待审批申请</td></tr>'}</tbody>
      </table></div>
    </div>` : ''}
    ${archiveView ? `
    <div class="card">
      <div class="card-head"><div><h2>公假证明存档</h2><div class="sub">共 ${archiveList.length} 条已终审记录，部长 / 主席团 / 责任教师可查看并导出存档</div></div></div>
      <div class="table-wrap"><table>
        <thead><tr><th>申请人</th><th>类型</th><th>部门</th><th>提交时间</th><th>状态</th><th>证明编号</th><th>操作</th></tr></thead>
        <tbody>${archiveList.length ? archiveList.slice().reverse().map((a) => `
          <tr><td><strong>${esc(a.name)}</strong><div class="cell-sub">${esc(a.sno)}</div></td>
            <td><span class="badge blue">${esc(a.typeName)}</span></td><td>${esc(a.dept)}</td><td class="nowrap">${esc(a.date)}</td>
            <td>${badge(a.status)}</td><td>${esc(a.proofNo || '—')}</td>
            <td><div class="row-actions"><button class="link-btn" data-apply-view="${a.id}">查看</button></div></td></tr>`).join('') : '<tr><td colspan="7" class="empty">暂无已终审公假证明</td></tr>'}</tbody>
      </table></div>
    </div>` : ''}
    <div class="card">
      <div class="card-head"><div><h2>历史入会申请</h2><div class="sub">旧版加入部门申请记录留档</div></div></div>
      <div class="table-wrap"><table>
        <thead><tr><th>姓名</th><th>学号</th><th>申请部门</th><th>申请理由</th><th>日期</th><th>状态</th><th>操作</th></tr></thead>
        <tbody>${legacy.length ? legacy.slice().reverse().map((j) => `
          <tr><td><strong>${esc(j.name)}</strong></td><td>${esc(j.sno)}</td>
            <td><span class="badge blue">${esc(j.dept)}</span></td><td>${esc(j.reason)}</td><td>${esc(j.date)}</td><td>${badge(j.status)}</td>
            <td><div class="row-actions">${(cur.role === 'minister' || allPower()) && j.status === '待审核'
              ? `<button class="link-btn" data-join-pass="${j.id}">通过</button><button class="link-btn del" data-join-reject="${j.id}">驳回</button>` : '<span class="cell-sub">—</span>'}</div></td></tr>`).join('') : '<tr><td colspan="7" class="empty">暂无入会申请记录</td></tr>'}</tbody>
      </table></div>
    </div>`;

  if ($('#plTplSave')) {
    const tpl = plTemplate();
    $('#plTplTitle').value = tpl.title;
    $('#plTplBody').value = tpl.body;
    $('#plTplSave').onclick = () => {
      db.templates = db.templates || {};
      db.templates.publicLeave = { title: $('#plTplTitle').value.trim() || '应用经济系学生会证明', body: $('#plTplBody').value.trim() };
      commit('维护公假证明模板', '更新证明排版'); save(); render(); toast('模板已保存');
    };
  }

  $('#addApply').onclick = () => {
    const types = applyTypesVisible();
    openForm({
      title: '选择申请类型',
      fields: [{ key: 'type', label: '申请类型', type: 'select', options: types.map(([, t]) => t.name) }],
      onSubmit(d) {
        const found = types.find(([, t]) => t.name === d.type);
        setTimeout(() => applyForm(found[0]), 60);
      }
    });
  };

  function applyForm(key) {
    const cfg = APPLY_TYPES[key];
    const isPL = key === 'publicLeave';
    let attachName = '';
    const presetExplain = '活动期间该生将按要求完成活动任务，后续会主动补齐课堂笔记、完成作业，不影响学业。';
    const autoInfo = isPL ? `<div class="info-list" style="margin-bottom:10px">
      <div><span>姓名（自动带出）</span><strong>${esc(cur.name)}</strong></div>
      <div><span>学号（自动带出）</span><strong>${esc(cur.sno || '—')}</strong></div>
      <div><span>专业（自动带出）</span><strong>${esc(cur.major || '—')}</strong></div>
      <div><span>班级（自动带出）</span><strong>${esc(cur.class || '—')}</strong></div>
      <div><span>所属部门（自动带出）</span><strong>${esc(cur.dept || '—')}</strong></div>
    </div>` : '';
    const body = openForm({
      title: cfg.name,
      hint: cfg.hint,
      fields: cfg.fields,
      extra: autoInfo + (isPL ? '<div class="field"><label>活动通知或策划附件（选填）</label><input type="file" id="plAttach" accept=".doc,.docx,.pdf,.xls,.xlsx,.png,.jpg,.jpeg,.txt" class="file-input"></div>' : ''),
      values: { toDept: cur.dept, toTitle: cur.title, targetDept: cur.dept, anonymous: '实名', category: '建议', obey: '是', agree: '否', handoverDone: '是', leaveType: '自愿申请', explanation: presetExplain, phone: cur.phone || '', copiesPurpose: '1 份，用于课程请假备案' },
      onSubmit(d) {
        if (isPL) d.attach = attachName;
        db.applies.push({
          id: uid('ap'), type: key, typeName: cfg.name, name: cur.name, sno: cur.sno || '—', major: cur.major || '—', class: cur.class || '—', dept: cur.dept, title: cur.title,
          values: d, date: today(), status: key === 'feedback' ? '待分派' : '待审核', stage: 0, locked: false,
          track: [{ actor: cur.name, role: ROLE_NAMES[cur.role], action: '提交申请', note: '', time: today() }]
        });
        commit('提交申请', `${cfg.name} · ${cur.name}`); render(); toast('申请已提交');
      }
    });
    if (isPL) body.querySelector('#plAttach').onchange = (e) => { attachName = e.target.files[0] ? e.target.files[0].name : ''; };
  }

  document.querySelectorAll('[data-apply-view]').forEach((b) => {
    b.onclick = () => {
      const a = db.applies.find((x) => x.id === b.dataset.applyView);
      const v = a.values || {};
      const PL_LABELS = { activityName: '参加活动名称', period: '活动起止时间', place: '活动地点', courses: '请假课程及日期', explanation: '申请说明', phone: '联系电话', copiesPurpose: '申请份数与用途', attach: '活动通知或策划附件' };
      let rowsHtml;
      if (a.type === 'publicLeave') {
        const auto = [['姓名', a.name], ['学号', a.sno], ['专业', a.major || '—'], ['班级', a.class || '—'], ['所属部门', a.dept]];
        const manual = Object.entries(PL_LABELS).map(([k, label]) => [label, v[k] || '—']);
        rowsHtml = auto.concat(manual).map(([label, val]) => `<div><span>${esc(label)}</span><strong>${esc(val)}</strong></div>`).join('');
      } else {
        rowsHtml = Object.entries(v).map(([k, val]) => `<div><span>${esc(k)}</span><strong>${esc(val || '—')}</strong></div>`).join('');
      }
      const track = (a.track || []).map((t) => `<div>${esc(t.time)} · ${esc(t.action)} · ${esc(t.actor)}（${esc(t.role)}）${t.note ? '：' + esc(t.note) : ''}</div>`).join('');
      const isOwner = a.name === cur.name;
      const approved = a.status === '已通过' && !!a.proofNo;
      const canArchive = allPower() || ['presidium', 'minister', 'teacher'].includes(cur.role);
      let actionHtml = '';
      if (a.type === 'publicLeave') {
        if (approved && isOwner) actionHtml += `<button class="primary-btn" id="plDownload">下载证明</button>`;
        if (approved && canArchive) actionHtml += `<button class="primary-btn light" id="plArchive">导出证明存档</button>`;
        if (approved && (isOwner || cur.role === 'admin')) actionHtml += `<button class="link-btn del" id="plVoid">作废申请</button>`;
      }
      openInfo(a.typeName + ' · ' + a.name, `<div class="info-list">${rowsHtml}</div>${a.certNo ? `<p class="form-hint">证明编号：${esc(a.certNo)}</p>` : ''}${a.proofNo ? `<p class="form-hint">证明编号：${esc(a.proofNo)}（审批通过后表单内容锁定，不可再编辑）</p>` : ''}${actionHtml ? `<div class="row-actions" style="margin-top:12px">${actionHtml}</div>` : ''}<div class="form-hint" style="margin-top:10px">审批轨迹</div><div class="perm-list">${track || '<div class="perm-item"><span class="dot"></span>暂无轨迹</div>'}</div>`, '提交时间：' + a.date);
      const dl = $('#plDownload'), ar = $('#plArchive'), vd = $('#plVoid');
      if (dl) dl.onclick = () => plFormatPicker(a, false);
      if (ar) ar.onclick = () => plFormatPicker(a, true);
      if (vd) vd.onclick = () => {
        if (!confirm('作废后该证明不可再下载，记录保留归档；信息有误需重新提交新申请。确定作废这条申请？')) return;
        a.status = '已作废'; a.locked = true;
        a.track.push({ actor: cur.name, role: ROLE_NAMES[cur.role], action: '作废申请', note: '证明作废，归档保留', time: today() });
        commit('作废公假证明', `${a.proofNo} · ${a.name}`); save(); closeModal(); render(); toast('申请已作废，记录归档');
      };
    };
  });
  document.querySelectorAll('[data-apply-cancel]').forEach((b) => {
    b.onclick = () => {
      const a = db.applies.find((x) => x.id === b.dataset.applyCancel);
      if (!confirm('确定撤回这条申请？一级审批人处理后不可再撤回。')) return;
      a.status = '已撤回';
      a.track.push({ actor: cur.name, role: ROLE_NAMES[cur.role], action: '申请人撤回', note: '', time: today() });
      commit('撤回申请', `${a.typeName} · ${a.name}`); save(); render(); toast('申请已撤回');
    };
  });
  document.querySelectorAll('[data-apply-pass]').forEach((b) => {
    b.onclick = () => {
      const a = db.applies.find((x) => x.id === b.dataset.applyPass);
      const cfg = APPLY_TYPES[a.type];
      const last = a.stage >= cfg.stages.length - 1;
      const stageLabel = cfg.stages[a.stage] || '';
      a.track.push({ actor: cur.name, role: ROLE_NAMES[cur.role], action: stageLabel + '通过', note: '', time: today() });
      if (last) { a.status = a.type === 'feedback' ? '已答复' : '已通过'; applyApproved(a); }
      else { a.stage += 1; a.status = a.type === 'feedback' ? '处理中' : '审核中'; }
      commit('审批申请', `${a.typeName} · ${a.name} → ${a.status}`); save(); render(); toast(last ? '申请已通过' : '已流转至下一审批节点');
    };
  });
  document.querySelectorAll('[data-apply-reject]').forEach((b) => {
    b.onclick = () => {
      const a = db.applies.find((x) => x.id === b.dataset.applyReject);
      openForm({
        title: '驳回申请 · ' + a.name,
        fields: [{ key: 'note', label: '驳回原因', type: 'textarea', required: true }],
        onSubmit(d) {
          a.status = '已驳回';
          a.track.push({ actor: cur.name, role: ROLE_NAMES[cur.role], action: '驳回', note: d.note, time: today() });
          commit('驳回申请', `${a.typeName} · ${a.name}：${d.note}`); save(); render(); toast('已驳回申请');
        }
      });
    };
  });

  document.querySelectorAll('[data-join-pass]').forEach((b) => {
    b.onclick = () => {
      const j = db.joinRequests.find((x) => x.id === b.dataset.joinPass);
      j.status = '已通过';
      db.members.push({ id: uid('m'), name: j.name, sno: j.sno === '—' ? '待补录' : j.sno, class: j.class || '—', dept: j.dept, title: '成员', phone: '', status: '在任', joined: today() });
      commit('通过入会申请', `${j.name} → ${j.dept}`); render(); toast('已通过，成员已加入部门');
    };
  });
  document.querySelectorAll('[data-join-reject]').forEach((b) => {
    b.onclick = () => {
      const j = db.joinRequests.find((x) => x.id === b.dataset.joinReject);
      j.status = '已驳回';
      commit('驳回入会申请', j.name); save(); render(); toast('已驳回申请');
    };
  });
}

/* ---------------- 账号管理（管理员） ---------------- */
const ROLE_KEY_FROM_LABEL = {
  '管理员': 'admin', '责任教师': 'teacher', '主席团': 'presidium', '部长团': 'minister', '普通学生': 'student',
  admin: 'admin', teacher: 'teacher', presidium: 'presidium', minister: 'minister', student: 'student'
};

function renderAccounts() {
  if (!['admin', 'teacher'].includes(cur.role)) { switchView('dashboard'); return; }
  const list = db.accounts.slice();
  $('#views').innerHTML = `
    <div class="card">
      <div class="card-head">
        <div><h2>登录账号管理</h2><div class="sub">管理员批量导入账号与初始密码；成员登录后可自行修改密码，用户名保持不变</div></div>
        <div class="toolbar">
          <button class="primary-btn" id="importAccounts">批量导入账号</button>
          <button class="primary-btn light" id="addAccount">+ 新增账号</button>
          <button class="primary-btn light" id="exportAccounts">导出账号</button>
        </div>
      </div>
      <div class="table-wrap"><table>
        <thead><tr><th>账号</th><th>姓名</th><th>性别</th><th>族别</th><th>政治面貌</th><th>所在班级</th><th>联系电话</th><th>部门</th><th>职务</th><th>学号</th><th>角色</th><th>操作</th></tr></thead>
        <tbody>${list.map((a) => `
          <tr>
            <td><strong>${esc(a.username)}</strong></td>
            <td><div class="name-cell"><span class="mini-avatar">${esc(a.name.slice(-1))}</span>${esc(a.name)}</div></td>
            <td>${esc(a.gender || '—')}</td>
            <td>${esc(a.ethnicity || '—')}</td>
            <td>${esc(a.politics || '—')}</td>
            <td>${esc(a.class && a.class !== '—' ? a.class : '—')}</td>
            <td>${esc(a.phone || '—')}</td>
            <td>${esc(a.dept && a.dept !== '未加入' ? a.dept : '—')}</td>
            <td>${esc(a.title || '—')}</td>
            <td>${esc(a.sno && a.sno !== '—' ? a.sno : '—')}</td>
            <td><span class="badge blue">${esc(ROLE_NAMES[a.role])}</span></td>
            <td><div class="row-actions">
              <button class="link-btn" data-reset="${esc(a.username)}">重置密码</button>
              ${a.role !== 'admin' && a.username !== cur.username ? `<button class="link-btn del" data-delacc="${esc(a.username)}">移除</button>` : ''}
            </div></td>
          </tr>`).join('') || '<tr><td colspan="12" class="empty">暂无账号</td></tr>'}
        </tbody>
      </table></div>
    </div>`;

  $('#exportAccounts').onclick = () => {
    const rows = db.accounts.map((a) => [a.username, a.name, a.gender || '', a.ethnicity || '', a.politics || '', a.class || '', a.phone || '', a.dept, a.title || '', a.sno || '', ROLE_NAMES[a.role]]);
    openExportPicker('登录账号_' + today(), ['账号', '姓名', '性别', '族别', '政治面貌', '所在班级', '联系电话', '部门', '职务', '学号', '角色'], rows);
  };

  $('#importAccounts').onclick = () => {
    const body = openForm({
      title: '批量导入账号',
      okText: '开始导入',
      hint: '每行一名账号，按「姓名,性别,族别,政治面貌,所在班级,联系电话,部门,学号,账号,初始密码,职务,角色」排列，逗号或制表符分隔（可从 Excel 复制粘贴）；职务可填主席/副主席/部长/副部长/成员，角色留空时按职务自动判定；重复账号按表自动同步更新，无需逐条修改。',
      fields: [{ key: 'rows', label: '账号数据', type: 'textarea', placeholder: '赵小林,男,汉族,共青团员,2026级经济管理1班,138****0031,秘书部,20260031,20260031,123456,成员,普通学生\n钱小燕,女,汉族,群众,2026级会计2班,139****0032,宣传部,20260032,20260032,123456,部长,部长团' }],
      extra: '<div class="field"><label>或选择 Excel / CSV 文件（.xlsx .csv .txt）</label><input type="file" id="accCsv" accept=".csv,.txt,.xlsx" class="file-input"></div>',
      onSubmit(d) {
        const r = importAccounts(d.rows);
        commit('导入账号', `新增 ${r.added} 个，更新 ${r.updated} 个，跳过 ${r.skipped} 行`);
        render();
        toast(`导入完成：新增 ${r.added} 个，更新 ${r.updated} 个，跳过 ${r.skipped} 行`);
        if (r.messages.length) setTimeout(() => openInfo('导入结果说明', `<div class="perm-list">${r.messages.map((m) => `<div class="perm-item"><span class="dot"></span>${esc(m)}</div>`).join('')}</div>`), 300);
      }
    });
    body.querySelector('#accCsv').onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      readImportFile(file, body.querySelector('#f_rows'));
    };
  };

  $('#addAccount').onclick = () => {
    openForm({
      title: '新增账号',
      fields: [
        { key: 'username', label: '账号', required: true },
        { key: 'password', label: '初始密码', type: 'password', required: true },
        { key: 'name', label: '姓名', required: true },
        { key: 'gender', label: '性别', type: 'select', options: ['男', '女'] },
        { key: 'ethnicity', label: '族别' },
        { key: 'politics', label: '政治面貌', type: 'select', options: ['群众', '共青团员', '中共预备党员', '中共党员'] },
        { key: 'sno', label: '学号' },
        { key: 'class', label: '所在班级' },
        { key: 'phone', label: '联系电话' },
        { key: 'role', label: '角色', type: 'select', options: ['普通学生', '部长团', '主席团', '责任教师', '管理员'] },
        { key: 'dept', label: '部门', placeholder: '未加入 或部门名称' },
        { key: 'title', label: '职务', type: 'select', options: TITLES }
      ],
      values: { gender: '男', ethnicity: '汉族', politics: '共青团员', role: '普通学生', dept: '未加入', title: '成员' },
      onSubmit(d) {
        if (d.password.length < 6) { toast('初始密码至少 6 位'); return; }
        if (db.accounts.some((a) => a.username === d.username)) { toast('用户名已存在'); return; }
        const role = ROLE_KEY_FROM_LABEL[d.role];
        const deptName = d.dept || '未加入';
        db.accounts.push({ username: d.username, password: d.password, name: d.name, role, dept: deptName, title: d.title, sno: d.sno || '', class: d.class || '', phone: d.phone || '', gender: d.gender, ethnicity: d.ethnicity || '汉族', politics: d.politics });
        if (deptName !== '未加入' && !db.members.some((m) => m.name === d.name && m.sno === d.sno)) {
          db.members.push({ id: uid('m'), name: d.name, sno: d.sno || '—', class: d.class || '—', dept: deptName, title: d.title, phone: d.phone || '', gender: d.gender, ethnicity: d.ethnicity || '汉族', politics: d.politics, account: d.username, status: '在任', joined: today() });
        }
        commit('新增账号', `${d.username} · ${d.name}`); render(); toast('账号已添加');
      }
    });
  };

  document.querySelectorAll('[data-reset]').forEach((b) => {
    b.onclick = () => {
      const a = db.accounts.find((x) => x.username === b.dataset.reset);
      openForm({
        title: '重置密码 · ' + a.username,
        fields: [
          { key: 'p1', label: '新初始密码', type: 'password', required: true },
          { key: 'p2', label: '确认新密码', type: 'password', required: true }
        ],
        onSubmit(d) {
          if (d.p1.length < 6) { toast('密码至少 6 位'); return; }
          if (d.p1 !== d.p2) { toast('两次输入不一致'); return; }
          a.password = d.p1;
          commit('重置密码', a.username); save(); render(); toast('密码已重置');
        }
      });
    };
  });

  document.querySelectorAll('[data-delacc]').forEach((b) => {
    b.onclick = () => {
      const a = db.accounts.find((x) => x.username === b.dataset.delacc);
      if (!confirm(`确定移除账号「${a.username}」（${a.name}）？移除后该账号将无法登录。`)) return;
      db.accounts = db.accounts.filter((x) => x.username !== a.username);
      db.members.forEach((m) => { if (m.account === a.username) m.account = ''; });
      commit('移除账号', a.username); save(); render(); toast('账号已移除');
    };
  });
}

function importAccounts(text) {
  const lines = String(text || '').split('\n').map((l) => l.trim()).filter(Boolean);
  let added = 0, updated = 0, skipped = 0;
  const messages = [];
  lines.forEach((line, idx) => {
    const [name, gender, ethnicity, politics, cls, phone, dept, sno, username, password, titleLabel, roleLabel] = splitRow(line);
    if (!username || !password || !name) { skipped++; messages.push(`第 ${idx + 1} 行缺少账号、初始密码或姓名，已跳过`); return; }
    if (name === '姓名' || username === '账号') { skipped++; return; }
    if (password.length < 6) { skipped++; messages.push(`第 ${idx + 1} 行「${username}」初始密码不足 6 位，已跳过`); return; }
    const deptName = dept || '未加入';
    const titleName = normalizeTitle(titleLabel);
    const profile = { name, gender: gender || '', ethnicity: ethnicity || '汉族', politics: politics || '', class: cls || '—', phone: phone || '', dept: deptName, sno: sno || '—' };
    let acc = db.accounts.find((a) => a.username === username);
    const role = acc && ['admin', 'teacher'].includes(acc.role) ? acc.role : (ROLE_KEY_FROM_LABEL[(roleLabel || '').trim()] || roleFromTitle(titleName));
    if (acc) {
      Object.assign(acc, { name, role, dept: deptName, title: titleName, sno: profile.sno, class: profile.class, phone: profile.phone, gender: profile.gender, ethnicity: profile.ethnicity, politics: profile.politics });
      let mem = db.members.find((m) => m.account === username) || db.members.find((m) => m.sno === profile.sno && m.name === name);
      if (mem) Object.assign(mem, profile, { title: titleName, account: username, status: mem.status || '在任' });
      else db.members.push(Object.assign({ id: uid('m'), account: username, title: titleName, status: '在任', joined: today() }, profile));
      updated++;
      messages.push(`第 ${idx + 1} 行「${username}」已按表同步更新`);
    } else {
      db.accounts.push({ username, password, name, role, dept: deptName, title: titleName, sno: profile.sno, class: profile.class, phone: profile.phone, gender: profile.gender, ethnicity: profile.ethnicity, politics: profile.politics });
      let mem = db.members.find((m) => m.account === username) || db.members.find((m) => m.sno === profile.sno && m.name === name);
      if (mem) Object.assign(mem, profile, { title: titleName, account: username, status: mem.status || '在任' });
      else db.members.push(Object.assign({ id: uid('m'), account: username, title: titleName, status: '在任', joined: today() }, profile));
      added++;
    }
  });
  return { added, updated, skipped, messages };
}
