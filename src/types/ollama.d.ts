/**
 * Ollama API 相关类型定义
 */

/** Ollama 聊天消息 */
export interface OllamaMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

/** Ollama 聊天请求 */
export interface OllamaChatRequest {
  model: string
  messages: OllamaMessage[]
  stream?: boolean
  options?: {
    temperature?: number
    top_p?: number
    top_k?: number
  }
}

/** Ollama 聊天响应 */
export interface OllamaChatResponse {
  model: string
  created_at: string
  message: OllamaMessage
  done: boolean
  total_duration?: number
  load_duration?: number
  prompt_eval_count?: number
  prompt_eval_duration?: number
  eval_count?: number
  eval_duration?: number
}

/** Ollama 模型信息 */
export interface OllamaModel {
  name: string
  modified_at: string
  size: number
  digest: string
  details: {
    format: string
    family: string
    families: string[]
    parameter_size: string
    quantization_level: string
  }
}

/** Ollama 模型列表响应 */
export interface OllamaModelsResponse {
  models: OllamaModel[]
}

/** Ollama 错误响应 */
export interface OllamaError {
  error: string
}
