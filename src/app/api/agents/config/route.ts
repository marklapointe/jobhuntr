import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { getUserAgentConfig, setUserAgentPreset, updateAgentOverride } from '@/lib/agents/configurator'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const config = await getUserAgentConfig(session.user.id, 'applier' as any)
  return NextResponse.json({ config })
}

export async function PUT(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { presetId, overrides } = await req.json()

  if (presetId) {
    await setUserAgentPreset(session.user.id, presetId, overrides)
  } else if (overrides) {
    for (const [agentType, config] of Object.entries(overrides)) {
      await updateAgentOverride(session.user.id, agentType as any, config as any)
    }
  }

  const config = await getUserAgentConfig(session.user.id, 'applier' as any)
  return NextResponse.json({ config })
}
