import { prisma } from '@/lib/prisma'
import { AgentBehaviorConfig, AgentPreset, getPreset, getDefaultPreset } from './presets'
import { AgentType } from './types'

export async function getUserAgentConfig(userId: string, agentType: AgentType): Promise<AgentBehaviorConfig> {
  const userPreset = await prisma.agentConfig.findFirst({
    where: { userId, agentType: 'preset' },
  })

  if (userPreset?.config) {
    const config = userPreset.config as unknown as { presetId?: string; overrides?: Partial<AgentBehaviorConfig> }
    if (config.presetId) {
      const preset = getPreset(config.presetId)
      if (preset) {
        return { ...preset.config, ...config.overrides }
      }
    }
  }

  return getDefaultPreset().config
}

export async function setUserAgentPreset(
  userId: string,
  presetId: string,
  overrides?: Partial<AgentBehaviorConfig>
): Promise<void> {
  await prisma.agentConfig.upsert({
    where: { id: `${userId}-preset` },
    create: {
      id: `${userId}-preset`,
      userId,
      agentType: 'preset',
      config: { presetId, overrides } as object,
      isActive: true,
    },
    update: {
      config: { presetId, overrides } as object,
    },
  })
}

export async function updateAgentOverride<T extends keyof AgentBehaviorConfig>(
  userId: string,
  agentType: T,
  overrides: Partial<AgentBehaviorConfig[T]>
): Promise<void> {
  const existing = await prisma.agentConfig.findFirst({
    where: { userId, agentType: 'preset' },
  })

  const config = existing?.config as unknown as { presetId?: string; overrides?: Partial<AgentBehaviorConfig> } || {}
  
  const newOverrides = {
    ...config.overrides,
    [agentType]: {
      ...config.overrides?.[agentType],
      ...overrides,
    },
  }

  await prisma.agentConfig.upsert({
    where: { id: `${userId}-preset` },
    create: {
      id: `${userId}-preset`,
      userId,
      agentType: 'preset',
      config: { presetId: config.presetId || 'balanced', overrides: newOverrides } as object,
      isActive: true,
    },
    update: {
      config: { presetId: config.presetId || 'balanced', overrides: newOverrides } as object,
    },
  })
}
