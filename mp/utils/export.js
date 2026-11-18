/* 轻量 CSV 导出：写入本地文件后调起微信分享/打开（小程序不支持网页端 Blob/xlsx 解析） */
function toCSV(headers, rows) {
  const esc = (v) => {
    const s = v == null ? '' : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [headers.map(esc).join(',')].concat(rows.map((r) => r.map(esc).join(',')));
  return '﻿' + lines.join('\n');
}

function exportCSV(filename, headers, rows) {
  const csv = toCSV(headers, rows);
  const fs = wx.getFileSystemManager();
  const filePath = `${wx.env.USER_DATA_PATH}/${filename}.csv`;
  fs.writeFile({
    filePath, data: csv, encoding: 'utf8',
    success: () => {
      if (wx.shareFileMessage) {
        wx.shareFileMessage({ filePath, fail: () => wx.openDocument({ filePath, fail: () => wx.showToast({ title: '文件已生成：' + filename, icon: 'none' }) }) });
      } else {
        wx.openDocument({ filePath, fail: () => wx.showToast({ title: '文件已生成：' + filename, icon: 'none' }) });
      }
    },
    fail: () => wx.showToast({ title: '导出失败', icon: 'none' })
  });
}

module.exports = { toCSV, exportCSV };
