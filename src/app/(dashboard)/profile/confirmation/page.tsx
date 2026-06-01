'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'

interface SensitiveField {
  id: string
  fieldType: string
  value: string
  confidence: number
  needsReview: boolean
  autoApproved: boolean
}

export default function SensitiveFieldsPage() {
  const { data: session, status } = useSession()
  const [fields, setFields] = useState<SensitiveField[]>([])
  const [loading, setLoading] = useState(true)

  if (status === 'loading') return <div>Loading...</div>
  if (status === 'unauthenticated') redirect('/auth/login')

  useEffect(() => {
    fetch('/api/sensitive-fields')
      .then(res => res.json())
      .then(data => setFields(data))
      .finally(() => setLoading(false))
  }, [])

  const handleConfirm = async (fieldId: string, confirmed: boolean) => {
    await fetch('/api/sensitive-fields/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fieldId, confirmed }),
    })
    const res = await fetch('/api/sensitive-fields')
    setFields(await res.json())
  }

  if (loading) return <div>Loading...</div>

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-2">Sensitive Information</h1>
      <p className="text-gray-600 mb-8">
        These fields require your confirmation before they can be used in job applications.
      </p>

      {fields.length === 0 ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
          <p className="text-green-800">No sensitive fields detected in your resume.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {fields.map(field => (
            <div key={field.id} className="bg-white border rounded-lg p-6 shadow">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold">
                    {field.fieldType === 'CRIMINAL_HISTORY' ? 'Criminal History' : 'Visa Status'}
                  </h3>
                  <p className="text-gray-600 mt-1">
                    Detected value: <strong>{field.value}</strong>
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Confidence: {(field.confidence * 100).toFixed(0)}%
                  </p>
                </div>
                {field.needsReview ? (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                    NEEDS REVIEW
                  </span>
                ) : (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    Confirmed
                  </span>
                )}
              </div>

              {field.needsReview && (
                <div className="mt-4 flex gap-3">
                  <button
                    onClick={() => handleConfirm(field.id, true)}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Confirm Accurate
                  </button>
                  <button
                    onClick={() => handleConfirm(field.id, false)}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    This is Wrong
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium mb-2">Auto-Approve Settings</h4>
        <p className="text-sm text-gray-600 mb-4">
          Enable auto-approve to automatically confirm these fields for future resume uploads.
        </p>
        <label className="flex items-center gap-2">
          <input type="checkbox" className="rounded" />
          <span className="text-sm">Automatically approve detected values</span>
        </label>
      </div>
    </div>
  )
}
