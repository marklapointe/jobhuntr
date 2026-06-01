import { AgentGraphState, addMessage, transitionState } from './state'
import { prisma } from '@/lib/prisma'

export async function runScoutAgent(state: AgentGraphState): Promise<AgentGraphState> {
  let currentState = addMessage(state, 'Scout: Starting job discovery...')
  currentState = transitionState(currentState, 'IN_PROGRESS')

  try {
    const { keywords, locations, sources } = currentState.context as { keywords?: string[]; locations?: string[]; sources?: string[] }
    
    const jobs = await prisma.job.findMany({
      where: {
        ...(sources?.length && { source: { in: sources as string[] } }),
      },
      take: 20,
      orderBy: { fetchedAt: 'desc' },
    })

    const jobIds = jobs.map(j => j.id)
    
    currentState = addMessage(currentState, `Scout: Found ${jobIds.length} jobs`)
    currentState = transitionState(currentState, 'COMPLETE')
    currentState = {
      ...currentState,
      context: {
        ...currentState.context,
        discoveredJobs: jobIds as string[],
      },
    }

    return currentState
  } catch (error) {
    return addMessage(
      addMessage(currentState, `Scout: Error - ${error}`),
      `Failed to discover jobs`
    )
  }
}
