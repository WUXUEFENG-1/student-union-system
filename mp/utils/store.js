/* 业务规则：角色映射、权限判定、审批链、轨迹与消息，口径与网页端一致 */
const { ROLE_NAMES, MENU, APPLY_NAMES } = require('./const');
const api = require('./api');

function g() { return getApp().globalData; }

function today() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

function uid(p) {
  return p + Date.now().toString(36).slice(-4) + Math.random().toString(36).slice(2, 4);
}

function typeName(a) { return a.typeName || APPLY_NAMES[a.type] || '申请'; }

function roleFromTitle(title) {
  if (['主席', '副主席'].includes(title)) return 'presidium';
  if (['部长', '副部长'].includes(title)) return 'minister';
  return 'student';
}

function normalizeTitle(raw) {
  const t = String(raw || '').trim();
  if (/副主席/.test(t)) return '副主席';
  if (/主席/.test(t)) return '主席';
  if (/副部长/.test(t)) return '副部长';
  if (/部长/.test(t)) return '部长';
  if (/成员|干事/.test(t)) return '成员';
  return t || '成员';
}

function matchMember(db, acc) {
  return (db.members || []).find((m) => m.account === acc.username)
    || (db.members || []).find((m) => m.name === acc.name && (m.sno === acc.sno || acc.sno === '—' || m.sno === '—'))
    || (db.members || []).find((m) => m.sno === acc.sno && acc.sno !== '—');
}

function normalize(db) {
  (db.accounts || []).forEach((a) => {
    a.gender = a.gender || ''; a.ethnicity = a.ethnicity || '汉族'; a.politics = a.politics || '';
    a.account = a.account || a.username;
    const mem = matchMember(db, a);
    if (mem) {
      mem.account = mem.account || a.username;
      if (mem.title) a.title = mem.title;
      if (mem.dept) a.dept = mem.dept;
      ['gender', 'ethnicity', 'politics', 'class', 'major', 'phone', 'sno'].forEach((k) => {
        if (mem[k] && mem[k] !== '—') a[k] = mem[k];
      });
    }
    if (!['admin', 'teacher'].includes(a.role)) a.role = roleFromTitle(a.title);
  });
  return db;
}

function allPower() { const { cur } = g(); return cur && ['admin', 'teacher', 'presidium'].includes(cur.role); }
function isPublisher() { const { cur } = g(); return cur && ['admin', 'teacher', 'presidium', 'minister'].includes(cur.role); }

function log(action, detail) {
  const { db } = g();
  db.logs = db.logs || [];
  const { cur } = g();
  db.logs.unshift({
    id: uid('g'),
    time: new Date().toLocaleString('zh-CN', { hour12: false }),
    user: cur ? cur.name : '系统',
    role: cur ? ROLE_NAMES[cur.role] : '系统',
    action, detail: detail || ''
  });
  if (db.logs.length > 300) db.logs.length = 300;
}

function commit(action, detail) {
  log(action, detail);
  api.saveState(g().db);
}

/* 申请链：部长/副部长申请人固定走 副主席 → 主席；其余走类型默认链 */
function isMinisterApplicant(a) {
  return a.applicantRole === 'minister' || ['部长', '副部长'].includes(a.title);
}
function applyStages(a) {
  const cfg = APPLY_STAGES[a.type] || [];
  if (isMinisterApplicant(a)) return ['副主席审核', '主席审核'];
  return (Array.isArray(a.flow) && a.flow.length) ? a.flow : cfg;
}
const APPLY_STAGES = {
  adjust: ['原部门负责人', '目标部门负责人', '主席团'],
  transfer: ['原部门负责人', '目标部门负责人', '主席团'],
  leaveclub: ['部长', '主席团'],
  feedback: ['主席团分派', '部门负责人回复'],
  report: ['主席团查阅归档'],
  election: ['主席团资格预审', '责任老师终审'],
  cert: ['主席团审核'],
  volunteer: ['部长初审', '主席团复核'],
  publicLeave: ['部长审核', '主席团审核确认签字']
};

function isSelf(a) {
  const { cur } = g();
  if (!cur || !a) return false;
  if (a.sno && cur.sno) return String(a.sno) === String(cur.sno);
  return a.name === cur.name && (!a.dept || !cur.dept || a.dept === cur.dept);
}

const RESIGN_NODES = {
  '副部长审核': { role: 'minister', title: '副部长' },
  '部长审核': { role: 'minister', title: '部长' },
  '副主席审核': { role: 'presidium', title: '副主席' },
  '主席审核': { role: 'presidium', title: '主席' },
  '责任教师审核': { role: 'teacher', title: '责任教师' }
};

/* 审批权限：节点岗位严格限定，不可跨级代审（与网页端 app6 对齐） */
function canApprove(a) {
  const { cur } = g();
  if (!cur) return false;
  if (isSelf(a)) return false;
  if (cur.role === 'admin') return true;

  if (a.type === 'leaveclub') {
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
    const node = RESIGN_NODES[a.flow[a.stage]];
    if (node) {
      if (node.role === 'teacher') return cur.role === 'teacher';
      if (node.role === 'minister') return cur.role === 'minister' && cur.title === node.title && cur.dept === a.dept;
      if (node.role === 'presidium') return cur.title === node.title;
      return false;
    }
    if (cur.role === 'minister') return a.stage === 0 && cur.dept === a.dept;
    if (cur.role === 'presidium') return a.stage === 1;
    return false;
  }
  // 通用类型：按 applyStages 实际节点匹配
  const nodes = applyStages(a);
  const node = nodes[a.stage] || '';
  const t = cur.title || '';
  if (/副主席/.test(node)) return cur.role === 'presidium' && t === '副主席';
  if (/主席审核|主席复核|主席$/.test(node) && !/主席团/.test(node)) return cur.role === 'presidium' && t === '主席';
  if (/主席|主席团/.test(node)) return cur.role === 'presidium';
  if (/责任教师|责任老师/.test(node)) return cur.role === 'teacher';
  if (/部长|副部长|负责人|初审/.test(node)) return cur.role === 'minister' && cur.dept === a.dept;
  return false;
}

const PENDING_STATUS = ['待审核', '审核中', '待分派', '处理中', '待审批'];

const LEAVE_REVIEWER = { presidium: '责任教师', minister: '主席团', student: '部长/副部长' };

function canReviewLeave(l) {
  if (l.status !== '待审核') return false;
  const map = { teacher: '责任教师', presidium: '主席团', minister: '部长/副部长' };
  return map[g().cur.role] === l.reviewer;
}

function myReviewApplies() {
  const { db } = g();
  return (db.applies || []).filter((x) => {
    if (!PENDING_STATUS.includes(x.status)) return false;
    if (isSelf(x)) return false;
    if (curRole() === 'admin') return true;
    if (curRole() === 'minister' && x.dept !== g().cur.dept) return false;
    return canApprove(x);
  });
}

function curRole() { return g().cur ? g().cur.role : ''; }

function sendApplyMsg(a, text, title) {
  const { db } = g();
  db.msgs = db.msgs || [];
  db.msgs.push({
    id: uid('m'), to: a.name, toSno: a.sno || '', title: title || '申请审批进度提醒',
    text, time: today(), read: false
  });
}

function notifyStagePass(a, stageLabel, nextLabel) {
  const name = a.typeName || '申请';
  const msg = nextLabel
    ? `你的「${name}」已通过【${stageLabel}】，现已流转至【${nextLabel}】审批节点。`
    : `你的「${name}」已通过全部审批节点，审批结果为「已通过」。`;
  sendApplyMsg(a, msg);
}

function menuOf(role) { return MENU[role] || MENU.student; }

module.exports = {
  today, uid, typeName, roleFromTitle, normalizeTitle, matchMember, normalize,
  allPower, isPublisher, log, commit, isMinisterApplicant, applyStages,
  isSelf, canApprove, PENDING_STATUS, myReviewApplies, sendApplyMsg,
  notifyStagePass, menuOf, curRole, LEAVE_REVIEWER, canReviewLeave
};
