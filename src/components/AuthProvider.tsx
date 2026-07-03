'use client'

import React, { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)

  useEffect(() => {
    // API routes are not handled by this React wrapper, but just in case, allow /api to pass
    if (pathname.startsWith('/api')) {
      setIsAuthenticated(true)
      return
    }

    const checkAuth = () => {
      const user = localStorage.getItem('agentops_user')
      if (user) {
        setIsAuthenticated(true)
        if (pathname === '/auth') {
          router.replace('/') // Prevent authenticated users from going back to auth page
        }
      } else {
        setIsAuthenticated(false)
        if (pathname !== '/auth') {
          router.replace('/auth')
        }
      }
    }

    checkAuth()
  }, [pathname, router])

  // If auth state is still determining, show a loading state to prevent content flash
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
      </div>
    )
  }

  // If we are on the auth page and not authenticated, render children (the auth page)
  if (!isAuthenticated && pathname === '/auth') {
    return <>{children}</>
  }

  // If not authenticated and not on auth page, render nothing while redirect happens
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
      </div>
    )
  }

  return <>{children}</>
}
