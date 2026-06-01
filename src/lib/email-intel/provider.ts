export type EmailStatus = 'INTERVIEW' | 'REJECTION' | 'OFFER' | 'APPLICATION' | 'UNKNOWN'

export interface Email {
  id: string
  providerId: string
  userId: string
  subject: string
  from: string
  to: string[]
  date: Date
  body: string
  bodyHtml?: string
  snippet: string
  labels?: string[]
  threadId?: string
}

export interface EmailMetadata {
  emailId: string
  provider: 'gmail' | 'outlook' | 'other'
  messageId: string
  threadId?: string
  labels?: string[]
  isRead: boolean
  isArchived: boolean
}

export interface EmailProvider {
  connect(): Promise<void>
  disconnect(): Promise<void>
  getEmails(options: { after?: Date; limit?: number }): Promise<Email[]>
  getEmailMetadata(emailId: string): Promise<EmailMetadata>
}

export interface GmailProviderConfig {
  accessToken: string
  refreshToken?: string
  clientId: string
  clientSecret: string
}

export interface OutlookProviderConfig {
  accessToken: string
  refreshToken?: string
  clientId: string
  clientSecret: string
  tenantId?: string
}

export type EmailProviderConfig = GmailProviderConfig | OutlookProviderConfig
