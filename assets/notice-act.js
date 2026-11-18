/* ================= app7：通知公告 / 活动审批补丁层 =================
   覆盖 app2 的 renderNotice、renderActivity、actForm、canApproveActivity
   1) 通知公告：正文按段落/编号分段、首行缩进、规范行距；显示撰稿人、
      一审一校（部门部长）、二审二校（副主席）、三审三校（主席）；
      发文流程：部长申请 → 副主席审批 → 主席审批 → 发布（主席提交直接发布，保持不变）
   2) 活动审批：部门（部长）申请 → 主席审核 → 流程结束；本人不可审批本人
   ================================================================ */

/* 图片等比压缩：最长边 1000px、JPEG 0.75，避免云端体积膨胀 */
function ntCompressImage(file, cb) {
  const rd = new FileReader();
  rd.onload = () => {
    const img = new Image();
    img.onload = () => {
      const max = 1000;
      let w = img.width, h = img.height;
      if (Math.max(w, h) > max) { const k = max / Math.max(w, h); w = Math.round(w * k); h = Math.round(h * k); }
      const cv = document.createElement('canvas');
      cv.width = w; cv.height = h;
      cv.getContext('2d').drawImage(img, 0, 0, w, h);
      cb(cv.toDataURL('image/jpeg', 0.75));
    };
    img.onerror = () => cb('');
    img.src = rd.result;
  };
  rd.readAsDataURL(file);
}

/* 正文排版：首行缩进、序号分段、行距统一；支持 [图片N] 占位插图，未标注的图片附在末尾 */
function fmtNoticeBody(text, images) {
  const imgs = Array.isArray(images) ? images.filter((x) => x && x.data) : [];
  const used = new Set();
  const imgBlock = (idx) => {
    const it = imgs[idx];
    if (!it) return '';
    used.add(idx);
    return `<div class="nt-img"><img src="${it.data}" alt="${esc(it.name || ('图片' + (idx + 1)))}"></div>`;
  };
  const renderSeg = (cls, segText) => {
    const parts = String(segText).split(/\[图片(\d+)\]/);
    let out = '';
    for (let i = 0; i < parts.length; i += 1) {
      if (i % 2 === 0) {
        const piece = parts[i].trim();
        if (piece) out += `<p class="${cls}">${esc(piece)}</p>`;
      } else {
        out += imgBlock(parseInt(parts[i], 10) - 1);
      }
    }
    return out;
  };

  const raw = String(text == null ? '' : text).replace(/\r\n?/g, '\n');
  let seg = raw;
  if (seg.indexOf('\n') === -1 && /[一二三四五六七八九十]+、/.test(seg)) {
    seg = seg.replace(/\s*([一二三四五六七八九十]+、)/g, '\n$1');
  }
  const html = [];
  let first = true;
  seg.split('\n').forEach((ln) => {
    const t = ln.replace(/[\t\u3000]/g, ' ').replace(/ {2,}/g, ' ').trim();
    if (!t) return;
    let cls = 'nt-p';
    if (first) cls = 'nt-to';
    else if (/^[一二三四五六七八九十]+、/.test(t)) cls = 'nt-h1';
    else if (/^（[一二三四五六七八九十]+）/.test(t) || /^\([一二三四五六七八九十]+\)/.test(t)) cls = 'nt-h2';
    else if (/^\d+\s*[\.、]/.test(t)) cls = 'nt-num';
    first = false;
    html.push(renderSeg(cls, t));
  });
  let out = html.join('');
  if (!out) out = renderSeg('nt-p', raw);
  const rest = [];
  imgs.forEach((it, i) => { if (!used.has(i)) rest.push(imgBlock(i)); });
  return out + rest.join('');
}

/* ---------------- 二、通知发文审批（撰稿→一审一校→二审二校→三审三校） ---------------- */
const NOTICE_TYPES = ['通知公告', '活动通知', '会议通知', '制度文件', '工作安排', '表彰公示', '招募公告', '提醒告知', '其他通知'];
/* 新闻动态：与通知公告同一套发文流程与版式，仅类型选项不同 */
const NEWS_TYPES = ['新闻动态', '系部动态', '活动快讯', '获奖喜讯', '工作简讯'];
const NOTICE_PENDING = ['待副主席审核', '待主席审核'];

function ntWriter(n) { return n.writer || n.publisherName || '—'; }
function ntIsSelf(n) { return !!(n.writer && cur && n.writer === cur.name); }
function ntStage(n) {
  const f = Array.isArray(n.flow) && n.flow.length ? n.flow : [];
  return f[n.stage || 0] || '';
}
function ntPending(n) { return NOTICE_PENDING.includes(n.status); }
function ntCanApprove(n) {
  if (!n || !cur) return false;
  if (!ntPending(n)) return false;
  if (ntIsSelf(n)) return false;          /* 本人不可审批本人 */
  if (cur.role === 'admin') return true;
  const s = ntStage(n);
  if (s === '副主席审核') return cur.title === '副主席';
  if (s === '主席审核') return cur.title === '主席';
  return false;
}
function ntSignHtml(n) {
  const c1 = n.check1, c2 = n.check2, c3 = n.check3;
  const t1 = c1 ? `${esc(c1.name)}` : '—';
  const t2 = c2 ? `${esc(c2.name)}` : '—';
  const t3 = c3 ? `${esc(c3.name)}` : (n.publisher === '主席团' ? `${esc(n.publisherName)}` : '—');
  return `<div class="notice-sign">
    <span>撰稿人：${esc(ntWriter(n))}</span>
    <span>一审一校：${t1}</span>
    <span>二审二校：${t2}</span>
    <span>三审三校：${t3}</span>
  </div>`;
}
function ntStamp(signs, label, dept) {
  signs.push({ name: cur.name, dept: dept || cur.dept || '', role: label, date: today() });
}

renderNotice = function () {
  const all = db.notices || [];
  const isNews = (n) => !!(n && n.cat === 'news');
  const mine = all.filter((n) => ntPending(n) && (ntCanApprove(n) || ntIsSelf(n) || allPower()));
  const newsList = all.filter((n) => n.status === '已发布' && isNews(n)).slice().reverse();
  const list = all.filter((n) => n.status === '已发布' && !isNews(n)).slice().reverse();

  const item = (n) => {
    const pend = ntPending(n);
    const stage = ntStage(n);
    const ops = [];
    if (ntCanApprove(n)) {
      ops.push(`<button class="link-btn" data-nt-pass="${n.id}">${stage === '副主席审核' ? '二审二校通过' : '三审三校通过'}</button>`);
      ops.push(`<button class="link-btn del" data-nt-reject="${n.id}">驳回</button>`);
    }
    if ((ntIsSelf(n) || allPower()) && (pend || n.status === '已发布')) {
      ops.push(`<button class="link-btn del" data-nt-withdraw="${n.id}">撤回${isNews(n) ? '新闻' : '通知'}</button>`);
    }
    return `<div class="notice-item ${pend ? 'notice-pend' : ''}">
      <h4><span class="badge ${isNews(n) ? 'green' : 'blue'}">${esc(n.type || (isNews(n) ? '新闻动态' : '通知公告'))}</span>${esc(n.title)}
        ${pend ? `<span class="badge amber">${esc(stage === '副主席审核' ? '待副主席审核' : '待主席审核')}</span>` : ''}</h4>
      <div class="notice-body">${fmtNoticeBody(n.content, n.images)}</div>
      ${n.attach ? `<div class="cell-sub" style="margin:6px 0">附件：<button class="link-btn" data-notice-file="${n.id}">${esc(n.attach)}</button></div>` : ''}
      ${n.reason ? `<div class="cell-sub" style="color:#c0392b">驳回原因：${esc(n.reason)}</div>` : ''}
      ${ntSignHtml(n)}
      <div class="notice-meta" style="display:flex;justify-content:space-between;align-items:center;gap:10px">
        <span>${esc(n.date || '')} · 发布：${esc(n.publisherName || '')}${n.scope && n.scope !== '全员' ? ` · 范围：${esc(n.scope)}` : ''}</span>
        <span class="row-actions">${ops.join('')}</span>
      </div>
    </div>`;
  };

  $('#views').innerHTML = `
    <div class="card">
      <div class="card-head">
        <div><h2>通知公告 · 新闻动态</h2><div class="sub">共 ${list.length + newsList.length} 条已发布（新闻 ${newsList.length} 条 · 通知 ${list.length} 条）；发文流程：部长申请 → 二审二校（副主席）→ 三审三校（主席）</div></div>
        <div class="toolbar" style="display:flex;gap:8px;flex-wrap:wrap">
          ${isPublisher() ? '<button class="primary-btn light" id="addNews">+ 发布新闻动态</button>' : ''}
          ${isPublisher() ? '<button class="primary-btn" id="addNotice">+ 发布通知</button>' : ''}
        </div>
      </div>
      ${mine.length ? `<div class="notice-block-title">待审核 / 我提交的（${mine.length}）</div>
      <div class="notice-list">${mine.map(item).join('')}</div>` : ''}
      <div class="notice-block-title">新闻动态（${newsList.length}）</div>
      <div class="notice-list">${newsList.map(item).join('') || '<div class="empty">暂无新闻动态</div>'}</div>
      <div class="notice-block-title">已发布公告</div>
      <div class="notice-list">${list.map(item).join('') || '<div class="empty">暂无通知</div>'}</div>
    </div>`;

  /* 通知与新闻共用同一套表单：类型不同、流程与版式完全一致 */
  const openSendForm = (kind) => {
    const isNewsKind = kind === 'news';
    const types = isNewsKind ? NEWS_TYPES : NOTICE_TYPES;
    let attach = { name: '', data: '' };
    let images = [];
    const body = openForm({
      title: isNewsKind ? '发布新闻动态' : '发布通知',
      hint: isNewsKind
        ? '与通知公告同一套发文流程：部长提交 → 二审二校（副主席）→ 三审三校（主席）；主席 / 管理员提交直接发布。正文可换行分段，一、二、三等序号自动分段缩进；可插入图片并用 [图片1] 定位。'
        : '部长提交后经副主席二审二校、主席三审三校后发布；主席提交直接发布。正文可直接换行分段，一、二、三等序号自动分段缩进；可插入图片并用 [图片1] 定位。',
      fields: [
        { key: 'type', label: isNewsKind ? '新闻类型' : '通知类型', type: 'select', options: types },
        { key: 'scope', label: '生效范围', type: 'select', options: ['全员', '指定部门', '部长团', '主席团'] },
        { key: 'title', label: isNewsKind ? '新闻标题' : '通知标题', required: true },
        { key: 'writer', label: '撰稿人', required: true },
        { key: 'content', label: isNewsKind ? '新闻内容' : '通知内容', type: 'textarea', required: true }
      ],
      values: { type: types[0], scope: '全员', writer: cur.name },
      extra: '<div class="field"><label>插入图片（可选，最多 5 张，自动压缩；正文中用 [图片1] 定位，未标注的图片附在末尾）</label>'
        + '<input type="file" id="nImgs" accept=".png,.jpg,.jpeg" multiple class="file-input">'
        + '<div class="form-hint" id="nImgsHint">尚未选择图片</div></div>'
        + '<div class="field"><label>附件（可选，≤800KB，支持文档 / 表格 / 图片，发布后可下载）</label>'
        + '<input type="file" id="nAttach" accept=".doc,.docx,.pdf,.xls,.xlsx,.png,.jpg,.jpeg,.txt" class="file-input"></div>',
      onSubmit(d) {
        const n = {
          id: uid('n'), cat: isNewsKind ? 'news' : 'notice', type: d.type, scope: d.scope,
          title: d.title, writer: d.writer, content: d.content,
          attach: attach.name, attachData: attach.data, images: images.slice(),
          date: today(), publisherName: cur.name, publisher: ROLE_NAMES[cur.role],
          check1: null, check2: null, check3: null, reason: '', flow: [], stage: 0, track: []
        };
        const t = cur.title || '';
        if (t === '主席' || ['admin', 'teacher'].includes(cur.role)) {
          n.status = '已发布';
          n.check3 = { name: cur.name, dept: cur.dept || '', role: '三审三校', date: today() };
          n.publisher = '主席团';
        } else if (t === '副主席') {
          n.status = '待主席审核';
          n.flow = ['主席审核']; n.stage = 0;
        } else {
          n.status = '待副主席审核';
          n.flow = ['副主席审核', '主席审核']; n.stage = 0;
          n.check1 = { name: cur.name, dept: cur.dept || '', role: '一审一校', date: today() };
        }
        db.notices.push(n);
        commit(isNewsKind ? '发布新闻动态' : '发布通知', d.title); render();
        toast(n.status === '已发布'
          ? (isNewsKind ? '新闻动态已发布' : '通知已发布')
          : '已提交，等待二审二校审核');
      }
    });

    body.querySelector('#nAttach').onchange = (e) => {
      const f = e.target.files[0];
      attach = { name: '', data: '' };
      if (!f) return;
      if (f.size > 800 * 1024) { toast('附件请控制在 800KB 以内'); e.target.value = ''; return; }
      attach.name = f.name;
      const rd = new FileReader();
      rd.onload = () => { attach.data = rd.result; };
      rd.readAsDataURL(f);
    };

    body.querySelector('#nImgs').onchange = async (e) => {
      const files = Array.from(e.target.files || []).slice(0, 5);
      const hint = body.querySelector('#nImgsHint');
      images = [];
      const ok = [];
      for (const f of files) {
        if (f.size > 3 * 1024 * 1024) { toast(`${f.name} 超过 3MB，已跳过`); continue; }
        const data = await new Promise((res) => ntCompressImage(f, res));
        if (data) { images.push({ name: f.name, data }); ok.push(f.name); }
      }
      if (!images.length) { if (hint) hint.textContent = '尚未选择图片'; return; }
      const ta = body.querySelector('#f_content');
      const markers = images.map((x, i) => `[图片${i + 1}]`).join('\n');
      if (ta && !/\[图片1\]/.test(ta.value)) {
        ta.value = (ta.value ? ta.value.replace(/\s+$/, '') + '\n' : '') + markers;
      }
      if (hint) hint.textContent = `已插入 ${images.length} 张：${ok.join('、')}（可在正文中移动 [图片N] 调整位置）`;
      toast(`已插入 ${images.length} 张图片`);
    };
  };

  if ($('#addNotice')) $('#addNotice').onclick = () => openSendForm('notice');
  if ($('#addNews')) $('#addNews').onclick = () => openSendForm('news');

  document.querySelectorAll('[data-nt-pass]').forEach((b) => {
    b.onclick = () => {
      const n = db.notices.find((x) => x.id === b.dataset.ntPass);
      if (!ntCanApprove(n)) { toast('当前岗位无权审核本条通知'); return; }
      const stage = ntStage(n);
      n.track = n.track || [];
      if (stage === '副主席审核') {
        n.check2 = { name: cur.name, dept: cur.dept || '', role: '二审二校', date: today() };
        n.flow = ['主席审核']; n.stage = 0; n.status = '待主席审核';
        n.track.push({ actor: cur.name, role: ROLE_NAMES[cur.role], action: '二审二校通过', time: today() });
        commit('通知二审', n.title); toast('二审二校通过，已转主席三审三校');
      } else {
        n.check3 = { name: cur.name, dept: cur.dept || '', role: '三审三校', date: today() };
        n.status = '已发布'; n.date = today(); n.publisherName = n.publisherName || cur.name; n.publisher = '主席团';
        n.track.push({ actor: cur.name, role: ROLE_NAMES[cur.role], action: '三审三校通过', time: today() });
        commit('通知三审', n.title); toast('三审三校通过，通知已发布');
      }
      save(); render();
    };
  });
  document.querySelectorAll('[data-nt-reject]').forEach((b) => {
    b.onclick = () => {
      const n = db.notices.find((x) => x.id === b.dataset.ntReject);
      if (!ntCanApprove(n)) { toast('当前岗位无权审核本条通知'); return; }
      openForm({
        title: '驳回通知 · ' + n.title,
        fields: [{ key: 'reason', label: '驳回原因', type: 'textarea', required: true }],
        onSubmit(d) {
          n.status = '已驳回'; n.reason = d.reason;
          n.track = n.track || [];
          n.track.push({ actor: cur.name, role: ROLE_NAMES[cur.role], action: '驳回', note: d.reason, time: today() });
          commit('驳回通知', `${n.title}：${d.reason}`); save(); render(); toast('已驳回通知');
        }
      });
    };
  });
  document.querySelectorAll('[data-notice-file]').forEach((b) => {
    b.onclick = () => {
      const n = db.notices.find((x) => x.id === b.dataset.noticeFile);
      if (n.attachData) {
        try {
          const arr = String(n.attachData).split(',');
          const mime = (arr[0].match(/data:([^;]+)/) || [, 'application/octet-stream'])[1];
          const bin = atob(arr[1] || '');
          const buf = new Uint8Array(bin.length);
          for (let i = 0; i < bin.length; i += 1) buf[i] = bin.charCodeAt(i);
          downloadBlob(new Blob([buf], { type: mime }), n.attach || (n.title + '.dat'));
          commit('下载通知附件', n.title);
          return;
        } catch (e) { /* 解码失败则回退为文本导出 */ }
      }
      const text = `通知标题：${n.title}\n撰稿人：${ntWriter(n)}\n一审一校：${n.check1 ? n.check1.name : '—'}\n二审二校：${n.check2 ? n.check2.name : '—'}\n三审三校：${n.check3 ? n.check3.name : '—'}\n发布人：${n.publisherName}\n发布时间：${n.date}\n生效范围：${n.scope || '全员'}\n附件：${n.attach}\n\n${n.content}`;
      downloadBlob(new Blob(['\ufeff' + text], { type: 'text/plain;charset=utf-8' }), (n.attach || n.title).replace(/\.[^.]+$/, '') + '.txt');
      commit('下载通知附件', n.title);
    };
  });
  document.querySelectorAll('[data-nt-withdraw]').forEach((b) => {
    b.onclick = () => {
      const n = db.notices.find((x) => x.id === b.dataset.ntWithdraw);
      if (!confirm(`确定撤回通知「${n.title}」？`)) return;
      n.status = '已撤回';
      commit('撤回通知', n.title); save(); render(); toast('通知已撤回');
    };
  });
};

/* ---------------- 三、活动审批：部门申请 → 主席审核结束 ---------------- */
const ACT_PENDING = ['待主席审核', '待主席团审核', '待教师审核'];
const ACT_FLOW = ['主席审核'];

function actIsSelf(a) {
  if (!cur || !a) return false;
  if (a.applicantSno && cur.sno) return String(a.applicantSno) === String(cur.sno);
  if (a.applicant) return a.applicant === cur.name;
  /* 历史数据无申请人记录：本部门负责人即为提交人，避免自审自驳 */
  return cur.role === 'minister' && a.dept === cur.dept;
}
canApproveActivity = function (a) {
  if (!a || !cur || !ACT_PENDING.includes(a.status)) return false;
  if (actIsSelf(a)) return false;
  if (cur.role === 'admin') return true;
  return cur.title === '主席';
};
function actIsOwner(a) {
  if (a.applicant) return a.applicant === cur.name;
  return cur.role === 'minister' && a.dept === cur.dept;
}
function actTrack(a) { return Array.isArray(a.track) ? a.track : (a.track = []); }

renderActivity = function () {
  $('#views').innerHTML = `
    <div class="card">
      <div class="card-head">
        <div><h2>活动信息表</h2><div class="sub">部门（部长）提交申请 → 主席审核通过即结束；本人不可审核本人提交的活动</div></div>
        ${cur.role === 'minister' ? '<button class="primary-btn" id="addAct">+ 申请部门活动</button>' : ''}
      </div>
      <div class="table-wrap"><table>
        <thead><tr><th>活动名称</th><th>承办部门</th><th>申请人</th><th>协同部门及人数</th><th>总人数</th><th>时间</th><th>地点</th><th>状态</th><th>操作</th></tr></thead>
        <tbody>${db.activities.map((a) => {
    const collab = a.collaborators && a.collaborators.length ? a.collaborators.map((c) => `${c.dept} ${c.count}人`).join('、') : '无';
    const ops = [];
    if (ACT_PENDING.includes(a.status) && canApproveActivity(a)) {
      ops.push('<button class="link-btn" data-act-pass="' + a.id + '">主席审核通过</button>');
      ops.push('<button class="link-btn del" data-act-reject="' + a.id + '">驳回</button>');
    }
    if (actIsOwner(a)) {
      if (ACT_PENDING.includes(a.status) || a.status === '已驳回') ops.push('<button class="link-btn" data-act-edit="' + a.id + '">修改</button>');
      if (ACT_PENDING.includes(a.status) || a.status === '已通过') ops.push('<button class="link-btn del" data-act-revoke="' + a.id + '">撤销</button>');
    }
    if (cur.role === 'presidium') ops.push('<button class="link-btn del" data-act-del="' + a.id + '">删除</button>');
    const deptLeader = (db.departments.find((d) => d.name === a.dept) || {}).leader || '';
    const applicantName = a.applicant || deptLeader;
    const st = a.status === '待主席团审核' || a.status === '待教师审核' ? '待主席审核' : a.status;
    return `<tr>
      <td><strong>${esc(a.title)}</strong><div class="cell-sub">${esc(String(a.content || '').slice(0, 42))}</div></td>
      <td><span class="badge blue">${esc(a.dept)}</span></td>
      <td>${applicantName ? esc(applicantName) + `<div class="cell-sub">${esc(a.applicantTitle || '')}</div>` : '<span class="cell-sub">—</span>'}</td>
      <td>${esc(collab)}</td><td>${a.total}</td>
      <td class="nowrap">${esc(a.start)}<br>— ${esc(a.end)}</td><td>${esc(a.place)}</td>
      <td>${badge(st)}${a.reason ? `<div class="cell-sub">${esc(a.reason)}</div>` : ''}</td>
      <td><div class="row-actions">${ops.join('') || '<span class="cell-sub">—</span>'}</div></td></tr>`;
  }).join('') || '<tr><td colspan="9" class="empty">暂无活动</td></tr>'}</tbody>
      </table></div>
    </div>`;

  if ($('#addAct')) $('#addAct').onclick = () => actForm(null);
  document.querySelectorAll('[data-act-pass]').forEach((b) => {
    b.onclick = () => {
      const a = db.activities.find((x) => x.id === b.dataset.actPass);
      if (!canApproveActivity(a)) { toast('仅主席可审核活动申请，本人不可审核本人提交的活动'); return; }
      a.status = '已通过'; a.approver = '主席'; a.stage2 = cur.name; a.reason = '';
      actTrack(a).push({ actor: cur.name, role: ROLE_NAMES[cur.role], action: '主席审核通过', note: '', time: today() });
      commit('活动审核', `主席通过 ${a.title}`); save(); render(); toast('主席审核通过，流程结束');
    };
  });
  document.querySelectorAll('[data-act-reject]').forEach((b) => {
    b.onclick = () => {
      const a = db.activities.find((x) => x.id === b.dataset.actReject);
      if (!canApproveActivity(a)) { toast('仅主席可驳回活动申请，本人不可审核本人提交的活动'); return; }
      openForm({
        title: '驳回活动 · ' + a.title,
        fields: [{ key: 'reason', label: '驳回原因', type: 'textarea', required: true }],
        onSubmit(d) {
          a.status = '已驳回'; a.approver = ROLE_NAMES[cur.role]; a.reason = d.reason;
          actTrack(a).push({ actor: cur.name, role: ROLE_NAMES[cur.role], action: '驳回', note: d.reason, time: today() });
          commit('驳回活动', `${a.title}：${d.reason}`); save(); render(); toast('已驳回');
        }
      });
    };
  });
  document.querySelectorAll('[data-act-revoke]').forEach((b) => {
    b.onclick = () => {
      const a = db.activities.find((x) => x.id === b.dataset.actRevoke);
      if (!confirm(`确定撤销活动「${a.title}」？`)) return;
      a.status = '已撤回'; a.reason = '承办部门撤销申请';
      actTrack(a).push({ actor: cur.name, role: ROLE_NAMES[cur.role], action: '撤销申请', note: '', time: today() });
      commit('撤销活动', a.title); save(); render(); toast('活动已撤销');
    };
  });
  document.querySelectorAll('[data-act-del]').forEach((b) => {
    b.onclick = () => {
      const a = db.activities.find((x) => x.id === b.dataset.actDel);
      if (!a) return;
      if (!confirm(`确定删除活动「${a.title}」？删除后记录不可恢复。`)) return;
      db.activities = db.activities.filter((x) => x.id !== a.id);
      commit('删除活动申请', a.title); save(); render(); toast('活动申请已删除');
    };
  });
  document.querySelectorAll('[data-act-edit]').forEach((b) => { b.onclick = () => actForm(b.dataset.actEdit); });
};

actForm = function (id) {
  const a = id ? db.activities.find((x) => x.id === id) : {};
  const aPrefill = id ? Object.assign({}, a, { start: (a.start || '').replace(' ', 'T'), end: (a.end || '').replace(' ', 'T') }) : {};
  const others = db.departments.filter((d) => d.name !== cur.dept && d.status === '正常').map((d) => d.name);
  const c1 = a.collaborators && a.collaborators[0] ? a.collaborators[0] : { dept: '无', count: 0 };
  const c2 = a.collaborators && a.collaborators[1] ? a.collaborators[1] : { dept: '无', count: 0 };
  openForm({
    title: id ? '修改活动申请' : '申请部门活动',
    okText: id ? '保存修改' : '提交审批',
    hint: '提交后由主席审核，本人不可审核本人提交的活动。需填写协同部门及参与人数、总参与人数、时间地点与活动内容。',
    fields: [
      { key: 'title', label: '活动名称', required: true },
      { key: 'cdept1', label: '协同部门一', type: 'select', options: ['无'].concat(others) },
      { key: 'cnum1', label: '协同部门一参与人数', type: 'number' },
      { key: 'cdept2', label: '协同部门二', type: 'select', options: ['无'].concat(others) },
      { key: 'cnum2', label: '协同部门二参与人数', type: 'number' },
      { key: 'total', label: '总参与人数', type: 'number', required: true },
      { key: 'start', label: '开始时间', type: 'datetime-local', required: true },
      { key: 'end', label: '结束时间', type: 'datetime-local', required: true },
      { key: 'place', label: '活动地点', required: true },
      { key: 'content', label: '活动内容', type: 'textarea', required: true }
    ],
    values: Object.assign({ cdept1: others[0] || '无', cnum1: 5, cdept2: '无', cnum2: 0, total: 20, start: '2026-11-20 09:00', end: '2026-11-20 17:00', place: '学院广场', content: '' },
      a.id ? { cdept1: c1.dept, cnum1: c1.count, cdept2: c2.dept, cnum2: c2.count } : {}, aPrefill),
    onSubmit(d) {
      const collaborators = [];
      if (d.cdept1 !== '无') collaborators.push({ dept: d.cdept1, count: d.cnum1 });
      if (d.cdept2 !== '无') collaborators.push({ dept: d.cdept2, count: d.cnum2 });
      const base = { title: d.title, dept: cur.dept, collaborators, total: d.total, start: d.start.replace('T', ' '), end: d.end.replace('T', ' '), place: d.place, content: d.content, status: '待主席审核', approver: '', reason: '', stage: 0, flow: ACT_FLOW.slice() };
      if (id) {
        Object.assign(a, base);
        actTrack(a).push({ actor: cur.name, role: ROLE_NAMES[cur.role], action: '修改并重新提交', note: '', time: today() });
      } else {
        db.activities.push(Object.assign({
          id: uid('a'), applicant: cur.name, applicantTitle: cur.title || '成员',
          applicantSno: cur.sno || '', applyDate: today()
        }, base, { track: [{ actor: cur.name, role: ROLE_NAMES[cur.role], action: '提交申请', note: '', time: today() }] }));
      }
      commit(id ? '修改活动申请' : '提交活动申请', d.title); render();
      toast(id ? '已提交修改，等待主席审核' : '活动申请已提交，等待主席审核');
    }
  });
};
