# 中译码 - CN2Var

[![License](https://img.shields.io/github/license/ZhongYanZhiShi/vscode-CN2Var.svg)](https://github.com/ZhongYanZhiShi/vscode-CN2Var/blob/main/LICENSE.md)
[![Version](https://img.shields.io/vscode-marketplace/v/ZhongYanZhiShi.cn2var.svg)](https://marketplace.visualstudio.com/items?itemName=ZhongYanZhiShi.cn2var)
[![Installs](https://img.shields.io/vscode-marketplace/i/ZhongYanZhiShi.cn2var.svg)](https://marketplace.visualstudio.com/items?itemName=ZhongYanZhiShi.cn2var)

一个用于翻译的VS Code扩展，可以将中文文本翻译成英文并转换为各种编程语言的变量命名格式。

## ✨ 功能特性

- 🌐 **多翻译引擎支持**：有道翻译、OpenAI
- 🔧 **多种命名格式**：支持camelCase、PascalCase、snake_case、kebab-case
- 🔒 **安全的密钥管理**：使用VS Code内置的密钥存储系统
- ⚡ **快速操作**：支持快捷键操作（Alt+F1 / Cmd+F1）
- 🎯 **智能错误处理**：详细的错误提示和自动重试机制
- 🌈 **进度指示器**：实时显示翻译进度

## 🚀 安装

1. 打开VS Code
2. 按 `Ctrl+P` (Windows/Linux) 或 `Cmd+P` (macOS) 打开命令面板
3. 输入 `ext install ZhongYanZhiShi.cn2var`
4. 点击安装

## 📖 使用方法

### 基本使用

1. 使用快捷键 `Alt+F1` (Windows/Linux) 或 `Cmd+F1` (macOS)
2. 或者打开命令面板 (`Ctrl+Shift+P` / `Cmd+Shift+P`)，输入 "翻译并插入变量"
3. 在输入框中输入中文文本
4. 翻译结果将自动插入到当前光标位置

## ⚙️ 配置选项

| 配置项 | 描述 | 默认值 |
|--------|------|--------|
| `CN2Var.enable` | 启用/禁用中译码扩展 | `true` |
| `CN2Var.format` | 变量命名格式 | `camelCase` |
| `CN2Var.selectFormat` | 每次翻译时选择格式 | `false` |
| `CN2Var.translator.engine` | 翻译引擎 | `有道翻译` |
| `CN2Var.translator.model.openai` | OpenAI模型 | `gpt-4o-mini` |

## 🎯 支持的命名格式

- **camelCase**: `userName`, `getUserInfo`
- **PascalCase**: `UserName`, `GetUserInfo`
- **snake_case**: `user_name`, `get_user_info`
- **kebab-case**: `user-name`, `get-user-info`

## 🔐 安全性

- 所有API密钥都使用VS Code内置的密钥存储系统加密保存
- 密钥不会被记录到日志中
- 支持随时重新配置密钥

## 📞 支持

如果您在使用过程中遇到问题，请：

1. 搜索现有的[Issues](https://github.com/ZhongYanZhiShi/vscode-CN2Var/issues)
2. 创建新的[Issue](https://github.com/ZhongYanZhiShi/vscode-CN2Var/issues/new)

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE.md](LICENSE.md) 文件了解详情

---

💖 如果这个扩展对您有帮助，请给我们一个 ⭐️！
