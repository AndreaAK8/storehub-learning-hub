'use client'

import { useState } from 'react'
import ActivitiesModal from './ActivitiesModal'

interface ActivitiesStatCardProps {
  completed: number
  total: number
  traineeEmail: string
  traineeName: string
  roleCode: string
  currentDay: number
}

export default function ActivitiesStatCard({
  completed,
  total,
  traineeEmail,
  traineeName,
  roleCode,
  currentDay
}: ActivitiesStatCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="bg-gradient-to-br from-emerald-50 to-green-100 border-2 border-green-200 rounded-xl p-4 text-left hover:shadow-md transition-all cursor-pointer w-full group"
      >
        <p className="text-sm font-medium text-green-600 opacity-70 group-hover:opacity-100">Activities Done</p>
        <div className="flex items-center justify-between mt-1">
          <p className="text-2xl font-bold text-green-700">{completed}/{total}</p>
          <svg
            className="w-4 h-4 text-green-400 group-hover:text-green-600 transition-colors"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </button>

      <ActivitiesModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        traineeEmail={traineeEmail}
        traineeName={traineeName}
        roleCode={roleCode}
        currentDay={currentDay}
      />
    </>
  )
}
