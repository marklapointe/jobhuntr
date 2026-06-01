import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { getJobMatchDetails } from '@/lib/matching/engine'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const match = await getJobMatchDetails(session.user.id, id)

  if (!match) {
    return NextResponse.json({ error: 'Job not found' }, { status: 404 })
  }

  return NextResponse.json(match)
}
