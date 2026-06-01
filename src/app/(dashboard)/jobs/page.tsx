'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function JobsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [jobs] = useState([
    { id: '1', title: 'Senior Software Engineer', company: 'Stripe', location: 'Remote', matchScore: 92 },
    { id: '2', title: 'Full Stack Engineer', company: 'Vercel', location: 'San Francisco', matchScore: 88 },
    { id: '3', title: 'Backend Engineer', company: 'Linear', location: 'Remote', matchScore: 85 },
    { id: '4', title: 'DevOps Engineer', company: 'Railway', location: 'Remote', matchScore: 78 },
  ])

  const filteredJobs = jobs.filter(job =>
    job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.company.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <h1 className="text-2xl font-bold text-gray-900">Find Jobs</h1>
            <div className="mt-4">
              <input
                type="text"
                placeholder="Search jobs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-4">
          {filteredJobs.map((job) => (
            <div key={job.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{job.title}</h3>
                  <p className="text-sm text-gray-600">{job.company}</p>
                  <p className="text-sm text-gray-500 mt-1">📍 {job.location}</p>
                </div>
                <div className="text-right">
                  <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-medium">
                    {job.matchScore}% match
                  </div>
                </div>
              </div>
              <div className="mt-4 flex gap-3">
                <Link
                  href={`/jobs/${job.id}`}
                  className="flex-1 text-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  View Details
                </Link>
                <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
                  Quick Apply
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
