import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { findMatchingJobs } from '@/lib/matching/engine'

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)

  try {
    const matches = await findMatchingJobs(session.user.id, {}, limit)
    return NextResponse.json({ matches })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Matching failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
