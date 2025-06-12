import * as vscode from 'vscode'
import { TranslatorEnum } from '../types'
import type { ConfigManager } from '../core/ConfigManager'
import type { ErrorHandler } from '../core/ErrorHandler'
import { MESSAGES } from '../messages'

/**
 * 翻译器配置助手类
 * 负责管理翻译器的密钥配置和验证
 */
export class TranslatorConfigHelper {
  constructor(
    private configManager: ConfigManager,
    private errorHandler: ErrorHandler,
  ) {}

  /**
   * 验证翻译器密钥配置
   */
  async validateTranslatorKeys(engine: TranslatorEnum): Promise<boolean> {
    switch (engine) {
      case TranslatorEnum.Youdao:
        return this.validateYoudaoKeys()
      case TranslatorEnum.OpenAI:
        return this.validateOpenAIKeys()
      case TranslatorEnum.Ollama:
        return this.validateOllamaKeys()
      default:
        return false
    }
  }

  /**
   * 配置翻译器密钥
   */
  async configureTranslatorKeys(engine: TranslatorEnum): Promise<boolean> {
    switch (engine) {
      case TranslatorEnum.Youdao:
        return this.configureYoudaoKeys()
      case TranslatorEnum.OpenAI:
        return this.configureOpenAIKeys()
      case TranslatorEnum.Ollama:
        return this.configureOllamaKeys()
      default:
        return false
    }
  }

  /**
   * 验证有道翻译密钥
   */
  private validateYoudaoKeys(): boolean {
    const config = this.configManager.getYoudaoConfig()
    return !!(config.appKey && config.appSecret)
  }

  /**
   * 验证OpenAI密钥
   */
  private validateOpenAIKeys(): boolean {
    const config = this.configManager.getOpenAIConfig()
    return !!config.apiKey
  }

  /**
   * 验证Ollama配置
   */
  private validateOllamaKeys(): boolean {
    const config = vscode.workspace.getConfiguration('CN2Var')
    const baseUrl = config.get('translator.ollama.baseUrl')
    const model = config.get('translator.ollama.model')
    return !!(baseUrl && model)
  }

  /**
   * 配置有道翻译密钥
   */
  private async configureYoudaoKeys(): Promise<boolean> {
    try {
      const appKey = await vscode.window.showInputBox({
        title: MESSAGES.CONFIG_APP_KEY_TITLE,
        placeHolder: MESSAGES.CONFIG_APP_KEY_PLACEHOLDER,
        prompt: '请输入有道翻译应用ID',
        ignoreFocusOut: true,
        password: true,
      })

      if (!appKey) {
        return false
      }

      const appSecret = await vscode.window.showInputBox({
        title: MESSAGES.CONFIG_APP_SECRET_TITLE,
        placeHolder: MESSAGES.CONFIG_APP_SECRET_PLACEHOLDER,
        prompt: '请输入有道翻译应用密钥',
        ignoreFocusOut: true,
        password: true,
      })

      if (!appSecret) {
        return false
      }

      await this.configManager.storeYoudaoConfig(appKey, appSecret)
      this.errorHandler.showInfo('有道翻译配置已保存')
      return true
    } catch (error) {
      this.errorHandler.handleError(error, '有道翻译配置')
      return false
    }
  }

  /**
   * 配置OpenAI密钥
   */
  private async configureOpenAIKeys(): Promise<boolean> {
    try {
      const apiKey = await vscode.window.showInputBox({
        title: MESSAGES.CONFIG_API_KEY_TITLE,
        placeHolder: MESSAGES.CONFIG_API_KEY_PLACEHOLDER,
        prompt: '请输入OpenAI API密钥',
        ignoreFocusOut: true,
        password: true,
      })

      if (!apiKey) {
        return false
      }

      const baseUrl = await vscode.window.showInputBox({
        title: 'OpenAI API基础URL',
        placeHolder: 'https://api.openai.com（可选，留空使用默认）',
        prompt: '请输入OpenAI API基础URL（可选）',
        ignoreFocusOut: true,
      })

      await this.configManager.storeOpenAIConfig(apiKey, baseUrl)
      this.errorHandler.showInfo('OpenAI配置已保存')
      return true
    } catch (error) {
      this.errorHandler.handleError(error, 'OpenAI配置')
      return false
    }
  }

  /**
   * 配置Ollama设置
   */
  private async configureOllamaKeys(): Promise<boolean> {
    try {
      const baseUrl = await vscode.window.showInputBox({
        title: 'Ollama配置',
        placeHolder: 'http://localhost:11434',
        prompt: '请输入Ollama服务地址',
        ignoreFocusOut: true,
      })

      if (!baseUrl) {
        return false
      }

      const model = await vscode.window.showInputBox({
        title: 'Ollama模型',
        placeHolder: 'qwen2.5:7b',
        prompt: '请输入Ollama模型名称',
        ignoreFocusOut: true,
      })

      if (!model) {
        return false
      }

      const config = vscode.workspace.getConfiguration('CN2Var')
      await config.update('translator.ollama.baseUrl', baseUrl, vscode.ConfigurationTarget.Global)
      await config.update('translator.ollama.model', model, vscode.ConfigurationTarget.Global)

      this.errorHandler.showInfo('Ollama配置已保存')
      return true
    } catch (error) {
      this.errorHandler.handleError(error, 'Ollama配置')
      return false
    }
  }

  /**
   * 获取翻译器显示名称
   */
  getTranslatorDisplayName(engine: TranslatorEnum): string {
    const names = {
      [TranslatorEnum.Youdao]: '有道翻译',
      [TranslatorEnum.OpenAI]: 'OpenAI',
      [TranslatorEnum.Ollama]: 'Ollama',
    }
    return names[engine] || engine
  }

  /**
   * 获取翻译器配置说明
   */
  getTranslatorDescription(engine: TranslatorEnum): string {
    const descriptions = {
      [TranslatorEnum.Youdao]: '需要配置有道翻译应用ID和密钥',
      [TranslatorEnum.OpenAI]: '需要配置OpenAI API密钥',
      [TranslatorEnum.Ollama]: '需要配置Ollama服务地址和模型',
    }
    return descriptions[engine] || ''
  }
}
