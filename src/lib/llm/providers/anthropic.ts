import { ILlmProvider } from '../index'
import { LlmMessage, LlmResponse } from '@/types/llm'

export class AnthropicProvider implements ILlmProvider {
  private apiKey: string
  private model: string

  constructor(apiKey: string, model = 'claude-3-5-sonnet-20241022') {
    this.apiKey = apiKey
    this.model = model
  }

  getModelName(): string {
    return this.model
  }

  getProviderName(): string {
    return 'anthropic'
  }

  async chat(messages: LlmMessage[]): Promise<LlmResponse> {
    const systemMessage = messages.find(m => m.role === 'system')
    const filteredMessages = messages.filter(m => m.role !== 'system')
    
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: 4096,
        system: systemMessage?.content,
        messages: filteredMessages.map(m => ({
          role: m.role,
          content: m.content,
        })),
      }),
    })

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.statusText}`)
    }

    const data = await response.json()
    return {
      content: data.content[0]?.text || '',
      finishReason: data.stop_reason || 'end_turn',
      usage: {
        promptTokens: data.usage?.input_tokens || 0,
        completionTokens: data.usage?.output_tokens || 0,
        totalTokens: (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0),
      },
    }
  }

  async embed(text: string): Promise<number[]> {
    throw new Error('Embeddings not supported by Anthropic. Use OpenAI or Ollama for embeddings.')
  }
}
