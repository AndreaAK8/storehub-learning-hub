'use client'

import { useRef } from 'react'

interface CertificateProps {
  traineeName: string
  roleName: string
  roleCode: string
  completionDate: string
  certificateId: string
  finalScore?: number
  totalHours?: number
  activitiesCompleted?: number
}

export default function Certificate({
  traineeName,
  roleName,
  roleCode,
  completionDate,
  certificateId,
  finalScore,
  totalHours = 32,
  activitiesCompleted = 24
}: CertificateProps) {
  const certificateRef = useRef<HTMLDivElement>(null)

  const handleDownload = async () => {
    if (!certificateRef.current) return

    try {
      const html2canvas = (await import('html2canvas')).default

      const canvas = await html2canvas(certificateRef.current, {
        scale: 2,
        backgroundColor: '#faf8f5',
        useCORS: true,
      })

      const link = document.createElement('a')
      link.download = `StoreHub_Certificate_${traineeName.replace(/\s+/g, '_')}_${roleCode}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    } catch (error) {
      console.error('Error generating certificate:', error)
      alert('Unable to download certificate. Please try again.')
    }
  }

  return (
    <div className="space-y-6">
      {/* Certificate Card - Premium Cream Design */}
      <div
        ref={certificateRef}
        className="relative w-full max-w-3xl mx-auto rounded-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(145deg, #fffdf9 0%, #faf8f5 50%, #f5f0e8 100%)',
          minHeight: '480px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(212, 175, 55, 0.2)'
        }}
      >
        {/* Elegant gold border */}
        <div
          className="absolute inset-3 rounded-xl pointer-events-none"
          style={{
            border: '2px solid #d4af37',
            borderRadius: '12px'
          }}
        />

        {/* Inner decorative border */}
        <div
          className="absolute inset-5 rounded-lg pointer-events-none"
          style={{
            border: '1px solid rgba(212, 175, 55, 0.3)',
            borderRadius: '8px'
          }}
        />

        {/* StoreHub Text Watermark - subtle */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ opacity: 0.03 }}>
          <div className="flex items-center" style={{ transform: 'rotate(-15deg)' }}>
            <span className="text-8xl font-bold tracking-tight" style={{ color: '#2f2922', fontFamily: 'system-ui, -apple-system, sans-serif' }}>STOREHUB</span>
          </div>
        </div>

        {/* Gold corner ornaments */}
        <div className="absolute top-6 left-6">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <path d="M0 0 L40 0 L40 4 L4 4 L4 40 L0 40 Z" fill="#d4af37"/>
            <circle cx="6" cy="6" r="2" fill="#d4af37"/>
          </svg>
        </div>
        <div className="absolute top-6 right-6 rotate-90">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <path d="M0 0 L40 0 L40 4 L4 4 L4 40 L0 40 Z" fill="#d4af37"/>
            <circle cx="6" cy="6" r="2" fill="#d4af37"/>
          </svg>
        </div>
        <div className="absolute bottom-6 left-6 -rotate-90">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <path d="M0 0 L40 0 L40 4 L4 4 L4 40 L0 40 Z" fill="#d4af37"/>
            <circle cx="6" cy="6" r="2" fill="#d4af37"/>
          </svg>
        </div>
        <div className="absolute bottom-6 right-6 rotate-180">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <path d="M0 0 L40 0 L40 4 L4 4 L4 40 L0 40 Z" fill="#d4af37"/>
            <circle cx="6" cy="6" r="2" fill="#d4af37"/>
          </svg>
        </div>

        {/* Content */}
        <div className="relative z-10 h-full flex flex-col p-12 md:p-14">
          {/* Header with StoreHub Logo */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              {/* StoreHub Wordmark Only */}
              <div className="flex items-center">
                <span className="text-3xl font-bold tracking-tight" style={{ color: '#ff9419', fontFamily: 'system-ui, -apple-system, sans-serif' }}>STORE</span>
                <span className="text-3xl font-bold tracking-tight" style={{ color: '#2f2922', fontFamily: 'system-ui, -apple-system, sans-serif' }}>HUB</span>
              </div>
            </div>
            {/* Achievement seal */}
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #f4e4ba 0%, #d4af37 50%, #aa8c2c 100%)',
                boxShadow: '0 4px 12px rgba(212, 175, 55, 0.4)'
              }}
            >
              <svg className="w-8 h-8" viewBox="0 0 24 24" fill="#fff">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>
          </div>

          {/* Title Section */}
          <div className="text-center mb-8">
            <p className="text-sm uppercase tracking-[0.3em] mb-2" style={{ color: '#d4af37' }}>Certificate of</p>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight" style={{ color: '#2f2922', fontFamily: 'Georgia, serif' }}>
              Completion
            </h1>
            <div className="flex items-center justify-center gap-4 mt-4">
              <div className="h-px w-16" style={{ background: 'linear-gradient(90deg, transparent, #d4af37)' }} />
              <svg width="20" height="20" viewBox="0 0 20 20" fill="#d4af37">
                <path d="M10 0l2.5 5 5.5 0.8-4 3.9 0.9 5.3-4.9-2.6-4.9 2.6 0.9-5.3-4-3.9 5.5-0.8z"/>
              </svg>
              <div className="h-px w-16" style={{ background: 'linear-gradient(90deg, #d4af37, transparent)' }} />
            </div>
          </div>

          {/* Recipient Section */}
          <div className="text-center flex-1">
            <p className="text-sm mb-2" style={{ color: '#7a7672' }}>This is to certify that</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-2" style={{ color: '#2f2922', fontFamily: 'Georgia, serif' }}>
              {traineeName}
            </h2>
            <div className="w-64 h-px mx-auto mb-6" style={{ background: 'linear-gradient(90deg, transparent, #d4af37, transparent)' }} />

            <p className="text-base max-w-md mx-auto leading-relaxed" style={{ color: '#4a4744' }}>
              has successfully completed the{' '}
              <span className="font-semibold" style={{ color: '#ff9419' }}>{roleName}</span>{' '}
              training program at StoreHub
              {finalScore && (
                <span className="block mt-2" style={{ color: '#7a7672' }}>
                  with a final score of <span className="font-semibold" style={{ color: '#2f2922' }}>{finalScore}%</span>
                </span>
              )}
            </p>
          </div>

          {/* Stats Row */}
          <div className="flex justify-center gap-12 my-6 py-4" style={{ borderTop: '1px solid rgba(212, 175, 55, 0.2)', borderBottom: '1px solid rgba(212, 175, 55, 0.2)' }}>
            <div className="text-center">
              <p className="text-2xl font-bold" style={{ color: '#d4af37' }}>{totalHours}h</p>
              <p className="text-xs uppercase tracking-wider" style={{ color: '#7a7672' }}>Training Hours</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold" style={{ color: '#d4af37' }}>{activitiesCompleted}</p>
              <p className="text-xs uppercase tracking-wider" style={{ color: '#7a7672' }}>Activities</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold" style={{ color: '#d4af37' }}>{roleCode}</p>
              <p className="text-xs uppercase tracking-wider" style={{ color: '#7a7672' }}>Certified</p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-end justify-between pt-4">
            <div>
              <p className="text-sm" style={{ color: '#4a4744' }}>
                Awarded on <span className="font-medium" style={{ color: '#2f2922' }}>{completionDate}</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs" style={{ color: '#a09d99' }}>
                Certificate ID: {certificateId}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Download Button */}
      <div className="flex justify-center">
        <button
          onClick={handleDownload}
          className="flex items-center gap-3 px-8 py-4 rounded-xl font-semibold transition-all hover:scale-105"
          style={{
            background: 'linear-gradient(135deg, #ff9419, #ff630f)',
            color: 'white',
            boxShadow: '0 4px 14px rgba(255, 148, 25, 0.4)'
          }}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download Certificate
        </button>
      </div>
    </div>
  )
}
