const app = getApp();
const store = require('../../utils/store');
const { APPLY_TYPES, DEPTS, TITLES, ROLE_NAMES } = require('../../utils/const');

const PRESET = {
  toDept: '', toTitle: '', targetDept: '', anonymous: '实名', category: '建议',
  obey: '是', agree: '否', handoverDone: '是', leaveType: '自愿申请',
  explanation: '活动期间该生将按要求完成活动任务，后续会主动补齐课堂笔记、完成作业，不影响学业。',
  phone: '', copiesPurpose: '1 份，用于课程请假备案'
};

Page({
  data: {
    cur: null,
    step: 'pick',
    types: [],
    type: '',
    cfg: null,
    fields: [],
    values: {},
    title: '',
    hint: '',
    submitting: false
  },

  onLoad(options) {
    app.ensureReady().then(() => {
      if (!app.globalData.cur) { wx.reLaunch({ url: '/pages/login/login' }); return; }
      this.setData({ cur: app.globalData.cur });
      const role = app.globalData.cur.role;
      const types = Object.entries(APPLY_TYPES)
        .filter(([, t]) => !t.visible || t.visible.includes(role))
        .map(([key, t]) => ({ key, name: t.name }));
      this.setData({ types });
      if (options.type) this.openForm(options.type);
    });
  },

  onPickType(e) {
    const idx = Number(e.detail.value);
    this.openForm(this.data.types[idx].key);
  },

  openForm(key) {
    const cfg = APPLY_TYPES[key];
    if (!cfg) return;
    const cur = app.globalData.cur;
    const values = Object.assign({}, PRESET, {
      toDept: cur.dept, toTitle: cur.title, targetDept: cur.dept, phone: cur.phone || ''
    });
    const fields = cfg.fields.map((f) => ({
      key: f.key, label: f.label, type: f.type || 'text',
      options: f.options || [], required: !!f.required, placeholder: f.placeholder || ''
    }));
    this.setData({ step: 'form', type: key, cfg, fields, values, title: cfg.name, hint: cfg.hint });
  },

  backToPick() { this.setData({ step: 'pick', cfg: null, fields: [] }); },

  onInput(e) {
    const key = e.currentTarget.dataset.key;
    this.setData({ [`values.${key}`]: e.detail.value });
  },

  onSelect(e) {
    const { key, options } = e.currentTarget.dataset;
    this.setData({ [`values.${key}`]: options[Number(e.detail.value)] });
  },

  onDate(e) {
    const key = e.currentTarget.dataset.key;
    this.setData({ [`values.${key}`]: e.detail.value });
  },

  onFile(e) {
    const key = e.currentTarget.dataset.key;
    wx.chooseMedia({
      count: 1, mediaType: ['image'], sourceType: ['album', 'camera'],
      success: (res) => {
        const path = res.tempFiles[0].tempFilePath;
        const fs = wx.getFileSystemManager();
        fs.readFile({
          filePath: path, encoding: 'base64',
          success: (r) => {
            const ext = (path.match(/\.(\w+)$/) || [, 'jpg'])[1];
            const dataUrl = `data:image/${ext};base64,${r.data}`;
            this.setData({ [`values.${key}`]: dataUrl, [`values.__${key}Name`]: path });
          },
          fail: () => wx.showToast({ title: '图片读取失败', icon: 'none' })
        });
      }
    });
  },

  submit() {
    if (this.data.submitting) return;
    const { type, cfg, fields, values } = this.data;
    for (const f of fields) {
      if (f.required && !String(values[f.key] || '').trim()) {
        wx.showToast({ title: `请填写${f.label}`, icon: 'none' });
        return;
      }
    }
    const cur = app.globalData.cur;
    const clean = {};
    Object.keys(values).forEach((k) => { if (!k.startsWith('__')) clean[k] = values[k]; });
    const record = {
      id: store.uid('ap'), type, typeName: cfg.name,
      name: cur.name, sno: cur.sno || '—', major: cur.major || '—', class: cur.class || '—',
      dept: cur.dept, title: cur.title, applicantRole: cur.role,
      values: clean, date: store.today(),
      status: type === 'feedback' ? '待分派' : '待审核', stage: 0, locked: false,
      track: [{ actor: cur.name, role: ROLE_NAMES[cur.role], action: '提交申请', note: '', time: store.today() }]
    };
    app.globalData.db.applies = app.globalData.db.applies || [];
    app.globalData.db.applies.unshift(record);
    store.commit('提交申请', `${cfg.name} · ${cur.name}`);
    this.setData({ submitting: true });
    wx.showToast({ title: '申请已提交', icon: 'none' });
    setTimeout(() => wx.navigateBack(), 600);
  }
});
