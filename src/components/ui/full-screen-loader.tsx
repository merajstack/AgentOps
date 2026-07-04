'use client'

import { Loader } from "./loader"

export function FullScreenLoader() {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
      <Loader className="scale-[2]" />
    </div>
  )
}

export default FullScreenLoader
