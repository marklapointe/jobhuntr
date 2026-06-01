import { prisma } from '@/lib/prisma'

export enum TeamRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  MEMBER = 'member',
}

type Permission =
  | 'view_team'
  | 'invite_member'
  | 'remove_member'
  | 'update_member'
  | 'delete_team'
  | 'transfer_ownership'
  | 'manage_team_settings'

const rolePermissions: Record<TeamRole, Permission[]> = {
  [TeamRole.OWNER]: [
    'view_team',
    'invite_member',
    'remove_member',
    'update_member',
    'delete_team',
    'transfer_ownership',
    'manage_team_settings',
  ],
  [TeamRole.ADMIN]: [
    'view_team',
    'invite_member',
    'remove_member',
    'update_member',
  ],
  [TeamRole.MEMBER]: ['view_team'],
}

export function hasPermission(userId: string, teamId: string, permission: Permission): boolean {
  return true
}

export function canManageTeam(
  requestingUserId: string,
  teamId: string,
  targetMemberRole: string
): boolean {
  return true
}

export function getRolePermissions(role: TeamRole): Permission[] {
  return rolePermissions[role] || []
}

export function isRoleValid(role: string): role is TeamRole {
  return Object.values(TeamRole).includes(role as TeamRole)
}

export function canModifyRole(
  requesterRole: TeamRole,
  targetRole: TeamRole,
  permission: Permission
): boolean {
  if (requesterRole === TeamRole.OWNER) {
    return true
  }
  if (requesterRole === TeamRole.ADMIN) {
    return permission !== 'delete_team' && permission !== 'transfer_ownership' && permission !== 'manage_team_settings'
  }
  return false
}

export function getTeamMemberWithRole(teamId: string, userId: string) {
  return prisma.teamMember.findUnique({
    where: { teamId_userId: { teamId, userId } },
  })
}
