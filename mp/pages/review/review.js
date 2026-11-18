const app = getApp();
const store = require('../../utils/store');
const ui = require('../../utils/ui');

Page({
  data: { list: [] },

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

  onPass(e) {
    const { id } = e.currentTarget.dataset;
    const a = app.globalData.db.applies.find((x) => x.id === id);
    if (!a || !store.canApprove(a)) { wx.showToast({ title: '当前节点无权审批', icon: 'none' }); return; }
    const stages = store.applyStages(a);
    const label = stages[a.stage] || '审批';
    const last = a.stage >= stages.length - 1;
    a.track = a.track || [];
    a.track.push({ actor: app.globalData.cur.name, role: app.globalData.cur.role, action: label + '通过', note: '', time: store.today() });
    if (last) {
      a.status = a.type === 'feedback' ? '已答复' : '已通过';
      this.applyApproved(a);
    } else {
      a.stage += 1;
      a.status = a.type === 'feedback' ? '处理中' : '审核中';
    }
    store.notifyStagePass(a, label, last ? '' : stages[a.stage] || '');
    store.commit('审批申请', `${a.typeName} · ${a.name} → ${a.status}`);
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
        store.sendApplyMsg(a, `你的「${a.typeName}」在审批节点被驳回，原因：${reason}`, '申请驳回提醒');
        store.commit('驳回申请', `${a.typeName} · ${a.name}：${reason}`);
        this.refresh();
      }
    });
  }
});
