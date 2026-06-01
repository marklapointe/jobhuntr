import { prisma } from '@/lib/prisma'

export async function exportProfileToJson(userId: string) {
  const profile = await prisma.canonicalProfile.findUnique({
    where: { userId },
    include: { user: { select: { email: true, name: true } } },
  })

  if (!profile) {
    throw new Error('Profile not found')
  }

  return {
    exportedAt: new Date().toISOString(),
    candidate: {
      name: profile.user.name,
      email: profile.user.email,
      ...profile,
    },
  }
}

export async function exportProfileToPdf(userId: string) {
  return exportProfileToJson(userId)
}
