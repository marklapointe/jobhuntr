import { Page } from 'playwright'
import { browserPool } from '@/lib/browser/pool'

export type ApplicationStatus = 
  | 'SAVED'
  | 'APPLIED'
  | 'IN_REVIEW'
  | 'INTERVIEW'
  | 'OFFER'
  | 'REJECTED'
  | 'WITHDRAWN'

export interface StatusCheckResult {
  status: ApplicationStatus
  lastChecked: Date
  details?: string
}

const STATUS_INDICATORS: Record<ApplicationStatus, string[]> = {
  SAVED: ['saved', 'draft'],
  APPLIED: ['applied', 'submitted', 'application received'],
  IN_REVIEW: ['under review', 'in review', 'being reviewed', 'screening'],
  INTERVIEW: ['interview', 'phone screen', 'technical interview', 'onsite', 'loop'],
  OFFER: ['offer', 'congratulations', 'extend'],
  REJECTED: ['not moving forward', 'not selected', 'rejected', 'decined'],
  WITHDRAWN: ['withdrawn', 'withdraw'],
}

export async function checkApplicationStatus(jobUrl: string): Promise<StatusCheckResult> {
  const pooled = await browserPool.acquire()
  
  try {
    const { page } = pooled
    await page.goto(jobUrl, { waitUntil: 'networkidle', timeout: 30000 })
    
    const pageText = await page.textContent('body')
    const pageTitle = await page.title()
    
    const combinedText = `${pageTitle} ${pageText}`.toLowerCase()
    
    for (const [status, indicators] of Object.entries(STATUS_INDICATORS)) {
      for (const indicator of indicators) {
        if (combinedText.includes(indicator)) {
          return {
            status: status as ApplicationStatus,
            lastChecked: new Date(),
            details: `Found indicator: "${indicator}"`,
          }
        }
      }
    }
    
    return {
      status: 'APPLIED',
      lastChecked: new Date(),
      details: 'No status indicators found, assuming applied',
    }
  } catch (error) {
    return {
      status: 'APPLIED',
      lastChecked: new Date(),
      details: `Error checking status: ${error}`,
    }
  } finally {
    browserPool.release(pooled)
  }
}