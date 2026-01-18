'use client'

import { useEffect, useState } from 'react'

interface ConfettiPiece {
  id: number
  x: number
  y: number
  rotation: number
  color: string
  size: number
  speedY: number
  speedX: number
  speedRotation: number
}

export default function Confetti({ duration = 4000 }: { duration?: number }) {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([])
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    // Generate confetti pieces
    const colors = ['#d4af37', '#f4e4ba', '#ff9419', '#ff630f', '#4ade80', '#60a5fa', '#f472b6']
    const newPieces: ConfettiPiece[] = []

    for (let i = 0; i < 100; i++) {
      newPieces.push({
        id: i,
        x: Math.random() * 100,
        y: -10 - Math.random() * 20,
        rotation: Math.random() * 360,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 8 + Math.random() * 8,
        speedY: 2 + Math.random() * 3,
        speedX: (Math.random() - 0.5) * 2,
        speedRotation: (Math.random() - 0.5) * 10
      })
    }

    setPieces(newPieces)

    // Animate
    let animationFrame: number
    let startTime = Date.now()

    const animate = () => {
      const elapsed = Date.now() - startTime

      if (elapsed > duration) {
        setIsVisible(false)
        return
      }

      setPieces(prev => prev.map(piece => ({
        ...piece,
        y: piece.y + piece.speedY,
        x: piece.x + piece.speedX,
        rotation: piece.rotation + piece.speedRotation
      })))

      animationFrame = requestAnimationFrame(animate)
    }

    animationFrame = requestAnimationFrame(animate)

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame)
      }
    }
  }, [duration])

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {pieces.map(piece => (
        <div
          key={piece.id}
          className="absolute"
          style={{
            left: `${piece.x}%`,
            top: `${piece.y}%`,
            width: piece.size,
            height: piece.size * 0.6,
            backgroundColor: piece.color,
            transform: `rotate(${piece.rotation}deg)`,
            borderRadius: '2px',
            opacity: piece.y > 100 ? 0 : 1,
            transition: 'opacity 0.3s'
          }}
        />
      ))}
    </div>
  )
}
