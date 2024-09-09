import * as vscode from 'vscode'
import axios from 'axios'
import type { Translator } from '../lib/Translator'
import { errorMessage } from '../message/youdao'
import type { YoudaoResponse } from '../types/youdao'
import type { ErrorMessageKey } from '../message/youdao'
import { generateUUID, sha256 } from '../utils/common'

export class YoudaoTranslator implements Translator {
  private context: vscode.ExtensionContext
  private name = '有道翻译'
  private appKey: string
  private appSecret: string

  constructor(context: vscode.ExtensionContext) {
    this.context = context
    this.appKey = ''
    this.appSecret = ''
    this.getKeys()
  }

  /**
   * 为给定的查询生成签名。
   * @param query - 要生成签名的查询字符串。
   * @returns 包含生成的签名、盐和当前时间的对象。
   */
  private generateSignature(query: string): { sign: string, salt: string, curtime: string } {
    const salt = generateUUID()
    const curtime = Math.floor(Date.now() / 1000).toString()
    let input = query

    if (query.length > 20) {
      input = query.substring(0, 10) + query.length + query.substring(query.length - 10)
    }

    const signStr = this.appKey + input + salt + curtime + this.appSecret
    const sign = sha256(signStr)

    return { sign, salt, curtime }
  }

  public async reconfigureKeys(): Promise<void> {
    return await vscode.window.showInformationMessage(`要重新配置 <${this.name}> 的密钥吗？`, '配置').then((selection) => {
      if (selection === '配置') {
        this.inputKey()
      }
    })
  }

  /**
   * 获取有道翻译的应用ID和应用密钥。
   */
  public async getKeys(): Promise<string[]> {
    this.appKey = await this.context.secrets.get('Youdao_appKey') || ''
    this.appSecret = await this.context.secrets.get('Youdao_appSecret') || ''
    return Promise.resolve([this.appKey, this.appSecret])
  }

  /**
   * 设置有道翻译的应用ID和应用密钥。
   * @returns 一个Promise，表示设置操作的异步结果。
   */
  public async inputKey(): Promise<void> {
    const appKey = await vscode.window.showInputBox({
      title: this.name,
      prompt: '应用ID',
      ignoreFocusOut: true,
      validateInput: (value) => {
        if (!value) {
          return '应用ID不能为空'
        }
      },
    })

    const appSecret = await vscode.window.showInputBox({
      title: this.name,
      prompt: '应用密钥',
      ignoreFocusOut: true,
      password: true,
      validateInput: (value) => {
        if (!value) {
          return '应用密钥不能为空'
        }
      },
    })

    if (appKey && appSecret) {
      this.context.secrets.store('Youdao_appKey', appKey)
      this.context.secrets.store('Youdao_appSecret', appSecret)
      this.appKey = appKey
      this.appSecret = appSecret
    }
  }

  /**
   * 验证有道翻译所需的密钥。
   *
   * @returns 一个解析为布尔值的 Promise，表示键值是否有效。
   */
  public async validateKeys(): Promise<boolean> {
    const [appid, secret] = await this.getKeys()
    return Boolean(appid && secret)
  }

  /**
   * 使用有道翻译API翻译文本。
   * @param text - 要翻译的文本。
   * @param from - 源语言。
   * @param to - 目标语言。
   * @returns 一个Promise，表示翻译操作的异步结果。
   */
  public async translate(text: string, from: string = 'auto', to: string = 'zh-CN'): Promise<string[]> {
    const { sign, salt, curtime } = this.generateSignature(text)
    const url = `https://openapi.youdao.com/api`
    const params = new URLSearchParams({
      q: text,
      from,
      to,
      appKey: this.appKey,
      salt,
      sign,
      signType: 'v3',
      curtime,
    })

    const result = await vscode.window.withProgress({
      location: vscode.ProgressLocation.Window,
      title: `正在获取<${this.name}>翻译结果…`,
    }, async (_progress, _token) => {
      return axios.post<YoudaoResponse>(url, params).then(async (response) => {
        if (response.status === 200) {
          const errorCode = response.data.errorCode

          if (errorCode === '0') {
            if (response.data.translation.length) {
              return response.data.translation
            }

            vscode.window.showInformationMessage('没有找到翻译结果')
          } else {
            const message = errorMessage[errorCode as ErrorMessageKey]

            if ([108, 110, 111].includes(+errorCode)) {
              this.reconfigureKeys()
            } else {
              vscode.window.showWarningMessage(`<有道翻译>: ${message}`)
            }
          }
        }

        return []
      })
    })

    return result
  }
}
