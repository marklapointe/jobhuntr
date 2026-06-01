import { ILlmProvider } from '../index'
import { LlmMessage, LlmResponse } from '@/types/llm'

export class CustomGatewayProvider implements ILlmProvider {
  private baseUrl: string
  private apiKey?: string
  private model: string

  constructor(baseUrl: string, apiKey?: string, model = 'gpt-4o') {
    this.baseUrl = baseUrl.replace(/\/$/, '')
    this.apiKey = apiKey
    this.model = model
  }

  getModelName(): string {
    return this.model
  }

  getProviderName(): string {
    return 'custom-gateway'
  }

  async chat(messages: LlmMessage[]): Promise<LlmResponse> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`
    }

    const response = await fetch(`${this.baseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: this.model,
        messages,
      }),
    })

    if (!response.ok) {
      throw new Error(`Custom Gateway API error: ${response.statusText}`)
    }

    const data = await response.json()
    return {
      content: data.choices[0]?.message?.content || '',
      finishReason: data.choices[0]?.finish_reason || 'stop',
      usage: data.usage ? {
        promptTokens: data.usage.prompt_tokens,
        completionTokens: data.usage.completion_tokens,
        totalTokens: data.usage.total_tokens,
      } : undefined,
    }
  }

  async embed(text: string): Promise<number[]> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`
    }

    const response = await fetch(`${this.baseUrl}/v1/embeddings`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: this.model,
        input: text,
      }),
    })

    if (!response.ok) {
      throw new Error(`Custom Gateway Embeddings API error: ${response.statusText}`)
    }

    const data = await response.json()
    return data.data[0]?.embedding || []
  }
}
