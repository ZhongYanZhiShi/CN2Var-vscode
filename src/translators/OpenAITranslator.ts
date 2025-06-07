import * as vscode from 'vscode'
import OpenAI from 'openai'
import { BaseTranslator } from '../core/BaseTranslator'
import { ConfigManager } from '../core/ConfigManager'

/**
 * OpenAI翻译器实现
 */
export class OpenAITranslator extends BaseTranslator {
  private openai!: OpenAI
  private apiKey: string = ''

  get name(): string {
    return 'OpenAI'
  }

  constructor(context: vscode.ExtensionContext) {
    super(context)
    this.initializeClient()
  }

  /**
   * 初始化OpenAI客户端
   */
  private async initializeClient(): Promise<void> {
    await this.getKeys()
    this.openai = new OpenAI({
      apiKey: this.apiKey || 'placeholder', // OpenAI需要一个非空字符串
    })
  }

  /**
   * 获取密钥
   */
  private async getKeys(): Promise<[string]> {
    this.apiKey = await this.context.secrets.get('OpenAI_apiKey') || ''
    return [this.apiKey]
  }

  /**
   * 验证密钥
   */
  async validateKeys(): Promise<boolean> {
    const [apiKey] = await this.getKeys()
    return Boolean(apiKey)
  }

  /**
   * 输入密钥
   */
  async inputKey(): Promise<void> {
    const apiKey = await this.showInputBox({
      title: '配置',
      prompt: '请输入OpenAI API Key',
      placeholder: 'sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
      password: true,
      validateInput: (value) => {
        if (!value) {
          return 'API Key不能为空'
        }
        if (!value.startsWith('sk-')) {
          return 'API Key格式不正确，应以sk-开头'
        }
        return undefined
      },
    })

    if (!apiKey) {
      throw new Error('缺少OpenAI API Key')
    }

    // 保存密钥
    await this.context.secrets.store('OpenAI_apiKey', apiKey)
    this.apiKey = apiKey

    // 重新初始化客户端
    await this.initializeClient()

    vscode.window.showInformationMessage('OpenAI API Key配置成功')
  }

  /**
   * 翻译文本
   */
  async translate(text: string): Promise<string[]> {
    if (!await this.validateKeys()) {
      throw new Error('请先配置OpenAI API Key')
    }

    return this.withProgress('翻译中...', async () => {
      try {
        // 更新API Key
        this.openai.apiKey = this.apiKey

        const configManager = new ConfigManager()
        const model = configManager.getOpenAIModel()

        const completion = await this.openai.chat.completions.create({
          model,
          messages: [
            {
              role: 'system',
              content: '你是一个专业的翻译助手。请将中文文本翻译为英文，并且适合用作编程变量名。返回多个候选翻译结果，每个结果用空格分隔单词。',
            },
            {
              role: 'user',
              content: `请将以下中文翻译为适合作为编程变量名的英文：${text}`,
            },
          ],
          temperature: 0.3,
          max_tokens: 200,
        })

        const result = completion.choices[0]?.message?.content
        if (!result) {
          throw new Error('OpenAI返回空结果')
        }

        // 解析结果，支持多种格式
        const translations = this.parseTranslationResult(result)

        if (translations.length === 0) {
          throw new Error('无法解析翻译结果')
        }

        return translations
      } catch (error: any) {
        if (error.status === 401) {
          vscode.window.showWarningMessage('OpenAI API Key无效，请重新配置')
          await this.reconfigureKeys()
        } else if (error.status === 429) {
          vscode.window.showWarningMessage('OpenAI API调用频率超限，请稍后重试')
        } else if (error.status === 403) {
          vscode.window.showWarningMessage('OpenAI API访问被拒绝，请检查账户状态')
        }
        throw error
      }
    })
  }

  /**
   * 解析翻译结果
   */
  private parseTranslationResult(result: string): string[] {
    const translations: string[] = []

    // 清理文本
    const cleaned = result.trim().replace(/"/g, '"')

    // 尝试多种解析方式
    const patterns = [
      // 直接按行分割
      /^(.+)$/gm,
      // 按数字序号分割
      /\d+\.\s*(.+)/g,
      // 按短横线分割
      /[-•]\s*(.+)/g,
      // 按逗号分割
      /([^,]+)/g,
    ]

    for (const pattern of patterns) {
      const matches = cleaned.match(pattern)
      if (matches && matches.length > 0) {
        for (const match of matches) {
          const clean = match.replace(/^\d+\.\s*|^[-•]\s*/, '').trim()
          if (clean && clean.length > 0 && /^[a-z\s]+$/i.test(clean)) {
            translations.push(clean)
          }
        }
        if (translations.length > 0) {
          break
        }
      }
    }

    // 如果没有匹配到，直接使用原文本
    if (translations.length === 0 && /^[a-z\s]+$/i.test(cleaned)) {
      translations.push(cleaned)
    }

    // 去重并限制数量
    return [...new Set(translations)].slice(0, 5)
  }
}
