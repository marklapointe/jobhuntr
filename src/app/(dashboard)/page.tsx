'use client'

import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default function DashboardPage() {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  }

  if (status === 'unauthenticated') {
    redirect('/auth/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-bold text-gray-900">jobhuntr</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{session?.user?.email}</span>
              <Link href="/profile" className="text-sm text-blue-600 hover:text-blue-500">
                Settings
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard title="Applications" value="12" trend="+3 this week" />
          <StatCard title="Interviews" value="4" trend="+1 this week" />
          <StatCard title="Offers" value="1" trend="0" />
          <StatCard title="Response Rate" value="32%" trend="+5%" />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <ActionCard
            title="Find Jobs"
            description="Search and match with jobs"
            href="/jobs"
            icon="🔍"
          />
          <ActionCard
            title="Upload Resume"
            description="Add or update your resume"
            href="/profile/resumes"
            icon="📄"
          />
          <ActionCard
            title="View Applications"
            description="Track your application status"
            href="/applications"
            icon="📊"
          />
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Recent Applications</h2>
          </div>
          <div className="divide-y divide-gray-200">
            <ApplicationRow
              company="Stripe"
              role="Senior Software Engineer"
              status="IN_REVIEW"
              date="2 days ago"
            />
            <ApplicationRow
              company="Vercel"
              role="Full Stack Engineer"
              status="INTERVIEW"
              date="5 days ago"
            />
            <ApplicationRow
              company="Linear"
              role="Backend Engineer"
              status="APPLIED"
              date="1 week ago"
            />
          </div>
        </div>
      </main>
    </div>
  )
}

function StatCard({ title, value, trend }: { title: string; value: string; trend: string }) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <p className="text-sm text-gray-600">{title}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-green-600">{trend}</p>
    </div>
  )
}

function ActionCard({ title, description, href, icon }: { title: string; description: string; href: string; icon: string }) {
  return (
    <Link href={href} className="block bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
      <div className="text-3xl mb-2">{icon}</div>
      <h3 className="text-lg font-medium text-gray-900">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </Link>
  )
}

function ApplicationRow({ company, role, status, date }: { company: string; role: string; status: string; date: string }) {
  const statusColors: Record<string, string> = {
    APPLIED: 'bg-blue-100 text-blue-800',
    IN_REVIEW: 'bg-yellow-100 text-yellow-800',
    INTERVIEW: 'bg-green-100 text-green-800',
    OFFER: 'bg-purple-100 text-purple-800',
    REJECTED: 'bg-red-100 text-red-800',
  }

  return (
    <div className="px-6 py-4 flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-900">{company}</p>
        <p className="text-sm text-gray-500">{role}</p>
      </div>
      <div className="text-right">
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
          {status.replace('_', ' ')}
        </span>
        <p className="text-xs text-gray-500 mt-1">{date}</p>
      </div>
    </div>
  )
}
