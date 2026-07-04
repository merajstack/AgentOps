import { NextResponse } from 'next/server'

// Allow cross-origin calls (same-site Next.js app calling its own API)
export async function OPTIONS() {
  return NextResponse.json({}, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const name = body?.name?.trim()
    const email = body?.email?.trim()

    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email are required.' }, { status: 400 })
    }

    const webhookUrl =
      process.env.NEXT_PUBLIC_MAIN_OTP_WEBHOOK_URL ||
      'https://workflow.ccbp.in/webhook/main-otp'

    console.log('[send-otp] Calling webhook:', webhookUrl, '| email:', email)

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 15000) // 15s timeout

    let response: Response
    try {
      response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, timestamp: new Date().toISOString() }),
        signal: controller.signal,
      })
    } finally {
      clearTimeout(timeout)
    }

    console.log('[send-otp] Webhook status:', response.status)

    if (!response.ok) {
      const errText = await response.text().catch(() => '')
      throw new Error(`Webhook responded with status ${response.status}: ${errText}`)
    }

    const contentType = response.headers.get('content-type') || ''
    let otp = ''

    if (contentType.includes('application/json')) {
      const data = await response.json()
      otp = String(data.otp || data.code || '')
    } else {
      otp = (await response.text()).trim()
    }

    console.log('[send-otp] OTP received successfully, length:', otp.length)

    return NextResponse.json({ otp: otp.trim() })
  } catch (err: any) {
    const msg = err?.name === 'AbortError'
      ? 'OTP request timed out. Please try again.'
      : err?.message || 'Failed to send OTP. Please try again.'
    console.error('[send-otp error]', err)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
