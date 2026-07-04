'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Loader2, AlertCircle, Sparkles } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function AuthPage() {
  const router = useRouter()

  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const handleGoogleLogin = async () => {
    setLoading(true)
    setErrorMessage('')
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: typeof window !== 'undefined' ? window.location.origin : undefined,
        },
      })
      if (error) throw error
    } catch (err: any) {
      setLoading(false)
      setErrorMessage(err.message || 'Failed to initialize Google login.')
    }
  }

  const handleGuestLogin = () => {
    if (!name.trim()) {
      setErrorMessage('Name is required for guest entry.')
      return
    }

    setLoading(true)
    setErrorMessage('')

    try {
      const guestId = 'guest_' + Math.random().toString(36).substr(2, 9)
      const guestUser = {
        id: guestId,
        name: name.trim(),
        email: 'guest@agentops-auto.vercel.app',
      }

      localStorage.setItem('agentops_user', JSON.stringify(guestUser))
      
      // Simulate slight delay for premium animation transition
      setTimeout(() => {
        router.push('/')
      }, 1000)
    } catch (err: any) {
      setLoading(false)
      setErrorMessage('Failed to enter as guest. Please try again.')
    }
  }

  return (
    <div className="relative min-h-screen bg-[#f8fafc] flex flex-col font-sans overflow-hidden">
      {/* Decorative gradient backgrounds */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-sky-100/50 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-50/50 blur-[120px] pointer-events-none" />

      {/* Global Loader Overlay */}
      {loading && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/60 backdrop-blur-md animate-fadeIn">
          <Loader2 className="w-10 h-10 text-sky-500 animate-spin" />
          <p className="mt-4 text-sm font-semibold tracking-wider text-sky-600 animate-pulse">
            LOADING SECURE ACCESS...
          </p>
        </div>
      )}

      {/* Header */}
      <header className="px-6 md:px-12 py-6 flex items-center justify-between relative z-10">
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} />
          <span>Back to Home</span>
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 relative z-10 pb-20">
        <div className="w-full max-w-md animate-slideUp">
          <div className="bg-white/80 backdrop-blur-xl border border-sky-100/80 rounded-3xl p-8 shadow-[0_20px_60px_rgba(14,165,233,0.08)]">
            
            {/* Header Text */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-sky-50 text-sky-500 mb-4 border border-sky-100 shadow-sm shadow-sky-500/5">
                <Sparkles size={20} />
              </div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Access AgentOps</h1>
              <p className="text-slate-500 mt-2 text-sm">
                Choose your preferred sign in method
              </p>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 flex items-start gap-3 animate-fadeIn">
                <AlertCircle className="text-red-500 mt-0.5 shrink-0" size={18} />
                <p className="text-sm text-red-600 leading-relaxed">{errorMessage}</p>
              </div>
            )}

            {/* Sign in with Google (Primary) */}
            <div className="space-y-6">
              <button
                onClick={handleGoogleLogin}
                className="w-full bg-white hover:bg-slate-50 text-slate-700 font-semibold py-3.5 px-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-center gap-3 transition-all cursor-pointer text-sm"
              >
                {/* Google Logo SVG */}
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#EA4335"
                    d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.67 1.55 14.98 1 12 1 7.35 1 3.37 3.67 1.39 7.56l3.85 2.99c.92-2.75 3.48-4.51 6.76-4.51z"
                  />
                  <path
                    fill="#4285F4"
                    d="M23.49 12.27c0-.81-.07-1.59-.2-2.27H12v4.51h6.46c-.29 1.48-1.14 2.73-2.4 3.58l3.72 2.88c2.18-2 3.71-4.96 3.71-8.7z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.24 14.45c-.24-.72-.38-1.5-.38-2.3s.14-1.58.38-2.3L1.39 7.56C.5 9.36 0 11.4 0 13.5s.5 4.14 1.39 5.94l3.85-2.99z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.72-2.88c-1.04.7-2.38 1.12-4.24 1.12-3.28 0-5.84-1.76-6.76-4.51L1.39 16.76C3.37 20.33 7.35 23 12 23z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>

              <div className="relative flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200"></div>
                </div>
                <span className="relative px-3 bg-white text-xs text-slate-400 font-semibold uppercase tracking-wider">
                  Or
                </span>
              </div>

              {/* Guest / Instant Name Entry */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 px-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name for quick access"
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-3.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all text-sm"
                  />
                </div>
                <button
                  onClick={handleGuestLogin}
                  disabled={!name.trim()}
                  className="w-full bg-sky-500 hover:bg-sky-600 disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold py-3.5 rounded-xl transition-all shadow-lg shadow-sky-500/25 disabled:shadow-none text-sm cursor-pointer"
                >
                  Enter as Guest
                </button>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-xs text-slate-400">
              Your session is saved locally. Google Sign In enables server-backed persistent profile.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
