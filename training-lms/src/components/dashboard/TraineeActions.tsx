'use client'

import { useState } from 'react'

interface TraineeActionsProps {
  traineeEmail: string
  traineeName: string
  traineeStatus: string
}

type ActionStatus = 'idle' | 'loading' | 'success' | 'error'

// Configure which webhooks are ready
const WEBHOOK_STATUS = {
  reminder: true,  // Enabled - triggers n8n workflow
  report: true,    // Enabled - triggers n8n workflow
}

export default function TraineeActions({ traineeEmail, traineeName, traineeStatus }: TraineeActionsProps) {
  const [reminderStatus, setReminderStatus] = useState<ActionStatus>('idle')
  const [reportStatus, setReportStatus] = useState<ActionStatus>('idle')
  const [message, setMessage] = useState<string | null>(null)

  const handleSendReminder = async () => {
    if (!WEBHOOK_STATUS.reminder) {
      setMessage('Reminder webhook coming soon! Configure Win 3 workflow in n8n first.')
      setTimeout(() => setMessage(null), 4000)
      return
    }

    setReminderStatus('loading')
    setMessage(null)

    try {
      const response = await fetch('/api/workflows/reminder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ traineeEmail, traineeName, reminderType: 'assessment' }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send reminder')
      }

      setReminderStatus('success')
      setMessage('Reminder workflow triggered successfully!')

      setTimeout(() => {
        setReminderStatus('idle')
        setMessage(null)
      }, 3000)
    } catch (error) {
      setReminderStatus('error')
      setMessage(error instanceof Error ? error.message : 'Failed to trigger workflow')

      setTimeout(() => {
        setReminderStatus('idle')
        setMessage(null)
      }, 5000)
    }
  }

  const handleGenerateReport = async () => {
    if (!WEBHOOK_STATUS.report) {
      setMessage('Report generation coming soon! Configure Win 4 workflow in n8n first.')
      setTimeout(() => setMessage(null), 4000)
      return
    }

    setReportStatus('loading')
    setMessage(null)

    try {
      const response = await fetch('/api/workflows/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ traineeEmail, traineeName }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate report')
      }

      setReportStatus('success')
      setMessage('Report generation triggered successfully!')

      setTimeout(() => {
        setReportStatus('idle')
        setMessage(null)
      }, 3000)
    } catch (error) {
      setReportStatus('error')
      setMessage(error instanceof Error ? error.message : 'Failed to trigger workflow')

      setTimeout(() => {
        setReportStatus('idle')
        setMessage(null)
      }, 5000)
    }
  }

  const handleViewInSheets = () => {
    const sheetsUrl = 'https://docs.google.com/spreadsheets/d/1ygEYNDbhmtaqjXhO7K_GfWwYK2WtV_erws7n52cWUZA/edit'
    window.open(sheetsUrl, '_blank')
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions</h2>

      {/* Automated Welcome Email Notice */}
      {traineeStatus === 'New' && (
        <div className="mb-4 p-3 rounded-lg bg-blue-50 border border-blue-200">
          <div className="flex items-center gap-2">
            <AutomationIcon />
            <div>
              <p className="text-sm font-medium text-blue-800">Welcome Email Pending</p>
              <p className="text-xs text-blue-600">Automated welcome email with LMS login will be sent via n8n scheduled workflow</p>
            </div>
          </div>
        </div>
      )}

      {traineeStatus === 'Email Sent' && (
        <div className="mb-4 p-3 rounded-lg bg-green-50 border border-green-200">
          <div className="flex items-center gap-2">
            <CheckCircleIcon />
            <div>
              <p className="text-sm font-medium text-green-800">Welcome Email Sent</p>
              <p className="text-xs text-green-600">Trainee has received LMS login credentials</p>
            </div>
          </div>
        </div>
      )}

      {/* Status Message */}
      {message && (
        <div className={`mb-4 p-3 rounded-lg text-sm ${
          reminderStatus === 'success' || reportStatus === 'success'
            ? 'bg-green-50 text-green-800 border border-green-200'
            : reminderStatus === 'error' || reportStatus === 'error'
              ? 'bg-red-50 text-red-800 border border-red-200'
              : 'bg-amber-50 text-amber-800 border border-amber-200'
        }`}>
          {message}
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        {/* Send Reminder */}
        <button
          onClick={handleSendReminder}
          disabled={reminderStatus === 'loading' || !WEBHOOK_STATUS.reminder}
          className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 disabled:cursor-not-allowed ${
            WEBHOOK_STATUS.reminder
              ? 'bg-yellow-500 text-white hover:bg-yellow-600 disabled:opacity-50'
              : 'bg-yellow-100 text-yellow-500 cursor-not-allowed'
          }`}
        >
          {reminderStatus === 'loading' ? (
            <LoadingSpinner />
          ) : reminderStatus === 'success' ? (
            <CheckIcon />
          ) : (
            <BellIcon />
          )}
          {reminderStatus === 'loading' ? 'Sending...' : 'Send Reminder'}
          {!WEBHOOK_STATUS.reminder && <ComingSoonBadge />}
        </button>

        {/* Generate Report */}
        <button
          onClick={handleGenerateReport}
          disabled={reportStatus === 'loading' || !WEBHOOK_STATUS.report}
          className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 disabled:cursor-not-allowed ${
            WEBHOOK_STATUS.report
              ? 'bg-green-600 text-white hover:bg-green-700 disabled:opacity-50'
              : 'bg-green-100 text-green-500 cursor-not-allowed'
          }`}
        >
          {reportStatus === 'loading' ? (
            <LoadingSpinner />
          ) : reportStatus === 'success' ? (
            <CheckIcon />
          ) : (
            <ReportIcon />
          )}
          {reportStatus === 'loading' ? 'Generating...' : 'Generate Report'}
          {!WEBHOOK_STATUS.report && <ComingSoonBadge />}
        </button>

        {/* View in Google Sheets - always enabled */}
        <button
          onClick={handleViewInSheets}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
        >
          <ExternalLinkIcon />
          View in Google Sheets
        </button>
      </div>

      <p className="text-xs text-gray-500 mt-4">
        Welcome emails are sent automatically via n8n. Greyed out buttons require webhook configuration.
      </p>
    </div>
  )
}

// Coming Soon Badge
function ComingSoonBadge() {
  return (
    <span className="ml-1 px-1.5 py-0.5 text-[10px] font-medium bg-gray-200 text-gray-600 rounded">
      Soon
    </span>
  )
}

// Automation Status Icons
function AutomationIcon() {
  return (
    <svg className="w-5 h-5 text-blue-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

function CheckCircleIcon() {
  return (
    <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

// Icon Components
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
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  )
}

function BellIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  )
}

function ReportIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  )
}

function ExternalLinkIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
    </svg>
  )
}
