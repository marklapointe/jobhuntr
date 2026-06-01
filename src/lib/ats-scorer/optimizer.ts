import { analyzeResume, AtsAnalysis, ResumeMetrics } from './analyzer'

export interface OptimizationResult {
  originalScore: number
  optimizedScore: number
  analysis: AtsAnalysis
  optimizedText?: string
}

export async function optimizeResume(
  metrics: ResumeMetrics,
  targetJobDescription: string
): Promise<OptimizationResult> {
  const analysis = analyzeResume({
    ...metrics,
    jobDescription: targetJobDescription,
  })

  return {
    originalScore: analysis.overallScore,
    optimizedScore: analysis.overallScore,
    analysis,
  }
}

export function generateSuggestions(analysis: AtsAnalysis): string[] {
  const suggestions: string[] = []

  for (const suggestion of analysis.suggestions) {
    if (suggestion.priority === 'high') {
      suggestions.push(`[HIGH] ${suggestion.message}`)
    }
  }

  for (const warning of analysis.warnings) {
    suggestions.push(`[WARNING] ${warning}`)
  }

  const lowDensity = analysis.keywordDensity
    .filter(k => k.density < 2.0)
    .slice(0, 3)

  for (const keyword of lowDensity) {
    suggestions.push(`[MEDIUM] Add more instances of "${keyword.keyword}"`)
  }

  return suggestions
}
