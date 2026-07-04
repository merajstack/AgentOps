'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, User, Mail, LogOut, Trash2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { FullScreenLoader } from '@/components/ui/full-screen-loader'

export default function SettingsPage() {
  const router = useRouter()
  const [userData, setUserData] = useState<{ id: string; name: string; email: string } | null>(null)
  const [isDeletingChat, setIsDeletingChat] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const user = localStorage.getItem('agentops_user')
    if (user) {
      try {
        const parsed = JSON.parse(user)
        setUserData(parsed)
      } catch {
        console.error('Failed to parse user data')
      }
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('agentops_user')
    router.replace('/auth')
  }

  const handleDeleteChatHistory = async () => {
    if (!userData) return
    setIsDeletingChat(true)
    setMessage('')
    try {
      const { error } = await supabase.from('conversations').delete().eq('user_email', userData.email)
      if (error) throw error
      setMessage('Chat history deleted successfully.')
    } catch {
      setMessage('Failed to delete chat history.')
    } finally {
      setIsDeletingChat(false)
      setTimeout(() => setMessage(''), 3000)
    }
  }

  if (!userData) {
    return <FullScreenLoader />
  }

  return (
    <div className="relative min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col font-sans overflow-x-hidden">
      {isDeletingChat && <FullScreenLoader />}

      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-sky-100/50 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-50/50 blur-[120px] pointer-events-none" />

      <header className="px-6 md:px-12 lg:px-16 pt-6 relative z-10">
        <div className="bg-white/80 backdrop-blur-md border border-sky-100/80 shadow-sm rounded-xl px-4 py-2 flex items-center justify-between">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition-colors cursor-pointer font-medium"
          >
            <ArrowLeft size={16} />
            <span>Back to Home</span>
          </button>
          <span className="text-sm font-semibold tracking-wider text-sky-600">SETTINGS</span>
        </div>
      </header>

      <main className="flex-1 flex justify-center py-12 px-4 relative z-10">
        <div className="w-full max-w-2xl">

          <div className="mb-8">
            <h1 className="text-3xl font-light tracking-tight mb-2 text-slate-900">Account Settings</h1>
            <p className="text-slate-500 text-sm">Manage your profile and preferences.</p>
          </div>

          {message && (
            <div className="mb-6 p-4 bg-sky-50 border border-sky-200 text-sky-700 rounded-lg text-sm text-center">
              {message}
            </div>
          )}

          <div className="bg-white/90 backdrop-blur-md border border-sky-100/80 rounded-2xl p-6 md:p-8 space-y-8 shadow-[0_15px_40px_rgba(14,165,233,0.06)]">

            {/* Profile Section */}
            <div>
              <h2 className="text-lg font-medium border-b border-sky-100 pb-2 mb-6 text-slate-800">Profile Information</h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                    User ID
                  </label>
                  <div className="bg-slate-50 border border-sky-100 rounded-lg px-4 py-3 text-sm text-slate-600 flex items-center justify-between">
                    <span>{userData.id}</span>
                    <span className="text-[10px] bg-sky-100 text-sky-700 px-2 py-0.5 rounded uppercase font-bold tracking-wider">Generated</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-2">
                    <User size={14} /> Full Name
                  </label>
                  <input
                    type="text"
                    value={userData.name}
                    disabled
                    className="w-full bg-slate-50 border border-sky-100 rounded-lg px-4 py-3 text-sm text-slate-600 cursor-not-allowed opacity-80"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-2">
                    <Mail size={14} /> Email Address
                  </label>
                  <input
                    type="email"
                    value={userData.email}
                    disabled
                    className="w-full bg-slate-50 border border-sky-100 rounded-lg px-4 py-3 text-sm text-slate-600 cursor-not-allowed opacity-80"
                  />
                </div>
              </div>
            </div>

            {/* Data Management Section */}
            <div className="pt-4">
              <h2 className="text-lg font-medium text-slate-800 border-b border-sky-100 pb-2 mb-6">Data Management</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between bg-slate-50 border border-sky-100 rounded-xl p-4">
                  <div>
                    <h3 className="text-sm font-medium text-slate-700">Delete Chat History</h3>
                    <p className="text-xs text-slate-500 mt-1">Permanently remove all your conversations from AgentOps servers.</p>
                  </div>
                  <button
                    onClick={handleDeleteChatHistory}
                    disabled={isDeletingChat}
                    className="bg-white hover:bg-slate-100 text-slate-700 border border-sky-200/80 px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer flex items-center gap-2 disabled:opacity-50"
                  >
                    {isDeletingChat ? <span>Clearing...</span> : <Trash2 size={16} />}
                    <span>Clear Chats</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="pt-4">
              <h2 className="text-lg font-medium text-rose-600 border-b border-rose-100 pb-2 mb-6">Danger Zone</h2>
              <div className="flex items-center justify-between bg-rose-50 border border-rose-100 rounded-xl p-4">
                <div>
                  <h3 className="text-sm font-medium text-rose-700">Log out</h3>
                  <p className="text-xs text-rose-500 mt-1">End your current session on this device.</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="bg-rose-500 text-white hover:bg-rose-600 px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer flex items-center gap-2 shadow-md shadow-rose-500/10"
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  )
}
