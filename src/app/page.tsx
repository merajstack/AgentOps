'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { FadeIn, AnimatedHeading } from '../components/Animations'
import Link from 'next/link'
import { Zap, ArrowDown, X } from 'lucide-react'
import WhyWeAreTheBest from '../components/WhyWeAreTheBest'

const WORKFLOW_CARDS = [
  { id: 1, src: '/a1.png', title: 'Sales Inquiry Automation' },
  { id: 2, src: '/a2.png', title: 'Webhook Automation' },
  { id: 3, src: '/a3.jpeg', title: 'Business Automation System' },
  { id: 4, src: '/a4.jpeg', title: 'AI Chatbot Workflow' },
]

export default function HeroPage() {

  const section2Ref = useRef<HTMLDivElement>(null)
  const videoSectionRef = useRef<HTMLElement>(null)
  const [zoomedCard, setZoomedCard] = useState<typeof WORKFLOW_CARDS[0] | null>(null)
  const [showVideoPopup, setShowVideoPopup] = useState(true)

  const scrollToVideo = useCallback(() => {
    setShowVideoPopup(false)
    videoSectionRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
          }
        })
      },
      { threshold: 0.15 }
    )

    const sections = document.querySelectorAll('.section-reveal')
    sections.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [])

  const handleClose = useCallback(() => setZoomedCard(null), [])

  // Escape key to close lightbox
  useEffect(() => {
    if (!zoomedCard) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose() }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [zoomedCard, handleClose])

  return (
    <div className="w-full overflow-x-hidden">
      {/* ── SECTION 0: Hero (existing) ────────────────────────────── */}
      <section className="relative w-full h-screen overflow-hidden bg-black text-white">
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

          {/* Scroll indicator */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
            <ArrowDown size={20} className="text-white/50" />
          </div>
        </div>
      </section>

      {/* ── SECTION 1: Loom Video ────────────────────────────────── */}
      <section ref={videoSectionRef} className="relative w-full h-screen overflow-hidden flex items-center justify-center px-6 bg-gradient-to-b from-black via-sky-950 to-[#f0f9ff]">
        <div className="w-full max-w-4xl aspect-[16/9] relative rounded-2xl overflow-hidden border border-white/10 shadow-[0_0_50px_rgba(14,165,233,0.15)]">
          <iframe
            src="https://www.loom.com/embed/e5edc11a5a194ef9855af41bc78a4c51"
            frameBorder="0"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
            style={{ border: 'none' }}
            title="AgentOps Demo"
          />
        </div>
      </section>

      {/* ── SECTION 1.5: Why We Are The Best ───────────────────────── */}
      <WhyWeAreTheBest />

      {/* ── SECTION 2: Automations + Workflow Cards (combined) ────── */}
      <section
        ref={section2Ref}
        className="relative w-full min-h-screen flex flex-col overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, #f0f9ff 0%, #e0f2fe 30%, #bae6fd 70%, #e0f2fe 100%)',
        }}
      >
        {/* Ocean decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[15%] right-[10%] w-3 h-3 rounded-full bg-sky-400/30 animate-bounce" style={{ animationDelay: '0s', animationDuration: '3s' }} />
          <div className="absolute top-[30%] left-[15%] w-2 h-2 rounded-full bg-cyan-400/40 animate-bounce" style={{ animationDelay: '0.5s', animationDuration: '2.5s' }} />
          <div className="absolute bottom-[10%] right-[20%] w-4 h-4 rounded-full bg-sky-300/20 animate-bounce" style={{ animationDelay: '1s', animationDuration: '3.5s' }} />
          <div className="absolute bottom-[30%] left-[8%] w-2.5 h-2.5 rounded-full bg-blue-400/25 animate-bounce" style={{ animationDelay: '1.5s', animationDuration: '2.8s' }} />
        </div>

        {/* Title area */}
        <div className="section-reveal relative z-10 flex flex-col items-center text-center px-6 pt-14 pb-6 md:pt-16 md:pb-8">
          <div className="mb-4 flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 border border-sky-200/60 backdrop-blur-sm shadow-sm shadow-sky-500/5">
            <Zap size={16} className="text-sky-600" />
            <span className="text-sm text-sky-800 font-semibold">Workflow Automation</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight leading-tight section-title-animated">
            <span className="text-slate-800">The automations to</span>
            <br />
            <span className="gradient-text-ocean">empower your business</span>
          </h2>

          <p className="mt-4 text-base md:text-lg text-sky-900/60 max-w-2xl section-subtitle-animated">
            Click any card to explore the full workflow diagram
          </p>
        </div>

        {/* Cards grid — fills the rest of the section */}
        <div className="relative z-10 flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 px-4 md:px-6 pb-6">
          {WORKFLOW_CARDS.map((card) => (
            <div
              key={card.id}
              onClick={() => setZoomedCard(card)}
              className="group relative rounded-2xl overflow-hidden cursor-pointer border border-white/40 bg-white/50 backdrop-blur-sm shadow-lg shadow-sky-500/5 hover:shadow-xl hover:shadow-sky-500/10 hover:border-sky-300/60 transition-all duration-300 hover:-translate-y-1"
            >
              <img
                src={card.src}
                alt={card.title}
                className="w-full h-full object-cover"
                loading="lazy"
                draggable={false}
              />
              {/* Hover overlay with title */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4 md:p-6">
                <span className="text-white font-semibold text-sm md:text-base">{card.title}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Zoom Lightbox ──────────────────────────────────────────── */}
      {zoomedCard && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 backdrop-blur-md animate-fadeIn cursor-zoom-out"
          onClick={handleClose}
        >
          <button
            onClick={handleClose}
            className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center text-white transition-colors cursor-pointer z-10"
          >
            <X size={20} />
          </button>
          <div
            className="relative max-w-[92vw] max-h-[90vh] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={zoomedCard.src}
              alt={zoomedCard.title}
              className="max-w-full max-h-[88vh] rounded-2xl shadow-2xl object-contain animate-zoomIn"
            />
            <p className="absolute -bottom-10 left-0 right-0 text-center text-sm text-white/70 font-medium">
              {zoomedCard.title}
            </p>
          </div>
        </div>
      )}

      {/* ── Video Recommendation Popup ────────────────────────────────── */}
      {showVideoPopup && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 backdrop-blur-md animate-fadeIn">
          <div className="bg-white text-black p-8 rounded-2xl shadow-2xl max-w-md w-full mx-4 text-center border border-white/20 transform transition-all scale-100">
            <div className="w-14 h-14 bg-sky-100 rounded-full flex items-center justify-center mx-auto mb-5 shadow-inner">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-sky-600 ml-1" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold tracking-tight mb-2 text-slate-800">Welcome to AgentOps</h3>
            <p className="text-slate-600 mb-8 font-medium">Recommended to watch the video before proceeding</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => setShowVideoPopup(false)}
                className="px-6 py-3 rounded-xl font-medium bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
              >
                Maybe Later
              </button>
              <button
                onClick={scrollToVideo}
                className="px-6 py-3 rounded-xl font-medium bg-sky-600 text-white hover:bg-sky-700 shadow-lg shadow-sky-600/30 transition-all hover:-translate-y-0.5 flex justify-center items-center gap-2"
              >
                <span>Watch Video</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
