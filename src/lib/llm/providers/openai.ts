import { ILlmProvider } from '../index'
import { LlmMessage, LlmResponse } from '@/types/llm'

export class OpenAiProvider implements ILlmProvider {
  private apiKey: string
  private model: string

  constructor(apiKey: string, model = 'gpt-4o') {
    this.apiKey = apiKey
    this.model = model
  }

  getModelName(): string {
    return this.model
  }

  getProviderName(): string {
    return 'openai'
  }

  async chat(messages: LlmMessage[]): Promise<LlmResponse> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages,
      }),
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`)
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
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: text,
      }),
    })

    if (!response.ok) {
      throw new Error(`OpenAI Embeddings API error: ${response.statusText}`)
    }

    const data = await response.json()
    return data.data[0]?.embedding || []
  }
}
