import * as vscode from 'vscode'

/**
 * 翻译器基类接口
 */
export interface ITranslator {
  /** 翻译器名称 */
  readonly name: string

  /** 翻译文本 */
  translate: (text: string) => Promise<string[]>

  /** 验证密钥 */
  validateKeys: () => Promise<boolean>

  /** 输入密钥 */
  inputKey: () => Promise<void>

  /** 重新配置密钥 */
  reconfigureKeys: () => Promise<void>
}

/**
 * 翻译器基类
 * 提供公共功能实现
 */
export abstract class BaseTranslator implements ITranslator {
  protected context: vscode.ExtensionContext

  constructor(context: vscode.ExtensionContext) {
    this.context = context
  }

  abstract get name(): string
  abstract translate(text: string): Promise<string[]>
  abstract validateKeys(): Promise<boolean>
  abstract inputKey(): Promise<void>

  /**
   * 重新配置密钥的通用实现
   */
  async reconfigureKeys(): Promise<void> {
    const selection = await vscode.window.showInformationMessage(
      `要重新配置 ${this.name} 的密钥吗？`,
      '配置',
      '取消',
    )

    if (selection === '配置') {
      await this.inputKey()
    }
  }

  /**
   * 显示翻译进度
   */
  protected async withProgress<T>(
    title: string,
    task: () => Promise<T>,
  ): Promise<T> {
    return vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Window,
        title: `正在获取 ${this.name} 翻译结果…`,
      },
      async () => task(),
    )
  }

  /**
   * 显示输入框
   */
  protected async showInputBox(options: {
    title: string
    prompt: string
    password?: boolean
    placeholder?: string
    validateInput?: (value: string) => string | undefined
  }): Promise<string | undefined> {
    return vscode.window.showInputBox({
      title: `${this.name} - ${options.title}`,
      prompt: options.prompt,
      password: options.password,
      placeHolder: options.placeholder,
      ignoreFocusOut: true,
      validateInput: options.validateInput,
    })
  }
}
