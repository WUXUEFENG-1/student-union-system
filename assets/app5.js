/* 增补申请事项：考核申诉、活动变更申请（在 app4 的 APPLY_TYPES 上扩展） */

APPLY_TYPES.appeal = {
  name: '考核申诉申请',
  hint: '对考核结果有异议时提交。流程：部长审核 → 主席团审核 → 责任教师终审；申诉记录与对应考核档案绑定留存。',
  stages: ['部长审核', '主席团审核', '责任教师终审'],
  fields: [
    { key: 'target', label: '关联考核对象（学期 / 被考核人）', required: true, placeholder: '如：2026-2027 学年第一学期 · 本人' },
    { key: 'dim', label: '申诉维度', type: 'select', options: ['出勤', '工作任务', '思想纪律', '群众评价', '总分'] },
    { key: 'reason', label: '申诉理由', type: 'textarea', required: true },
    { key: 'proof', label: '佐证材料（证书 / 记录 / 截图文件名）' }
  ]
};

APPLY_TYPES.actChange = {
  name: '活动变更申请',
  hint: '已审批活动如需变更时间、地点或报名名额，沿用部门申请 → 主席团审核 → 责任教师审核三级流程；终审通过后由负责人同步更新活动信息。',
  stages: ['部门申请', '主席团审核', '责任教师审核'],
  fields: [
    { key: 'originTitle', label: '原活动名称', required: true },
    { key: 'changeItem', label: '变更项', type: 'select', options: ['活动时间', '活动地点', '报名名额', '其他信息'] },
    { key: 'after', label: '变更后内容', type: 'textarea', required: true },
    { key: 'reason', label: '变更理由', type: 'textarea', required: true },
    { key: 'attach', label: '附件（选填）' }
  ]
};

/* ================= 公假证明表单增强（补丁层，不改 app4 闭包） ================= */

/* 由班级名反推专业：去掉末尾编号与“班”，如 计算机网络技术2501班 → 计算机网络技术 */
function majorFromClass(cls) {
  const s = String(cls || '').trim();
  if (!s || s === '—') return '';
  return s.replace(/\s*\d+\s*班$/, '').replace(/班$/, '').trim();
}

/* 两个 datetime-local 值拼成“x年x月x日 HH:MM 至 HH:MM” */
function formatPeriod(start, end) {
  const fmt = (dt) => {
    const [d, t] = String(dt).split('T');
    const [y, m, dd] = (d || '').split('-');
    return { date: `${y}年${Number(m)}月${Number(dd)}日`, time: t || '' };
  };
  const a = fmt(start), b = fmt(end);
  if (a.date === b.date) return `${a.date} ${a.time} 至 ${b.time}`;
  return `${a.date} ${a.time} 至 ${b.date} ${b.time}`;
}

/* 固定节次时间段（按教务作息表） */
const SLOT_OPTIONS = [
  '第一大节（01、02 小节）08:30–10:10',
  '第二大节（03、04 小节）10:20–12:00',
  '第三大节（05、06 小节）14:30–16:10',
  '第四大节（07、08 小节）16:20–18:00',
  '第五大节（09、10 小节）19:00–21:00'
];

/* 登录后若账号未填专业，按班级自动补全 */
const _enterAppPatch = enterApp;
enterApp = function (acc) {
  if (acc && !acc.major) acc.major = majorFromClass(acc.class);
  _enterAppPatch(acc);
};

/* 包装通用表单：为公假证明注入时间选择器、节次下拉与课程名称框 */
const _openFormPatch = openForm;
openForm = function (opts) {
  const body = _openFormPatch(opts);
  if (opts && opts.title === '活动公假证明申请') {
    // 隐藏 app4 原有的起止时间/课程文本框，改由下方控件采集
    ['#f_period', '#f_courses'].forEach((sel) => {
      const el = body.querySelector(sel);
      if (el) { el.type = 'hidden'; el.value = ''; }
    });
    body.insertAdjacentHTML('beforeend', `
      <div class="field"><label>活动开始时间</label><input type="datetime-local" id="plStart" required></div>
      <div class="field"><label>活动结束时间</label><input type="datetime-local" id="plEnd" required></div>
      <div class="field"><label>请假节次</label><select id="plSlot">${SLOT_OPTIONS.map((o) => `<option value="${esc(o)}">${esc(o)}</option>`).join('')}</select></div>
      <div class="field"><label>请假课程名称</label><input id="plCourse" placeholder="填写请假课程名称" required></div>
    `);
    const origSubmit = modalSubmit;
    modalSubmit = function () {
      const start = body.querySelector('#plStart').value;
      const end = body.querySelector('#plEnd').value;
      const course = body.querySelector('#plCourse').value.trim();
      if (!start || !end) { toast('请选择活动起止时间'); return; }
      if (!course) { toast('请填写请假课程名称'); return; }
      const slot = body.querySelector('#plSlot').value;
      const fp = body.querySelector('#f_period');
      if (fp) fp.value = formatPeriod(start, end);
      const fc = body.querySelector('#f_courses');
      if (fc) fc.value = `${course}（${slot}）`;
      origSubmit();
    };
  }
  return body;
};

/* 覆盖证明排版回填：专业按班级反推；负责人签字位支持嵌入上传的签字图片 */
plProofHtml = function (a) {
  const v = a.values || {};
  const major = a.major || majorFromClass(a.class) || '—';
  const map = {
    '{姓名}': a.name, '{学号}': a.sno || '—', '{专业}': major, '{班级}': a.class || '—',
    '{所属部门}': a.dept || '—', '{活动名称}': v.activityName || '—', '{活动起止时间}': v.period || '—',
    '{活动地点}': v.place || '—', '{请假课程及日期}': v.courses || '—', '{申请说明}': v.explanation || '—',
    '{联系电话}': v.phone || '—', '{申请份数与用途}': v.copiesPurpose || '—',
    '{证明编号}': a.proofNo || '—', '{出具日期}': cnDate(a.approvedAt)
  };
  let body = plTemplate().body;
  Object.keys(map).forEach((k) => { body = body.split(k).join(String(map[k] == null ? '—' : map[k])); });
  const lines = esc(body).split('\n');
  const paras = lines.map((ln, i) => `<p style="margin:0 0 ${i === 0 ? '18px' : '12px'};${i === 0 ? '' : 'text-indent:2em'}">${ln}</p>`).join('');
  const signHtml = a.signImage
    ? `<img src="${a.signImage}" alt="负责人签字" style="height:52px;vertical-align:middle">`
    : '____________';
  return `<div style="font-family:'FangSong','方正仿宋_GBK','仿宋',serif;font-size:16pt;line-height:1.9;max-width:760px;margin:0 auto;padding:32px 24px">
    <h2 style="text-align:center;font-size:18pt;font-weight:bold;margin:0 0 28px">${esc(plTemplate().title || '证明')}</h2>
    ${paras}
    <div style="margin-top:40px;padding-left:2em">
      <p style="margin:0 0 18px">负责人签字：${signHtml}</p>
      <p style="margin:0 0 18px">联系电话：${esc(map['{联系电话}'])}</p>
      <p style="margin:0 0 18px">日期：${esc(map['{出具日期}'])}</p>
      <p style="margin:0 0 18px">编号：${esc(a.proofNo || '—')}</p>
    </div>
  </div>`;
};

/* 包装详情弹窗：为已通过的公假证明提供负责人签字上传入口（部长/主席团/教师/管理员） */
const _openInfoPatch = openInfo;
openInfo = function (title, html, foot) {
  _openInfoPatch(title, html, foot);
  const rec = db.applies.find((a) => title && title.indexOf(a.typeName + ' · ') === 0);
  const canArchive = allPower() || ['presidium', 'minister', 'teacher'].includes(cur.role);
  if (rec && rec.type === 'publicLeave' && rec.status === '已通过' && canArchive) {
    const box = document.getElementById('modalBody');
    const bar = box.querySelector('.row-actions') || box;
    const btn = document.createElement('button');
    btn.className = 'primary-btn light';
    btn.textContent = rec.signImage ? '重新上传签字' : '上传负责人签字';
    btn.onclick = () => {
      const fi = document.createElement('input');
      fi.type = 'file';
      fi.accept = 'image/png,image/jpeg,image/jpg';
      fi.onchange = () => {
        const f = fi.files && fi.files[0];
        if (!f) return;
        if (f.size > 512 * 1024) { toast('签字图片请控制在 512KB 以内'); return; }
        const rd = new FileReader();
        rd.onload = () => {
          rec.signImage = rd.result;
          rec.track.push({ actor: cur.name, role: ROLE_NAMES[cur.role], action: '上传负责人签字', note: '', time: today() });
          commit('上传负责人签字', `${rec.proofNo} · ${rec.name}`);
          save(); render(); closeModal();
          toast('签字已上传，导出证明时嵌入签字位');
        };
        rd.readAsDataURL(f);
      };
      fi.click();
    };
    bar.appendChild(btn);
    if (rec.signImage) {
      const p = document.createElement('p');
      p.className = 'form-hint';
      p.style.marginTop = '8px';
      p.innerHTML = `已上传签字：<img src="${rec.signImage}" alt="签字" style="height:44px;vertical-align:middle">`;
      box.appendChild(p);
    }
  }
};
