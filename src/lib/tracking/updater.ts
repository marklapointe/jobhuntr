import { prisma } from '@/lib/prisma'
import { checkApplicationStatus, ApplicationStatus } from './status-detector'

export async function updateApplicationStatuses(userId: string): Promise<number> {
  // Get all applications for user that aren't final status
  const applications = await prisma.application.findMany({
    where: {
      userId,
      status: {
        in: ['SAVED', 'APPLIED', 'IN_REVIEW'],
      },
    },
    include: {
      job: true,
    },
  })

  let updatedCount = 0

  for (const app of applications) {
    try {
      const result = await checkApplicationStatus(app.job.sourceUrl)
      
      if (result.status !== app.status) {
        await prisma.application.update({
          where: { id: app.id },
          data: {
            status: result.status,
            lastStatusUpdate: new Date(),
            notes: result.details,
          },
        })
        updatedCount++
      }
    } catch (error) {
      console.error(`Failed to update application ${app.id}:`, error)
    }
  }

  return updatedCount
}

export async function getApplicationTimeline(applicationId: string) {
  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: {
      job: true,
    },
  })

  if (!application) return null

  return {
    id: application.id,
    job: application.job,
    status: application.status,
    appliedAt: application.appliedAt,
    lastStatusUpdate: application.lastStatusUpdate,
    notes: application.notes,
  }
}