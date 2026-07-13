'use client'

import React, { useRef, useEffect, useState } from 'react'
import { ChevronDown } from 'lucide-react'

const FAQS = [
  {
    question: "1. What is AgentOps?",
    answer: "AgentOps is an AI-native automation platform that turns your business ideas into intelligent workflows. Simply describe your problem, and AgentOps builds the solution."
  },
  {
    question: "2. Do I need coding experience?",
    answer: "No. Just explain your business process in plain English, and AgentOps generates workflows, AI logic, and implementation guidance for you."
  },
  {
    question: "3. What can I build with AgentOps?",
    answer: "From AI assistants and customer support to lead pipelines and approval systems, you can automate almost any business process."
  },
  {
    question: "4. What can AgentOps automate?",
    answer: "From customer support and lead qualification to approvals and invoices, AgentOps automates repetitive work in seconds—so your team can focus on growth."
  }
];

export default function WhyWeAreTheBest() {
  const sectionRef = useRef<HTMLElement>(null)
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

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
      id="faqs"
      ref={sectionRef}
      className="relative w-full py-20 px-6 md:px-12 lg:px-24 bg-[#f0f9ff] text-slate-900 overflow-hidden"
    >
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-sky-200/50 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[30rem] h-[30rem] bg-indigo-200/40 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto flex flex-col gap-12">
        {/* Header */}
        <div className="text-center animate-on-scroll opacity-0 translate-y-8 transition-all duration-700 ease-out mb-2">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900">
            Frequently Asked <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-indigo-600">Questions</span>
          </h2>
        </div>

        {/* FAQs list */}
        <div className="flex flex-col gap-5 animate-on-scroll opacity-0 translate-y-8 transition-all duration-700 delay-100 ease-out">
          {FAQS.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <div 
                key={i} 
                className="bg-white/70 backdrop-blur-lg border border-white rounded-3xl shadow-sm hover:shadow-md hover:bg-white transition-all duration-300 overflow-hidden"
              >
                <button
                  onClick={() => handleToggle(i)}
                  className="w-full text-left p-6 md:p-8 flex items-center justify-between gap-4 cursor-pointer focus:outline-none"
                >
                  <h3 className={`text-lg font-bold transition-colors duration-250 ${isOpen ? 'text-sky-600' : 'text-slate-800'}`}>
                    {faq.question}
                  </h3>
                  <ChevronDown className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180 text-sky-600' : ''}`} />
                </button>
                
                <div className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                  <div className="overflow-hidden">
                    <div className="px-6 md:px-8 pb-6 md:pb-8">
                      <div className="w-full h-px bg-slate-100/80 mb-4" />
                      <p className="text-sm font-semibold text-slate-700 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
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
