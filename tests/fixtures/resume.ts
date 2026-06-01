export function createResume(overrides = {}) {
  return {
    id: `resume_${Math.random().toString(36).slice(2)}`,
    userId: 'user_test',
    fileName: 'test-resume.pdf',
    fileType: 'application/pdf',
    fileSize: 1024,
    parseStatus: 'PENDING',
    rawText: null,
    parsedData: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}
