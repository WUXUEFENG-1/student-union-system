# 应用经济系学生会管理系统 · 微信小程序端

本目录是与网页版**并列新增**的小程序源码端，网页版 `assets/` 保持原样、未做改动。两端共用同一套 Supabase 云端数据（`state` 表 `id=1` 的 `data` jsonb 行），登录账号与网页版一致。

## 目录结构

```
mp/
├── app.js / app.json / app.wxss      # 全局逻辑、页面注册、全局样式
├── project.config.json               # 工程配置（游客 appid，urlCheck 关闭）
├── sitemap.json
├── utils/
│   ├── api.js                        # Supabase REST 读写 + 本地缓存兜底
│   ├── store.js                      # 角色/审批链/权限/轨迹/消息规则（与网页端口径一致）
│   ├── const.js                      # 字典、菜单、申请类型、等级
│   ├── ui.js                         # 路由、状态色、轨迹文案、菜单生成
│   ├── list-page.js                  # 通用台账列表页工厂
│   └── seed.js                       # 云端不可达时的本地兜底种子
└── pages/
    ├── login/        登录
    ├── dashboard/    工作台（待办统计 + 角色菜单）
    ├── applies/      我的申请
    ├── review/       待我审批（通过 / 驳回）
    ├── summary/      申请事宜汇总
    ├── notice/       通知公告
    ├── activity/     活动管理
    ├── leave/        请假管理
    ├── assess/       考核管理
    ├── personnel/    人事成员
    ├── dept/         部门信息
    ├── collect/      信息收集
    ├── event/        活动报名
    ├── profile/      个人信息 / 退出登录
    ├── logs/         操作日志
    └── detail/       通用详情（字段 + 审批轨迹时间线）
```

## 本地运行

1. 用**微信开发者工具**导入本 `mp/` 目录。
2. 开发阶段：详情 → 本地设置 → 勾选「不校验合法域名、web-view（业务域名）、TLS 版本以及 HTTPS 证书」（工程配置 `urlCheck:false` 已默认开启）。
3. 登录账号与网页端一致，例如：
   - 管理员 `admin / yyadmin`
   - 主席 `yyjjx01 / yyadmin`
   - 副主席 `yyjjx02 / 123456`
   - 各部门部长 / 副部长 / 成员见云端 `accounts`

## 上线前配置

- 在微信公众平台 → 开发管理 → 服务器域名中，把 Supabase 地址加入 `request` 合法域名：
  `https://btyhldpdniccreccxnru.supabase.co`
- 将 `project.config.json` 中的 `appid`（当前为 `touristappid` 游客号）替换为真实小程序 AppID。

## 数据与权限口径

- 读：启动时拉取云端整份数据；云端不可达则回退本地缓存。
- 写：审批通过 / 驳回 / 删除 / 操作日志等变更整份回写云端，并同步本地缓存。
- 审批权限、部长/副部长申请链、退回与通知规则与网页端 `app4.js` / `app6.js` 最终版一致；权限判定按 `applyStages` 实际节点岗位匹配，不跨级代审。

## 首版范围说明

首版覆盖：账号登录、工作台统计、申请查看、审批通过/驳回、各台账列表与详情轨迹、个人信息、操作日志。

网页端专属、尚未在小程序端补齐的能力（后续可按需继续移植）：手写签字 canvas、Word/PDF/Excel/CSV 导出、XLSX 模板解析导入、图片/附件上传下载、考勤签到、物资借还、在线填表提交等。
