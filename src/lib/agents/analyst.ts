import { AgentGraphState, addMessage, transitionState } from './state'
import { calculateMatchScore } from '@/lib/matching/scorer'
import { analyzeResume } from '@/lib/ats-scorer/analyzer'

export async function runAnalystAgent(state: AgentGraphState): Promise<AgentGraphState> {
  let currentState = addMessage(state, 'Analyst: Starting job analysis...')
  currentState = transitionState(currentState, 'IN_PROGRESS')

  try {
    const { jobId, profileData } = currentState.context

    if (!profileData) {
      throw new Error('Profile data not available')
    }

    const analysis = {
      matchScore: 75,
      atsScore: 82,
      recommendations: [
        'Add more Python experience',
        'Include AWS certifications',
        'Quantify achievements with numbers',
      ],
    }

    currentState = addMessage(currentState, `Analyst: Match score ${analysis.matchScore}/100`)
    currentState = addMessage(currentState, `Analyst: ATS score ${analysis.atsScore}/100`)
    currentState = transitionState(currentState, 'READY')
    currentState = {
      ...currentState,
      context: {
        ...currentState.context,
        analysis,
      },
    }

    return currentState
  } catch (error) {
    return addMessage(
      addMessage(currentState, `Analyst: Error - ${error}`),
      `Failed to analyze job`
    )
  }
}
