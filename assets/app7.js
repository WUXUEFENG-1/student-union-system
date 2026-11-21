/* ---------------- 批量导出申请表（多页原生打印） ----------------
 * 勾选多条申请，逐条取既有申请表完整版式，合并为一个多页打印文档，
 * 新窗口调用浏览器打印 / 另存为 PDF。不做截图打包，避免页面抖动、内容截断与排版错乱。
 */

/* 按申请类型取既有申请表完整 HTML 文档；无专用版式时回退通用申请表 */
function applyBatchDoc(a) {
  if (a.type === 'volunteer' && typeof volunteerPrintHtml === 'function') return volunteerPrintHtml(a);
  if (a.type === 'election' && typeof electionPrintHtml === 'function') return electionPrintHtml(a);
  if (a.type === 'leaveclub' && typeof resignPrintHtml === 'function') return resignPrintHtml(a);
  if (a.type === 'publicLeave') return _batchWrapDoc(plProofHtml(a), a.typeName || '活动公假证明');
  return _batchGenericDoc(a);
}

function _batchWrapDoc(fragment, title) {
  return `<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8"><title>${esc(title)}</title>
  <style>@page{size:A4;margin:2cm}body{font-family:'FangSong','仿宋',serif;padding:16px;color:#1c2b3a}h2{text-align:center}img{max-width:100%}</style></head>
  <body>${fragment}</body></html>`;
}

function _batchGenericDoc(a) {
  const cfg = (typeof APPLY_TYPES !== 'undefined' && APPLY_TYPES[a.type]) || {};
  const v = a.values || {};
  const labelMap = {};
  (cfg.fields || []).forEach((f) => { labelMap[f.key] = f.label; });
  const kv = Object.entries(v)
    .filter(([k]) => !/Data$/.test(k))
    .map(([k, val]) => `<tr><td class="lab">${esc(labelMap[k] || k)}</td><td>${esc(val || '—')}</td></tr>`)
    .join('');
  const track = (a.track || []).map((t) => `<tr><td class="lab">${esc(t.action)}</td><td>${esc(t.actor)}（${esc(t.role)}）${t.note ? '：' + esc(t.note) : ''}　${esc(t.time)}</td></tr>`).join('');
  return `<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8"><title>${esc(a.typeName)}</title>
  <style>@page{size:A4;margin:2cm}body{font-family:'FangSong','仿宋',serif;padding:16px}h2{text-align:center;font-size:18px}table{border-collapse:collapse;width:100%;font-size:13px}td{border:1px solid #333;padding:6px 8px;vertical-align:middle}td.lab{background:#f2f5fa;font-weight:600;width:130px;text-align:center}img{height:30px;vertical-align:middle}</style></head>
  <body><h2>${esc(a.typeName || '申请表')}</h2>
  <table>
    <tr><td class="lab">姓名</td><td>${esc(a.name)}</td><td class="lab">学号</td><td>${esc(a.sno || '—')}</td></tr>
    <tr><td class="lab">部门</td><td>${esc(a.dept)}</td><td class="lab">职务</td><td>${esc(a.title || '成员')}</td></tr>
    <tr><td class="lab">提交时间</td><td>${esc(a.date || '—')}</td><td class="lab">状态</td><td>${esc(a.status)}</td></tr>
    ${kv}${track}
  </table></body></html>`;
}

function _batchSplitDoc(html) {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const style = [...doc.querySelectorAll('style')].map((s) => s.textContent).join('\n');
  const body = doc.body ? doc.body.innerHTML : html;
  return { style, body };
}

function batchExportApplyPdf(ids) {
  const list = ids.map((id) => db.applies.find((x) => x.id === id)).filter(Boolean);
  if (!list.length) { toast('请先勾选要导出的申请'); return; }
  /* 逐条取完整版式，抽取样式与正文，合并为多页打印文档；新窗口原生打印，避免截图抖动、内容截断与排版错乱 */
  const pages = list.map((a) => {
    const doc = applyBatchDoc(a);
    const { style, body } = _batchSplitDoc(doc);
    return { style, body };
  });
  const mergedStyle = Array.from(new Set(pages.map((p) => p.style).filter(Boolean))).join('\n');
  const bodyHtml = pages.map((p) => `<section class="print-page">${p.body}</section>`).join('\n');
  const html = `<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8"><title>申请表批量导出_${today().replace(/[-: ]/g, '')}</title>
    <style>${mergedStyle}
      .print-page{page-break-after:always;break-after:page;}
      .print-page:last-child{page-break-after:auto;break-after:auto;}
      @page{size:A4;margin:1.6cm;}
    </style></head>
    <body>${bodyHtml}</body></html>`;
  const w = window.open('', '_blank');
  if (!w) { toast('请允许浏览器弹出窗口后再导出 PDF'); return; }
  w.document.write(html);
  w.document.close();
  w.focus();
  setTimeout(() => w.print(), 300);
  commit('批量导出申请表PDF', `打印 ${list.length} 份：` + list.map((a) => `${a.typeName}·${a.name}`).join('、'));
  toast(`已打开打印窗口，共 ${list.length} 份，可另存为 PDF`);
}
