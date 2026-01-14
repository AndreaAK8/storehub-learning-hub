'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Resource {
  id: string
  title: string
  type: 'slides' | 'document' | 'video' | 'wiki' | 'quiz'
  category: string
  description?: string
  url?: string
  duration?: string
  isRequired: boolean
}

// Mock resources based on actual training materials
const RESOURCES: Record<string, Resource[]> = {
  'foundation': [
    { id: '1', title: 'All in One 1.1 - Product Fundamentals', type: 'slides', category: 'Day 1-2', description: 'Complete StoreHub product overview', duration: '2 hours', isRequired: true },
    { id: '2', title: 'Module 1 - StoreHub Basics', type: 'wiki', category: 'Day 1-2', description: 'Introduction to StoreHub POS system', duration: '1 hour', isRequired: true },
    { id: '3', title: 'Module 2 - Menu & Inventory', type: 'wiki', category: 'Day 1-2', description: 'Menu setup and inventory management', duration: '1 hour', isRequired: true },
    { id: '4', title: 'Module 3 - Payments', type: 'wiki', category: 'Day 1-2', description: 'Payment processing and transactions', duration: '1 hour', isRequired: true },
    { id: '5', title: 'Module 4 - Reports & Analytics', type: 'wiki', category: 'Day 1-2', description: 'Sales reports and analytics dashboards', duration: '1 hour', isRequired: true },
    { id: '6', title: 'Module 5 - Customer Management', type: 'wiki', category: 'Day 1-2', description: 'Customer database and loyalty programs', duration: '1 hour', isRequired: true },
  ],
  'advanced': [
    { id: '7', title: 'Advanced System & Features V1.0', type: 'slides', category: 'Advanced', description: 'Reports, CSV, Promotions, Pricebooks, QR Order, Beep Delivery, Membership, Engage', duration: '2 hours', isRequired: true },
    { id: '8', title: 'Advanced Troubleshooting', type: 'slides', category: 'Advanced', description: 'Networking basics, printer troubleshooting', duration: '1.5 hours', isRequired: true },
    { id: '9', title: 'Brand Servicing', type: 'slides', category: 'Advanced', description: 'Essential soft skills for merchant interactions', duration: '2 hours', isRequired: true },
    { id: '10', title: 'Hardware Assessment Guide', type: 'document', category: 'Advanced', description: 'Hardware setup and troubleshooting guide', duration: '30 mins', isRequired: true },
  ],
  'roleSpecific': [
    { id: '11', title: 'Care Tools & Supply Chain', type: 'slides', category: 'Merchant Care', description: 'Intercom, Aircall, supply chain processes', duration: '1 hour', isRequired: true },
    { id: '12', title: 'CSM Tools & Supply Chain', type: 'slides', category: 'CSM', description: 'Internal tools for CSM role', duration: '1 hour', isRequired: true },
    { id: '13', title: 'People Engagement', type: 'slides', category: 'Business Consultant', description: 'Customer engagement strategies for BC', duration: '1.5 hours', isRequired: true },
    { id: '14', title: 'Salesforce Playbook', type: 'document', category: 'Business Consultant', description: 'Sales process and CRM guide', duration: '1 hour', isRequired: true },
    { id: '15', title: 'MOM Tools & Supply Chain', type: 'slides', category: 'MOM', description: 'Onboarding tools and processes', duration: '1 hour', isRequired: true },
  ],
  'regional': [
    { id: '16', title: 'BIR Training (PH Only)', type: 'slides', category: 'Philippines', description: 'Bureau of Internal Revenue compliance', duration: '1 hour', isRequired: false },
  ],
  'assessments': [
    { id: '17', title: 'Product Knowledge Quiz', type: 'quiz', category: 'Day 2', description: '5 modules quiz, 80% pass required', duration: '45 mins', isRequired: true },
    { id: '18', title: 'Advanced System & Networking Quiz', type: 'quiz', category: 'Day 3', description: '35 questions, open-book', duration: '1 hour', isRequired: true },
  ],
}

export default function ResourcesPage() {
  const [traineeRole, setTraineeRole] = useState<string>('MC')
  const [traineeRegion, setTraineeRegion] = useState<string>('MY')
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState<string>('all')

  useEffect(() => {
    async function loadTraineeData() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user?.email) {
        setLoading(false)
        return
      }

      try {
        const response = await fetch('/api/trainees')
        if (response.ok) {
          const trainees = await response.json()
          const myData = trainees.find((t: { email: string }) =>
            t.email?.toLowerCase() === user.email?.toLowerCase()
          )

          if (myData) {
            const roleMapping: Record<string, string> = {
              'Merchant Care': 'MC',
              'Customer Success Manager': 'CSM',
              'Business Consultant': 'BC',
              'Merchant Onboarding Manager': 'MOM',
              'Onboarding Specialist': 'OS',
              'Sales Coordinator': 'SC',
            }
            setTraineeRole(roleMapping[myData.department || myData.role] || 'MC')
            setTraineeRegion(myData.country || 'MY')
          }
        }
      } catch (error) {
        console.error('Error loading trainee data:', error)
      }

      setLoading(false)
    }

    loadTraineeData()
  }, [])

  // Filter resources based on trainee role
  const getRelevantResources = () => {
    const allResources = [
      ...RESOURCES.foundation,
      ...RESOURCES.advanced,
      ...RESOURCES.roleSpecific.filter(r => {
        const categoryMapping: Record<string, string[]> = {
          'MC': ['Merchant Care'],
          'CSM': ['CSM'],
          'BC': ['Business Consultant'],
          'MOM': ['MOM'],
          'OS': ['MOM'], // OS uses similar materials to MOM
          'SC': ['Business Consultant'], // SC uses similar materials to BC
        }
        return categoryMapping[traineeRole]?.includes(r.category) || r.category === traineeRole
      }),
      ...RESOURCES.assessments,
      ...(traineeRegion === 'PH' ? RESOURCES.regional : []),
    ]

    return allResources.filter(r => {
      const matchesSearch = r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           r.description?.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = filterCategory === 'all' || r.category === filterCategory
      return matchesSearch && matchesCategory
    })
  }

  const resources = getRelevantResources()
  const categories = [...new Set(resources.map(r => r.category))]

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'slides':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        )
      case 'document':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        )
      case 'video':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      case 'wiki':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        )
      case 'quiz':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        )
      default:
        return null
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'slides': return 'bg-blue-100 text-blue-700'
      case 'document': return 'bg-green-100 text-green-700'
      case 'video': return 'bg-purple-100 text-purple-700'
      case 'wiki': return 'bg-yellow-100 text-yellow-700'
      case 'quiz': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg shadow-lg p-6 text-white">
        <h1 className="text-2xl font-bold">Training Resources</h1>
        <p className="text-purple-100 mt-1">
          Access all your training materials, guides, and assessments
        </p>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search resources..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>
          <div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Resource Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              {getTypeIcon('slides')}
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {resources.filter(r => r.type === 'slides').length}
              </p>
              <p className="text-sm text-gray-500">Slides</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              {getTypeIcon('wiki')}
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {resources.filter(r => r.type === 'wiki').length}
              </p>
              <p className="text-sm text-gray-500">Wiki Pages</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              {getTypeIcon('document')}
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {resources.filter(r => r.type === 'document').length}
              </p>
              <p className="text-sm text-gray-500">Documents</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              {getTypeIcon('quiz')}
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {resources.filter(r => r.type === 'quiz').length}
              </p>
              <p className="text-sm text-gray-500">Quizzes</p>
            </div>
          </div>
        </div>
      </div>

      {/* Resources List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Your Resources ({resources.length})
          </h2>
        </div>
        <div className="divide-y divide-gray-200">
          {resources.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No resources found matching your search.
            </div>
          ) : (
            resources.map((resource) => (
              <div
                key={resource.id}
                className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${getTypeColor(resource.type)}`}>
                    {getTypeIcon(resource.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-medium text-gray-900 hover:text-purple-600">
                          {resource.title}
                        </h3>
                        {resource.description && (
                          <p className="text-sm text-gray-500 mt-1">{resource.description}</p>
                        )}
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                            {resource.category}
                          </span>
                          <span className="text-xs text-gray-500 capitalize">
                            {resource.type}
                          </span>
                          {resource.duration && (
                            <span className="text-xs text-gray-500">
                              {resource.duration}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {resource.isRequired && (
                          <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-700 font-medium">
                            Required
                          </span>
                        )}
                        <button className="p-2 text-gray-400 hover:text-purple-600 rounded-lg hover:bg-purple-50 transition-colors">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Help Section */}
      <div className="bg-purple-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-purple-900 mb-2">Need Help?</h3>
        <p className="text-purple-700 mb-4">
          If you can&apos;t find a resource or need access to additional materials, contact your coach or the training team.
        </p>
        <div className="flex gap-3">
          <a
            href="mailto:training@storehub.com"
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Contact Training Team
          </a>
          <a
            href="#"
            className="px-4 py-2 border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors"
          >
            View Training Wiki
          </a>
        </div>
      </div>
    </div>
  )
}
