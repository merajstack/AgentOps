import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// Use a separate Groq API key for the personal chatbot feature
const chatbotGroqKey = process.env.GROQ_CHATBOT_API_KEY || process.env.GROQ_API_KEY || ''

export async function POST(
  req: Request,
  context: { params: Promise<{ apiKey: string }> }
) {
  try {
    const { apiKey } = await context.params
    const body = await req.json()
    const question = body?.question || body?.message || body?.query || ''

    if (!question || typeof question !== 'string' || question.trim() === '') {
      return NextResponse.json(
        { error: 'Please provide a "question" field in your request body.' },
        { status: 400 }
      )
    }

    if (!chatbotGroqKey) {
      return NextResponse.json(
        { error: 'GROQ_CHATBOT_API_KEY is not configured on the server.' },
        { status: 503 }
      )
    }

    // 1. Look up the chatbot by API key
    const { data: chatbot, error: dbError } = await supabase
      .from('chatbots')
      .select('chatbot_name, training_data')
      .eq('api_key', apiKey)
      .single()

    if (dbError || !chatbot) {
      return NextResponse.json(
        { error: 'Invalid API key. No chatbot found for this key.' },
        { status: 401 }
      )
    }

    // 2. Build system prompt — strictly confined to training data
    const systemPrompt = `You are "${chatbot.chatbot_name}", a helpful AI assistant.

STRICT RULES — YOU MUST FOLLOW THESE AT ALL TIMES:
1. You MUST only answer questions using the knowledge provided in the TRAINING DATA section below.
2. If the user's question cannot be answered from the training data, respond with: "I'm sorry, I don't have information about that. Please contact our support for more details."
3. Do NOT use your general knowledge, external facts, or information outside of the training data.
4. Do NOT make up, infer, or guess anything not explicitly stated in the training data.
5. Be concise, friendly, and helpful.

=== TRAINING DATA ===
${chatbot.training_data}
=== END OF TRAINING DATA ===`

    // 3. Call Groq
    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${chatbotGroqKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: question.trim() },
        ],
        temperature: 0.3,
        max_tokens: 1024,
      }),
    })

    if (!groqResponse.ok) {
      const errData = await groqResponse.json().catch(() => ({}))
      throw new Error(errData?.error?.message || `Groq error: ${groqResponse.status}`)
    }

    const groqData = await groqResponse.json()
    const answer = groqData.choices?.[0]?.message?.content || "I'm sorry, I couldn't generate a response."

    return NextResponse.json({
      chatbot: chatbot.chatbot_name,
      question: question.trim(),
      answer,
    })
  } catch (error: any) {
    console.error('[Chatbot API Error]', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error.' },
      { status: 500 }
    )
  }
}

// Handle GET to describe the endpoint
export async function GET(
  _req: Request,
  context: { params: Promise<{ apiKey: string }> }
) {
  const { apiKey } = await context.params
  return NextResponse.json({
    message: 'AgentOps Personal Chatbot API',
    usage: {
      method: 'POST',
      endpoint: `/api/chatbot/${apiKey}`,
      body: { question: 'Your question here' },
      response: { chatbot: 'Chatbot Name', question: '...', answer: '...' },
    },
  })
}
