import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useUnreadNotificationsCount } from '../hooks/useNotifications'
import { Button } from '../components/ui/Button'
import { JobList } from '../components/jobs/JobList'
import { TeamManagement } from '../components/teams/TeamManagement'
import { TeamModal } from '../components/teams/TeamModal'
import { TeamSelector } from '../components/teams/TeamSelector'
import { NotificationCenter } from '../components/notifications/NotificationCenter'
import { NotificationPreferences } from '../components/notifications/NotificationPreferences'
import { AnalyticsDashboard } from '../components/analytics/AnalyticsDashboard'
import { LogOut, Briefcase, Users, Plus, Bell, Settings, BarChart3 } from 'lucide-react'

export function DashboardPage() {
  const { user, signOut } = useAuth()
  const { data: unreadCount = 0 } = useUnreadNotificationsCount()
  const [activeTab, setActiveTab] = useState<'jobs' | 'teams' | 'analytics' | 'settings'>('jobs')
  const [selectedTeamId, setSelectedTeamId] = useState<string | undefined>(undefined)
  const [showTeamModal, setShowTeamModal] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)

  const handleSignOut = async () => {
    await signOut()
  }

  const handleTeamCreated = (teamId: string) => {
    // Sélectionner automatiquement l'équipe nouvellement créée
    setSelectedTeamId(teamId)
  }

  const handleTeamDeleted = () => {
    // Désélectionner l'équipe supprimée
    setSelectedTeamId(undefined)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
                                   <h1 className="text-xl font-semibold text-gray-900">Job Tracker</h1>
            </div>
                              <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-600">
                      Hello, {user?.email}
                    </span>
                    
                    {/* Notifications */}
                    <div className="relative">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setShowNotifications(!showNotifications)}
                        className="relative"
                      >
                        <Bell size={16} />
                        {unreadCount > 0 && (
                          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                            {unreadCount > 9 ? '9+' : unreadCount}
                          </span>
                        )}
                      </Button>
                      
                      <NotificationCenter
                        isOpen={showNotifications}
                        onClose={() => setShowNotifications(false)}
                      />
                    </div>
                    
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
            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'analytics'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <BarChart3 size={16} />
              Analytics
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'settings'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Settings size={16} />
              Settings
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'jobs' && <JobList />}
        {activeTab === 'analytics' && <AnalyticsDashboard />}
        {activeTab === 'settings' && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
              <p className="text-gray-600 mt-1">Manage your notification preferences and account settings.</p>
            </div>
            <NotificationPreferences />
          </div>
        )}
        {activeTab === 'teams' && (
          <div>
            {/* Teams header with selector and create button */}
            <div className="mb-6">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Teams</h2>
                  <p className="text-gray-600 mt-1">
                    Manage your teams and collaborate with team members
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <TeamSelector
                    selectedTeamId={selectedTeamId}
                    onTeamSelect={setSelectedTeamId}
                    className="min-w-[200px]"
                  />
                  <Button onClick={() => setShowTeamModal(true)}>
                    <Plus size={16} className="mr-2" />
                    Create Team
                  </Button>
                </div>
              </div>
            </div>
            
            <TeamManagement 
              selectedTeamId={selectedTeamId} 
              onTeamDeleted={handleTeamDeleted}
            />
          </div>
        )}
      </main>
      
      {/* Team Creation Modal */}
      {showTeamModal && (
        <TeamModal 
          onClose={() => setShowTeamModal(false)} 
          onTeamCreated={handleTeamCreated}
        />
      )}
    </div>
  )
}
