'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Copy, Check, Bot, Database, Key, Link2, AlertCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Loader } from '@/components/ui/loader'

type PageState = 'form' | 'loading' | 'done' | 'error'

export default function CreateChatbotPage() {
  const router = useRouter()
  const [chatbotName, setChatbotName] = useState('')
  const [trainingData, setTrainingData] = useState('')
  const [pageState, setPageState] = useState<PageState>('form')
  const [loadingText, setLoadingText] = useState('Initializing…')
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [result, setResult] = useState<{ apiKey: string; apiUrl: string; chatbotName: string } | null>(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [copiedKey, setCopiedKey] = useState(false)
  const [copiedUrl, setCopiedUrl] = useState(false)
  const [userEmail, setUserEmail] = useState<string | null>(null)

  useEffect(() => {
    const userStr = localStorage.getItem('agentops_user')
    if (userStr) {
      try {
        const user = JSON.parse(userStr)
        setUserEmail(user.email)
      } catch {
        router.replace('/auth')
      }
    } else {
      router.replace('/auth')
    }
  }, [router])

  const generateApiKey = () => {
    const segments = [
      'ao',
      Math.random().toString(36).substring(2, 10),
      Math.random().toString(36).substring(2, 10),
      Math.random().toString(36).substring(2, 6),
    ]
    return segments.join('-')
  }

  const simulateLoading = async () => {
    const steps = [
      { text: 'Validating training data…', progress: 15, delay: 400 },
      { text: 'Processing knowledge base…', progress: 30, delay: 500 },
      { text: 'Vectorizing training content…', progress: 50, delay: 600 },
      { text: 'Generating secure API key…', progress: 65, delay: 500 },
      { text: 'Registering chatbot endpoint…', progress: 80, delay: 400 },
      { text: 'Saving to database…', progress: 90, delay: 400 },
      { text: 'Finalizing setup…', progress: 98, delay: 300 },
    ]
    for (const step of steps) {
      setLoadingText(step.text)
      setLoadingProgress(step.progress)
      await new Promise((r) => setTimeout(r, step.delay))
    }
  }

  const handleCreate = async () => {
    if (!chatbotName.trim()) return
    if (!trainingData.trim() || trainingData.trim().length < 20) {
      setErrorMessage('Training data must be at least 20 characters.')
      return
    }
    if (!userEmail) {
      setErrorMessage('You must be logged in to create a chatbot.')
      return
    }

    setErrorMessage('')
    setPageState('loading')
    setLoadingProgress(0)

    // Run loading animation concurrently with actual API work
    const loadingPromise = simulateLoading()

    try {
      const apiKey = generateApiKey()
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
      const apiUrl = `${baseUrl}/api/chatbot/${apiKey}`

      // Ensure loading runs for at least 3 seconds
      await Promise.all([
        loadingPromise,
        supabase.from('chatbots').insert({
          user_email: userEmail,
          chatbot_name: chatbotName.trim(),
          training_data: trainingData.trim(),
          api_key: apiKey,
          api_url: apiUrl,
        }),
      ])

      setLoadingProgress(100)
      setLoadingText('Done! 🎉')
      await new Promise((r) => setTimeout(r, 600))

      setResult({ apiKey, apiUrl, chatbotName: chatbotName.trim() })
      setPageState('done')
    } catch (err: any) {
      setPageState('error')
      setErrorMessage(err.message || 'Failed to create chatbot. Please try again.')
    }
  }

  const copy = async (text: string, which: 'key' | 'url') => {
    await navigator.clipboard.writeText(text)
    if (which === 'key') { setCopiedKey(true); setTimeout(() => setCopiedKey(false), 2000) }
    else { setCopiedUrl(true); setTimeout(() => setCopiedUrl(false), 2000) }
  }

  // ── LOADING SCREEN ──────────────────────────────────────────────────────────
  if (pageState === 'loading') {
    return (
      <div className="fixed inset-0 bg-[#020c1a] flex flex-col items-center justify-center z-50 overflow-hidden">
        {/* Animated blue radial glow */}
        <div className="absolute inset-0 bg-gradient-radial from-[#0ea5e9]/20 via-transparent to-transparent pointer-events-none" />
        <div className="absolute w-[600px] h-[600px] rounded-full bg-[#0ea5e9]/5 blur-[120px] pointer-events-none animate-pulse" />

        <div className="relative z-10 flex flex-col items-center gap-10">
          {/* 3D Cube Loader — AGENTOPS */}
          <div className="scale-150">
            <Loader />
          </div>

          {/* Status text */}
          <div className="flex flex-col items-center gap-3">
            <p className="text-sky-300 text-sm font-medium tracking-wider animate-pulse">{loadingText}</p>

            {/* Progress bar */}
            <div className="w-72 h-1.5 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-sky-500 to-blue-500 transition-all duration-500 ease-out"
                style={{ width: `${loadingProgress}%` }}
              />
            </div>
            <span className="text-white/40 text-xs">{loadingProgress}%</span>
          </div>
        </div>
      </div>
    )
  }

  // ── DONE SCREEN ─────────────────────────────────────────────────────────────
  if (pageState === 'done' && result) {
    return (
      <div className="relative min-h-screen bg-black text-white flex flex-col overflow-x-hidden font-sans">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-950/20 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-950/15 blur-[120px] pointer-events-none" />

        <header className="px-6 md:px-12 pt-6 relative z-10">
          <div className="liquid-glass rounded-xl px-4 py-2 flex items-center justify-between">
            <button onClick={() => router.push('/')} className="flex items-center gap-2 text-sm text-slate-300 hover:text-white cursor-pointer">
              <ArrowLeft size={16} /><span>Back to Home</span>
            </button>
            <span className="text-sm font-semibold tracking-wider text-cyan-400">CHATBOT READY</span>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center px-4 py-12 relative z-10">
          <div className="w-full max-w-xl">
            {/* Success badge */}
            <div className="flex items-center justify-center mb-8">
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/30 to-blue-600/30 border border-cyan-500/40 flex items-center justify-center shadow-[0_0_30px_rgba(6,182,212,0.2)]">
                  <Bot size={28} className="text-cyan-400" />
                </div>
                <h1 className="text-2xl font-semibold text-white">
                  <span className="text-cyan-400">{result.chatbotName}</span> is ready!
                </h1>
                <p className="text-gray-400 text-sm text-center max-w-sm">
                  Your personalised chatbot is live. Use the credentials below to query it from any app or website.
                </p>
              </div>
            </div>

            <div className="liquid-glass border border-white/10 rounded-2xl p-6 space-y-6">
              {/* API Key */}
              <div>
                <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
                  <Key size={12} /> API Key
                </label>
                <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                  <code className="flex-1 text-sm text-cyan-300 font-mono break-all">{result.apiKey}</code>
                  <button onClick={() => copy(result.apiKey, 'key')} className="shrink-0 text-gray-400 hover:text-white transition-colors cursor-pointer">
                    {copiedKey ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
                  </button>
                </div>
              </div>

              {/* API URL */}
              <div>
                <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
                  <Link2 size={12} /> API Endpoint
                </label>
                <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                  <code className="flex-1 text-sm text-purple-300 font-mono break-all">{result.apiUrl}</code>
                  <button onClick={() => copy(result.apiUrl, 'url')} className="shrink-0 text-gray-400 hover:text-white transition-colors cursor-pointer">
                    {copiedUrl ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
                  </button>
                </div>
              </div>

              {/* How to use */}
              <div className="border-t border-white/10 pt-6">
                <h3 className="text-sm font-semibold text-gray-300 mb-3">How to use your chatbot</h3>
                <div className="bg-black/40 rounded-xl p-4 text-xs font-mono text-gray-400 leading-relaxed space-y-1">
                  <p className="text-gray-600">{'# POST request example (curl)'}</p>
                  <p><span className="text-sky-400">curl</span> <span className="text-yellow-300">-X POST</span> \</p>
                  <p>&nbsp;&nbsp;<span className="text-purple-300 break-all">{result.apiUrl}</span> \</p>
                  <p>&nbsp;&nbsp;<span className="text-yellow-300">-H</span> <span className="text-green-300">&apos;Content-Type: application/json&apos;</span> \</p>
                  <p>&nbsp;&nbsp;<span className="text-yellow-300">-d</span> <span className="text-green-300">&apos;&#123;"question": "Your question here"&#125;&apos;</span></p>
                </div>
                <p className="mt-4 text-xs text-gray-500">
                  The chatbot will only answer from the training data you provided — nothing outside of it.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => { setChatbotName(''); setTrainingData(''); setPageState('form') }}
                  className="flex-1 border border-white/10 text-gray-400 hover:text-white hover:border-white/20 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer"
                >
                  Create Another
                </button>
                <button
                  onClick={() => router.push('/')}
                  className="flex-1 bg-cyan-500 text-black hover:bg-cyan-400 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer"
                >
                  Go to Home
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  // ── FORM SCREEN ─────────────────────────────────────────────────────────────
  return (
    <div className="relative min-h-screen bg-black text-white flex flex-col overflow-x-hidden font-sans">
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-950/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-950/15 blur-[120px] pointer-events-none" />

      <header className="px-6 md:px-12 pt-6 relative z-10">
        <div className="liquid-glass rounded-xl px-4 py-2 flex items-center justify-between">
          <button onClick={() => router.push('/')} className="flex items-center gap-2 text-sm text-slate-300 hover:text-white cursor-pointer">
            <ArrowLeft size={16} /><span>Back to Home</span>
          </button>
          <span className="text-sm font-semibold tracking-wider text-cyan-400">BUILD A CHATBOT</span>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12 relative z-10">
        <div className="w-full max-w-lg">

          <div className="text-center mb-10">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500/30 to-blue-600/30 border border-cyan-500/30 flex items-center justify-center mx-auto mb-4 shadow-[0_0_24px_rgba(6,182,212,0.15)]">
              <Bot size={24} className="text-cyan-400" />
            </div>
            <h1 className="text-3xl font-light tracking-tight mb-2">Your Personal Chatbot</h1>
            <p className="text-gray-400 text-sm max-w-sm mx-auto">
              Give your chatbot a name and paste in any content — FAQs, product info, policies. It will only answer from that data.
            </p>
          </div>

          {pageState === 'error' && (
            <div className="mb-6 flex items-center gap-3 bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 text-rose-400 text-sm">
              <AlertCircle size={18} className="shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="liquid-glass border border-white/10 rounded-2xl p-6 md:p-8 space-y-6">

            {/* Chatbot Name */}
            <div>
              <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                <Bot size={12} /> Chatbot Name
              </label>
              <input
                type="text"
                value={chatbotName}
                onChange={(e) => setChatbotName(e.target.value)}
                placeholder="e.g. SupportBot, ProductAdvisor, HelpDesk"
                maxLength={60}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 transition-colors"
              />
              <p className="mt-1 text-right text-xs text-gray-600">{chatbotName.length}/60</p>
            </div>

            {/* Training Data */}
            <div>
              <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                <Database size={12} /> Training Data
              </label>
              <textarea
                value={trainingData}
                onChange={(e) => setTrainingData(e.target.value)}
                placeholder={`Paste your chatbot's knowledge here.\n\nExamples:\n- FAQs about your product\n- Your business policies\n- Product catalogue descriptions\n- Support documentation\n\nThe chatbot will ONLY answer from this content.`}
                rows={12}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 transition-colors resize-none font-mono leading-relaxed"
              />
              <p className="mt-1 text-xs text-gray-600">{trainingData.length} characters</p>
            </div>

            <button
              onClick={handleCreate}
              disabled={!chatbotName.trim() || trainingData.trim().length < 20}
              className="w-full bg-white text-black hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed py-3.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2"
            >
              <Bot size={16} />
              Generate API Key & Launch Chatbot
            </button>

            <p className="text-center text-xs text-gray-600">
              Your chatbot and API key will be saved to your account.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
