'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, User, Mail, LogOut, Loader2, Trash2, CameraOff } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { deleteFaceData, hasFaceData } from '@/lib/faceStore'

export default function SettingsPage() {
  const router = useRouter()
  const [userData, setUserData] = useState<{ id: string; name: string; email: string } | null>(null)
  const [hasFace, setHasFace] = useState(false)
  const [isDeletingChat, setIsDeletingChat] = useState(false)
  const [isDeletingFace, setIsDeletingFace] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const user = localStorage.getItem('agentops_user')
    if (user) {
      try {
        const parsed = JSON.parse(user)
        setUserData(parsed)
        hasFaceData(parsed.email).then(setHasFace)
      } catch (e) {
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
    } catch (err: any) {
      setMessage('Failed to delete chat history.')
    } finally {
      setIsDeletingChat(false)
      setTimeout(() => setMessage(''), 3000)
    }
  }

  const handleDeleteFaceData = async () => {
    if (!userData) return
    setIsDeletingFace(true)
    setMessage('')
    try {
      await deleteFaceData(userData.email)
      setHasFace(false)
      setMessage('Face data deleted successfully.')
    } catch (err) {
      setMessage('Failed to delete face data.')
    } finally {
      setIsDeletingFace(false)
      setTimeout(() => setMessage(''), 3000)
    }
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
      </div>
    )
  }

  return (
    <div className="relative min-h-screen bg-black text-white flex flex-col font-sans overflow-x-hidden">
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-cyan-950/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-950/20 blur-[120px] pointer-events-none" />

      <header className="px-6 md:px-12 lg:px-16 pt-6 relative z-10">
        <div className="liquid-glass rounded-xl px-4 py-2 flex items-center justify-between">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-sm text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft size={16} />
            <span>Back to Home</span>
          </button>
          <span className="text-sm font-semibold tracking-wider text-cyan-400">SETTINGS</span>
        </div>
      </header>

      <main className="flex-1 flex justify-center py-12 px-4 relative z-10">
        <div className="w-full max-w-2xl">
          
          <div className="mb-8">
            <h1 className="text-3xl font-light tracking-tight mb-2">Account Settings</h1>
            <p className="text-gray-400 text-sm">Manage your profile and preferences.</p>
          </div>

          {message && (
            <div className="mb-6 p-4 bg-cyan-900/30 border border-cyan-500/50 text-cyan-400 rounded-lg text-sm text-center">
              {message}
            </div>
          )}

          <div className="liquid-glass border border-white/10 rounded-2xl p-6 md:p-8 space-y-8">
            
            {/* Profile Section */}
            <div>
              <h2 className="text-lg font-medium border-b border-white/10 pb-2 mb-6">Profile Information</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                    User ID
                  </label>
                  <div className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-gray-300 flex items-center justify-between">
                    <span>{userData.id}</span>
                    <span className="text-[10px] bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded uppercase font-bold tracking-wider">Generated</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2 flex items-center gap-2">
                    <User size={14} /> Full Name
                  </label>
                  <input
                    type="text"
                    value={userData.name}
                    disabled
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-gray-300 cursor-not-allowed opacity-80"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2 flex items-center gap-2">
                    <Mail size={14} /> Email Address
                  </label>
                  <input
                    type="email"
                    value={userData.email}
                    disabled
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-gray-300 cursor-not-allowed opacity-80"
                  />
                </div>
              </div>
            </div>

            {/* Data Management Section */}
            <div className="pt-4">
              <h2 className="text-lg font-medium text-white border-b border-white/10 pb-2 mb-6">Data Management</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl p-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-200">Delete Chat History</h3>
                    <p className="text-xs text-gray-400 mt-1">Permanently remove all your conversations from AgentOps servers.</p>
                  </div>
                  <button
                    onClick={handleDeleteChatHistory}
                    disabled={isDeletingChat}
                    className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer flex items-center gap-2 disabled:opacity-50"
                  >
                    {isDeletingChat ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                    <span>Clear Chats</span>
                  </button>
                </div>

                <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl p-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-200">Face Verification Data</h3>
                    <p className="text-xs text-gray-400 mt-1">
                      {hasFace ? 'You have registered face data for login.' : 'No face data registered on this device.'}
                    </p>
                  </div>
                  <button
                    onClick={handleDeleteFaceData}
                    disabled={isDeletingFace || !hasFace}
                    className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isDeletingFace ? <Loader2 size={16} className="animate-spin" /> : <CameraOff size={16} />}
                    <span>Delete Face Data</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="pt-4">
              <h2 className="text-lg font-medium text-rose-400 border-b border-rose-500/20 pb-2 mb-6">Danger Zone</h2>
              <div className="flex items-center justify-between bg-rose-500/10 border border-rose-500/20 rounded-xl p-4">
                <div>
                  <h3 className="text-sm font-medium text-rose-300">Log out</h3>
                  <p className="text-xs text-rose-400/70 mt-1">End your current session on this device.</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer flex items-center gap-2"
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
