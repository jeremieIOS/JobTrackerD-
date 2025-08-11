import { Bell, User, Plus, Briefcase, Users, BarChart3, Settings } from '@/components/ui/icons'
import { defaultIconSize } from '@/components/ui/icons'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useUnreadNotificationsCount } from '@/hooks/useNotifications'
import { useAuth } from '@/hooks/useAuth'

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

  const tabs: Array<{ id: string; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { id: 'jobs', label: 'Jobs', icon: Briefcase },
    { id: 'teams', label: 'Teams', icon: Users },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ]

  return (
    <div className="hidden md:block">
      {/* Desktop Header */}
      <header className="bg-background border-b px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          {/* Left: Logo + Title */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold">JT</span>
              </div>
              <div>
                <h1 className="text-xl font-bold">Job Tracker</h1>
                <p className="text-sm text-muted-foreground">Professional Task Management</p>
              </div>
            </div>
          </div>

          {/* Right: Actions + Notifications + Profile */}
          <div className="flex items-center gap-4">
            {/* Create Job Button */}
            <Button onClick={onCreateJob} className="gap-2">
              <Plus className="h-4 w-4" />
              Create Job
            </Button>

            {/* Notifications */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleNotifications}
              className="relative"
            >
              <Bell className={defaultIconSize} />
              {unreadCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Badge>
              )}
            </Button>

            {/* Profile */}
            <div className="flex items-center gap-3 pl-4 border-l">
              <Avatar className="h-8 w-8">
                <AvatarFallback>
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div className="text-sm">
                <p className="font-medium">{user?.email?.split('@')[0] || 'User'}</p>
                <p className="text-muted-foreground">{user?.email}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Desktop Tabs Navigation */}
      <nav className="bg-background border-b px-6">
        <div className="max-w-7xl mx-auto">
          <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
            <TabsList className="h-auto bg-transparent p-0 justify-start">
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="flex items-center gap-2 py-4 px-2 border-b-2 border-transparent data-[state=active]:border-primary rounded-none bg-transparent"
                >
                  <tab.icon className={defaultIconSize} />
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </nav>
    </div>
  )
}
