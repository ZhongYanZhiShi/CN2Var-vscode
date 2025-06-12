import * as vscode from 'vscode'
import axios from 'axios'
import { BaseTranslator } from '../core/BaseTranslator'
import type {
  OllamaChatRequest,
  OllamaChatResponse,
  OllamaError,
  OllamaModelsResponse,
} from '../types/ollama'

/**
 * Ollama 翻译器实现
 */
export class OllamaTranslator extends BaseTranslator {
  private baseUrl: string = 'http://localhost:11434'
  private model: string = 'qwen2.5:7b'

  get name(): string {
    return 'Ollama'
  }

  constructor(context: vscode.ExtensionContext) {
    super(context)
    this.initializeSettings()
  }

  /**
   * 初始化设置
   */
  private async initializeSettings(): Promise<void> {
    const config = vscode.workspace.getConfiguration('CN2Var')
    this.baseUrl = config.get('translator.ollama.baseUrl') || 'http://localhost:11434'
    this.model = config.get('translator.ollama.model') || 'qwen2.5:7b'
  }

  /**
   * 验证 Ollama 服务是否可用
   */
  async validateKeys(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.baseUrl}/api/tags`, {
        timeout: 5000,
      })
      const modelsData = response.data as OllamaModelsResponse
      return modelsData.models && modelsData.models.length > 0
    } catch {
      return false
    }
  }

  /**
   * 配置 Ollama 设置
   */
  async inputKey(): Promise<void> {
    // 配置 Ollama 服务地址
    const baseUrl = await this.showInputBox({
      title: 'Ollama 配置',
      prompt: '请输入 Ollama 服务地址',
      placeholder: 'http://localhost:11434',
      validateInput: (value) => {
        if (!value) {
          return 'Ollama 服务地址不能为空'
        }
        if (!/^https?:\/\/.+/.test(value)) {
          return '请输入有效的 URL 地址'
        }
        return undefined
      },
    })

    if (!baseUrl) {
      throw new Error('缺少 Ollama 服务地址')
    }

    // 获取可用模型列表
    let availableModels: string[] = []
    try {
      const response = await axios.get(`${baseUrl}/api/tags`, {
        timeout: 10000,
      })
      const modelsData = response.data as OllamaModelsResponse
      availableModels = modelsData.models.map(model => model.name)
    } catch {
      vscode.window.showWarningMessage('无法获取 Ollama 模型列表，请确保 Ollama 服务正在运行')
      availableModels = ['qwen2.5:7b', 'llama3.2:3b', 'gemma2:2b']
    }

    // 选择模型
    const selectedModel = await vscode.window.showQuickPick(availableModels, {
      title: '选择 Ollama 模型',
      placeHolder: '请选择要使用的模型',
      ignoreFocusOut: true,
    })

    if (!selectedModel) {
      throw new Error('缺少 Ollama 模型选择')
    }

    // 更新配置
    const config = vscode.workspace.getConfiguration('CN2Var')
    await config.update('translator.ollama.baseUrl', baseUrl, vscode.ConfigurationTarget.Global)
    await config.update('translator.ollama.model', selectedModel, vscode.ConfigurationTarget.Global)

    this.baseUrl = baseUrl
    this.model = selectedModel

    vscode.window.showInformationMessage('Ollama 配置成功')
  }

  /**
   * 翻译文本
   */
  async translate(text: string, _from: string = 'zh', _to: string = 'en'): Promise<string[]> {
    if (!await this.validateKeys()) {
      throw new Error('Ollama 服务不可用，请检查服务是否启动或重新配置')
    }

    return this.withProgress('翻译中...', async () => {
      const systemPrompt = `你是一个专业的翻译助手，专门将中文翻译成英文变量名。请遵循以下规则：
1. 只返回翻译结果，不要包含任何解释
2. 如果输入是短语或句子，请提供2-3个不同的翻译选项
3. 翻译应该适合作为编程变量名使用
4. 保持简洁和准确
5. 每个翻译选项用换行符分隔`

      const userPrompt = `请将以下中文翻译成英文变量名：${text}`

      const request: OllamaChatRequest = {
        model: this.model,
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: userPrompt,
          },
        ],
        stream: false,
        options: {
          temperature: 0.3,
          top_p: 0.9,
        },
      }

      try {
        const response = await axios.post<OllamaChatResponse>(
          `${this.baseUrl}/api/chat`,
          request,
          {
            headers: {
              'Content-Type': 'application/json',
            },
            timeout: 30000,
          },
        )

        const translatedText = response.data.message.content.trim()
        const translations = translatedText
          .split('\n')
          .map(line => line.trim())
          .filter(line => line && !line.startsWith('//') && !line.startsWith('#'))

        return translations.length > 0 ? translations : [translatedText]
      } catch (error: any) {
        if (error.response?.data?.error) {
          const ollamaError = error.response.data as OllamaError
          throw new Error(`Ollama 错误: ${ollamaError.error}`)
        }

        if (error.code === 'ECONNREFUSED') {
          throw new Error('无法连接到 Ollama 服务，请确保服务正在运行')
        }

        throw new Error(`翻译失败: ${error.message}`)
      }
    })
  }

  /**
   * 获取可用模型列表
   */
  async getAvailableModels(): Promise<string[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/api/tags`, {
        timeout: 10000,
      })
      const modelsData = response.data as OllamaModelsResponse
      return modelsData.models.map(model => model.name)
    } catch {
      return []
    }
  }
}
