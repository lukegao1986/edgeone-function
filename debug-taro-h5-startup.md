# Debug Session: taro-h5-startup

- **Status**: [OPEN]
- **Issue**: Taro H5 前端启动卡在 CLI 初始化阶段，`10087` 端口始终未监听；本地云函数 `8080` 正常。
- **Debug Server**: http://127.0.0.1:7777/event
- **Log File**: .dbg/trae-debug-log-taro-h5-startup.ndjson

## Reproduction Steps

1. 在项目根目录执行 `npx taro build --type h5 --watch --env development -p 10087`
2. 观察命令输出是否停留在 `👽 Taro v4.1.9` 与 Tips 提示后
3. 检查 `10087` 端口是否监听

## Hypotheses & Verification

| ID  | Hypothesis                                                                     | Likelihood | Effort | Evidence |
| --- | ------------------------------------------------------------------------------ | ---------- | ------ | -------- |
| A   | Taro 配置文件加载未完成，卡在 `config/index.ts` 或其 merge 流程之前/之中       | High       | Low    | Pending  |
| B   | 某个配置模块或依赖在加载阶段阻塞或异常吞掉，导致 CLI 无法继续到 devServer 启动 | High       | Medium | Pending  |
| C   | H5 devServer 实际已尝试启动，但被配置分支或环境变量条件绕过                    | Medium     | Low    | Pending  |
| D   | Taro CLI 在扫描项目或依赖树时被特定文件/目录阻塞，而不是业务代码本身问题       | Medium     | Medium | Pending  |
| E   | 当前命令实际上只进入 watch build，没有进入 H5 server 启动分支                  | Medium     | Low    | Pending  |

## Log Evidence

- `pre-fix` instrumentation:
  - `config/dev.ts:4` loaded
  - `config/index.ts:31` loaded with `NODE_ENV=development`
  - `config/index.ts:39` entered `defineConfig`
  - `config/index.ts:140` selected development branch with `devServerPort=10087`
- Runtime process evidence:
  - `lsof -p 11036` shows `TCP *:10087 (LISTEN)`
  - `curl -I http://127.0.0.1:10087` returns `HTTP/1.1 200 OK`
  - startup log shows `Compiled successfully in 5.75m` and `webpack-dev-server` listening at `http://localhost:10087/`

## Verification Conclusion

- Hypothesis A: Rejected. Config loading path completed.
- Hypothesis B: Rejected for config dependency stage. Current evidence shows the config path is not the blocking point.
- Hypothesis C: Rejected. Development branch and `devServer` configuration are both active.
- Hypothesis D: Inconclusive as a general statement, but no longer needed to explain the symptom.
- Hypothesis E: Rejected. The H5 server did start; it was delayed by a long initial compile.
- Current conclusion: the earlier “未启动” judgment was premature. After waiting for the full initial compile window, the frontend successfully started and served HTML on port `10087`.
