export interface LlmMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface LlmResponse {
  content: string
  finishReason: string
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
}

export interface LlmProviderType {
  chat(messages: LlmMessage[]): Promise<LlmResponse>
  embed(text: string): Promise<number[]>
  getModelName(): string
  getProviderName(): string
}

export type LlmProviderConfig = 
  | { provider: 'openai'; apiKey: string; model?: string }
  | { provider: 'anthropic'; apiKey: string; model?: string }
  | { provider: 'ollama'; baseUrl?: string; model?: string }
  | { provider: 'custom-gateway'; baseUrl: string; apiKey?: string; model?: string }
