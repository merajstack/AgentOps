'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { ArrowLeft, Plus, Send, MessageSquare, Trash2, Menu, Copy, Check, Pencil, Paperclip, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Loader } from '@/components/ui/loader'
import { cn } from '@/lib/utils'

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

export interface Conversation {
  id: string
  title: string
  messages: Message[]
  createdAt: number
  updatedAt: number
}

function generateTitle(message: string): string {
  return message.length > 40 ? message.slice(0, 40) + '…' : message
}

export default function ChatPage() {
  const router = useRouter()
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [attachment, setAttachment] = useState<File | null>(null)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 1. Get user email on mount
  useEffect(() => {
    const userStr = localStorage.getItem('agentops_user')
    if (userStr) {
      try {
        const user = JSON.parse(userStr)
        setUserEmail(user.email)
      } catch (e) {
        router.replace('/auth')
      }
    } else {
      router.replace('/auth')
    }
  }, [router])

  // 2. Fetch conversations from Supabase when email is known
  useEffect(() => {
    async function fetchChats() {
      if (!userEmail) return
      try {
        const { data, error } = await supabase
          .from('conversations')
          .select('*')
          .eq('user_email', userEmail)
          .order('updated_at', { ascending: false })
          
        if (error) throw error
        
        if (data && data.length > 0) {
          const parsed = data.map(row => ({
            id: row.id,
            title: row.title,
            messages: row.messages,
            createdAt: new Date(row.created_at).getTime(),
            updatedAt: new Date(row.updated_at).getTime()
          }))
          setConversations(parsed)
          setActiveId(parsed[0].id)
        }
      } catch (err: any) {
        // Only log if it's not the 'table does not exist' error (code 42P01)
        if (err?.code !== '42P01') {
          console.warn("Could not load conversations from database. Did you run the SQL script?", err)
        }
      }
    }
    fetchChats()
  }, [userEmail])

  const active = conversations.find((c) => c.id === activeId) ?? null

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [active?.messages, isTyping])

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto'
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 200) + 'px'
    }
  }, [input])

  const handleNewChat = () => {
    const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString()
    const conv: Conversation = {
      id,
      title: 'New Chat',
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
    setConversations((prev) => [conv, ...prev])
    setActiveId(conv.id)
    setSidebarOpen(false)
    setInput('')
    setAttachment(null)
  }

  const handleDelete = async (id: string) => {
    // Optimistic UI update
    const updated = conversations.filter((c) => c.id !== id)
    setConversations(updated)
    if (activeId === id) {
      setActiveId(updated.length > 0 ? updated[0].id : null)
    }
    
    // Delete from DB
    if (userEmail) {
      await supabase.from('conversations').delete().eq('id', id).eq('user_email', userEmail)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAttachment(e.target.files[0])
    }
  }

  const syncConversationToDb = async (conv: Conversation) => {
    if (!userEmail) return
    try {
      await supabase.from('conversations').upsert({
        id: conv.id,
        user_email: userEmail,
        title: conv.title,
        messages: conv.messages,
        updated_at: new Date(conv.updatedAt).toISOString()
      })
    } catch (err) {
      console.error("Failed to sync conversation:", err)
    }
  }

  const handleSend = async () => {
    const text = input.trim()
    if ((!text && !attachment) || isTyping) return

    let finalMessageText = text
    if (attachment) {
      finalMessageText += finalMessageText ? `\n\n[Attached: ${attachment.name}]` : `[Attached: ${attachment.name}]`
    }

    let convId = activeId
    let currentMessages = active ? active.messages : []
    let currentTitle = active?.title || 'New Chat'

    if (!convId) {
      convId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString()
      currentTitle = generateTitle(finalMessageText)
    } else if (currentMessages.length === 0) {
      currentTitle = generateTitle(finalMessageText)
    }

    const userMsg: Message = {
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(),
      role: 'user',
      content: finalMessageText,
      timestamp: Date.now(),
    }

    const updatedMessages = [...currentMessages, userMsg]
    
    const updatedConv: Conversation = {
      id: convId,
      title: currentTitle,
      messages: updatedMessages,
      createdAt: active ? active.createdAt : Date.now(),
      updatedAt: Date.now()
    }

    // Update state & sync
    setConversations((prev) => {
      const exists = prev.some(c => c.id === convId)
      if (exists) {
        return prev.map(c => c.id === convId ? updatedConv : c)
      }
      return [updatedConv, ...prev]
    })
    setActiveId(convId)
    syncConversationToDb(updatedConv)

    setInput('')
    setAttachment(null)
    setIsTyping(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updatedMessages }),
      })

      const data = await res.json()

      const aiMsg: Message = {
        id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(),
        role: 'assistant',
        content: data.content,
        timestamp: Date.now(),
      }

      const finalConv = {
        ...updatedConv,
        messages: [...updatedMessages, aiMsg],
        updatedAt: Date.now()
      }
      
      setConversations((prev) => prev.map(c => c.id === convId ? finalConv : c))
      syncConversationToDb(finalConv)
      
    } catch (err: any) {
      const errorMsg: Message = {
        id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(),
        role: 'assistant',
        content: `Error: ${err.message || 'Failed to connect to AI.'}`,
        timestamp: Date.now(),
      }
      const errorConv = {
        ...updatedConv,
        messages: [...updatedMessages, errorMsg],
        updatedAt: Date.now()
      }
      setConversations((prev) => prev.map(c => c.id === convId ? errorConv : c))
      syncConversationToDb(errorConv)
    } finally {
      setIsTyping(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex h-screen bg-white text-slate-800 overflow-hidden font-sans">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Waterblue gradient theme */}
      <aside
        className={`
          fixed md:relative z-40 h-full w-72 flex flex-col
          bg-gradient-to-b from-[#f0f9ff] via-[#e0f2fe] to-[#bae6fd] border-r border-sky-100
          transition-transform duration-300
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {/* Sidebar header */}
        <div className="p-4 flex items-center justify-between border-b border-sky-200/60">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition-colors cursor-pointer font-medium"
          >
            <ArrowLeft size={16} />
            <span>Back</span>
          </button>
          <button
            onClick={handleNewChat}
            className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition-colors cursor-pointer font-medium"
          >
            <Plus size={16} />
            <span>New Chat</span>
          </button>
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto chat-scrollbar p-2 space-y-1">
          {conversations.length === 0 && (
            <p className="text-sm text-slate-500 text-center mt-8 px-4">
              No conversations yet. Start a new chat!
            </p>
          )}
          {conversations.map((conv) => (
            <div
              key={conv.id}
              className={`
                group flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer transition-all
                ${activeId === conv.id
                  ? 'bg-white/90 border border-sky-300/50 shadow-sm text-slate-900'
                  : 'hover:bg-white/40 text-slate-700'
                }
              `}
              onClick={() => {
                setActiveId(conv.id)
                setSidebarOpen(false)
              }}
            >
              <MessageSquare size={14} className="text-sky-500 shrink-0" />
              <span className="text-sm truncate flex-1 font-medium">{conv.title}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleDelete(conv.id)
                }}
                className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-all cursor-pointer"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>

        {/* Sidebar footer */}
        <div className="p-4 border-t border-sky-200/60">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full overflow-hidden shadow-md shadow-sky-500/10 shrink-0">
              <img src="/icon.png" alt="AgentOps" className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">AgentOps Assistant</p>
              <p className="text-xs text-slate-500">AI Intelligence</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-white">
        {/* Chat header */}
        <header className="h-14 flex items-center px-4 border-b border-sky-100 bg-white/95 backdrop-blur-md shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden mr-3 text-slate-500 hover:text-slate-800 cursor-pointer"
          >
            <Menu size={20} />
          </button>
          <h2 className="text-sm font-semibold text-slate-800 truncate">
            {active ? active.title : 'AgentOps Chat'}
          </h2>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto chat-scrollbar bg-[#f8fafc]">
          {!active || active.messages.length === 0 ? (
            <EmptyState onQuestionClick={(q) => setInput(q)} />
          ) : (
            <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
              {active.messages.map((msg) => (
                <MessageBubble
                  key={msg.id}
                  message={msg}
                  onEdit={(text) => setInput(text)}
                />
              ))}
              {isTyping && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input bar */}
        <div className="shrink-0 px-4 pb-4 pt-2 bg-white border-t border-sky-100">
          <div className="max-w-3xl mx-auto">
            {/* Attachment preview */}
            {attachment && (
              <div className="mb-2 flex items-center gap-2 bg-sky-50 text-sky-700 px-3 py-1.5 rounded-lg border border-sky-100 text-sm max-w-fit shadow-sm">
                <Paperclip size={14} className="shrink-0" />
                <span className="truncate max-w-[200px]">{attachment.name}</span>
                <button 
                  onClick={() => setAttachment(null)}
                  className="ml-1 text-sky-400 hover:text-sky-700 cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>
            )}
            
            <div className="rounded-2xl border border-sky-200/80 bg-white shadow-[0_10px_30px_rgba(14,165,233,0.06)] flex items-end gap-2 px-3 py-3 relative">
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-sky-500 hover:bg-sky-50 transition-colors cursor-pointer"
                title="Attach file"
              >
                <Paperclip size={18} />
              </button>
              
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Message AgentOps..."
                rows={1}
                className="flex-1 bg-transparent text-slate-800 placeholder-slate-400 outline-none resize-none text-sm leading-relaxed max-h-[200px] py-1"
              />
              
              <button
                onClick={handleSend}
                disabled={(!input.trim() && !attachment) || isTyping}
                className={`
                  shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer
                  ${(input.trim() || attachment) && !isTyping
                    ? 'bg-sky-500 text-white hover:bg-sky-600 shadow-md shadow-sky-500/10'
                    : 'bg-slate-100 text-slate-300'
                  }
                `}
              >
                <Send size={16} />
              </button>
            </div>
            <p className="text-[11px] text-slate-400 text-center mt-2">
              Chats are securely stored in your account.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}

function EmptyState({ onQuestionClick }: { onQuestionClick: (q: string) => void }) {
  return (
    <div className="h-full flex flex-col items-center justify-center px-4 py-8 bg-white">
      <div className="w-16 h-16 rounded-2xl bg-sky-50 flex items-center justify-center mb-6 border border-sky-100 shadow-sm shadow-sky-500/5">
        <MessageSquare size={28} className="text-sky-500" />
      </div>
      <h3 className="text-xl font-semibold text-slate-800 mb-2">How can AgentOps automate your workflows?</h3>
      <p className="text-sm text-slate-500 text-center max-w-md">
        Ask for an automation setup to generate floating chatbot widgets linked directly to webhook services.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-8 max-w-lg w-full">
        {[
          'Give me an automation setup for business inquiries',
          'Give me an automation setup for client invoicing',
          'Give me an automation setup for generating leads',
          'How does the floating chatbot automation webhook work?',
        ].map((q) => (
          <button
            key={q}
            onClick={() => onQuestionClick(q)}
            className="rounded-xl border border-sky-100 bg-[#f0f9ff]/40 px-4 py-3 text-left text-sm text-slate-700 hover:border-sky-300 hover:bg-[#e0f2fe]/40 transition-all cursor-pointer font-medium"
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  )
}

function ImageWithLoader({ src, alt }: { src: string; alt: string }) {
  const [loaded, setLoaded] = useState(false)

  return (
    <>
      {!loaded && (
        <div className="image-loader-overlay">
          <Loader />
        </div>
      )}
      <img 
        src={src} 
        alt={alt}
        onLoad={() => {
          setTimeout(() => setLoaded(true), 2000)
        }}
        className={cn(
          "max-w-full rounded-lg mt-2 mb-2 transition-opacity duration-500",
          loaded ? "opacity-100" : "opacity-0"
        )} 
      />
    </>
  )
}

function renderBoldAndCode(text: string, isUser: boolean) {
  if (text.trim().startsWith('```') || text.includes('```')) {
    return <code className="block bg-slate-900 text-slate-100 p-3 rounded-lg border border-slate-800 text-xs font-mono whitespace-pre leading-relaxed">{text.replace(/```/g, '')}</code>
  }

  const parts = text.split(/(\*\*.*?\*\*|`.*?`|!\[.*?\]\(.*?\))/g)
  return parts.map((part, i) => {
    if (part.startsWith('![') && part.endsWith(')')) {
      const altMatch = part.match(/!\[(.*?)\]/)
      const urlMatch = part.match(/\((.*?)\)/)
      if (altMatch && urlMatch) {
        return <ImageWithLoader key={i} src={urlMatch[1]} alt={altMatch[1]} />
      }
    }
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className={`font-semibold ${isUser ? 'text-white' : 'text-slate-900'}`}>{part.slice(2, -2)}</strong>
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return <code key={i} className={`px-1.5 py-0.5 rounded text-xs font-mono ${isUser ? 'bg-sky-600 text-white' : 'bg-slate-100 text-sky-700'}`}>{part.slice(1, -1)}</code>
    }
    return part
  })
}

function MessageBubble({ message, onEdit }: { message: Message; onEdit: (text: string) => void }) {
  const isUser = message.role === 'user'
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback
    }
  }

  return (
    <div className={`group flex gap-3 message-enter ${isUser ? 'justify-end' : ''}`}>
      {!isUser && (
        <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 shadow-md shadow-sky-500/10 overflow-hidden bg-white">
          <img src="/icon.png" alt="AgentOps Bot" className="w-full h-full object-cover" />
        </div>
      )}

      <div className={`flex flex-col gap-1 max-w-[85%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`
            rounded-2xl px-4 py-3 text-sm leading-relaxed overflow-x-auto w-full
            ${isUser
              ? 'bg-sky-500 text-white shadow-sm shadow-sky-500/5'
              : 'bg-white text-slate-800 border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)]'
            }
          `}
        >
          {message.content.split('\n').map((line, i) => (
            <p key={i} className={i > 0 ? 'mt-2' : ''}>
              {renderBoldAndCode(line, isUser)}
            </p>
          ))}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
          {!isUser && (
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 px-2 py-1 rounded-md text-xs text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
            >
              {copied ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
              <span className={copied ? 'text-green-500' : ''}>{copied ? 'Copied!' : 'Copy'}</span>
            </button>
          )}
          {isUser && (
            <button
              onClick={() => onEdit(message.content)}
              className="flex items-center gap-1 px-2 py-1 rounded-md text-xs text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
            >
              <Pencil size={12} />
              <span>Edit</span>
            </button>
          )}
        </div>
      </div>

      {isUser && (
        <div className="w-7 h-7 rounded-full bg-sky-100 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 text-sky-700 border border-sky-200">
          U
        </div>
      )}
    </div>
  )
}

function TypingIndicator() {
  return (
    <div className="flex gap-3 message-enter">
      <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 shadow-md shadow-sky-500/10 overflow-hidden bg-white">
        <img src="/icon.png" alt="AgentOps Bot" className="w-full h-full object-cover" />
      </div>
      <div className="flex items-center gap-1 py-3 px-2">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-2 h-2 bg-sky-400 rounded-full animate-bounce"
            style={{ animationDelay: `${i * 150}ms` }}
          />
        ))}
      </div>
    </div>
  )
}
