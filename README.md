<p align="center">
  <img src="assets/icon.png" alt="DSH Notify" width="96">
</p>

<h1 align="center">DSH Notify</h1>

<p align="center">
  <strong>A DeepSeek Harness Web plugin for Windows toasts and a tray badge for turn completion, permission prompts, and questions.</strong>
</p>

<p align="center">
  <a href="https://github.com/MichengAI/dsh-notify/issues">Report an issue</a>
  · <a href="https://www.npmjs.com/package/@michengai/dsh-notify">View on npm</a>
  · <a href="README.zh-CN.md">简体中文</a>
</p>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-Apache--2.0-blue.svg" alt="Apache License 2.0"></a>
  <a href="https://www.npmjs.com/package/@michengai/dsh-notify"><img src="https://img.shields.io/npm/v/%40michengai/dsh-notify?label=npm" alt="npm package"></a>
  <img src="https://img.shields.io/badge/DSH-Web%20Plugin-10b981" alt="DSH Web Plugin">
  <img src="https://img.shields.io/badge/Node.js-22%2B-339933?logo=nodedotjs&logoColor=white" alt="Node.js 22 or later">
</p>

> DSH Notify is a community-maintained plugin, not an official DeepSeek AI product.

## Features

- Sends a Windows toast when the root Agent returns from `running` to `idle`.
- Wraps `userQuestions.ask` so plan reviews and decision prompts also raise a toast.
- Shows a tray badge for unanswered questions plus completed sessions that have not been opened yet.
- Uses the Windows default notification sound. Quiet hours and Focus Assist are optional.
- Installs as a native DSH profile plugin. It does not patch built-in DeepSeek packages.

## Prerequisites

- A working DeepSeek Harness Web installation with `dsh` available in PowerShell.
- Windows 10/11 for toasts and the tray icon. Other platforms skip those surfaces automatically.
- Examples use the `web` profile; replace it with the target profile.
- Source installation and development require Node.js 22+. npm installation does not require running `npm install` in an arbitrary directory.

## Installation

### Install from npm

Run this from any PowerShell directory. Install into the DSH profile through `dsh plugin`:

```powershell
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8
dsh plugin --profile web add @michengai/dsh-notify
dsh --profile web --dump-config
```

Restart DSH Web or reload the active Web profile. If a package mirror is behind, append `--registry=https://registry.npmjs.org/`.

### Install from source

Use this for debugging or unpublished changes. The cloned directory becomes the plugin source path:

```powershell
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8
Set-Location D:\Repository\deepseek-harness-plugin
git clone https://github.com/MichengAI/dsh-notify.git
Set-Location .\dsh-notify
npm install
npm test
npm run build
dsh plugin --profile web add .
dsh --profile web --dump-config
```

Restart DSH Web or reload the active Web profile. Local installation reads and applies `cordis.patch.yml`; do not copy `lib` files manually.

## Usage

Open **Settings → Notifications**, then use the panel as follows:

| Goal | Action | Scope |
| --- | --- | --- |
| Turn completion alerts | Choose **Always**, **Only when unfocused**, or **Off**. | Root-agent completion |
| Permission alerts | Toggle **Enable permission notifications**. | Tool and plan approval |
| Question alerts | Toggle **Enable question notifications**. | Decisions that block progress |
| Quiet hours | Enable the schedule and set start/end times. | Toasts during that window |
| Follow Focus Assist | Toggle **Follow system Do Not Disturb**. | System Focus Assist |
| Merge completions | Combine finishes that arrive within a few seconds. | Completion toasts |

Environment overrides:

| Variable | Effect |
| --- | --- |
| `DSH_NOTIFY=0` | Disable the plugin entirely |
| `DSH_NOTIFY_MIN_INTERVAL_MS` | Toast throttle, default `2500` |

## Privacy and safety

| Surface | Reads | Writes | Network |
| --- | --- | --- | --- |
| `$DSH_HOME\settings.yaml` `dsh-notify` section | Yes | Yes | No |
| `$DSH_HOME\dsh-notify` tray state and debug log | Yes | Yes | No |
| `/api/dsh-notify/config` | Same-origin settings UI | Same-origin settings UI | Local only |

- The plugin does not send telemetry and does not read credentials.
- Child-agent completions and armed goal auto-continues do not raise a finish toast.
- Unpacked Windows apps cannot activate toast buttons, so notifications are informational only.

## Development

This repository keeps TypeScript in `src` and builds to `lib`:

- [src\index.ts](src/index.ts): host plugin, settings registration, and HTTP routes.
- [src\client\index.ts](src/client/index.ts): Settings → Notifications section.
- [scripts\toast.ps1](scripts/toast.ps1) and [scripts\tray.ps1](scripts/tray.ps1): Windows toast and tray helpers.
- `tests\*.test.ts`: config, quiet hours, session helpers, and package-contract checks.

After changing the source, test, rebuild, and install from the local directory:

```powershell
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8
npm test
npm run check
dsh plugin --profile web add .
```

PowerShell scripts that contain Chinese text must stay UTF-8 with BOM.

## Validation

```powershell
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8
npm test
npm run check
```

`npm run check` runs typecheck, tests, and the Host/Web build.

## Documentation and license

Project status, usage boundaries, architecture, and iteration records begin at the [documentation entry point](docs/00-交接入口/00-阅读导航.md).

Licensed under [Apache License 2.0](LICENSE).


