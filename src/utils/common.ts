import { createHash } from 'node:crypto'
import { FormatEnum } from '../types'

/**
 * 翻译结果转换成驼峰命名
 * @param str 要转换的字符串
 * @param formatType 格式类型
 */
export function translateToNamesCase(str: string = '', formatType: FormatEnum = FormatEnum.CamelCase): string {
  if (!str) {
    return ''
  }

  // 使用-_空格分割字符串
  const words = str.split(/[-_\s]/).map(value => value)

  const formatters = {
    [FormatEnum.CamelCase]: () => words.map((word, index) => index === 0 ? word.toLowerCase() : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(''),
    [FormatEnum.PascalCase]: () => words.map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(''),
    [FormatEnum.KebabCase]: () => words.map(word => word.toLowerCase()).join('-'),
    [FormatEnum.SnakeCase]: () => words.map(word => word.toLowerCase()).join('_'),
  }

  return (formatters[formatType])()
}

/**
 * 生成 UUID。
 */
export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

/**
 * 计算给定内容的 SHA256 哈希值。
 */
export function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex')
}
