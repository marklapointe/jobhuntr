import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { fillGreenhouseForm } from '@/lib/automation/greenhouse'

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { jobId } = await req.json()
  
  const job = await prisma.job.findUnique({ where: { id: jobId } })
  if (!job) {
    return NextResponse.json({ error: 'Job not found' }, { status: 404 })
  }

  const profile = await prisma.canonicalProfile.findUnique({
    where: { userId: session.user.id },
  })
  if (!profile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 400 })
  }

  let result: { success: boolean; error?: string }
  
  if (job.source === 'greenhouse') {
    result = await fillGreenhouseForm(job.sourceUrl, {
      firstName: (profile.contactInfo as any)?.name?.split(' ')[0] || '',
      lastName: (profile.contactInfo as any)?.name?.split(' ').slice(1).join(' ') || '',
      email: (profile.contactInfo as any)?.email || '',
      phone: (profile.contactInfo as any)?.phone || '',
    })
  } else {
    result = { success: false, error: 'Unsupported ATS source' }
  }

  if (result.success) {
    // Create application record
    await prisma.application.create({
      data: {
        userId: session.user.id,
        jobId: job.id,
        status: 'APPLIED',
        appliedAt: new Date(),
      },
    })
  }

  return NextResponse.json(result)
}
