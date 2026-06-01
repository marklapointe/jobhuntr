import { Page } from 'playwright'

export interface FormState {
  currentStep: number
  totalSteps: number
  filledFields: Record<string, string>
  uploadedFiles: string[]
  errors: string[]
}

export interface SessionRecoveryData {
  sessionId: string
  formState: FormState
  lastSavedAt: Date
  jobUrl: string
}

export class SessionRecovery {
  private recoveryData: Map<string, SessionRecoveryData> = new Map()

  async saveFormState(sessionId: string, page: Page, formState: Partial<FormState>): Promise<void> {
    const existing = this.recoveryData.get(sessionId)
    
    this.recoveryData.set(sessionId, {
      sessionId,
      formState: {
        ...existing?.formState,
        ...formState,
        lastSavedAt: new Date(),
      } as FormState,
      lastSavedAt: new Date(),
      jobUrl: page.url(),
    })
  }

  async recoverFormState(sessionId: string): Promise<SessionRecoveryData | null> {
    return this.recoveryData.get(sessionId) || null
  }

  async isJobStillOpen(sessionId: string): Promise<boolean> {
    const data = this.recoveryData.get(sessionId)
    if (!data) return false

    // Check if job posting is still active (simple check)
    // In production, would verify with actual ATS
    return true
  }

  clearRecoveryData(sessionId: string): void {
    this.recoveryData.delete(sessionId)
  }
}

export const sessionRecovery = new SessionRecovery()
