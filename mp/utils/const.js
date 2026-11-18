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
    ['dashboard', '工作台'], ['applyform', '提交申请'], ['activity', '活动审批'], ['personnel', '人事管理'],
    ['dept', '部门审核'], ['assess', '考核管理'], ['notice', '通知管理'],
    ['leave', '请假审批'], ['applies', '我的申请'], ['review', '待我审批'],
    ['summary', '申请汇总'], ['collect', '信息收集'], ['event', '活动报名'],
    ['attendance', '考勤签到'], ['asset', '物资台账'],
    ['logs', '操作日志'], ['profile', '个人信息']
  ],
  presidium: [
    ['dashboard', '工作台'], ['applyform', '提交申请'], ['activity', '活动审批'], ['personnel', '人事管理'],
    ['dept', '部门管理'], ['assess', '考核管理'], ['notice', '通知管理'],
    ['leave', '请假管理'], ['applies', '我的申请'], ['review', '待我审批'],
    ['summary', '申请汇总'], ['collect', '信息收集'], ['event', '活动报名'],
    ['attendance', '考勤签到'], ['asset', '物资台账'],
    ['profile', '个人信息']
  ],
  minister: [
    ['dashboard', '工作台'], ['applyform', '提交申请'], ['dept', '部门信息'], ['activity', '活动管理'],
    ['assess', '成员考核'], ['leave', '请假管理'], ['applies', '我的申请'],
    ['review', '待我审批'], ['summary', '申请汇总'], ['notice', '通知管理'],
    ['collect', '信息收集'], ['event', '活动报名'],
    ['attendance', '考勤签到'], ['asset', '物资台账'], ['profile', '个人信息']
  ],
  student: [
    ['dashboard', '工作台'], ['applyform', '提交申请'], ['dept', '部门信息'], ['applies', '我的申请'],
    ['notice', '通知公告'], ['leave', '我的请假'], ['event', '活动报名'],
    ['collect', '信息上传'], ['attendance', '考勤签到'], ['profile', '个人信息']
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

const APPLY_TYPES = {
  adjust: { name: '部门调整申请', hint: '在岗成员常规调整所属部门或岗位。', fields: [
    { key: 'toDept', label: '意向调入部门', type: 'select', options: DEPTS },
    { key: 'toTitle', label: '意向岗位', type: 'select', options: TITLES },
    { key: 'reason', label: '调整理由', type: 'textarea', required: true },
    { key: 'handover', label: '原部门待办工作安排', type: 'textarea' },
    { key: 'agree', label: '是否征得原部门初步同意', type: 'select', options: ['是', '否'] },
    { key: 'attach', label: '附件（可选）', type: 'file' }
  ]},
  transfer: { name: '部门调动申请', hint: '面向跨部门人员流动办理。', fields: [
    { key: 'toDept', label: '意向调入部门', type: 'select', options: DEPTS },
    { key: 'toTitle', label: '意向岗位', type: 'select', options: TITLES },
    { key: 'reason', label: '调动理由', type: 'textarea', required: true },
    { key: 'handover', label: '原部门待办工作安排', type: 'textarea' },
    { key: 'agree', label: '是否征得原部门初步同意', type: 'select', options: ['是', '否'] },
    { key: 'attach', label: '附件（可选）', type: 'file' }
  ]},
  leaveclub: { name: '退会申请', hint: '全部通过后终止考核、档案转为只读。', fields: [
    { key: 'leaveType', label: '退会类型', type: 'select', options: ['自愿申请', '其他'] },
    { key: 'reason', label: '退会理由', type: 'textarea', required: true },
    { key: 'handoverDone', label: '是否完成工作交接', type: 'select', options: ['是', '否'] },
    { key: 'handoverNote', label: '交接说明', type: 'textarea' },
    { key: 'attach', label: '附件（可选，交接清单）', type: 'file' },
    { key: 'promise', label: '承诺勾选（填写"已知晓并承诺"）', required: true }
  ]},
  feedback: { name: '意见反馈与诉求', hint: '由主席团分派至对应部门负责人处理并回复。', fields: [
    { key: 'anonymous', label: '提交方式', type: 'select', options: ['实名', '匿名'] },
    { key: 'category', label: '诉求分类', type: 'select', options: ['提案', '投诉', '建议', '求助'] },
    { key: 'title', label: '诉求标题', required: true },
    { key: 'detail', label: '详细内容', type: 'textarea', required: true },
    { key: 'targetDept', label: '指定对接部门', type: 'select', options: DEPTS },
    { key: 'contact', label: '联系方式（匿名模式下隐藏）' },
    { key: 'attach', label: '佐证附件（选填）', type: 'file' }
  ]},
  report: { name: '述职申请', hint: '仅部长团与主席团成员可提交。', visible: ['minister', 'presidium'], fields: [
    { key: 'period', label: '述职学期', required: true },
    { key: 'summary', label: '述职摘要', type: 'textarea', required: true },
    { key: 'reportFile', label: '述职报告（图片/文件，选填）', type: 'file' },
    { key: 'selfEval', label: '工作自评', type: 'textarea' },
    { key: 'plan', label: '后续工作规划', type: 'textarea' }
  ]},
  election: { name: '换届竞选报名', hint: '主席团资格预审 → 责任老师终审。', fields: [
    { key: 'title', label: '竞选岗位', required: true },
    { key: 'manifesto', label: '竞选宣言', type: 'textarea', required: true },
    { key: 'workBrief', label: '学生会工作简述', type: 'textarea' },
    { key: 'awards', label: '评优获奖佐证材料（选填）', type: 'file' },
    { key: 'obey', label: '是否服从岗位调剂', type: 'select', options: ['是', '否'] }
  ]},
  cert: { name: '任职证明申请', hint: '主席团审核；通过后生成唯一编号留存。', fields: [
    { key: 'range', label: '任职起止时间' },
    { key: 'usage', label: '用途', required: true },
    { key: 'copies', label: '申请份数', type: 'number' },
    { key: 'note', label: '备注' }
  ]},
  volunteer: { name: '志愿服务认定申请', hint: '部长初审 → 主席团复核；通过后时长计入档案。', fields: [
    { key: 'activity', label: '志愿活动名称', required: true },
    { key: 'organizer', label: '主办单位', required: true },
    { key: 'period', label: '起止时间', required: true },
    { key: 'hours', label: '总服务时长（小时）', type: 'number', required: true },
    { key: 'brief', label: '活动简介', type: 'textarea' },
    { key: 'proof', label: '证明材料（选填）', type: 'file' }
  ]},
  publicLeave: { name: '活动公假证明申请', hint: '部长审核 → 主席团审核确认签字。', fields: [
    { key: 'activityName', label: '参加活动名称', required: true },
    { key: 'period', label: '活动起止时间', required: true },
    { key: 'place', label: '活动地点', required: true },
    { key: 'courses', label: '请假课程及日期', required: true },
    { key: 'explanation', label: '申请说明', type: 'textarea', required: true },
    { key: 'phone', label: '联系电话', required: true },
    { key: 'copiesPurpose', label: '申请份数与用途', required: true },
    { key: 'attach', label: '活动通知或策划附件（选填）', type: 'file' }
  ]}
};

function gradeOf(score) {
  const s = Number(score) || 0;
  if (s >= 90) return '优秀';
  if (s >= 80) return '良好';
  if (s >= 60) return '合格';
  return '不合格';
}

module.exports = { SYSTEM, ROLE_NAMES, DEPTS, TITLES, MENU, tone, ASSESS_DIMS, gradeOf, APPLY_NAMES, APPLY_TYPES };
