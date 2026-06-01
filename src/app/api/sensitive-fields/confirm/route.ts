import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { confirmSensitiveField } from '@/lib/sensitive/field-service'
import { SensitiveFieldType } from '@prisma/client'

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { fieldId, confirmed, value } = await req.json()

  const field = await confirmSensitiveField(
    session.user.id,
    fieldId as unknown as SensitiveFieldType,
    confirmed,
    value
  )

  return NextResponse.json(field)
}
