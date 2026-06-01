import { normalizeJob, CanonicalJob } from './canonical'

const GREENHOUSE_API = 'https://boards-api.greenhouse.io/v1/boards'

export interface GreenhouseJob {
  id: number
  title: string
  updated_at: string
  location: { name: string }
  content: string
  absolute_url: string
  departments: { name: string }[]
  offices: { name: string }[]
}

export async function fetchGreenhouseJobs(boardToken: string): Promise<CanonicalJob[]> {
  try {
    const response = await fetch(`${GREENHOUSE_API}/${boardToken}/jobs?content=true`)
    if (!response.ok) throw new Error(`Greenhouse API error: ${response.status}`)

    const data = await response.json()
    const jobs: CanonicalJob[] = []

    for (const job of data.jobs || []) {
      jobs.push(normalizeJob({
        source: 'greenhouse',
        sourceUrl: job.absolute_url,
        url: job.absolute_url,
        title: job.title,
        company: boardToken,
        location: job.location?.name,
        description: stripHtml(job.content || ''),
        atsSource: 'greenhouse',
      }))
    }

    return jobs
  } catch (error) {
    console.error('Error fetching Greenhouse jobs:', error)
    return []
  }
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}
