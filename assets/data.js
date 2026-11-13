/* 云南工业信息职业学院应用经济系学生会管理系统 —— 数据层 */
const SYSTEM = {
  school: '云南工业信息职业学院',
  dept: '应用经济系',
  name: '应用经济系学生会管理系统',
  full: '云南工业信息职业学院应用经济系学生会管理系统'
};

const ROLE_NAMES = {
  admin: '管理员',
  presidium: '主席团',
  minister: '部长团',
  student: '普通学生'
};

const DEPTS = ['主席团', '秘书部', '宣传部', '实践部', '权益服务部'];
const TITLES = ['主席', '副主席', '部长', '副部长', '成员'];

const ACCOUNTS = [
  { username: 'admin', password: '123456', name: '系统管理员', role: 'admin', dept: '系统', title: '管理员', sno: '—', class: '—', phone: '', gender: '—', ethnicity: '汉族', politics: '系统' },
  { username: 'president', password: '123456', name: '吴雪枫', role: 'presidium', dept: '主席团', title: '主席', sno: '20240001', class: '2024级计算机网络技术2班', phone: '138****6621', gender: '男', ethnicity: '汉族', politics: '中共预备党员' },
  { username: 'vice', password: '123456', name: '李思远', role: 'presidium', dept: '主席团', title: '副主席', sno: '20240012', class: '2024级大数据技术1班', phone: '139****3308', gender: '男', ethnicity: '汉族', politics: '共青团员' },
  { username: 'minister', password: '123456', name: '陈雨桐', role: 'minister', dept: '宣传部', title: '部长', sno: '20240023', class: '2024级电子商务1班', phone: '137****9915', gender: '女', ethnicity: '汉族', politics: '共青团员' },
  { username: 'vminister', password: '123456', name: '王浩然', role: 'minister', dept: '宣传部', title: '副部长', sno: '20240024', class: '2024级电子商务2班', phone: '135****2210', gender: '男', ethnicity: '汉族', politics: '共青团员' },
  { username: 'student', password: '123456', name: '林小满', role: 'student', dept: '未加入', title: '学生', sno: '20260035', class: '2026级经济管理1班', phone: '138****3321', gender: '女', ethnicity: '汉族', politics: '共青团员' }
];

const SEED = {
  accounts: ACCOUNTS,

  /* ④ 人员信息表 */
  members: [
    { id: 'm1', name: '吴雪枫', sno: '20240001', class: '2024级计算机网络技术2班', dept: '主席团', title: '主席', phone: '138****6621', gender: '男', ethnicity: '汉族', politics: '中共预备党员', status: '在任', joined: '2026-09-01' },
    { id: 'm2', name: '李思远', sno: '20240012', class: '2024级大数据技术1班', dept: '主席团', title: '副主席', phone: '139****3308', gender: '男', ethnicity: '汉族', politics: '共青团员', status: '在任', joined: '2026-09-01' },
    { id: 'm3', name: '孙嘉禾', sno: '20240045', class: '2024级市场营销2班', dept: '秘书部', title: '部长', phone: '188****7610', gender: '女', ethnicity: '汉族', politics: '共青团员', status: '在任', joined: '2026-09-03' },
    { id: 'm4', name: '陈雨桐', sno: '20240023', class: '2024级电子商务1班', dept: '宣传部', title: '部长', phone: '137****9915', gender: '女', ethnicity: '汉族', politics: '共青团员', status: '在任', joined: '2026-09-03' },
    { id: 'm5', name: '王浩然', sno: '20240024', class: '2024级电子商务2班', dept: '宣传部', title: '副部长', phone: '135****2210', gender: '男', ethnicity: '汉族', politics: '共青团员', status: '在任', joined: '2026-09-03' },
    { id: 'm6', name: '黄婉清', sno: '20240067', class: '2024级连锁经营管理1班', dept: '实践部', title: '部长', phone: '176****0192', gender: '女', ethnicity: '汉族', politics: '共青团员', status: '在任', joined: '2026-09-08' },
    { id: 'm7', name: '赵一鸣', sno: '20240034', class: '2024级会计1班', dept: '权益服务部', title: '部长', phone: '150****2244', gender: '男', ethnicity: '汉族', politics: '共青团员', status: '在任', joined: '2026-09-05' },
    { id: 'm8', name: '杨梦洁', sno: '20250052', class: '2025级文秘1班', dept: '宣传部', title: '成员', phone: '156****1102', gender: '女', ethnicity: '汉族', politics: '群众', status: '在任', joined: '2026-09-20' },
    { id: 'm9', name: '马晨阳', sno: '20250041', class: '2025级电子商务2班', dept: '实践部', title: '成员', phone: '152****8877', gender: '男', ethnicity: '汉族', politics: '群众', status: '在任', joined: '2026-09-15' },
    { id: 'm10', name: '刘思彤', sno: '20250063', class: '2025级会计2班', dept: '权益服务部', title: '成员', phone: '189****0921', gender: '女', ethnicity: '汉族', politics: '群众', status: '在任', joined: '2026-09-20' },
    { id: 'm11', name: '何佳颖', sno: '20250033', class: '2025级市场营销1班', dept: '宣传部', title: '成员', phone: '187****3344', gender: '女', ethnicity: '汉族', politics: '群众', status: '在任', joined: '2026-09-15' }
  ],

  /* ① 部门信息表 */
  departments: [
    { id: 'd1', name: '主席团', leader: '吴雪枫', desc: '统筹全系学生会工作，审批活动与部门事务，负责对外联络。', status: '正常' },
    { id: 'd2', name: '秘书部', leader: '孙嘉禾', desc: '会议记录、档案管理、制度汇编与跨部门协调。', status: '正常' },
    { id: 'd3', name: '宣传部', leader: '陈雨桐', desc: '海报设计、公众号运营、活动影像记录。', status: '正常' },
    { id: 'd4', name: '实践部', leader: '黄婉清', desc: '志愿服务、社会实践、校企对接与活动执行。', status: '正常' },
    { id: 'd5', name: '权益服务部', leader: '赵一鸣', desc: '学生权益维护、意见反馈、文体活动组织。', status: '正常' }
  ],

  /* ② 部门申请表（主席团提交 → 管理员审核） */
  deptRequests: [
    { id: 'dr1', type: '新增', dept: '外联部', reason: '新增校企合作与外联事务职能', submitter: '吴雪枫', date: '2026-11-11', status: '待管理员审核' },
    { id: 'dr2', type: '编辑', dept: '实践部', reason: '负责人由黄婉清调整为马晨阳', submitter: '李思远', date: '2026-11-09', status: '已通过' }
  ],

  /* ③ 活动信息表 */
  activities: [
    { id: 'a1', title: '第三届青春杯篮球赛', dept: '权益服务部', collaborators: [{ dept: '宣传部', count: 3 }, { dept: '实践部', count: 6 }], total: 36, start: '2026-11-20 09:00', end: '2026-11-20 17:00', place: '学院篮球场', content: '班级组队参赛，淘汰赛制，设冠亚季军。', status: '已通过', approver: '主席团', reason: '' },
    { id: 'a2', title: '长征精神主题演讲比赛', dept: '宣传部', collaborators: [{ dept: '秘书部', count: 4 }], total: 24, start: '2026-11-25 14:00', end: '2026-11-25 17:30', place: '教学楼报告厅', content: '初赛与决赛两轮，评委由主席团担任。', status: '待审批', approver: '', reason: '' },
    { id: 'a3', title: '国家网络安全宣传周反诈宣传', dept: '宣传部', collaborators: [{ dept: '实践部', count: 5 }], total: 18, start: '2026-11-16 10:00', end: '2026-11-16 16:00', place: '学院广场', content: '反诈知识问答、宣传短片拍摄与志愿者招募。', status: '已通过', approver: '部长团', reason: '' },
    { id: 'a4', title: '新成员业务培训会', dept: '秘书部', collaborators: [], total: 30, start: '2026-11-14 18:30', end: '2026-11-14 20:30', place: '学生会办公室', content: '制度学习、公文写作、办公软件实操。', status: '已驳回', approver: '主席团', reason: '与学院晚课冲突，建议改期' }
  ],

  notices: [
    { id: 'n1', title: '关于举办第三届青春杯篮球赛的通知', type: '活动通知', content: '各班级：系部定于11月20日举办第三届青春杯篮球赛，请各班于18日前完成组队并在活动报名中报名。', date: '2026-11-10', publisher: '主席团', publisherName: '吴雪枫', status: '已发布' },
    { id: 'n2', title: '学生会值班安排调整说明', type: '其他通知', content: '自11月16日起，办公室值班时间调整为每周一至周五 17:30—19:00，请值班部门按时到岗并填写签到表。', date: '2026-11-09', publisher: '主席团', publisherName: '李思远', status: '已发布' },
    { id: 'n3', title: '国家网络安全宣传周志愿者招募', type: '活动通知', content: '宣传周活动需现场志愿者10名，负责反诈知识讲解与短视频拍摄，请在活动报名中报名。', date: '2026-11-06', publisher: '部长团', publisherName: '陈雨桐', status: '已发布' },
    { id: 'n4', title: '关于调整例会时间的通知（已撤回）', type: '其他通知', content: '原定11月7日的全体例会调整至11月8日。', date: '2026-11-05', publisher: '主席团', publisherName: '吴雪枫', status: '已撤回' }
  ],

  /* ⑦ 请假表 */
  leaves: [
    { id: 'l1', applicant: '何佳颖', applicantRole: 'student', dept: '宣传部', type: '病假', start: '2026-11-18', end: '2026-11-19', reason: '发热就医，附校医院诊断证明。', status: '待审核', reviewer: '部长/副部长', reviewNote: '', date: '2026-11-12' },
    { id: 'l2', applicant: '陈雨桐', applicantRole: 'minister', dept: '宣传部', type: '事假', start: '2026-11-21', end: '2026-11-21', reason: '回家参加亲属婚礼。', status: '待审核', reviewer: '主席团', reviewNote: '', date: '2026-11-11' },
    { id: 'l3', applicant: '吴雪枫', applicantRole: 'presidium', dept: '主席团', type: '公假', start: '2026-11-15', end: '2026-11-16', reason: '赴昆明参加省级创新创业大赛答辩。', status: '已通过', reviewer: '管理员', reviewNote: '同意，注意补齐会议记录', date: '2026-11-08' },
    { id: 'l4', applicant: '林小满', applicantRole: 'student', dept: '未加入', type: '事假', start: '2026-11-19', end: '2026-11-19', reason: '参加校内技能等级证书考试。', status: '待审核', reviewer: '部长/副部长', reviewNote: '', date: '2026-11-12' }
  ],

  /* ⑧ 考核表 */
  assessments: [
    { id: 'k1', targetRole: 'presidium', target: '吴雪枫', dept: '主席团', period: '2026 年度', score: 92, comment: '统筹全系学生会工作，活动组织与对外沟通表现突出。', status: '已通过', submitter: '系统管理员', date: '2026-11-10' },
    { id: 'k2', targetRole: 'minister', target: '陈雨桐', dept: '宣传部', period: '2026 年度', score: 88, comment: '宣传物料产出稳定，公众号阅读量提升明显。', status: '已通过', submitter: '吴雪枫', date: '2026-11-09' },
    { id: 'k3', targetRole: 'member', target: '何佳颖', dept: '宣传部', period: '2026 秋季学期', score: 85, comment: '活动参与 5 次，海报任务完成 3 项，质量稳定。', status: '待审核', submitter: '陈雨桐', date: '2026-11-12' }
  ],

  /* ⑤ 加入申请 */
  joinRequests: [
    { id: 'j1', name: '林小满', sno: '20260035', class: '2026级经济管理1班', dept: '宣传部', reason: '会 PS 与视频剪辑，希望参与海报与短视频制作。', date: '2026-11-12', status: '待审核' },
    { id: 'j2', name: '张知远', sno: '20260036', class: '2026级体育运营1班', dept: '实践部', reason: '有志愿服务经验，想参与社会实践活动。', date: '2026-11-10', status: '已通过' }
  ],

  personnel: [
    { id: 'p1', name: '杨梦洁', action: '提升', from: '成员', to: '宣传部成员（小组长）', operator: '陈雨桐', date: '2026-11-08' },
    { id: 'p2', name: '马晨阳', action: '提升', from: '成员', to: '实践部部长', operator: '吴雪枫', date: '2026-11-02' }
  ],

  /* 线上信息收集 */
  collects: [
    {
      id: 'c1', title: '2026级新生基本信息收集', desc: '用于建立系部学生会后备人才库，请如实填写。',
      fields: ['姓名', '学号', '班级', '联系电话', '家庭住址'],
      publisher: '吴雪枫', publisherRole: 'presidium', date: '2026-11-10', deadline: '2026-11-20', status: '进行中',
      submissions: [
        { name: '林小满', dept: '未加入', date: '2026-11-11', values: { '姓名': '林小满', '学号': '20260035', '班级': '2026级经济管理1班', '联系电话': '138****3321', '家庭住址': '云南省曲靖市沾益区' } },
        { name: '张知远', dept: '实践部', date: '2026-11-11', values: { '姓名': '张知远', '学号': '20260036', '班级': '2026级体育运营1班', '联系电话': '139****7788', '家庭住址': '云南省曲靖市麒麟区' } },
        { name: '何佳颖', dept: '宣传部', date: '2026-11-12', values: { '姓名': '何佳颖', '学号': '20250033', '班级': '2025级市场营销1班', '联系电话': '187****3344', '家庭住址': '云南省曲靖市宣威市' } }
      ]
    },
    {
      id: 'c2', title: '部门特长与可值班时间统计', desc: '用于安排值班表与活动分工。',
      fields: ['姓名', '部门', '特长', '可值班时间'],
      publisher: '陈雨桐', publisherRole: 'minister', date: '2026-10-28', deadline: '2026-11-06', status: '已结束',
      submissions: [
        { name: '何佳颖', dept: '宣传部', date: '2026-11-01', values: { '姓名': '何佳颖', '部门': '宣传部', '特长': '海报设计、视频剪辑', '可值班时间': '周一、周三晚' } },
        { name: '杨梦洁', dept: '宣传部', date: '2026-11-02', values: { '姓名': '杨梦洁', '部门': '宣传部', '特长': '文案撰写', '可值班时间': '周二、周四晚' } }
      ]
    }
  ],

  /* 线上活动报名 */
  events: [
    {
      id: 'e1', title: '第三届青春杯篮球赛', desc: '班级组队参赛，每队 5—8 人，报名后由权益服务部统一编排赛程。',
      time: '2026-11-20 09:00', place: '学院篮球场', quota: 60, publisher: '赵一鸣', publisherRole: 'minister',
      date: '2026-11-10', status: '报名中',
      signups: [
        { name: '吴雪枫', dept: '主席团', date: '2026-11-10' },
        { name: '李思远', dept: '主席团', date: '2026-11-10' },
        { name: '何佳颖', dept: '宣传部', date: '2026-11-11' },
        { name: '马晨阳', dept: '实践部', date: '2026-11-11' },
        { name: '林小满', dept: '未加入', date: '2026-11-12' }
      ]
    },
    {
      id: 'e2', title: '长征精神主题演讲比赛', desc: '初赛 3 分钟自选段落，决赛 5 分钟主题演讲，设一二三等奖。',
      time: '2026-11-25 14:00', place: '教学楼报告厅', quota: 30, publisher: '李思远', publisherRole: 'presidium',
      date: '2026-11-11', status: '报名中',
      signups: [
        { name: '林小满', dept: '未加入', date: '2026-11-12' },
        { name: '刘思彤', dept: '权益服务部', date: '2026-11-12' }
      ]
    },
    {
      id: 'e3', title: '网络安全宣传周志愿者', desc: '现场秩序维护、反诈知识讲解、短视频拍摄。',
      time: '2026-11-16 10:00', place: '学院广场', quota: 10, publisher: '陈雨桐', publisherRole: 'minister',
      date: '2026-11-06', status: '已截止',
      signups: [
        { name: '何佳颖', dept: '宣传部', date: '2026-11-06' },
        { name: '杨梦洁', dept: '宣传部', date: '2026-11-07' },
        { name: '马晨阳', dept: '实践部', date: '2026-11-07' }
      ]
    }
  ],

  /* 操作日志 */
  logs: [
    { id: 'g1', time: '2026-11-12 09:20:31', user: '陈雨桐', role: '部长团', action: '提交请假', detail: '事假 11-21 共 1 天' },
    { id: 'g2', time: '2026-11-12 08:55:12', user: '吴雪枫', role: '主席团', action: '审批活动', detail: '通过 国家网络安全宣传周反诈宣传' },
    { id: 'g3', time: '2026-11-11 21:03:44', user: '系统管理员', role: '管理员', action: '导入成员', detail: '新增 6 人' }
  ],

  /* 附加模块 */
  sessions: [
    { id: 's1', title: '十一月第一次全体例会', date: '2026-11-08', records: { m1: true, m2: true, m3: true, m4: true, m5: true, m6: false, m7: true, m8: true, m9: true, m10: true, m11: true } },
    { id: 's2', title: '宣传周活动筹备会', date: '2026-11-12', records: { m1: true, m4: true, m5: true, m7: true, m8: true } }
  ],
  assets: [
    { id: 't1', name: '音响设备（含话筒）', qty: 1, borrower: '权益服务部', date: '2026-11-12', due: '2026-11-18', status: '借出' },
    { id: 't2', name: '折叠桌', qty: 4, borrower: '实践部', date: '2026-11-10', due: '2026-11-15', status: '借出' },
    { id: 't3', name: '横幅支架', qty: 6, borrower: '', date: '', due: '', status: '在库' },
    { id: 't4', name: '志愿者马甲', qty: 20, borrower: '', date: '', due: '', status: '在库' }
  ]
};
