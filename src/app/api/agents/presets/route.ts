import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { DEFAULT_PRESETS, getPreset, getDefaultPreset } from '@/lib/agents/presets'

export async function GET() {
  return NextResponse.json({
    presets: DEFAULT_PRESETS,
    defaultPreset: getDefaultPreset().id,
  })
}
