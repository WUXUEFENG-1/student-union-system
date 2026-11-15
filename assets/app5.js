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
