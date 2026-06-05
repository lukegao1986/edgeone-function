## Summary
根据用户的明确要求，废弃 `practice_logs` 流水表作为统计数据源，将“学习大厅”和“个人中心”的所有数据指标（包括今日刷题、本周刷题、连续打卡天数、趋势图、历史记录等）全部统一为查询 `user_answers` 状态表。并以 `user_answers.last_answered_at` 作为“每道题完成的时间”进行按天、按周的聚合计算。

## Current State Analysis
目前系统存在两种数据表：
1. `user_answers`：记录每道题的最新作答状态，包含 `last_answered_at`（最后作答时间）。
2. `practice_logs`：记录每次作答流水。

之前的部分活跃指标（如今日刷题、连续打卡）查的是 `practice_logs`，导致如果用户只更新旧题，流水增加，但独立题目数没变，前后端数据产生割裂。用户希望统一数据源，**只根据每道题最新完成的时间（`last_answered_at`）来统计**。

## Proposed Changes

### 1. 修改 `cloud-functions/api/get_dashboard_stats.js`
将所有涉及 `practice_logs` 的 SQL 替换为 `user_answers`，并加上 `selected_index IS NOT NULL` 的条件：
- **今日刷题**：`SELECT COUNT(*) FROM user_answers WHERE user_id = ? AND selected_index IS NOT NULL AND DATE(last_answered_at) = CURDATE()`
- **连续学习天数**：`SELECT COUNT(DISTINCT DATE(last_answered_at)) FROM user_answers WHERE user_id = ? AND selected_index IS NOT NULL`
- **本周正确率趋势**：按 `DATE(last_answered_at)` 聚合最近 7 天的数据。

### 2. 修改 `cloud-functions/api/get_profile_stats.js`
同理，将所有涉及 `practice_logs` 的 SQL 替换为 `user_answers`：
- **本周刷题**：`SELECT COUNT(*) FROM user_answers WHERE user_id = ? AND selected_index IS NOT NULL AND YEARWEEK(last_answered_at, 1) = YEARWEEK(CURDATE(), 1)`
- **连续打卡天数**：与大厅相同。
- **近 30 天刷题趋势**：按 `DATE(last_answered_at)` 聚合最近 30 天的数据。
- **历史练习记录**：按 `DATE(last_answered_at)` 和 `subject_id` 分组聚合。

## Assumptions & Decisions
- 决策：完全抛弃 `practice_logs` 用于展示，确保“大厅”和“个人中心”的 SQL 查询结构、过滤条件（`selected_index IS NOT NULL`）和时间字段（`last_answered_at`）做到100%镜像对齐。
- 假设：数据库表 `user_answers` 中已存在自动更新的 `last_answered_at` 字段（经本地脚本核实存在）。

## Verification
- 修改完成后，本地执行 `npm run build:h5` 确保无编译错误。
- 用户在云端或本地更新部署后，访问大厅和个人中心，所有指标（包括 0 的情况）都将完全一致。