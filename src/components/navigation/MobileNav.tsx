import { useState, useEffect } from 'react'
import type React from 'react'
import { Bell, Menu, Plus, User, Briefcase, Users, BarChart3, Settings } from '../ui/icons'
import { defaultOutlineIcon } from '../ui/icons'
import { Button } from '../../lib/components'
import { Badge } from '../ui/badge'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '../ui/sheet'
import { Avatar, AvatarFallback } from '../ui/avatar'
import { useUnreadNotificationsCount } from '@/hooks/useNotifications'
import { useAuth } from '@/hooks/useAuth'

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
  icon: React.ComponentType<{ className?: string }>
  badge?: number
}

export function MobileNav({ 
  activeTab, 
  onTabChange, 
  onCreateJob, 
  onCreateTeam,
  onToggleNotifications 
}: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { user } = useAuth()
  const { data: unreadCount = 0 } = useUnreadNotificationsCount()

  // Close menu when tab changes
  useEffect(() => {
    setIsOpen(false)
  }, [activeTab])

  const navItems: NavItem[] = [
    { id: 'jobs', label: 'Jobs', icon: Briefcase },
    { id: 'teams', label: 'Teams', icon: Users },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ]

  const getPageTitle = () => {
    const item = navItems.find(item => item.id === activeTab)
    return item ? item.label : 'Job Tracker'
  }

  return (
    <>
      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 bg-background border-b z-40">
        <div className="flex items-center justify-between px-4 h-14">
          {/* Left: Burger Menu + Title */}
          <div className="flex items-center gap-3">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className={defaultOutlineIcon} />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80">
                <SheetHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                      <span className="text-primary-foreground font-bold text-sm">JT</span>
                    </div>
                    <div className="text-left">
                      <SheetTitle>Job Tracker</SheetTitle>
                      <p className="text-xs text-muted-foreground">{user?.email}</p>
                    </div>
                  </div>
                </SheetHeader>

                {/* Navigation Menu */}
                <nav className="flex-1 py-6">
                  <div className="space-y-1">
                    {navItems.map((item) => (
                      <Button
                        key={item.id}
                        variant={activeTab === item.id ? "default" : "ghost"}
                        className="w-full justify-start gap-3"
                        onClick={() => onTabChange(item.id)}
                      >
                        <item.icon className={defaultOutlineIcon} />
                        <span>{item.label}</span>
                        {item.badge && (
                          <Badge variant="secondary" className="ml-auto">
                            {item.badge}
                          </Badge>
                        )}
                      </Button>
                    ))}
                  </div>

                  {/* Quick Actions */}
                  <div className="mt-8 pt-6 border-t">
                    <h3 className="text-sm font-medium text-muted-foreground mb-3">Quick Actions</h3>
                    <div className="space-y-2">
                      <Button
                        onClick={() => {
                          onCreateJob()
                          setIsOpen(false)
                        }}
                        className="w-full justify-start gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        Create Job
                      </Button>
                      <Button
                        onClick={() => {
                          onCreateTeam()
                          setIsOpen(false)
                        }}
                        variant="secondary"
                        className="w-full justify-start gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        Create Team
                      </Button>
                    </div>
                  </div>

                  {/* Status Info */}
                  <div className="mt-6 p-3 bg-muted rounded-lg">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Sync Status</span>
                      <div className="flex items-center gap-1 text-green-600">
                        <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                        <span className="font-medium">Online</span>
                      </div>
                    </div>
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
            
            <h1 className="font-semibold text-lg">{getPageTitle()}</h1>
          </div>

          {/* Right: Notifications + Profile */}
          <div className="flex items-center gap-2">
            {/* Notifications */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleNotifications}
              className="relative"
            >
              <Bell className={defaultOutlineIcon} />
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
            <Avatar className="h-8 w-8">
              <AvatarFallback>
                <User className={defaultOutlineIcon} />
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>
    </>
  )
}
