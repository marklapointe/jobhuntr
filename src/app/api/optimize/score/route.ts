import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { analyzeResume, ResumeMetrics } from '@/lib/ats-scorer/analyzer'
import { generateSuggestions } from '@/lib/ats-scorer/optimizer'

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { text, jobDescription, experience, education, skills } = await req.json()

  if (!text) {
    return NextResponse.json({ error: 'Resume text required' }, { status: 400 })
  }

  const metrics: ResumeMetrics = {
    text,
    jobDescription,
    experience: experience || [],
    education: education || [],
    skills: skills || [],
  }

  const analysis = analyzeResume(metrics)
  const suggestions = generateSuggestions(analysis)

  return NextResponse.json({
    ...analysis,
    suggestions,
  })
}
