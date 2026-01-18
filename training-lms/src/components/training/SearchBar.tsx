'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'

interface SearchResult {
  id: string
  type: 'module' | 'resource' | 'faq'
  title: string
  description: string
  dayNumber?: number
  url?: string
}

interface SearchBarProps {
  modules?: { id: string; title: string; description: string; dayNumber: number }[]
  resources?: { id: string; title: string; url: string; dayNumber?: number }[]
  onResultClick?: (result: SearchResult) => void
}

// Stable empty arrays to prevent infinite re-renders
const EMPTY_MODULES: { id: string; title: string; description: string; dayNumber: number }[] = []
const EMPTY_RESOURCES: { id: string; title: string; url: string; dayNumber?: number }[] = []

export function SearchBar({ modules, resources, onResultClick }: SearchBarProps) {
  // Use stable references for empty arrays
  const stableModules = useMemo(() => modules || EMPTY_MODULES, [modules])
  const stableResources = useMemo(() => resources || EMPTY_RESOURCES, [resources])
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  // Handle keyboard shortcut (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen(true)
      }
      if (e.key === 'Escape') {
        setIsOpen(false)
        setQuery('')
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  // Search logic
  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      setSelectedIndex(0)
      return
    }

    const searchTerm = query.toLowerCase()
    const searchResults: SearchResult[] = []

    // Search modules
    stableModules.forEach((module) => {
      if (
        module.title.toLowerCase().includes(searchTerm) ||
        module.description.toLowerCase().includes(searchTerm)
      ) {
        searchResults.push({
          id: module.id,
          type: 'module',
          title: module.title,
          description: module.description,
          dayNumber: module.dayNumber,
        })
      }
    })

    // Search resources
    stableResources.forEach((resource) => {
      if (resource.title.toLowerCase().includes(searchTerm)) {
        searchResults.push({
          id: resource.id,
          type: 'resource',
          title: resource.title,
          description: `Day ${resource.dayNumber || 'All'} Resource`,
          url: resource.url,
          dayNumber: resource.dayNumber,
        })
      }
    })

    setResults(searchResults.slice(0, 10))
    setSelectedIndex(0)
  }, [query, stableModules, stableResources])

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev))
      } else if (e.key === 'Enter' && results[selectedIndex]) {
        e.preventDefault()
        handleResultClick(results[selectedIndex])
      }
    },
    [results, selectedIndex]
  )

  const handleResultClick = (result: SearchResult) => {
    setIsOpen(false)
    setQuery('')
    if (onResultClick) {
      onResultClick(result)
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'module':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        )
      case 'resource':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        )
      default:
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
    }
  }

  return (
    <>
      {/* Search Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        data-tour="search"
        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <span className="hidden sm:inline">Search...</span>
        <kbd className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 text-xs font-medium text-gray-400 bg-white rounded border border-gray-200">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      {/* Search Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => {
              setIsOpen(false)
              setQuery('')
            }}
          />

          {/* Search Panel */}
          <div className="relative w-full max-w-xl mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Search Input */}
            <div className="flex items-center gap-3 px-4 py-4 border-b">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search training content, resources..."
                className="flex-1 text-lg outline-none placeholder:text-gray-400"
              />
              <kbd className="px-2 py-1 text-xs text-gray-400 bg-gray-100 rounded">ESC</kbd>
            </div>

            {/* Results */}
            <div className="max-h-96 overflow-y-auto">
              {query && results.length === 0 && (
                <div className="px-4 py-8 text-center text-gray-500">
                  <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p>No results found for &quot;{query}&quot;</p>
                  <p className="text-sm mt-1">Try different keywords</p>
                </div>
              )}

              {results.length > 0 && (
                <div className="py-2">
                  {results.map((result, index) => (
                    <button
                      key={result.id}
                      onClick={() => handleResultClick(result)}
                      className={`
                        w-full flex items-center gap-3 px-4 py-3 text-left transition-colors
                        ${index === selectedIndex ? 'bg-blue-50' : 'hover:bg-gray-50'}
                      `}
                    >
                      <div
                        className={`
                          w-8 h-8 rounded-lg flex items-center justify-center
                          ${result.type === 'module' ? 'bg-blue-100 text-blue-600' : ''}
                          ${result.type === 'resource' ? 'bg-green-100 text-green-600' : ''}
                          ${result.type === 'faq' ? 'bg-purple-100 text-purple-600' : ''}
                        `}
                      >
                        {getTypeIcon(result.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 truncate">{result.title}</div>
                        <div className="text-sm text-gray-500 truncate">{result.description}</div>
                      </div>
                      {result.dayNumber && (
                        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                          Day {result.dayNumber}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {!query && (
                <div className="px-4 py-6 text-center text-gray-500">
                  <p className="text-sm">Start typing to search...</p>
                  <div className="flex items-center justify-center gap-4 mt-4 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <kbd className="px-1.5 py-0.5 bg-gray-100 rounded">↑</kbd>
                      <kbd className="px-1.5 py-0.5 bg-gray-100 rounded">↓</kbd>
                      Navigate
                    </span>
                    <span className="flex items-center gap-1">
                      <kbd className="px-1.5 py-0.5 bg-gray-100 rounded">↵</kbd>
                      Select
                    </span>
                    <span className="flex items-center gap-1">
                      <kbd className="px-1.5 py-0.5 bg-gray-100 rounded">ESC</kbd>
                      Close
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
