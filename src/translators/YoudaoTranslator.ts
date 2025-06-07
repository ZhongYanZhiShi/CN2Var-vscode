import * as vscode from 'vscode'
import axios from 'axios'
import { BaseTranslator } from '../core/BaseTranslator'
import { generateUUID, sha256 } from '../utils/common'
import { errorMessage } from '../messages/youdao'
import type { YoudaoResponse, YoudaoResponseSuccess } from '../types/youdao'

/**
 * 有道翻译器实现
 */
export class YoudaoTranslator extends BaseTranslator {
  private appKey: string = ''
  private appSecret: string = ''

  get name(): string {
    return '有道翻译'
  }

  constructor(context: vscode.ExtensionContext) {
    super(context)
    this.initializeKeys()
  }

  /**
   * 初始化密钥
   */
  private async initializeKeys(): Promise<void> {
    await this.getKeys()
  }

  /**
   * 获取密钥
   */
  private async getKeys(): Promise<[string, string]> {
    this.appKey = await this.context.secrets.get('Youdao_appKey') || ''
    this.appSecret = await this.context.secrets.get('Youdao_appSecret') || ''
    return [this.appKey, this.appSecret]
  }

  /**
   * 验证密钥
   */
  async validateKeys(): Promise<boolean> {
    const [appKey, appSecret] = await this.getKeys()
    return Boolean(appKey && appSecret)
  }

  /**
   * 输入密钥
   */
  async inputKey(): Promise<void> {
    const appKey = await this.showInputBox({
      title: '配置',
      prompt: '请输入应用ID',
      placeholder: '有道翻译应用ID',
      validateInput: (value) => {
        if (!value) {
          return '应用ID不能为空'
        }
        return undefined
      },
    })

    if (!appKey) {
      throw new Error('缺少应用ID')
    }

    const appSecret = await this.showInputBox({
      title: '配置',
      prompt: '请输入应用密钥',
      placeholder: '有道翻译应用密钥',
      password: true,
      validateInput: (value) => {
        if (!value) {
          return '应用密钥不能为空'
        }
        return undefined
      },
    })

    if (!appSecret) {
      throw new Error('缺少应用密钥')
    }

    // 保存密钥
    await this.context.secrets.store('Youdao_appKey', appKey)
    await this.context.secrets.store('Youdao_appSecret', appSecret)
    this.appKey = appKey
    this.appSecret = appSecret

    vscode.window.showInformationMessage('有道翻译密钥配置成功')
  }

  /**
   * 翻译文本
   */
  async translate(text: string, from: string = 'auto', to: string = 'en'): Promise<string[]> {
    if (!await this.validateKeys()) {
      throw new Error('请先配置有道翻译密钥')
    }

    return this.withProgress('翻译中...', async () => {
      const { sign, salt, curtime } = this.generateSignature(text)
      const url = 'https://openapi.youdao.com/api'

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

      try {
        const response = await axios.post<YoudaoResponse>(url, params, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          timeout: 10000,
        })

        return this.handleResponse(response.data)
      } catch (error: any) {
        if (error.response?.data?.errorCode) {
          return this.handleResponse(error.response.data)
        }
        throw error
      }
    })
  }

  /**
   * 处理API响应
   */
  private handleResponse(data: YoudaoResponse): string[] {
    const errorCode = data.errorCode

    if (errorCode === '0') {
      const successData = data as YoudaoResponseSuccess
      return successData.translation?.length ? successData.translation : []
    }

    // 处理错误
    const message = errorMessage[String(errorCode)] || `未知错误 (${errorCode})`

    // 密钥相关错误需要重新配置
    if ([108, 110, 111].includes(Number(errorCode))) {
      vscode.window.showWarningMessage(`${this.name}: ${message}，请重新配置密钥`)
      this.reconfigureKeys()
    } else {
      vscode.window.showWarningMessage(`${this.name}: ${message}`)
    }

    return []
  }

  /**
   * 生成签名
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
}
