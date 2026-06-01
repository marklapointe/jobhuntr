import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { getUserProfile, updateUserProfile, updateLlmSettings } from '@/lib/user/profile-service'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const profile = await getUserProfile(session.user.id)
  return NextResponse.json(profile)
}

export async function PATCH(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const data = await req.json()
  const updated = await updateUserProfile(session.user.id, data)
  return NextResponse.json(updated)
}