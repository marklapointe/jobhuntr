import { fillApplicationForm, FormField } from './form-filler'

interface ProfileData {
  firstName: string
  lastName: string
  email: string
  phone?: string
  linkedin?: string
  github?: string
  website?: string
}

const GREENHOUSE_QUESTION_IDS = {
  firstName: 'first_name',
  lastName: 'last_name',
  email: 'email',
  phone: 'phone',
  linkedin: 'linkedin_url',
  github: 'github_url',
  website: 'website',
  resume: 'resume',
  coverLetter: 'cover_letter',
  salary: 'desired_salary',
  startDate: 'start_date',
  authorized: 'legally_authorized',
  sponsorship: 'need_sponsorship',
}

export async function fillGreenhouseForm(jobUrl: string, profileData: ProfileData): Promise<{ success: boolean; error?: string }> {
  const fields: FormField[] = [
    { name: 'first_name', value: profileData.firstName, type: 'text' },
    { name: 'last_name', value: profileData.lastName, type: 'text' },
    { name: 'email', value: profileData.email, type: 'email' },
  ]

  if (profileData.phone) {
    fields.push({ name: 'phone', value: profileData.phone, type: 'phone' })
  }
  if (profileData.linkedin) {
    fields.push({ name: 'linkedin_url', value: profileData.linkedin, type: 'text' })
  }
  if (profileData.github) {
    fields.push({ name: 'github_url', value: profileData.github, type: 'text' })
  }

  return fillApplicationForm({ atsType: 'greenhouse', jobUrl, fields })
}
