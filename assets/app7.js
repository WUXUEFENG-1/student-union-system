/* ---------------- 批量导出申请表 PDF 压缩包 ----------------
 * 勾选多条申请，逐条渲染既有申请表版式 → 画布转 JPEG → 单页 PDF → 打包 ZIP 下载。
 * 依赖：jszip.min.js、html2canvas.min.js（均已本地化，无外部 CDN）。
 */

function _batchSafeName(s) {
  return String(s || '').replace(/[\\/:*?"<>|\s]+/g, '_').replace(/^_+|_+$/g, '') || '未命名';
}

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

async function _batchRenderCanvas(style, body) {
  const holder = document.createElement('div');
  holder.style.cssText = 'position:fixed;left:-10000px;top:0;width:794px;background:#ffffff;z-index:-1;';
  holder.innerHTML = `<style>${style}</style>${body}`;
  document.body.appendChild(holder);
  try {
    const canvas = await html2canvas(holder, { scale: 2, backgroundColor: '#ffffff', useCORS: true, logging: false });
    return canvas;
  } finally {
    holder.remove();
  }
}

/* 最小单页图片 PDF：JPEG 作为 DCTDecode 图像 XObject 铺满 A4 页面 */
function _batchJpegToPdf(jpegBytes, imgW, imgH) {
  const pageW = 595.28, pageH = 841.89, margin = 28;
  const availW = pageW - margin * 2, availH = pageH - margin * 2;
  const scale = Math.min(availW / imgW, availH / imgH);
  const w = imgW * scale, h = imgH * scale;
  const x = (pageW - w) / 2, y = (pageH - h) / 2;
  const content = `q\n${x.toFixed(2)} ${y.toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)} cm\n/Im0 Do\nQ\n`;
  const enc = (s) => new TextEncoder().encode(s);
  const contentBytes = enc(content);

  const objects = [
    enc('<< /Type /Catalog /Pages 2 0 R >>'),
    enc('<< /Type /Pages /Kids [3 0 R] /Count 1 >>'),
    enc(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageW} ${pageH}] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>`),
    enc(`<< /Type /XObject /Subtype /Image /Width ${imgW} /Height ${imgH} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpegBytes.length} >>`),
    enc(`<< /Length ${contentBytes.length} >>`)
  ];

  const parts = [];
  const offsets = [0];
  let offset = 0;
  const push = (bytes) => { parts.push(bytes); offset += bytes.length; };

  push(enc('%PDF-1.4\n'));
  objects.forEach((obj, i) => {
    offsets[i + 1] = offset;
    push(enc(`${i + 1} 0 obj\n`));
    push(obj);
    if (i === 3) {
      push(enc('\nstream\n'));
      push(jpegBytes);
      push(enc('\nendstream'));
    }
    if (i === 4) {
      push(enc('\nstream\n'));
      push(contentBytes);
      push(enc('\nendstream'));
    }
    push(enc('\nendobj\n'));
  });

  const xrefStart = offset;
  const count = objects.length + 1;
  let xref = `xref\n0 ${count}\n0000000000 65535 f \n`;
  for (let i = 1; i < count; i += 1) {
    xref += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  }
  push(enc(xref));
  push(enc(`trailer\n<< /Size ${count} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF\n`));

  return new Blob(parts, { type: 'application/pdf' });
}

async function _batchDocToPdfBlob(docHtml) {
  const { style, body } = _batchSplitDoc(docHtml);
  const canvas = await _batchRenderCanvas(style, body);
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.92));
  if (!blob) throw new Error('canvas render failed');
  const buf = await blob.arrayBuffer();
  return _batchJpegToPdf(new Uint8Array(buf), canvas.width, canvas.height);
}

async function batchExportApplyPdf(ids) {
  const list = ids.map((id) => db.applies.find((x) => x.id === id)).filter(Boolean);
  if (!list.length) { toast('请先勾选要导出的申请'); return; }
  if (typeof JSZip === 'undefined' || typeof html2canvas === 'undefined') { toast('导出组件未加载，请刷新页面重试'); return; }
  toast(`正在打包 ${list.length} 份申请表 PDF…`);
  try {
    const zip = new JSZip();
    const folder = zip.folder('申请表PDF_' + today().replace(/[-: ]/g, ''));
    for (const a of list) {
      const doc = applyBatchDoc(a);
      const pdf = await _batchDocToPdfBlob(doc);
      const fname = `${_batchSafeName(a.typeName)}_${_batchSafeName(a.name)}_${a.sno || '编号'}.pdf`;
      folder.file(fname, await pdf.arrayBuffer());
    }
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    downloadBlob(zipBlob, `申请表批量导出_${today().replace(/[-: ]/g, '')}.zip`);
    commit('批量导出申请表PDF', `打包 ${list.length} 份：` + list.map((a) => `${a.typeName}·${a.name}`).join('、'));
    toast(`已打包 ${list.length} 份申请表 PDF`);
  } catch (e) {
    console.error(e);
    toast('批量导出失败，请逐条导出');
  }
}
