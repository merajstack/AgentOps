'use client'

import { cn } from "@/lib/utils"

interface LoaderProps {
  className?: string
  text?: string
}

export function Loader({ className, text = "AGENTOPS" }: LoaderProps) {
  const letters = text.split("")

  return (
    <div className={cn("wrapper-grid", className)}>
      {letters.map((letter, index) => (
        <div
          key={index}
          className="cube"
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <div className="face face-front">{letter}</div>
          <div className="face face-back"></div>
          <div className="face face-right"></div>
          <div className="face face-left"></div>
          <div className="face face-top"></div>
          <div className="face face-bottom"></div>
        </div>
      ))}
    </div>
  )
}

export default Loader
