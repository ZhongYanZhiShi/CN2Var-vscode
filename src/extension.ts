import * as vscode from 'vscode'
import { TranslationContext } from './lib/Translator'
import { translateToNamesCase } from './utils/common'
import { FormatEnum } from './types/enum'

export function activate(context: vscode.ExtensionContext) {
  const translationContext = new TranslationContext(context)

  // 监控配置文件的变化
  const onConfigChange = vscode.workspace.onDidChangeConfiguration(async (e) => {
    const translatorEngine = e.affectsConfiguration('CN2Var.translator.engine')
    if (translatorEngine) {
      translationContext.setTranslator()
    }
  })

  const disposable = vscode.commands.registerCommand('extension.CN2Var.translator.execute', async () => {
    const config = vscode.workspace.getConfiguration('CN2Var')

    // 判断是否启用插件
    const enable = config.get<boolean>('enable')
    if (!enable) {
      return
    }

    // 校验当前翻译器的密钥是否存在
    if (!await translationContext.validateKeys()) {
      // 用户配置密钥
      return await translationContext.reconfigureKeys()
    }

    const translateText = await vscode.window.showInputBox({
      title: '中文翻译',
      placeHolder: '请输入中文内容',
      prompt: '输入后按回车进行翻译',
      ignoreFocusOut: true,
      valueSelection: [0, 0],
    })

    if (!translateText) {
      return
    }

    // 调用翻译Api
    const result = await translationContext.translate(translateText)

    let returnValue = ''
    const selectFormat = config.get<boolean>('selectFormat')

    // 根据配置选择翻译结果的格式
    const _result: string[] = []
    if (selectFormat) {
      const format = config.get<FormatEnum>('format')
      result.forEach((value) => {
        _result.push(translateToNamesCase(value, format))
      })
    } else {
      Object.values(FormatEnum).forEach((format) => {
        result.forEach((value) => {
          _result.push(translateToNamesCase(value, format))
        })
      })
    }
    // 转换结果替换原有的结果
    result.splice(0, result.length, ..._result)

    if (result.length > 1) {
      const resultSet = new Set(result)
      result.splice(0, result.length, ...resultSet)
      returnValue = await vscode.window.showQuickPick(result, {
        title: '翻译结果',
        placeHolder: '选择翻译结果',
        ignoreFocusOut: true,
      }) || ''
    } else {
      returnValue = result[0]
    }

    if (!returnValue) {
      return
    }

    const editor = vscode.window.activeTextEditor

    if (editor) {
      editor.edit((editBuilder) => {
        editBuilder.insert(editor.selection.active, returnValue)
      })
    }
  })

  context.subscriptions.push(onConfigChange)
  context.subscriptions.push(disposable)
}

export function deactivate() { }
