import { useState } from 'react'
import { useNotifications } from '../../hooks/useNotifications'
import { Button } from '../../lib/components'
import { 
  Bell, 
  BellOff,
  Check, 
  CheckCheck, 
  Trash2, 
  X,
  User,
  Briefcase,
  Users,
  MessageCircle,
  UserPlus,
  Settings
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import type { Notification, NotificationType } from '../../lib/supabase'

interface NotificationCenterProps {
  isOpen: boolean
  onClose: () => void
}

// Configuration des icônes par type de notification
const notificationIcons: Record<NotificationType, React.ComponentType<any>> = {
  job_assigned: Briefcase,
  job_completed: Check,
  job_status_changed: Settings,
  note_added: MessageCircle,
  note_mentioned: MessageCircle,
  team_invited: UserPlus,
  team_role_changed: Users,
}

// Configuration des couleurs par type
const notificationColors: Record<NotificationType, string> = {
  job_assigned: 'text-blue-600 bg-blue-100',
  job_completed: 'text-green-600 bg-green-100',
  job_status_changed: 'text-yellow-600 bg-yellow-100',
  note_added: 'text-purple-600 bg-purple-100',
  note_mentioned: 'text-purple-600 bg-purple-100',
  team_invited: 'text-indigo-600 bg-indigo-100',
  team_role_changed: 'text-muted-foreground bg-gray-100',
}

export function NotificationCenter({ isOpen, onClose }: NotificationCenterProps) {
  const { 
    notifications, 
    isLoading, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification,
    isMarkingAsRead,
    isMarkingAllAsRead 
  } = useNotifications()
  
  const [filter, setFilter] = useState<'all' | 'unread'>('all')

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.read_at
    return true
  })

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read_at) {
      markAsRead(notification.id)
    }
    // Optionnel : navigation vers l'objet lié (job, équipe, etc.)
    onClose()
  }

  const handleMarkAllAsRead = () => {
    if (unreadCount > 0) {
      markAllAsRead()
    }
  }

  const getNotificationIcon = (type: NotificationType) => {
    const IconComponent = notificationIcons[type]
    const colorClasses = notificationColors[type]
    return (
      <div className={`p-2 rounded-full ${colorClasses}`}>
        <IconComponent size={16} />
      </div>
    )
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 lg:absolute lg:inset-auto lg:top-12 lg:right-0 lg:w-96">
      {/* Overlay pour mobile */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 lg:hidden"
        onClick={onClose}
      />
      
      {/* Panel notifications */}
      <div className="absolute inset-x-4 top-4 bottom-4 lg:inset-auto lg:top-0 lg:right-0 lg:w-96 lg:max-h-[600px] bg-card rounded-lg shadow-xl border border-border flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Bell size={20} className="text-gray-700" />
            <h2 className="font-semibold text-foreground">Notifications</h2>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllAsRead}
                disabled={isMarkingAllAsRead}
                className="text-xs"
              >
                <CheckCheck size={14} className="mr-1" />
                Mark all read
              </Button>
            )}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-muted-foreground p-1"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Filtres */}
        <div className="flex border-b border-border">
          <button
            onClick={() => setFilter('all')}
            className={`flex-1 py-2 px-4 text-sm font-medium border-b-2 transition-colors ${
              filter === 'all'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-muted-foreground hover:text-gray-700'
            }`}
          >
            All ({notifications.length})
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`flex-1 py-2 px-4 text-sm font-medium border-b-2 transition-colors ${
              filter === 'unread'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-muted-foreground hover:text-gray-700'
            }`}
          >
            Unread ({unreadCount})
          </button>
        </div>

        {/* Liste des notifications */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-2"></div>
              Loading notifications...
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <BellOff className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="font-medium">No notifications</p>
              <p className="text-sm mt-1">
                {filter === 'unread' ? 'All caught up!' : 'You have no notifications yet.'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-muted cursor-pointer transition-colors ${
                    !notification.read_at ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start gap-3">
                    {/* Icône de notification */}
                    {getNotificationIcon(notification.type)}
                    
                    {/* Contenu */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className={`text-sm ${!notification.read_at ? 'font-semibold' : 'font-medium'} text-foreground leading-tight`}>
                            {notification.title}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                            {notification.message}
                          </p>
                          
                          {/* Métadonnées */}
                          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                            <span>
                              {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                            </span>
                            {notification.triggered_by_user && (
                              <div className="flex items-center gap-1">
                                <User size={10} />
                                <span>{notification.triggered_by_user.name || notification.triggered_by_user.email}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Actions */}
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {!notification.read_at && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                markAsRead(notification.id)
                              }}
                              disabled={isMarkingAsRead}
                              className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                              title="Mark as read"
                            >
                              <Check size={14} />
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteNotification(notification.id)
                            }}
                            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                            title="Delete notification"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {filteredNotifications.length > 0 && (
          <div className="p-4 border-t border-border bg-muted">
            <p className="text-xs text-muted-foreground text-center">
              Notifications are kept for 30 days
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
