'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { ArrowLeft, Loader2 } from 'lucide-react'

import { FullScreenLoader } from '@/components/ui/full-screen-loader'

function ApiProcessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [url, setUrl] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorText, setErrorText] = useState('')
  const [autoTriggered, setAutoTriggered] = useState(false)

  // Auto-trigger if a URL is provided as a query parameter
  useEffect(() => {
    const paramUrl = searchParams?.get('url')
    if (paramUrl && !autoTriggered) {
      setUrl(paramUrl)
      setAutoTriggered(true)
      processUrl(paramUrl)
    }
  }, [searchParams, autoTriggered])

  const processUrl = async (targetUrl: string) => {
    if (!targetUrl.trim()) {
      setStatus('error')
      setErrorText('Please enter a valid URL.')
      return
    }

    setStatus('loading')
    setErrorText('')

    try {
      const res = await fetch(targetUrl, { method: 'GET' })
      if (res.ok) {
        setStatus('success')
      } else {
        setStatus('error')
        setErrorText(`Request failed with status ${res.status}`)
      }
    } catch {
      setStatus('error')
      setErrorText('Could not reach the URL. Check CORS or network.')
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    processUrl(url)
  }

  const handleReset = () => {
    setStatus('idle')
    setUrl('')
    setErrorText('')
    setAutoTriggered(false)
  }

  return (
    <div className="relative min-h-screen bg-black text-white flex flex-col overflow-hidden font-sans">
      {status === 'loading' && <FullScreenLoader />}

      {/* Background Gradients */}
      <div className="absolute top-[-15%] left-[-10%] w-[55%] h-[55%] rounded-full bg-cyan-950/20 blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[55%] h-[55%] rounded-full bg-blue-950/20 blur-[140px] pointer-events-none" />

      {/* Success pulse rings */}
      {status === 'success' && (
        <>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
            <div className="w-[300px] h-[300px] rounded-full border border-emerald-500/20 animate-ping-slow" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
            <div className="w-[500px] h-[500px] rounded-full border border-emerald-500/10 animate-ping-slower" />
          </div>
        </>
      )}

      {/* Header */}
      <header className="px-6 md:px-12 lg:px-16 pt-6 relative z-10">
        <div className="liquid-glass rounded-xl px-4 py-2 flex items-center justify-between">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-sm text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft size={16} />
            <span>Back to Home</span>
          </button>
          <span className="text-sm font-semibold tracking-wider text-cyan-400">API PROCESS</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12 relative z-10">
        <div className="w-full max-w-lg">

          {/* Success State */}
          {status === 'success' && (
            <div className="flex flex-col items-center justify-center gap-6 animate-fadeIn">
              {/* Animated checkmark */}
              <div className="relative">
                <div className="w-32 h-32 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center success-glow">
                  <svg
                    className="w-16 h-16 text-emerald-400 checkmark-draw"
                    viewBox="0 0 52 52"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M14 27l7.8 7.8L38 17" className="checkmark-path" />
                  </svg>
                </div>
              </div>
              <div className="text-center">
                <h2 className="text-2xl font-semibold text-emerald-400 mb-2">Success!</h2>
                <p className="text-sm text-gray-400">The API responded successfully.</p>
              </div>
              <button
                onClick={handleReset}
                className="mt-4 px-8 py-3 rounded-lg bg-white/5 border border-white/10 text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-all cursor-pointer"
              >
                Process Another URL
              </button>
            </div>
          )}

          {/* Error State */}
          {status === 'error' && (
            <div className="flex flex-col items-center justify-center gap-6 animate-fadeIn">
              <div className="w-32 h-32 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center error-glow">
                <svg
                  className="w-16 h-16 text-rose-400"
                  viewBox="0 0 52 52"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M16 16l20 20M36 16l-20 20" />
                </svg>
              </div>
              <div className="text-center">
                <h2 className="text-2xl font-semibold text-rose-400 mb-2">Failed</h2>
                <p className="text-sm text-gray-400">{errorText}</p>
              </div>
              <button
                onClick={handleReset}
                className="mt-4 px-8 py-3 rounded-lg bg-white/5 border border-white/10 text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-all cursor-pointer"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Idle State – URL input form */}
          {status === 'idle' && (
            <div className="animate-fadeIn">
              <div className="liquid-glass border border-white/10 rounded-2xl p-8 md:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                <div className="text-center mb-8">
                  <h1 className="text-2xl md:text-3xl font-normal tracking-tight text-white mb-2">
                    API Processor
                  </h1>
                  <p className="text-sm text-gray-400">
                    Enter an API endpoint URL to process
                  </p>
                  <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                    Or pass it as a query parameter: <code className="text-cyan-500/70">?url=https://...</code>
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                      API URL
                    </label>
                    <input
                      type="url"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://api.example.com/endpoint"
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 transition-colors"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-white text-black hover:bg-gray-100 transition-colors py-3.5 rounded-lg text-sm font-semibold tracking-tight cursor-pointer"
                  >
                    Process Request
                  </button>
                </form>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-white/5 text-center text-xs text-gray-600 relative z-10">
        AgentOps © 2026 API Processor. All rights reserved.
      </footer>

      {/* Scoped Styles */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out forwards;
        }

        @keyframes ping-slow {
          0% { transform: scale(1); opacity: 0.4; }
          100% { transform: scale(2.5); opacity: 0; }
        }
        .animate-ping-slow {
          animation: ping-slow 2s ease-out infinite;
        }

        @keyframes ping-slower {
          0% { transform: scale(1); opacity: 0.2; }
          100% { transform: scale(2); opacity: 0; }
        }
        .animate-ping-slower {
          animation: ping-slower 3s ease-out infinite;
        }

        .checkmark-path {
          stroke-dasharray: 40;
          stroke-dashoffset: 40;
          animation: draw 0.6s ease-out 0.3s forwards;
        }
        @keyframes draw {
          to { stroke-dashoffset: 0; }
        }

        .success-glow {
          animation: successPulse 2s ease-in-out infinite;
        }
        @keyframes successPulse {
          0%, 100% { box-shadow: 0 0 20px rgba(16, 185, 129, 0.1); }
          50% { box-shadow: 0 0 40px rgba(16, 185, 129, 0.25); }
        }

        .error-glow {
          animation: errorPulse 2s ease-in-out infinite;
        }
        @keyframes errorPulse {
          0%, 100% { box-shadow: 0 0 20px rgba(244, 63, 94, 0.1); }
          50% { box-shadow: 0 0 40px rgba(244, 63, 94, 0.25); }
        }
      `}</style>
    </div>
  )
}

export default function ApiProcessPage() {
  return (
    <Suspense fallback={
        <FullScreenLoader />
      }>
      <ApiProcessContent />
    </Suspense>
  )
}
