/* 页面共享辅助函数 */
const { tone, ROLE_NAMES } = require('./const');
const store = require('./store');

const ROUTES = {
  dashboard: '/pages/dashboard/dashboard',
  activity: '/pages/activity/activity',
  personnel: '/pages/personnel/personnel',
  dept: '/pages/dept/dept',
  assess: '/pages/assess/assess',
  notice: '/pages/notice/notice',
  leave: '/pages/leave/leave',
  applies: '/pages/applies/applies',
  review: '/pages/review/review',
  summary: '/pages/summary/summary',
  collect: '/pages/collect/collect',
  event: '/pages/event/event',
  logs: '/pages/logs/logs',
  profile: '/pages/profile/profile',
  applyform: '/pages/apply-form/apply-form',
  attendance: '/pages/attendance/attendance',
  asset: '/pages/asset/asset'
};

function toneClass(s) { return tone(s); }

function trackText(a) {
  return (a.track || []).map((t) => `${t.action}·${t.actor}`).join('；') || '—';
}

function flowLabel(a) {
  return store.applyStages(a).join(' → ');
}

function menuItems(role) {
  return store.menuOf(role).map(([key, label]) => ({ key, label, path: ROUTES[key] || ROUTES.dashboard }));
}

function roleName(role) { return ROLE_NAMES[role] || role; }

function goDetail(type, id) {
  wx.navigateTo({ url: `/pages/detail/detail?type=${type}&id=${id}` });
}

function fmt(s) { return s == null ? '—' : String(s); }

module.exports = { ROUTES, toneClass, trackText, flowLabel, menuItems, roleName, goDetail, fmt };
