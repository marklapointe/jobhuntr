import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { updateApplicationStatuses } from '@/lib/tracking/updater'

export async function POST() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const updatedCount = await updateApplicationStatuses(session.user.id)
    return NextResponse.json({ success: true, updatedCount })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to refresh statuses' },
      { status: 500 }
    )
  }
}