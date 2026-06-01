import { ILlmProvider } from '../index'
import { LlmMessage, LlmResponse } from '@/types/llm'

export class OllamaProvider implements ILlmProvider {
  private baseUrl: string
  private model: string

  constructor(baseUrl = 'http://localhost:11434', model = 'llama3.2') {
    this.baseUrl = baseUrl
    this.model = model
  }

  getModelName(): string {
    return this.model
  }

  getProviderName(): string {
    return 'ollama'
  }

  async chat(messages: LlmMessage[]): Promise<LlmResponse> {
    const response = await fetch(`${this.baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.model,
        messages,
        stream: false,
      }),
    })

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.statusText}`)
    }

    const data = await response.json()
    return {
      content: data.message?.content || '',
      finishReason: data.done ? 'stop' : 'length',
      usage: data.usage ? {
        promptTokens: data.usage.prompt_eval_count || 0,
        completionTokens: data.usage.eval_count || 0,
        totalTokens: (data.usage.prompt_eval_count || 0) + (data.usage.eval_count || 0),
      } : undefined,
    }
  }

  async embed(text: string): Promise<number[]> {
    const response = await fetch(`${this.baseUrl}/api/embeddings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.model,
        prompt: text,
      }),
    })

    if (!response.ok) {
      throw new Error(`Ollama Embeddings API error: ${response.statusText}`)
    }

    const data = await response.json()
    return data.embedding || []
  }
}
