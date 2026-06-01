export interface ContactInfo {
  name: string
  email: string
  phone: string
  location: string
}

export interface Experience {
  company: string
  title: string
  startDate: string
  endDate?: string
  current: boolean
  description: string
}

export interface Education {
  institution: string
  degree: string
  field?: string
  startDate: string
  endDate?: string
}

export interface Skill {
  name: string
  level?: string
}

export interface ParseResult {
  contact: { data: ContactInfo; confidence: number }
  experience: { data: Experience[]; confidence: number }
  education: { data: Education[]; confidence: number }
  skills: { data: string[]; confidence: number }
  rawText: string
  overallConfidence: number
}

export type FileType = 'pdf' | 'docx' | 'txt' | 'html' | 'image'
