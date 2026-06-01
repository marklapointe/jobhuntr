import { LlmProviderConfig, LlmMessage, LlmResponse } from '@/types/llm'
import { OpenAiProvider } from './providers/openai'
import { AnthropicProvider } from './providers/anthropic'
import { OllamaProvider } from './providers/ollama'
import { CustomGatewayProvider } from './providers/custom-gateway'

export interface ILlmProvider {
  chat(messages: LlmMessage[]): Promise<LlmResponse>
  embed(text: string): Promise<number[]>
  getModelName(): string
  getProviderName(): string
}

export function createLlmProvider(config: LlmProviderConfig): ILlmProvider {
  const { provider } = config
  switch (provider) {
    case 'openai':
      return new OpenAiProvider(config.apiKey!, config.model!)
    case 'anthropic':
      return new AnthropicProvider(config.apiKey!, config.model!)
    case 'ollama':
      return new OllamaProvider(config.baseUrl!, config.model!)
    case 'custom-gateway':
      return new CustomGatewayProvider(config.baseUrl!, config.apiKey!, config.model!)
    default:
      throw new Error(`Unknown LLM provider: ${provider as string}`)
  }
}

export { OpenAiProvider } from './providers/openai'
export { AnthropicProvider } from './providers/anthropic'
export { OllamaProvider } from './providers/ollama'
export { CustomGatewayProvider } from './providers/custom-gateway'
