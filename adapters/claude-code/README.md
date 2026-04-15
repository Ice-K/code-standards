# Claude Code Adapter

当前项目本身就是 Claude Code 的原生格式。无需转换，直接将项目安装到 Claude Code 插件目录即可使用。

## 安装方式

将整个项目目录放置在 Claude Code 的插件路径下，或通过 `plugin.json` 注册。

## 核心文件

- `.opencode/plugins/code-standards.js` — Bootstrap 脚本
- `skills/code-standards/` — 守卫协议和检测规则
- `standards/` — 规范文件库
- `commands/` — 斜杠命令
