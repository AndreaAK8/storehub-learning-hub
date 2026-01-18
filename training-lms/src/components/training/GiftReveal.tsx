'use client'

import { useState, useEffect } from 'react'
import Confetti from './Confetti'

interface GiftRevealProps {
  traineeName: string
  roleName: string
  roleCode: string
  totalXP: number
  onRevealComplete: () => void
}

export default function GiftReveal({
  traineeName,
  roleName,
  roleCode,
  totalXP,
  onRevealComplete
}: GiftRevealProps) {
  const [stage, setStage] = useState<'intro' | 'gift' | 'opening' | 'badge' | 'complete'>('intro')
  const [showConfetti, setShowConfetti] = useState(false)

  // Intro animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setStage('gift')
    }, 1500)
    return () => clearTimeout(timer)
  }, [])

  const handleGiftClick = () => {
    if (stage !== 'gift') return
    setStage('opening')

    // After opening animation, show badge
    setTimeout(() => {
      setStage('badge')
      setShowConfetti(true)
    }, 1000)
  }

  const handleContinue = () => {
    setStage('complete')
    // Quick exit - parent handles the transition
    setTimeout(() => {
      onRevealComplete()
    }, 600)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      {/* Confetti */}
      {showConfetti && <Confetti duration={6000} />}

      {/* Animated stars background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${1 + Math.random() * 2}s`,
              opacity: 0.3 + Math.random() * 0.7
            }}
          />
        ))}
      </div>

      {/* Stage: Intro */}
      {stage === 'intro' && (
        <div className="text-center animate-fade-in">
          <div className="text-6xl mb-4 animate-bounce">🎊</div>
          <h1 className="text-4xl font-bold text-white mb-2">
            Congratulations, {traineeName.split(' ')[0]}!
          </h1>
          <p className="text-xl text-purple-200">
            You've completed all your training activities!
          </p>
        </div>
      )}

      {/* Stage: Gift Box */}
      {stage === 'gift' && (
        <div className="text-center animate-scale-in">
          <p className="text-xl text-purple-200 mb-8 animate-pulse">
            Tap the gift to reveal your reward!
          </p>

          <button
            onClick={handleGiftClick}
            className="relative group cursor-pointer transform transition-all duration-300 hover:scale-110 active:scale-95"
          >
            {/* Gift glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-3xl blur-2xl opacity-50 group-hover:opacity-80 animate-pulse" />

            {/* Gift box */}
            <div className="relative">
              {/* Box */}
              <div className="w-48 h-40 bg-gradient-to-br from-red-500 to-red-700 rounded-2xl shadow-2xl relative overflow-hidden">
                {/* Ribbon vertical */}
                <div className="absolute left-1/2 transform -translate-x-1/2 w-8 h-full bg-gradient-to-b from-amber-400 to-yellow-500" />
                {/* Ribbon horizontal */}
                <div className="absolute top-1/2 transform -translate-y-1/2 w-full h-8 bg-gradient-to-r from-amber-400 to-yellow-500" />
                {/* Shine effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
              </div>

              {/* Lid */}
              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-56 h-12 bg-gradient-to-br from-red-400 to-red-600 rounded-t-xl shadow-lg">
                {/* Ribbon on lid */}
                <div className="absolute left-1/2 transform -translate-x-1/2 w-8 h-full bg-gradient-to-b from-amber-400 to-yellow-500" />
                {/* Bow */}
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
                  <div className="relative">
                    <div className="w-16 h-10 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-full transform -rotate-45 absolute -left-6" />
                    <div className="w-16 h-10 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-full transform rotate-45 absolute -right-6" />
                    <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-full absolute left-1/2 transform -translate-x-1/2 -top-1 z-10" />
                  </div>
                </div>
              </div>

              {/* Sparkles */}
              <div className="absolute -top-4 -right-4 text-3xl animate-ping">✨</div>
              <div className="absolute -bottom-2 -left-4 text-2xl animate-ping" style={{ animationDelay: '0.5s' }}>✨</div>
              <div className="absolute top-1/2 -right-6 text-2xl animate-ping" style={{ animationDelay: '1s' }}>✨</div>
            </div>
          </button>

          <p className="mt-8 text-purple-300 text-sm animate-bounce">
            👆 Click me!
          </p>
        </div>
      )}

      {/* Stage: Opening Animation */}
      {stage === 'opening' && (
        <div className="text-center">
          <div className="relative animate-gift-open">
            {/* Exploding particles */}
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="absolute w-4 h-4 rounded-full"
                style={{
                  background: ['#fbbf24', '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6'][i % 5],
                  animation: `explode-${i % 4} 1s ease-out forwards`,
                  left: '50%',
                  top: '50%',
                }}
              />
            ))}

            {/* Gift opening */}
            <div className="w-48 h-40 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-2xl animate-pulse flex items-center justify-center">
              <span className="text-6xl">🎁</span>
            </div>
          </div>
        </div>
      )}

      {/* Stage: Badge Reveal */}
      {stage === 'badge' && (
        <div className="text-center animate-scale-in max-w-lg mx-auto px-4 relative z-10">
          {/* Badge */}
          <div className="relative mb-8">
            {/* Glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-400 rounded-full blur-3xl opacity-50 animate-pulse"
                 style={{ transform: 'scale(1.5)' }} />

            {/* Badge container */}
            <div className="relative w-48 h-48 mx-auto">
              {/* Outer ring */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 p-2 animate-spin-slow">
                <div className="w-full h-full rounded-full bg-gradient-to-br from-indigo-900 to-purple-900" />
              </div>

              {/* Inner badge */}
              <div className="absolute inset-4 rounded-full bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 flex items-center justify-center shadow-2xl">
                <div className="text-center">
                  <div className="text-5xl mb-1">🏆</div>
                  <div className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                    {roleCode}
                  </div>
                  <div className="text-xs text-amber-800">Certified</div>
                </div>
              </div>

              {/* Rays */}
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-1 h-8 bg-gradient-to-t from-amber-400 to-transparent"
                  style={{
                    left: '50%',
                    top: '-20px',
                    transform: `translateX(-50%) rotate(${i * 45}deg)`,
                    transformOrigin: '50% 120px',
                    opacity: 0.6
                  }}
                />
              ))}
            </div>
          </div>

          {/* Achievement Text */}
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full text-amber-900 font-bold text-lg shadow-lg">
              <span>⭐</span>
              <span>{totalXP.toLocaleString()} XP Earned!</span>
              <span>⭐</span>
            </div>

            <h2 className="text-3xl font-bold text-white drop-shadow-lg" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}>
              {roleName} Certified!
            </h2>

            <p className="text-purple-100">
              You've mastered all the skills required for the {roleName} role.
              <br />
              Your certificate is ready!
            </p>

            {/* Continue button */}
            <button
              onClick={handleContinue}
              className="mt-8 px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold text-lg rounded-2xl shadow-lg shadow-green-500/30 hover:shadow-xl hover:scale-105 transition-all flex items-center gap-3 mx-auto relative z-20 cursor-pointer"
            >
              <span>View My Certificate</span>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Stage: Complete - fade out */}
      {stage === 'complete' && (
        <div className="flex flex-col items-center justify-center animate-fade-out-fast">
          <div className="text-8xl mb-4">✨</div>
        </div>
      )}

      {/* Custom styles for animations */}
      <style jsx>{`
        @keyframes animate-gift-open {
          0% { transform: scale(1); }
          50% { transform: scale(1.2) rotate(10deg); }
          100% { transform: scale(0) rotate(180deg); opacity: 0; }
        }

        .animate-gift-open {
          animation: animate-gift-open 1s ease-out forwards;
        }

        @keyframes explode-0 {
          0% { transform: translate(-50%, -50%) scale(0); }
          100% { transform: translate(-150px, -100px) scale(1); opacity: 0; }
        }
        @keyframes explode-1 {
          0% { transform: translate(-50%, -50%) scale(0); }
          100% { transform: translate(100px, -120px) scale(1); opacity: 0; }
        }
        @keyframes explode-2 {
          0% { transform: translate(-50%, -50%) scale(0); }
          100% { transform: translate(150px, 50px) scale(1); opacity: 0; }
        }
        @keyframes explode-3 {
          0% { transform: translate(-50%, -50%) scale(0); }
          100% { transform: translate(-100px, 100px) scale(1); opacity: 0; }
        }

        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .animate-spin-slow {
          animation: spin-slow 10s linear infinite;
        }

        @keyframes fade-out-fast {
          0% { opacity: 1; transform: scale(1); }
          100% { opacity: 0; transform: scale(1.5); }
        }

        .animate-fade-out-fast {
          animation: fade-out-fast 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  )
}
