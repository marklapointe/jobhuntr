import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  
  const job = await prisma.job.findUnique({ where: { id } })
  
  if (!job) {
    return NextResponse.json({ error: { message: 'Job not found' } }, { status: 404 })
  }

  // Mobile-optimized response
  return NextResponse.json({
    data: {
      id: job.id,
      title: job.title,
      company: job.company,
      location: job.location,
      description: job.description,
      salary: job.salary,
      source: job.source,
      sourceUrl: job.sourceUrl,
      jobUrl: job.jobUrl,
      postedAt: job.fetchedAt,
    },
  })
}
