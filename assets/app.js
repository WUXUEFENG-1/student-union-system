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

const MENU = {
  admin: [
    ['dashboard', '工作台'], ['monitor', '系统监测'], ['logs', '操作日志'], ['activity', '活动审批'],
    ['personnel', '人事管理'], ['accounts', '账号管理'], ['dept', '部门审核'], ['assess', '考核管理'], ['notice', '通知管理'],
    ['leave', '请假审批'], ['join', '我的申请'], ['applySummary', '申请事宜汇总'], ['collect', '信息收集'], ['event', '活动报名'], ['profile', '个人信息']
  ],
  presidium: [
    ['dashboard', '工作台'], ['activity', '活动审批'], ['personnel', '人事管理'], ['dept', '部门管理'],
    ['assess', '考核管理'], ['notice', '通知管理'], ['leave', '请假管理'], ['join', '我的申请'],
    ['applySummary', '申请事宜汇总'], ['collect', '信息收集'], ['event', '活动报名'], ['profile', '个人信息']
  ],
  minister: [
    ['dashboard', '工作台'], ['dept', '部门信息'], ['activity', '活动管理'], ['assess', '成员考核'],
    ['leave', '请假管理'], ['join', '我的申请'], ['applySummary', '申请事宜汇总'], ['notice', '通知管理'], ['collect', '信息收集'],
    ['event', '活动报名'], ['attendance', '考勤签到'], ['asset', '物资借还'], ['profile', '个人信息']
  ],
  student: [
    ['dashboard', '工作台'], ['dept', '部门信息'], ['join', '我的申请'], ['notice', '通知公告'],
    ['leave', '我的请假'], ['event', '活动报名'], ['collect', '信息上传'], ['profile', '个人信息']
  ]
};
/* 责任教师与管理员拥有相同后台菜单，可查看操作任一模块，操作记录单独标识 */
MENU.teacher = MENU.admin.slice();

const PAGE_META = {
  dashboard: ['工作台', '今日待办与审批概览'],
  monitor: ['系统监测', '数据规模、存储占用与运行状态'],
  logs: ['操作日志', '账号关键操作留痕，可导出与检索'],
  activity: ['活动与审批', '活动申请、部长/副部长审批、撤回全流程'],
  personnel: ['人事管理', '成员信息、批量导入与任免记录'],
  accounts: ['账号管理', '管理员导入登录账号、重置密码与移除账号'],
  dept: ['部门管理', '部门信息与成员同步'],
  assess: ['考核管理', '按层级开展任务完成度考核'],
  notice: ['通知公告', '通知的发布与撤回'],
  leave: ['请假管理', '请假申请与逐级审核'],
  join: ['我的申请', '部门调整/调动、退会、反馈、述职、竞选、任职证明、志愿认定等申请'],
  applySummary: ['申请事宜汇总', '按申请事项查看申请人与审批轨迹；部长团仅看本部门（秘书部除外），主席团/指导教师/管理员查看全部'],
  attendance: ['考勤签到', '例会签到与出勤统计（部长团附加）'],
  asset: ['物资借还', '物资台账与借还登记（部长团附加）'],
  profile: ['个人信息', '资料维护、密码修改与权限说明']
};

let db = load();
let cur = null;

/* ---------------- 数据 ---------------- */
/* 职务 → 登录角色自动映射：主席/副主席=主席团，部长/副部长=部长团，其余=普通学生 */
function roleFromTitle(title) {
  if (['主席', '副主席'].includes(title)) return 'presidium';
  if (['部长', '副部长'].includes(title)) return 'minister';
  return 'student';
}
/* 职务归一化：兼容「主席 / 副主席 / 秘书部部长 / 文体部副部长 / 宣传部长」等带部门前缀的写法 */
function normalizeTitle(raw) {
  const t = String(raw || '').trim();
  if (/副主席/.test(t)) return '副主席';
  if (/主席/.test(t)) return '主席';
  if (/副部长/.test(t)) return '副部长';
  if (/部长/.test(t)) return '部长';
  if (/成员|干事/.test(t)) return '成员';
  return TITLES.includes(t) ? t : '成员';
}
function matchMember(db, acc) {
  return (db.members || []).find((m) => m.account === acc.username)
    || (db.members || []).find((m) => m.name === acc.name && (m.sno === acc.sno || acc.sno === '—' || m.sno === '—'))
    || (db.members || []).find((m) => m.sno === acc.sno && acc.sno !== '—');
}
function normalize(db) {
  (db.accounts || []).forEach((a) => {
    a.gender = a.gender || ''; a.ethnicity = a.ethnicity || '汉族'; a.politics = a.politics || '';
    a.account = a.account || a.username;
    const mem = matchMember(db, a);
    if (mem) {
      mem.account = mem.account || a.username;
      if (mem.title) a.title = mem.title;
      if (mem.dept) a.dept = mem.dept;
      ['gender', 'ethnicity', 'politics', 'class', 'major', 'phone', 'sno'].forEach((k) => { if (mem[k] && mem[k] !== '—') a[k] = mem[k]; });
    }
    if (!['admin', 'teacher'].includes(a.role)) a.role = roleFromTitle(a.title);
  });
  (db.members || []).forEach((m) => {
    m.gender = m.gender || ''; m.ethnicity = m.ethnicity || '汉族'; m.politics = m.politics || '';
    if (!m.account) { const acc = db.accounts.find((a) => a.name === m.name && (a.sno === m.sno || a.sno === '—')); if (acc) m.account = acc.username; }
  });
  return db;
}
function load() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      if (data && data.members && data.accounts) return normalize(data);
    }
  } catch (e) { /* 损坏则重建 */ }
  const fresh = JSON.parse(JSON.stringify(SEED));
  try { localStorage.setItem(STORE_KEY, JSON.stringify(fresh)); } catch (e) { /* 配额超限：仅内存兜底 */ }
  return normalize(fresh);
}
function save() { try { localStorage.setItem(STORE_KEY, JSON.stringify(db)); } catch (e) { /* 配额超限：本会话以内存台账为准 */ } }
function uid(p) { return p + Date.now().toString(36).slice(-4) + Math.random().toString(36).slice(2, 4); }

function log(action, detail = '') {
  db.logs = db.logs || [];
  db.logs.unshift({
    id: uid('g'),
    time: new Date().toLocaleString('zh-CN', { hour12: false }),
    user: cur ? cur.name : '系统',
    role: cur ? ROLE_NAMES[cur.role] : '系统',
    action, detail
  });
  if (db.logs.length > 300) db.logs.length = 300;
}
function commit(action, detail) { log(action, detail); save(); }

/* ---------------- 通用工具 ---------------- */
const $ = (s) => document.querySelector(s);
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const today = () => new Date().toISOString().slice(0, 10);
const allPower = () => ['admin', 'teacher', 'presidium'].includes(cur.role);
const isPublisher = () => ['admin', 'teacher', 'presidium', 'minister'].includes(cur.role);

/* 图片压缩：把上传/采集的 base64 图片按最大宽度等比缩放并转 JPEG，避免大文件撑爆云端快照与本地配额 */
function shrinkImageDataUrl(dataUrl, maxW, quality, maxH) {
  maxW = maxW || 1000;
  quality = quality || 72;
  return new Promise((resolve) => {
    if (!dataUrl || String(dataUrl).indexOf('data:image/') !== 0) return resolve(dataUrl);
    const img = new Image();
    img.onload = () => {
      try {
        let scale = img.width > maxW ? maxW / img.width : 1;
        if (maxH && img.height * scale > maxH) scale = maxH / img.height;
        const c = document.createElement('canvas');
        c.width = Math.max(1, Math.round(img.width * scale));
        c.height = Math.max(1, Math.round(img.height * scale));
        const ctx = c.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, c.width, c.height);
        ctx.drawImage(img, 0, 0, c.width, c.height);
        resolve(c.toDataURL('image/jpeg', quality / 100));
      } catch (e) { resolve(dataUrl); }
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

function tone(status) {
  if (['已通过', '在任', '已发布', '正常', '在库', '进行中', '报名中', '已答复', '已关闭', '已归档'].includes(status)) return 'green';
  if (['待审核', '待审批', '待责任教师审核', '待主席团审核', '待教师审核', '待主席审核', '待副主席审核', '待分派', '处理中', '审核中', '借出'].includes(status)) return 'amber';
  if (['已驳回', '已罢免', '离任', '已截止', '已退会', '已撤回', '已撤销', '已作废'].includes(status)) return 'red';
  if (status === '草稿') return 'gray';
  return 'gray';
}
function badge(text) { return `<span class="badge ${tone(text)}">${esc(text)}</span>`; }

/* 考核百分制固定四维：出勤30 / 工作任务40 / 思想纪律15 / 群众评价15 */
const ASSESS_DIMS = [
  { key: 'attend', name: '出勤', max: 30 },
  { key: 'task', name: '工作任务', max: 40 },
  { key: 'disc', name: '思想纪律', max: 15 },
  { key: 'peer', name: '群众评价', max: 15 }
];
function gradeOf(score) {
  const s = Number(score) || 0;
  if (s >= 90) return '优秀';
  if (s >= 80) return '良好';
  if (s >= 60) return '合格';
  return '不合格';
}
function gradeBadge(score) {
  const g = gradeOf(score);
  const color = g === '优秀' ? 'green' : g === '良好' ? 'blue' : g === '合格' ? 'amber' : 'red';
  return `<span class="badge ${color}">${g}</span>`;
}

function toast(msg) {
  const el = $('#toast');
  el.textContent = msg;
  el.classList.remove('hidden');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => el.classList.add('hidden'), 2400);
}

function exportCsv(filename, headers, rows) {
  const cell = (v) => `"${String(v == null ? '' : v).replace(/"/g, '""')}"`;
  const text = '\ufeff' + [headers, ...rows].map((r) => r.map(cell).join(',')).join('\r\n');
  const blob = new Blob([text], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename.endsWith('.csv') ? filename : filename + '.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  toast('已导出 ' + a.download);
}

/* ---------------- 多格式导出（Excel / Word / PDF / CSV） ---------------- */
function downloadBlob(blob, filename) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}

function downloadDataUrl(dataUrl, filename) {
  const arr = String(dataUrl).split(',');
  const mime = (arr[0].match(/data:([^;]+)/) || [, 'application/octet-stream'])[1];
  const bin = atob(arr[1] || '');
  const buf = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i += 1) buf[i] = bin.charCodeAt(i);
  downloadBlob(new Blob([buf], { type: mime }), filename);
}

function buildTableHtml(headers, rows) {
  const th = headers.map((h) => `<th>${esc(h)}</th>`).join('');
  const trs = rows.map((r) => `<tr>${r.map((c) => `<td>${esc(c == null ? '' : c)}</td>`).join('')}</tr>`).join('');
  const empty = `<tr><td colspan="${headers.length}" class="empty">暂无数据</td></tr>`;
  return `<table border="1" cellspacing="0" cellpadding="6" style="border-collapse:collapse;font-family:'Microsoft YaHei',sans-serif;font-size:13px;width:100%"><thead><tr>${th}</tr></thead><tbody>${trs || empty}</tbody></table>`;
}

function exportTable(format, filename, headers, rows) {
  rows = rows || [];
  if (format === 'csv') return exportCsv(filename, headers, rows);

  if (format === 'excel') {
    const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel">
      <head><meta charset="UTF-8"><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>Sheet1</x:Name></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head>
      <body><h3 style="font-family:'Microsoft YaHei',sans-serif">${esc(filename)}</h3>${buildTableHtml(headers, rows)}</body></html>`;
    downloadBlob(new Blob(['\ufeff' + html], { type: 'application/vnd.ms-excel;charset=utf-8' }), filename + '.xls');
    toast('已导出 Excel：' + filename + '.xls');
    return;
  }

  if (format === 'word') {
    const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word">
      <head><meta charset="UTF-8"><style>body{font-family:'Microsoft YaHei',sans-serif}h3{font-size:16px}table{border-collapse:collapse;width:100%}th,td{border:1px solid #333;padding:6px;font-size:13px}th{background:#eef3fb}</style></head>
      <body><h3>${esc(filename)}</h3>${buildTableHtml(headers, rows)}</body></html>`;
    downloadBlob(new Blob(['\ufeff' + html], { type: 'application/msword;charset=utf-8' }), filename + '.doc');
    toast('已导出 Word：' + filename + '.doc');
    return;
  }

  if (format === 'pdf') {
    const w = window.open('', '_blank');
    if (!w) { toast('请允许浏览器弹出窗口后再导出 PDF'); return; }
    w.document.write(`<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8"><title>${esc(filename)}</title>
      <style>body{font-family:'Microsoft YaHei',sans-serif;padding:24px}h3{font-size:16px;margin:0 0 6px}p.sub{color:#666;font-size:12px;margin:0 0 12px}table{border-collapse:collapse;width:100%}th,td{border:1px solid #333;padding:6px;font-size:12px}th{background:#eef3fb}</style></head>
      <body><h3>${esc(SYSTEM.full)}</h3><p class="sub">${esc(filename)}</p>${buildTableHtml(headers, rows)}</body></html>`);
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 300);
    toast('已打开打印窗口，可另存为 PDF');
  }
}

function openExportPicker(filename, headers, rows) {
  $('#modalTitle').textContent = '导出：' + filename;
  $('#modalOk').classList.add('hidden');
  $('#modalCancel').textContent = '关闭';
  modalSubmit = null;
  $('#modalBody').innerHTML = `<p class="form-hint">选择导出格式，将按当前表格数据生成文件。</p>
    <div class="export-grid">
      <button class="primary-btn" data-fmt="excel">导出 Excel（.xls）</button>
      <button class="primary-btn light" data-fmt="word">导出 Word（.doc）</button>
      <button class="primary-btn light" data-fmt="pdf">导出 PDF（打印另存）</button>
      <button class="primary-btn light" data-fmt="csv">导出 CSV（.csv）</button>
    </div>`;
  $('#modalMask').classList.remove('hidden');
  document.querySelectorAll('#modalBody [data-fmt]').forEach((b) => {
    b.onclick = () => {
      exportTable(b.dataset.fmt, filename, headers, rows);
      if (b.dataset.fmt !== 'pdf') closeModal();
    };
  });
}

/* ---------------- 弹窗 ---------------- */
let modalSubmit = null;
function openForm({ title, fields = [], values = {}, okText = '保存', hint = '', extra = '', onSubmit }) {
  $('#modalTitle').textContent = title;
  $('#modalOk').textContent = okText;
  $('#modalOk').classList.remove('hidden');
  $('#modalCancel').textContent = '取消';
  $('#modalBody').innerHTML = (hint ? `<p class="form-hint">${hint}</p>` : '') + fields.map((f) => {
    const v = values[f.key] == null ? '' : values[f.key];
    const req = f.required ? ' required' : '';
    const ph = f.placeholder ? ` placeholder="${esc(f.placeholder)}"` : '';
    if (f.type === 'select') {
      const opts = f.options.map((o) => {
        const val = (typeof o === 'object' && o !== null) ? o.value : o;
        const lab = (typeof o === 'object' && o !== null) ? o.label : o;
        return `<option value="${esc(val)}"${val === v ? ' selected' : ''}>${esc(lab)}</option>`;
      }).join('');
      return `<div class="field"><label>${esc(f.label)}</label><select id="f_${f.key}"${req}>${opts}</select></div>`;
    }
    if (f.type === 'textarea') {
      return `<div class="field"><label>${esc(f.label)}</label><textarea id="f_${f.key}"${req}${ph}>${esc(v)}</textarea></div>`;
    }
    if (f.type === 'file') {
      const curName = v ? esc(v) : '';
      return `<div class="field"><label>${esc(f.label)}</label><input type="file" id="f_${f.key}" accept=".doc,.docx,.pdf,.xls,.xlsx,.png,.jpg,.jpeg,.txt" class="file-input">${curName ? `<div class="form-hint">当前附件：${curName}</div>` : ''}</div>`;
    }
    if (f.type === 'hidden') {
      return `<input type="hidden" id="f_${f.key}" value="${esc(v)}">`;
    }
    return `<div class="field"><label>${esc(f.label)}</label><input id="f_${f.key}" type="${f.type || 'text'}" value="${esc(v)}"${req}${ph}></div>`;
  }).join('') + extra;
  const fileData = {};
  fields.filter((f) => f.type === 'file').forEach((f) => {
    const el = $('#f_' + f.key);
    if (!el) return;
    el.onchange = (e) => {
      const file = e.target.files[0];
      fileData[f.key] = '';
      if (!file) return;
      const rd = new FileReader();
      rd.onload = async () => {
        const isImg = file.type && file.type.indexOf('image/') === 0;
        fileData[f.key] = isImg ? await shrinkImageDataUrl(rd.result, 1000, 72) : rd.result;
      };
      rd.readAsDataURL(file);
    };
  });
  modalSubmit = () => {
    const data = {};
    for (const f of fields) {
      const el = $('#f_' + f.key);
      if (!el) continue;
      if (f.type === 'file') {
        const file = el.files && el.files[0];
        const name = file ? file.name : (values[f.key] || '');
        if (f.required && !name) { el.focus(); toast('请上传' + f.label); return; }
        data[f.key] = name;
        data[f.key + 'Data'] = fileData[f.key] || (values[f.key + 'Data'] || '');
        continue;
      }
      const val = el.value.trim();
      if (f.required && !val) { el.focus(); toast('请填写' + f.label); return; }
      data[f.key] = f.type === 'number' ? Number(val || 0) : val;
    }
    onSubmit(data);
    closeModal();
  };
  $('#modalMask').classList.remove('hidden');
  return $('#modalBody');
}

function openInfo(title, html, footNote) {
  $('#modalTitle').textContent = title;
  $('#modalOk').classList.add('hidden');
  $('#modalCancel').textContent = '关闭';
  $('#modalBody').innerHTML = html + (footNote ? `<p class="form-hint">${footNote}</p>` : '');
  modalSubmit = null;
  $('#modalMask').classList.remove('hidden');
}

function closeModal() { $('#modalMask').classList.add('hidden'); modalSubmit = null; }
$('#modalClose').onclick = closeModal;
$('#modalCancel').onclick = closeModal;
$('#modalOk').onclick = () => modalSubmit && modalSubmit();
$('#modalMask').onclick = (e) => { if (e.target.id === 'modalMask') closeModal(); };

/* ---------------- 登录 ---------------- */
function doLogin() {
  if (window.__syncReady === false) {
    $('#loginErr').textContent = '正在同步云端名单，请稍候再登录';
    $('#loginErr').classList.remove('hidden');
    return;
  }
  const u = $('#loginUser').value.trim();
  const p = $('#loginPass').value;
  const acc = db.accounts.find((a) => a.username === u && a.password === p);
  if (!acc) {
    $('#loginErr').textContent = '账号或密码不正确，请联系管理员核实';
    $('#loginErr').classList.remove('hidden');
    return;
  }
  sessionStorage.setItem(SESS_KEY, acc.username);
  enterApp(acc);
  commit('登录系统', `账号 ${acc.username}`);
}

function enterApp(acc) {
  cur = Object.assign({}, acc);
  /* 同步成员档案（不含密码），并按职务校正登录身份 */
  const mem = matchMember(db, acc);
  if (mem) {
    ['name', 'gender', 'ethnicity', 'politics', 'class', 'major', 'phone', 'dept', 'title', 'sno'].forEach((k) => {
      if (mem[k] != null && mem[k] !== '' && mem[k] !== '—') cur[k] = mem[k];
    });
  }
  if (!['admin', 'teacher'].includes(cur.role)) cur.role = roleFromTitle(cur.title);
  /* 把校正后的身份与档案回写账号记录，保证菜单、工作台一致 */
  const rec = db.accounts.find((a) => a.username === acc.username);
  if (rec) Object.assign(rec, {
    role: cur.role, name: cur.name, dept: cur.dept, title: cur.title, sno: cur.sno,
    class: cur.class, major: cur.major, phone: cur.phone, gender: cur.gender, ethnicity: cur.ethnicity, politics: cur.politics
  });

  $('#loginPage').classList.add('hidden');
  $('#shell').classList.remove('hidden');
  $('#userName').textContent = cur.name;
  $('#userTitle').textContent = cur.title + (cur.dept && cur.dept !== '未加入' ? ' · ' + cur.dept : '');
  $('#userAvatar').textContent = cur.name.slice(-1);
  $('#roleBadge').textContent = ROLE_NAMES[cur.role];
  document.title = SYSTEM.full;

  $('#nav').innerHTML = MENU[cur.role].map(([key, label], i) => `
    <button class="nav-item${i === 0 ? ' active' : ''}" data-view="${key}">
      <svg viewBox="0 0 24 24" aria-hidden="true">${ICONS[key]}</svg>${label}</button>`).join('');
  document.querySelectorAll('.nav-item').forEach((b) => {
    b.onclick = () => {
      document.querySelector('.sidebar').classList.remove('open');
      switchView(b.dataset.view);
    };
  });
  switchView(MENU[cur.role][0][0]);
}

$('#loginBtn').onclick = doLogin;
$('#loginPass').addEventListener('keydown', (e) => { if (e.key === 'Enter') doLogin(); });
$('#loginUser').addEventListener('keydown', (e) => { if (e.key === 'Enter') $('#loginPass').focus(); });
$('#logoutBtn').onclick = () => {
  commit('退出登录', `账号 ${cur.username}`);
  sessionStorage.removeItem(SESS_KEY);
  /* 先把本机暂存的申请/日志推上云端，再刷新重登，避免新提交在重登后被云端旧快照覆盖 */
  const flush = typeof window.__flushSync === 'function' ? window.__flushSync() : Promise.resolve(true);
  let reloaded = false;
  const reload = () => { if (!reloaded) { reloaded = true; location.reload(); } };
  Promise.resolve(flush).then(reload).catch(reload);
  setTimeout(reload, 1500);
};
$('#menuBtn').onclick = (e) => { e.stopPropagation(); document.querySelector('.sidebar').classList.toggle('open'); };
document.addEventListener('click', (e) => {
  if (!e.target.closest('.sidebar') && !e.target.closest('#menuBtn')) document.querySelector('.sidebar').classList.remove('open');
});

/* ---------------- 视图 ---------------- */
let curView = 'dashboard';
function pageMeta(view) {
  if (view === 'collect') return isPublisher() ? ['信息收集', '发布收集任务，查看统计与导出'] : ['信息上传', '填写已发布的信息收集表并提交'];
  if (view === 'event') return isPublisher() ? ['活动报名', '发布报名活动，查看与导出报名名单'] : ['活动报名', '选择活动报名，或取消已报名活动'];
  if (view === 'leave') return cur.role === 'admin' ? ['请假审批', '审核主席团请假']
    : cur.role === 'presidium' ? ['请假管理', '提交本人请假并审核部长请假']
    : ['我的请假', '提交请假申请并查看审批进度'];
  return PAGE_META[view];
}

function switchView(view) {
  curView = view;
  document.querySelectorAll('.nav-item').forEach((b) => b.classList.toggle('active', b.dataset.view === view));
  const meta = pageMeta(view);
  $('#pageTitle').textContent = meta[0];
  $('#pageSub').textContent = meta[1];
  render();
}
function render() {
  const map = {
    dashboard: renderDashboard, activity: renderActivity, personnel: renderPersonnel, accounts: renderAccounts, dept: renderDept,
    assess: renderAssess, notice: renderNotice, leave: renderLeave, join: renderJoin, applySummary: renderApplySummary,
    attendance: renderAttendance, asset: renderAsset, profile: renderProfile,
    collect: renderCollect, event: renderEvent, monitor: renderMonitor, logs: renderLogs
  };
  $('#views').innerHTML = '';
  (map[curView] || renderDashboard)();
}

/* ---------------- 工作台 ---------------- */
function pendingTasks() {
  const t = [];
  if (allPower() || cur.role === 'minister') {
    const acts = db.activities.filter((a) => a.status === '待审批').length;
    if (acts) t.push(['活动待审批', acts, 'activity']);
  }
  if (cur.role === 'teacher') {
    const dr = db.deptRequests.filter((r) => r.status === '待责任教师审核').length;
    if (dr) t.push(['部门申请待审核', dr, 'dept']);
  }
  if (cur.role === 'presidium' || cur.role === 'admin') {
    const k = db.assessments.filter((a) => a.targetRole === 'member' && a.status === '待审核').length;
    if (k) t.push(['成员考核待复核', k, 'assess']);
  }
  const leaveReviewer = { teacher: '责任教师', presidium: '主席团', minister: '部长/副部长' }[cur.role];
  if (leaveReviewer) {
    const l = db.leaves.filter((x) => x.status === '待审核' && x.reviewer === leaveReviewer).length;
    if (l) t.push(['请假待审核', l, 'leave']);
  }
  const ap = (db.applies || []).filter((x) => ['待审核', '审核中', '待分派', '处理中'].includes(x.status)).length;
  if (ap && (allPower() || cur.role === 'minister')) t.push(['申请待审批', ap, 'join']);
  const todo = db.collects.filter((c) => c.status === '进行中' && !c.submissions.some((s) => s.name === cur.name)).length;
  if (todo && cur.role === 'student') t.push(['待填写信息收集', todo, 'collect']);
  return t;
}

function renderDashboard() {
  const tasks = pendingTasks();
  const activeMembers = db.members.filter((m) => m.status === '在任').length;
  const openEvents = db.events.filter((e) => e.status === '报名中').length;
  const msgs = myMsgs();
  const unread = msgs.filter((m) => !m.read).length;

  const roleBrief = {
    admin: '管理员拥有全部权限，并可查看系统监测数据与操作日志。',
    teacher: '责任教师拥有全部后台权限，参与活动终审、考核配置与全系统台账导出，操作记录单独标识。',
    presidium: '主席、副主席拥有全部权限：审批活动与请假、任免成员、管理部门、考核部长、发布收集与报名。',
    minister: '您可维护本部门信息与成员、申请活动、考核部内成员、审批请假与各类申请、发布收集与活动报名。',
    student: '您可查看部门信息、提交各类申请、请假、报名活动、填写信息收集表。'
  };

  $('#views').innerHTML = `
    <div class="hero">
      <div>
        <h2>${esc(ROLE_NAMES[cur.role])} · ${esc(cur.name)}</h2>
        <p>${roleBrief[cur.role]}</p>
      </div>
      <span class="pill">${esc(SYSTEM.school)} · ${esc(SYSTEM.dept)}</span>
    </div>
    <div class="stats">
      <div class="stat"><div class="k">待我处理</div><div class="v">${tasks.reduce((s, x) => s + x[1], 0)}</div><div class="t">${tasks.length ? tasks.map((x) => x[0]).join('、') : '暂无待办'}</div></div>
      <div class="stat"><div class="k">在任成员</div><div class="v">${activeMembers}</div><div class="t">覆盖 ${db.departments.filter((d) => d.status === '正常').length} 个部门</div></div>
      <div class="stat"><div class="k">进行中收集</div><div class="v">${db.collects.filter((c) => c.status === '进行中').length}</div><div class="t">已提交 ${db.collects.reduce((s, c) => s + c.submissions.length, 0)} 份</div></div>
      <div class="stat"><div class="k">可报名活动</div><div class="v">${openEvents}</div><div class="t">报名总人次 ${db.events.reduce((s, e) => s + e.signups.length, 0)}</div></div>
    </div>
    <div class="card" id="msgCard">
      <div class="card-head">
        <div><h2>消息提醒${unread ? `<span class="badge amber" style="margin-left:8px">${unread} 条未读</span>` : ''}</h2>
          <div class="sub">申请审批每过一个节点会在此提示；点击消息可标记为已读</div></div>
        ${msgs.length ? '<button class="primary-btn light" id="msgReadAll">全部已读</button>' : ''}
      </div>
      ${msgs.length ? `<div class="notice-list msg-list">${msgs.slice(0, 12).map((m) => `
        <div class="notice-item msg-item${m.read ? '' : ' msg-unread'}" data-msg="${esc(m.id)}">
          <h4><span class="badge ${m.read ? '' : 'amber'}">${m.read ? '已读' : '未读'}</span>${esc(m.title)}</h4>
          <p>${esc(m.text)}</p>
          <div class="notice-meta">${esc(m.time)}${m.sno ? ' · 学号 ' + esc(m.sno) : ''}</div>
        </div>`).join('')}</div>` : '<div class="empty">暂无消息，申请审批有进展时会在这里提醒您</div>'}
    </div>
    <div class="grid-2">
      <div class="card">
        <div class="card-head"><div><h2>我的待办</h2><div class="sub">按当前角色权限汇总</div></div></div>
        ${tasks.length ? `<div class="notice-list">${tasks.map(([label, n, key]) => `
          <div class="notice-item todo-item" data-go="${key}">
            <h4>${esc(label)}<span class="badge amber">${n}</span></h4>
            <p>点击进入处理</p>
          </div>`).join('')}</div>` : '<div class="empty">当前没有需要您处理的审批事项</div>'}
      </div>
      <div class="card">
        <div class="card-head"><div><h2>最新通知</h2><div class="sub">仅显示已发布公告</div></div>
          <button class="primary-btn light" data-go="notice">查看全部</button></div>
        <div class="notice-list">${db.notices.filter((n) => n.status === '已发布').slice(0, 3).map((n) => `
          <div class="notice-item">
            <h4><span class="badge blue">${esc(n.type || '通知公告')}</span>${esc(n.title)}</h4>
            <p>${esc(String(n.content || '').replace(/\s+/g, ' ').slice(0, 96))}${String(n.content || '').length > 96 ? '…' : ''}</p>
            <div class="notice-meta">${esc(n.date)} · 撰稿人：${esc(n.writer || n.publisherName)} ｜ 一审一校：${esc(n.check1 ? n.check1.name : '—')} ｜ 二审二校：${esc(n.check2 ? n.check2.name : '—')} ｜ 三审三校：${esc(n.check3 ? n.check3.name : '—')}</div>
          </div>`).join('') || '<div class="empty">暂无通知</div>'}
        </div>
      </div>
    </div>
`;

  document.querySelectorAll('[data-go]').forEach((el) => {
    el.onclick = (e) => { e.stopPropagation(); switchView(el.dataset.go); };
  });
  /* 消息交互：点单条标记已读；全部已读一键清空未读角标 */
  document.querySelectorAll('[data-msg]').forEach((el) => {
    el.onclick = () => {
      const m = (db.msgs || []).find((x) => x.id === el.dataset.msg);
      if (!m || m.read) return;
      m.read = true; m.updatedAt = new Date().toISOString(); save(); render();
    };
  });
  const readAll = document.getElementById('msgReadAll');
  if (readAll) readAll.onclick = () => {
    const has = myMsgs().some((m) => !m.read);
    if (!has) { toast('暂无未读消息'); return; }
    const now = new Date().toISOString();
    myMsgs().forEach((m) => { if (!m.read) { m.read = true; m.updatedAt = now; } });
    commit('已读全部消息', '工作台消息标记为已读'); save(); render();
  };
}

/* ---------------- 系统监测 ---------------- */
function renderMonitor() {
  const bytes = new Blob([localStorage.getItem(STORE_KEY) || '']).size;
  const kb = (bytes / 1024).toFixed(1);
  const tableStats = [
    ['账号', db.accounts.length], ['成员', db.members.length], ['部门', db.departments.length],
    ['活动', db.activities.length], ['通知', db.notices.length], ['请假', db.leaves.length],
    ['考核', db.assessments.length], ['历史入会', db.joinRequests.length], ['我的申请', (db.applies || []).length],
    ['信息收集', db.collects.length], ['收集提交', db.collects.reduce((s, c) => s + c.submissions.length, 0)],
    ['活动报名', db.events.length], ['报名人次', db.events.reduce((s, e) => s + e.signups.length, 0)],
    ['操作日志', (db.logs || []).length]
  ];
  const roleCounts = {};
  db.accounts.forEach((a) => { roleCounts[ROLE_NAMES[a.role]] = (roleCounts[ROLE_NAMES[a.role]] || 0) + 1; });
  const recent = (db.logs || []).slice(0, 6);

  $('#views').innerHTML = `
    <div class="stats">
      <div class="stat"><div class="k">本地存储占用</div><div class="v">${kb}<span style="font-size:13px"> KB</span></div><div class="t">浏览器 localStorage 存储</div></div>
      <div class="stat"><div class="k">在任成员</div><div class="v">${db.members.filter((m) => m.status === '在任').length}</div><div class="t">共 ${db.members.length} 条成员记录</div></div>
      <div class="stat"><div class="k">账号数量</div><div class="v">${db.accounts.length}</div><div class="t">${Object.entries(roleCounts).map(([r, n]) => esc(r) + ' ' + n).join(' · ')}</div></div>
      <div class="stat"><div class="k">最近操作</div><div class="v">${recent.length ? recent[0].time.slice(5, 16) : '—'}</div><div class="t">${recent.length ? esc(recent[0].user) + ' · ' + esc(recent[0].action) : '暂无日志'}</div></div>
    </div>
    <div class="grid-2">
      <div class="card">
        <div class="card-head"><div><h2>数据规模</h2><div class="sub">各业务表当前记录条数</div></div></div>
        <div class="table-wrap"><table>
          <thead><tr><th>数据表</th><th>记录数</th></tr></thead>
          <tbody>${tableStats.map(([k, v]) => `<tr><td>${esc(k)}</td><td><strong>${v}</strong></td></tr>`).join('')}</tbody>
        </table></div>
      </div>
      <div class="card">
        <div class="card-head"><div><h2>最近操作日志</h2><div class="sub">完整日志在「操作日志」页查看</div></div>
          <button class="primary-btn light" data-go="logs">进入日志</button></div>
        <div class="notice-list">${recent.map((g) => `
          <div class="notice-item">
            <h4>${esc(g.action)} <span class="cell-sub">${esc(g.user)}（${esc(g.role)}）</span></h4>
            <p>${esc(g.detail || '—')}</p>
            <div class="notice-meta">${esc(g.time)}</div>
          </div>`).join('') || '<div class="empty">暂无日志</div>'}
        </div>
      </div>
    </div>`;
  document.querySelectorAll('[data-go]').forEach((el) => { el.onclick = () => switchView(el.dataset.go); });
}

/* ---------------- 操作日志 ---------------- */
function renderLogs() {
  const logs = db.logs || [];
  $('#views').innerHTML = `
    <div class="card">
      <div class="card-head">
        <div><h2>操作日志</h2><div class="sub">账号关键操作自动留痕，保留最近 300 条</div></div>
        <div class="toolbar">
          <select class="filter" id="logFilter">
            <option value="">全部操作人</option>
            ${[...new Set(logs.map((g) => g.user))].map((u) => `<option value="${esc(u)}">${esc(u)}</option>`).join('')}
          </select>
          <button class="primary-btn light" id="exportLogs">导出日志</button>
          <button class="primary-btn light" id="clearLogs">清空日志</button>
        </div>
      </div>
      <div class="table-wrap"><table>
        <thead><tr><th>时间</th><th>操作人</th><th>角色</th><th>操作</th><th>详情</th></tr></thead>
        <tbody id="logBody"></tbody>
      </table></div>
    </div>`;

  function drawLogs(filter = '') {
    const rows = logs.filter((g) => !filter || g.user === filter);
    $('#logBody').innerHTML = rows.map((g) => `
      <tr><td class="nowrap">${esc(g.time)}</td><td><strong>${esc(g.user)}</strong></td><td>${esc(g.role)}</td>
      <td>${esc(g.action)}</td><td>${esc(g.detail || '—')}</td></tr>`).join('')
      || '<tr><td colspan="5" class="empty">暂无日志</td></tr>';
  }
  drawLogs();
  $('#logFilter').onchange = (e) => drawLogs(e.target.value);

  $('#exportLogs').onclick = () => {
    const rows = logs.map((g) => [g.time, g.user, g.role, g.action, g.detail]);
    openExportPicker('操作日志_' + today(), ['时间', '操作人', '角色', '操作', '详情'], rows);
  };
  $('#clearLogs').onclick = () => {
    if (!confirm('确定清空全部操作日志？此操作不可恢复。')) return;
    db.logs = [];
    commit('清空日志', '清空全部操作记录');
    save(); render();
  };
}
