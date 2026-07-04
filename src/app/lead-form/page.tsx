'use client'

import React, { useState } from 'react'
import { ArrowLeft, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import Link from 'next/link'

export default function LeadFormPage() {
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    requirement_description: '',
  })

  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!formData.name.trim() || !formData.mobile.trim() || !formData.email.trim() || !formData.requirement_description.trim()) {
      setStatus('error')
      setErrorMessage('Please fill in all the required fields.')
      return
    }

    setStatus('submitting')
    setErrorMessage('')

    try {
      const payload = {
        ...formData,
        owner_mobile: "1234567890",
        business_name: "agentops"
      }

      const webhookUrl = process.env.NEXT_PUBLIC_LEAD_FORM_WEBHOOK_URL || 'https://workflow.ccbp.in/webhook/lead-form'
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        setStatus('success')
        // Optional: clear form
        setFormData({ name: '', mobile: '', email: '', requirement_description: '' })
      } else {
        throw new Error('Failed to submit form.')
      }
    } catch (err: any) {
      setStatus('error')
      setErrorMessage(err.message || 'Something went wrong. Please try again.')
    }
  }

  return (
    <div className="relative min-h-screen bg-black text-white flex flex-col justify-between overflow-x-hidden font-sans">
      {/* Background Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-950/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-950/20 blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="px-6 md:px-12 lg:px-16 pt-6 relative z-10">
        <div className="liquid-glass rounded-xl px-4 py-2 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft size={16} />
            <span>Back to Home</span>
          </Link>
          <span className="text-sm font-semibold tracking-wider text-cyan-400">CONTACT US</span>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center px-4 py-12 relative z-10">
        <div className="w-full max-w-lg">
          <div className="liquid-glass border border-white/10 rounded-2xl p-8 md:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
            
            <div className="text-center mb-8">
              <h1 className="text-2xl md:text-3xl font-normal tracking-tight text-white mb-2">
                Submit Your Requirements
              </h1>
              <p className="text-sm text-gray-400">
                Let us know what you need, and our team will get back to you.
              </p>
            </div>

            {/* Alerts */}
            {status === 'success' && (
              <div className="mb-6 flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-emerald-400 text-sm">
                <CheckCircle2 size={18} className="shrink-0" />
                <span>Your request has been successfully submitted! We'll contact you soon.</span>
              </div>
            )}

            {status === 'error' && (
              <div className="mb-6 flex items-center gap-3 bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 text-rose-400 text-sm">
                <AlertCircle size={18} className="shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. John Doe"
                  disabled={status === 'submitting'}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 transition-colors"
                />
              </div>

              {/* Mobile */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  placeholder="e.g. +1 234 567 8900"
                  disabled={status === 'submitting'}
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
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="e.g. john@example.com"
                  disabled={status === 'submitting'}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 transition-colors"
                />
              </div>

              {/* Requirement Description */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                  Requirement Description
                </label>
                <textarea
                  name="requirement_description"
                  value={formData.requirement_description}
                  onChange={handleChange}
                  placeholder="Tell us about your requirements..."
                  rows={4}
                  disabled={status === 'submitting'}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 transition-colors resize-none"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={status === 'submitting' || status === 'success'}
                className="w-full bg-white text-black hover:bg-gray-100 transition-colors py-3.5 rounded-lg text-sm font-semibold tracking-tight cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {status === 'submitting' ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : status === 'success' ? (
                  <span>Submitted</span>
                ) : (
                  <span>Submit Requirements</span>
                )}
              </button>
            </form>

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
