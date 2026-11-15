/* ---------------- 信息收集 ---------------- */
function collectCard(c) {
  const mine = c.submissions.find((s) => s.name === cur.name);
  const ops = [];
  if (isPublisher()) {
    ops.push(`<button class="link-btn" data-collect-view="${c.id}">查看提交</button>`);
    ops.push(`<button class="link-btn" data-collect-export="${c.id}">导出</button>`);
    if (c.status === '进行中') ops.push(`<button class="link-btn" data-collect-close="${c.id}">结束收集</button>`);
    ops.push(`<button class="link-btn del" data-collect-del="${c.id}">删除</button>`);
  } else if (c.status === '进行中') {
    ops.push(`<button class="link-btn" data-collect-fill="${c.id}">${mine ? '修改我的填写' : '去填写'}</button>`);
    if (mine) ops.push(`<button class="link-btn" data-collect-mine="${c.id}">查看我的填写</button>`);
  } else if (mine) {
    ops.push(`<button class="link-btn" data-collect-mine="${c.id}">查看我的填写</button>`);
  }
  return `<div class="card collect-card">
    <div class="card-head">
      <div><h2>${esc(c.title)} ${badge(c.status)}</h2><div class="sub">${esc(c.desc || '')}</div></div>
      <div class="row-actions">${ops.join('')}</div>
    </div>
    <div class="collect-meta">
      <span>发布：${esc(c.publisher)}（${esc(ROLE_NAMES[c.publisherRole] || c.publisherRole)}）</span>
      <span>截止：${esc(c.deadline || '不限')}</span>
      <span>收集项：${esc(c.fields.join('、'))}</span>
      <span>已提交 ${c.submissions.length} 份${mine ? '（我已提交）' : ''}</span>
    </div>
  </div>`;
}

function renderCollect() {
  const list = db.collects.slice().sort((a, b) => (a.status === b.status ? 0 : a.status === '进行中' ? -1 : 1));
  $('#views').innerHTML = `
    ${isPublisher() ? `<div class="card"><div class="card-head">
      <div><h2>发布收集任务</h2><div class="sub">由部长、副部长或主席、副主席发布，成员与普通学生在线填写，数据可导出</div></div>
      <button class="primary-btn" id="addCollect">+ 新建收集</button>
    </div></div>` : ''}
    ${list.length ? list.map(collectCard).join('') : '<div class="card"><div class="empty">暂无收集任务</div></div>'}`;

  if ($('#addCollect')) $('#addCollect').onclick = () => {
    openForm({
      title: '新建信息收集',
      okText: '发布',
      hint: '收集项用顿号或逗号分隔，例如：姓名,学号,班级,联系电话。',
      fields: [
        { key: 'title', label: '收集主题', required: true },
        { key: 'desc', label: '填写说明', type: 'textarea' },
        { key: 'fields', label: '收集项（逗号分隔）', required: true },
        { key: 'deadline', label: '截止日期', type: 'date' }
      ],
      values: { fields: '姓名,学号,班级,联系电话', deadline: '2026-11-20' },
      onSubmit(d) {
        const fields = d.fields.split(/[,，、]/).map((s) => s.trim()).filter(Boolean);
        if (!fields.length) { toast('请至少填写一个收集项'); return; }
        db.collects.unshift({ id: uid('c'), title: d.title, desc: d.desc, fields, publisher: cur.name, publisherRole: cur.role, date: today(), deadline: d.deadline, status: '进行中', submissions: [] });
        commit('发布信息收集', d.title); render(); toast('收集任务已发布');
      }
    });
  };

  document.querySelectorAll('[data-collect-fill]').forEach((b) => {
    b.onclick = () => {
      const c = db.collects.find((x) => x.id === b.dataset.collectFill);
      const mine = c.submissions.find((s) => s.name === cur.name);
      openForm({
        title: (mine ? '修改填写 · ' : '填写 · ') + c.title,
        okText: '提交',
        hint: esc(c.desc || '请如实填写以下信息。'),
        fields: c.fields.map((f) => ({ key: f, label: f, required: ['姓名', '学号'].includes(f) })),
        values: mine ? mine.values : { '姓名': cur.name, '部门': cur.dept, '班级': cur.class || '' },
        onSubmit(d) {
          if (mine) Object.assign(mine, { values: d, date: today() });
          else c.submissions.push({ name: cur.name, dept: cur.dept, date: today(), values: d });
          commit('提交信息收集', c.title); render(); toast('已提交');
        }
      });
    };
  });

  document.querySelectorAll('[data-collect-mine]').forEach((b) => {
    b.onclick = () => {
      const c = db.collects.find((x) => x.id === b.dataset.collectMine);
      const mine = c.submissions.find((s) => s.name === cur.name);
      openInfo('我的填写 · ' + c.title, `<div class="info-list">${c.fields.map((f) => `<div><span>${esc(f)}</span><strong>${esc(mine.values[f] || '—')}</strong></div>`).join('')}</div>`, '提交时间：' + mine.date);
    };
  });

  document.querySelectorAll('[data-collect-view]').forEach((b) => {
    b.onclick = () => {
      const c = db.collects.find((x) => x.id === b.dataset.collectView);
      const head = ['姓名', '提交时间'].concat(c.fields).map((h) => `<th>${esc(h)}</th>`).join('');
      const rows = c.submissions.map((s) => `<tr><td>${esc(s.name)}</td><td>${esc(s.date)}</td>${c.fields.map((f) => `<td>${esc(s.values[f] || '')}</td>`).join('')}</tr>`).join('');
      openInfo('提交明细 · ' + c.title, `<div class="table-wrap"><table><thead><tr>${head}</tr></thead><tbody>${rows || `<tr><td colspan="${c.fields.length + 2}" class="empty">还没有人提交</td></tr>`}</tbody></table></div>`, '共 ' + c.submissions.length + ' 份提交，可点击导出下载 CSV。');
    };
  });

  document.querySelectorAll('[data-collect-export]').forEach((b) => {
    b.onclick = () => {
      const c = db.collects.find((x) => x.id === b.dataset.collectExport);
      openExportPicker(c.title + '_' + today(), ['姓名', '提交时间'].concat(c.fields), c.submissions.map((s) => [s.name, s.date].concat(c.fields.map((f) => s.values[f] || ''))));
      commit('导出收集数据', c.title);
    };
  });

  document.querySelectorAll('[data-collect-close]').forEach((b) => {
    b.onclick = () => {
      const c = db.collects.find((x) => x.id === b.dataset.collectClose);
      c.status = '已结束';
      commit('结束信息收集', c.title); save(); render(); toast('收集已结束');
    };
  });
  document.querySelectorAll('[data-collect-del]').forEach((b) => {
    b.onclick = () => {
      const c = db.collects.find((x) => x.id === b.dataset.collectDel);
      if (!confirm(`删除收集「${c.title}」后数据不可恢复，确定继续？`)) return;
      db.collects = db.collects.filter((x) => x.id !== c.id);
      commit('删除信息收集', c.title); save(); render(); toast('收集已删除');
    };
  });
}

/* ---------------- 活动报名 ---------------- */
function eventCard(e) {
  const signed = e.signups.some((s) => s.name === cur.name);
  const full = e.signups.length >= e.quota;
  const ops = [];
  if (e.status === '报名中') {
    if (signed) ops.push(`<button class="link-btn del" data-event-cancel="${e.id}">取消报名</button>`);
    else ops.push(`<button class="link-btn" data-event-sign="${e.id}">${full ? '名额已满' : '我要报名'}</button>`);
  }
  if (isPublisher()) {
    ops.push(`<button class="link-btn" data-event-list="${e.id}">报名名单</button>`);
    ops.push(`<button class="link-btn" data-event-export="${e.id}">导出名单</button>`);
    if (e.status === '报名中') ops.push(`<button class="link-btn del" data-event-close="${e.id}">截止报名</button>`);
  }
  return `<div class="card collect-card">
    <div class="card-head">
      <div><h2>${esc(e.title)} ${badge(e.status)}</h2><div class="sub">${esc(e.desc || '')}</div></div>
      <div class="row-actions">${ops.join('')}</div>
    </div>
    <div class="collect-meta">
      <span>时间：${esc(e.time)}</span><span>地点：${esc(e.place)}</span>
      <span>名额：${e.signups.length}/${e.quota}</span>
      <span>发布：${esc(e.publisher)}（${esc(ROLE_NAMES[e.publisherRole] || e.publisherRole)}）</span>
      ${signed ? '<span class="badge green">我已报名</span>' : ''}
    </div>
  </div>`;
}

function renderEvent() {
  const list = db.events.slice().sort((a, b) => (a.status === b.status ? 0 : a.status === '报名中' ? -1 : 1));
  $('#views').innerHTML = `
    ${isPublisher() ? `<div class="card"><div class="card-head">
      <div><h2>发布活动报名</h2><div class="sub">由部长、副部长或主席、副主席发布，成员与普通学生在线报名</div></div>
      <button class="primary-btn" id="addEvent">+ 发布活动</button>
    </div></div>` : ''}
    ${list.length ? list.map(eventCard).join('') : '<div class="card"><div class="empty">暂无活动</div></div>'}`;

  if ($('#addEvent')) $('#addEvent').onclick = () => {
    openForm({
      title: '发布活动报名',
      okText: '发布',
      fields: [
        { key: 'title', label: '活动名称', required: true },
        { key: 'desc', label: '活动说明', type: 'textarea' },
        { key: 'time', label: '活动时间', placeholder: '2026-11-20 09:00', required: true },
        { key: 'place', label: '活动地点', required: true },
        { key: 'quota', label: '报名名额', type: 'number', required: true }
      ],
      values: { quota: 30, time: '2026-11-20 09:00', place: '学院广场' },
      onSubmit(d) {
        db.events.unshift({ id: uid('e'), title: d.title, desc: d.desc, time: d.time, place: d.place, quota: d.quota, publisher: cur.name, publisherRole: cur.role, date: today(), status: '报名中', signups: [] });
        commit('发布活动报名', d.title); render(); toast('活动已发布，成员可开始报名');
      }
    });
  };

  document.querySelectorAll('[data-event-sign]').forEach((b) => {
    b.onclick = () => {
      const e = db.events.find((x) => x.id === b.dataset.eventSign);
      if (e.status !== '报名中') { toast('该活动已截止报名'); return; }
      if (e.signups.length >= e.quota) { toast('名额已满'); return; }
      e.signups.push({ name: cur.name, sno: cur.sno || '—', dept: cur.dept, date: today(), status: '已报名' });
      commit('活动报名', e.title); render(); toast('报名成功：' + e.title);
    };
  });
  document.querySelectorAll('[data-event-cancel]').forEach((b) => {
    b.onclick = () => {
      const e = db.events.find((x) => x.id === b.dataset.eventCancel);
      e.signups = e.signups.filter((s) => s.name !== cur.name);
      commit('取消报名', e.title); save(); render(); toast('已取消报名');
    };
  });
  document.querySelectorAll('[data-event-list]').forEach((b) => {
    b.onclick = () => {
      const e = db.events.find((x) => x.id === b.dataset.eventList);
      const canManage = isPublisher();
      openInfo('报名名单 · ' + e.title, `<div class="table-wrap"><table>
        <thead><tr><th>姓名</th><th>学号</th><th>部门</th><th>报名时间</th><th>状态</th>${canManage ? '<th>操作</th>' : ''}</tr></thead>
        <tbody>${e.signups.map((s, i) => `<tr><td>${esc(s.name)}</td><td>${esc(s.sno || '—')}</td><td>${esc(s.dept)}</td><td>${esc(s.date)}</td><td>${badge(s.status || '已报名')}</td>${canManage ? `<td><button class="link-btn del" data-signup-del="${e.id}" data-idx="${i}">删除</button></td>` : ''}</tr>`).join('') || '<tr><td colspan="6" class="empty">还没有人报名</td></tr>'}</tbody>
      </table></div>`, `名额 ${e.signups.length}/${e.quota}；删除报名记录后立即释放名额，且该成员不再计入本次活动出勤统计。`);
      if (canManage) document.querySelectorAll('[data-signup-del]').forEach((x) => {
        x.onclick = () => {
          const target = e.signups[Number(x.dataset.idx)];
          if (!confirm(`确定删除「${target.name}」在「${e.title}」的报名记录？删除后释放名额。`)) return;
          e.signups.splice(Number(x.dataset.idx), 1);
          commit('删除报名记录', `${e.title} · ${target.name}`); save(); render(); toast('报名记录已删除，名额已释放');
        };
      });
    };
  });
  document.querySelectorAll('[data-event-export]').forEach((b) => {
    b.onclick = () => {
      const e = db.events.find((x) => x.id === b.dataset.eventExport);
      openExportPicker(e.title + '_报名名单_' + today(), ['姓名', '部门', '报名时间'], e.signups.map((s) => [s.name, s.dept, s.date]));
      commit('导出报名名单', e.title);
    };
  });
  document.querySelectorAll('[data-event-close]').forEach((b) => {
    b.onclick = () => {
      const e = db.events.find((x) => x.id === b.dataset.eventClose);
      e.status = '已截止';
      commit('截止活动报名', e.title); save(); render(); toast('报名已截止');
    };
  });
}

/* ---------------- 考勤 ---------------- */
let curSessionId = null;
function renderAttendance() {
  const active = db.members.filter((m) => m.status === '在任' && m.dept === cur.dept);
  if (!db.sessions.length) {
    $('#views').innerHTML = `<div class="card"><div class="card-head"><div><h2>考勤签到</h2></div>
      <button class="primary-btn" id="addSession">+ 新建例会</button></div><div class="empty">还没有例会记录</div></div>`;
    $('#addSession').onclick = () => sessionForm();
    return;
  }
  if (!curSessionId || !db.sessions.some((s) => s.id === curSessionId)) curSessionId = db.sessions[0].id;
  const s = db.sessions.find((x) => x.id === curSessionId);
  const present = active.filter((m) => s.records[m.id]).length;

  $('#views').innerHTML = `
    <div class="card">
      <div class="card-head">
        <div><h2>例会签到</h2><div class="sub">点击姓名切换「已到 / 未到」，改动自动保存（仅统计本部门在任成员）</div></div>
        <div class="toolbar">
          <select class="filter" id="sessionPick">${db.sessions.map((x) => `<option value="${x.id}"${x.id === s.id ? ' selected' : ''}>${esc(x.date)} · ${esc(x.title)}</option>`).join('')}</select>
          <button class="primary-btn light" id="addSession">+ 新建例会</button>
        </div>
      </div>
      <div class="att-grid">${active.map((m) => `<button class="att-chip${s.records[m.id] ? ' on' : ''}" data-att="${m.id}">${esc(m.name)} · ${esc(m.title)}</button>`).join('') || '<span class="empty">本部门暂无在任成员</span>'}</div>
      <div class="att-summary">
        <span>应到 ${active.length} 人</span>
        <span>实到 <strong style="color:#14915b">${present}</strong> 人</span>
        <span>出勤率 ${active.length ? Math.round((present / active.length) * 100) : 0}%</span>
      </div>
    </div>`;

  $('#sessionPick').onchange = (ev) => { curSessionId = ev.target.value; renderAttendance(); };
  $('#addSession').onclick = () => sessionForm();
  document.querySelectorAll('[data-att]').forEach((b) => {
    b.onclick = () => {
      const mid = b.dataset.att;
      s.records[mid] = !s.records[mid];
      commit('例会签到', `${s.title} · ${mid}`); save(); renderAttendance(); toast(s.records[mid] ? '已签到' : '已取消签到');
    };
  });
}
function sessionForm() {
  openForm({
    title: '新建例会',
    fields: [
      { key: 'title', label: '例会主题', required: true },
      { key: 'date', label: '会议日期', type: 'date', required: true }
    ],
    values: { title: '部门例会', date: today() },
    onSubmit(d) {
      const s = Object.assign({ id: uid('s'), records: {} }, d);
      db.sessions.push(s); curSessionId = s.id;
      commit('新建例会', d.title); save(); renderAttendance(); toast('例会已创建');
    }
  });
}

/* ---------------- 物资 ---------------- */
function renderAsset() {
  $('#views').innerHTML = `
    <div class="card">
      <div class="card-head">
        <div><h2>物资台账</h2><div class="sub">在库 ${db.assets.filter((t) => t.status === '在库').length} 项，借出 ${db.assets.filter((t) => t.status === '借出').length} 项</div></div>
        <button class="primary-btn" id="addAsset">+ 新增物资</button>
      </div>
      <div class="table-wrap"><table>
        <thead><tr><th>物资名称</th><th>数量</th><th>状态</th><th>借用部门 / 人</th><th>借出日期</th><th>应还日期</th><th>操作</th></tr></thead>
        <tbody>${db.assets.map((t) => `
          <tr><td><strong>${esc(t.name)}</strong></td><td>${t.qty}</td><td>${badge(t.status)}</td>
            <td>${esc(t.borrower) || '—'}</td><td>${esc(t.date) || '—'}</td><td>${esc(t.due) || '—'}</td>
            <td><div class="row-actions">
              <button class="link-btn" data-borrow="${t.id}">${t.status === '在库' ? '借出登记' : '归还入库'}</button>
              <button class="link-btn del" data-asset-del="${t.id}">删除</button>
            </div></td></tr>`).join('')}</tbody>
      </table></div>
    </div>`;

  $('#addAsset').onclick = () => {
    openForm({
      title: '新增物资',
      fields: [
        { key: 'name', label: '物资名称', required: true },
        { key: 'qty', label: '数量', type: 'number', required: true }
      ],
      values: { qty: 1 },
      onSubmit(d) {
        db.assets.push({ id: uid('t'), name: d.name, qty: d.qty, borrower: '', date: '', due: '', status: '在库' });
        commit('新增物资', d.name); save(); renderAsset(); toast('物资已添加');
      }
    });
  };
  document.querySelectorAll('[data-asset-del]').forEach((b) => {
    b.onclick = () => {
      db.assets = db.assets.filter((x) => x.id !== b.dataset.assetDel);
      commit('删除物资', b.dataset.assetDel); save(); renderAsset(); toast('物资已删除');
    };
  });
  document.querySelectorAll('[data-borrow]').forEach((b) => {
    b.onclick = () => {
      const t = db.assets.find((x) => x.id === b.dataset.borrow);
      if (t.status === '借出') {
        Object.assign(t, { status: '在库', borrower: '', date: '', due: '' });
        commit('物资归还', t.name); save(); renderAsset(); toast('已归还入库');
        return;
      }
      openForm({
        title: '借出登记 · ' + t.name,
        fields: [
          { key: 'borrower', label: '借用部门 / 人', required: true },
          { key: 'date', label: '借出日期', type: 'date', required: true },
          { key: 'due', label: '应还日期', type: 'date', required: true }
        ],
        values: { borrower: cur.dept, date: today(), due: today() },
        onSubmit(d) { Object.assign(t, d, { status: '借出' }); commit('物资借出', `${t.name} → ${d.borrower}`); save(); renderAsset(); toast('借出登记完成'); }
      });
    };
  });
}

/* ---------------- 个人信息 ---------------- */
const PERMISSIONS = {
  admin: ['系统全部模块与数据的管理权限', '查看系统监测：数据规模、存储占用、运行状态', '查看、导出与清空操作日志', '人事任免、部门终审、活动与请假审批', '考核主席团成员', '发布信息收集与活动报名'],
  teacher: ['责任教师拥有全部后台权限，与主席团权限等同并具备最终审核权', '活动三级审批终审、换届竞选终审', '调整考核配置、导出全系统台账', '查看全部角色操作轨迹，操作日志单独标识', '查看任一模块与历史档案'],
  presidium: ['主席、副主席拥有全部业务权限', '审批活动与请假、任免成员、管理部门', '考核部长/副部长，复核部内成员考核', '发布通知、信息收集与活动报名', '提交/撤销本人请假'],
  minister: ['维护本部门信息与成员（成员数自动同步）', '申请/修改/撤销部门活动', '考核部内成员并提交复核', '审批部内成员与普通学生请假、各类申请', '发布通知、信息收集与活动报名', '修改个人资料与密码'],
  student: ['查看部门信息与通知', '提交各类线上申请', '提交请假申请', '报名已发布的活动', '填写并提交信息收集表', '修改个人资料与密码']
};

function renderProfile() {
  /* 以成员档案为准展示资料（账号为登录标识，密码不展示、不同步） */
  const mem = db.members.find((m) => m.account === cur.username)
    || db.members.find((m) => m.name === cur.name && (m.sno === cur.sno || m.sno === '—'));
  const P = mem || cur;
  const field = (v) => (v == null || v === '' || v === '—') ? '—' : v;
  $('#views').innerHTML = `
    <div class="grid-2">
      <div class="card">
        <div class="card-head"><div><h2>个人信息</h2><div class="sub">资料与管理员导入的成员档案同步，账号与密码不在此展示</div></div></div>
        <div class="info-list">
          <div><span>姓名</span><strong>${esc(field(P.name))}</strong></div>
          <div><span>账号</span><strong>${esc(cur.username)}</strong></div>
          <div><span>角色</span><strong>${esc(ROLE_NAMES[cur.role])}</strong></div>
          <div><span>性别</span><strong>${esc(field(P.gender))}</strong></div>
          <div><span>族别</span><strong>${esc(field(P.ethnicity))}</strong></div>
          <div><span>政治面貌</span><strong>${esc(field(P.politics))}</strong></div>
          <div><span>部门</span><strong>${esc(field(P.dept))}</strong></div>
          <div><span>职务</span><strong>${esc(field(P.title))}</strong></div>
          <div><span>学号</span><strong>${esc(field(P.sno))}</strong></div>
          <div><span>班级</span><strong>${esc(field(P.class))}</strong></div>
          <div><span>联系电话</span><strong>${esc(field(P.phone))}</strong></div>
        </div>
        <div class="row-actions" style="margin-top:16px">
          <button class="primary-btn" id="editSelf">修改资料</button>
          <button class="primary-btn light" id="changePwd">修改密码</button>
        </div>
      </div>
      <div class="card">
        <div class="card-head"><div><h2>我的权限</h2><div class="sub">依据角色分工与需求文档</div></div></div>
        <div class="perm-list">${PERMISSIONS[cur.role].map((p) => `<div class="perm-item"><span class="dot"></span>${esc(p)}</div>`).join('')}</div>
      </div>
    </div>`;

  $('#editSelf').onclick = () => {
    openForm({
      title: '修改个人资料',
      fields: [
        { key: 'name', label: '姓名', required: true },
        { key: 'gender', label: '性别', type: 'select', options: ['男', '女'] },
        { key: 'ethnicity', label: '族别' },
        { key: 'politics', label: '政治面貌', type: 'select', options: ['群众', '共青团员', '中共预备党员', '中共党员'] },
        { key: 'class', label: '班级' },
        { key: 'phone', label: '联系电话' }
      ],
      values: { name: P.name, gender: P.gender || '男', ethnicity: P.ethnicity || '汉族', politics: P.politics || '共青团员', class: P.class || '', phone: P.phone || '' },
      onSubmit(d) {
        const acc = db.accounts.find((a) => a.username === cur.username);
        const m2 = db.members.find((m) => m.account === cur.username)
          || db.members.find((m) => m.name === cur.name && (m.sno === cur.sno || m.sno === '—'));
        const patch = { name: d.name, gender: d.gender, ethnicity: d.ethnicity, politics: d.politics, class: d.class, phone: d.phone };
        if (acc) Object.assign(acc, patch);
        if (m2) Object.assign(m2, patch);
        Object.assign(cur, patch);
        $('#userName').textContent = d.name;
        $('#userAvatar').textContent = d.name.slice(-1);
        commit('修改个人资料', d.name); save(); render(); toast('资料已更新');
      }
    });
  };

  $('#changePwd').onclick = () => {
    openForm({
      title: '修改密码',
      okText: '确认修改',
      hint: '新密码至少 6 位，修改后请使用新密码登录。',
      fields: [
        { key: 'old', label: '当前密码', type: 'password', required: true },
        { key: 'p1', label: '新密码', type: 'password', required: true },
        { key: 'p2', label: '确认新密码', type: 'password', required: true }
      ],
      onSubmit(d) {
        const acc = db.accounts.find((a) => a.username === cur.username);
        if (!acc) { toast('账号信息异常'); return; }
        if (acc.password !== d.old) { toast('当前密码不正确'); return; }
        if (d.p1.length < 6) { toast('新密码至少 6 位'); return; }
        if (d.p1 !== d.p2) { toast('两次输入的新密码不一致'); return; }
        acc.password = d.p1;
        commit('修改密码', acc.username); save(); toast('密码已修改，请牢记新密码');
      }
    });
  };
}

/* ---------------- 启动 ---------------- */
$('#today').textContent = new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' });
const saved = sessionStorage.getItem(SESS_KEY);
const initAcc = saved && db.accounts.find((a) => a.username === saved);
if (initAcc) enterApp(initAcc);
