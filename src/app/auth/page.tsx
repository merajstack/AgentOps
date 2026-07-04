'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { FullScreenLoader } from '@/components/ui/full-screen-loader'

type AuthStatus =
  | 'idle'
  | 'sending'
  | 'otp_sent'
  | 'verifying'
  | 'success'
  | 'error'
  | 'invalid_otp'

export default function AuthPage() {
  const router = useRouter()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [status, setStatus] = useState<AuthStatus>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [internalOtp, setInternalOtp] = useState<string | null>(null)
  const [resendTimer, setResendTimer] = useState(0)

  // ─── OTP timer ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (resendTimer <= 0) return
    const interval = setInterval(() => setResendTimer((p) => p - 1), 1000)
    return () => clearInterval(interval)
  }, [resendTimer])

  // ─── OTP Flow ────────────────────────────────────────────────────────────────
  const handleGetOtp = async () => {
    if (!name.trim()) { setStatus('error'); setErrorMessage('Name is required.'); return }
    if (!email.includes('@') || !email.includes('.')) {
      setStatus('error'); setErrorMessage('Please enter a valid email address.'); return
    }
    setStatus('sending'); setErrorMessage(''); setOtp('')
    try {
      const webhookUrl = process.env.NEXT_PUBLIC_MAIN_OTP_WEBHOOK_URL || 'https://workflow.ccbp.in/webhook/main-otp'
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, timestamp: new Date().toISOString() }),
      })
      if (!response.ok) throw new Error(`Failed with status: ${response.status}`)
      const contentType = response.headers.get('content-type')
      let receivedOtp = ''
      if (contentType?.includes('application/json')) {
        const data = await response.json()
        receivedOtp = String(data.otp || data.code || data)
      } else {
        receivedOtp = await response.text()
      }
      setInternalOtp(receivedOtp.trim())
      setStatus('otp_sent')
      setResendTimer(60)
    } catch (err: any) {
      setStatus('error')
      setErrorMessage(err.message || 'Something went wrong while sending OTP.')
    }
  }

  const completeLogin = async (loginEmail: string, loginName: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .upsert({ email: loginEmail.trim(), name: loginName.trim() }, { onConflict: 'email' })
        .select()
        .single()
      if (error) throw error
      setStatus('success')
      localStorage.setItem(
        'agentops_user',
        JSON.stringify({ id: data.id, name: loginName.trim(), email: loginEmail.trim() })
      )
      setTimeout(() => router.push('/'), 1500)
    } catch (err: any) {
      setStatus('error')
      setErrorMessage(err.message || 'Failed to save user data.')
    }
  }

  const handleVerifyOtp = async () => {
    if (!otp.trim()) { setStatus('error'); setErrorMessage('Please enter the OTP.'); return }
    setStatus('verifying')
    await new Promise((r) => setTimeout(r, 800))
    if (otp === internalOtp) {
      await completeLogin(email, name)
    } else {
      setStatus('invalid_otp')
      setErrorMessage('Invalid OTP. Please click "Resend OTP" to try again.')
    }
  }

  // ─── UI Rendering ────────────────────────────────────────────────────────────
  const isGlobalLoading = ['sending', 'verifying'].includes(status)

  return (
    <div className="relative min-h-screen bg-[#f8fafc] flex flex-col font-sans overflow-hidden">
      {/* Decorative gradient backgrounds */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-sky-100/50 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-50/50 blur-[120px] pointer-events-none" />

      {/* Global Loader Overlay */}
      {isGlobalLoading && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/60 backdrop-blur-md animate-fadeIn">
          <FullScreenLoader />
          <p className="mt-6 text-sm font-semibold tracking-wider text-sky-600 animate-pulse">
            {status === 'sending' ? 'SENDING OTP...' : 'VERIFYING...'}
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
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Sign In</h1>
              <p className="text-slate-500 mt-2 text-sm">
                Secure access via Email OTP
              </p>
            </div>

            {/* Error Message */}
            {(status === 'error' || status === 'invalid_otp') && errorMessage && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 flex items-start gap-3 animate-fadeIn">
                <AlertCircle className="text-red-500 mt-0.5 shrink-0" size={18} />
                <p className="text-sm text-red-600 leading-relaxed">{errorMessage}</p>
              </div>
            )}

            {/* Success Message */}
            {status === 'success' && (
              <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center gap-3 animate-fadeIn">
                <CheckCircle2 className="text-emerald-500 shrink-0" size={20} />
                <p className="text-sm font-medium text-emerald-700">Login successful! Redirecting...</p>
              </div>
            )}

            {/* ─── STEP 1: Details ────────────────────────────────────────── */}
            {['idle', 'sending', 'error'].includes(status) && (
              <div className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 px-1">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-3.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 px-1">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-3.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all text-sm"
                  />
                </div>
                <button
                  onClick={handleGetOtp}
                  disabled={!name.trim() || !email.includes('@')}
                  className="w-full bg-sky-500 hover:bg-sky-600 disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold py-3.5 rounded-xl transition-all shadow-lg shadow-sky-500/25 disabled:shadow-none mt-2 text-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  Continue with Email
                </button>
              </div>
            )}

            {/* ─── STEP 2: OTP Entry ──────────────────────────────────────── */}
            {['otp_sent', 'verifying', 'invalid_otp', 'success'].includes(status) && (
              <div className="space-y-5 animate-fadeIn">
                <div className="p-4 bg-sky-50 border border-sky-100 rounded-xl mb-2">
                  <p className="text-sm text-sky-800 text-center">
                    We've sent a code to <span className="font-semibold">{email}</span>
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 px-1">Security Code</label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter OTP"
                    maxLength={6}
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-3.5 text-slate-800 text-center tracking-[0.5em] font-mono text-lg placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                  />
                </div>
                <button
                  onClick={handleVerifyOtp}
                  disabled={otp.length < 4 || status === 'verifying' || status === 'success'}
                  className="w-full bg-sky-500 hover:bg-sky-600 disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold py-3.5 rounded-xl transition-all shadow-lg shadow-sky-500/25 disabled:shadow-none mt-2 text-sm cursor-pointer"
                >
                  Verify Code
                </button>

                <div className="pt-4 text-center">
                  <button
                    onClick={handleGetOtp}
                    disabled={resendTimer > 0}
                    className="text-sm font-medium text-slate-500 hover:text-sky-600 disabled:text-slate-300 transition-colors cursor-pointer"
                  >
                    {resendTimer > 0 ? `Resend Code in ${resendTimer}s` : 'Resend Code'}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 text-center">
            <p className="text-xs text-slate-400">
              By signing in, you agree to AgentOps terms of service and privacy policy.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
