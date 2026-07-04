import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { name, email } = await req.json()

    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email are required.' }, { status: 400 })
    }

    const webhookUrl =
      process.env.NEXT_PUBLIC_MAIN_OTP_WEBHOOK_URL ||
      'https://workflow.ccbp.in/webhook/main-otp'

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, timestamp: new Date().toISOString() }),
    })

    if (!response.ok) {
      throw new Error(`Webhook responded with status ${response.status}`)
    }

    const contentType = response.headers.get('content-type') || ''
    let otp = ''

    if (contentType.includes('application/json')) {
      const data = await response.json()
      otp = String(data.otp || data.code || data)
    } else {
      otp = await response.text()
    }

    return NextResponse.json({ otp: otp.trim() })
  } catch (err: any) {
    console.error('[send-otp error]', err)
    return NextResponse.json(
      { error: err.message || 'Failed to send OTP. Please try again.' },
      { status: 500 }
    )
  }
}
