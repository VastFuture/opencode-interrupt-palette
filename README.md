# ⌨️ opencode-interrupt-palette

> OpenCode TUI 插件：在命令面板里加一条 **Interrupt session**，一次操作就能中断正在跑的会话。

OpenCode 内置的 `session.interrupt` 有两个约束：命令只在**输入框持有焦点**时才生效，并且需要**按两次**才真正中断（第一次是 arm，第二次才确认）。一旦你把焦点移出输入框，中断就点不动，也没有任何反馈。

本插件把这条命令挂到命令面板上，选一次即可完成「arm + 确认」，不再依赖输入框焦点。

## ✅ OpenCode 版本支持

| OpenCode 版本 | 支持状态 | 说明 |
|---|---|---|
| V2 `>= 2.2` | ✅ 主要支持 | 使用 V2 TUI 插件入口 `Plugin.define({ id, setup })` |
| V1 | ❌ 不支持 | V1 没有 `@opencode/plugin/tui` 这套 TUI 插件 API |

## 🧩 它做了什么

插件注册一个全局 keymap 层，只加一条命令：

| 字段 | 值 |
|---|---|
| 命令 ID | `personal.interrupt` |
| 标题 | `Interrupt session` |
| 分组 | `Session` |
| 命令面板 | `palette: true`（可通过命令面板搜索到） |
| 快捷键 | 无（本插件不占用任何按键） |

`run` 里对内置的 `session.interrupt` 连发两次 dispatch：第一次让内置命令进入 arm 状态，第二次触发真正的 `POST /api/session/:id/interrupt`。

派发放在 `setTimeout(..., 10)` 里而不是同步执行，因为命令面板关闭后焦点由 OpenCode 用 `setTimeout(..., 1)` 还给输入框；内置命令在输入框失焦时会直接 return，同步派发会静默失效。

## 📦 安装

### 方式一：本地目录（推荐，单机使用）

```bash
mkdir -p ~/.config/opencode/plugins/interrupt-palette
cp src/tui.ts ~/.config/opencode/plugins/interrupt-palette/tui.ts
```

在 `~/.config/opencode/cli.json` 的 `plugins` 里登记该目录（绝对路径）：

```jsonc
{
  "$schema": "https://opencode.ai/v2/cli.json",
  "plugins": [{ "package": "/home/<you>/.config/opencode/plugins/interrupt-palette" }]
}
```

> `~/.config/opencode/plugins/` 下的目录本身就会被自动发现；显式登记的作用是固定绝对路径与加载顺序，和参考配置保持一致。同一个目录只会加载一次。

### 方式二：npm 包

TUI-only 插件必须写在 `cli.json`，不能写在 `opencode.json`：

```jsonc
{
  "$schema": "https://opencode.ai/v2/cli.json",
  "plugins": ["opencode-interrupt-palette"]
}
```

### 方式三：克隆仓库后软链

```bash
git clone https://github.com/VastFuture/opencode-interrupt-palette.git
ln -s "$PWD/opencode-interrupt-palette" ~/.config/opencode/plugins/interrupt-palette
```

改完 `cli.json` 后执行 `opencode service restart`（只重开 TUI 窗口不一定生效）。

## 🎯 可选：给中断单独配快捷键

参考配置里还给 `session.interrupt` 配了专属按键，这一步**不是插件运行的前提**，按需启用：

```jsonc
{
  "keybinds": { "session.interrupt": "ctrl+escape,alt+escape,ctrl+space" }
}
```

⚠️ 注意这是覆盖而不是追加：`session.interrupt` 默认绑定 `escape`，覆盖后 `escape` 不再中断会话，只用于关闭补全和弹窗；而且这些按键仍然遵循内置的两段式（按两次才中断）。真正「一次中断」的路径还是命令面板里的这条命令。

## 🔍 排查

| 现象 | 检查点 |
|---|---|
| 命令面板里搜不到 Interrupt session | `cli.json` 的 `plugins` 是否登记、路径是否为绝对路径、是否执行过 `opencode service restart` |
| 命令能选但没有反应 | 会话是否在跑（内置命令 `enabled` 要求 `status() === "running"`）；输入框是否处于 shell 模式（第一次派发只会切回 normal 模式） |
| 插件加载报错 | 确认 OpenCode 为 V2；`import { Plugin } from "@opencode/plugin/tui"` 由运行时解析，无需本地安装该包 |

## 📄 License

MIT
