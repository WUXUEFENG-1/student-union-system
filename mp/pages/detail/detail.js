const app = getApp();
const ui = require('../../utils/ui');

const KEY_MAP = {
  apply: 'applies', notice: 'notices', activity: 'activities', leave: 'leaves',
  assess: 'assessments', member: 'members', dept: 'departments', collect: 'collects',
  event: 'events', log: 'logs'
};

const LABEL = {
  name: '姓名', typeName: '申请事项', type: '类型', dept: '部门', title: '职务',
  sno: '学号', class: '班级', major: '专业', phone: '联系电话', status: '状态',
  date: '提交时间', start: '开始时间', end: '结束时间', place: '地点',
  reason: '原因 / 说明', content: '内容', leader: '负责人', desc: '简介',
  total: '总人数', hours: '服务时长', grade: '等级', applicant: '申请人',
  applicantTitle: '申请人职务', publisherName: '发布人', scope: '范围', writer: '撰稿人',
  toDept: '意向调入部门', toTitle: '意向岗位', handover: '原部门待办安排', agree: '是否征得同意',
  leaveType: '退会类型', handoverDone: '是否完成交接', handoverNote: '交接说明', promise: '承诺',
  anonymous: '提交方式', category: '诉求分类', detail: '详细内容', targetDept: '对接部门', contact: '联系方式',
  period: '学期 / 时间', summary: '摘要', selfEval: '工作自评', plan: '后续规划',
  manifesto: '竞选宣言', workBrief: '工作简述', awards: '获奖佐证', obey: '服从调剂',
  range: '任职起止时间', usage: '用途', copies: '申请份数', note: '备注',
  activity: '志愿活动名称', organizer: '主办单位', brief: '活动简介', proof: '证明材料',
  activityName: '活动名称', courses: '请假课程及日期', explanation: '申请说明', copiesPurpose: '份数与用途'
};

const IMG_KEYS = ['attach', 'reportFile', 'awards', 'proof', 'attachData'];

Page({
  data: { record: null, rows: [], valueRows: [], images: [], signs: [], track: [], title: '' },

  onLoad(options) {
    app.ensureReady().then(() => {
      const { type, id } = options;
      const key = KEY_MAP[type] || 'applies';
      const rec = (app.globalData.db[key] || []).find((x) => x.id === id);
      if (!rec) { wx.showToast({ title: '记录不存在', icon: 'none' }); return; }

      const skip = ['track', 'flow', 'images', 'attachData', 'approveSigns', 'values', 'signMinister', 'signChair', 'phoneMinister', 'phoneChair', 'attach'];
      const rows = Object.keys(rec)
        .filter((k) => !skip.includes(k))
        .map((k) => ({ label: LABEL[k] || k, value: this.fmt(rec[k]) }))
        .filter((r) => r.value !== '—');

      const valueRows = Object.keys(rec.values || {})
        .filter((k) => !k.startsWith('__') && !IMG_KEYS.includes(k))
        .map((k) => ({ label: LABEL[k] || k, value: this.fmt(rec.values[k]) }))
        .filter((r) => r.value !== '—');

      const images = [];
      IMG_KEYS.forEach((k) => {
        const v = rec[k] || (rec.values || {})[k];
        if (typeof v === 'string' && v.startsWith('data:image')) images.push(v);
      });

      const signs = (rec.approveSigns || []).map((s) => ({
        sign: s.sign, actor: s.actor, action: s.action, opinion: s.opinion || '', time: s.time || ''
      }));

      const track = (rec.track || []).map((t) => ({
        action: t.action, actor: t.actor, note: t.note || '', time: t.time || ''
      }));

      this.setData({
        record: rec, rows, valueRows, images, signs, track,
        title: rec.title || rec.name || rec.typeName || '详情'
      });
    });
  },

  fmt(v) {
    if (v == null || v === '') return '—';
    if (typeof v === 'object') return JSON.stringify(v);
    return String(v);
  },

  previewImg(e) {
    wx.previewImage({ urls: this.data.images, current: e.currentTarget.dataset.src });
  }
});
