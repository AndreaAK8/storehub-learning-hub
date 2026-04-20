'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface ProfileSettingsProps {
  initialName: string
  email: string
  role: string
  userId: string
}

export default function ProfileSettings({ initialName, email, role, userId }: ProfileSettingsProps) {
  const [name, setName] = useState(initialName)
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  const handleSave = async () => {
    if (!name.trim()) return
    setIsSaving(true)
    setError(null)
    setSaved(false)

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ full_name: name.trim(), updated_at: new Date().toISOString() })
      .eq('id', userId)

    setIsSaving(false)
    if (updateError) {
      setError('Failed to save. Please try again.')
    } else {
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }
  }

  const roleBadgeStyle: Record<string, { background: string; color: string }> = {
    admin:   { background: '#ffeef0', color: '#ff546f' },
    coach:   { background: '#e9f0fd', color: '#2a6ee8' },
    trainee: { background: '#eae9e8', color: '#55504a' },
  }
  const badge = roleBadgeStyle[role] || roleBadgeStyle.trainee

  return (
    <div className="bg-white rounded-xl border border-[#c5c3c1] overflow-hidden">
      <div className="px-6 py-4 border-b border-[#c5c3c1]" style={{ background: '#f5f5f4' }}>
        <h2 className="text-base font-semibold" style={{ color: '#2f2922' }}>Account Settings</h2>
        <p className="text-xs mt-0.5" style={{ color: '#7a7672' }}>Update your display name</p>
      </div>

      <div className="p-6 space-y-5">
        {/* Avatar + role */}
        <div className="flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold flex-shrink-0"
            style={{ background: '#e9f0fd', color: '#2a6ee8' }}
          >
            {name?.charAt(0)?.toUpperCase() || email.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-sm" style={{ color: '#2f2922' }}>{name || email}</p>
            <span
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize mt-1"
              style={badge}
            >
              {role}
            </span>
          </div>
        </div>

        {/* Display Name */}
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: '#2f2922' }}>
            Display name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your full name"
            className="w-full px-3 py-2.5 text-sm rounded-lg border outline-none transition-colors"
            style={{
              borderColor: '#c5c3c1',
              color: '#2f2922',
              background: 'white',
            }}
            onFocus={(e) => e.target.style.borderColor = '#ff9419'}
            onBlur={(e) => e.target.style.borderColor = '#c5c3c1'}
          />
        </div>

        {/* Email — locked */}
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: '#2f2922' }}>
            Email address
          </label>
          <div
            className="w-full px-3 py-2.5 text-sm rounded-lg border flex items-center gap-2"
            style={{ borderColor: '#eae9e8', background: '#f5f5f4', color: '#7a7672' }}
          >
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#a09d9a' }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span className="flex-1 truncate">{email}</span>
            <span className="text-xs flex-shrink-0" style={{ color: '#a09d9a' }}>via Google</span>
          </div>
        </div>

        {/* Save button + feedback */}
        <div className="flex items-center gap-3 pt-1">
          <button
            onClick={handleSave}
            disabled={isSaving || !name.trim() || name === initialName}
            className="px-5 py-2 text-sm font-semibold text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: '#ff9419' }}
          >
            {isSaving ? 'Saving...' : 'Save changes'}
          </button>
          {saved && (
            <span className="text-sm" style={{ color: '#2a6ee8' }}>✓ Saved</span>
          )}
          {error && (
            <span className="text-sm" style={{ color: '#ff546f' }}>{error}</span>
          )}
        </div>
      </div>
    </div>
  )
}
