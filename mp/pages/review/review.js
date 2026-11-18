const app = getApp();
const store = require('../../utils/store');
const ui = require('../../utils/ui');

Page({
  data: {
    list: [],
    signVisible: false,
    signId: '',
    opinion: '',
    phone: '',
    signData: '',
    lastX: 0,
    lastY: 0,
    drawing: false
  },

  onShow() {
    app.ensureReady().then(() => {
      if (!app.globalData.cur) { wx.reLaunch({ url: '/pages/login/login' }); return; }
      this.refresh();
    });
  },

  refresh() {
    const list = store.myReviewApplies().map((a) => this.row(a));
    this.setData({ list });
  },

  row(a) {
    return {
      id: a.id,
      name: a.name,
      typeName: store.typeName(a),
      dept: a.dept,
      title: a.title,
      status: a.status,
      tone: ui.toneClass(a.status),
      flow: ui.flowLabel(a),
      track: ui.trackText(a),
      can: store.canApprove(a)
    };
  },

  onView(e) { ui.goDetail('apply', e.currentTarget.dataset.id); },

  /* 打开签字审批弹窗 */
  onPass(e) {
    const { id } = e.currentTarget.dataset;
    const a = app.globalData.db.applies.find((x) => x.id === id);
    if (!a || !store.canApprove(a)) { wx.showToast({ title: '当前节点无权审批', icon: 'none' }); return; }
    this.setData({ signVisible: true, signId: id, opinion: '', phone: app.globalData.cur.phone || '', signData: '' });
  },

  sStart(e) {
    const ctx = wx.createCanvasContext('signCanvas', this);
    const p = e.touches[0];
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.setStrokeStyle('#1f2d3d');
    ctx.setLineWidth(3);
    ctx.setLineCap('round');
    this.setData({ drawing: true, lastX: p.x, lastY: p.y });
    this._ctx = ctx;
  },

  sMove(e) {
    if (!this.data.drawing || !this._ctx) return;
    const p = e.touches[0];
    this._ctx.lineTo(p.x, p.y);
    this._ctx.stroke();
    this._ctx.draw(true);
    this.setData({ lastX: p.x, lastY: p.y });
  },

  sEnd() { this.setData({ drawing: false }); },

  clearSign() {
    const ctx = wx.createCanvasContext('signCanvas', this);
    ctx.clearRect(0, 0, 1000, 400);
    ctx.draw();
    this.setData({ signData: '' });
  },

  onOpinion(e) { this.setData({ opinion: e.detail.value }); },
  onPhone(e) { this.setData({ phone: e.detail.value }); },

  cancelSign() { this.setData({ signVisible: false }); },

  confirmSign() {
    const { signId, opinion, phone } = this.data;
    wx.canvasToTempFilePath({
      canvasId: 'signCanvas',
      success: (res) => {
        wx.getFileSystemManager().readFile({
          filePath: res.tempFilePath, encoding: 'base64',
          success: (r) => {
            const signData = `data:image/png;base64,${r.data}`;
            this.doPass(signId, signData, phone, opinion);
          },
          fail: () => wx.showToast({ title: '签字读取失败', icon: 'none' })
        });
      },
      fail: () => wx.showToast({ title: '请先手写签字', icon: 'none' })
    });
  },

  doPass(id, signData, phone, opinion) {
    const a = app.globalData.db.applies.find((x) => x.id === id);
    if (!a) return;
    const stages = store.applyStages(a);
    const label = stages[a.stage] || '审批';
    const last = a.stage >= stages.length - 1;
    a.track = a.track || [];
    a.track.push({ actor: app.globalData.cur.name, role: app.globalData.cur.role, action: label + '通过', note: opinion || '', time: store.today() });
    const signs = (a.approveSigns = a.approveSigns || []);
    signs.push({ sign: signData, phone: phone || '', opinion: opinion || '', actor: app.globalData.cur.name, role: app.globalData.cur.role, action: label, time: store.today() });
    if (a.stage === 0) { a.signMinister = signData; a.phoneMinister = phone; }
    else { a.signChair = signData; a.phoneChair = phone; }

    if (last) {
      a.status = a.type === 'feedback' ? '已答复' : '已通过';
      this.applyApproved(a);
    } else {
      a.stage += 1;
      a.status = a.type === 'feedback' ? '处理中' : '审核中';
    }
    store.notifyStagePass(a, label, last ? '' : stages[a.stage] || '');
    store.commit('审批申请', `${store.typeName(a)} · ${a.name} → ${a.status}`);
    this.setData({ signVisible: false });
    wx.showToast({ title: last ? '申请已通过' : '已流转下一节点', icon: 'none' });
    this.refresh();
  },

  applyApproved(a) {
    const { db } = app.globalData;
    const mem = db.members.find((m) => m.name === a.name) || db.members.find((m) => m.sno === a.sno);
    if ((a.type === 'adjust' || a.type === 'transfer') && mem) {
      mem.dept = (a.values || {}).toDept; mem.title = (a.values || {}).toTitle;
    }
    if (a.type === 'leaveclub' && mem) mem.status = '已退会';
    if (a.type === 'volunteer' && mem) mem.volunteerHours = (Number(mem.volunteerHours) || 0) + Number((a.values || {}).hours || 0);
  },

  onReject(e) {
    const { id } = e.currentTarget.dataset;
    const a = app.globalData.db.applies.find((x) => x.id === id);
    if (!a || !store.canApprove(a)) { wx.showToast({ title: '当前节点无权审批', icon: 'none' }); return; }
    wx.showModal({
      title: '驳回申请',
      editable: true,
      placeholderText: '请填写驳回原因',
      success: (res) => {
        if (!res.confirm) return;
        const reason = (res.content || '').trim();
        if (!reason) { wx.showToast({ title: '请填写驳回原因', icon: 'none' }); return; }
        a.status = '已驳回'; a.reason = reason;
        a.track = a.track || [];
        a.track.push({ actor: app.globalData.cur.name, role: app.globalData.cur.role, action: '驳回', note: reason, time: store.today() });
        store.sendApplyMsg(a, `你的「${store.typeName(a)}」在审批节点被驳回，原因：${reason}`, '申请驳回提醒');
        store.commit('驳回申请', `${store.typeName(a)} · ${a.name}：${reason}`);
        this.refresh();
      }
    });
  }
});
