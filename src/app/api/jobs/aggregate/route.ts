import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { aggregateFromSource } from '@/lib/job-aggregator'

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { source, config } = await req.json()

  if (!source) {
    return NextResponse.json({ error: 'Source required' }, { status: 400 })
  }

  const jobs = await aggregateFromSource(source, config)

  return NextResponse.json({
    source,
    count: jobs.length,
    jobs,
  })
}
