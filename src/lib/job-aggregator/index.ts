import { prisma } from '@/lib/prisma'
import { CanonicalJob, normalizeJob } from './canonical'
import { fetchGreenhouseJobs } from './greenhouse'
import { fetchLeverJobs } from './lever'

export interface JobSearchParams {
  keywords?: string[]
  locations?: string[]
  sources?: string[]
  page?: number
  limit?: number
}

export async function searchJobs(params: JobSearchParams): Promise<CanonicalJob[]> {
  const { keywords = [], locations = [], sources = [], page = 1, limit = 20 } = params

  const dbJobs = await prisma.job.findMany({
    where: {
      ...(sources.length > 0 && { source: { in: sources } }),
    },
    orderBy: { fetchedAt: 'desc' },
    take: limit,
    skip: (page - 1) * limit,
  })

  return dbJobs.map(job => normalizeJob({
    source: job.source,
    sourceUrl: job.sourceUrl,
    url: job.jobUrl || undefined,
    title: job.title,
    company: job.company,
    location: job.location || undefined,
    description: job.description,
    salary: job.salary as { min?: number; max?: number; currency?: string } | undefined,
    atsSource: job.atsSource || undefined,
    jobUrl: job.jobUrl || undefined,
  }))
}

export async function aggregateFromSource(source: string, config?: Record<string, string>): Promise<CanonicalJob[]> {
  let jobs: CanonicalJob[] = []

  switch (source) {
    case 'greenhouse':
      if (config?.boardToken) {
        jobs = await fetchGreenhouseJobs(config.boardToken)
      }
      break
    case 'lever':
      if (config?.companyId) {
        jobs = await fetchLeverJobs(config.companyId)
      }
      break
    default:
      console.warn(`Unknown job source: ${source}`)
  }

  for (const job of jobs) {
    await prisma.job.upsert({
      where: { sourceUrl: job.sourceUrl },
      create: {
        source: job.source,
        sourceUrl: job.sourceUrl,
        title: job.title,
        company: job.company,
        location: job.location,
        description: job.description,
        salary: job.salary as object,
        atsSource: job.atsSource,
        jobUrl: job.jobUrl,
      },
      update: {
        title: job.title,
        description: job.description,
        salary: job.salary as object,
      },
    })
  }

  return jobs
}

export async function deduplicateJobs(jobs: CanonicalJob[]): Promise<CanonicalJob[]> {
  const seen = new Set<string>()
  return jobs.filter(job => {
    if (seen.has(job.sourceUrl)) return false
    seen.add(job.sourceUrl)
    return true
  })
}
