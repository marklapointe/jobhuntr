export interface CanonicalJob {
  id: string
  source: string
  sourceUrl: string
  title: string
  company: string
  location: string | null
  description: string
  salary: { min?: number; max?: number; currency?: string } | null
  atsSource: string | null
  jobUrl: string | null
  fetchedAt: Date
}

export function normalizeJob(raw: RawJobData): CanonicalJob {
  return {
    id: generateJobId(raw.source, raw.sourceUrl),
    source: raw.source,
    sourceUrl: raw.sourceUrl,
    title: raw.title?.trim() || '',
    company: raw.company?.trim() || '',
    location: raw.location?.trim() || null,
    description: raw.description?.trim() || '',
    salary: normalizeSalary(raw.salary),
    atsSource: raw.atsSource || null,
    jobUrl: raw.jobUrl || raw.url || null,
    fetchedAt: new Date(),
  }
}

function generateJobId(source: string, url: string): string {
  const input = `${source}:${url}`
  let hash = 0
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash).toString(36)
}

function normalizeSalary(salary?: SalaryData): CanonicalJob['salary'] {
  if (!salary) return null

  return {
    min: typeof salary.min === 'number' ? salary.min : parseFloat(salary.min as string) || undefined,
    max: typeof salary.max === 'number' ? salary.max : parseFloat(salary.max as string) || undefined,
    currency: salary.currency || 'USD',
  }
}

export interface RawJobData {
  source: string
  sourceUrl: string
  url?: string
  title?: string
  company?: string
  location?: string
  description?: string
  salary?: SalaryData
  atsSource?: string
  jobUrl?: string
}

interface SalaryData {
  min?: number | string
  max?: number | string
  currency?: string
}

export { normalizeJob as default }
