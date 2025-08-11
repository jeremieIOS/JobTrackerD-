import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { JobList } from '../components/jobs/JobList'
import { TeamManagement } from '../components/teams/TeamManagement'
import { TeamModal } from '../components/teams/TeamModal'
import { TeamSelector } from '../components/teams/TeamSelector'
import { NotificationCenter } from '../components/notifications/NotificationCenter'
import { NotificationPreferences } from '../components/notifications/NotificationPreferences'
import { AnalyticsDashboard } from '../components/analytics/AnalyticsDashboard'
import { ResponsiveNav } from '../components/navigation/ResponsiveNav'
import { ThemeToggle } from '../components/theme/ThemeToggle'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { LogOut, Plus } from 'lucide-react'

export function DashboardPage() {
  const navigate = useNavigate()
  const { signOut } = useAuth()
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

  const handleCreateJob = () => {
    navigate('/jobs/new')
  }

  const handleCreateTeam = () => {
    setShowTeamModal(true)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Responsive Navigation */}
      <ResponsiveNav
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab as 'jobs' | 'teams' | 'analytics' | 'settings')}
        onCreateJob={handleCreateJob}
        onCreateTeam={handleCreateTeam}
        showNotifications={showNotifications}
        onToggleNotifications={() => setShowNotifications(!showNotifications)}
      />

      {/* Notification Center */}
      <NotificationCenter
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />

      {/* Desktop Sign Out Button */}
      <div className="hidden md:block fixed top-4 right-4 z-30">
        <Button variant="ghost" size="sm" onClick={handleSignOut}>
          <LogOut size={16} />
          Sign Out
        </Button>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-8 pt-20 md:pt-8">
        {activeTab === 'jobs' && <JobList />}
        {activeTab === 'analytics' && <AnalyticsDashboard />}
        {activeTab === 'settings' && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Settings</h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your notification preferences and account settings.</p>
            </div>
            
            {/* Theme Settings */}
            <Card className="p-6 mb-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Appearance</h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Theme</p>
                  <p className="text-sm text-muted-foreground">Choose your preferred color scheme</p>
                </div>
                <ThemeToggle />
              </div>
            </Card>
            
            {/* Notification Settings */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Notifications</h3>
              <NotificationPreferences />
            </Card>
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
            </Card>
            
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
