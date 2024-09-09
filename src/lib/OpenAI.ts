import * as vscode from 'vscode'
import OpenAI from 'openai'
import { type Translator, TranslatorEnum } from './Translator'

export class OpenaiTranslator implements Translator {
  private context: vscode.ExtensionContext
  private name = TranslatorEnum.OpenAI
  private openai: OpenAI
  private apiKey: string

  constructor(context: vscode.ExtensionContext) {
    this.context = context
    this.apiKey = ''
    this.openai = new OpenAI({
      apiKey: this.apiKey,
    })
    this.getKeys()
  }

  public async reconfigureKeys(): Promise<void> {
    return await vscode.window.showInformationMessage(`要重新配置 <${this.name}> 的密钥吗？`, '配置').then(async (selection) => {
      if (selection === '配置') {
        await this.inputKey()
      }
    })
  }

  /**
   * 获取有道翻译的应用ID和应用密钥。
   */
  public async getKeys(): Promise<string[]> {
    this.apiKey = await this.context.secrets.get('OpenAI_apiKey') || ''
    return Promise.resolve([this.apiKey])
  }

  /**
   * 设置有道翻译的应用ID和应用密钥。
   * @returns 一个Promise，表示设置操作的异步结果。
   */
  public async inputKey(): Promise<void> {
    const apiKey = await vscode.window.showInputBox({
      title: this.name,
      prompt: `${this.name} Key`,
      ignoreFocusOut: true,
      password: true,
      validateInput: (value) => {
        if (!value) {
          return `${this.name} Key不能为空`
        }
      },
    })

    if (apiKey) {
      this.context.secrets.store(`${this.name}_apiKey`, apiKey)
      this.apiKey = apiKey
      this.openai.apiKey = apiKey
      return Promise.resolve()
    }

    return Promise.reject(new Error(`缺少${this.name}密钥`))
  }

  /**
   * 验证有道翻译所需的密钥。
   *
   * @returns 一个解析为布尔值的 Promise，表示键值是否有效。
   */
  public async validateKeys(): Promise<boolean> {
    const [appid] = await this.getKeys()
    return Boolean(appid)
  }

  /**
   * 使用有道翻译API翻译文本。
   * @param text - 要翻译的文本。
   */
  public async translate(text: string): Promise<string[]> {
    // 查看环境变量OPENAI_API_KEY是否存在
    if (!this.apiKey) {
      await this.reconfigureKeys()
    }

    const result = await vscode.window.withProgress({
      location: vscode.ProgressLocation.Window,
      title: `正在获取<${this.name}>翻译结果…`,
    }, async (_progress, _token) => {
      this.openai.apiKey = this.apiKey
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: '请把内容翻译为英文变量，并且使用空格分割' },
          {
            role: 'user',
            content: text,
          },
        ],
      })

      if (completion.choices.length) {
        return completion.choices.reduce((result: string[], choice) => {
          result.push(choice.message.content || '')
          return result
        }, [])
      }

      return []
    })

    return result
  }
}
