import { describe, it, expect, vi, beforeEach } from 'vitest'
import { OpenAiProvider } from './openai'
import { LlmMessage } from '@/types/llm'

const mockFetch = vi.fn()
global.fetch = mockFetch

describe('OpenAiProvider', () => {
  let provider: OpenAiProvider
  const mockApiKey = 'test-api-key'

  beforeEach(() => {
    mockFetch.mockClear()
    provider = new OpenAiProvider(mockApiKey, 'gpt-4o')
  })

  it('should create provider with correct model name', () => {
    expect(provider.getModelName()).toBe('gpt-4o')
  })

  it('should return openai as provider name', () => {
    expect(provider.getProviderName()).toBe('openai')
  })

  it('should make chat completion request with correct structure', async () => {
    const mockResponse = {
      choices: [{
        message: { content: 'Test response' },
        finish_reason: 'stop',
      }],
      usage: {
        prompt_tokens: 10,
        completion_tokens: 20,
        total_tokens: 30,
      },
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    } as Response)

    const messages: LlmMessage[] = [
      { role: 'user', content: 'Hello' },
    ]

    const result = await provider.chat(messages)

    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.openai.com/v1/chat/completions',
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${mockApiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages,
        }),
      })
    )

    expect(result.content).toBe('Test response')
    expect(result.finishReason).toBe('stop')
    expect(result.usage).toEqual({
      promptTokens: 10,
      completionTokens: 20,
      totalTokens: 30,
    })
  })

  it('should throw error on API failure', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      statusText: 'Unauthorized',
    } as Response)

    await expect(provider.chat([])).rejects.toThrow('OpenAI API error: Unauthorized')
  })

  it('should handle empty response content', async () => {
    const mockResponse = {
      choices: [{
        message: { content: '' },
        finish_reason: 'stop',
      }],
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    } as Response)

    const result = await provider.chat([])
    expect(result.content).toBe('')
  })

  it('should handle missing usage in response', async () => {
    const mockResponse = {
      choices: [{
        message: { content: 'Test' },
        finish_reason: 'stop',
      }],
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    } as Response)

    const result = await provider.chat([])
    expect(result.usage).toBeUndefined()
  })

  it('should make embedding request with correct structure', async () => {
    const mockEmbedding = [0.1, 0.2, 0.3]
    const mockResponse = {
      data: [{
        embedding: mockEmbedding,
      }],
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    } as Response)

    const result = await provider.embed('Test text')

    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.openai.com/v1/embeddings',
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${mockApiKey}`,
        },
        body: JSON.stringify({
          model: 'text-embedding-3-small',
          input: 'Test text',
        }),
      })
    )

    expect(result).toEqual(mockEmbedding)
  })

  it('should throw error on embedding API failure', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      statusText: 'Bad Request',
    } as Response)

    await expect(provider.embed('test')).rejects.toThrow('OpenAI Embeddings API error: Bad Request')
  })

  it('should use default model if not specified', () => {
    const defaultProvider = new OpenAiProvider(mockApiKey)
    expect(defaultProvider.getModelName()).toBe('gpt-4o')
  })
})
