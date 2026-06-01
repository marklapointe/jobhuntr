export function createJob(overrides = {}) {
  return {
    id: `job_${Math.random().toString(36).slice(2)}`,
    source: 'linkedin',
    sourceUrl: `https://example.com/job/${Math.random().toString(36).slice(2)}`,
    title: 'Software Engineer',
    company: 'Test Company',
    location: 'Remote',
    description: 'Job description text',
    salary: null,
    atsSource: null,
    jobUrl: null,
    fetchedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}
