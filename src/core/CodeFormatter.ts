import { FormatEnum } from '../types'

/**
 * 代码格式化器类
 * 负责将文本转换为不同的代码变量格式
 */
export class CodeFormatter {
  /**
   * 实例方法：格式化文本
   */
  format(text: string, format: FormatEnum): string {
    return CodeFormatter.formatToCase(text, format)
  }

  /**
   * 将文本转换为指定格式的变量名
   * @param text 要转换的文本
   * @param format 目标格式
   */
  static formatToCase(text: string, format: FormatEnum): string {
    if (!text) {
      return ''
    }

    // 使用正则表达式分割文本，支持中文、英文、数字、符号
    const words = text
      .replace(/[\u4E00-\u9FA5]/g, ' $& ') // 中文字符前后加空格
      .split(/[-_\s]+/)
      .map(word => word.trim())
      .filter(word => word.length > 0)

    const formatters = {
      [FormatEnum.CamelCase]: () => this.toCamelCase(words),
      [FormatEnum.PascalCase]: () => this.toPascalCase(words),
      [FormatEnum.KebabCase]: () => this.toKebabCase(words),
      [FormatEnum.SnakeCase]: () => this.toSnakeCase(words),
    }

    return formatters[format]()
  }

  /**
   * 将翻译结果转换为所有格式
   * @param translations 翻译结果数组
   * @param selectedFormat 如果指定格式，只返回该格式的结果
   */
  static formatTranslations(translations: string[], selectedFormat?: FormatEnum): string[] {
    const results: string[] = []

    if (selectedFormat) {
      // 只返回指定格式
      translations.forEach((translation) => {
        const formatted = this.formatToCase(translation, selectedFormat)
        if (formatted) {
          results.push(formatted)
        }
      })
    } else {
      // 返回所有格式
      Object.values(FormatEnum).forEach((format) => {
        translations.forEach((translation) => {
          const formatted = this.formatToCase(translation, format)
          if (formatted) {
            results.push(formatted)
          }
        })
      })
    }

    // 去重
    return [...new Set(results)]
  }

  /**
   * 转换为驼峰命名
   */
  private static toCamelCase(words: string[]): string {
    return words
      .map((word, index) =>
        index === 0
          ? word.toLowerCase()
          : this.capitalizeFirst(word.toLowerCase()),
      )
      .join('')
  }

  /**
   * 转换为帕斯卡命名
   */
  private static toPascalCase(words: string[]): string {
    return words
      .map(word => this.capitalizeFirst(word.toLowerCase()))
      .join('')
  }

  /**
   * 转换为短横线命名
   */
  private static toKebabCase(words: string[]): string {
    return words
      .map(word => word.toLowerCase())
      .join('-')
  }

  /**
   * 转换为下划线命名
   */
  private static toSnakeCase(words: string[]): string {
    return words
      .map(word => word.toLowerCase())
      .join('_')
  }

  /**
   * 首字母大写
   */
  private static capitalizeFirst(text: string): string {
    if (!text)
      return ''
    return text.charAt(0).toUpperCase() + text.slice(1)
  }
}
