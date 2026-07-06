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
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        const email = session.user.email || ''
        const name = session.user.user_metadata?.full_name || session.user.user_metadata?.name || email.split('@')[0]
        const id = session.user.id
        setUser({ id, name, email })
      } else {
        setUser(null)
      }
      setLoading(false)
    }

    // 1. Initial check of session
    checkAuth()

    // 2. Subscribe to Supabase auth events
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        const email = session.user.email || ''
        const name = session.user.user_metadata?.full_name || session.user.user_metadata?.name || email.split('@')[0]
        const id = session.user.id
        
        setUser({ id, name, email })

        // After OAuth callback (tokens are in the URL hash), redirect to home
        if (event === 'SIGNED_IN' && typeof window !== 'undefined' && window.location.hash.includes('access_token')) {
          // Clean the URL and navigate to home
          router.replace('/')
        }
      } else {
        setUser(null)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [pathname])

  useEffect(() => {
    if (loading) return

    const isPublicRoute = publicRoutes.some(
      (route) => pathname === route || pathname?.startsWith(route + '/')
    )

    // Guard only after we know the session state.
    // Otherwise, the app can bounce to /auth during OAuth session rehydration.
    if (!user && !isPublicRoute) {
      router.replace('/auth')
    }
  }, [user, loading, pathname, router])

  // Extra protection against OAuth token callback timing:
  // If Supabase is already in a signed-in state but our React state hasn't caught up,
  // avoid immediate redirect.
  useEffect(() => {
    if (loading) return
    if (publicRoutes.some((route) => pathname === route || pathname?.startsWith(route + '/'))) return

    const maybeSignedIn = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) return
      router.replace('/auth')
    }

    if (!user) maybeSignedIn()
  }, [user, loading, pathname, router])


  const logout = async () => {
    localStorage.clear()
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
