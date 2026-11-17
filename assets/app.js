/* 云南工业信息职业学院应用经济系学生会管理系统 */
const STORE_KEY = 'su_ms_v4';
const SESS_KEY = 'su_current';

const ICONS = {
  dashboard: '<rect x="3" y="3" width="8" height="8" rx="2"/><rect x="13" y="3" width="8" height="8" rx="2"/><rect x="3" y="13" width="8" height="8" rx="2"/><rect x="13" y="13" width="8" height="8" rx="2"/>',
  monitor: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
  logs: '<path d="M5 5h14M5 10h14M5 15h9M5 20h9"/><circle cx="18" cy="15" r="2.2"/>',
  activity: '<rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 9.5h17M8 3v3.5M16 3v3.5M8 14h3"/>',
  personnel: '<circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5"/><path d="M17.5 11.5v6M14.5 14.5h6"/>',
  accounts: '<rect x="4" y="10" width="16" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/><circle cx="12" cy="15" r="1.4"/>',
  dept: '<path d="M4 21V6l8-3 8 3v15M4 21h16M9 21v-5h6v5M9 9h2M13 9h2M9 12h2M13 12h2"/>',
  assess: '<path d="M5 4h14v16H5z"/><path d="M8.5 9h7M8.5 12.5h7M8.5 16h4"/>',
  notice: '<path d="M4 10.5v3a2 2 0 0 0 2 2h2l5 4V4.5L8 8.5H6a2 2 0 0 0-2 2z"/><path d="M17 8.5a5 5 0 0 1 0 7"/>',
  leave: '<rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 9.5h17M8 3v3.5M16 3v3.5M12 12v4M10 16h4"/>',
  join: '<circle cx="12" cy="8" r="3.4"/><path d="M5.5 20c0-3.6 3-6 6.5-6 2 0 3.7.9 4.9 2.4"/><path d="M17.5 15v6M14.5 18h6"/>',
  attendance: '<circle cx="12" cy="12" r="8.5"/><path d="M8 12.2l2.8 2.8L16.5 9"/>',
  asset: '<path d="M3.5 8.2l8.5-4 8.5 4-8.5 4z"/><path d="M3.5 8.2v7.6l8.5 4 8.5-4V8.2M12 12.2v7.6"/>',
  profile: '<circle cx="12" cy="8" r="3.4"/><path d="M4.5 20c0-3.9 3.3-6.4 7.5-6.4s7.5 2.5 7.5 6.4"/>',
  collect: '<path d="M4.5 5h15v14h-15z"/><path d="M8 9h8M8 12.5h8M8 16h4.5"/>',
  event: '<rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 9.5h17M8 3v3.5M16 3v3.5M9 14l1.7 1.7L14 12.2"/>',
  applySummary: '<rect x="4" y="4" width="16" height="5" rx="1.5"/><rect x="4" y="10" width="16" height="5" rx="1.5"/><rect x="4" y="16" width="10" height="4" rx="1.5"/>'
};
