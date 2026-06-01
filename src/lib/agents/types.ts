export type AgentType = 'scout' | 'analyst' | 'writer' | 'applier' | 'tracker' | 'email'

export type AgentState = 
  | 'INITIATED'
  | 'ANALYSIS'
  | 'READY'
  | 'IN_PROGRESS'
  | 'COMPLETE'
  | 'FAILED'

export interface AgentMessage {
  id: string
  agentType: AgentType
  content: string
  timestamp: Date
  from: 'user' | 'agent' | 'system'
}

export interface AgentTask {
  id: string
  type: AgentType
  status: AgentState
  input: Record<string, unknown>
  output?: Record<string, unknown>
  error?: string
  createdAt: Date
  updatedAt: Date
}

export interface ScoutOutput {
  discoveredJobs: string[]
  searchQuery: string
}

export interface AnalystOutput {
  matchScore: number
  atsScore: number
  recommendations: string[]
}

export interface WriterOutput {
  tailoredResume?: string
  coverLetter?: string
}

export interface ApplierOutput {
  applicationUrl: string
  submittedAt: Date
  confirmationNumber?: string
}

export interface TrackerOutput {
  status: string
  lastChecked: Date
  changes: string[]
}
