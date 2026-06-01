import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { getSensitiveFields } from '@/lib/sensitive/field-service'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const fields = await getSensitiveFields(session.user.id)
  return NextResponse.json(fields)
}
