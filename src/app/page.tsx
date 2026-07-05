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


            <div className="flex items-center gap-4">
              <Link
                href="/chat"
                className="bg-white text-black px-6 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors cursor-pointer hidden sm:block"
              >
                Start a Chat
              </Link>
              
              {/* User Menu */}
              <Link href="/settings" className="bg-white/10 hover:bg-white/20 border border-white/20 text-white w-10 h-10 rounded-full flex items-center justify-center transition-colors cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </Link>
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
                  <Link
                    href="/create-chatbot"
                    className="bg-transparent border border-white/40 text-white px-8 py-3 rounded-lg font-medium hover:bg-white/10 transition-colors cursor-pointer backdrop-blur-sm"
                  >
                    Build My Chatbot
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
