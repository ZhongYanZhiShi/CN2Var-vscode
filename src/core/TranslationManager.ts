import * as vscode from 'vscode'
import { FormatEnum, TranslatorEnum } from '../types'
import { MESSAGES } from '../messages'
import type { ITranslator } from './BaseTranslator'
import { CodeFormatter } from './CodeFormatter'
import type { ConfigManager } from './ConfigManager'
import type { ErrorHandler } from './ErrorHandler'
import { TranslatorFactory } from './TranslatorFactory'

/**
 * 翻译管理器
 * 统一管理翻译器的创建、切换和调用
 */
export class TranslationManager {
  private currentTranslator!: ITranslator
  private context: vscode.ExtensionContext
  private configManager: ConfigManager
  private errorHandler: ErrorHandler
  private codeFormatter: CodeFormatter

  constructor(
    context: vscode.ExtensionContext,
    configManager: ConfigManager,
    errorHandler: ErrorHandler,
  ) {
    this.context = context
    this.configManager = configManager
    this.errorHandler = errorHandler
    this.codeFormatter = new CodeFormatter()
    this.initializeTranslator()
  }

  /**
   * 初始化翻译器
   */
  private initializeTranslator(): void {
    try {
      const engine = this.configManager.getTranslatorEngine()
      this.currentTranslator = TranslatorFactory.createTranslator(engine, this.context)
    } catch (error) {
      this.errorHandler.handleConfigError(error)
      // 使用默认翻译器（Ollama）
      this.currentTranslator = TranslatorFactory.createTranslator(TranslatorEnum.Ollama, this.context)
    }
  }

  /**
   * 重新初始化翻译器
   */
  async reinitializeTranslator(): Promise<void> {
    this.initializeTranslator()
  }

  /**
   * 切换翻译器
   */
  switchTranslator(engine: TranslatorEnum): void {
    try {
      this.currentTranslator = TranslatorFactory.createTranslator(engine, this.context)
    } catch (error) {
      this.errorHandler.handleTranslatorError(error, engine)
      throw error
    }
  }

  /**
   * 翻译并格式化
   */
  async translateAndFormat(text: string): Promise<string | undefined> {
    try {
      // 检查翻译器密钥
      if (!await this.currentTranslator.validateKeys()) {
        await this.currentTranslator.reconfigureKeys()
        return undefined
      }

      // 显示翻译进度
      return await vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: MESSAGES.TRANSLATING,
          cancellable: false,
        },
        async () => {
          // 执行翻译
          const translations = await this.currentTranslator.translate(text)

          if (!translations || translations.length === 0) {
            this.errorHandler.showWarning(MESSAGES.TRANSLATION_FAILED)
            return undefined
          }

          // 格式化翻译结果
          const formattedResults = this.formatTranslationResults(translations)

          // 如果有多个结果，让用户选择
          if (formattedResults.length > 1) {
            const selected = await vscode.window.showQuickPick(formattedResults, {
              title: MESSAGES.RESULT_TITLE,
              placeHolder: MESSAGES.RESULT_PLACEHOLDER,
              ignoreFocusOut: true,
            })
            return selected
          }

          return formattedResults[0]
        },
      )
    } catch (error) {
      this.errorHandler.handleTranslatorError(error, this.currentTranslator.name || '翻译器')
      return undefined
    }
  }

  /**
   * 格式化翻译结果
   */
  private formatTranslationResults(translations: string[]): string[] {
    const shouldSelectFormat = this.configManager.shouldSelectFormat()
    const defaultFormat = this.configManager.getDefaultFormat()

    const results: string[] = []

    if (shouldSelectFormat) {
      // 只使用指定格式
      translations.forEach((translation) => {
        const formatted = this.codeFormatter.format(translation, defaultFormat)
        if (formatted) {
          results.push(formatted)
        }
      })
    } else {
      // 使用所有格式
      translations.forEach((translation) => {
        Object.values(FormatEnum).forEach((format) => {
          const formatted = this.codeFormatter.format(translation, format)
          if (formatted) {
            results.push(formatted)
          }
        })
      })
    }

    // 去重并过滤空值
    return [...new Set(results)].filter(result => result && result.length > 0)
  }

  /**
   * 获取当前翻译器
   */
  getCurrentTranslator(): ITranslator {
    return this.currentTranslator
  }

  /**
   * 获取翻译器状态信息
   */
  async getTranslatorStatus(): Promise<{
    name: string
    engine: TranslatorEnum
    hasValidKeys: boolean
  }> {
    return {
      name: this.currentTranslator.name,
      engine: this.configManager.getTranslatorEngine(),
      hasValidKeys: await this.currentTranslator.validateKeys(),
    }
  }
}
