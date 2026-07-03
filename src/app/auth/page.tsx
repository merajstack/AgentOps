'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'

export default function AuthPage() {
  const router = useRouter()
  
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  
  const [status, setStatus] = useState<'idle' | 'sending' | 'otp_sent' | 'verifying' | 'success' | 'error' | 'invalid_otp'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [internalOtp, setInternalOtp] = useState<string | null>(null)
  const [resendTimer, setResendTimer] = useState(0)

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [resendTimer])

  const handleGetOtp = async () => {
    if (!name.trim()) {
      setStatus('error')
      setErrorMessage('Name is required.')
      return
    }
    if (!email.includes('@') || !email.includes('.')) {
      setStatus('error')
      setErrorMessage('Please enter a valid email address.')
      return
    }

    setStatus('sending')
    setErrorMessage('')
    setOtp('') // Reset OTP input

    try {
      const response = await fetch('https://workflow.ccbp.in/webhook/main-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          timestamp: new Date().toISOString(),
        }),
      })

      if (response.ok) {
        let receivedOtp = ''
        const contentType = response.headers.get('content-type')
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json()
          receivedOtp = String(data.otp || data.code || data)
        } else {
          receivedOtp = await response.text()
        }
        
        setInternalOtp(receivedOtp.trim())
        setStatus('otp_sent')
        setResendTimer(60)
      } else {
        throw new Error(`Failed with status: ${response.status}`)
      }
    } catch (err: any) {
      setStatus('error')
      setErrorMessage(err.message || 'Something went wrong while sending OTP. Please try again.')
    }
  }

  const handleVerifyOtp = () => {
    if (!otp.trim()) {
      setStatus('error')
      setErrorMessage('Please enter the OTP.')
      return
    }

    setStatus('verifying')

    // Simulate verification delay
    setTimeout(() => {
      if (otp === internalOtp) {
        setStatus('success')
        
        // Generate User ID and save to local storage
        const userId = `user_${Math.floor(1000 + Math.random() * 9000)}`
        const userData = {
          id: userId,
          name: name.trim(),
          email: email.trim(),
        }
        localStorage.setItem('agentops_user', JSON.stringify(userData))

        setTimeout(() => {
          router.push('/')
        }, 1500)
      } else {
        setStatus('invalid_otp')
        setErrorMessage('Invalid OTP. Please click "Resend OTP" to try again.')
      }
    }, 800)
  }

  const handleResendOtp = () => {
    if (resendTimer > 0) return
    handleGetOtp()
  }

  return (
    <div className="relative min-h-screen bg-black text-white flex flex-col justify-between overflow-x-hidden font-sans">
      {/* Background Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-950/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-950/20 blur-[120px] pointer-events-none" />

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
          <span className="text-sm font-semibold tracking-wider text-cyan-400">AUTHENTICATION</span>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center px-4 py-12 relative z-10">
        <div className="w-full max-w-md">
          <div className="liquid-glass border border-white/10 rounded-2xl p-8 md:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
            
            <div className="text-center mb-8">
              <h1 className="text-2xl md:text-3xl font-normal tracking-tight text-white mb-2">
                Welcome Back
              </h1>
              <p className="text-sm text-gray-400">
                Please verify your email to continue.
              </p>
            </div>

            {/* Alerts */}
            {status === 'success' && (
              <div className="mb-6 flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-emerald-400 text-sm">
                <CheckCircle2 size={18} className="shrink-0" />
                <span>Verification successful! Redirecting...</span>
              </div>
            )}

            {(status === 'error' || status === 'invalid_otp') && (
              <div className="mb-6 flex items-center gap-3 bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 text-rose-400 text-sm">
                <AlertCircle size={18} className="shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="space-y-6">
              {/* Name */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. John Doe"
                  disabled={status === 'sending' || status === 'verifying' || status === 'success' || status === 'otp_sent' || status === 'invalid_otp'}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 transition-colors"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. john@example.com"
                  disabled={status === 'sending' || status === 'verifying' || status === 'success' || status === 'otp_sent' || status === 'invalid_otp'}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 transition-colors"
                />
              </div>

              {/* OTP Field (Visible after sending) */}
              {(status === 'otp_sent' || status === 'verifying' || status === 'invalid_otp') && (
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                    Enter OTP
                  </label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter the code sent to your email"
                    disabled={status === 'verifying' || status === 'invalid_otp'}
                    className={`w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 transition-colors ${status === 'invalid_otp' ? 'opacity-50 cursor-not-allowed' : ''}`}
                  />
                </div>
              )}

              {/* Action Buttons */}
              {status === 'idle' || status === 'error' || status === 'sending' ? (
                <button
                  onClick={handleGetOtp}
                  disabled={status === 'sending'}
                  className="w-full bg-white text-black hover:bg-gray-100 transition-colors py-3.5 rounded-lg text-sm font-semibold tracking-tight cursor-pointer flex items-center justify-center gap-2"
                >
                  {status === 'sending' ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Sending OTP...</span>
                    </>
                  ) : (
                    <span>Get OTP</span>
                  )}
                </button>
              ) : (
                <div className="space-y-3">
                  <button
                    onClick={handleVerifyOtp}
                    disabled={status === 'verifying' || status === 'invalid_otp' || !otp}
                    className="w-full bg-white text-black hover:bg-gray-100 transition-colors py-3.5 rounded-lg text-sm font-semibold tracking-tight cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {status === 'verifying' ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Verifying...</span>
                      </>
                    ) : (
                      <span>Verify OTP</span>
                    )}
                  </button>

                  <button
                    onClick={handleResendOtp}
                    disabled={resendTimer > 0 || status === 'verifying'}
                    className="w-full border border-white/20 text-white hover:bg-white/5 transition-colors py-3.5 rounded-lg text-sm font-semibold tracking-tight cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : 'Resend OTP'}
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-white/5 text-center text-xs text-gray-600 relative z-10">
        AgentOps © 2026. All rights reserved.
      </footer>
    </div>
  )
}
