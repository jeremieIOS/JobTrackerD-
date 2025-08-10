import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { Button } from '../components/ui/Button'
import { JobList } from '../components/jobs/JobList'
import { TeamManagement } from '../components/teams/TeamManagement'
import { LogOut, Briefcase, Users } from 'lucide-react'

export function DashboardPage() {
  const { user, signOut } = useAuth()
  const [activeTab, setActiveTab] = useState<'jobs' | 'teams'>('jobs')
  const [selectedTeamId] = useState<string | undefined>(undefined)

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">Job Tracker 🚀 (Phase 2)</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                Hello, {user?.email}
              </span>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut size={16} />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('jobs')}
              className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'jobs'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Briefcase size={16} />
              Jobs
            </button>
            <button
              onClick={() => setActiveTab('teams')}
              className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'teams'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Users size={16} />
              Teams
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'jobs' && <JobList />}
        {activeTab === 'teams' && <TeamManagement selectedTeamId={selectedTeamId} />}
      </main>
    </div>
  )
}
