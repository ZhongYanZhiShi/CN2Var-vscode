import * as vscode from 'vscode'
import { TranslationManager } from './core/TranslationManager'
import { ConfigManager } from './core/ConfigManager'
import { ErrorHandler } from './core/ErrorHandler'
import { MESSAGES } from './messages'

export function activate(context: vscode.ExtensionContext) {
  const configManager = new ConfigManager(context)
  const errorHandler = new ErrorHandler()
  const translationManager = new TranslationManager(context, configManager, errorHandler)

  // 监控配置文件的变化
  const onConfigChange = vscode.workspace.onDidChangeConfiguration(async (e) => {
    if (e.affectsConfiguration('CN2Var.translator.engine')) {
      await translationManager.reinitializeTranslator()
    }
  })

  // 注册翻译命令
  const disposable = vscode.commands.registerCommand('extension.CN2Var.translator.execute', async () => {
    try {
      // 检查插件是否启用
      if (!configManager.isEnabled()) {
        vscode.window.showInformationMessage(MESSAGES.PLUGIN_DISABLED)
        return
      }

      // 获取用户输入
      const translateText = await vscode.window.showInputBox({
        title: MESSAGES.INPUT_TITLE,
        placeHolder: MESSAGES.INPUT_PLACEHOLDER,
        prompt: MESSAGES.INPUT_PROMPT,
        ignoreFocusOut: true,
        valueSelection: [0, 0],
      })

      if (!translateText) {
        return
      }

      // 执行翻译
      const result = await translationManager.translateAndFormat(translateText)

      if (!result) {
        return
      }

      // 插入翻译结果到编辑器
      const editor = vscode.window.activeTextEditor
      if (!editor) {
        vscode.window.showWarningMessage(MESSAGES.NO_ACTIVE_EDITOR)
        return
      }

      await editor.edit((editBuilder) => {
        editBuilder.insert(editor.selection.active, result)
      })

      vscode.window.showInformationMessage(MESSAGES.TRANSLATION_SUCCESS)
    } catch (error) {
      errorHandler.handleError(error)
    }
  })

  context.subscriptions.push(onConfigChange, disposable)
}

export function deactivate() { }
