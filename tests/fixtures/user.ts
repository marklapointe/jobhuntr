export function createUser(overrides = {}) {
  return {
    id: `user_${Math.random().toString(36).slice(2)}`,
    email: 'test@example.com',
    name: 'Test User',
    passwordHash: '$2a$10$testhash',
    role: 'USER',
    llmProvider: 'openai',
    llmApiKey: 'test-api-key',
    emailVerified: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}
