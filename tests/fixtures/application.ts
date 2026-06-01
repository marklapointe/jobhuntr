export function createApplication(overrides = {}) {
  return {
    id: `app_${Math.random().toString(36).slice(2)}`,
    userId: 'user_test',
    jobId: 'job_test',
    resumeId: null,
    status: 'SAVED',
    agentType: null,
    appliedAt: null,
    lastStatusUpdate: new Date(),
    notes: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}
