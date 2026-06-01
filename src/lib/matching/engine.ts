import { prisma } from '@/lib/prisma'
import { searchJobs, JobSearchParams } from '@/lib/job-aggregator'
import { CanonicalJob } from '@/lib/job-aggregator/canonical'
import { calculateMatchScore, MatchScore } from './scorer'
import { CanonicalProfileData } from '@/lib/profile/unification-service'

export interface MatchResult {
  job: CanonicalJob
  score: MatchScore
}

export async function findMatchingJobs(
  userId: string,
  params?: JobSearchParams,
  limit = 20
): Promise<MatchResult[]> {
  const profile = await prisma.canonicalProfile.findUnique({
    where: { userId },
  })

  if (!profile) {
    throw new Error('User profile not found. Please upload and parse a resume first.')
  }

  const profileData: CanonicalProfileData = {
    contactInfo: profile.contactInfo as unknown as CanonicalProfileData['contactInfo'],
    experience: profile.experience as unknown as CanonicalProfileData['experience'],
    education: profile.education as unknown as CanonicalProfileData['education'],
    skills: profile.skills as unknown as string[],
    completeness: 0,
  }

  const jobs = await searchJobs({ ...params, limit })

  const matchResults: MatchResult[] = jobs.map(job => ({
    job,
    score: calculateMatchScore(job, profileData),
  }))

  matchResults.sort((a, b) => b.score.overallScore - a.score.overallScore)

  return matchResults.slice(0, limit)
}

export async function getJobMatchDetails(
  userId: string,
  jobId: string
): Promise<MatchResult | null> {
  const job = await prisma.job.findUnique({ where: { id: jobId } })
  if (!job) return null

  const profile = await prisma.canonicalProfile.findUnique({
    where: { userId },
  })

  if (!profile) return null

  const profileData: CanonicalProfileData = {
    contactInfo: profile.contactInfo as unknown as CanonicalProfileData['contactInfo'],
    experience: profile.experience as unknown as CanonicalProfileData['experience'],
    education: profile.education as unknown as CanonicalProfileData['education'],
    skills: profile.skills as unknown as string[],
    completeness: 0,
  }

  const canonicalJob: CanonicalJob = {
    id: job.id,
    source: job.source,
    sourceUrl: job.sourceUrl,
    title: job.title,
    company: job.company,
    location: job.location,
    description: job.description,
    salary: job.salary as unknown as CanonicalJob['salary'],
    atsSource: job.atsSource,
    jobUrl: job.jobUrl,
    fetchedAt: job.fetchedAt,
  }

  return {
    job: canonicalJob,
    score: calculateMatchScore(canonicalJob, profileData),
  }
}
