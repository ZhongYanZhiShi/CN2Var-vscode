import { FormatEnum, TranslatorEnum } from '../types'

/**
 * 默认配置设置
 */
export const DEFAULT_CONFIG = {
  /** 插件是否启用 */
  ENABLE: true,

  /** 是否选择特定格式（false表示显示所有格式选项） */
  SELECT_FORMAT: false,

  /** 默认代码格式 */
  DEFAULT_FORMAT: FormatEnum.CamelCase,

  /** 默认翻译引擎 */
  DEFAULT_TRANSLATOR: TranslatorEnum.Youdao,

  /** 默认OpenAI模型 */
  DEFAULT_OPENAI_MODEL: 'gpt-4o-mini',

  /** 翻译结果最大数量 */
  MAX_TRANSLATION_RESULTS: 10,

  /** API请求超时时间（毫秒） */
  REQUEST_TIMEOUT: 10000,
} as const

/**
 * 配置键名常量
 */
export const CONFIG_KEYS = {
  /** 主配置节点 */
  SECTION: 'CN2Var',

  /** 启用状态 */
  ENABLE: 'CN2Var.enable',

  /** 选择格式 */
  SELECT_FORMAT: 'CN2Var.selectFormat',

  /** 代码格式 */
  FORMAT: 'CN2Var.format',

  /** 翻译引擎 */
  TRANSLATOR_ENGINE: 'CN2Var.translator.engine',

  /** OpenAI模型 */
  OPENAI_MODEL: 'CN2Var.translator.model.openai',

  /** 有道翻译应用ID */
  YOUDAO_APP_KEY: 'CN2Var.youdao.appKey',

  /** 有道翻译应用密钥 */
  YOUDAO_APP_SECRET: 'CN2Var.youdao.appSecret',

  /** OpenAI API密钥 */
  OPENAI_API_KEY: 'CN2Var.openai.apiKey',

  /** OpenAI API基础URL */
  OPENAI_BASE_URL: 'CN2Var.openai.baseUrl',
} as const

/**
 * 存储键名常量（用于 ExtensionContext.globalState）
 */
export const STORAGE_KEYS = {
  /** 有道翻译应用ID */
  YOUDAO_APP_KEY: 'youdao.appKey',

  /** 有道翻译应用密钥 */
  YOUDAO_APP_SECRET: 'youdao.appSecret',

  /** OpenAI API密钥 */
  OPENAI_API_KEY: 'openai.apiKey',

  /** OpenAI API基础URL */
  OPENAI_BASE_URL: 'openai.baseUrl',

  /** 用户首选项 */
  USER_PREFERENCES: 'user.preferences',
} as const
