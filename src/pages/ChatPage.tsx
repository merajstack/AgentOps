import { useState, useRef, useEffect, useCallback } from 'react'
import { ArrowLeft, Plus, Send, MessageSquare, Trash2, Menu } from 'lucide-react'
import {
  type Conversation,
  type Message,
  loadConversations,
  saveConversations,
  createConversation,
  generateTitle,
  getAIResponse,
  getActiveConversationId,
  setActiveConversationId,
} from '../lib/storage'

interface ChatPageProps {
  onBack: () => void
}

export default function ChatPage({ onBack }: ChatPageProps) {
  const [conversations, setConversations] = useState<Conversation[]>(loadConversations)
  const [activeId, setActiveId] = useState<string | null>(getActiveConversationId)
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const active = conversations.find((c) => c.id === activeId) ?? null

  // Persist on change
  useEffect(() => {
    saveConversations(conversations)
  }, [conversations])

  useEffect(() => {
    setActiveConversationId(activeId)
  }, [activeId])

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

  const updateConversation = useCallback(
    (id: string, updater: (c: Conversation) => Conversation) => {
      setConversations((prev) =>
        prev.map((c) => (c.id === id ? updater(c) : c))
      )
    },
    []
  )

  const handleNewChat = () => {
    const conv = createConversation()
    setConversations((prev) => [conv, ...prev])
    setActiveId(conv.id)
    setSidebarOpen(false)
    setInput('')
  }

  const handleDelete = (id: string) => {
    setConversations((prev) => prev.filter((c) => c.id !== id))
    if (activeId === id) setActiveId(null)
  }

  const handleSend = async () => {
    const text = input.trim()
    if (!text || isTyping) return

    let convId = activeId
    if (!convId) {
      const conv = createConversation(generateTitle(text))
      setConversations((prev) => [conv, ...prev])
      convId = conv.id
      setActiveId(conv.id)
    }

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text,
      timestamp: Date.now(),
    }

    updateConversation(convId, (c) => ({
      ...c,
      messages: [...c.messages, userMsg],
      title: c.messages.length === 0 ? generateTitle(text) : c.title,
      updatedAt: Date.now(),
    }))

    setInput('')
    setIsTyping(true)

    // Simulate AI response delay
    await new Promise((r) => setTimeout(r, 1000 + Math.random() * 1500))

    const aiMsg: Message = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: getAIResponse(),
      timestamp: Date.now(),
    }

    updateConversation(convId!, (c) => ({
      ...c,
      messages: [...c.messages, aiMsg],
      updatedAt: Date.now(),
    }))
    setIsTyping(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex h-screen bg-[#061521] text-white overflow-hidden">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-[#04111c]/70 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:relative z-40 h-full w-72 flex flex-col
          bg-gradient-to-b from-[#071a2a] via-[#061521] to-[#04111c] border-r border-white/10
          transition-transform duration-300
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {/* Sidebar header */}
        <div className="p-4 flex items-center justify-between border-b border-white/10">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft size={16} />
            <span>Back</span>
          </button>
          <button
            onClick={handleNewChat}
            className="flex items-center gap-2 text-sm text-slate-300 hover:text-white transition-colors cursor-pointer"
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
                group flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer transition-colors
                ${activeId === conv.id ? 'bg-white/12 ring-1 ring-white/10' : 'hover:bg-white/5'}
              `}
              onClick={() => {
                setActiveId(conv.id)
                setSidebarOpen(false)
              }}
            >
              <MessageSquare size={14} className="text-sky-200/70 shrink-0" />
              <span className="text-sm truncate flex-1">{conv.title}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleDelete(conv.id)
                }}
                className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-cyan-300 transition-all cursor-pointer"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>

        {/* Sidebar footer */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-700 flex items-center justify-center text-xs font-semibold text-white shadow-lg shadow-cyan-500/20">
              A
            </div>
            <div>
              <p className="text-sm font-medium">AgentOps Assistant</p>
              <p className="text-xs text-gray-500">Session Storage</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Chat header */}
        <header className="h-14 flex items-center px-4 border-b border-white/10 shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden mr-3 text-slate-300 hover:text-white cursor-pointer"
          >
            <Menu size={20} />
          </button>
          <h2 className="text-sm font-medium truncate text-white">
            {active ? active.title : 'AgentOps Chat'}
          </h2>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto chat-scrollbar">
          {!active || active.messages.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
              {active.messages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} />
              ))}
              {isTyping && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input bar */}
        <div className="shrink-0 px-4 pb-4 pt-2">
          <div className="max-w-3xl mx-auto">
            <div className="rounded-2xl border border-cyan-100/10 bg-[#0a2238]/70 backdrop-blur-md shadow-[0_20px_80px_rgba(2,8,23,0.35)] flex items-end gap-2 px-4 py-3">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Message AgentOps..."
                rows={1}
                className="flex-1 bg-transparent text-white placeholder-slate-400 outline-none resize-none text-sm leading-relaxed max-h-[200px]"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className={`
                  shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer
                  ${input.trim() && !isTyping
                    ? 'bg-white text-[#061521] hover:bg-sky-100'
                    : 'bg-white/10 text-slate-500'
                  }
                `}
              >
                <Send size={16} />
              </button>
            </div>
            <p className="text-[11px] text-slate-500 text-center mt-2">
              AgentOps can make mistakes. Messages stored in session storage.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="h-full flex flex-col items-center justify-center px-4">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400/15 to-blue-500/10 flex items-center justify-center mb-6 border border-white/10 shadow-lg shadow-cyan-500/10">
        <MessageSquare size={28} className="text-sky-100/70" />
      </div>
      <h3 className="text-xl font-medium mb-2">How can I help you today?</h3>
      <p className="text-sm text-slate-400 text-center max-w-md">
        Start a conversation with AgentOps. Ask anything about automation, AI agents, or operations.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-8 max-w-lg w-full">
        {[
          'What investment strategies do you recommend?',
          'Help me build a business plan',
          'Explain venture capital basics',
          'How to evaluate a startup?',
        ].map((q) => (
          <button
            key={q}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm text-slate-200 backdrop-blur-sm hover:border-cyan-200/25 hover:text-white transition-all cursor-pointer"
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  )
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user'
  return (
    <div className={`flex gap-3 message-enter ${isUser ? 'justify-end' : ''}`}>
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-cyan-400 to-blue-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 text-white shadow-lg shadow-cyan-500/20">
          A
        </div>
      )}
      <div
        className={`
          max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed
          ${isUser
            ? 'bg-gradient-to-br from-cyan-500/20 to-blue-500/20 text-white border border-cyan-300/20'
            : 'bg-white/5 text-slate-100 border border-white/10'
          }
        `}
      >
        {message.content.split('\n').map((line, i) => (
          <p key={i} className={i > 0 ? 'mt-2' : ''}>
            {renderBold(line)}
          </p>
        ))}
      </div>
      {isUser && (
        <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 text-white border border-white/10">
          U
        </div>
      )}
    </div>
  )
}

function renderBold(text: string) {
  const parts = text.split(/(\*\*.*?\*\*)/g)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-semibold text-white">{part.slice(2, -2)}</strong>
    }
    return part
  })
}

function TypingIndicator() {
  return (
    <div className="flex gap-3 message-enter">
      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-cyan-300 to-blue-700 flex items-center justify-center text-xs font-bold shrink-0 text-white shadow-lg shadow-cyan-500/20">
        A
      </div>
      <div className="flex items-center gap-1 py-3 px-2">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-2 h-2 bg-sky-200/70 rounded-full animate-bounce"
            style={{ animationDelay: `${i * 150}ms` }}
          />
        ))}
      </div>
    </div>
  )
}
