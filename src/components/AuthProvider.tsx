'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { FullScreenLoader } from '@/components/ui/full-screen-loader'
import { supabase } from '@/lib/supabase'

interface AuthContextType {
  user: any | null
  logout: () => void
}

const AuthContext = createContext<AuthContextType>({ user: null, logout: () => {} })

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  const publicRoutes = ['/', '/auth', '/walkthrough']

  useEffect(() => {
    const checkAuth = () => {
      const userStr = localStorage.getItem('agentops_user')
      if (userStr) {
        try {
          const parsed = JSON.parse(userStr)
          setUser(parsed)
        } catch (e) {
          setUser(null)
          localStorage.removeItem('agentops_user')
        }
      } else {
        setUser(null)
      }
      setLoading(false)
    }

    // 1. Initial check of local storage
    checkAuth()

    // 2. Subscribe to Supabase auth events (to sync Google Auth sessions to localStorage)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        const email = session.user.email || ''
        const name = session.user.user_metadata?.full_name || session.user.user_metadata?.name || email.split('@')[0]
        const id = session.user.id
        
        const loggedUser = { id, name, email }
        localStorage.setItem('agentops_user', JSON.stringify(loggedUser))
        setUser(loggedUser)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [pathname])

  useEffect(() => {
    if (!loading) {
      const isPublicRoute = publicRoutes.some(route => pathname === route || pathname?.startsWith(route + '/'))
      if (!user && !isPublicRoute) {
        router.replace('/auth')
      }
    }
  }, [user, loading, pathname, router])

  const logout = async () => {
    localStorage.removeItem('agentops_user')
    setUser(null)
    await supabase.auth.signOut()
    router.replace('/auth')
  }

  if (loading) {
    return <FullScreenLoader />
  }

  return (
    <AuthContext.Provider value={{ user, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
