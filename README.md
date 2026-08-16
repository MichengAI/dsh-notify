# dsh-notify

DeepSeek Harness 的本机通知插件。根 Agent 回合结束或需要你决策时，弹出 Windows Toast、播放自制提示音，并在托盘显示待处理数量。

阅读文档：[交接入口](docs/00-交接入口/00-阅读导航.md)

## 安装

```powershell
npm install
npm run sounds
npm run build
dsh plugin --profile web add .
```

或在仓库根目录执行：

```powershell
.\install.ps1
```

然后重启 `dsh web`，打开「设置 → 通知」。

## 行为

- 根 Agent 从 running 回到 idle 时发送完成提醒
- `userQuestions.ask` 提问时发送决策提醒，回答或取消后角标减一
- 免打扰时段只累计角标；可跟随 Windows 专注助手静音
- 非 Windows 平台自动跳过 Toast 与托盘

## 配置

设置页命名空间 `dsh-notify`，也可通过环境变量覆盖：

| 项 | 说明 |
| --- | --- |
| `DSH_NOTIFY=0` | 整体禁用 |
| `DSH_NOTIFY_SOUND` | 覆盖提示音 WAV 路径 |
| `DSH_NOTIFY_MIN_INTERVAL_MS` | Toast 节流间隔，默认 2500 |

## 开发

```powershell
npm test
npm run check
```

## 许可

[Apache-2.0](LICENSE) © 2026 MichengAI

能力思路参考社区项目 [dsh-windows-notify](https://github.com/Sutera-Diffusus/dsh-windows-notify)，实现按本仓库约定独立重写。
