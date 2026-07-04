'use client'

import { cn } from "@/lib/utils"

export const Loader = ({ className }: { className?: string }) => {
  return (
    <div className={cn("wrapper-grid", className)}>
      <div className="cube">
        <div className="face face-front">L</div>
        <div className="face face-back"></div>
        <div className="face face-right"></div>
        <div className="face face-left"></div>
        <div className="face face-top"></div>
        <div className="face face-bottom"></div>
      </div>

      <div className="cube">
        <div className="face face-front">O</div>
        <div className="face face-back"></div>
        <div className="face face-right"></div>
        <div className="face face-left"></div>
        <div className="face face-top"></div>
        <div className="face face-bottom"></div>
      </div>

      <div className="cube">
        <div className="face face-front">A</div>
        <div className="face face-back"></div>
        <div className="face face-right"></div>
        <div className="face face-left"></div>
        <div className="face face-top"></div>
        <div className="face face-bottom"></div>
      </div>

      <div className="cube">
        <div className="face face-front">D</div>
        <div className="face face-back"></div>
        <div className="face face-right"></div>
        <div className="face face-left"></div>
        <div className="face face-top"></div>
        <div className="face face-bottom"></div>
      </div>

      <div className="cube">
        <div className="face face-front">I</div>
        <div className="face face-back"></div>
        <div className="face face-right"></div>
        <div className="face face-left"></div>
        <div className="face face-top"></div>
        <div className="face face-bottom"></div>
      </div>

      <div className="cube">
        <div className="face face-front">N</div>
        <div className="face face-back"></div>
        <div className="face face-right"></div>
        <div className="face face-left"></div>
        <div className="face face-top"></div>
        <div className="face face-bottom"></div>
      </div>

      <div className="cube">
        <div className="face face-front">G</div>
        <div className="face face-back"></div>
        <div className="face face-right"></div>
        <div className="face face-left"></div>
        <div className="face face-top"></div>
        <div className="face face-bottom"></div>
      </div>
    </div>
  )
}

// Export as Component for compatibility with requested structure
export const Component = Loader
export default Loader
