'use client'

import { useEffect, useState, useCallback } from 'react'
import { X } from 'lucide-react'

type Card = {
  id: number
  imgSrc: string
  title: string
}

interface FloatingCardsProps {
  images?: string[]
}

export default function FloatingCards({ images: customImages }: FloatingCardsProps) {
  const [cards, setCards] = useState<Card[]>([])
  const [zoomedCard, setZoomedCard] = useState<Card | null>(null)

  useEffect(() => {
    const images = customImages ?? [
      '/a1.png',
      '/a2.png',
      '/a3.jpeg',
      '/a4.jpeg',
    ]

    const titles = [
      'Sales Inquiry Automation',
      'Webhook Automation',
      'Business Automation System',
      'AI Chatbot Workflow',
    ]

    const newCards = images.map((img, index) => ({
      id: index + 1,
      imgSrc: img,
      title: titles[index] || `Workflow ${index + 1}`,
    }))

    setCards(newCards)

    const handleScroll = () => {
      const slider = document.querySelector('.slider-3d') as HTMLElement | null
      if (!slider) return

      const sliderRect = slider.getBoundingClientRect()
      const viewportHeight = window.innerHeight
      // Calculate scroll progress relative to when the slider enters the viewport
      const scrollProgress = Math.max(0, (viewportHeight - sliderRect.top) / (viewportHeight + sliderRect.height))
      const zOffset = scrollProgress * 350

      slider.style.transform = `translate3d(-50%, -50%, 0) rotateX(0deg) rotateY(-25deg) rotateZ(-120deg) translateY(${zOffset}px)`
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [customImages])

  // Mouse interactions per card
  const handleMouseOver = (e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.style.left = '15%'
  }

  const handleMouseOut = (e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.style.left = '0%'
  }

  const handleCardClick = (card: Card) => {
    setZoomedCard(card)
  }

  const handleClose = useCallback(() => {
    setZoomedCard(null)
  }, [])

  // Escape key to close
  useEffect(() => {
    if (!zoomedCard) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [zoomedCard, handleClose])

  return (
    <>
      <div className="slider-3d" aria-label="3D image slider">
        {cards.map((card) => (
          <div
            key={card.id}
            className="slider-card"
            onMouseOver={handleMouseOver}
            onMouseOut={handleMouseOut}
            onClick={() => handleCardClick(card)}
          >
            <img
              src={card.imgSrc}
              alt={card.title}
              loading="lazy"
              draggable={false}
            />
            <div className="slider-card-label">
              {card.title}
            </div>
          </div>
        ))}
      </div>

      {/* Zoom Lightbox */}
      {zoomedCard && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fadeIn cursor-zoom-out"
          onClick={handleClose}
        >
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer z-10"
          >
            <X size={18} />
          </button>
          <div
            className="relative max-w-[90vw] max-h-[90vh] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={zoomedCard.imgSrc}
              alt={zoomedCard.title}
              className="max-w-full max-h-[90vh] rounded-xl shadow-2xl object-contain animate-zoomIn"
            />
            <p className="absolute bottom-[-36px] left-0 right-0 text-center text-sm text-white/70 font-medium">
              {zoomedCard.title}
            </p>
          </div>
        </div>
      )}
    </>
  )
}
