import { Email, EmailStatus } from './provider'

interface DetectionRule {
  status: EmailStatus
  keywords: string[]
  weight: number
  requireAll?: boolean
}

const DETECTION_RULES: DetectionRule[] = [
  {
    status: 'INTERVIEW',
    keywords: [
      'interview',
      'schedule',
      'available',
      'meeting',
      'call',
      'phone screen',
      'technical interview',
      'onsite',
      'zoom',
      'google meet',
      'teams meeting',
      'video call',
      'availability',
    ],
    weight: 1.0,
  },
  {
    status: 'REJECTION',
    keywords: [
      'thank you for applying',
      'thank you for your interest',
      'decided to move forward',
      'other candidates',
      'not moving forward',
      'not selected',
      'rejected',
      'have decided',
      'went with another',
      'position has been filled',
    ],
    weight: 1.0,
  },
  {
    status: 'OFFER',
    keywords: [
      'offer',
      'compensation',
      'start date',
      'welcome to the team',
      'congratulations',
      'pleased to extend',
      'offer letter',
      'benefits',
      'salary',
      'relocation',
    ],
    weight: 1.0,
  },
  {
    status: 'APPLICATION',
    keywords: [
      'application received',
      'application submitted',
      'we received your application',
      'confirming receipt',
      'thank you for submitting',
      'resume received',
    ],
    weight: 0.8,
  },
]

export interface DetectionResult {
  status: EmailStatus
  confidence: number
  matchedKeywords: string[]
  reasoning: string
}

export function detectStatus(email: Email): DetectionResult {
  const { subject, body } = email
  const combinedText = `${subject} ${body}`.toLowerCase()

  const results: DetectionResult[] = DETECTION_RULES.map((rule) => {
    const matchedKeywords: string[] = []
    
    for (const keyword of rule.keywords) {
      if (combinedText.includes(keyword.toLowerCase())) {
        matchedKeywords.push(keyword)
      }
    }

    const meetsThreshold = rule.requireAll
      ? matchedKeywords.length === rule.keywords.length
      : matchedKeywords.length > 0

    if (!meetsThreshold) {
      return {
        status: rule.status,
        confidence: 0,
        matchedKeywords: [],
        reasoning: `No keywords matched for ${rule.status}`,
      }
    }

    const confidence = Math.min(matchedKeywords.length / rule.keywords.length, 1) * rule.weight

    return {
      status: rule.status,
      confidence,
      matchedKeywords,
      reasoning: `Matched ${matchedKeywords.length} keyword(s) for ${rule.status}: ${matchedKeywords.join(', ')}`,
    }
  })

  const validResults = results.filter((r) => r.confidence > 0)
  validResults.sort((a, b) => b.confidence - a.confidence)

  if (validResults.length === 0) {
    return {
      status: 'UNKNOWN',
      confidence: 0,
      matchedKeywords: [],
      reasoning: 'No status indicators found in email',
    }
  }

  const bestResult = validResults[0]
  
  if (bestResult.confidence < 0.2) {
    return {
      status: 'UNKNOWN',
      confidence: 0,
      matchedKeywords: [],
      reasoning: 'Confidence below threshold',
    }
  }

  return bestResult
}

export function detectStatusFromText(text: string): DetectionResult {
  const fakeEmail: Email = {
    id: 'temp',
    providerId: 'temp',
    userId: 'temp',
    subject: '',
    from: '',
    to: [],
    date: new Date(),
    body: text,
    snippet: text.substring(0, 200),
  }
  return detectStatus(fakeEmail)
}
