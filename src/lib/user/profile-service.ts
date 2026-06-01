import { prisma } from '@/lib/prisma'

export async function getUserProfile(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    include: {
      resumes: { orderBy: { createdAt: 'desc' } },
      profile: true,
      agentConfigs: true,
    },
  })
}

export async function updateUserProfile(userId: string, data: { name?: string; email?: string }) {
  return prisma.user.update({
    where: { id: userId },
    data,
  })
}

export async function updateLlmSettings(userId: string, llmProvider: string, llmApiKey?: string) {
  return prisma.user.update({
    where: { id: userId },
    data: { llmProvider, llmApiKey },
  })
}

export async function getUserResumes(userId: string) {
  return prisma.resume.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  })
}

export async function setActiveResume(userId: string, resumeId: string) {
  await prisma.resume.updateMany({
    where: { userId },
    data: { /* will add isActive field if needed */ },
  })
  
  return prisma.resume.update({
    where: { id: resumeId },
    data: { parseStatus: 'COMPLETED' },
  })
}