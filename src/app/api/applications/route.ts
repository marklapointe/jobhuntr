import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const applications = await prisma.application.findMany({
    where: { userId: session.user.id },
    include: {
      job: true,
      resume: {
        select: { id: true, fileName: true, parseStatus: true },
      },
    },
    orderBy: { lastStatusUpdate: 'desc' },
  })

  return NextResponse.json({ applications })
}