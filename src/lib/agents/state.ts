import { AgentState, AgentTask } from './types'

export interface AgentGraphState {
  currentAgent: string
  status: AgentState
  task: AgentTask
  context: Record<string, unknown>
  messages: string[]
  errors: string[]
}

export function createInitialState(task: AgentTask): AgentGraphState {
  return {
    currentAgent: task.type,
    status: 'INITIATED',
    task,
    context: {},
    messages: [],
    errors: [],
  }
}

export function updateState(
  state: AgentGraphState,
  updates: Partial<AgentGraphState>
): AgentGraphState {
  return { ...state, ...updates }
}

export function addMessage(state: AgentGraphState, message: string): AgentGraphState {
  return {
    ...state,
    messages: [...state.messages, message],
  }
}

export function addError(state: AgentGraphState, error: string): AgentGraphState {
  return {
    ...state,
    errors: [...state.errors, error],
    status: 'FAILED',
  }
}

export function transitionState(state: AgentGraphState, newStatus: AgentState): AgentGraphState {
  return {
    ...state,
    status: newStatus,
    task: { ...state.task, status: newStatus, updatedAt: new Date() },
  }
}

export function shouldContinue(state: AgentGraphState): boolean {
  return state.status !== 'COMPLETE' && state.status !== 'FAILED'
}
