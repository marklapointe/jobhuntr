import { prisma } from '@/lib/prisma'
import { TeamRole, hasPermission, canManageTeam } from './rbac'

export interface CreateTeamInput {
  userId: string
  name: string
}

export interface InviteMemberInput {
  teamId: string
  email: string
  role: TeamRole
}

export interface UpdateMemberRoleInput {
  teamId: string
  userId: string
  newRole: TeamRole
  requestingUserId: string
}

export async function createTeam(userId: string, name: string) {
  return prisma.team.create({
    data: {
      name,
      ownerId: userId,
      members: {
        create: {
          userId,
          role: TeamRole.OWNER,
        },
      },
    },
    include: {
      members: {
        include: {
          user: {
            select: { id: true, email: true, name: true },
          },
        },
      },
    },
  })
}

export async function getTeam(teamId: string) {
  return prisma.team.findUnique({
    where: { id: teamId },
    include: {
      owner: {
        select: { id: true, email: true, name: true },
      },
      members: {
        include: {
          user: {
            select: { id: true, email: true, name: true },
          },
        },
        orderBy: { joinedAt: 'asc' },
      },
    },
  })
}

export async function listUserTeams(userId: string) {
  return prisma.team.findMany({
    where: {
      members: {
        some: { userId },
      },
    },
    include: {
      owner: {
        select: { id: true, email: true, name: true },
      },
      members: {
        include: {
          user: {
            select: { id: true, email: true, name: true },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })
}

export async function inviteMember(teamId: string, email: string, role: TeamRole) {
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    throw new Error('User not found')
  }

  const existing = await prisma.teamMember.findUnique({
    where: { teamId_userId: { teamId, userId: user.id } },
  })
  if (existing) {
    throw new Error('User is already a member')
  }

  return prisma.teamMember.create({
    data: {
      teamId,
      userId: user.id,
      role,
    },
    include: {
      user: {
        select: { id: true, email: true, name: true },
      },
    },
  })
}

export async function removeMember(teamId: string, userId: string, requestingUserId: string) {
  const member = await prisma.teamMember.findUnique({
    where: { teamId_userId: { teamId, userId } },
  })
  if (!member) {
    throw new Error('Member not found')
  }

  if (!canManageTeam(requestingUserId, teamId, member.role)) {
    throw new Error('Insufficient permissions')
  }

  if (member.role === TeamRole.OWNER) {
    throw new Error('Cannot remove team owner')
  }

  return prisma.teamMember.delete({
    where: { teamId_userId: { teamId, userId } },
  })
}

export async function updateMemberRole(
  teamId: string,
  userId: string,
  newRole: TeamRole,
  requestingUserId: string
) {
  const targetMember = await prisma.teamMember.findUnique({
    where: { teamId_userId: { teamId, userId } },
  })
  if (!targetMember) {
    throw new Error('Member not found')
  }

  if (!hasPermission(requestingUserId, teamId, 'update_member')) {
    throw new Error('Insufficient permissions')
  }

  if (targetMember.role === TeamRole.OWNER) {
    throw new Error('Cannot change owner role')
  }

  if (newRole === TeamRole.OWNER) {
    throw new Error('Cannot assign owner role')
  }

  return prisma.teamMember.update({
    where: { teamId_userId: { teamId, userId } },
    data: { role: newRole },
    include: {
      user: {
        select: { id: true, email: true, name: true },
      },
    },
  })
}

export async function getMemberRole(teamId: string, userId: string): Promise<TeamRole | null> {
  const member = await prisma.teamMember.findUnique({
    where: { teamId_userId: { teamId, userId } },
  })
  return member ? (member.role as TeamRole) : null
}

export async function deleteTeam(teamId: string, requestingUserId: string) {
  if (!hasPermission(requestingUserId, teamId, 'delete_team')) {
    throw new Error('Insufficient permissions')
  }

  return prisma.team.delete({
    where: { id: teamId },
  })
}

export async function transferOwnership(teamId: string, newOwnerId: string, requestingUserId: string) {
  const currentMember = await prisma.teamMember.findUnique({
    where: { teamId_userId: { teamId, userId: requestingUserId } },
  })

  if (!currentMember || currentMember.role !== TeamRole.OWNER) {
    throw new Error('Only owner can transfer ownership')
  }

  const newOwnerMember = await prisma.teamMember.findUnique({
    where: { teamId_userId: { teamId, userId: newOwnerId } },
  })

  if (!newOwnerMember) {
    throw new Error('New owner must be a team member')
  }

  return prisma.$transaction(async (tx) => {
    await tx.teamMember.update({
      where: { teamId_userId: { teamId, userId: requestingUserId } },
      data: { role: TeamRole.ADMIN },
    })

    return tx.teamMember.update({
      where: { teamId_userId: { teamId, userId: newOwnerId } },
      data: { role: TeamRole.OWNER },
    })
  })
}
