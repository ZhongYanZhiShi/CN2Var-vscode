import type * as vscode from 'vscode'
import { TranslatorEnum } from '../types'
import { YoudaoTranslator } from '../translators/YoudaoTranslator'
import { OpenAITranslator } from '../translators/OpenAITranslator'
import type { ITranslator } from './BaseTranslator'
import { ErrorHandler } from './ErrorHandler'

/**
 * 翻译器工厂类
 * 负责创建和管理翻译器实例
 */
export class TranslatorFactory {
  private static translators = new Map<TranslatorEnum, ITranslator>()

  /**
   * 创建翻译器实例
   */
  static createTranslator(
    engine: TranslatorEnum,
    context: vscode.ExtensionContext,
  ): ITranslator {
    try {
      // 检查是否已有缓存的实例
      if (this.translators.has(engine)) {
        return this.translators.get(engine)!
      }

      let translator: ITranslator

      switch (engine) {
        case TranslatorEnum.Youdao:
          translator = new YoudaoTranslator(context)
          break
        case TranslatorEnum.OpenAI:
          translator = new OpenAITranslator(context)
          break
        default: {
          const errorHandler = new ErrorHandler()
          throw errorHandler.createError(`不支持的翻译引擎: ${engine}`)
        }
      }

      // 缓存实例
      this.translators.set(engine, translator)
      return translator
    } catch (error) {
      const errorHandler = new ErrorHandler()
      errorHandler.handleTranslatorError(error, '翻译器工厂')
      throw error
    }
  }

  /**
   * 获取支持的翻译器列表
   */
  static getSupportedTranslators(): TranslatorEnum[] {
    return Object.values(TranslatorEnum)
  }

  /**
   * 清除缓存的翻译器实例
   */
  static clearCache(): void {
    this.translators.clear()
  }

  /**
   * 重置指定翻译器的缓存
   */
  static resetTranslator(engine: TranslatorEnum): void {
    this.translators.delete(engine)
  }
}
