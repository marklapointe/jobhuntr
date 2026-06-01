import { CanonicalJob } from '@/lib/job-aggregator/canonical'
import { CanonicalProfileData } from '@/lib/profile/unification-service'

export interface MatchScore {
  jobId: string
  overallScore: number
  skillMatch: number
  experienceMatch: number
  educationMatch: number
  locationMatch: number
  matchReasons: string[]
  skillGaps: string[]
}

export function calculateMatchScore(
  job: CanonicalJob,
  profile: CanonicalProfileData
): MatchScore {
  const reasons: string[] = []
  const gaps: string[] = []

  let skillMatch = 0
  let experienceMatch = 0
  let educationMatch = 0
  let locationMatch = 100

  const jobSkills = extractJobSkills(job.description)
  const profileSkills = profile.skills.map(s => s.toLowerCase())

  if (jobSkills.length > 0) {
    const matchedSkills = jobSkills.filter(s =>
      profileSkills.some(ps => ps.includes(s.toLowerCase()) || s.toLowerCase().includes(ps))
    )
    skillMatch = (matchedSkills.length / jobSkills.length) * 100

    if (matchedSkills.length > 0) {
      reasons.push(`Matches ${matchedSkills.length} required skills`)
    }
    gaps.push(...jobSkills.filter(s => !matchedSkills.includes(s)))
  }

  const jobExpMatch = matchExperience(job.description, profile.experience)
  experienceMatch = jobExpMatch.score
  if (jobExpMatch.reason) reasons.push(jobExpMatch.reason)

  const jobEduMatch = matchEducation(job.description, profile.education)
  educationMatch = jobEduMatch.score
  if (jobEduMatch.reason) reasons.push(jobEduMatch.reason)

  if (job.location && profile.contactInfo.location) {
    if (!job.location.toLowerCase().includes(profile.contactInfo.location.toLowerCase()) &&
        !profile.contactInfo.location.toLowerCase().includes(job.location.toLowerCase())) {
      locationMatch = 50
      reasons.push('Location may not match')
    }
  }

  const overallScore = Math.round(
    skillMatch * 0.4 +
    experienceMatch * 0.3 +
    educationMatch * 0.15 +
    locationMatch * 0.15
  )

  return {
    jobId: job.id,
    overallScore: Math.min(100, overallScore),
    skillMatch: Math.round(skillMatch),
    experienceMatch: Math.round(experienceMatch),
    educationMatch: Math.round(educationMatch),
    locationMatch: Math.round(locationMatch),
    matchReasons: reasons,
    skillGaps: [...new Set(gaps)].slice(0, 5),
  }
}

function extractJobSkills(description: string): string[] {
  const skillKeywords = [
    'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Go', 'Rust', 'Ruby', 'PHP',
    'React', 'Vue', 'Angular', 'Node.js', 'Express', 'Next.js', 'Django', 'Flask', 'Spring',
    'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Git', 'SQL', 'PostgreSQL', 'MongoDB',
    'Redis', 'GraphQL', 'REST', 'API', 'Machine Learning', 'AI', 'Data Science',
    'HTML', 'CSS', 'Tailwind', 'Linux', 'Agile', 'Scrum',
  ]

  return skillKeywords.filter(skill =>
    description.toLowerCase().includes(skill.toLowerCase())
  )
}

function matchExperience(
  jobDescription: string,
  experience: { title?: string; company?: string; description?: string }[]
): { score: number; reason?: string } {
  if (!experience || experience.length === 0) {
    return { score: 50 }
  }

  const seniorKeywords = /senior|lead|principal|staff|5\+|7\+|10\+/i
  const juniorKeywords = /junior|entry|0-2|1-3|intern/i

  if (seniorKeywords.test(jobDescription) && experience.length >= 3) {
    return { score: 85, reason: 'Matches senior experience requirement' }
  }
  if (juniorKeywords.test(jobDescription) && experience.length <= 2) {
    return { score: 90, reason: 'Matches entry-level requirements' }
  }

  return { score: 70, reason: 'Experience level is a match' }
}

function matchEducation(
  jobDescription: string,
  education: { institution?: string; degree?: string }[]
): { score: number; reason?: string } {
  if (!education || education.length === 0) {
    return { score: 50 }
  }

  const degreeKeywords = /bachelor|master|phd|doctorate|bs|ms|bsc|msc/i

  if (degreeKeywords.test(jobDescription)) {
    const hasDegree = education.some(e =>
      degreeKeywords.test(e.degree || '')
    )
    if (hasDegree) {
      return { score: 90, reason: 'Education requirement met' }
    }
    return { score: 40, reason: 'Missing preferred degree' }
  }

  return { score: 75 }
}
