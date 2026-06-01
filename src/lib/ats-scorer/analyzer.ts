export interface AtsAnalysis {
  overallScore: number
  keywordDensity: KeywordDensity[]
  formatScore: number
  recencyScore: number
  quantifierScore: number
  suggestions: Suggestion[]
  warnings: string[]
}

export interface KeywordDensity {
  keyword: string
  count: number
  density: number
  position: number[]
}

export interface Suggestion {
  type: 'add' | 'remove' | 'improve'
  category: string
  message: string
  priority: 'high' | 'medium' | 'low'
}

export interface ResumeMetrics {
  text: string
  jobDescription?: string
  experience: { startDate?: string; endDate?: string }[]
  education: { startDate?: string; endDate?: string }[]
  skills: string[]
}

const STOP_WORDS = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'])

const QUANTIFIERS = [
  'led', 'managed', 'created', 'developed', 'implemented', 'improved',
  'increased', 'decreased', 'achieved', 'delivered', 'coordinated',
]

export function analyzeResume(metrics: ResumeMetrics): AtsAnalysis {
  const suggestions: Suggestion[] = []
  const warnings: string[] = []

  const keywordDensity = analyzeKeywordDensity(metrics.text, metrics.jobDescription)
  
  const hasStuffing = keywordDensity.some(k => k.density > 4.5)
  if (hasStuffing) {
    warnings.push('Keyword density exceeds 4.5% - may trigger ATS penalties')
  }

  const formatScore = calculateFormatScore(metrics.text)
  const recencyScore = calculateRecencyScore(metrics.experience)
  const quantifierScore = calculateQuantifierScore(metrics.text)

  const overallScore = Math.round(
    averageKeywordDensityScore(keywordDensity) * 0.35 +
    formatScore * 0.25 +
    recencyScore * 0.20 +
    quantifierScore * 0.20
  )

  if (formatScore < 70) {
    suggestions.push({
      type: 'improve',
      category: 'format',
      message: 'Add clear section headers and consistent formatting',
      priority: 'high',
    })
  }

  if (averageKeywordDensityScore(keywordDensity) < 60) {
    suggestions.push({
      type: 'add',
      category: 'keywords',
      message: 'Include more relevant keywords from the job description',
      priority: 'high',
    })
  }

  return {
    overallScore: Math.min(95, Math.max(0, overallScore)),
    keywordDensity,
    formatScore,
    recencyScore,
    quantifierScore,
    suggestions,
    warnings,
  }
}

function analyzeKeywordDensity(text: string, jobDescription?: string): KeywordDensity[] {
  const words = text.toLowerCase().split(/\s+/).filter(w => w.length > 2 && !STOP_WORDS.has(w))
  const totalWords = words.length
  
  if (!jobDescription) return []

  const jobWords = jobDescription.toLowerCase().split(/\s+/).filter(w => w.length > 2 && !STOP_WORDS.has(w))
  const jobWordCounts = new Map<string, number>()
  
  for (const word of jobWords) {
    jobWordCounts.set(word, (jobWordCounts.get(word) || 0) + 1)
  }

  const result: KeywordDensity[] = []
  
  for (const [keyword, count] of jobWordCounts) {
    const textCount = words.filter(w => w.includes(keyword) || keyword.includes(w)).length
    const density = totalWords > 0 ? (textCount / totalWords) * 100 : 0
    
    const positions: number[] = []
    words.forEach((w, i) => {
      if (w.includes(keyword) || keyword.includes(w)) {
        positions.push(i)
      }
    })
    
    result.push({
      keyword,
      count: textCount,
      density,
      position: positions.slice(0, 5),
    })
  }

  return result.sort((a, b) => b.density - a.density)
}

function averageKeywordDensityScore(densities: KeywordDensity[]): number {
  if (densities.length === 0) return 50
  
  const targetMin = 2.3
  const targetMax = 3.1
  
  let totalScore = 0
  for (const d of densities) {
    if (d.density >= targetMin && d.density <= targetMax) {
      totalScore += 100
    } else if (d.density < targetMin) {
      totalScore += (d.density / targetMin) * 100
    } else {
      totalScore += Math.max(0, 100 - (d.density - targetMax) * 20)
    }
  }
  
  return totalScore / densities.length
}

function calculateFormatScore(text: string): number {
  let score = 50
  
  const headers = /experience|education|skills|summary|objective|certifications/i
  const headerMatches = text.match(headers)
  if (headerMatches && headerMatches.length >= 3) score += 20
  
  const dateFormats = /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s+\d{4}\b/i
  const dateMatches = text.match(dateFormats)
  if (dateMatches && dateMatches.length >= 2) score += 15
  
  if (text.includes('•') || text.includes('-') || text.includes('*')) score += 15
  
  return Math.min(100, score)
}

function calculateRecencyScore(experience: { startDate?: string; endDate?: string }[]): number {
  if (!experience || experience.length === 0) return 50
  
  const currentYear = new Date().getFullYear()
  let totalWeight = 0
  let weightedScore = 0
  
  for (const exp of experience) {
    const endYear = exp.endDate ? new Date(exp.endDate).getFullYear() : currentYear
    const yearsAgo = currentYear - endYear
    
    let weight = 1.0
    if (yearsAgo <= 2) weight = 1.0
    else if (yearsAgo <= 5) weight = 0.7
    else if (yearsAgo <= 10) weight = 0.4
    else weight = 0.2
    
    totalWeight += weight
    weightedScore += weight * (100 - yearsAgo * 5)
  }
  
  return totalWeight > 0 ? weightedScore / totalWeight : 50
}

function calculateQuantifierScore(text: string): number {
  const words = text.toLowerCase().split(/\s+/)
  let quantifierCount = 0
  
  for (const word of words) {
    if (QUANTIFIERS.some(q => word.includes(q))) {
      quantifierCount++
    }
  }
  
  if (quantifierCount >= 3 && quantifierCount <= 6) return 100
  if (quantifierCount < 3) return 50 + (quantifierCount * 15)
  return Math.max(50, 100 - (quantifierCount - 6) * 10)
}
