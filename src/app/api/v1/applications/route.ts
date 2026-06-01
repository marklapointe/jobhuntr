import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: { message: 'Unauthorized' } }, { status: 401 })
  }

  const applications = await prisma.application.findMany({
    where: { userId: session.user.id },
    include: { job: true },
    orderBy: { lastStatusUpdate: 'desc' },
  })

  return NextResponse.json({
    data: applications.map(app => ({
      id: app.id,
      status: app.status,
      appliedAt: app.appliedAt,
      lastUpdated: app.lastStatusUpdate,
      job: {
        id: app.job.id,
        title: app.job.title,
        company: app.job.company,
        location: app.job.location,
        source: app.job.source,
      },
    })),
  })
}
