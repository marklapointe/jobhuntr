import { prisma } from '@/lib/prisma'
import { SensitiveFieldType } from '@prisma/client'

export interface SensitiveFieldData {
  fieldType: SensitiveFieldType
  value: string
  confidence: number
  needsReview: boolean
  autoApproved: boolean
}

export async function extractSensitiveFields(
  userId: string,
  resumeText: string,
  confidenceThreshold = 0.7
): Promise<SensitiveFieldData[]> {
  const fields: SensitiveFieldData[] = []

  const criminalPatterns = [
    /criminal|felony|misdemeanor|convicted|arrest/i,
    /background check|authorizations/i,
  ]

  for (const pattern of criminalPatterns) {
    if (pattern.test(resumeText)) {
      fields.push({
        fieldType: 'CRIMINAL_HISTORY',
        value: 'DETECTED',
        confidence: 0.5,
        needsReview: true,
        autoApproved: false,
      })
      break
    }
  }

  const visaPatterns = [
    /visa|work authorization|h1b|green card|citizen/i,
    /sponsor|eligible.*work/i,
  ]

  for (const pattern of visaPatterns) {
    if (pattern.test(resumeText)) {
      fields.push({
        fieldType: 'VISA_STATUS',
        value: 'NEEDS_REVIEW',
        confidence: 0.5,
        needsReview: true,
        autoApproved: false,
      })
      break
    }
  }

  for (const field of fields) {
    await prisma.sensitiveField.upsert({
      where: { id: `${userId}-${field.fieldType}` },
      create: {
        userId,
        fieldType: field.fieldType,
        value: field.value,
        confidence: field.confidence,
        needsReview: field.needsReview,
        autoApproved: field.autoApproved,
      },
      update: {
        value: field.value,
        confidence: field.confidence,
        needsReview: field.needsReview,
      },
    })
  }

  return fields
}

export async function confirmSensitiveField(
  userId: string,
  fieldType: SensitiveFieldType,
  confirmed: boolean,
  value?: string
) {
  const field = await prisma.sensitiveField.findFirst({
    where: { userId, fieldType },
  })

  if (!field) {
    throw new Error('Sensitive field not found')
  }

  await prisma.sensitiveFieldConfirmation.create({
    data: {
      sensitiveFieldId: field.id,
      action: confirmed ? 'CONFIRMED' : 'REJECTED',
      previousValue: field.value,
      newValue: value || field.value,
    },
  })

  return prisma.sensitiveField.update({
    where: { id: field.id },
    data: {
      needsReview: false,
      autoApproved: false,
      value: value || field.value,
    },
  })
}

export async function enableAutoApprove(userId: string, fieldType: SensitiveFieldType) {
  return prisma.sensitiveField.updateMany({
    where: { userId, fieldType },
    data: { autoApproved: true },
  })
}

export async function disableAutoApprove(userId: string, fieldType: SensitiveFieldType) {
  return prisma.sensitiveField.updateMany({
    where: { userId, fieldType },
    data: { autoApproved: false },
  })
}

export async function getSensitiveFields(userId: string) {
  return prisma.sensitiveField.findMany({
    where: { userId },
    include: { confirmations: { orderBy: { createdAt: 'desc' }, take: 5 } },
  })
}

export async function getSensitiveFieldAuditLog(userId: string, fieldType?: SensitiveFieldType) {
  const fields = await prisma.sensitiveField.findMany({
    where: { userId, fieldType },
  })

  return prisma.sensitiveFieldConfirmation.findMany({
    where: { sensitiveFieldId: { in: fields.map(f => f.id) } },
    orderBy: { createdAt: 'desc' },
  })
}
