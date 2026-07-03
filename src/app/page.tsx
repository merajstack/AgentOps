'use client'

import { FadeIn, AnimatedHeading } from '../components/Animations'
import Link from 'next/link'

export default function HeroPage() {
  return (
    <div className="relative w-full h-screen overflow-hidden bg-black text-white">
      {/* Video Background */}
      <video
        className="absolute inset-0 w-full h-full object-cover"
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260403_050628_c4e32401-fab4-4a27-b7a8-6e9291cd5959.mp4"
        autoPlay
        loop
        muted
        playsInline
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col h-full">
        {/* Navbar */}
        <nav className="px-6 md:px-12 lg:px-16 pt-6">
          <div className="liquid-glass rounded-xl px-4 py-2 flex items-center justify-between">
            <span className="text-2xl font-semibold tracking-tight">AgentOps</span>
            <div className="hidden md:flex items-center gap-8">
              <Link href="/walkthrough" className="text-sm text-white hover:text-gray-300 transition-colors">
                Walkthrough
              </Link>
              <a href="#" className="text-sm text-white hover:text-gray-300 transition-colors">
                Building
              </a>
              <div className="relative group py-2">
                <button className="text-sm text-white hover:text-gray-300 transition-colors cursor-pointer">
                  Our Products
                </button>
                <div className="absolute top-full left-0 hidden group-hover:block bg-black/80 backdrop-blur-md border border-white/20 rounded-lg py-2 w-56">
                  <Link href="/chat?q=Invoice Automation" className="block px-4 py-2 text-sm text-white hover:bg-white/10 transition-colors">
                    Invoice Automation
                  </Link>
                  <Link href="/chat?q=Customer Support Bot" className="block px-4 py-2 text-sm text-white hover:bg-white/10 transition-colors">
                    Customer Support Bot
                  </Link>
                  <Link href="/chat?q=Data Extraction" className="block px-4 py-2 text-sm text-white hover:bg-white/10 transition-colors">
                    Data Extraction
                  </Link>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/chat"
                className="bg-white text-black px-6 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors cursor-pointer hidden sm:block"
              >
                Start a Chat
              </Link>
              
              {/* User Menu */}
              <div className="relative group py-2">
                <button className="bg-white/10 hover:bg-white/20 border border-white/20 text-white w-10 h-10 rounded-full flex items-center justify-center transition-colors cursor-pointer">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                </button>
                <div className="absolute top-full right-0 hidden group-hover:block bg-black/90 backdrop-blur-md border border-white/20 rounded-lg py-2 w-48 shadow-xl">
                  <Link href="/settings" className="block px-4 py-2 text-sm text-white hover:bg-white/10 transition-colors">
                    Account Settings
                  </Link>
                  <button 
                    onClick={() => {
                      localStorage.removeItem('agentops_user')
                      window.location.href = '/auth'
                    }} 
                    className="w-full text-left block px-4 py-2 text-sm text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="flex-1 flex flex-col justify-end px-6 md:px-12 lg:px-16 pb-12 lg:pb-16">
          <div className="lg:grid lg:grid-cols-2 lg:items-end">
            {/* Left Column */}
            <div>
              <AnimatedHeading
                text={"Automating India's future."}
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-normal leading-none whitespace-nowrap mb-4"
              />
              <FadeIn delay={800} duration={1000}>
                <p className="text-base md:text-lg text-gray-300 mb-5">
                  We back visionaries and craft ventures that define what comes next.
                </p>
              </FadeIn>
              <FadeIn delay={1200} duration={1000}>
                <div className="flex flex-wrap gap-4">
                  <Link
                    href="/chat"
                    className="bg-white text-black px-8 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    Start a Chat
                  </Link>
                </div>
              </FadeIn>
            </div>

            {/* Right Column */}
            <FadeIn delay={1400} duration={1000} className="flex items-end justify-start lg:justify-end mt-8 lg:mt-0">
              <div className="liquid-glass border border-white/20 px-6 py-3 rounded-xl">
                <span className="text-lg md:text-xl lg:text-2xl font-light">
                  Automating. Optimizing. Scaling.
                </span>
              </div>
            </FadeIn>
          </div>
        </div>
      </div>
    </div>
  )
}
