/* 本地兜底种子：云端不可达且无缓存时使用 */
module.exports = {
  accounts: [
    { username: 'admin', password: '123456', name: '系统管理员', role: 'admin', dept: '系统', title: '管理员', sno: '—', class: '—', phone: '', gender: '—', ethnicity: '汉族', politics: '系统' },
    { username: 'teacher', password: '123456', name: '指导教师', role: 'teacher', dept: '系统', title: '责任教师', sno: '—', class: '—', phone: '', gender: '—', ethnicity: '汉族', politics: '系统' }
  ],
  members: [],
  departments: [
    { id: 'd1', name: '主席团', leader: '吴雪枫', desc: '统筹全系学生会工作。', status: '正常' },
    { id: 'd2', name: '秘书部', leader: '孙嘉禾', desc: '会议记录、档案管理。', status: '正常' },
    { id: 'd3', name: '宣传部', leader: '陈雨桐', desc: '海报设计、公众号运营。', status: '正常' },
    { id: 'd4', name: '文体部', leader: '王槿榆', desc: '文艺体育活动组织。', status: '正常' },
    { id: 'd5', name: '权益服务部', leader: '赵一鸣', desc: '学生权益维护。', status: '正常' }
  ],
  deptRequests: [], activities: [], notices: [], leaves: [], assessments: [],
  joinRequests: [], personnel: [], applies: [], collects: [], events: [], logs: [],
  sessions: [], assets: [], msgs: [],
  templates: { publicLeave: { title: '应用经济系学生会证明', body: '兹有{专业}专业{班级}班学生{姓名}，学号：{学号}，是我系学生会{所属部门}{职务}。' } }
};
