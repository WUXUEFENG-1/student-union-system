/* 演示数据：五类角色与业务台账（数据存于浏览器 localStorage） */

const ROLE_NAMES = {
  teacher: '指导老师',
  presidium: '主席团',
  minister: '部长团',
  staff: '干事',
  student: '普通学生'
};

/* 演示账号 */
const ACCOUNTS = [
  { username: 'teacher', password: '123456', name: '王老师', role: 'teacher', dept: '学院', title: '指导老师' },
  { username: 'presidium', password: '123456', name: '吴雪枫', role: 'presidium', dept: '秘书处', title: '主席' },
  { username: 'minister', password: '123456', name: '陈雨桐', role: 'minister', dept: '宣传部', title: '部长' },
  { username: 'staff', password: '123456', name: '何佳颖', role: 'staff', dept: '宣传部', title: '干事' },
  { username: 'student', password: '123456', name: '林小满', role: 'student', dept: '未加入', title: '普通学生' }
];

const DEPTS = ['秘书处', '组织部', '宣传部', '学习部', '文艺部', '体育部', '实践部', '生活部'];
const TITLES = ['主席', '副主席', '部长', '副部长', '干事'];

const SEED = {
  /* ④ 人员信息表 */
  members: [
    { id: 'm1', name: '吴雪枫', sno: '20260001', dept: '秘书处', title: '主席', phone: '138****6621', status: '在任', joined: '2026-09-01' },
    { id: 'm2', name: '李思远', sno: '20260012', dept: '组织部', title: '副主席', phone: '139****3308', status: '在任', joined: '2026-09-01' },
    { id: 'm3', name: '陈雨桐', sno: '20260023', dept: '宣传部', title: '部长', phone: '137****9915', status: '在任', joined: '2026-09-03' },
    { id: 'm4', name: '赵一鸣', sno: '20260034', dept: '学习部', title: '部长', phone: '150****2244', status: '在任', joined: '2026-09-03' },
    { id: 'm5', name: '孙嘉禾', sno: '20260045', dept: '文艺部', title: '部长', phone: '188****7610', status: '在任', joined: '2026-09-05' },
    { id: 'm6', name: '周立新', sno: '20260056', dept: '体育部', title: '副部长', phone: '135****4487', status: '在任', joined: '2026-09-05' },
    { id: 'm7', name: '黄婉清', sno: '20260067', dept: '实践部', title: '部长', phone: '176****0192', status: '在任', joined: '2026-09-08' },
    { id: 'm8', name: '徐子航', sno: '20260078', dept: '生活部', title: '部长', phone: '131****5566', status: '在任', joined: '2026-09-08' },
    { id: 'm9', name: '何佳颖', sno: '20260089', dept: '宣传部', title: '干事', phone: '187****3344', status: '在任', joined: '2026-09-15' },
    { id: 'm10', name: '马晨阳', sno: '20260090', dept: '组织部', title: '干事', phone: '152****8877', status: '在任', joined: '2026-09-15' },
    { id: 'm11', name: '杨梦洁', sno: '20260091', dept: '宣传部', title: '干事', phone: '156****1102', status: '在任', joined: '2026-09-20' },
    { id: 'm12', name: '罗开元', sno: '20250033', dept: '体育部', title: '干事', phone: '133****9900', status: '离任', joined: '2025-09-18' }
  ],

  /* ① 部门信息表 */
  departments: [
    { id: 'd1', name: '秘书处', leader: '吴雪枫', memberCount: 2, desc: '会议记录、档案管理、制度汇编与跨部门协调。', status: '正常' },
    { id: 'd2', name: '组织部', leader: '李思远', memberCount: 2, desc: '干部培训、组织建设、活动人员统筹。', status: '正常' },
    { id: 'd3', name: '宣传部', leader: '陈雨桐', memberCount: 3, desc: '海报设计、公众号运营、活动影像记录。', status: '正常' },
    { id: 'd4', name: '学习部', leader: '赵一鸣', memberCount: 1, desc: '学风建设、学科竞赛、学习经验分享。', status: '正常' },
    { id: 'd5', name: '文艺部', leader: '孙嘉禾', memberCount: 1, desc: '文艺演出、晚会策划、节目排练。', status: '正常' },
    { id: 'd6', name: '体育部', leader: '周立新', memberCount: 2, desc: '体育赛事、早操跑操、运动器材管理。', status: '正常' },
    { id: 'd7', name: '实践部', leader: '黄婉清', memberCount: 1, desc: '志愿服务、社会实践、校企对接。', status: '正常' },
    { id: 'd8', name: '生活部', leader: '徐子航', memberCount: 1, desc: '宿舍卫生检查、物资采购与后勤保障。', status: '正常' }
  ],

  /* ② 部门申请表（主席团提交 → 指导老师审核） */
  deptRequests: [
    { id: 'dr1', type: '新增', dept: '权益部', reason: '新增学生权益维护与意见反馈职能', submitter: '吴雪枫', date: '2026-11-11', status: '待老师审核' },
    { id: 'dr2', type: '编辑', dept: '体育部', reason: '负责人由周立新调整为徐子航', submitter: '吴雪枫', date: '2026-11-09', status: '已通过' }
  ],

  /* ③ 活动信息表 */
  activities: [
    { id: 'a1', title: '第三届青春杯篮球赛', dept: '体育部', collaborators: [{ dept: '生活部', count: 6 }, { dept: '宣传部', count: 3 }], total: 36, start: '2026-11-20 09:00', end: '2026-11-20 17:00', place: '学院篮球场', content: '班级组队参赛，淘汰赛制，设冠亚季军。', status: '已通过', approver: '主席团', reason: '' },
    { id: 'a2', title: '长征精神主题演讲比赛', dept: '组织部', collaborators: [{ dept: '宣传部', count: 4 }], total: 24, start: '2026-11-25 14:00', end: '2026-11-25 17:30', place: '教学楼报告厅', content: '初赛与决赛两轮，评委由指导老师与主席团担任。', status: '待审批', approver: '', reason: '' },
    { id: 'a3', title: '国家网络安全宣传周反诈宣传', dept: '宣传部', collaborators: [{ dept: '实践部', count: 5 }], total: 18, start: '2026-11-16 10:00', end: '2026-11-16 16:00', place: '学院广场', content: '反诈知识问答、宣传短片拍摄与志愿者招募。', status: '已通过', approver: '指导老师', reason: '' },
    { id: 'a4', title: '学生会新干事培训会', dept: '秘书处', collaborators: [], total: 30, start: '2026-11-14 18:30', end: '2026-11-14 20:30', place: '学生会办公室', content: '制度学习、公文写作、办公软件实操。', status: '已驳回', approver: '主席团', reason: '与学院晚课冲突，建议改期' }
  ],

  /* 通知公告 */
  notices: [
    { id: 'n1', title: '关于举办第三届青春杯篮球赛的通知', type: '活动通知', content: '各部门、各班级：学院定于11月20日举办第三届青春杯篮球赛，请各班于18日前完成组队报名。', date: '2026-11-10', publisher: '主席团', publisherName: '吴雪枫', status: '已发布' },
    { id: 'n2', title: '学生会值班安排调整说明', type: '其他通知', content: '自11月16日起，办公室值班时间调整为每周一至周五 17:30—19:00，请值班部门按时到岗并填写签到表。', date: '2026-11-09', publisher: '主席团', publisherName: '李思远', status: '已发布' },
    { id: 'n3', title: '国家网络安全宣传周志愿者招募', type: '活动通知', content: '宣传周活动需现场志愿者10名，负责反诈知识讲解与短视频拍摄，请有意向的同学联系宣传部。', date: '2026-11-06', publisher: '部长团', publisherName: '陈雨桐', status: '已发布' },
    { id: 'n4', title: '关于调整例会时间的通知（已撤回）', type: '其他通知', content: '原定11月7日的全体例会调整至11月8日。', date: '2026-11-05', publisher: '主席团', publisherName: '吴雪枫', status: '已撤回' }
  ],

  /* ⑦ 请假表 */
  leaves: [
    { id: 'l1', applicant: '何佳颖', applicantRole: 'staff', dept: '宣传部', type: '病假', start: '2026-11-18', end: '2026-11-19', reason: '发热就医，附校医院诊断证明。', status: '待审核', reviewer: '部长团', reviewNote: '', date: '2026-11-12' },
    { id: 'l2', applicant: '陈雨桐', applicantRole: 'minister', dept: '宣传部', type: '事假', start: '2026-11-21', end: '2026-11-21', reason: '回家参加亲属婚礼。', status: '待审核', reviewer: '主席团', reviewNote: '', date: '2026-11-11' },
    { id: 'l3', applicant: '吴雪枫', applicantRole: 'presidium', dept: '秘书处', type: '公假', start: '2026-11-15', end: '2026-11-16', reason: '赴昆明参加省级创新创业大赛答辩。', status: '已通过', reviewer: '指导老师', reviewNote: '同意，注意补齐会议记录', date: '2026-11-08' }
  ],

  /* ⑧ 考核表 */
  assessments: [
    { id: 'k1', targetRole: 'presidium', target: '吴雪枫', dept: '秘书处', period: '2026 年度', score: 92, comment: '统筹全年工作，活动组织与对外沟通表现突出。', status: '已通过', submitter: '王老师', date: '2026-11-10' },
    { id: 'k2', targetRole: 'minister', target: '陈雨桐', dept: '宣传部', period: '2026 年度', score: 88, comment: '宣传物料产出稳定，公众号阅读量提升明显。', status: '已通过', submitter: '吴雪枫', date: '2026-11-09' },
    { id: 'k3', targetRole: 'staff', target: '何佳颖', dept: '宣传部', period: '2026 秋季学期', score: 85, comment: '活动参与 5 次，海报任务完成 3 项，质量稳定。', status: '待审核', submitter: '陈雨桐', date: '2026-11-12' }
  ],

  /* ⑨ 加入申请（普通学生 → 部长团审核） */
  joinRequests: [
    { id: 'j1', name: '林小满', sno: '20260112', dept: '宣传部', reason: '会 PS 与视频剪辑，希望参与海报与短视频制作。', date: '2026-11-12', status: '待审核' },
    { id: 'j2', name: '张知远', sno: '20260118', dept: '体育部', reason: '校篮球队成员，想参与赛事组织。', date: '2026-11-10', status: '已通过' }
  ],

  /* 人事异动记录 */
  personnel: [
    { id: 'p1', name: '杨梦洁', action: '提升', from: '干事', to: '宣传部干事（副组长）', operator: '陈雨桐', date: '2026-11-08' },
    { id: 'p2', name: '罗开元', action: '罢免', from: '干事', to: '离任', operator: '吴雪枫', date: '2026-11-02' }
  ],

  /* 附加模块：考勤与物资 */
  sessions: [
    { id: 's1', title: '十一月第一次全体例会', date: '2026-11-08', records: { m1: true, m2: true, m3: true, m4: true, m5: false, m6: true, m7: true, m8: true, m9: true, m10: false, m11: true } },
    { id: 's2', title: '宣传周活动筹备会', date: '2026-11-12', records: { m1: true, m3: true, m9: true } }
  ],
  assets: [
    { id: 't1', name: '音响设备（含话筒）', qty: 1, borrower: '文艺部', date: '2026-11-12', due: '2026-11-18', status: '借出' },
    { id: 't2', name: '折叠桌', qty: 4, borrower: '生活部', date: '2026-11-10', due: '2026-11-15', status: '借出' },
    { id: 't3', name: '横幅支架', qty: 6, borrower: '', date: '', due: '', status: '在库' },
    { id: 't4', name: '志愿者马甲', qty: 20, borrower: '', date: '', due: '', status: '在库' }
  ]
};
