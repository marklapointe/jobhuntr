import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { orchestrate } from '@/lib/agents/orchestrator'
import { AgentType } from '@/lib/agents/types'

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { agentType, input } = await req.json()

  if (!agentType || !input) {
    return NextResponse.json({ error: 'agentType and input required' }, { status: 400 })
  }

  try {
    const state = await orchestrate({
      userId: session.user.id,
      agentType: agentType as AgentType,
      input,
    })

    return NextResponse.json({
      taskId: state.task.id,
      status: state.status,
      output: state.context,
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Agent execution failed' },
      { status: 500 }
    )
  }
}
