'use client'

import { useState, useEffect } from 'react'

interface FadeInProps {
  delay: number
  duration?: number
  children: React.ReactNode
  className?: string
}

export function FadeIn({ delay, duration = 1000, children, className = '' }: FadeInProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay)
    return () => clearTimeout(t)
  }, [delay])

  return (
    <div
      className={`transition-opacity ${className}`}
      style={{
        opacity: visible ? 1 : 0,
        transitionDuration: `${duration}ms`,
      }}
    >
      {children}
    </div>
  )
}

interface AnimatedHeadingProps {
  text: string
  className?: string
  charDelay?: number
  initialDelay?: number
}

export function AnimatedHeading({
  text,
  className = '',
  charDelay = 30,
  initialDelay = 200,
}: AnimatedHeadingProps) {
  const [animate, setAnimate] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setAnimate(true), initialDelay)
    return () => clearTimeout(t)
  }, [initialDelay])

  const lines = text.split('\n')

  return (
    <h1 className={className} style={{ letterSpacing: '-0.04em' }}>
      {lines.map((line, lineIndex) => {
        const prevChars = lines.slice(0, lineIndex).reduce((sum, l) => sum + l.length, 0)
        return (
          <span key={lineIndex}>
            {lineIndex > 0 && <br />}
            {line.split('').map((char, charIndex) => {
              const globalIndex = prevChars + charIndex
              const delay = globalIndex * charDelay
              return (
                <span
                  key={`${lineIndex}-${charIndex}`}
                  className="inline-block transition-all duration-500"
                  style={{
                    opacity: animate ? 1 : 0,
                    transform: animate ? 'translateX(0)' : 'translateX(-18px)',
                    transitionDelay: `${delay}ms`,
                  }}
                >
                  {char === ' ' ? '\u00A0' : char}
                </span>
              )
            })}
          </span>
        )
      })}
    </h1>
  )
}
