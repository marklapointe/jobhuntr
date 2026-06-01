import { ContactInfo, Experience, Education, ParseResult } from './types'

export function extractContact(text: string): { data: ContactInfo; confidence: number } {
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g
  const phoneRegex = /(\+?1?[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g

  const emails = text.match(emailRegex) || []
  const phones = text.match(phoneRegex) || []

  // Extract name (first line that looks like a name)
  const lines = text.split('\n').filter(l => l.trim())
  let name = ''
  let confidence = 0

  if (lines.length > 0) {
    const firstLine = lines[0].trim()
    // Simple heuristic: name is short, no special chars
    if (firstLine.length < 50 && !firstLine.includes('@') && !firstLine.match(/\d{3}/)) {
      name = firstLine
      confidence = 0.7
    }
  }

  return {
    data: {
      name,
      email: emails[0] || '',
      phone: phones[0] || '',
      location: extractLocation(text),
    },
    confidence,
  }
}

export function extractExperience(text: string): { data: Experience[]; confidence: number } {
  const experiences: Experience[] = []
  const lines = text.split('\n')

  let currentExp: Partial<Experience> = {}
  let inExperience = false

  for (const line of lines) {
    const trimmed = line.trim()

    // Look for date patterns
    const dateMatch = trimmed.match(/(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s*\d{4}\s*[-–]\s*(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec[a-z]*\.?\s*\d{4}|Present|Current)/i)

    if (dateMatch) {
      if (currentExp.company || currentExp.title) {
        experiences.push(currentExp as Experience)
      }
      inExperience = true
      currentExp = {
        startDate: normalizeDate(dateMatch[0]),
        current: dateMatch[2]?.toLowerCase().includes('present'),
      }
    } else if (inExperience && trimmed.length > 0) {
      if (!currentExp.company) {
        currentExp.company = trimmed
      } else if (!currentExp.title) {
        currentExp.title = trimmed
      } else {
        currentExp.description = (currentExp.description || '') + ' ' + trimmed
      }
    }
  }

  if (currentExp.company || currentExp.title) {
    experiences.push(currentExp as Experience)
  }

  return {
    data: experiences,
    confidence: experiences.length > 0 ? 0.6 : 0,
  }
}

export function extractEducation(text: string): { data: Education[]; confidence: number } {
  const education: Education[] = []
  const degreePatterns = [
    /Bachelor/i, /Master/i, /PhD|Doctorate/i, /Associate/i, /B\.?S\.?/i, /B\.?A\.?/i, /M\.?S\.?/i, /M\.?A\.?/i,
  ]

  const lines = text.split('\n')

  for (const line of lines) {
    const trimmed = line.trim()
    const hasDegree = degreePatterns.some(p => p.test(trimmed))

    if (hasDegree) {
      education.push({
        institution: extractInstitution(trimmed),
        degree: trimmed,
        startDate: extractYear(trimmed) || '',
        endDate: undefined,
      })
    }
  }

  return {
    data: education,
    confidence: education.length > 0 ? 0.5 : 0,
  }
}

export function extractSkills(text: string): { data: string[]; confidence: number } {
  const skills: Set<string> = new Set()

  const skillKeywords = [
    'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Go', 'Rust', 'Ruby', 'PHP',
    'React', 'Vue', 'Angular', 'Node.js', 'Express', 'Next.js', 'Django', 'Flask', 'Spring',
    'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Git', 'SQL', 'PostgreSQL', 'MongoDB',
    'Redis', 'GraphQL', 'REST', 'API', 'Machine Learning', 'AI', 'Data Science',
    'HTML', 'CSS', 'Tailwind', 'SASS', 'Linux', 'Agile', 'Scrum',
  ]

  for (const skill of skillKeywords) {
    if (text.includes(skill)) {
      skills.add(skill)
    }
  }

  return {
    data: Array.from(skills),
    confidence: skills.size > 0 ? 0.7 : 0,
  }
}

function extractLocation(text: string): string {
  const cityStateRegex = /([A-Z][a-z]+(?:\s[A-Z][a-z]+)?),\s*([A-Z]{2})/
  const match = text.match(cityStateRegex)
  return match ? `${match[1]}, ${match[2]}` : ''
}

function normalizeDate(dateStr: string): string {
  // Convert "Jan 2020" to "2020-01"
  const months: Record<string, string> = {
    jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
    jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12',
  }

  const match = dateStr.match(/(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s*(\d{4})/i)
  if (match) {
    const month = months[match[1].toLowerCase().slice(0, 3)]
    return `${match[2]}-${month}`
  }

  return dateStr
}

function extractInstitution(text: string): string {
  const universities = [
    'University', 'College', 'Institute', 'School',
    'MIT', 'Stanford', 'Harvard', 'Yale', 'Princeton',
  ]

  for (const u of universities) {
    if (text.includes(u)) {
      return text
    }
  }

  return ''
}

function extractYear(text: string): string | undefined {
  const match = text.match(/\d{4}/)
  return match?.[0]
}
