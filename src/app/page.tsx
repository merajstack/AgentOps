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
              {['Story', 'Investing', 'Building', 'Advisory'].map((link) => (
                <a
                  key={link}
                  href="#"
                  className="text-sm text-white hover:text-gray-300 transition-colors"
                >
                  {link}
                </a>
              ))}
            </div>
            <Link
              href="/chat"
              className="bg-white text-black px-6 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors cursor-pointer"
            >
              Start a Chat
            </Link>
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
                  <button className="liquid-glass border border-white/20 text-white px-8 py-3 rounded-lg font-medium hover:bg-white hover:text-black transition-all cursor-pointer">
                    Explore Now
                  </button>
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
