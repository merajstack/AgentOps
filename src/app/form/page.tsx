'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'

import { FullScreenLoader } from '@/components/ui/full-screen-loader'

export default function FormPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    companyName: '',
    pricePerUnit: '',
    quantity: '',
    paymentTerms: '',
    consumerEmail: '',
  })
  
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Client-side validations
    if (!formData.companyName.trim()) {
      setStatus('error')
      setErrorMessage('Company Name is required.')
      return
    }
    if (isNaN(Number(formData.pricePerUnit)) || Number(formData.pricePerUnit) <= 0) {
      setStatus('error')
      setErrorMessage('Price per Unit must be a positive number.')
      return
    }
    if (isNaN(Number(formData.quantity)) || Number(formData.quantity) <= 0 || !Number.isInteger(Number(formData.quantity))) {
      setStatus('error')
      setErrorMessage('Quantity must be a positive integer.')
      return
    }
    if (!formData.consumerEmail.includes('@') || !formData.consumerEmail.includes('.')) {
      setStatus('error')
      setErrorMessage('Please enter a valid email address.')
      return
    }

    setStatus('submitting')
    setErrorMessage('')

    const webhookUrl = process.env.NEXT_PUBLIC_FORM_WEBHOOK_URL || 'https://workflow.ccbp.in/webhook/form-site'

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          companyName: formData.companyName,
          pricePerUnit: Number(formData.pricePerUnit),
          quantity: Number(formData.quantity),
          paymentTerms: formData.paymentTerms,
          consumerEmail: formData.consumerEmail,
          submittedAt: new Date().toISOString(),
        }),
      })

      if (response.ok) {
        setStatus('success')
        setFormData({
          companyName: '',
          pricePerUnit: '',
          quantity: '',
          paymentTerms: '',
          consumerEmail: '',
        })
      } else {
        throw new Error(`Failed with status: ${response.status}`)
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

      {/* Header / Navbar */}
      <header className="px-6 md:px-12 lg:px-16 pt-6 relative z-10">
        <div className="bg-white/80 backdrop-blur-md border border-sky-100/80 shadow-sm rounded-xl px-4 py-2 flex items-center justify-between">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition-colors cursor-pointer font-medium"
          >
            <ArrowLeft size={16} />
            <span>Back to Home</span>
          </button>
          <span className="text-sm font-semibold tracking-wider text-sky-600">PROCUREMENT PORTAL</span>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center px-4 py-12 relative z-10">
        <div className="w-full max-w-xl">
          <div className="bg-white/90 backdrop-blur-md border border-sky-100/80 rounded-2xl p-8 md:p-10 shadow-[0_15px_40px_rgba(14,165,233,0.06)]">
            
            {/* Header Title */}
            <div className="text-center mb-8">
              <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-slate-900 mb-2">
                Order Details Form
              </h1>
              <p className="text-sm text-slate-500">
                Procurement Submission
              </p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Provide the details of your inquiry below to instantly submit them to our manager.
              </p>
            </div>

            {/* Submission alerts */}
            {status === 'success' && (
              <div className="mb-6 flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-emerald-700 text-sm">
                <CheckCircle2 size={18} className="shrink-0" />
                <span>Procurement form submitted successfully to the webhook!</span>
              </div>
            )}

            {status === 'error' && (
              <div className="mb-6 flex items-center gap-3 bg-rose-50 border border-rose-200 rounded-xl p-4 text-rose-700 text-sm">
                <AlertCircle size={18} className="shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Company Name */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                  Company Name
                </label>
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  placeholder="e.g. Acme Corp"
                  disabled={status === 'submitting'}
                  className="w-full bg-white border border-sky-200/80 rounded-lg px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 transition-all"
                />
              </div>

              {/* Price and Quantity Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Price per Unit */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                    Price per Unit (USD)
                  </label>
                  <input
                    type="text"
                    name="pricePerUnit"
                    value={formData.pricePerUnit}
                    onChange={handleChange}
                    placeholder="e.g. 150.00"
                    disabled={status === 'submitting'}
                    className="w-full bg-white border border-sky-200/80 rounded-lg px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 transition-all"
                  />
                </div>

                {/* Quantity */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                    Quantity (Number of Units)
                  </label>
                  <input
                    type="text"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                    placeholder="e.g. 500"
                    disabled={status === 'submitting'}
                    className="w-full bg-white border border-sky-200/80 rounded-lg px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 transition-all"
                  />
                </div>
              </div>

              {/* Payment Terms */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                  Payment Terms / Conditions
                </label>
                <textarea
                  name="paymentTerms"
                  value={formData.paymentTerms}
                  onChange={handleChange}
                  placeholder="e.g. Net 30, 50% advance / 50% on delivery"
                  rows={2}
                  disabled={status === 'submitting'}
                  className="w-full bg-white border border-sky-200/80 rounded-lg px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 transition-all resize-none"
                />
              </div>

              {/* Consumer Email */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                  Consumer Email Address
                </label>
                <input
                  type="text"
                  name="consumerEmail"
                  value={formData.consumerEmail}
                  onChange={handleChange}
                  placeholder="e.g. purchaser@company.com"
                  disabled={status === 'submitting'}
                  className="w-full bg-white border border-sky-200/80 rounded-lg px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 transition-all"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={status === 'submitting'}
                className="w-full bg-sky-500 text-white hover:bg-sky-600 transition-all py-3.5 rounded-lg text-sm font-semibold tracking-tight cursor-pointer flex items-center justify-center gap-2 shadow-md shadow-sky-500/10"
              >
                {status === 'submitting' ? 'Submitting to Manager...' : 'Submit Procurement Form'}
              </button>

            </form>

          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-sky-100/50 text-center text-xs text-slate-400 relative z-10 bg-white/20">
        AgentOps © 2026 Procurement Portal. All rights reserved.
      </footer>
    </div>
  )
}
