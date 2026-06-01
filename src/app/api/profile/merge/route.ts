import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { mergeResumes } from '@/lib/profile/unification-service'

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { resumeIds } = await req.json()
  
  if (!resumeIds || !Array.isArray(resumeIds) || resumeIds.length < 2) {
    return NextResponse.json({ error: 'At least 2 resume IDs required' }, { status: 400 })
  }

  const result = await mergeResumes(resumeIds)
  return NextResponse.json(result)
}
