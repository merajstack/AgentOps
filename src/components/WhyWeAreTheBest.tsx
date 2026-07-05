'use client'

import React, { useRef, useEffect } from 'react'
import { CheckCircle2, Zap, Brain, MessageSquare, Database, Layers, Mic, LayoutDashboard, Rocket, Network, ShieldCheck, ArrowRight } from 'lucide-react'

const PROBLEMS = [
  "Eliminates repetitive manual work.",
  "Removes communication bottlenecks.",
  "Reduces human errors.",
  "Prevents missed follow-ups.",
  "Centralizes business knowledge.",
  "Connects disconnected tools.",
  "Speeds up approvals.",
  "Improves customer response times.",
  "Reduces operational costs.",
  "Increases team productivity.",
  "Scales without proportional headcount.",
  "Accessible AI without technical expertise."
];

const DIFFERENT_FEATURES = [
  {
    title: "AI-First, Not Automation-First",
    description: "Built around AI agents; understands business intent before building automation.",
    icon: <Brain className="w-6 h-6 text-indigo-500" />
  },
  {
    title: "Build Your Own AI Assistant",
    description: "Create custom agents with your knowledge and receive ready-to-use API keys.",
    icon: <MessageSquare className="w-6 h-6 text-emerald-500" />
  },
  {
    title: "Persistent Business Memory",
    description: "Learns context over time and stores reusable workflows.",
    icon: <Database className="w-6 h-6 text-blue-500" />
  },
  {
    title: "Voice + Chat Intelligence",
    description: "Build and modify workflows through natural conversations.",
    icon: <Mic className="w-6 h-6 text-rose-500" />
  },
  {
    title: "Visual Workflow Generation",
    description: "Automatically creates structured diagrams and logic.",
    icon: <Network className="w-6 h-6 text-teal-500" />
  },
  {
    title: "Centralized AI Workspace",
    description: "Chat, build, manage knowledge, and create assistants from one platform.",
    icon: <ShieldCheck className="w-6 h-6 text-cyan-500" />
  }
];

export default function WhyWeAreTheBest() {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
          }
        })
      },
      { threshold: 0.1 }
    )

    const elements = document.querySelectorAll('.animate-on-scroll')
    elements.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [])

  return (
    <section 
      ref={sectionRef}
      className="relative w-full py-24 px-6 md:px-12 lg:px-24 bg-[#f0f9ff] text-slate-900 overflow-hidden"
    >
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-sky-200/50 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[30rem] h-[30rem] bg-indigo-200/40 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto flex flex-col gap-24">
        
        {/* Header */}
        <div className="text-center animate-on-scroll opacity-0 translate-y-8 transition-all duration-700 ease-out">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 mb-6">
            Why are we the <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-indigo-600">best</span>
          </h2>
        </div>

        {/* Problems Solved (Chips) */}
        <div className="flex flex-col items-center animate-on-scroll opacity-0 translate-y-8 transition-all duration-700 delay-100 ease-out">

          <div className="flex flex-wrap justify-center gap-3 md:gap-4 max-w-5xl">
            {PROBLEMS.map((problem, i) => (
              <div key={i} className="px-4 py-2 bg-white/60 backdrop-blur-md border border-slate-200/60 rounded-full text-sm font-medium text-slate-700 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all cursor-default">
                {problem}
              </div>
            ))}
          </div>
        </div>

        {/* Why AgentOps is Different (Bento Grid) */}
        <div className="animate-on-scroll opacity-0 translate-y-8 transition-all duration-700 delay-200 ease-out">
          <h3 className="text-3xl font-semibold mb-10 text-center text-slate-800">Why AgentOps is Different</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {DIFFERENT_FEATURES.map((feature, i) => (
              <div 
                key={i} 
                className="group p-6 bg-white/70 backdrop-blur-lg border border-white rounded-3xl shadow-sm hover:shadow-xl hover:bg-white transition-all duration-300"
              >
                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h4 className="text-xl font-semibold text-slate-900 mb-3">{feature.title}</h4>
                <p className="text-slate-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>


      </div>

      <style jsx>{`
        .visible {
          opacity: 1 !important;
          transform: translateY(0) !important;
        }
      `}</style>
    </section>
  )
}
