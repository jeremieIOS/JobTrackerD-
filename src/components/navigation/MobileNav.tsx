import { useState, useEffect } from 'react'
import { Bell, Menu, X, Plus, User } from 'lucide-react'
import { Button } from '../ui/Button'
import { useUnreadNotificationsCount } from '../../hooks/useNotifications'
import { useAuth } from '../../hooks/useAuth'

interface MobileNavProps {
  activeTab: string
  onTabChange: (tab: string) => void
  onCreateJob: () => void
  onCreateTeam: () => void
  showNotifications: boolean
  onToggleNotifications: () => void
}

interface NavItem {
  id: string
  label: string
  icon: string
  badge?: number
}

export function MobileNav({ 
  activeTab, 
  onTabChange, 
  onCreateJob, 
  onCreateTeam,
  onToggleNotifications 
}: MobileNavProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { user } = useAuth()
  const { data: unreadCount = 0 } = useUnreadNotificationsCount()

  // Close menu when tab changes
  useEffect(() => {
    setIsMenuOpen(false)
  }, [activeTab])

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isMenuOpen])

  const navItems: NavItem[] = [
    { id: 'jobs', label: 'Jobs', icon: '📋' },
    { id: 'teams', label: 'Teams', icon: '👥' },
    { id: 'analytics', label: 'Analytics', icon: '📊' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
  ]

  const getPageTitle = () => {
    const item = navItems.find(item => item.id === activeTab)
    return item ? item.label : 'Job Tracker'
  }

  return (
    <>
      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-40">
        <div className="flex items-center justify-between px-4 h-14">
          {/* Left: Burger Menu + Title */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(true)}
              className="p-2"
            >
              <Menu size={20} />
            </Button>
            <h1 className="font-semibold text-gray-900 text-lg">{getPageTitle()}</h1>
          </div>

          {/* Right: Notifications + Profile */}
          <div className="flex items-center gap-2">
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
            <div className="flex items-center gap-1">
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                <User size={16} className="text-primary-600" />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setIsMenuOpen(false)}
          />
          
          {/* Sidebar */}
          <div className="absolute left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-white shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">JT</span>
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900">Job Tracker</h2>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMenuOpen(false)}
                className="p-2"
              >
                <X size={20} />
              </Button>
            </div>

            {/* Navigation Menu */}
            <nav className="flex-1 p-4">
              <div className="space-y-1">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => onTabChange(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      activeTab === item.id
                        ? 'bg-primary-50 text-primary-700 border border-primary-200'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className="text-lg">{item.icon}</span>
                    <span className="font-medium">{item.label}</span>
                    {item.badge && (
                      <span className="ml-auto bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Quick Actions */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-500 mb-3">Quick Actions</h3>
                <div className="space-y-2">
                  <Button
                    onClick={onCreateJob}
                    variant="primary"
                    size="sm"
                    className="w-full justify-start gap-2"
                  >
                    <Plus size={16} />
                    Create Job
                  </Button>
                  <Button
                    onClick={onCreateTeam}
                    variant="secondary"
                    size="sm"
                    className="w-full justify-start gap-2"
                  >
                    <Plus size={16} />
                    Create Team
                  </Button>
                </div>
              </div>

              {/* Status Info */}
              <div className="mt-6 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Sync Status</span>
                  <span className="text-green-600 font-medium">●︎ Online</span>
                </div>
              </div>
            </nav>
          </div>
        </div>
      )}
    </>
  )
}
