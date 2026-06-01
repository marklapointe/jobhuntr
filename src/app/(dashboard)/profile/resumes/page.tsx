'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'

export default function ResumesPage() {
  const { data: session, status } = useSession()
  const [uploading, setUploading] = useState(false)

  if (status === 'loading') return <div>Loading...</div>
  if (status === 'unauthenticated') redirect('/auth/login')

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">My Resumes</h1>
      
      <div className="mb-8">
        <UploadButton uploading={uploading} onUpload={() => setUploading(true)} />
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">File</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Uploaded</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500" colSpan={4}>
                No resumes uploaded yet
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}

function UploadButton({ uploading, onUpload }: { uploading: boolean; onUpload: () => void }) {
  return (
    <label className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md shadow-sm cursor-pointer hover:bg-blue-700">
      {uploading ? 'Uploading...' : 'Upload Resume'}
      <input type="file" className="hidden" accept=".pdf,.docx,.txt" onChange={onUpload} />
    </label>
  )
}