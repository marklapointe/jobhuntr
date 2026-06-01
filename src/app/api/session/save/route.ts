import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { sessionPreservation } from '@/lib/session/manager'
import { sessionRecovery } from '@/lib/session/recovery'

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { sessionId, atsType, formState } = await req.json()
  
  if (!sessionId || !atsType) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  // Save form state for recovery
  if (formState) {
    await sessionRecovery.saveFormState(sessionId, null as any, formState)
  }

  return NextResponse.json({
    success: true,
    sessionId,
    savedAt: new Date().toISOString(),
  })
}
