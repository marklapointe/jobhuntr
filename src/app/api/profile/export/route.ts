import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { exportProfileToJson, exportProfileToPdf } from '@/lib/profile/export-service'

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const format = searchParams.get('format') || 'json'

  try {
    if (format === 'pdf') {
      const data = await exportProfileToPdf(session.user.id)
      return NextResponse.json(data)
    }
    const data = await exportProfileToJson(session.user.id)
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Export failed' }, { status: 500 })
  }
}
