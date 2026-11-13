/* 轻量 .xlsx 读取：解析 ZIP（raw deflate）+ 工作表 XML，输出 CSV 文本，无第三方依赖 */
(function (global) {
  const SIG_EOCD = 0x06054b50;
  const SIG_CDIR = 0x02014b50;

  const u16 = (dv, o) => dv.getUint16(o, true);
  const u32 = (dv, o) => dv.getUint32(o, true);

  function findEOCD(buf) {
    const dv = new DataView(buf);
    const len = dv.byteLength;
    const start = Math.max(0, len - 65557);
    for (let o = len - 22; o >= start; o--) {
      if (dv.getUint32(o, true) === SIG_EOCD) return o;
    }
    return -1;
  }

  async function inflateRaw(bytes) {
    const ds = new DecompressionStream('deflate-raw');
    const stream = new Blob([bytes]).stream().pipeThrough(ds);
    return new Response(stream).arrayBuffer();
  }

  async function readZipEntries(buf) {
    const dv = new DataView(buf);
    const eocd = findEOCD(buf);
    if (eocd < 0) throw new Error('不是有效的 xlsx 文件（ZIP 结构缺失）');
    let off = u32(dv, eocd + 16);
    const entries = {};
    while (off + 46 <= dv.byteLength && dv.getUint32(off, true) === SIG_CDIR) {
      const method = u16(dv, off + 10);
      const compSize = u32(dv, off + 20);
      const nameLen = u16(dv, off + 28);
      const extraLen = u16(dv, off + 30);
      const commentLen = u16(dv, off + 32);
      const localOff = u32(dv, off + 42);
      const name = new TextDecoder().decode(new Uint8Array(buf, off + 46, nameLen));
      const ldv = new DataView(buf, localOff);
      const lNameLen = u16(ldv, 26);
      const lExtraLen = u16(ldv, 28);
      const dataStart = localOff + 30 + lNameLen + lExtraLen;
      let bytes = new Uint8Array(buf, dataStart, compSize);
      if (method === 8) bytes = new Uint8Array(await inflateRaw(bytes));
      entries[name] = bytes;
      off += 46 + nameLen + extraLen + commentLen;
    }
    return entries;
  }

  function colIndex(ref) {
    const m = /^([A-Z]+)/.exec(ref || '');
    if (!m) return 0;
    let n = 0;
    for (const ch of m[1]) n = n * 26 + (ch.charCodeAt(0) - 64);
    return n - 1;
  }

  function parseShared(xml) {
    const doc = new DOMParser().parseFromString(xml, 'text/xml');
    const sis = Array.from(doc.getElementsByTagName('si'));
    return sis.map((si) => Array.from(si.getElementsByTagName('t')).map((t) => t.textContent || '').join(''));
  }

  function parseSheet(xml, shared) {
    const doc = new DOMParser().parseFromString(xml, 'text/xml');
    const rows = Array.from(doc.getElementsByTagName('row'));
    const aoa = [];
    for (const row of rows) {
      const cells = Array.from(row.getElementsByTagName('c'));
      const rowArr = [];
      for (const c of cells) {
        const ci = colIndex(c.getAttribute('r'));
        let val = '';
        const t = c.getAttribute('t');
        if (t === 's') {
          const v = c.getElementsByTagName('v')[0];
          val = shared[Number(v ? v.textContent : -1)] || '';
        } else if (t === 'inlineStr') {
          val = Array.from(c.getElementsByTagName('t')).map((x) => x.textContent || '').join('');
        } else {
          const v = c.getElementsByTagName('v')[0];
          val = v ? v.textContent || '' : '';
        }
        rowArr[ci] = val;
      }
      aoa.push(rowArr);
    }
    return aoa;
  }

  function csvCell(v) {
    const s = v == null ? '' : String(v);
    return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  }

  async function parseXlsxFile(file) {
    const buf = await file.arrayBuffer();
    const entries = await readZipEntries(buf);
    let shared = [];
    if (entries['xl/sharedStrings.xml']) {
      shared = parseShared(new TextDecoder().decode(entries['xl/sharedStrings.xml']));
    }
    const sheetName = Object.keys(entries).find((n) => /^xl\/worksheets\/sheet1\.xml$/.test(n))
      || Object.keys(entries).find((n) => /^xl\/worksheets\//.test(n));
    if (!sheetName) throw new Error('未找到工作表');
    const aoa = parseSheet(new TextDecoder().decode(entries[sheetName]), shared);
    return aoa.map((r) => r.map((x) => csvCell(x == null ? '' : x)).join(',')).join('\n');
  }

  global.parseXlsxFile = parseXlsxFile;
})(window);
