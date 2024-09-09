import type { ErrorMessageKey } from '../message/youdao'

interface YoudaoResponseSuccess {
  /** 错误返回码 */
  errorCode: '0'
  /** 源语言 */
  query: string
  /** 翻译结果 */
  translation: string[]
  /** 源语言和目标语言 */
  l: string
  /** 词典deeplink */
  dict?: string
  /** webdeeplink */
  webdict?: string
  /** 翻译结果发音地址 */
  tSpeakUrl?: string
  /** 源语言发音地址 */
  speakUrl?: string
}

interface YoudaoResponseError {
  /** 错误返回码 */
  errorCode: ErrorMessageKey
  /** 源语言 */
  l: string
}

type YoudaoResponse = YoudaoResponseSuccess | YoudaoResponseError
