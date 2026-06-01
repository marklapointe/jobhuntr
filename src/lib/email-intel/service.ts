import { Email, EmailProvider, EmailMetadata, EmailStatus } from './provider'
import { detectStatus, DetectionResult } from './detector'

export interface EmailSummary {
  id: string
  subject: string
  from: string
  date: Date
  snippet: string
  detectedStatus: EmailStatus
  confidence: number
}

export interface StatusChangeNotification {
  userId: string
  emailId: string
  previousStatus: EmailStatus | null
  newStatus: EmailStatus
  confidence: number
  subject: string
  from: string
  timestamp: Date
}

export interface CheckUpdatesResult {
  newEmails: number
  statusChanges: StatusChangeNotification[]
  errors: string[]
}

class EmailIntelligenceService {
  private providers: Map<string, EmailProvider> = new Map()
  private lastCheckTimestamps: Map<string, Date> = new Map()

  async registerProvider(userId: string, provider: EmailProvider): Promise<void> {
    await provider.connect()
    this.providers.set(userId, provider)
  }

  async unregisterProvider(userId: string): Promise<void> {
    const provider = this.providers.get(userId)
    if (provider) {
      await provider.disconnect()
      this.providers.delete(userId)
    }
  }

  async checkForUpdates(userId: string): Promise<CheckUpdatesResult> {
    const provider = this.providers.get(userId)
    if (!provider) {
      return {
        newEmails: 0,
        statusChanges: [],
        errors: [`No provider registered for user ${userId}`],
      }
    }

    const result: CheckUpdatesResult = {
      newEmails: 0,
      statusChanges: [],
      errors: [],
    }

    try {
      const lastCheck = this.lastCheckTimestamps.get(userId)
      const emails = await provider.getEmails({
        after: lastCheck,
        limit: 50,
      })

      result.newEmails = emails.length

      for (const email of emails) {
        const detection = detectStatus(email)
        
        if (detection.status !== 'UNKNOWN') {
          const notification: StatusChangeNotification = {
            userId,
            emailId: email.id,
            previousStatus: null,
            newStatus: detection.status,
            confidence: detection.confidence,
            subject: email.subject,
            from: email.from,
            timestamp: new Date(),
          }
          result.statusChanges.push(notification)
        }
      }

      this.lastCheckTimestamps.set(userId, new Date())
    } catch (error) {
      result.errors.push(`Error checking updates: ${error}`)
    }

    return result
  }

  detectStatusFromEmail(email: Email): DetectionResult {
    return detectStatus(email)
  }

  async sendNotification(
    userId: string,
    notification: StatusChangeNotification
  ): Promise<void> {
    const notificationPayload = {
      userId,
      title: this.getNotificationTitle(notification.newStatus),
      body: this.getNotificationBody(notification),
      data: {
        type: 'email_status_change',
        emailId: notification.emailId,
        status: notification.newStatus,
        confidence: notification.confidence,
      },
    }

    console.log(`[EmailIntel] Sending notification to user ${userId}:`, notificationPayload)
  }

  private getNotificationTitle(status: EmailStatus): string {
    switch (status) {
      case 'INTERVIEW':
        return 'Interview Request!'
      case 'OFFER':
        return 'Job Offer Received!'
      case 'REJECTION':
        return 'Application Update'
      default:
        return 'Email Status Update'
    }
  }

  private getNotificationBody(notification: StatusChangeNotification): string {
    switch (notification.newStatus) {
      case 'INTERVIEW':
        return `You have a new interview request from ${notification.from}`
      case 'OFFER':
        return `Great news! You received a job offer from ${notification.from}`
      case 'REJECTION':
        return `You received an update on your application at ${notification.from}`
      default:
        return `New update from ${notification.from}: ${notification.subject}`
    }
  }

  async getEmailSummary(userId: string, limit = 10): Promise<EmailSummary[]> {
    const provider = this.providers.get(userId)
    if (!provider) {
      return []
    }

    try {
      const emails = await provider.getEmails({ limit })
      
      return emails.map((email) => {
        const detection = detectStatus(email)
        return {
          id: email.id,
          subject: email.subject,
          from: email.from,
          date: email.date,
          snippet: email.snippet,
          detectedStatus: detection.status,
          confidence: detection.confidence,
        }
      })
    } catch (error) {
      console.error(`Error getting email summary for user ${userId}:`, error)
      return []
    }
  }

  async getEmailMetadata(userId: string, emailId: string): Promise<EmailMetadata | null> {
    const provider = this.providers.get(userId)
    if (!provider) {
      return null
    }

    try {
      return await provider.getEmailMetadata(emailId)
    } catch (error) {
      console.error(`Error getting email metadata for ${emailId}:`, error)
      return null
    }
  }
}

export const emailIntelService = new EmailIntelligenceService()
