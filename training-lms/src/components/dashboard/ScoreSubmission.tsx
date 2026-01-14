'use client'

import { useState } from 'react'

interface ScoreSubmissionProps {
  traineeEmail: string
  traineeName: string
}

type SubmitStatus = 'idle' | 'loading' | 'success' | 'error'

const ASSESSMENT_TYPES = [
  { value: 'week1', label: 'Week 1 Assessment' },
  { value: 'week2', label: 'Week 2 Assessment' },
  { value: 'final', label: 'Final Assessment' },
  { value: 'roleplay', label: 'Role Play' },
  { value: 'product_knowledge', label: 'Product Knowledge' },
  { value: 'other', label: 'Other' },
]

export default function ScoreSubmission({ traineeEmail, traineeName }: ScoreSubmissionProps) {
  const [assessmentType, setAssessmentType] = useState('')
  const [score, setScore] = useState('')
  const [notes, setNotes] = useState('')
  const [status, setStatus] = useState<SubmitStatus>('idle')
  const [message, setMessage] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!assessmentType || !score) {
      setMessage('Please select an assessment type and enter a score')
      return
    }

    const scoreNum = parseInt(score)
    if (isNaN(scoreNum) || scoreNum < 0 || scoreNum > 100) {
      setMessage('Score must be a number between 0 and 100')
      return
    }

    setStatus('loading')
    setMessage(null)

    try {
      const response = await fetch('/api/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          traineeEmail,
          traineeName,
          assessmentType,
          score: scoreNum,
          notes,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit score')
      }

      setStatus('success')
      setMessage('Score submitted successfully!')
      setAssessmentType('')
      setScore('')
      setNotes('')

      setTimeout(() => {
        setStatus('idle')
        setMessage(null)
      }, 3000)
    } catch (error) {
      setStatus('error')
      setMessage(error instanceof Error ? error.message : 'Failed to submit score')

      setTimeout(() => {
        setStatus('idle')
        setMessage(null)
      }, 5000)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Submit Assessment Score</h2>

      {message && (
        <div className={`mb-4 p-3 rounded-lg text-sm ${status === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : status === 'error' ? 'bg-red-50 text-red-800 border border-red-200' : 'bg-amber-50 text-amber-800 border border-amber-200'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="assessmentType" className="block text-sm font-medium text-gray-700 mb-1">
            Assessment Type
          </label>
          <select
            id="assessmentType"
            value={assessmentType}
            onChange={(e) => setAssessmentType(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={status === 'loading'}
          >
            <option value="">Select assessment type...</option>
            {ASSESSMENT_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="score" className="block text-sm font-medium text-gray-700 mb-1">
            Score (0-100)
          </label>
          <input
            type="number"
            id="score"
            min="0"
            max="100"
            value={score}
            onChange={(e) => setScore(e.target.value)}
            placeholder="Enter score..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={status === 'loading'}
          />
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
            Notes (optional)
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any notes about this assessment..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={status === 'loading'}
          />
        </div>

        <button
          type="submit"
          disabled={status === 'loading'}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {status === 'loading' ? (
            <>
              <LoadingSpinner />
              Submitting...
            </>
          ) : status === 'success' ? (
            <>
              <CheckIcon />
              Submitted!
            </>
          ) : (
            <>
              <SubmitIcon />
              Submit Score
            </>
          )}
        </button>
      </form>

      <p className="text-xs text-gray-500 mt-4">
        Scores are saved to Google Sheets via n8n workflow.
      </p>
    </div>
  )
}

function LoadingSpinner() {
  return (
    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L137" />
    </svg>
  )
}

function SubmitIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}
