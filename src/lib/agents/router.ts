import { AgentGraphState } from './state'
import { AgentType } from './types'
import { runScoutAgent } from './scouter'
import { runAnalystAgent } from './analyst'

export type AgentExecutor = (state: AgentGraphState) => Promise<AgentGraphState>

const agentExecutors: Record<AgentType, AgentExecutor> = {
  scout: runScoutAgent,
  analyst: runAnalystAgent,
  writer: async (state) => state,
  applier: async (state) => state,
  tracker: async (state) => state,
  email: async (state) => state,
}

export async function executeAgent(state: AgentGraphState): Promise<AgentGraphState> {
  const agentType = state.task.type as AgentType
  const executor = agentExecutors[agentType]

  if (!executor) {
    throw new Error(`Unknown agent type: ${agentType}`)
  }

  return executor(state)
}

export function shouldContinue(state: AgentGraphState): boolean {
  return state.status !== 'COMPLETE' && state.status !== 'FAILED'
}
