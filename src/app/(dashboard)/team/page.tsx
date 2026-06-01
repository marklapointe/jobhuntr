'use client'

import { useState } from 'react'
import Link from 'next/link'

interface TeamMember {
  id: string
  userId: string
  role: string
  joinedAt: string
  user: {
    id: string
    email: string
    name: string | null
  }
}

interface Team {
  id: string
  name: string
  ownerId: string
  createdAt: string
  owner: {
    id: string
    email: string
    name: string | null
  }
  members: TeamMember[]
}

export default function TeamPage() {
  const [teams, setTeams] = useState<Team[]>([
    {
      id: '1',
      name: 'Engineering Team',
      ownerId: 'user1',
      createdAt: '2024-01-01',
      owner: { id: 'user1', email: 'owner@example.com', name: 'Team Owner' },
      members: [
        { id: 'm1', userId: 'user1', role: 'owner', joinedAt: '2024-01-01', user: { id: 'user1', email: 'owner@example.com', name: 'Team Owner' } },
        { id: 'm2', userId: 'user2', role: 'admin', joinedAt: '2024-01-02', user: { id: 'user2', email: 'admin@example.com', name: 'Admin User' } },
        { id: 'm3', userId: 'user3', role: 'member', joinedAt: '2024-01-03', user: { id: 'user3', email: 'member@example.com', name: 'Member User' } },
      ],
    },
    {
      id: '2',
      name: 'Recruiting Team',
      ownerId: 'user1',
      createdAt: '2024-01-05',
      owner: { id: 'user1', email: 'owner@example.com', name: 'Team Owner' },
      members: [
        { id: 'm4', userId: 'user1', role: 'owner', joinedAt: '2024-01-05', user: { id: 'user1', email: 'owner@example.com', name: 'Team Owner' } },
        { id: 'm5', userId: 'user4', role: 'member', joinedAt: '2024-01-06', user: { id: 'user4', email: 'recruiter@example.com', name: 'Recruiter' } },
      ],
    },
  ])
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('member')

  const roleColors: Record<string, string> = {
    owner: 'bg-purple-100 text-purple-800',
    admin: 'bg-blue-100 text-blue-800',
    member: 'bg-gray-100 text-gray-800',
  }

  const handleInvite = () => {
    if (!selectedTeam || !inviteEmail) return
    setShowInviteModal(false)
    setInviteEmail('')
    setInviteRole('member')
  }

  const handleRoleChange = (memberId: string, newRole: string) => {
    if (!selectedTeam) return
    setTeams(teams.map(t =>
      t.id === selectedTeam.id
        ? {
            ...t,
            members: t.members.map(m =>
              m.id === memberId ? { ...m, role: newRole } : m
            ),
          }
        : t
    ))
    if (selectedTeam) {
      setSelectedTeam({
        ...selectedTeam,
        members: selectedTeam.members.map(m =>
          m.id === memberId ? { ...m, role: newRole } : m
        ),
      })
    }
  }

  const handleRemoveMember = (memberId: string) => {
    if (!selectedTeam) return
    setTeams(teams.map(t =>
      t.id === selectedTeam.id
        ? { ...t, members: t.members.filter(m => m.id !== memberId) }
        : t
    ))
    if (selectedTeam) {
      setSelectedTeam({
        ...selectedTeam,
        members: selectedTeam.members.filter(m => m.id !== memberId),
      })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Teams</h1>
            <button
              onClick={() => setShowInviteModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
            >
              Create Team
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-200">
                <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Your Teams
                </h2>
              </div>
              <div className="divide-y divide-gray-200">
                {teams.map((team) => (
                  <button
                    key={team.id}
                    onClick={() => setSelectedTeam(team)}
                    className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                      selectedTeam?.id === team.id ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="font-medium text-gray-900">{team.name}</div>
                    <div className="text-sm text-gray-500">
                      {team.members.length} member{team.members.length !== 1 ? 's' : ''}
                    </div>
                  </button>
                ))}
                {teams.length === 0 && (
                  <div className="px-4 py-8 text-center text-gray-500">
                    No teams yet
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            {selectedTeam ? (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{selectedTeam.name}</h2>
                    <p className="text-sm text-gray-500">
                      Created {new Date(selectedTeam.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowInviteModal(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                  >
                    Invite Member
                  </button>
                </div>

                <div className="px-6 py-4">
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">
                    Team Members
                  </h3>
                  <div className="space-y-4">
                    {selectedTeam.members.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                            {member.user.name?.[0] || member.user.email[0].toUpperCase()}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {member.user.name || 'Unnamed User'}
                            </div>
                            <div className="text-sm text-gray-500">{member.user.email}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${roleColors[member.role]}`}
                          >
                            {member.role}
                          </span>
                          {member.role !== 'owner' && (
                            <div className="flex items-center gap-2">
                              <select
                                value={member.role}
                                onChange={(e) => handleRoleChange(member.id, e.target.value)}
                                className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              >
                                <option value="admin">Admin</option>
                                <option value="member">Member</option>
                              </select>
                              <button
                                onClick={() => handleRemoveMember(member.id)}
                                className="text-red-600 hover:text-red-500 text-sm"
                              >
                                Remove
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <div className="text-gray-400 text-6xl mb-4">👥</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a team</h3>
                <p className="text-gray-500">
                  Choose a team from the list to view its details and members
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Invite Team Member</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="colleague@company.com"
                />
              </div>
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  id="role"
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="admin">Admin</option>
                  <option value="member">Member</option>
                </select>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowInviteModal(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleInvite}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
              >
                Send Invite
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
