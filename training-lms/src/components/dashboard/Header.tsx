'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import type { User } from '@supabase/supabase-js'
import type { Profile } from '@/types/user'

interface HeaderProps {
  user: User
  profile: Profile | null
}

interface SearchResult {
  email: string
  fullName: string
  status: string
}

export default function Header({ user, profile }: HeaderProps) {
  const router = useRouter()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  // Search trainees
  useEffect(() => {
    const searchTrainees = async () => {
      if (searchQuery.length < 2) {
        setSearchResults([])
        return
      }

      setIsSearching(true)
      try {
        const response = await fetch('/api/trainees')
        if (response.ok) {
          const data = await response.json()
          const filtered = data.trainees?.filter((t: SearchResult) =>
            t.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.email?.toLowerCase().includes(searchQuery.toLowerCase())
          ).slice(0, 5) || []
          setSearchResults(filtered)
        }
      } catch {
        setSearchResults([])
      }
      setIsSearching(false)
    }

    const debounce = setTimeout(searchTrainees, 300)
    return () => clearTimeout(debounce)
  }, [searchQuery])

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/dashboard/trainees?search=${encodeURIComponent(searchQuery)}`)
      setShowResults(false)
    }
  }

  const handleResultClick = (email: string) => {
    router.push(`/dashboard/trainees/${encodeURIComponent(email)}`)
    setSearchQuery('')
    setShowResults(false)
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Mobile spacer for hamburger menu */}
          <div className="lg:hidden w-12" />

          {/* Search bar */}
          <div className="hidden lg:block flex-1 max-w-md" ref={searchRef}>
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setShowResults(true)
                }}
                onFocus={() => setShowResults(true)}
                placeholder="Search trainees, assessments..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <svg
                className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>

              {/* Search Results Dropdown */}
              {showResults && searchQuery.length >= 2 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
                  {isSearching ? (
                    <div className="p-4 text-center text-gray-500">
                      <svg className="animate-spin h-5 w-5 mx-auto mb-2" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Searching...
                    </div>
                  ) : searchResults.length > 0 ? (
                    <>
                      {searchResults.map((result) => (
                        <button
                          key={result.email}
                          onClick={() => handleResultClick(result.email)}
                          className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-0"
                        >
                          <p className="font-medium text-gray-900">{result.fullName}</p>
                          <p className="text-sm text-gray-500">{result.email}</p>
                        </button>
                      ))}
                      <button
                        onClick={handleSearchSubmit}
                        className="w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-blue-50"
                      >
                        View all results for &quot;{searchQuery}&quot;
                      </button>
                    </>
                  ) : (
                    <div className="p-4 text-center text-gray-500">
                      No trainees found
                    </div>
                  )}
                </div>
              )}
            </form>
          </div>

          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-3 hover:bg-gray-50 rounded-lg p-2 transition-colors"
            >
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-900">
                  {profile?.full_name || user.email}
                </p>
                <p className="text-xs text-gray-500 capitalize">
                  {profile?.role || 'trainee'}
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
                {(profile?.full_name || user.email || 'U').charAt(0).toUpperCase()}
              </div>
            </button>

            {/* Dropdown menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user.email}
                  </p>
                </div>
                <button
                  onClick={handleSignOut}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
