import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: { message: 'Unauthorized' } }, { status: 401 })
  }

  const [user, profile, resumes] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, email: true, name: true, role: true, llmProvider: true },
    }),
    prisma.canonicalProfile.findUnique({
      where: { userId: session.user.id },
    }),
    prisma.resume.findMany({
      where: { userId: session.user.id },
      select: { id: true, fileName: true, fileType: true, parseStatus: true, createdAt: true },
    }),
  ])

  if (!user) {
    return NextResponse.json({ error: { message: 'User not found' } }, { status: 404 })
  }

  return NextResponse.json({
    data: {
      user,
      profile,
      resumes,
    },
  })
}
