import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase, type Notification, type NotificationPreferences, type NotificationType } from '../lib/supabase'
import { useAuth } from './useAuth'

// Hook principal pour les notifications
export function useNotifications() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const {
    data: notifications = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: async () => {
      if (!user) return []

      const { data, error } = await supabase
        .from('notifications')
        .select(`
          *,
          triggered_by_user:users!notifications_triggered_by_fkey(
            id,
            name,
            email
          ),
          job:jobs(
            id,
            title
          ),
          team:teams(
            id,
            name
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50) // Limiter à 50 notifications récentes

      if (error) throw error
      return data as Notification[]
    },
    enabled: !!user,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Rafraîchir toutes les minutes
  })

  // Marquer une notification comme lue
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('id', notificationId)
        .eq('user_id', user?.id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] })
    },
  })

  // Marquer toutes les notifications comme lues
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('user_id', user?.id)
        .is('read_at', null)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] })
    },
  })

  // Supprimer une notification
  const deleteNotificationMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)
        .eq('user_id', user?.id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] })
    },
  })

  // Calculer les métriques
  const unreadCount = notifications.filter(n => !n.read_at).length
  const hasUnread = unreadCount > 0

  return {
    notifications,
    isLoading,
    error,
    unreadCount,
    hasUnread,
    markAsRead: markAsReadMutation.mutate,
    markAllAsRead: markAllAsReadMutation.mutate,
    deleteNotification: deleteNotificationMutation.mutate,
    isMarkingAsRead: markAsReadMutation.isPending,
    isMarkingAllAsRead: markAllAsReadMutation.isPending,
    isDeleting: deleteNotificationMutation.isPending,
  }
}

// Hook pour les préférences de notifications
export function useNotificationPreferences() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const {
    data: preferences,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['notification-preferences', user?.id],
    queryFn: async () => {
      if (!user) return null

      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error) {
        // Si pas de préférences, créer des préférences par défaut
        if (error.code === 'PGRST116') {
          const defaultPrefs = {
            user_id: user.id,
            email_enabled: {
              job_assigned: true,
              job_completed: true,
              job_status_changed: true,
              note_added: true,
              note_mentioned: true,
              team_invited: true,
              team_role_changed: true,
            },
            push_enabled: {
              job_assigned: true,
              job_completed: true,
              job_status_changed: true,
              note_added: true,
              note_mentioned: true,
              team_invited: true,
              team_role_changed: true,
            },
          }

          const { data: newPrefs, error: createError } = await supabase
            .from('notification_preferences')
            .insert(defaultPrefs)
            .select()
            .single()

          if (createError) throw createError
          return newPrefs as NotificationPreferences
        }
        throw error
      }

      return data as NotificationPreferences
    },
    enabled: !!user,
  })

  // Mettre à jour les préférences
  const updatePreferencesMutation = useMutation({
    mutationFn: async (updates: Partial<NotificationPreferences>) => {
      if (!user) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('notification_preferences')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) throw error
      return data as NotificationPreferences
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-preferences', user?.id] })
    },
  })

  return {
    preferences,
    isLoading,
    error,
    updatePreferences: updatePreferencesMutation.mutate,
    isUpdating: updatePreferencesMutation.isPending,
  }
}

// Hook pour créer des notifications côté client (utilisé par les autres composants)
export function useCreateNotification() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: {
      user_id: string
      type: NotificationType
      title: string
      message: string
      data?: Record<string, any>
      job_id?: string
      team_id?: string
      note_id?: string
      triggered_by?: string
    }) => {
      const { data, error } = await supabase.rpc('create_notification', {
        p_user_id: params.user_id,
        p_type: params.type,
        p_title: params.title,
        p_message: params.message,
        p_data: params.data || null,
        p_job_id: params.job_id || null,
        p_team_id: params.team_id || null,
        p_note_id: params.note_id || null,
        p_triggered_by: params.triggered_by || null,
      })

      if (error) throw error
      return data
    },
    onSuccess: () => {
      // Invalider les notifications pour tous les utilisateurs concernés
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}

// Hook utilitaire pour compter les notifications non lues (utilisé dans la navbar)
export function useUnreadNotificationsCount() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['notifications-count', user?.id],
    queryFn: async () => {
      if (!user) return 0

      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .is('read_at', null)

      if (error) throw error
      return count || 0
    },
    enabled: !!user,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Rafraîchir toutes les minutes
  })
}
