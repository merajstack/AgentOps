'use client'

import React, { useState } from 'react'
import { ArrowLeft, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import Link from 'next/link'

import { FullScreenLoader } from '@/components/ui/full-screen-loader'

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
    <div className="relative min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col justify-between overflow-x-hidden font-sans">
      {status === 'submitting' && <FullScreenLoader />}

      {/* Background Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-sky-100/50 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-50/50 blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="px-6 md:px-12 lg:px-16 pt-6 relative z-10">
        <div className="bg-white/80 backdrop-blur-md border border-sky-100/80 shadow-sm rounded-xl px-4 py-2 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition-colors cursor-pointer font-medium"
          >
            <ArrowLeft size={16} />
            <span>Back to Home</span>
          </Link>
          <span className="text-sm font-semibold tracking-wider text-sky-600">CONTACT US</span>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center px-4 py-12 relative z-10">
        <div className="w-full max-w-lg">
          <div className="bg-white/90 backdrop-blur-md border border-sky-100/80 rounded-2xl p-8 md:p-10 shadow-[0_15px_40px_rgba(14,165,233,0.06)]">
            
            <div className="text-center mb-8">
              <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-slate-900 mb-2">
                Submit Your Requirements
              </h1>
              <p className="text-sm text-slate-500">
                Let us know what you need, and our team will get back to you.
              </p>
            </div>

            {/* Alerts */}
            {status === 'success' && (
              <div className="mb-6 flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-emerald-700 text-sm">
                <CheckCircle2 size={18} className="shrink-0" />
                <span>Your request has been successfully submitted! We'll contact you soon.</span>
              </div>
            )}

            {status === 'error' && (
              <div className="mb-6 flex items-center gap-3 bg-rose-50 border border-rose-200 rounded-xl p-4 text-rose-700 text-sm">
                <AlertCircle size={18} className="shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. John Doe"
                  disabled={status === 'submitting'}
                  className="w-full bg-white border border-sky-200/80 rounded-lg px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 transition-all"
                />
              </div>

              {/* Mobile */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  placeholder="e.g. +1 234 567 8900"
                  disabled={status === 'submitting'}
                  className="w-full bg-white border border-sky-200/80 rounded-lg px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 transition-all"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="e.g. john@example.com"
                  disabled={status === 'submitting'}
                  className="w-full bg-white border border-sky-200/80 rounded-lg px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 transition-all"
                />
              </div>

              {/* Requirement Description */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                  Requirement Description
                </label>
                <textarea
                  name="requirement_description"
                  value={formData.requirement_description}
                  onChange={handleChange}
                  placeholder="Tell us about your requirements..."
                  rows={4}
                  disabled={status === 'submitting'}
                  className="w-full bg-white border border-sky-200/80 rounded-lg px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 transition-all resize-none"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={status === 'submitting' || status === 'success'}
                className="w-full bg-sky-500 text-white hover:bg-sky-600 transition-all py-3.5 rounded-lg text-sm font-semibold tracking-tight cursor-pointer flex items-center justify-center gap-2 shadow-md shadow-sky-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {status === 'submitting' ? (
                  <span>Submitting...</span>
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
      <footer className="py-6 border-t border-sky-100/50 text-center text-xs text-slate-400 relative z-10 bg-white/20">
        AgentOps © 2026. All rights reserved.
      </footer>
    </div>
  )
}
