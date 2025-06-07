/** 代码格式类型枚举 */
export enum FormatEnum {
  CamelCase = 'camelCase',
  PascalCase = 'PascalCase',
  SnakeCase = 'snake_case',
  KebabCase = 'kebab-case',
}

/** 翻译引擎类型枚举 */
export enum TranslatorEnum {
  Youdao = '有道翻译',
  OpenAI = 'OpenAI',
}

/** 翻译器配置接口 */
export interface TranslatorConfig {
  engine: TranslatorEnum
  apiKey?: string
  appKey?: string
  appSecret?: string
  model?: string
}

/** 翻译结果接口 */
export interface TranslationResult {
  original: string
  translations: string[]
  engine: TranslatorEnum
}

/** 插件配置接口 */
export interface CN2VarConfig {
  enable: boolean
  selectFormat: boolean
  format: FormatEnum
  translator: {
    engine: TranslatorEnum
    model?: {
      openai: string
    }
  }
}
