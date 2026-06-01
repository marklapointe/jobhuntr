import { normalizeJob, CanonicalJob } from './canonical'

const LEVER_API = 'https://api.lever.co/v0'

export async function fetchLeverJobs(companyId: string): Promise<CanonicalJob[]> {
  try {
    const response = await fetch(`${LEVER_API}/postings/${companyId}?mode=json`)
    if (!response.ok) throw new Error(`Lever API error: ${response.status}`)

    const data = await response.json()
    const jobs: CanonicalJob[] = []

    for (const job of data || []) {
      jobs.push(normalizeJob({
        source: 'lever',
        sourceUrl: job.hostedUrl,
        url: job.hostedUrl,
        title: job.text,
        company: job.company,
        location: job.location,
        description: [job.description, job.lists].flat().join('\n'),
        atsSource: 'lever',
      }))
    }

    return jobs
  } catch (error) {
    console.error('Error fetching Lever jobs:', error)
    return []
  }
}
