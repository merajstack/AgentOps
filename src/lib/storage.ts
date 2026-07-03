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

// Storage keys
const STORAGE_KEY = 'agentops_conversations'
const ACTIVE_KEY = 'agentops_active_conversation'

export function loadConversations(): Conversation[] {
  if (typeof window === 'undefined') return []
  try {
    const data = sessionStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

export function saveConversations(conversations: Conversation[]) {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(conversations))
  } catch {}
}

export function getActiveConversationId(): string | null {
  if (typeof window === 'undefined') return null
  try {
    return sessionStorage.getItem(ACTIVE_KEY)
  } catch {
    return null
  }
}

export function setActiveConversationId(id: string | null) {
  if (typeof window === 'undefined') return
  try {
    if (id) {
      sessionStorage.setItem(ACTIVE_KEY, id)
    } else {
      sessionStorage.removeItem(ACTIVE_KEY)
    }
  } catch {}
}

export function createConversation(title: string = 'New Chat'): Conversation {
  return {
    id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2),
    title,
    messages: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }
}

export function generateTitle(message: string): string {
  return message.length > 40 ? message.slice(0, 40) + '…' : message
}

