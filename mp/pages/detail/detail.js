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
  reason: '原因 / 说明', content: '内容', title2: '标题', leader: '负责人', desc: '简介',
  total: '总人数', hours: '服务时长', grade: '等级', applicant: '申请人',
  applicantTitle: '申请人职务', publisherName: '发布人', scope: '范围', writer: '撰稿人'
};

Page({
  data: { record: null, rows: [], track: [], title: '' },

  onLoad(options) {
    app.ensureReady().then(() => {
      const { type, id } = options;
      const key = KEY_MAP[type] || 'applies';
      const rec = (app.globalData.db[key] || []).find((x) => x.id === id);
      if (!rec) { wx.showToast({ title: '记录不存在', icon: 'none' }); return; }
      const rows = Object.keys(rec)
        .filter((k) => !['track', 'flow', 'images', 'attachData', 'approveSigns', 'values', 'signMinister', 'signChair', 'phoneMinister', 'phoneChair'].includes(k))
        .map((k) => ({ label: LABEL[k] || k, value: this.fmt(rec[k]) }))
        .filter((r) => r.value !== '—');
      const track = (rec.track || []).map((t) => ({
        action: t.action, actor: t.actor, note: t.note || '', time: t.time || ''
      }));
      this.setData({
        record: rec,
        rows,
        track,
        title: rec.title || rec.name || rec.typeName || '详情'
      });
    });
  },

  fmt(v) {
    if (v == null || v === '') return '—';
    if (typeof v === 'object') return JSON.stringify(v);
    return String(v);
  }
});
