/** 消息常量定义 */
export const MESSAGES = {
  // 通用消息
  PLUGIN_DISABLED: '插件已禁用',
  TRANSLATION_CANCELLED: '翻译已取消',
  NO_ACTIVE_EDITOR: '没有活动的编辑器',

  // 输入框消息
  INPUT_TITLE: '中文翻译',
  INPUT_PLACEHOLDER: '请输入中文内容',
  INPUT_PROMPT: '输入后按回车进行翻译',

  // 翻译结果选择
  RESULT_TITLE: '翻译结果',
  RESULT_PLACEHOLDER: '选择翻译结果',

  // 错误消息
  TRANSLATION_FAILED: '翻译失败',
  NETWORK_ERROR: '网络连接错误',
  API_KEY_MISSING: 'API密钥缺失',
  INVALID_RESPONSE: '翻译服务返回无效响应',

  // 配置消息
  CONFIG_API_KEY_TITLE: '配置API密钥',
  CONFIG_API_KEY_PLACEHOLDER: '请输入API密钥',
  CONFIG_APP_KEY_TITLE: '配置应用密钥',
  CONFIG_APP_KEY_PLACEHOLDER: '请输入应用密钥',
  CONFIG_APP_SECRET_TITLE: '配置应用密钥',
  CONFIG_APP_SECRET_PLACEHOLDER: '请输入应用密码',

  // 状态消息
  TRANSLATING: '正在翻译...',
  TRANSLATION_SUCCESS: '翻译成功',
} as const

/** 错误代码枚举 */
export enum ErrorCode {
  NETWORK_ERROR = 'NETWORK_ERROR',
  API_KEY_MISSING = 'API_KEY_MISSING',
  INVALID_RESPONSE = 'INVALID_RESPONSE',
  TRANSLATION_FAILED = 'TRANSLATION_FAILED',
  CONFIG_ERROR = 'CONFIG_ERROR',
}

/** 错误消息映射 */
export const ERROR_MESSAGES = {
  [ErrorCode.NETWORK_ERROR]: MESSAGES.NETWORK_ERROR,
  [ErrorCode.API_KEY_MISSING]: MESSAGES.API_KEY_MISSING,
  [ErrorCode.INVALID_RESPONSE]: MESSAGES.INVALID_RESPONSE,
  [ErrorCode.TRANSLATION_FAILED]: MESSAGES.TRANSLATION_FAILED,
  [ErrorCode.CONFIG_ERROR]: '配置错误',
} as const
