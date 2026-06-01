import { fillApplicationForm, FormField } from './form-filler'

export async function fillLeverForm(jobUrl: string, profileData: {
  firstName: string
  lastName: string
  email: string
  phone?: string
  linkedin?: string
}): Promise<{ success: boolean; error?: string }> {
  const fields: FormField[] = [
    { name: 'name', value: `${profileData.firstName} ${profileData.lastName}`, type: 'text' },
    { name: 'email', value: profileData.email, type: 'email' },
  ]

  if (profileData.phone) {
    fields.push({ name: 'phone', value: profileData.phone, type: 'phone' })
  }
  if (profileData.linkedin) {
    fields.push({ name: 'urls[linkedin]', value: profileData.linkedin, type: 'text' })
  }

  return fillApplicationForm({ atsType: 'lever', jobUrl, fields })
}
