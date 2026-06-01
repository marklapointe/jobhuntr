import { AgentTask, AgentType } from './types'
import { AgentGraphState, createInitialState, shouldContinue } from './state'
import { executeAgent } from './router'
import { prisma } from '@/lib/prisma'

export interface OrchestrateOptions {
  userId: string
  agentType: AgentType
  input: Record<string, unknown>
}

export async function orchestrate(options: OrchestrateOptions): Promise<AgentGraphState> {
  const { userId, agentType, input } = options

  const task = await prisma.agentConfig.create({
    data: {
      userId,
      agentType,
      config: input as object,
      isActive: true,
    },
  })

  let state = createInitialState({
    id: task.id,
    type: agentType,
    status: 'INITIATED',
    input,
    createdAt: new Date(),
    updatedAt: new Date(),
  })

  while (shouldContinue(state)) {
    state = await executeAgent(state)
  }

  await prisma.agentConfig.update({
    where: { id: task.id },
    data: {
      config: { ...input, ...state.context } as object,
    },
  })

  return state
}

export async function getAgentStatus(taskId: string): Promise<AgentGraphState | null> {
  const task = await prisma.agentConfig.findUnique({
    where: { id: taskId },
  })

  if (!task) return null

  return createInitialState({
    id: task.id,
    type: task.agentType as AgentType,
    status: task.isActive ? 'IN_PROGRESS' : 'COMPLETE',
    input: task.config as Record<string, unknown>,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
  })
}
