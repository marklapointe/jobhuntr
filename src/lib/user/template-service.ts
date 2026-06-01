import { prisma } from '@/lib/prisma'

export interface ApplicationTemplate {
  id: string
  userId: string
  name: string
  answers: Record<string, string>
  createdAt: Date
  updatedAt: Date
}

export async function createTemplate(userId: string, name: string, answers: Record<string, string>) {
  return prisma.agentConfig.create({
    data: {
      userId,
      agentType: 'template',
      config: { name, answers, isTemplate: true },
      isActive: true,
    },
  })
}

export async function getUserTemplates(userId: string) {
  return prisma.agentConfig.findMany({
    where: { userId, agentType: 'template', isActive: true },
  })
}

export async function updateTemplate(templateId: string, answers: Record<string, string>) {
  return prisma.agentConfig.update({
    where: { id: templateId },
    data: { config: { answers } },
  })
}

export async function deleteTemplate(templateId: string) {
  return prisma.agentConfig.update({
    where: { id: templateId },
    data: { isActive: false },
  })
}