import * as vscode from 'vscode'
import { ERROR_MESSAGES } from '../messages'
import type { ErrorCode } from '../messages'

/**
 * 错误处理器类
 * 统一处理插件中的各种错误
 */
export class ErrorHandler {
  /**
   * 通用错误处理方法
   */
  handleError(error: any, source?: string): void {
    console.error('[CN2Var Error]', error)

    if (error.code && ERROR_MESSAGES[error.code as ErrorCode]) {
      this.showError(ERROR_MESSAGES[error.code as ErrorCode], source)
    } else if (error.message) {
      this.showError(error.message, source)
    } else {
      this.showError('发生未知错误', source)
    }
  }

  /**
   * 显示错误信息
   */
  showError(message: string, source?: string): void {
    const fullMessage = source ? `[${source}] ${message}` : message
    vscode.window.showErrorMessage(fullMessage)
  }

  /**
   * 显示警告信息
   */
  showWarning(message: string, source?: string): void {
    const fullMessage = source ? `[${source}] ${message}` : message
    vscode.window.showWarningMessage(fullMessage)
  }

  /**
   * 显示信息提示
   */
  showInfo(message: string, source?: string): void {
    const fullMessage = source ? `[${source}] ${message}` : message
    vscode.window.showInformationMessage(fullMessage)
  }

  /**
   * 处理翻译器错误
   */
  handleTranslatorError(error: any, translatorName: string): void {
    console.error(`[${translatorName}] 翻译失败:`, error)

    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      this.showError('网络连接失败，请检查网络设置', translatorName)
    } else if (error.response?.status === 401) {
      this.showError('API密钥无效，请重新配置', translatorName)
    } else if (error.response?.status === 403) {
      this.showError('API访问被拒绝，请检查密钥权限', translatorName)
    } else if (error.response?.status === 429) {
      this.showError('API调用频率超限，请稍后重试', translatorName)
    } else {
      this.showError(error.message || '翻译服务出现未知错误', translatorName)
    }
  }

  /**
   * 处理配置错误
   */
  handleConfigError(error: any): void {
    console.error('配置错误:', error)
    this.showError('配置文件读取失败，请检查配置')
  }

  /**
   * 创建错误
   */
  createError(message: string, code?: string): Error {
    const error = new Error(message)
    if (code) {
      ;(error as any).code = code
    }
    return error
  }
}
