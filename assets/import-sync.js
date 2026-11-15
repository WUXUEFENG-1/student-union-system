/* 导入自动同步：按表内部门/职务/角色自动落库，重复人员按学号/账号更新，无需逐条手动修改 */

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

/* 覆盖成员导入：支持可选职务列；重复人员按学号同步更新；账号角色按职务自动判定 */
importMembers = function (text) {
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
      if (acc) Object.assign(acc, { name, dept: deptName, title: titleName, sno, class: profile.class, phone: profile.phone, gender: profile.gender, ethnicity: profile.ethnicity, politics: profile.politics, role: ['admin', 'teacher'].includes(acc.role) ? acc.role : roleFromTitle(titleName) });
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
};

/* 覆盖账号导入：重复账号按表同步更新；职务归一化；角色列缺省时按职务自动判定 */
importAccounts = function (text) {
  const lines = String(text || '').split('\n').map((l) => l.trim()).filter(Boolean);
  let added = 0, updated = 0, skipped = 0;
  const messages = [];
  lines.forEach((line, idx) => {
    const cells = splitRow(line);
    const [name, gender, ethnicity, politics, cls, phone, dept, sno, username, password, titleLabel, roleLabel] = cells;
    if (!username || !password || !name) { skipped++; messages.push(`第 ${idx + 1} 行缺少账号、初始密码或姓名，已跳过`); return; }
    if (name === '姓名' || username === '账号') { skipped++; return; }
    if (password.length < 6) { skipped++; messages.push(`第 ${idx + 1} 行「${username}」初始密码不足 6 位，已跳过`); return; }
    const deptName = dept || '未加入';
    const titleName = normalizeTitle(titleLabel);
    const profile = { name, gender: gender || '', ethnicity: ethnicity || '汉族', politics: politics || '', class: cls || '—', phone: phone || '', dept: deptName, sno: sno || '—' };
    let acc = db.accounts.find((a) => a.username === username);
    const role = acc && ['admin', 'teacher'].includes(acc.role) ? acc.role : (ROLE_KEY_FROM_LABEL[(roleLabel || '').trim()] || roleFromTitle(titleName));
    if (acc) {
      Object.assign(acc, { name, role, dept: deptName, title: titleName, sno: profile.sno, class: profile.class, phone: profile.phone, gender: profile.gender, ethnicity: profile.ethnicity, politics: profile.politics });
      let mem = db.members.find((m) => m.account === username) || db.members.find((m) => m.sno === profile.sno && m.name === name);
      if (mem) Object.assign(mem, profile, { title: titleName, account: username, status: mem.status || '在任' });
      else db.members.push(Object.assign({ id: uid('m'), account: username, title: titleName, status: '在任', joined: today() }, profile));
      updated++;
      messages.push(`第 ${idx + 1} 行「${username}」已按表同步更新`);
    } else {
      db.accounts.push({ username, password, name, role, dept: deptName, title: titleName, sno: profile.sno, class: profile.class, phone: profile.phone, gender: profile.gender, ethnicity: profile.ethnicity, politics: profile.politics });
      let mem = db.members.find((m) => m.account === username) || db.members.find((m) => m.sno === profile.sno && m.name === name);
      if (mem) Object.assign(mem, profile, { title: titleName, account: username, status: mem.status || '在任' });
      else db.members.push(Object.assign({ id: uid('m'), account: username, title: titleName, status: '在任', joined: today() }, profile));
      added++;
    }
  });
  return { added, updated, skipped, messages };
};

/* 职务调整弹窗：把被写死的部门下拉替换为可自由填写的输入框，支持任意部门名称 */
const _openFormSync = openForm;
openForm = function (opts) {
  const body = _openFormSync(opts);
  try {
    if (opts && /职务调整/.test(opts.title || '')) {
      const sel = body && body.querySelector ? body.querySelector('#f_dept') : null;
      if (sel && sel.tagName === 'SELECT') {
        const input = document.createElement('input');
        input.id = 'f_dept';
        input.type = 'text';
        input.placeholder = '如：主席团 / 文体部 / 外联部';
        input.value = sel.value || '';
        sel.parentNode.replaceChild(input, sel);
      }
    }
  } catch (e) { /* 忽略兼容异常 */ }
  return body;
};
