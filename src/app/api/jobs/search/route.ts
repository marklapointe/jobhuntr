import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { searchJobs } from '@/lib/job-aggregator'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)

  const keywords = searchParams.get('keywords')?.split(',').filter(Boolean) || []
  const locations = searchParams.get('locations')?.split(',').filter(Boolean) || []
  const sources = searchParams.get('sources')?.split(',').filter(Boolean) || []
  const page = parseInt(searchParams.get('page') || '1')
  const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)

  const jobs = await searchJobs({ keywords, locations, sources, page, limit })

  return NextResponse.json({
    jobs,
    page,
    limit,
    total: jobs.length,
  })
}
