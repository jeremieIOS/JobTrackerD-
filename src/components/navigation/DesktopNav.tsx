import { Bell, User, Plus } from 'lucide-react'
import { Button } from '../ui/Button'
import { useUnreadNotificationsCount } from '../../hooks/useNotifications'
import { useAuth } from '../../hooks/useAuth'

interface DesktopNavProps {
  activeTab: string
  onTabChange: (tab: string) => void
  onCreateJob: () => void
  showNotifications: boolean
  onToggleNotifications: () => void
}

export function DesktopNav({ 
  activeTab, 
  onTabChange, 
  onCreateJob,
  onToggleNotifications 
}: DesktopNavProps) {
  const { user } = useAuth()
  const { data: unreadCount = 0 } = useUnreadNotificationsCount()

  const tabs = [
    { id: 'jobs', label: 'Jobs', icon: '📋' },
    { id: 'teams', label: 'Teams', icon: '👥' },
    { id: 'analytics', label: 'Analytics', icon: '📊' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
  ]

  return (
    <div className="hidden md:block">
      {/* Desktop Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          {/* Left: Logo + Title */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">JT</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Job Tracker</h1>
                <p className="text-sm text-gray-500">Professional Task Management</p>
              </div>
            </div>
          </div>

          {/* Right: Actions + Notifications + Profile */}
          <div className="flex items-center gap-4">
            {/* Create Job Button */}
            <Button
              onClick={onCreateJob}
              variant="primary"
              size="sm"
              className="flex items-center gap-2"
            >
              <Plus size={16} />
              Create Job
            </Button>

            {/* Notifications */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleNotifications}
              className="relative p-2"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Button>

            {/* Profile */}
            <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                <User size={16} className="text-primary-600" />
              </div>
              <div className="text-sm">
                <p className="font-medium text-gray-900">{user?.email?.split('@')[0] || 'User'}</p>
                <p className="text-gray-500">{user?.email}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Desktop Tabs Navigation */}
      <nav className="bg-white border-b border-gray-200 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>
    </div>
  )
}
