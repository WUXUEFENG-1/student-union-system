/* ---------------- 活动审批 ---------------- */
function canApproveActivity() { return allPower() || cur.role === 'minister'; }

function renderActivity() {
  $('#views').innerHTML = `
    <div class="card">
      <div class="card-head">
        <div><h2>活动信息表</h2><div class="sub">部长/副部长或主席团审批；主席、副主席与管理员拥有全部审批权限</div></div>
        ${cur.role === 'minister' ? '<button class="primary-btn" id="addAct">+ 申请部门活动</button>' : ''}
      </div>
      <div class="table-wrap"><table>
        <thead><tr><th>活动名称</th><th>承办部门</th><th>协同部门及人数</th><th>总人数</th><th>时间</th><th>地点</th><th>状态</th><th>操作</th></tr></thead>
        <tbody>${db.activities.map((a) => {
    const collab = a.collaborators.length ? a.collaborators.map((c) => `${c.dept} ${c.count}人`).join('、') : '无';
    const ops = [];
    const pending = ['待主席团审核', '待教师审核'].includes(a.status);
    if (pending && canApproveActivity()) {
      const passLabel = a.status === '待主席团审核' ? '主席团审核通过' : '责任教师终审通过';
      ops.push(`<button class="link-btn" data-act-pass="${a.id}">${passLabel}</button>`);
      ops.push(`<button class="link-btn del" data-act-reject="${a.id}">驳回</button>`);
    }
    if (cur.role === 'minister' && a.dept === cur.dept) {
      if (a.status === '待主席团审核' || a.status === '已驳回') ops.push(`<button class="link-btn" data-act-edit="${a.id}">修改</button>`);
      if (a.status === '待主席团审核' || a.status === '已通过') ops.push(`<button class="link-btn del" data-act-revoke="${a.id}">撤销</button>`);
    }
    return `<tr>
      <td><strong>${esc(a.title)}</strong><div class="cell-sub">${esc(a.content).slice(0, 42)}</div></td>
      <td><span class="badge blue">${esc(a.dept)}</span></td><td>${esc(collab)}</td><td>${a.total}</td>
      <td class="nowrap">${esc(a.start)}<br>— ${esc(a.end)}</td><td>${esc(a.place)}</td>
      <td>${badge(a.status)}${a.reason ? `<div class="cell-sub">${esc(a.reason)}</div>` : ''}</td>
      <td><div class="row-actions">${ops.join('') || '<span class="cell-sub">—</span>'}</div></td></tr>`;
  }).join('') || '<tr><td colspan="8" class="empty">暂无活动</td></tr>'}</tbody>
      </table></div>
    </div>`;

  if ($('#addAct')) $('#addAct').onclick = () => actForm(null);
  document.querySelectorAll('[data-act-pass]').forEach((b) => {
    b.onclick = () => {
      const a = db.activities.find((x) => x.id === b.dataset.actPass);
      if (a.status === '待主席团审核') {
        if (!allPower()) { toast('仅主席团及以上可进行一级审核'); return; }
        a.status = '待教师审核'; a.stage1 = cur.name; a.approver = '主席团';
        commit('活动一级审核', `主席团通过 ${a.title}`);
        toast('主席团审核通过，已转责任教师终审');
      } else if (a.status === '待教师审核') {
        if (!['admin', 'teacher'].includes(cur.role)) { toast('本节点需责任教师终审'); return; }
        a.status = '已通过'; a.stage2 = cur.name; a.approver = ROLE_NAMES[cur.role]; a.reason = '';
        commit('活动终审', `责任教师通过 ${a.title}`);
        toast('责任教师终审通过，活动已上架开放报名');
      }
      save(); render();
    };
  });
  document.querySelectorAll('[data-act-reject]').forEach((b) => {
    b.onclick = () => {
      const a = db.activities.find((x) => x.id === b.dataset.actReject);
      openForm({
        title: '驳回活动 · ' + a.title,
        fields: [{ key: 'reason', label: '驳回原因', type: 'textarea', required: true }],
        onSubmit(d) {
          a.status = '已驳回'; a.approver = ROLE_NAMES[cur.role]; a.reason = d.reason;
          commit('驳回活动', `${a.title}：${d.reason}`); render(); toast('已驳回');
        }
      });
    };
  });
  document.querySelectorAll('[data-act-revoke]').forEach((b) => {
    b.onclick = () => {
      const a = db.activities.find((x) => x.id === b.dataset.actRevoke);
      if (!confirm(`确定撤销活动「${a.title}」？`)) return;
      a.status = '已撤回'; a.reason = '承办部门撤销申请';
      commit('撤销活动', a.title); save(); render(); toast('活动已撤销');
    };
  });
  document.querySelectorAll('[data-act-edit]').forEach((b) => { b.onclick = () => actForm(b.dataset.actEdit); });
}

function actForm(id) {
  const a = id ? db.activities.find((x) => x.id === id) : {};
  const others = db.departments.filter((d) => d.name !== cur.dept && d.status === '正常').map((d) => d.name);
  const c1 = a.collaborators && a.collaborators[0] ? a.collaborators[0] : { dept: '无', count: 0 };
  const c2 = a.collaborators && a.collaborators[1] ? a.collaborators[1] : { dept: '无', count: 0 };
  openForm({
    title: id ? '修改活动申请' : '申请部门活动',
    okText: id ? '保存修改' : '提交审批',
    hint: '需确定协同部门及参与人数、总参与人数、时间地点与活动内容。',
    fields: [
      { key: 'title', label: '活动名称', required: true },
      { key: 'cdept1', label: '协同部门一', type: 'select', options: ['无'].concat(others) },
      { key: 'cnum1', label: '协同部门一参与人数', type: 'number' },
      { key: 'cdept2', label: '协同部门二', type: 'select', options: ['无'].concat(others) },
      { key: 'cnum2', label: '协同部门二参与人数', type: 'number' },
      { key: 'total', label: '总参与人数', type: 'number', required: true },
      { key: 'start', label: '开始时间', placeholder: '2026-11-20 09:00', required: true },
      { key: 'end', label: '结束时间', placeholder: '2026-11-20 17:00', required: true },
      { key: 'place', label: '活动地点', required: true },
      { key: 'content', label: '活动内容', type: 'textarea', required: true }
    ],
    values: Object.assign({ cdept1: others[0], cnum1: 5, cdept2: '无', cnum2: 0, total: 20, start: '2026-11-20 09:00', end: '2026-11-20 17:00', place: '学院广场', content: '' },
      a.id ? { cdept1: c1.dept, cnum1: c1.count, cdept2: c2.dept, cnum2: c2.count } : {}, a),
    onSubmit(d) {
      const collaborators = [];
      if (d.cdept1 !== '无') collaborators.push({ dept: d.cdept1, count: d.cnum1 });
      if (d.cdept2 !== '无') collaborators.push({ dept: d.cdept2, count: d.cnum2 });
      const payload = { title: d.title, dept: cur.dept, collaborators, total: d.total, start: d.start, end: d.end, place: d.place, content: d.content, status: '待主席团审核', approver: '', reason: '', stage1: '', stage2: '' };
      if (id) Object.assign(a, payload);
      else db.activities.push(Object.assign({ id: uid('a') }, payload));
      commit(id ? '修改活动申请' : '提交活动申请', d.title); render(); toast(id ? '已提交修改，等待审批' : '活动申请已提交，等待审批');
    }
  });
}

/* ---------------- 人事管理 ---------------- */
function canRemove(member) {
  if (allPower()) return true;
  if (cur.role === 'minister') return member.title === '成员' && member.dept === cur.dept;
  return false;
}

function renderPersonnel() {
  let list = db.members.filter((m) => m.status === '在任');
  if (cur.role === 'minister') list = list.filter((m) => m.dept === cur.dept);
  const canManage = allPower();
  $('#views').innerHTML = `
    <div class="card">
      <div class="card-head">
        <div><h2>人员信息表</h2><div class="sub">主席、副主席与管理员可任免、批量删除成员；部长/副部长可任免本部门成员</div></div>
        <div class="toolbar">
          <button class="primary-btn" id="importMembers">一键导入成员</button>
          <button class="primary-btn light" id="addMember">+ 新增成员</button>
          ${canManage ? '<button class="primary-btn light" id="bulkDeleteMembers">批量删除</button>' : ''}
          <button class="primary-btn light" id="exportMembers">导出成员</button>
        </div>
      </div>
      <div class="table-wrap"><table>
        <thead><tr>
          ${canManage ? '<th><input type="checkbox" id="checkAllMembers"></th>' : ''}
          <th>序号</th><th>姓名</th><th>性别</th><th>族别</th><th>政治面貌</th><th>所在班级</th><th>联系电话</th><th>部门</th><th>职务</th><th>学号</th><th>账号</th><th>状态</th><th>操作</th>
        </tr></thead>
        <tbody>${list.map((m, i) => `
          <tr>
            ${canManage ? `<td><input type="checkbox" class="member-check" data-mid="${m.id}"></td>` : ''}
            <td>${i + 1}</td>
            <td><div class="name-cell"><span class="mini-avatar">${esc(m.name.slice(-1))}</span>${esc(m.name)}</div></td>
            <td>${esc(m.gender || '—')}</td>
            <td>${esc(m.ethnicity || '—')}</td>
            <td>${esc(m.politics || '—')}</td>
            <td>${esc(m.class)}</td>
            <td>${esc(m.phone || '—')}</td>
            <td><span class="badge blue">${esc(m.dept)}</span></td>
            <td>${esc(m.title)}</td>
            <td>${esc(m.sno)}</td>
            <td>${esc(m.account || '—')}</td>
            <td>${badge(m.status)}</td>
            <td><div class="row-actions">
              ${allPower() ? `<button class="link-btn" data-promote="${m.id}">职务调整</button>` : ''}
              ${canRemove(m) ? `<button class="link-btn del" data-remove="${m.id}">罢免</button>` : ''}
              ${allPower() && !((db.accounts.find((a) => a.username === m.account) || {}).role === 'admin') ? `<button class="link-btn del" data-mem-del="${m.id}">删除</button>` : ''}
            </div></td>
          </tr>`).join('') || '<tr><td colspan="14" class="empty">暂无成员</td></tr>'}
        </tbody>
      </table></div>
    </div>
    <div class="card">
      <div class="card-head"><div><h2>人事异动记录</h2><div class="sub">共 ${db.personnel.length} 条</div></div></div>
      <div class="table-wrap"><table>
        <thead><tr><th>姓名</th><th>类型</th><th>变更</th><th>操作人</th><th>日期</th></tr></thead>
        <tbody>${db.personnel.slice().reverse().map((p) => `<tr><td>${esc(p.name)}</td><td>${p.action === '提升' ? '<span class="badge green">提升</span>' : '<span class="badge red">罢免</span>'}</td><td>${esc(p.from)} → ${esc(p.to)}</td><td>${esc(p.operator)}</td><td>${esc(p.date)}</td></tr>`).join('') || '<tr><td colspan="5" class="empty">暂无记录</td></tr>'}</tbody>
      </table></div>
    </div>`;

  $('#exportMembers').onclick = () => {
    const rows = db.members.map((m, i) => [i + 1, m.name, m.gender || '', m.ethnicity || '', m.politics || '', m.class, m.phone || '', m.dept, m.title, m.sno, m.account || '', m.status]);
    openExportPicker('学生会成员信息_' + today(), ['序号', '姓名', '性别', '族别', '政治面貌', '所在班级', '联系电话', '部门', '职务', '学号', '账号', '状态'], rows);
  };

  const checkAll = $('#checkAllMembers');
  if (checkAll) checkAll.onchange = () => {
    document.querySelectorAll('.member-check').forEach((c) => { c.checked = checkAll.checked; });
  };

  const bulkBtn = $('#bulkDeleteMembers');
  if (bulkBtn) bulkBtn.onclick = () => {
    const ids = [...document.querySelectorAll('.member-check:checked')].map((c) => c.dataset.mid);
    if (!ids.length) { toast('请先勾选要删除的成员'); return; }
    const targets = db.members.filter((m) => ids.includes(m.id));
    const locked = targets.filter((m) => { const acc = db.accounts.find((a) => a.username === m.account); return acc && acc.role === 'admin'; });
    const removable = targets.filter((m) => !locked.some((x) => x.id === m.id));
    if (!removable.length) { toast('管理员账号不可删除'); return; }
    if (!confirm(`确定删除选中的 ${removable.length} 名成员？将同时移除其登录账号，操作不可恢复。`)) return;
    removable.forEach((m) => { if (m.account) db.accounts = db.accounts.filter((a) => a.username !== m.account); });
    db.members = db.members.filter((m) => !removable.includes(m));
    commit('批量删除成员', removable.map((m) => m.name).join('、')); save(); render(); toast(`已删除 ${removable.length} 名成员`);
  };

  $('#importMembers').onclick = () => {
    const body = openForm({
      title: '一键导入成员',
      okText: '开始导入',
      hint: '每行一名成员，按「姓名,性别,族别,政治面貌,所在班级,联系电话,部门,学号,账号,初始密码,职务」排列，逗号或制表符分隔（可直接从 Excel 复制粘贴）；职务可填主席/副主席/部长/副部长/成员，留空默认为成员，系统按职务自动定身份；重复人员按学号自动同步更新，无需逐条修改。',
      fields: [{ key: 'rows', label: '成员数据', type: 'textarea', placeholder: '张三,男,汉族,共青团员,2026级经济管理1班,138****0001,宣传部,20260001,zhang01,123456,部长\n李四,女,汉族,群众,2026级会计1班,139****0002,秘书部,20260002,li02,123456,成员' }],
      extra: '<div class="field"><label>或选择 Excel / CSV 文件（.xlsx .csv .txt）</label><input type="file" id="csvFile" accept=".csv,.txt,.xlsx" class="file-input"></div>',
      onSubmit(d) {
        const result = importMembers(d.rows);
        commit('导入成员', `新增 ${result.added} 人，更新 ${result.updated} 人，跳过 ${result.skipped} 行`);
        render();
        toast(`导入完成：新增 ${result.added} 人，更新 ${result.updated} 人，跳过 ${result.skipped} 行`);
        if (result.messages.length) setTimeout(() => openInfo('导入结果说明', `<div class="perm-list">${result.messages.map((m) => `<div class="perm-item"><span class="dot"></span>${esc(m)}</div>`).join('')}</div>`), 300);
      }
    });
    body.querySelector('#csvFile').onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      readImportFile(file, body.querySelector('#f_rows'));
    };
  };

  $('#addMember').onclick = () => {
    openForm({
      title: '新增成员',
      fields: [
        { key: 'name', label: '姓名', required: true },
        { key: 'gender', label: '性别', type: 'select', options: ['男', '女'] },
        { key: 'ethnicity', label: '族别' },
        { key: 'politics', label: '政治面貌', type: 'select', options: ['群众', '共青团员', '中共预备党员', '中共党员'] },
        { key: 'sno', label: '学号', required: true },
        { key: 'class', label: '班级' },
        { key: 'phone', label: '联系电话' },
        { key: 'dept', label: '部门', placeholder: '如：宣传部 / 外联部' },
        { key: 'title', label: '职务', type: 'select', options: TITLES },
        { key: 'account', label: '登录账号' },
        { key: 'password', label: '初始密码' }
      ],
      values: { gender: '男', ethnicity: '汉族', politics: '共青团员', dept: cur.role === 'minister' ? cur.dept : '未加入', title: '成员' },
      onSubmit(d) {
        const deptName = d.dept || '未加入';
        db.members.push({ id: uid('m'), name: d.name, sno: d.sno, class: d.class || '—', dept: deptName, title: d.title, phone: d.phone || '', gender: d.gender, ethnicity: d.ethnicity || '汉族', politics: d.politics, account: d.account || '', status: '在任', joined: today() });
        if (d.account) {
          if (db.accounts.some((a) => a.username === d.account)) { toast('账号已存在，未创建登录账号'); }
          else if (!d.password || d.password.length < 6) { toast('初始密码不足 6 位，未创建登录账号'); }
          else db.accounts.push({ username: d.account, password: d.password, name: d.name, role: roleFromTitle(d.title), dept: deptName, title: d.title, sno: d.sno, class: d.class || '—', phone: d.phone || '', gender: d.gender, ethnicity: d.ethnicity || '汉族', politics: d.politics });
        }
        commit('新增成员', `${d.name} · ${d.dept} · ${d.title}`); render(); toast('成员已添加');
      }
    });
  };

  document.querySelectorAll('[data-promote]').forEach((b) => {
    b.onclick = () => {
      const m = db.members.find((x) => x.id === b.dataset.promote);
      openForm({
        title: '职务调整 · ' + m.name,
        fields: [
          { key: 'title', label: '新职务', type: 'select', options: TITLES },
          { key: 'dept', label: '所属部门', placeholder: '如：主席团 / 文体部 / 外联部' }
        ],
        values: { title: m.title, dept: m.dept },
        onSubmit(d) {
          db.personnel.push({ id: uid('p'), name: m.name, action: '提升', from: m.title, to: d.title, operator: cur.name, date: today() });
          m.title = d.title; m.dept = d.dept;
          const acc = db.accounts.find((a) => a.username === m.account);
          if (acc) {
            acc.title = d.title; acc.dept = d.dept;
            if (acc.role !== 'admin') acc.role = roleFromTitle(d.title);
          }
          commit('职务调整', `${m.name}：${m.title} → ${d.title}`); render(); toast('职务已调整');
        }
      });
    };
  });
  document.querySelectorAll('[data-remove]').forEach((b) => {
    b.onclick = () => {
      const m = db.members.find((x) => x.id === b.dataset.remove);
      if (!confirm(`确定罢免「${m.name}」的职务？罢免后状态为离任。`)) return;
      db.personnel.push({ id: uid('p'), name: m.name, action: '罢免', from: m.title, to: '离任', operator: cur.name, date: today() });
      m.status = '离任';
      commit('罢免成员', `${m.name} ${m.title}`); render(); toast('成员已罢免');
    };
  });
  document.querySelectorAll('[data-mem-del]').forEach((b) => {
    b.onclick = () => {
      const m = db.members.find((x) => x.id === b.dataset.memDel);
      const acc = db.accounts.find((a) => a.username === m.account);
      if (acc && acc.role === 'admin') { toast('管理员账号不可删除'); return; }
      if (!confirm(`确定删除成员「${m.name}」（${m.dept} · ${m.title}）？\n将同时移除其登录账号；历史考核与申请记录仍可归档查询，此操作不可恢复。`)) return;
      if (m.account) db.accounts = db.accounts.filter((a) => a.username !== m.account);
      db.members = db.members.filter((x) => x.id !== m.id);
      commit('删除成员', `${m.name} · ${m.dept} · ${m.title}`); save(); render(); toast('成员记录已删除');
    };
  });
}

function splitRow(line) {
  let cells = line.split(/\t|,|，|;|；/).map((c) => c.trim());
  if (cells.length === 1) cells = line.split(/\s+/);
  return cells;
}

function readImportFile(file, targetEl) {
  const fill = (text) => { targetEl.value = String(text).replace(/\r/g, ''); };
  if (/\.xlsx$/i.test(file.name)) {
    parseXlsxFile(file).then(fill).catch((err) => toast('Excel 解析失败：' + err.message));
  } else {
    const reader = new FileReader();
    reader.onload = () => fill(reader.result);
    reader.readAsText(file, 'utf-8');
  }
}

function importMembers(text) {
  const lines = String(text || '').split('\n').map((l) => l.trim()).filter(Boolean);
  let added = 0, updated = 0, skipped = 0;
  const messages = [];
  lines.forEach((line, idx) => {
    const cells = splitRow(line);
    const [name, gender, ethnicity, politics, cls, phone, dept, sno, account, password, titleLabel] = cells;
    if (!name || !sno) { skipped++; messages.push(`第 ${idx + 1} 行缺少姓名或学号，已跳过`); return; }
    if (name === '姓名' || sno === '学号') { skipped++; return; }
    const deptName = dept || '未加入';
    const titleName = normalizeTitle(titleLabel);
    const profile = { name, sno, class: cls || '—', dept: deptName, title: titleName, phone: phone || '', gender: gender || '', ethnicity: ethnicity || '汉族', politics: politics || '' };
    let mem = db.members.find((m) => m.sno === sno) || db.members.find((m) => m.name === name && m.sno === sno);
    if (mem) {
      Object.assign(mem, profile, { status: mem.status || '在任' });
      if (account) mem.account = account;
      const acc = db.accounts.find((a) => a.username === mem.account) || (account ? db.accounts.find((a) => a.username === account) : null);
      if (acc) Object.assign(acc, { name, dept: deptName, title: titleName, sno, class: profile.class, phone: profile.phone, gender: profile.gender, ethnicity: profile.ethnicity, politics: profile.politics, role: acc.role === 'admin' ? 'admin' : roleFromTitle(titleName) });
      updated++;
      messages.push(`第 ${idx + 1} 行「${name}」已按表同步更新`);
    } else {
      db.members.push(Object.assign({ id: uid('m'), account: account || '', status: '在任', joined: today() }, profile));
      if (account) {
        if (db.accounts.some((a) => a.username === account)) { messages.push(`第 ${idx + 1} 行账号「${account}」已存在，未重复创建`); }
        else if (!password || password.length < 6) { messages.push(`第 ${idx + 1} 行账号「${account}」初始密码不足 6 位，未创建登录账号`); }
        else db.accounts.push({ username: account, password, name, role: roleFromTitle(titleName), dept: deptName, title: titleName, sno, class: profile.class, phone: profile.phone, gender: profile.gender, ethnicity: profile.ethnicity, politics: profile.politics });
      }
      added++;
    }
  });
  return { added, updated, skipped, messages };
}

/* ---------------- 部门 ---------------- */
function deptMembers(name) { return db.members.filter((m) => m.dept === name && m.status === '在任'); }
function deptSummary(name) {
  const list = deptMembers(name);
  const lead = list.filter((m) => m.title === '部长').length;
  const viceLead = list.filter((m) => m.title === '副部长').length;
  const chair = list.filter((m) => ['主席', '副主席'].includes(m.title)).length;
  const member = list.filter((m) => m.title === '成员').length;
  const parts = [];
  if (chair) parts.push(`主席/副主席 ${chair}`);
  if (lead) parts.push(`部长 ${lead}`);
  if (viceLead) parts.push(`副部长 ${viceLead}`);
  if (member) parts.push(`成员 ${member}`);
  return { total: list.length, text: parts.join(' · ') || '暂无成员' };
}

function showDeptMembers(name) {
  if (cur.role === 'minister' && name !== cur.dept) { toast('部长/副部长仅可查看本部门成员'); return; }
  const list = deptMembers(name);
  const rows = list.map((m) => `<tr><td>${esc(m.name)}</td><td>${esc(m.sno)}</td><td>${esc(m.class)}</td><td>${esc(m.title)}</td><td>${esc(m.phone || '—')}</td></tr>`).join('');
  openInfo(name + ' · 成员信息', `<div class="table-wrap"><table>
    <thead><tr><th>姓名</th><th>学号</th><th>班级</th><th>职务</th><th>联系方式</th></tr></thead>
    <tbody>${rows || '<tr><td colspan="5" class="empty">本部门暂无在任成员</td></tr>'}</tbody>
  </table></div>`, '部门成员由人员信息表实时同步，包含部长、副部长与成员。');
}

function renderDept() {
  const canEdit = allPower() || cur.role === 'minister';
  const myDeptOnly = cur.role === 'minister';
  const shown = myDeptOnly ? db.departments.filter((d) => d.name === cur.dept) : db.departments;
  $('#views').innerHTML = `
    <div class="card">
      <div class="card-head">
        <div><h2>部门信息表</h2><div class="sub">${cur.role === 'student' ? '普通学生可查询部门信息并申请加入' : myDeptOnly ? '仅同步本部门成员信息（含部长、副部长）' : '成员数由人员信息表实时同步，含部长、副部长'}</div></div>
        <div class="toolbar">
          ${canEdit && cur.role !== 'minister' ? `<button class="primary-btn" id="addDept">+ 新增部门</button>` : ''}
          ${cur.role === 'student' ? '<button class="primary-btn light" id="toJoin">提交我的申请</button>' : ''}
        </div>
      </div>
      <div class="table-wrap"><table>
        <thead><tr><th>部门</th><th>负责人</th><th>在任人数</th><th>成员构成</th><th>职责说明</th><th>状态</th><th>操作</th></tr></thead>
        <tbody>${shown.map((d) => {
    const s = deptSummary(d.name);
    return `<tr>
      <td><strong>${esc(d.name)}</strong></td><td>${esc(d.leader)}</td><td>${s.total}</td>
      <td><span class="cell-sub" style="display:block;margin:0">${esc(s.text)}</span></td><td>${esc(d.desc)}</td><td>${badge(d.status)}</td>
      <td><div class="row-actions">
        <button class="link-btn" data-dept-members="${esc(d.name)}">查看成员</button>
        ${canEdit && (!myDeptOnly || d.name === cur.dept) ? `<button class="link-btn" data-edit-dept="${d.id}">编辑</button>` : ''}
        ${cur.role === 'presidium' ? `<button class="link-btn del" data-dissolve="${d.id}">申请罢免</button>` : ''}
        ${allPower() ? `<button class="link-btn del" data-dept-del="${d.id}">删除</button>` : ''}
      </div></td></tr>`;
  }).join('')}</tbody>
      </table></div>
    </div>
    ${allPower() || cur.role === 'presidium' ? `
    <div class="card">
      <div class="card-head"><div><h2>部门申请表</h2><div class="sub">主席团提交申请，由管理员终审</div></div></div>
      <div class="table-wrap"><table>
        <thead><tr><th>类型</th><th>部门</th><th>申请说明</th><th>提交人</th><th>日期</th><th>状态</th><th>操作</th></tr></thead>
        <tbody>${db.deptRequests.slice().reverse().map((r) => `
          <tr><td>${esc(r.type)}</td><td>${esc(r.dept)}</td><td>${esc(r.reason)}</td><td>${esc(r.submitter)}</td><td>${esc(r.date)}</td><td>${badge(r.status)}</td>
            <td><div class="row-actions">
              ${cur.role === 'admin' && r.status === '待管理员审核' ? `
                <button class="link-btn" data-dept-pass="${r.id}">通过</button>
                <button class="link-btn del" data-dept-reject="${r.id}">驳回</button>` : '<span class="cell-sub">—</span>'}
            </div></td></tr>`).join('')}</tbody>
      </table></div>
    </div>` : ''}`;

  document.querySelectorAll('[data-dept-members]').forEach((b) => { b.onclick = () => showDeptMembers(b.dataset.deptMembers); });

  if ($('#addDept')) $('#addDept').onclick = () => {
    if (cur.role === 'presidium') {
      openForm({
        title: '提交新增部门申请',
        hint: '主席团提交后由管理员审核，通过后部门生效。',
        fields: [
          { key: 'name', label: '部门名称', required: true },
          { key: 'leader', label: '负责人', required: true },
          { key: 'reason', label: '申请说明', type: 'textarea', required: true }
        ],
        onSubmit(d) {
          db.deptRequests.push({ id: uid('dr'), type: '新增', dept: d.name, reason: d.reason, submitter: cur.name, date: today(), status: '待管理员审核' });
          commit('提交部门申请', `新增 ${d.name}`); render(); toast('新增部门申请已提交');
        }
      });
    } else {
      openForm({
        title: '新增部门',
        fields: [
          { key: 'name', label: '部门名称', required: true },
          { key: 'leader', label: '负责人', required: true },
          { key: 'desc', label: '职责说明', type: 'textarea' }
        ],
        onSubmit(d) {
          db.departments.push({ id: uid('d'), name: d.name, leader: d.leader, desc: d.desc, status: '正常' });
          commit('新增部门', d.name); render(); toast('部门已新增');
        }
      });
    }
  };

  if ($('#toJoin')) $('#toJoin').onclick = () => switchView('join');

  document.querySelectorAll('[data-edit-dept]').forEach((b) => {
    b.onclick = () => {
      const d = db.departments.find((x) => x.id === b.dataset.editDept);
      openForm({
        title: '编辑部门 · ' + d.name,
        hint: '部门人数与成员构成由人员信息表自动同步，无需手动填写。',
        fields: [
          { key: 'leader', label: '负责人', required: true },
          { key: 'desc', label: '职责说明', type: 'textarea' }
        ],
        values: { leader: d.leader, desc: d.desc },
        onSubmit(v) { Object.assign(d, v); commit('编辑部门', d.name); save(); render(); toast('部门信息已更新'); }
      });
    };
  });

  document.querySelectorAll('[data-dissolve]').forEach((b) => {
    b.onclick = () => {
      const d = db.departments.find((x) => x.id === b.dataset.dissolve);
      openForm({
        title: '申请罢免部门 · ' + d.name,
        hint: '主席团提交罢免请求，由管理员审核。',
        fields: [{ key: 'reason', label: '申请说明', type: 'textarea', required: true }],
        onSubmit(v) {
          db.deptRequests.push({ id: uid('dr'), type: '罢免', dept: d.name, reason: v.reason, submitter: cur.name, date: today(), status: '待管理员审核' });
          commit('提交部门罢免', d.name); render(); toast('罢免申请已提交管理员审核');
        }
      });
    };
  });

  document.querySelectorAll('[data-dept-del]').forEach((b) => {
    b.onclick = () => {
      const d = db.departments.find((x) => x.id === b.dataset.deptDel);
      const cnt = deptMembers(d.name).length;
      if (!confirm(`确定删除部门「${d.name}」？${cnt ? `该部门现有 ${cnt} 名在任成员，删除后将归入未加入。` : ''}此操作不可恢复。`)) return;
      db.members.forEach((m) => {
        if (m.dept === d.name) {
          m.dept = '未加入';
          if (['主席', '副主席', '部长', '副部长'].includes(m.title)) m.title = '成员';
          const acc = db.accounts.find((a) => a.username === m.account);
          if (acc) { acc.dept = '未加入'; acc.title = '成员'; if (acc.role !== 'admin') acc.role = roleFromTitle('成员'); }
        }
      });
      db.departments = db.departments.filter((x) => x.id !== d.id);
      db.deptRequests = db.deptRequests.filter((r) => r.dept !== d.name);
      commit('删除部门', d.name); save(); render(); toast('部门已删除');
    };
  });

  document.querySelectorAll('[data-dept-pass]').forEach((b) => {
    b.onclick = () => {
      const r = db.deptRequests.find((x) => x.id === b.dataset.deptPass);
      r.status = '已通过';
      if (r.type === '新增') db.departments.push({ id: uid('d'), name: r.dept, leader: r.submitter, desc: r.reason, status: '正常' });
      if (r.type === '罢免') { const d = db.departments.find((x) => x.name === r.dept); if (d) d.status = '已罢免'; }
      commit('审核部门申请', `${r.type} ${r.dept}`); render(); toast('审核通过');
    };
  });
  document.querySelectorAll('[data-dept-reject]').forEach((b) => {
    b.onclick = () => {
      const r = db.deptRequests.find((x) => x.id === b.dataset.deptReject);
      r.status = '已驳回';
      commit('驳回部门申请', r.dept); save(); render(); toast('已驳回申请');
    };
  });
}

/* ---------------- 考核 ---------------- */
function renderAssess() {
  const targetRole = { admin: 'presidium', presidium: 'minister', minister: 'member' }[cur.role];
  const targets = db.members.filter((m) => {
    if (m.status !== '在任') return false;
    if (targetRole === 'presidium') return ['主席', '副主席'].includes(m.title);
    if (targetRole === 'minister') return ['部长', '副部长'].includes(m.title);
    return m.dept === cur.dept;
  });
  const rows = db.assessments.filter((a) => a.targetRole === targetRole || (cur.role === 'presidium' && a.targetRole === 'member'));
  const label = cur.role === 'admin' ? '主席团考核' : cur.role === 'presidium' ? '部长团考核' : '部内成员考核';

  $('#views').innerHTML = `
    <div class="card">
      <div class="card-head">
        <div><h2>${label}</h2><div class="sub">管理员考核主席团，主席团考核部长/副部长，部长/副部长考核部内成员（提交主席团复核）</div></div>
        <div class="toolbar">
          ${targets.length ? `<select class="filter" id="assessTarget">${targets.map((m) => `<option value="${m.name}">${esc(m.name)}（${esc(m.dept)}·${esc(m.title)}）</option>`).join('')}</select>
          <button class="primary-btn" id="addAssess">+ 新建考核</button>` : ''}
        </div>
      </div>
      <div class="table-wrap"><table>
        <thead><tr><th>被考核人</th><th>部门</th><th>周期</th><th>评分</th><th>等级</th><th>评语</th><th>状态</th><th>提交人</th><th>操作</th></tr></thead>
        <tbody>${rows.length ? rows.slice().reverse().map((k) => `
          <tr><td><strong>${esc(k.target)}</strong></td><td>${esc(k.dept)}</td><td>${esc(k.period)}</td>
            <td><span class="score">${k.score}</span></td><td>${gradeBadge(k.score)}</td><td>${esc(k.comment)}</td><td>${badge(k.status)}</td><td>${esc(k.submitter)}</td>
            <td><div class="row-actions">
              ${cur.role === 'presidium' && k.targetRole === 'member' && k.status === '待审核' ? `<button class="link-btn" data-assess-pass="${k.id}">审核通过</button>` : ''}
              ${k.status === '待审核' && k.submitter === cur.name ? `<button class="link-btn del" data-assess-del="${k.id}">撤回</button>` : ''}
            </div></td></tr>`).join('') : '<tr><td colspan="9" class="empty">暂无考核记录</td></tr>'}</tbody>
      </table></div>
    </div>`;

  if ($('#addAssess')) $('#addAssess').onclick = () => {
    const target = $('#assessTarget').value;
    const m = db.members.find((x) => x.name === target);
    openForm({
      title: '考核 · ' + target,
      hint: '百分制固定四维：出勤 30 分、工作任务 40 分、思想纪律 15 分、群众评价 15 分；总分自动汇总并评定等级。' + (cur.role === 'minister' ? '评分将提交主席团复核后生效。' : '考核结果由您直接确认。'),
      fields: [
        { key: 'period', label: '考核周期', required: true },
        { key: 'attend', label: '出勤得分（满分 30）', type: 'number', required: true },
        { key: 'task', label: '工作任务得分（满分 40）', type: 'number', required: true },
        { key: 'disc', label: '思想纪律得分（满分 15）', type: 'number', required: true },
        { key: 'peer', label: '群众评价得分（满分 15）', type: 'number', required: true },
        { key: 'comment', label: '考核评语', type: 'textarea', required: true }
      ],
      values: { period: '2026 年度', attend: 26, task: 34, disc: 12, peer: 13, comment: '' },
      onSubmit(d) {
        const dims = { attend: d.attend, task: d.task, disc: d.disc, peer: d.peer };
        const score = Math.max(0, Math.min(100, Number(d.attend) + Number(d.task) + Number(d.disc) + Number(d.peer)));
        db.assessments.push({ id: uid('k'), targetRole, target, dept: m ? m.dept : cur.dept, period: d.period, score, dims, comment: d.comment, status: cur.role === 'minister' ? '待审核' : '已通过', submitter: cur.name, date: today() });
        commit('提交考核', `${target} ${score} 分（${gradeOf(score)}）`); render(); toast(cur.role === 'minister' ? '考核已提交复核' : '考核已完成');
      }
    });
  };

  document.querySelectorAll('[data-assess-pass]').forEach((b) => {
    b.onclick = () => {
      const k = db.assessments.find((x) => x.id === b.dataset.assessPass);
      k.status = '已通过';
      commit('复核考核', k.target); save(); render(); toast('考核已审核通过');
    };
  });
  document.querySelectorAll('[data-assess-del]').forEach((b) => {
    b.onclick = () => {
      db.assessments = db.assessments.filter((x) => x.id !== b.dataset.assessDel);
      commit('撤回考核', b.dataset.assessDel); save(); render(); toast('考核记录已撤回');
    };
  });
}

/* ---------------- 通知 ---------------- */
function renderNotice() {
  const list = db.notices.filter((n) => n.status === '已发布').slice().reverse();
  $('#views').innerHTML = `
    <div class="card">
      <div class="card-head">
        <div><h2>通知公告</h2><div class="sub">共 ${list.length} 条已发布公告，已撤回的通知不再显示</div></div>
        ${isPublisher() ? '<button class="primary-btn" id="addNotice">+ 发布通知</button>' : ''}
      </div>
      <div class="notice-list">${list.map((n) => `
        <div class="notice-item">
          <h4><span class="badge blue">${esc(n.type)}</span>${esc(n.title)}</h4>
          <p>${esc(n.content)}</p>
          ${n.attach ? `<div class="cell-sub" style="margin:4px 0">附件：<button class="link-btn" data-notice-file="${n.id}">${esc(n.attach)}</button></div>` : ''}
          <div class="notice-meta" style="display:flex;justify-content:space-between;align-items:center;gap:10px">
            <span>${esc(n.date)} · ${esc(n.publisherName)}（${esc(n.publisher)}）${n.scope && n.scope !== '全员' ? ` · 范围：${esc(n.scope)}` : ''}</span>
            <span class="row-actions">${isPublisher() && n.status === '已发布' ? `<button class="link-btn del" data-notice-withdraw="${n.id}">撤回通知</button>` : ''}</span>
          </div>
        </div>`).join('') || '<div class="empty">暂无通知</div>'}
      </div>
    </div>`;

  if ($('#addNotice')) $('#addNotice').onclick = () => {
    let attachName = '';
    const body = openForm({
      title: '发布通知',
      fields: [
        { key: 'type', label: '通知类型', type: 'select', options: ['活动通知', '其他通知'] },
        { key: 'scope', label: '生效范围', type: 'select', options: ['全员', '指定部门', '部长团', '主席团'] },
        { key: 'title', label: '通知标题', required: true },
        { key: 'content', label: '通知内容', type: 'textarea', required: true }
      ],
      extra: '<div class="field"><label>附件（可选，支持文档 / 表格 / 图片）</label><input type="file" id="nAttach" accept=".doc,.docx,.pdf,.xls,.xlsx,.png,.jpg,.jpeg,.txt" class="file-input"></div>',
      onSubmit(d) {
        db.notices.push({ id: uid('n'), type: d.type, scope: d.scope, title: d.title, content: d.content, attach: attachName, date: today(), publisher: ROLE_NAMES[cur.role], publisherName: cur.name, status: '已发布' });
        commit('发布通知', d.title); render(); toast('通知已发布');
      }
    });
    body.querySelector('#nAttach').onchange = (e) => { attachName = e.target.files[0] ? e.target.files[0].name : ''; };
  };
  document.querySelectorAll('[data-notice-file]').forEach((b) => {
    b.onclick = () => {
      const n = db.notices.find((x) => x.id === b.dataset.noticeFile);
      const text = `通知标题：${n.title}\n发布人：${n.publisherName}（${n.publisher}）\n发布时间：${n.date}\n生效范围：${n.scope || '全员'}\n附件：${n.attach}\n\n${n.content}`;
      downloadBlob(new Blob(['\ufeff' + text], { type: 'text/plain;charset=utf-8' }), (n.attach || n.title).replace(/\.[^.]+$/, '') + '.txt');
      commit('下载通知附件', n.title);
    };
  });
  document.querySelectorAll('[data-notice-withdraw]').forEach((b) => {
    b.onclick = () => {
      const n = db.notices.find((x) => x.id === b.dataset.noticeWithdraw);
      if (!confirm(`确定撤回通知「${n.title}」？`)) return;
      n.status = '已撤回';
      commit('撤回通知', n.title); save(); render(); toast('通知已撤回');
    };
  });
}

/* ---------------- 请假 ---------------- */
const LEAVE_REVIEWER = { presidium: '管理员', minister: '主席团', student: '部长/副部长' };
function canSubmitLeave() { return ['presidium', 'minister', 'student'].includes(cur.role); }
function canReviewLeave(l) {
  if (allPower()) return l.status === '待审核';
  const map = { presidium: '主席团', minister: '部长/副部长' };
  return map[cur.role] === l.reviewer && l.status === '待审核';
}

function renderLeave() {
  const mine = db.leaves.filter((l) => l.applicant === cur.name);
  const visible = cur.role === 'admin' ? db.leaves
    : cur.role === 'presidium' ? db.leaves
    : cur.role === 'minister' ? db.leaves.filter((l) => l.reviewer === '部长/副部长' || l.applicant === cur.name)
    : mine;

  $('#views').innerHTML = `
    <div class="card">
      <div class="card-head">
        <div><h2>请假表</h2><div class="sub">${cur.role === 'admin' ? '审核主席团请假' : cur.role === 'presidium' ? '提交本人请假并审核部长请假' : cur.role === 'minister' ? '提交本人请假，审核成员与普通学生请假' : '提交请假申请并查看审批进度'}</div></div>
        ${canSubmitLeave() ? '<button class="primary-btn" id="addLeave">+ 提交请假申请</button>' : ''}
      </div>
      <div class="table-wrap"><table>
        <thead><tr><th>申请人</th><th>身份</th><th>部门</th><th>类型</th><th>起止时间</th><th>事由</th><th>审核人</th><th>状态</th><th>操作</th></tr></thead>
        <tbody>${visible.length ? visible.slice().reverse().map((l) => `
          <tr><td><strong>${esc(l.applicant)}</strong></td><td>${esc(ROLE_NAMES[l.applicantRole] || l.applicantRole)}</td><td>${esc(l.dept)}</td>
            <td>${esc(l.type)}</td><td class="nowrap">${esc(l.start)}<br>${esc(l.end)}</td>
            <td>${esc(l.reason)}${l.attach ? `<div class="cell-sub">附件：${esc(l.attach)}</div>` : ''}${l.reviewNote ? `<div class="cell-sub">审核意见：${esc(l.reviewNote)}</div>` : ''}</td>
            <td>${esc(l.reviewer)}</td><td>${badge(l.status)}</td>
            <td><div class="row-actions">
              ${canReviewLeave(l) ? `<button class="link-btn" data-leave-pass="${l.id}">通过</button><button class="link-btn del" data-leave-reject="${l.id}">驳回</button>` : ''}
              ${l.applicant === cur.name && l.status === '待审核' ? `<button class="link-btn del" data-leave-revoke="${l.id}">撤回</button>` : ''}
              ${(l.applicant === cur.name || allPower()) ? `<button class="link-btn del" data-leave-del="${l.id}">删除</button>` : ''}
            </div></td></tr>`).join('') : '<tr><td colspan="9" class="empty">暂无请假记录</td></tr>'}</tbody>
      </table></div>
    </div>`;

  if ($('#addLeave')) $('#addLeave').onclick = () => {
    openForm({
      title: '提交请假申请',
      hint: `您的请假将由「${LEAVE_REVIEWER[cur.role]}」审核。`,
      fields: [
        { key: 'type', label: '请假类型', type: 'select', options: ['事假', '病假', '公假'] },
        { key: 'start', label: '开始日期', type: 'date', required: true },
        { key: 'end', label: '结束日期', type: 'date', required: true },
        { key: 'reason', label: '请假原因', type: 'textarea', required: true, placeholder: '请填写具体事由与相关证明' },
        { key: 'attach', label: '附件（可选，如病假证明文件名）' }
      ],
      values: { start: today(), end: today() },
      onSubmit(d) {
        db.leaves.push({ id: uid('l'), applicant: cur.name, applicantRole: cur.role, dept: cur.dept, type: d.type, start: d.start, end: d.end, reason: d.reason, attach: d.attach || '', status: '待审核', reviewer: LEAVE_REVIEWER[cur.role], reviewNote: '', date: today() });
        commit('提交请假', `${d.type} ${d.start}—${d.end}`); render(); toast('请假申请已提交');
      }
    });
  };

  document.querySelectorAll('[data-leave-pass]').forEach((b) => {
    b.onclick = () => {
      const l = db.leaves.find((x) => x.id === b.dataset.leavePass);
      openForm({
        title: '通过请假 · ' + l.applicant,
        fields: [{ key: 'note', label: '审核意见' }],
        values: { note: '同意' },
        onSubmit(d) { l.status = '已通过'; l.reviewNote = d.note; commit('审批请假', `${l.applicant} 通过`); save(); render(); toast('已通过请假申请'); }
      });
    };
  });
  document.querySelectorAll('[data-leave-reject]').forEach((b) => {
    b.onclick = () => {
      const l = db.leaves.find((x) => x.id === b.dataset.leaveReject);
      openForm({
        title: '驳回请假 · ' + l.applicant,
        fields: [{ key: 'note', label: '驳回原因', type: 'textarea', required: true }],
        onSubmit(d) { l.status = '已驳回'; l.reviewNote = d.note; commit('驳回请假', `${l.applicant}：${d.note}`); save(); render(); toast('已驳回请假申请'); }
      });
    };
  });
  document.querySelectorAll('[data-leave-revoke]').forEach((b) => {
    b.onclick = () => {
      const l = db.leaves.find((x) => x.id === b.dataset.leaveRevoke);
      if (!confirm('确定撤回这条请假申请？撤回后不计入出勤。')) return;
      l.status = '已撤回';
      commit('撤回请假', l.applicant); save(); render(); toast('请假申请已撤回，不计入出勤');
    };
  });
  document.querySelectorAll('[data-leave-del]').forEach((b) => {
    b.onclick = () => {
      const l = db.leaves.find((x) => x.id === b.dataset.leaveDel);
      if (!confirm(`确定删除「${l.applicant}」的${l.type}记录？删除后不再参与出勤与考核统计，操作日志予以保留。`)) return;
      commit('删除请假记录', `${l.applicant} ${l.type} ${l.start}—${l.end}`);
      db.leaves = db.leaves.filter((x) => x.id !== l.id);
      save(); render(); toast('请假记录已删除');
    };
  });
}
