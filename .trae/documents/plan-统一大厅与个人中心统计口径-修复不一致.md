## Summary
修复“学习大厅 (Dashboard)”与“个人中心 (Profile)”的「累计答题/累计刷题」与「正确率」显示不一致问题；确保两页在同一用户、同一时刻展示完全一致的数据。

## Current State Analysis
### 1) 统计口径现状（已对齐为去重口径）
- Dashboard 接口 [get_dashboard_stats.js](file:///Users/wanglimin/Desktop/edgeone-ex/cloud-functions/api/get_dashboard_stats.js#L25-L31)
  - `totalAnswered/totalCorrect`：来自 `user_answers`，并限制 `selected_index IS NOT NULL`（独立题目去重统计）。
  - `todayAnswered/streakDays/trendSvg`：来自 `practice_logs`（行为流水统计）。
- Profile 接口 [get_profile_stats.js](file:///Users/wanglimin/Desktop/edgeone-ex/cloud-functions/api/get_profile_stats.js#L25-L33)
  - `totalAnswered/totalCorrect/averageRate`：同样来自 `user_answers` + `selected_index IS NOT NULL`（独立题目去重统计）。

结论：两端“累计/正确率”的 SQL 口径已经一致，不一致的更可能来源于“请求拿到的不是同一时刻的最新数据”（缓存/陈旧响应）。

### 2) 高概率根因：API GET 响应被缓存，导致两页拿到不同版本数据
- 两个 GET 接口的响应头目前仅设置了 `Content-Type`，没有任何 `Cache-Control/Pragma/Expires`。
- 在 Edge/CDN 场景下（尤其 EdgeOne Pages/边缘函数），如果响应未明确声明不可缓存，平台或中间层可能会按默认策略缓存 GET 响应，从而出现：
  - Dashboard 刚更新（命中未缓存或缓存已刷新），Profile 仍命中旧缓存（或反之）
  - 用户在短时间内切换页面，看到两页数据不一致

## Proposed Changes
### A. 禁用两个统计接口的缓存（核心修复）
目标：保证 `GET /api/get_dashboard_stats` 与 `GET /api/get_profile_stats` 每次都取到最新 DB 聚合结果。

#### 需要修改的文件
- [get_dashboard_stats.js](file:///Users/wanglimin/Desktop/edgeone-ex/cloud-functions/api/get_dashboard_stats.js)
- [get_profile_stats.js](file:///Users/wanglimin/Desktop/edgeone-ex/cloud-functions/api/get_profile_stats.js)

#### 修改内容
1) 在所有成功响应中增加以下响应头（精确到实现时一致）：
- `Cache-Control: no-store, no-cache, must-revalidate, proxy-revalidate`
- `Pragma: no-cache`
- `Expires: 0`
- `Surrogate-Control: no-store`

2) 在所有错误响应（400/500）中同样加上上述响应头，避免错误也被缓存。

### B. 可选：将正确率计算统一放在后端（降低前端差异风险）
目的：避免前端/后端各自计算导致四舍五入差异或字段含义误用。

方案：
- Dashboard 接口增加 `averageRate` 字段（与 Profile 同名同含义），由后端直接计算并返回。
- Dashboard 页面 [dashboard/index.tsx](file:///Users/wanglimin/Desktop/edgeone-ex/src/pages/dashboard/index.tsx) 改为直接展示后端的 `averageRate`（或优先使用后端值）。

说明：此项不是必须，但能进一步把“展示口径”锁死为后端单一来源。

## Assumptions & Decisions
- 决策：以“禁用缓存”为第一优先修复，因为当前 SQL 口径已一致但仍出现不一致，最符合“不同页面命中不同缓存版本”的典型症状。
- 假设：用户的观察是在同一 userId 下进行，且两页面请求的 host/path 完全一致（均为 `/api/...`）。

## Verification
### 数据一致性验收（必须）
1) 在同一账号下打开 Dashboard，记录：
   - 累计刷题（totalAnswered）
   - 正确率
2) 立刻切换到 Profile，确认：
   - 累计答题（totalAnswered）
   - 正确率（averageRate）
   两页完全一致。
3) 在 Practice 做 1 道新题提交后（会写入 `user_answers` 与 `practice_logs`），依次返回 Dashboard 与 Profile，再次确认两页一致且均已更新。

### 缓存验证（建议）
- 连续快速切换 Dashboard/Profile 多次，数据不应出现“跳回旧值/不一致”的情况。
