import { prisma } from '@/lib/prisma'
import { ParseResult, Experience, Education } from '@/lib/resume-parser/types'
import type { Prisma } from '@prisma/client'

export interface UnificationResult {
  merged: boolean
  conflicts: Conflict[]
  profile: CanonicalProfileData
}

export interface Conflict {
  field: string
  values: string[]
  resolved?: string
}

export interface CanonicalProfileData {
  contactInfo: {
    name: string
    email: string
    phone: string
    location: string
  }
  experience: Experience[]
  education: Education[]
  skills: string[]
  completeness: number
}

export async function createCanonicalProfile(userId: string, resumeId: string): Promise<CanonicalProfileData> {
  const resume = await prisma.resume.findUnique({ where: { id: resumeId } })
  if (!resume || !resume.parsedData) {
    throw new Error('Resume not found or not parsed')
  }

  const parsedData = resume.parsedData as unknown as ParseResult
  
  const profile = await prisma.canonicalProfile.upsert({
    where: { userId },
    create: {
      userId,
      contactInfo: parsedData.contact.data as unknown as Prisma.InputJsonValue,
      experience: parsedData.experience.data as unknown as Prisma.InputJsonValue,
      education: parsedData.education.data as unknown as Prisma.InputJsonValue,
      skills: parsedData.skills.data as unknown as Prisma.InputJsonValue,
    },
    update: {
      contactInfo: parsedData.contact.data as unknown as Prisma.InputJsonValue,
      experience: parsedData.experience.data as unknown as Prisma.InputJsonValue,
      education: parsedData.education.data as unknown as Prisma.InputJsonValue,
      skills: parsedData.skills.data as unknown as Prisma.InputJsonValue,
    },
  })

  return {
    contactInfo: profile.contactInfo as unknown as CanonicalProfileData['contactInfo'],
    experience: profile.experience as unknown as Experience[],
    education: profile.education as unknown as Education[],
    skills: profile.skills as unknown as string[],
    completeness: calculateCompleteness(profile),
  }
}

export async function mergeResumes(resumeIds: string[]): Promise<UnificationResult> {
  const resumes = await prisma.resume.findMany({
    where: { id: { in: resumeIds } },
  })

  const parsedDataList = resumes
    .filter(r => r.parsedData)
    .map(r => r.parsedData as unknown as ParseResult)

  if (parsedDataList.length === 0) {
    return { merged: false, conflicts: [], profile: {} as CanonicalProfileData }
  }

  const contactInfo = mergeContactInfo(parsedDataList.map(p => p.contact.data))

  const { data: experience, conflicts: expConflicts } = mergeExperience(
    parsedDataList.flatMap(p => p.experience.data)
  )

  const { data: education } = mergeEducation(
    parsedDataList.flatMap(p => p.education.data)
  )

  const skills = [...new Set(parsedDataList.flatMap(p => p.skills.data))]

  return {
    merged: true,
    conflicts: [...expConflicts],
    profile: {
      contactInfo,
      experience,
      education,
      skills,
      completeness: calculateFromFields(contactInfo, experience, education, skills),
    },
  }
}

function mergeContactInfo(contacts: CanonicalProfileData['contactInfo'][]): CanonicalProfileData['contactInfo'] {
  const result = { name: '', email: '', phone: '', location: '' }
  
  for (const contact of contacts) {
    if (!result.name && contact.name) result.name = contact.name
    if (!result.email && contact.email) result.email = contact.email
    if (!result.phone && contact.phone) result.phone = contact.phone
    if (!result.location && contact.location) result.location = contact.location
  }
  
  return result
}

function mergeExperience(experiences: Experience[]): { data: Experience[]; conflicts: Conflict[] } {
  const seen = new Map<string, Experience>()
  const conflicts: Conflict[] = []

  for (const exp of experiences) {
    const key = `${exp.company}-${exp.title}`
    if (seen.has(key)) {
      conflicts.push({
        field: 'experience',
        values: [seen.get(key)!.description, exp.description],
      })
    } else {
      seen.set(key, exp)
    }
  }

  return { data: Array.from(seen.values()), conflicts }
}

function mergeEducation(educations: Education[]): { data: Education[]; conflicts: Conflict[] } {
  const seen = new Map<string, Education>()
  
  for (const edu of educations) {
    const key = `${edu.institution}-${edu.degree}`
    if (!seen.has(key)) {
      seen.set(key, edu)
    }
  }

  return { data: Array.from(seen.values()), conflicts: [] }
}

function calculateCompleteness(profile: { contactInfo?: Prisma.JsonValue; experience?: Prisma.JsonValue; education?: Prisma.JsonValue; skills?: Prisma.JsonValue }): number {
  return calculateFromFields(
    profile.contactInfo as unknown as CanonicalProfileData['contactInfo'] | undefined,
    profile.experience as unknown as Experience[] | undefined,
    profile.education as unknown as Education[] | undefined,
    profile.skills as unknown as string[] | undefined
  )
}

function calculateFromFields(
  contact?: { name?: string; email?: string },
  experience?: Experience[],
  education?: Education[],
  skills?: string[]
): number {
  let score = 0
  if (contact?.name) score += 20
  if (contact?.email) score += 20
  if (experience && experience.length > 0) score += 25
  if (education && education.length > 0) score += 20
  if (skills && skills.length > 0) score += 15
  return score
}
