/* 常量与字典：与网页端 data.js / app.js 口径保持一致 */
const SYSTEM = {
  school: '云南工业信息职业学院',
  dept: '应用经济系',
  name: '应用经济系学生会管理系统',
  full: '云南工业信息职业学院应用经济系学生会管理系统'
};

const ROLE_NAMES = {
  admin: '管理员',
  teacher: '责任教师',
  presidium: '主席团',
  minister: '部长团',
  student: '普通学生'
};

const DEPTS = ['主席团', '秘书部', '宣传部', '文体部', '权益服务部'];
const TITLES = ['主席', '副主席', '部长', '副部长', '干事', '成员'];

const MENU = {
  admin: [
    ['dashboard', '工作台'], ['activity', '活动审批'], ['personnel', '人事管理'],
    ['dept', '部门审核'], ['assess', '考核管理'], ['notice', '通知管理'],
    ['leave', '请假审批'], ['applies', '我的申请'], ['review', '待我审批'],
    ['summary', '申请汇总'], ['collect', '信息收集'], ['event', '活动报名'],
    ['logs', '操作日志'], ['profile', '个人信息']
  ],
  presidium: [
    ['dashboard', '工作台'], ['activity', '活动审批'], ['personnel', '人事管理'],
    ['dept', '部门管理'], ['assess', '考核管理'], ['notice', '通知管理'],
    ['leave', '请假管理'], ['applies', '我的申请'], ['review', '待我审批'],
    ['summary', '申请汇总'], ['collect', '信息收集'], ['event', '活动报名'],
    ['profile', '个人信息']
  ],
  minister: [
    ['dashboard', '工作台'], ['dept', '部门信息'], ['activity', '活动管理'],
    ['assess', '成员考核'], ['leave', '请假管理'], ['applies', '我的申请'],
    ['review', '待我审批'], ['summary', '申请汇总'], ['notice', '通知管理'],
    ['collect', '信息收集'], ['event', '活动报名'], ['profile', '个人信息']
  ],
  student: [
    ['dashboard', '工作台'], ['dept', '部门信息'], ['applies', '我的申请'],
    ['notice', '通知公告'], ['leave', '我的请假'], ['event', '活动报名'],
    ['collect', '信息上传'], ['profile', '个人信息']
  ]
};
MENU.teacher = MENU.admin.slice();

function tone(status) {
  const s = String(status || '');
  if (['已通过', '在任', '已发布', '正常', '在库', '进行中', '报名中', '已答复', '已关闭', '已归档'].includes(s)) return 'green';
  if (['待审核', '待审批', '待责任教师审核', '待主席团审核', '待教师审核', '待主席审核', '待副主席审核', '待分派', '处理中', '审核中', '借出'].includes(s)) return 'amber';
  if (['已驳回', '已罢免', '离任', '已截止', '已退会', '已撤回', '已撤销', '已作废'].includes(s)) return 'red';
  if (s === '草稿') return 'gray';
  return 'gray';
}

const ASSESS_DIMS = [
  { key: 'attend', name: '出勤', max: 30 },
  { key: 'task', name: '工作任务', max: 40 },
  { key: 'disc', name: '思想纪律', max: 15 },
  { key: 'peer', name: '群众评价', max: 15 }
];

const APPLY_NAMES = {
  adjust: '部门调整申请', transfer: '部门调动申请', leaveclub: '退会申请',
  feedback: '意见反馈与诉求', report: '述职申请', election: '换届竞选报名',
  cert: '任职证明申请', volunteer: '志愿服务认定申请', publicLeave: '活动公假证明申请'
};

function gradeOf(score) {
  const s = Number(score) || 0;
  if (s >= 90) return '优秀';
  if (s >= 80) return '良好';
  if (s >= 60) return '合格';
  return '不合格';
}

module.exports = { SYSTEM, ROLE_NAMES, DEPTS, TITLES, MENU, tone, ASSESS_DIMS, gradeOf, APPLY_NAMES };
