'use client'

import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'

export default function ProfilePage() {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return <div>Loading...</div>
  }

  if (status === 'unauthenticated') {
    redirect('/auth/login')
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Profile Settings</h1>
      <div className="grid gap-6 md:grid-cols-2">
        <ProfileSection title="Account" description="Manage your account settings">
          <p className="text-sm text-gray-600">Email: {session?.user?.email}</p>
        </ProfileSection>
        <ProfileSection title="LLM Provider" description="Configure your AI provider">
          <LLMProviderSettings />
        </ProfileSection>
      </div>
    </div>
  )
}

function ProfileSection({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-2">{title}</h2>
      <p className="text-gray-600 text-sm mb-4">{description}</p>
      {children}
    </div>
  )
}

function LLMProviderSettings() {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Provider</label>
        <select className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none">
          <option value="openai">OpenAI</option>
          <option value="anthropic">Anthropic</option>
          <option value="ollama">Ollama (Local)</option>
          <option value="custom-gateway">Custom Gateway</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">API Key</label>
        <input
          type="password"
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none"
          placeholder="sk-..."
        />
      </div>
    </div>
  )
}