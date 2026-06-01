export interface AgentPreset {
  id: string
  name: string
  description: string
  config: AgentBehaviorConfig
}

export interface AgentBehaviorConfig {
  // Scout settings
  scout: {
    maxJobsPerSearch: number
    preferredSources: string[]
    ignoreDuplicateJobs: boolean
  }
  // Analyst settings
  analyst: {
    minMatchScore: number
    minAtsScore: number
    autoRejectBelowScore: number
  }
  // Writer settings
  writer: {
    tailoringLevel: 'minimal' | 'standard' | 'aggressive'
    includeCoverLetter: boolean
    highlightQuantifiers: boolean
  }
  // Applier settings
  applier: {
    autoSubmit: boolean
    requireConfirmation: boolean
    captchaHandling: 'skip' | 'flag' | 'solve'
    maxApplicationsPerDay: number
  }
  // Tracker settings
  tracker: {
    checkFrequencyHours: number
    notifyOnStatusChange: boolean
  }
}

export const DEFAULT_PRESETS: AgentPreset[] = [
  {
    id: 'conservative',
    name: 'Conservative',
    description: 'Careful approach with maximum user control',
    config: {
      scout: { maxJobsPerSearch: 5, preferredSources: ['greenhouse', 'lever'], ignoreDuplicateJobs: true },
      analyst: { minMatchScore: 60, minAtsScore: 70, autoRejectBelowScore: 50 },
      writer: { tailoringLevel: 'minimal', includeCoverLetter: false, highlightQuantifiers: true },
      applier: { autoSubmit: false, requireConfirmation: true, captchaHandling: 'flag', maxApplicationsPerDay: 5 },
      tracker: { checkFrequencyHours: 24, notifyOnStatusChange: true },
    },
  },
  {
    id: 'balanced',
    name: 'Balanced',
    description: 'Moderate automation with reasonable safeguards',
    config: {
      scout: { maxJobsPerSearch: 10, preferredSources: ['greenhouse', 'lever', 'ashby'], ignoreDuplicateJobs: true },
      analyst: { minMatchScore: 70, minAtsScore: 75, autoRejectBelowScore: 60 },
      writer: { tailoringLevel: 'standard', includeCoverLetter: true, highlightQuantifiers: true },
      applier: { autoSubmit: false, requireConfirmation: true, captchaHandling: 'flag', maxApplicationsPerDay: 10 },
      tracker: { checkFrequencyHours: 12, notifyOnStatusChange: true },
    },
  },
  {
    id: 'aggressive',
    name: 'Aggressive',
    description: 'Maximum automation for high volume',
    config: {
      scout: { maxJobsPerSearch: 20, preferredSources: ['greenhouse', 'lever', 'ashby', 'workday'], ignoreDuplicateJobs: true },
      analyst: { minMatchScore: 65, minAtsScore: 70, autoRejectBelowScore: 55 },
      writer: { tailoringLevel: 'aggressive', includeCoverLetter: true, highlightQuantifiers: true },
      applier: { autoSubmit: true, requireConfirmation: false, captchaHandling: 'solve', maxApplicationsPerDay: 20 },
      tracker: { checkFrequencyHours: 6, notifyOnStatusChange: true },
    },
  },
]

export function getPreset(id: string): AgentPreset | undefined {
  return DEFAULT_PRESETS.find(p => p.id === id)
}

export function getDefaultPreset(): AgentPreset {
  return DEFAULT_PRESETS[1] // balanced
}
