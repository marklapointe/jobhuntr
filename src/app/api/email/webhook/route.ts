import { NextRequest, NextResponse } from 'next/server'
import { emailIntelService } from '@/lib/email-intel/service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, emailData, provider } = body

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    if (!emailData) {
      return NextResponse.json({ error: 'emailData is required' }, { status: 400 })
    }

    console.log(`[Webhook] Received email webhook for user ${userId} from ${provider}`)

    const result = await emailIntelService.checkForUpdates(userId)

    if (result.statusChanges.length > 0) {
      for (const change of result.statusChanges) {
        await emailIntelService.sendNotification(userId, change)
      }
    }

    return NextResponse.json({
      success: true,
      processed: emailData.id || 'unknown',
      statusChanges: result.statusChanges.length,
      newEmails: result.newEmails,
    })
  } catch (error) {
    console.error('[Webhook] Error processing email webhook:', error)
    return NextResponse.json(
      { error: 'Failed to process webhook', details: String(error) },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const token = searchParams.get('token')

  const expectedToken = process.env.EMAIL_WEBHOOK_SECRET
  if (expectedToken && token !== expectedToken) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
  }

  return NextResponse.json({
    status: 'ok',
    endpoint: 'email-webhook',
    supportedMethods: ['POST'],
  })
}
