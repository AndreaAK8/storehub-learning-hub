import { createClient } from '@/lib/supabase/server'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user?.id)
    .single()

  // Get all users for admin
  let allUsers: { id: string; email: string; full_name: string; role: string }[] = []
  if (profile?.role === 'admin') {
    const { data: users } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
    allUsers = users || []
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your account and application settings</p>
      </div>

      {/* Profile Section */}
      <div className="bg-white rounded-lg shadow p6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Profile</h2>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
            <span className="text-blue-600 text-xl font-bold">
              {profile?.full_name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2) || user?.email?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="font-medium text-gray-900">{profile?.full_name || 'Not set'}</p>
            <p className="text-sm text-gray-500">{user?.email}</p>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-1 capitalize">
              {profile?.role || 'trainee'}
            </span>
          </div>
        </div>
      </div>

      {/* Admin Section: User Management */}
      {profile?.role === 'admin' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">User Management</h2>
              <p className="text-sm text-gray-500">Manage user roles and access</p>
            </div>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
              Invite User
            </button>
          </div>
          
          {allUsers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {allUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900">{u.full_name || 'Not set'}</p>
                          <p className="text-sm text-gray-500">{u.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <RoleBadge role={u.role} />
                      </td>
                      <td className="px-6 py-4">
                        {u.id !== user?.id ? (
                          <button className="text-blue-600 hover:text-blue-800 text-sm">
                            Change Role
                          </button>
                        ) : (
                          <span className="text-gray-400 text-sm">(You)</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center">
              <p className="text-gray-500">No users found</p>
            </div>
          )}
        </div>
      )}

      {/* n8n Configuration */}
      {profile?.role === 'admin' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">n8n Configuration</h2>
          <div className="space-y-4">
            <ConfigItem 
              label="Trainees Webhook" 
              value={process.env.N8N_WEBHOOK_TRAINEES ? 'Configured' : 'Not set'}
              configured={Boolean(process.env.N8N_WEBHOOK_TRAINEES)}
            />
            <ConfigItem 
              label="Welcome Workflow" 
              value={process.env.N8N_WEBHOOK_WELCOME ? 'Configured' : 'Not set'}
              configured={Boolean(process.env.N8N_WEBHOOK_WELCOME)}
            />
            <ConfigItem 
              label="Reminder Workflow" 
              value={process.env.N8N_WEBHOOK_REMINDER ? 'Configured' : 'Not set'}
              configured={Boolean(process.env.N8N_WEBHOOK_REMINDER)}
            />
            <ConfigItem 
              label="Assessment Workflow" 
              value={process.env.N8N_WEBHOOK_ASSESSMENT ? 'Configured' : 'Not set'}
              configured={Boolean(process.env.N8N_WEBHOOK_ASSESSMENT)}
            />
            <ConfigItem 
              label="Report Workflow" 
              value={process.env.N8N_WEBHOOK_REPORT ? 'Configured' : 'Not set'}
              configured={Boolean(process.env.N8N_WEBHOOK_REPORT)}
            />
            <ConfigItem 
              label="Feedback Workflow" 
              value={process.env.N8N_WEBHOOK_FEEDBACK ? 'Configured' : 'Not set'}
              configured={Boolean(process.env.N8N_WEBHOOK_FEEDBACK)}
            />
          </div>
        </div>
      )}

      {/* Quick Links */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Links</h2>
        <div className="flex flex-wrap gap-3">
          <a
            href="https://docs.google.com/spreadsheets/d/1ygEYNDbhmtaqjXhO7K_GfWwYK2WtV_erws7n52cWUZA/edit"
            target="_blank"
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Google Sheets
          </a>
          <a
            href="https://storehub.app.n8n.cloud"
            target="_blank"
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l10-11h-8" />
            </svg>
            n8n Cloud
          </a>
          <a
            href="https://supabase.com/dashboard"
            target="_blank"
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5v14c0 .552.448 1 1 1h3hv4l4-4h4c.552 0 1-.448 1-1V5c0-.552-.448-1-1-1H5c-.552 0-1 .448-1 1z" />
            </svg>
            Supabase
          </a>
        </div>
      </div>
    </div>
  )
}

function RoleBadge({ role }: { role: string }) {
  const styles: Record<string, string> = {
    admin: 'bg-red-100 text-red-800',
    coach: 'bg-purple-100 text-purple-800',
    trainee: 'bg-gray-100 text-gray-800',
  }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${styles[role] || 'bg-gray-100 text-gray-800'}`}>
      {role}
    </span>
  )
}

function ConfigItem({ label, value, configured }: { label: string; value: string; configured: boolean }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
      <span className="text-gray-700">{label}</span>
      <div className="flex items-center gap-2">
        <span className={configured ? 'text-green-600' : 'text-gray-400'}>{value}</span>
        {configured ? (
          <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ) : (
          <svg className="w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )}
      </div>
    </div>
  )
}
