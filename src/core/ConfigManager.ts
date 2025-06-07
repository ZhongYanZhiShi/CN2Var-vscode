import * as vscode from 'vscode'
import type { CN2VarConfig, FormatEnum, TranslatorEnum } from '../types'
import { CONFIG_KEYS, DEFAULT_CONFIG, STORAGE_KEYS } from '../config/settings'

/**
 * 配置管理器类
 * 负责管理插件的所有配置项和密钥存储
 */
export class ConfigManager {
  private context: vscode.ExtensionContext

  constructor(context?: vscode.ExtensionContext) {
    this.context = context!
  }

  /**
   * 获取完整配置
   */
  getConfig(): CN2VarConfig {
    const config = vscode.workspace.getConfiguration(CONFIG_KEYS.SECTION)

    return {
      enable: config.get<boolean>('enable', DEFAULT_CONFIG.ENABLE),
      selectFormat: config.get<boolean>('selectFormat', DEFAULT_CONFIG.SELECT_FORMAT),
      format: config.get<FormatEnum>('format', DEFAULT_CONFIG.DEFAULT_FORMAT),
      translator: {
        engine: config.get<TranslatorEnum>('translator.engine', DEFAULT_CONFIG.DEFAULT_TRANSLATOR),
        model: {
          openai: config.get<string>('translator.model.openai', DEFAULT_CONFIG.DEFAULT_OPENAI_MODEL),
        },
      },
    }
  }

  /**
   * 获取是否启用插件
   */
  isEnabled(): boolean {
    return this.getConfig().enable
  }

  /**
   * 获取选择格式配置
   */
  shouldSelectFormat(): boolean {
    return this.getConfig().selectFormat
  }

  /**
   * 获取默认格式
   */
  getDefaultFormat(): FormatEnum {
    return this.getConfig().format
  }

  /**
   * 获取翻译器引擎
   */
  getTranslatorEngine(): TranslatorEnum {
    return this.getConfig().translator.engine
  }

  /**
   * 获取OpenAI模型
   */
  getOpenAIModel(): string {
    return this.getConfig().translator.model?.openai || DEFAULT_CONFIG.DEFAULT_OPENAI_MODEL
  }

  /**
   * 存储敏感信息到globalState
   */
  async storeSecretValue(key: string, value: string): Promise<void> {
    await this.context.globalState.update(key, value)
  }

  /**
   * 从globalState获取敏感信息
   */
  getSecretValue(key: string): string | undefined {
    return this.context.globalState.get<string>(key)
  }

  /**
   * 获取有道翻译配置
   */
  getYoudaoConfig(): { appKey?: string, appSecret?: string } {
    return {
      appKey: this.getSecretValue(STORAGE_KEYS.YOUDAO_APP_KEY),
      appSecret: this.getSecretValue(STORAGE_KEYS.YOUDAO_APP_SECRET),
    }
  }

  /**
   * 存储有道翻译配置
   */
  async storeYoudaoConfig(appKey: string, appSecret: string): Promise<void> {
    await this.storeSecretValue(STORAGE_KEYS.YOUDAO_APP_KEY, appKey)
    await this.storeSecretValue(STORAGE_KEYS.YOUDAO_APP_SECRET, appSecret)
  }

  /**
   * 获取OpenAI配置
   */
  getOpenAIConfig(): { apiKey?: string, baseUrl?: string } {
    return {
      apiKey: this.getSecretValue(STORAGE_KEYS.OPENAI_API_KEY),
      baseUrl: this.getSecretValue(STORAGE_KEYS.OPENAI_BASE_URL),
    }
  }

  /**
   * 存储OpenAI配置
   */
  async storeOpenAIConfig(apiKey: string, baseUrl?: string): Promise<void> {
    await this.storeSecretValue(STORAGE_KEYS.OPENAI_API_KEY, apiKey)
    if (baseUrl) {
      await this.storeSecretValue(STORAGE_KEYS.OPENAI_BASE_URL, baseUrl)
    }
  }

  /**
   * 监听配置变化
   */
  onConfigurationChange(callback: (e: vscode.ConfigurationChangeEvent) => void): vscode.Disposable {
    return vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration(CONFIG_KEYS.SECTION)) {
        callback(e)
      }
    })
  }
}
