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
        <h1 className="text-2xl font-bold text-[#2f2922]">Settings</h1>
        <p className="text-[#55504a] mt-1">Manage your account and application settings</p>
      </div>

      {/* Profile Section */}
      <div className="bg-white rounded-lg shadow p6">
        <h2 className="text-lg font-semibold text-[#2f2922] mb-4">Your Profile</h2>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-[#2a6ee8] flex items-center justify-center">
            <span className="text-[#2a6ee8] text-xl font-bold">
              {profile?.full_name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2) || user?.email?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="font-medium text-[#2f2922]">{profile?.full_name || 'Not set'}</p>
            <p className="text-sm text-[#7a7672]">{user?.email}</p>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#2a6ee8] text-[#2a6ee8] mt-1 capitalize">
              {profile?.role || 'trainee'}
            </span>
          </div>
        </div>
      </div>

      {/* Admin Section: User Management */}
      {profile?.role === 'admin' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6 border-b border-[#c5c3c1] flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-[#2f2922]">User Management</h2>
              <p className="text-sm text-[#7a7672]">Manage user roles and access</p>
            </div>
            <button className="px-4 py-2 bg-[#2a6ee8] text-white rounded-lg hover:bg-[#2a6ee8] transition-colors text-sm">
              Invite User
            </button>
          </div>
          
          {allUsers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#f5f5f4]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#7a7672] uppercase">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#7a7672] uppercase">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#7a7672] uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {allUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-[#f5f5f4]">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-[#2f2922]">{u.full_name || 'Not set'}</p>
                          <p className="text-sm text-[#7a7672]">{u.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <RoleBadge role={u.role} />
                      </td>
                      <td className="px-6 py-4">
                        {u.id !== user?.id ? (
                          <button className="text-[#2a6ee8] hover:text-[#2a6ee8] text-sm">
                            Change Role
                          </button>
                        ) : (
                          <span className="text-[#a09d9a] text-sm">(You)</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center">
              <p className="text-[#7a7672]">No users found</p>
            </div>
          )}
        </div>
      )}

      {/* n8n Configuration */}
      {profile?.role === 'admin' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-[#2f2922] mb-4">n8n Configuration</h2>
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
        <h2 className="text-lg font-semibold text-[#2f2922] mb-4">Quick Links</h2>
        <div className="flex flex-wrap gap-3">
          <a
            href="https://docs.google.com/spreadsheets/d/1ygEYNDbhmtaqjXhO7K_GfWwYK2WtV_erws7n52cWUZA/edit"
            target="_blank"
            className="px-4 py-2 border border-[#c5c3c1] text-[#55504a] rounded-lg hover:bg-[#f5f5f4] transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Google Sheets
          </a>
          <a
            href="https://storehub.app.n8n.cloud"
            target="_blank"
            className="px-4 py-2 border border-[#c5c3c1] text-[#55504a] rounded-lg hover:bg-[#f5f5f4] transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l10-11h-8" />
            </svg>
            n8n Cloud
          </a>
          <a
            href="https://supabase.com/dashboard"
            target="_blank"
            className="px-4 py-2 border border-[#c5c3c1] text-[#55504a] rounded-lg hover:bg-[#f5f5f4] transition-colors flex items-center gap-2"
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
    admin: 'bg-[#ffeef0] text-[#ff546f]',
    coach: 'bg-[#55504a] text-[#55504a]',
    trainee: 'bg-[#eae9e8] text-[#2f2922]',
  }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${styles[role] || 'bg-[#eae9e8] text-[#2f2922]'}`}>
      {role}
    </span>
  )
}

function ConfigItem({ label, value, configured }: { label: string; value: string; configured: boolean }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-[#c5c3c1] last:border-0">
      <span className="text-[#55504a]">{label}</span>
      <div className="flex items-center gap-2">
        <span className={configured ? 'text-[#2a6ee8]' : 'text-[#a09d9a]'}>{value}</span>
        {configured ? (
          <svg className="w-4 h-4 text-[#2a6ee8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ) : (
          <svg className="w-4 h-4 text-[#a09d9a]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )}
      </div>
    </div>
  )
}
