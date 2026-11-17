/* 云南工业信息职业学院应用经济系学生会管理系统 —— 数据层 */
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

const ACCOUNTS = [
  { username: 'admin', password: '123456', name: '系统管理员', role: 'admin', dept: '系统', title: '管理员', sno: '—', class: '—', phone: '', gender: '—', ethnicity: '汉族', politics: '系统' },
  { username: 'teacher', password: '123456', name: '指导教师', role: 'teacher', dept: '系统', title: '责任教师', sno: '—', class: '—', phone: '', gender: '—', ethnicity: '汉族', politics: '系统' }
];

const SEED = {
  accounts: ACCOUNTS,

  /* 成员台账：初始化默认为空表，真实成员由信息收集解析或手工导入建立 */
  members: [],

  /* ① 部门信息表 */
  departments: [
    { id: 'd1', name: '主席团', leader: '吴雪枫', desc: '统筹全系学生会工作，审批活动与部门事务，负责对外联络。', status: '正常' },
    { id: 'd2', name: '秘书部', leader: '孙嘉禾', desc: '会议记录、档案管理、制度汇编与跨部门协调。', status: '正常' },
    { id: 'd3', name: '宣传部', leader: '陈雨桐', desc: '海报设计、公众号运营、活动影像记录。', status: '正常' },
    { id: 'd4', name: '文体部', leader: '王槿榆', desc: '文艺体育活动组织、赛事策划与日常文体活动开展。', status: '正常' },
    { id: 'd5', name: '权益服务部', leader: '赵一鸣', desc: '学生权益维护、意见反馈、文体活动组织。', status: '正常' }
  ],

  /* ② 部门申请表（主席团提交 → 责任教师审核） */
  deptRequests: [],

  /* ③ 活动信息表 */
  activities: [],

  notices: [],

  /* ⑦ 请假表 */
  leaves: [],

  /* ⑧ 考核表 */
  assessments: [],

  /* ⑤ 加入申请 */
  joinRequests: [],

  personnel: [],

  /* 我的申请：部门调整/调动、退会、意见反馈、述职、换届竞选、任职证明、志愿认定等通用台账 */
  applies: [],

  /* 证明模板：主席团/管理员维护，导出时按占位符回填 */
  templates: {
    publicLeave: {
      title: '应用经济系学生会证明',
      body: '兹有{专业}专业{班级}班学生{姓名}，学号：{学号}，是我系学生会{所属部门}{职务}，于{活动起止时间}在{活动地点}参加「{活动名称}」活动。\n因参加本次活动，需请假课程为：{请假课程及日期}。\n活动期间该生将按要求完成活动任务，后续会主动补齐课堂笔记、完成作业，不影响学业。{申请说明}\n特此证明。'
    }
  },

  /* 线上信息收集（记录由后台按需发布，默认不预置演示数据） */
  collects: [],

  /* 线上活动报名 */
  events: [],

  /* 操作日志 */
  logs: [],

  /* 附加模块 */
  sessions: [],
  assets: []
};
