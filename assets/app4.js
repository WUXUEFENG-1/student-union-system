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
      { key: 'attach', label: '附件（可选）', type: 'file' }
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
      { key: 'attach', label: '附件（可选）', type: 'file' }
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
      { key: 'attach', label: '附件（可选，交接清单）', type: 'file' },
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
      { key: 'attach', label: '佐证附件（选填）', type: 'file' }
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
      { key: 'reportFile', label: '述职报告（Word / PDF，选填）', type: 'file' },
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
      { key: 'awards', label: '评优获奖佐证材料（选填）', type: 'file' },
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
      { key: 'proof', label: '证明材料（证书 / 签到表 / 截图，选填）', type: 'file' }
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
      { key: 'attach', label: '活动通知或策划附件（选填）', type: 'file' }
    ]
  }
};

function applyTypesVisible() {
  return Object.entries(APPLY_TYPES).filter(([, t]) => !t.visible || t.visible(cur.role));
}
function applyTrackHtml(a) {
  return (a.track || []).map((t) => `${esc(t.action)}·${esc(t.actor)}`).join('；') || '—';
}
/* 申请人为部长/副部长时，审批链固定为：副主席审核 → 主席审核；其余身份走各类型默认链 */
function isMinisterApplicant(a) {
  return a.applicantRole === 'minister' || ['部长', '副部长'].includes(a.title);
}
function applyStages(a) {
  const cfg = APPLY_TYPES[a.type];
  if (isMinisterApplicant(a)) return ['副主席审核', '主席审核'];
  return (Array.isArray(a.flow) && a.flow.length) ? a.flow : (cfg ? cfg.stages : []);
}

/* 审批流转可视化：申请人提交 → 各审批节点（绿=已完成 / 蓝=当前节点 / 灰=待处理 / 红=终止） */
function flowTimelineHtml(a) {
  const nodes = applyStages(a);
  const doneAll = ['已通过', '已答复'].includes(a.status);
  const stopped = ['已驳回', '已撤回', '已作废'].includes(a.status);
  const stage = a.stage || 0;
  const track = a.track || [];
  const actorOf = (label) => {
    const t = track.find((x) => x.action === label + '通过' || x.action === label);
    return t ? t.actor : '—';
  };
  const stateText = { done: '已完成', current: '当前节点', pending: '待处理', rejected: a.status === '已撤回' ? '已撤回' : (a.status === '已作废' ? '已作废' : '已驳回') };
  const items = [{ title: '申请人提交', state: 'done', actor: a.name || '—' }];
  nodes.forEach((label, i) => {
    let state;
    if (doneAll) state = 'done';
    else if (stopped) state = i < stage ? 'done' : (i === stage ? 'rejected' : 'pending');
    else if (i < stage) state = 'done';
    else if (i === stage) state = 'current';
    else state = 'pending';
    items.push({ title: label, state, actor: actorOf(label) });
  });
  return `<div class="flow-timeline">` + items.map((it) => `
    <div class="ft-node ft-${it.state}">
      <span class="ft-dot"></span>
      <div class="ft-body">
        <div class="ft-title">${esc(it.title)}</div>
        <div class="ft-status">${stateText[it.state]}</div>
        <div class="ft-actor">${esc(it.actor)}</div>
      </div>
    </div>`).join('') + `</div>`;
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
  if (a.type === 'volunteer') {
    if (!a.volNo) {
      const seq = String(db.applies.filter((x) => x.type === 'volunteer' && x.volNo).length + 1).padStart(3, '0');
      a.volNo = 'ZY' + today().replace(/-/g, '') + seq;
    }
    a.approvedAt = today();
  }
  if (a.type === 'cert') { a.certNo = 'RZ' + String(Date.now()).slice(-8); }
  if (a.type === 'publicLeave') {
    const seq = String(db.applies.filter((x) => x.type === 'publicLeave' && x.proofNo).length + 1).padStart(3, '0');
    a.proofNo = 'GY' + today().replace(/-/g, '') + seq;
    a.locked = true;
    a.approvedAt = today();
  }
}

/* ---------------- 申请进度消息提醒 ----------------
 * db.msgs：站内消息，投递给申请人本人；审批每过一个节点写一条，工作台集中展示。
 * 字段：id / to（申请人姓名）/ sno / applyId / typeName / title / text / time / read
 */
const MSG_LIMIT = 200;
function msgNow() { return new Date().toLocaleString('zh-CN', { hour12: false }); }
function sendApplyMsg(a, text, extra) {
  if (!a || !a.name) return;
  db.msgs = db.msgs || [];
  db.msgs.unshift({
    id: uid('n'),
    to: a.name,
    sno: a.sno || '',
    applyId: a.id || '',
    typeName: a.typeName || (APPLY_TYPES[a.type] ? APPLY_TYPES[a.type].name : '申请'),
    title: (extra && extra.title) || '申请审批进度提醒',
    text,
    time: msgNow(),
    updatedAt: new Date().toISOString(),
    read: false
  });
  if (db.msgs.length > MSG_LIMIT) db.msgs.length = MSG_LIMIT;
}
/* 节点通过：告知已通过的节点与即将流转到的下一节点 */
function notifyStagePass(a, stageLabel, nextLabel) {
  const text = nextLabel
    ? `你的「${a.typeName}」已通过【${stageLabel}】，现已流转至【${nextLabel}】审批节点。`
    : `你的「${a.typeName}」已通过全部审批节点，审批结果为「已通过」。`;
  sendApplyMsg(a, text);
}
/* 驳回：告知在哪个节点被驳回及原因 */
function notifyReject(a, stageLabel, reason) {
  sendApplyMsg(a, `你的「${a.typeName}」在【${stageLabel || '审批'}】节点被驳回${reason ? '，原因：' + reason : ''}。`, { title: '申请驳回提醒' });
}

/* 统一驳回弹窗：可选「退回上一流程节点」或「退回本人（转草稿可编辑重提）」。
 * stage 0 无上一节点，只能退回本人。 */
function openRejectForm(a) {
  const stages = applyStages(a);
  const curStage = a.stage || 0;
  const curLabel = stages[curStage] || '审批';
  const canBack = curStage > 0;
  const prevLabel = canBack ? stages[curStage - 1] : '';
  const options = [];
  if (canBack) options.push({ value: 'prev', label: `驳回到上一流程节点（交回【${prevLabel}】重新审批）` });
  options.push({ value: 'self', label: '驳回到本人（转为草稿，修改后重新提交）' });
  openForm({
    title: '驳回申请 · ' + a.name,
    hint: canBack ? '可选择退回上一审批节点重新审批，或退回申请人本人修改后重新提交。' : '当前为首个审批节点，只能退回申请人本人修改。',
    fields: [
      { key: 'backTarget', label: '驳回去向', type: 'select', options },
      { key: 'note', label: '驳回原因', type: 'textarea', required: true }
    ],
    onSubmit(d) {
      const reason = d.note || '';
      if (d.backTarget === 'prev' && canBack) {
        a.stage = curStage - 1;
        a.status = a.type === 'feedback' ? '处理中' : '审核中';
        a.track.push({ actor: cur.name, role: ROLE_NAMES[cur.role], action: `退回【${prevLabel}】重新审批`, note: reason, time: today() });
        sendApplyMsg(a, `你的「${a.typeName}」在【${curLabel}】被退回【${prevLabel}】，将由该节点重新审批。${reason ? '原因：' + reason : ''}`, { title: '申请退回提醒' });
        commit('退回上一节点', `${a.typeName} · ${a.name} → 【${prevLabel}】：${reason}`);
        toast('已退回上一审批节点');
      } else {
        a.status = '草稿';
        a.stage = 0;
        a.locked = false;
        a.track.push({ actor: cur.name, role: ROLE_NAMES[cur.role], action: '驳回（退回本人，转草稿）', note: reason, time: today() });
        sendApplyMsg(a, `你的「${a.typeName}」在【${curLabel}】被退回本人，请修改后重新提交。${reason ? '原因：' + reason : ''}`, { title: '申请驳回提醒' });
        commit('驳回到本人（草稿）', `${a.typeName} · ${a.name}：${reason}`);
        toast('已退回本人，转为草稿');
      }
      save(); render();
    }
  });
}

/* 批量驳回：去向与单条一致——可退回上一流程节点，或退回本人转草稿；首节点记录只能退本人 */
function openBulkRejectForm(ids) {
  const recs = ids.map((id) => db.applies.find((x) => x.id === id)).filter(Boolean);
  const canBackAny = recs.some((a) => (a.stage || 0) > 0);
  const options = [];
  if (canBackAny) options.push({ value: 'prev', label: '驳回到上一流程节点（交回上一节点重新审批）' });
  options.push({ value: 'self', label: '驳回到本人（转为草稿，修改后重新提交）' });
  openForm({
    title: `批量驳回（${ids.length} 条）`,
    hint: canBackAny ? '可统一退回上一审批节点重新审批，或退回申请人本人转草稿；首个审批节点的记录只能退回本人。' : '当前均为首个审批节点，只能退回申请人本人修改后重新提交。',
    fields: [
      { key: 'backTarget', label: '驳回去向', type: 'select', options },
      { key: 'note', label: '驳回原因', type: 'textarea', required: true }
    ],
    onSubmit(d) {
      const reason = d.note || '';
      let nBack = 0, nSelf = 0;
      recs.forEach((a) => {
        if (typeof canApprove === 'function' && !canApprove(a)) return;
        const stages = applyStages(a);
        const curStage = a.stage || 0;
        const curLabel = stages[curStage] || '审批';
        const canBack = curStage > 0;
        const prevLabel = canBack ? stages[curStage - 1] : '';
        if (d.backTarget === 'prev' && canBack) {
          a.stage = curStage - 1;
          a.status = a.type === 'feedback' ? '处理中' : '审核中';
          a.track.push({ actor: cur.name, role: ROLE_NAMES[cur.role], action: `退回【${prevLabel}】重新审批`, note: reason, time: today() });
          sendApplyMsg(a, `你的「${a.typeName}」在【${curLabel}】被退回【${prevLabel}】，将由该节点重新审批。${reason ? '原因：' + reason : ''}`, { title: '申请退回提醒' });
          nBack += 1;
        } else {
          a.status = '草稿';
          a.stage = 0;
          a.locked = false;
          a.track.push({ actor: cur.name, role: ROLE_NAMES[cur.role], action: '驳回（退回本人，转草稿）', note: reason, time: today() });
          sendApplyMsg(a, `你的「${a.typeName}」在【${curLabel}】被批量退回本人，请修改后重新提交。${reason ? '原因：' + reason : ''}`, { title: '申请驳回提醒' });
          nSelf += 1;
        }
      });
      commit('批量驳回', `退回上一节点 ${nBack} 条、退回本人 ${nSelf} 条：${reason}`);
      save(); render();
      toast(`已批量驳回：退回上一节点 ${nBack} 条，退回本人 ${nSelf} 条`);
    }
  });
}

/* 是否可撤销本人上一步通过：申请仍在途（未终审、未终止），且当前登录人是上一节点的通过人 */
function canUndoApproval(a) {
  if (!cur || !a) return false;
  if (!['待审核', '审核中', '待分派', '处理中'].includes(a.status)) return false;
  const stage = a.stage || 0;
  if (stage <= 0) return false;
  const stages = applyStages(a);
  const prevLabel = stages[stage - 1];
  if (!prevLabel) return false;
  const mine = (a.track || []).filter((t) => t.action === prevLabel + '通过' && t.actor === cur.name).pop();
  return !!mine;
}

/* 撤销本人审批通过：退回上一节点重新审批，移除该步轨迹与签字；终审已通过的不在此列 */
function undoApproval(a) {
  const stages = applyStages(a);
  const stage = a.stage || 0;
  const prevLabel = stages[stage - 1];
  if (!prevLabel) return;
  if (!confirm(`确定撤销你在【${prevLabel}】的审批通过？申请将退回该节点重新审批。`)) return;
  const mine = (a.track || []).filter((t) => t.action === prevLabel + '通过' && t.actor === cur.name).pop();
  if (mine) { const idx = a.track.lastIndexOf(mine); if (idx >= 0) a.track.splice(idx, 1); }
  const signs = a.approveSigns || [];
  const signIdx = [...signs].map((s, i) => (s.action === prevLabel && s.actor === cur.name ? i : -1)).filter((i) => i >= 0).pop();
  if (signIdx != null) signs.splice(signIdx, 1);
  if (stage - 1 === 0) { a.signMinister = ''; a.phoneMinister = ''; }
  if (stage - 1 === 1) { a.signChair = ''; a.phoneChair = ''; }
  a.stage = stage - 1;
  a.status = a.type === 'feedback' ? '处理中' : '审核中';
  a.track.push({ actor: cur.name, role: ROLE_NAMES[cur.role], action: `撤销【${prevLabel}】审批`, note: '', time: today() });
  sendApplyMsg(a, `你的「${a.typeName}」在【${prevLabel}】的审批已被撤销，将由该节点重新审批。`, { title: '审批撤销提醒' });
  commit('撤销审批', `${a.typeName} · ${a.name} ← 撤销【${prevLabel}】`);
  save(); render();
  toast('已撤销该审批，申请退回上一节点');
}
/* 当前登录人收到的消息（按姓名投递，重名时以学号区分展示） */
function myMsgs() {
  return (db.msgs || []).filter((m) => m.to === (cur ? cur.name : ''));
}
function unreadMsgCount() { return myMsgs().filter((m) => !m.read).length; }

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
function applyRow(a, review, bulk) {
  const ministerApprover = cur.role === 'minister' && a.dept === cur.dept && !isMinisterApplicant(a);
  const canReview = allPower() || ministerApprover;
  const pending = ['待审核', '审核中', '待分派', '处理中'].includes(a.status);
  const stage0 = (a.stage || 0) === 0;
  const terminalRejected = ['已驳回', '已撤回', '已作废'].includes(a.status);
  const bulkEligible = !!(bulk && review && pending && typeof canApprove === 'function' && canApprove(a));
  const checkCell = bulkEligible ? `<td><input type="checkbox" class="review-check" data-review-check="${a.id}"></td>` : (bulk ? '<td></td>' : '');
  const withdrawable = !review && stage0 && pending;
  const deletable = !review && (stage0 || terminalRejected);
  const editable = !review && ['已驳回', '草稿'].includes(a.status);
  const ops = [];
  ops.push(`<button class="link-btn" data-apply-view="${a.id}">查看</button>`);
  if (editable) {
    ops.push(`<button class="link-btn" data-apply-edit="${a.id}">${a.status === '草稿' ? '继续编辑' : '重新编辑'}</button>`);
  }
  if (withdrawable) {
    ops.push(`<button class="link-btn del" data-apply-cancel="${a.id}">撤回</button>`);
  }
  if (deletable) {
    ops.push(`<button class="link-btn del" data-apply-del="${a.id}">删除</button>`);
  }
  if (review && canReview && pending) {
    ops.push(`<button class="link-btn" data-apply-pass="${a.id}">通过</button>`);
    ops.push(`<button class="link-btn del" data-apply-reject="${a.id}">驳回</button>`);
  }
  const who = review ? `<td><strong>${esc(a.name)}</strong><div class="cell-sub">${esc(a.sno)}</div></td>` : '<td></td>';
  return `<tr>${checkCell}${who}<td><span class="badge blue">${esc(a.typeName)}</span></td><td>${esc(a.dept)}</td><td class="nowrap">${esc(a.date)}</td><td>${badge(a.status)}</td><td><span class="cell-sub">${applyTrackHtml(a)}</span></td><td><div class="row-actions">${ops.join('')}</div></td></tr>`;
}

function bindApplyView() {
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
        const cfg = APPLY_TYPES[a.type] || {};
        const labelMap = {};
        (cfg.fields || []).forEach((f) => { labelMap[f.key] = f.label; });
        rowsHtml = Object.entries(v).map(([k, val]) => {
          if (/Data$/.test(k)) return '';
          const label = labelMap[k] || k;
          const dataKey = k + 'Data';
          let inner = esc(val || '—');
          if (val && v[dataKey]) inner = `<button class="link-btn" data-apply-file="${a.id}" data-fkey="${k}">${esc(val)}</button>`;
          return `<div><span>${esc(label)}</span><strong>${inner}</strong></div>`;
        }).join('');
      }
      const track = (a.track || []).map((t) => `<div class="perm-item"><span class="dot"></span><div>${esc(t.time)} · ${esc(t.action)} · ${esc(t.actor)}（${esc(t.role)}）${t.note ? '：' + esc(t.note) : ''}</div></div>`).join('');
      const isOwner = a.name === cur.name;
      const approved = a.status === '已通过' && !!a.proofNo;
      const canArchive = allPower() || ['presidium', 'minister', 'teacher'].includes(cur.role);
      let actionHtml = '';
      if (a.type === 'publicLeave') {
        if (approved && isOwner) actionHtml += `<button class="primary-btn" id="plDownload">下载证明</button>`;
        if (approved && canArchive) actionHtml += `<button class="primary-btn light" id="plArchive">导出证明存档</button>`;
        if (approved && (isOwner || cur.role === 'admin')) actionHtml += `<button class="link-btn del" id="plVoid">作废申请</button>`;
      }
      openInfo(a.typeName + ' · ' + a.name, `<div class="info-list">${rowsHtml}</div>${a.certNo ? `<p class="form-hint">证明编号：${esc(a.certNo)}</p>` : ''}${a.proofNo ? `<p class="form-hint">证明编号：${esc(a.proofNo)}（审批通过后表单内容锁定，不可再编辑）</p>` : ''}${actionHtml ? `<div class="row-actions" style="margin-top:12px">${actionHtml}</div>` : ''}<div class="form-hint" style="margin-top:10px">审批流转（可视化）</div>${flowTimelineHtml(a)}<div class="form-hint" style="margin-top:10px">操作记录</div><div class="perm-list">${track || '<div class="perm-item"><span class="dot"></span>暂无轨迹</div>'}</div>`, '提交时间：' + a.date);
      const dl = $('#plDownload'), ar = $('#plArchive'), vd = $('#plVoid');
      if (dl) dl.onclick = () => plFormatPicker(a, false);
      if (ar) ar.onclick = () => plFormatPicker(a, true);
      if (vd) vd.onclick = () => {
        if (!confirm('作废后该证明不可再下载，记录保留归档；信息有误需重新提交新申请。确定作废这条申请？')) return;
        a.status = '已作废'; a.locked = true;
        a.track.push({ actor: cur.name, role: ROLE_NAMES[cur.role], action: '作废申请', note: '证明作废，归档保留', time: today() });
        commit('作废公假证明', `${a.proofNo} · ${a.name}`); save(); closeModal(); render(); toast('申请已作废，记录归档');
      };
      document.querySelectorAll('[data-apply-file]').forEach((b) => {
        b.onclick = () => {
          const rec = db.applies.find((x) => x.id === b.dataset.applyFile);
          if (!rec) return;
          const dk = b.dataset.fkey + 'Data';
          const url = (rec.values && rec.values[dk]) || '';
          const name = (rec.values && rec.values[b.dataset.fkey]) || '附件';
          if (!url) { toast('附件内容缺失'); return; }
          try {
            const arr = String(url).split(',');
            const mime = (arr[0].match(/data:([^;]+)/) || [, 'application/octet-stream'])[1];
            const bin = atob(arr[1] || '');
            const buf = new Uint8Array(bin.length);
            for (let i = 0; i < bin.length; i += 1) buf[i] = bin.charCodeAt(i);
            downloadBlob(new Blob([buf], { type: mime }), name);
            commit('下载申请附件', `${rec.typeName} · ${rec.name}`);
          } catch (e) { toast('附件解析失败'); }
        };
      });
    };
  });
  /* 申请事宜汇总：主席团、管理员可删除任意申请记录 */
  document.querySelectorAll('[data-apply-summary-del]').forEach((b) => {
    b.onclick = () => {
      const a = db.applies.find((x) => x.id === b.dataset.applySummaryDel);
      if (!a) return;
      if (!confirm(`确定删除「${a.typeName} · ${a.name}」？删除后记录不可恢复。`)) return;
      db.applies = db.applies.filter((x) => x.id !== a.id);
      commit('删除申请', `${a.typeName} · ${a.name}`); save(); render(); toast('申请已删除');
    };
  });
}

/* 申请事宜汇总：按事项查看申请人与审批轨迹；部长团仅看本部门（秘书部除外），主席团/指导教师/管理员查看全部 */
let summaryTypeFilter = '全部';
let summaryStatusFilter = '全部';
let summaryDeptFilter = '全部';
let reviewTypeFilter = '全部';
let reviewDeptFilter = '全部';
let reviewStatusFilter = '全部';
/* 待我审批组合筛选判定（app6 重绘待办行时复用同一口径） */
function reviewMatchFilter(a) {
  if (reviewTypeFilter !== '全部' && a.typeName !== reviewTypeFilter) return false;
  if (reviewDeptFilter !== '全部' && a.dept !== reviewDeptFilter) return false;
  if (reviewStatusFilter !== '全部' && a.status !== reviewStatusFilter) return false;
  return true;
}
function renderApplySummary() {
  db.applies = db.applies || [];
  const seeAll = allPower() || (cur.role === 'minister' && cur.dept === '秘书部');
  const inScope = (a) => seeAll || (cur.role === 'minister' && a.dept === cur.dept);
  const list = db.applies.filter(inScope);
  const typeNames = ['全部', ...Array.from(new Set(list.map((a) => a.typeName)))];
  const STATUS_ORDER = ['待审核', '审核中', '待分派', '处理中', '已通过', '已驳回', '已撤回', '已作废', '已撤销'];
  const statusNames = ['全部', ...STATUS_ORDER.filter((s) => list.some((a) => a.status === s)), ...Array.from(new Set(list.map((a) => a.status))).filter((s) => !STATUS_ORDER.includes(s))];
  const deptNames = ['全部', ...Array.from(new Set(list.map((a) => a.dept).filter(Boolean)))];
  if (!typeNames.includes(summaryTypeFilter)) summaryTypeFilter = '全部';
  if (!statusNames.includes(summaryStatusFilter)) summaryStatusFilter = '全部';
  if (!deptNames.includes(summaryDeptFilter)) summaryDeptFilter = '全部';
  let shown = list;
  if (summaryTypeFilter !== '全部') shown = shown.filter((a) => a.typeName === summaryTypeFilter);
  if (summaryStatusFilter !== '全部') shown = shown.filter((a) => a.status === summaryStatusFilter);
  if (summaryDeptFilter !== '全部') shown = shown.filter((a) => a.dept === summaryDeptFilter);
  const scopeText = seeAll ? '可查看全部部门申请' : `仅可查看本部门（${esc(cur.dept)}）申请`;
  const optHtml = typeNames.map((t) => `<option ${t === summaryTypeFilter ? 'selected' : ''}>${esc(t)}</option>`).join('');
  const statusOptHtml = statusNames.map((t) => `<option ${t === summaryStatusFilter ? 'selected' : ''}>${esc(t)}</option>`).join('');
  const deptOptHtml = deptNames.map((t) => `<option ${t === summaryDeptFilter ? 'selected' : ''}>${esc(t)}</option>`).join('');
  const canDel = ['admin', 'presidium'].includes(cur.role);
  const colSpan = canDel ? 9 : 8;
  const rows = shown.slice().reverse().map((a) => {
    const flow = applyStages(a).join(' → ');
    const ops = [`<button class="link-btn" data-apply-view="${a.id}">查看</button>`];
    if (canUndoApproval(a)) ops.push(`<button class="link-btn del" data-apply-undo="${a.id}">撤销审批</button>`);
    if (canDel) ops.push(`<button class="link-btn del" data-apply-summary-del="${a.id}">删除</button>`);
    const checkCell = canDel ? `<td><input type="checkbox" class="summary-check" data-apply-check="${a.id}"></td>` : '';
    return `<tr>
      ${checkCell}
      <td><strong>${esc(a.name)}</strong><div class="cell-sub">${esc(a.sno)}</div></td>
      <td><span class="badge blue">${esc(a.typeName)}</span></td>
      <td>${esc(a.dept)}</td>
      <td>${esc(a.title || '成员')}</td>
      <td class="nowrap">${esc(a.date)}</td>
      <td>${badge(a.status)}</td>
      <td><div class="cell-sub">${esc(flow)}</div><div class="cell-sub">${esc(applyTrackHtml(a))}</div></td>
      <td><div class="row-actions">${ops.join('')}</div></td>
    </tr>`;
  }).join('');
  const headCheck = canDel ? '<th style="width:38px"><input type="checkbox" id="summaryCheckAll"></th>' : '';
  const bulkBtn = canDel ? '<button class="primary-btn light del" id="summaryBulkDel" disabled>批量删除（0）</button>' : '';
  const bulkPdfBtn = canDel ? '<button class="primary-btn light" id="summaryBulkPdf" disabled>批量导出 PDF（0）</button>' : '';
  $('#views').innerHTML = `
    <div class="card">
      <div class="card-head">
        <div><h2>申请事宜汇总</h2><div class="sub">${scopeText}；共 ${shown.length} 条申请，可按事项 / 部门 / 状态组合筛选，审批流程与轨迹全程留痕</div></div>
        <div class="toolbar" style="display:flex;gap:10px;align-items:flex-end;flex-wrap:wrap">
          ${bulkBtn}
          ${bulkPdfBtn}
          <div class="field" style="min-width:180px"><label>申请事项</label><select id="summaryType">${optHtml}</select></div>
          <div class="field" style="min-width:150px"><label>部门</label><select id="summaryDept">${deptOptHtml}</select></div>
          <div class="field" style="min-width:150px"><label>状态</label><select id="summaryStatus">${statusOptHtml}</select></div>
        </div>
      </div>
      <div class="table-wrap"><table>
        <thead><tr>${headCheck}<th>申请人</th><th>申请事项</th><th>部门</th><th>职务</th><th>提交时间</th><th>状态</th><th>审批流程 / 轨迹</th><th>操作</th></tr></thead>
        <tbody>${rows || `<tr><td colspan="${colSpan}" class="empty">暂无申请记录</td></tr>`}</tbody>
      </table></div>
    </div>`;
  const sel = $('#summaryType');
  if (sel) sel.onchange = () => { summaryTypeFilter = sel.value; render(); };
  const deptSel = $('#summaryDept');
  if (deptSel) deptSel.onchange = () => { summaryDeptFilter = deptSel.value; render(); };
  const statusSel = $('#summaryStatus');
  if (statusSel) statusSel.onchange = () => { summaryStatusFilter = statusSel.value; render(); };
  if (canDel) {
    const checks = () => [...document.querySelectorAll('.summary-check')];
    const updateBulk = () => {
      const checked = document.querySelectorAll('.summary-check:checked');
      const n = checked.length;
      const btn = $('#summaryBulkDel');
      if (btn) { btn.textContent = `批量删除（${n}）`; btn.disabled = n === 0; }
      const pdfBtn = $('#summaryBulkPdf');
      if (pdfBtn) { pdfBtn.textContent = `批量导出 PDF（${n}）`; pdfBtn.disabled = n === 0; }
      const all = $('#summaryCheckAll');
      if (all) all.checked = n > 0 && n === checks().length;
    };
    const allBox = $('#summaryCheckAll');
    if (allBox) allBox.onchange = () => { checks().forEach((c) => { c.checked = allBox.checked; }); updateBulk(); };
    checks().forEach((c) => { c.onchange = updateBulk; });
    const bulk = $('#summaryBulkDel');
    if (bulk) bulk.onclick = () => {
      const ids = checks().filter((c) => c.checked).map((c) => c.dataset.applyCheck);
      if (!ids.length) { toast('请先勾选要删除的申请'); return; }
      if (!confirm(`确定删除选中的 ${ids.length} 条申请？删除后记录不可恢复。`)) return;
      const removed = db.applies.filter((a) => ids.includes(a.id));
      db.applies = db.applies.filter((a) => !ids.includes(a.id));
      commit('批量删除申请', `删除 ${removed.length} 条：` + removed.map((a) => `${a.typeName}·${a.name}`).join('、'));
      save(); render(); toast(`已删除 ${ids.length} 条申请`);
    };
    const bulkPdf = $('#summaryBulkPdf');
    if (bulkPdf) bulkPdf.onclick = () => {
      const ids = checks().filter((c) => c.checked).map((c) => c.dataset.applyCheck);
      batchExportApplyPdf(ids);
    };
  }
  bindApplyView();
}

function renderJoin() {
  db.applies = db.applies || [];
  const mine = db.applies.filter((a) => a.name === cur.name);
  const pending = db.applies.filter((a) => ['待审核', '审核中', '待分派', '处理中'].includes(a.status));
  const canReview = allPower() || cur.role === 'minister';
  const reviewBase = cur.role === 'minister' ? pending.filter((a) => a.dept === cur.dept && !isMinisterApplicant(a)) : pending;
  const reviewTypeNames = ['全部', ...Array.from(new Set(reviewBase.map((a) => a.typeName)))];
  const reviewDeptNames = ['全部', ...Array.from(new Set(reviewBase.map((a) => a.dept).filter(Boolean)))];
  const reviewStatusNames = ['全部', ...Array.from(new Set(reviewBase.map((a) => a.status)))];
  if (!reviewTypeNames.includes(reviewTypeFilter)) reviewTypeFilter = '全部';
  if (!reviewDeptNames.includes(reviewDeptFilter)) reviewDeptFilter = '全部';
  if (!reviewStatusNames.includes(reviewStatusFilter)) reviewStatusFilter = '全部';
  let reviewList = reviewBase.filter(reviewMatchFilter);
  const reviewTypeOpts = reviewTypeNames.map((t) => `<option ${t === reviewTypeFilter ? 'selected' : ''}>${esc(t)}</option>`).join('');
  const reviewDeptOpts = reviewDeptNames.map((t) => `<option ${t === reviewDeptFilter ? 'selected' : ''}>${esc(t)}</option>`).join('');
  const reviewStatusOpts = reviewStatusNames.map((t) => `<option ${t === reviewStatusFilter ? 'selected' : ''}>${esc(t)}</option>`).join('');
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
      <div class="card-head">
        <div><h2>待我审批</h2><div class="sub">共 ${reviewList.length} 条待处理申请；可按事项 / 部门 / 状态组合筛选，仅当前节点有权审批的记录可勾选批量操作</div></div>
        <div class="toolbar" style="display:flex;gap:10px;align-items:flex-end;flex-wrap:wrap">
          <button class="primary-btn light" id="reviewExport">导出列表</button>
          <button class="primary-btn light del" id="reviewBulkReject" disabled>批量驳回（0）</button>
          <button class="primary-btn" id="reviewBulkPass" disabled>批量通过（0）</button>
          <div class="field" style="min-width:180px"><label>申请事项</label><select id="reviewType">${reviewTypeOpts}</select></div>
          <div class="field" style="min-width:150px"><label>部门</label><select id="reviewDept">${reviewDeptOpts}</select></div>
          <div class="field" style="min-width:150px"><label>状态</label><select id="reviewStatus">${reviewStatusOpts}</select></div>
        </div>
      </div>
      <div class="table-wrap"><table>
        <thead><tr><th style="width:38px"><input type="checkbox" id="reviewCheckAll"></th><th>申请人</th><th>类型</th><th>部门</th><th>提交时间</th><th>状态</th><th>轨迹</th><th>操作</th></tr></thead>
        <tbody>${reviewList.length ? reviewList.slice().reverse().map((a) => applyRow(a, true, true)).join('') : '<tr><td colspan="8" class="empty">暂无待审批申请</td></tr>'}</tbody>
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
            <td><div class="row-actions"><button class="link-btn" data-apply-view="${a.id}">查看</button>${cur.role === 'presidium' ? `<button class="link-btn del" data-archive-del="${a.id}">删除</button>` : ''}</div></td></tr>`).join('') : '<tr><td colspan="7" class="empty">暂无已终审公假证明</td></tr>'}</tbody>
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
              ? `<button class="link-btn" data-join-pass="${j.id}">通过</button><button class="link-btn del" data-join-reject="${j.id}">驳回</button>` : ''}
              ${cur.role === 'admin' ? `<button class="link-btn del" data-join-del="${j.id}">删除</button>` : ''}
              ${!((cur.role === 'minister' || allPower()) && j.status === '待审核') && cur.role !== 'admin' ? '<span class="cell-sub">—</span>' : ''}</div></td></tr>`).join('') : '<tr><td colspan="7" class="empty">暂无入会申请记录</td></tr>'}</tbody>
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

  function applyForm(key, existing) {
    const cfg = APPLY_TYPES[key];
    const isPL = key === 'publicLeave';
    const presetExplain = '活动期间该生将按要求完成活动任务，后续会主动补齐课堂笔记、完成作业，不影响学业。';
    const autoInfo = isPL ? `<div class="info-list" style="margin-bottom:10px">
      <div><span>姓名（自动带出）</span><strong>${esc(cur.name)}</strong></div>
      <div><span>学号（自动带出）</span><strong>${esc(cur.sno || '—')}</strong></div>
      <div><span>专业（自动带出）</span><strong>${esc(cur.major || '—')}</strong></div>
      <div><span>班级（自动带出）</span><strong>${esc(cur.class || '—')}</strong></div>
      <div><span>所属部门（自动带出）</span><strong>${esc(cur.dept || '—')}</strong></div>
    </div>` : '';
    const body = openForm({
      type: key,
      title: existing ? cfg.name + ' · 重新编辑' : cfg.name,
      hint: cfg.hint,
      fields: cfg.fields,
      extra: autoInfo,
      values: Object.assign({ toDept: cur.dept, toTitle: cur.title, targetDept: cur.dept, anonymous: '实名', category: '建议', obey: '是', agree: '否', handoverDone: '是', leaveType: '自愿申请', explanation: presetExplain, phone: cur.phone || '', copiesPurpose: '1 份，用于课程请假备案' }, existing ? existing.values : {}),
      onSubmit(d) {
        if (existing) {
          existing.values = d;
          existing.status = existing.type === 'feedback' ? '待分派' : '待审核';
          existing.stage = 0;
          existing.locked = false;
          existing.track.push({ actor: cur.name, role: ROLE_NAMES[cur.role], action: '修改并重新提交', note: '', time: today() });
          commit('重新编辑申请', `${cfg.name} · ${cur.name}`);
        } else {
          db.applies.push({
            id: uid('ap'), type: key, typeName: cfg.name, name: cur.name, sno: cur.sno || '—', major: cur.major || '—', class: cur.class || '—', dept: cur.dept, title: cur.title, applicantRole: cur.role,
            values: d, date: today(), status: key === 'feedback' ? '待分派' : '待审核', stage: 0, locked: false,
            track: [{ actor: cur.name, role: ROLE_NAMES[cur.role], action: '提交申请', note: '', time: today() }]
          });
          commit('提交申请', `${cfg.name} · ${cur.name}`);
        }
        render(); toast(existing ? '已修改并重新提交，等待审批' : '申请已提交');
      }
    });
  }

  bindApplyView();
  document.querySelectorAll('[data-apply-cancel]').forEach((b) => {
    b.onclick = () => {
      const a = db.applies.find((x) => x.id === b.dataset.applyCancel);
      if (!a) return;
      if ((a.stage || 0) > 0) { toast('该申请已开始审批，不可撤回'); return; }
      if (!confirm('确定撤回这条申请？一级审批人处理后不可再撤回。')) return;
      a.status = '已撤回';
      a.track.push({ actor: cur.name, role: ROLE_NAMES[cur.role], action: '申请人撤回', note: '', time: today() });
      commit('撤回申请', `${a.typeName} · ${a.name}`); save(); render(); toast('申请已撤回');
    };
  });
  document.querySelectorAll('[data-apply-del]').forEach((b) => {
    b.onclick = () => {
      const a = db.applies.find((x) => x.id === b.dataset.applyDel);
      if (!a) return;
      if ((a.stage || 0) > 0) { toast('该申请已开始审批，不可删除'); return; }
      if (!confirm(`确定删除「${a.typeName} · ${a.name}」？删除后记录不可恢复。`)) return;
      db.applies = db.applies.filter((x) => x.id !== a.id);
      commit('删除申请', `${a.typeName} · ${a.name}`); save(); render(); toast('申请已删除');
    };
  });
  document.querySelectorAll('[data-apply-edit]').forEach((b) => {
    b.onclick = () => {
      const a = db.applies.find((x) => x.id === b.dataset.applyEdit);
      if (!a) return;
      if (!['已驳回', '草稿'].includes(a.status)) { toast('仅已驳回或草稿状态的申请可重新编辑'); return; }
      applyForm(a.type, a);
    };
  });
  document.querySelectorAll('[data-archive-del]').forEach((b) => {
    b.onclick = () => {
      const a = db.applies.find((x) => x.id === b.dataset.archiveDel);
      if (!a) return;
      if (!confirm(`确定删除公假证明存档「${a.proofNo || a.name}」？删除后不可恢复。`)) return;
      db.applies = db.applies.filter((x) => x.id !== a.id);
      commit('删除公假证明存档', `${a.proofNo || '—'} · ${a.name}`); save(); render(); toast('存档记录已删除');
    };
  });
  document.querySelectorAll('[data-apply-pass]').forEach((b) => {
    b.onclick = () => {
      const a = db.applies.find((x) => x.id === b.dataset.applyPass);
      const cfg = APPLY_TYPES[a.type];
      const stages = applyStages(a);
      const last = a.stage >= stages.length - 1;
      const stageLabel = stages[a.stage] || '';
      a.track.push({ actor: cur.name, role: ROLE_NAMES[cur.role], action: stageLabel + '通过', note: '', time: today() });
      if (last) { a.status = a.type === 'feedback' ? '已答复' : '已通过'; applyApproved(a); }
      else { a.stage += 1; a.status = a.type === 'feedback' ? '处理中' : '审核中'; }
      notifyStagePass(a, stageLabel, last ? '' : stages[a.stage]);
      commit('审批申请', `${a.typeName} · ${a.name} → ${a.status}`); save(); render(); toast(last ? '申请已通过' : '已流转至下一审批节点');
    };
  });
  document.querySelectorAll('[data-apply-reject]').forEach((b) => {
    b.onclick = () => {
      const a = db.applies.find((x) => x.id === b.dataset.applyReject);
      if (!a) return;
      openRejectForm(a);
    };
  });
  document.querySelectorAll('[data-apply-undo]').forEach((b) => {
    b.onclick = () => {
      const a = db.applies.find((x) => x.id === b.dataset.applyUndo);
      if (!a) return;
      if (!canUndoApproval(a)) { toast('该申请当前节点尚未处理或已终审，不可撤销'); return; }
      undoApproval(a);
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
  document.querySelectorAll('[data-join-del]').forEach((b) => {
    b.onclick = () => {
      const j = db.joinRequests.find((x) => x.id === b.dataset.joinDel);
      if (!j) return;
      if (!confirm(`确定删除入会申请记录「${j.name} → ${j.dept}」？删除后不可恢复。`)) return;
      db.joinRequests = db.joinRequests.filter((x) => x.id !== j.id);
      commit('删除入会申请记录', `${j.name} → ${j.dept}`); save(); render(); toast('入会申请记录已删除');
    };
  });

  /* ---- 待我审批：批量勾选 / 一次签字批量通过 / 列表导出 ---- */
  const reviewChecks = () => [...document.querySelectorAll('.review-check')];
  const reviewAll = $('#reviewCheckAll');
  const reviewBulk = $('#reviewBulkPass');
  const reviewBulkReject = $('#reviewBulkReject');
  const reviewExport = $('#reviewExport');
  const reviewPending = () => db.applies.filter((a) => ['待审核', '审核中', '待分派', '处理中'].includes(a.status));
  const reviewVisible = () => {
    let list = cur.role === 'minister'
      ? reviewPending().filter((a) => a.dept === cur.dept && !isMinisterApplicant(a))
      : reviewPending();
    return list.filter(reviewMatchFilter);
  };
  const updateReviewBulk = () => {
    const checked = document.querySelectorAll('.review-check:checked');
    const n = checked.length;
    if (reviewBulk) { reviewBulk.textContent = `批量通过（${n}）`; reviewBulk.disabled = n === 0; }
    if (reviewBulkReject) { reviewBulkReject.textContent = `批量驳回（${n}）`; reviewBulkReject.disabled = n === 0; }
    if (reviewAll) reviewAll.checked = n > 0 && n === reviewChecks().length;
  };
  reviewChecks().forEach((c) => { c.onchange = updateReviewBulk; });
  if (reviewAll) reviewAll.onchange = () => { reviewChecks().forEach((c) => { c.checked = reviewAll.checked; }); updateReviewBulk(); };
  const rType = $('#reviewType');
  if (rType) rType.onchange = () => { reviewTypeFilter = rType.value; render(); };
  const rDept = $('#reviewDept');
  if (rDept) rDept.onchange = () => { reviewDeptFilter = rDept.value; render(); };
  const rStatus = $('#reviewStatus');
  if (rStatus) rStatus.onchange = () => { reviewStatusFilter = rStatus.value; render(); };
  if (reviewBulk) reviewBulk.onclick = () => {
    const ids = reviewChecks().filter((c) => c.checked).map((c) => c.dataset.reviewCheck);
    const eligible = ids.map((id) => db.applies.find((x) => x.id === id)).filter((a) => a && typeof canApprove === 'function' && canApprove(a));
    if (!eligible.length) { toast('选中的记录在当前节点均无权审批'); return; }
    if (eligible.length < ids.length) toast(`已自动排除 ${ids.length - eligible.length} 条当前节点不可审批的记录`);
    openBulkApproveForm(eligible.map((a) => a.id));
  };
  if (reviewBulkReject) reviewBulkReject.onclick = () => {
    const ids = reviewChecks().filter((c) => c.checked).map((c) => c.dataset.reviewCheck);
    const eligible = ids.map((id) => db.applies.find((x) => x.id === id)).filter((a) => a && typeof canApprove === 'function' && canApprove(a));
    if (!eligible.length) { toast('选中的记录在当前节点均无权审批'); return; }
    if (eligible.length < ids.length) toast(`已自动排除 ${ids.length - eligible.length} 条当前节点不可审批的记录`);
    openBulkRejectForm(eligible.map((a) => a.id));
  };
  if (reviewExport) reviewExport.onclick = () => {
    const rows = reviewVisible().map((a) => [a.name, a.sno || '—', a.typeName, a.dept, a.title || '成员', a.date || '', a.status, applyStages(a).join(' → '), applyTrackHtml(a)]);
    openExportPicker('待我审批列表_' + today(), ['申请人', '学号', '申请事项', '部门', '职务', '提交时间', '状态', '审批流程', '审批轨迹'], rows);
  };
}

/* ---- 批量审批弹窗：一次手写签字 / 意见，应用到全部选中记录 ---- */
function openBulkApproveForm(ids) {
  let signFile = '';
  let canvasDirty = false;
  const body = openForm({
    title: `批量通过（${ids.length} 条）`,
    hint: '同一份手写签字与审批意见将分别写入选中每条申请的审批轨迹和签字栏；仅限当前节点有权审批的记录。',
    fields: [
      { key: 'phone', label: '联系电话' },
      { key: 'opinion', label: '审批意见', type: 'textarea' }
    ],
    extra: `<div class="field"><label>手写签字（可直接在线书写，或点“选择文件”上传签字图片）</label>
      <canvas id="apCanvas" width="320" height="120" style="border:1px solid #d9e2ec;border-radius:8px;background:#fff;touch-action:none"></canvas>
      <div class="row-actions" style="margin-top:8px">
        <button type="button" class="link-btn" id="apClear">清除重写</button>
        <input type="file" id="apSign" accept="image/png,image/jpeg,image/jpg" class="file-input">
      </div></div>`,
    onSubmit: async (d) => {
      const rawSign = signFile || (canvasDirty ? body.querySelector('#apCanvas').toDataURL('image/png') : '');
      if (!rawSign) { toast('请先手写签字或上传签字图片'); return; }
      const signData = await shrinkImageDataUrl(rawSign, 480, 70);
      let passed = 0, advanced = 0;
      ids.forEach((id) => {
        const a = db.applies.find((x) => x.id === id);
        if (!a || typeof canApprove !== 'function' || !canApprove(a)) return;
        const stages = applyStages(a);
        const label = stages[a.stage] || '审批';
        const last = a.stage >= stages.length - 1;
        const signs = (a.approveSigns = a.approveSigns || []);
        signs.push({ sign: signData, phone: d.phone || '', opinion: d.opinion || '', actor: cur.name, role: ROLE_NAMES[cur.role], action: label, time: today() });
        if (a.stage === 0) { a.signMinister = signData; a.phoneMinister = d.phone || ''; }
        else { a.signChair = signData; a.phoneChair = d.phone || ''; }
        const note = (d.phone ? '电话：' + d.phone : '') + (d.opinion ? '；意见：' + d.opinion : '');
        a.track.push({ actor: cur.name, role: ROLE_NAMES[cur.role], action: label + '通过', note, time: today() });
        if (last) { a.status = a.type === 'feedback' ? '已答复' : '已通过'; applyApproved(a); passed += 1; }
        else { a.stage += 1; a.status = a.type === 'feedback' ? '处理中' : '审核中'; advanced += 1; }
        notifyStagePass(a, label, last ? '' : (stages[a.stage] || ''));
      });
      commit('批量审批申请', `终审通过 ${passed} 条、流转下一节点 ${advanced} 条，共处理 ${passed + advanced} 条`);
      save(); render();
      toast(`已批量处理：终审通过 ${passed} 条，流转下一节点 ${advanced} 条`);
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
    if (f.size > 1024 * 1024) { toast('签字图片请控制在 1MB 以内'); return; }
    const rd = new FileReader();
    rd.onload = async () => { signFile = await shrinkImageDataUrl(rd.result, 480, 70); };
    rd.readAsDataURL(f);
  };
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
        db.accounts.push({ username: d.username, password: d.password, pwdAt: new Date().toISOString(), name: d.name, role, dept: deptName, title: d.title, sno: d.sno || '', class: d.class || '', phone: d.phone || '', gender: d.gender, ethnicity: d.ethnicity || '汉族', politics: d.politics });
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
          a.pwdAt = new Date().toISOString();
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
      db.accounts.push({ username, password, pwdAt: new Date().toISOString(), name, role, dept: deptName, title: titleName, sno: profile.sno, class: profile.class, phone: profile.phone, gender: profile.gender, ethnicity: profile.ethnicity, politics: profile.politics });
      let mem = db.members.find((m) => m.account === username) || db.members.find((m) => m.sno === profile.sno && m.name === name);
      if (mem) Object.assign(mem, profile, { title: titleName, account: username, status: mem.status || '在任' });
      else db.members.push(Object.assign({ id: uid('m'), account: username, title: titleName, status: '在任', joined: today() }, profile));
      added++;
    }
  });
  return { added, updated, skipped, messages };
}
