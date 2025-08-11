import { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { supabase, type NotificationPreferences, type NotificationType } from '../../lib/supabase'
import { Button } from '@/components/ui/button'
import { Mail, Smartphone, Settings, Check, X } from 'lucide-react'

export function NotificationPreferences() {
  const { user } = useAuth()
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

  const notificationTypes: { key: NotificationType; label: string; description: string }[] = [
    {
      key: 'job_assigned',
      label: 'Job Assignment',
      description: 'When a job is assigned to you'
    },
    {
      key: 'job_completed',
      label: 'Job Completion',
      description: 'When a job is marked as completed'
    },
    {
      key: 'job_status_changed',
      label: 'Job Status Updates',
      description: 'When a job status changes'
    },
    {
      key: 'note_added',
      label: 'New Notes',
      description: 'When someone adds a note to a job'
    },
    {
      key: 'note_mentioned',
      label: 'Note Mentions',
      description: 'When you are mentioned in a note'
    },
    {
      key: 'team_invited',
      label: 'Team Invitations',
      description: 'When you are invited to join a team'
    },
    {
      key: 'team_role_changed',
      label: 'Role Changes',
      description: 'When your team role is changed'
    }
  ]

  useEffect(() => {
    loadPreferences()
  }, [user])

  const loadPreferences = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      if (data) {
        setPreferences(data)
      } else {
        // Créer des préférences par défaut
        const defaultPreferences = {
          user_id: user.id,
          email_enabled: {
            job_assigned: true,
            job_completed: true,
            job_status_changed: false,
            note_added: true,
            note_mentioned: true,
            team_invited: true,
            team_role_changed: false
          },
          push_enabled: {
            job_assigned: true,
            job_completed: true,
            job_status_changed: true,
            note_added: true,
            note_mentioned: true,
            team_invited: true,
            team_role_changed: true
          }
        }

        const { data: newPrefs, error: createError } = await supabase
          .from('notification_preferences')
          .insert(defaultPreferences)
          .select()
          .single()

        if (createError) throw createError
        setPreferences(newPrefs)
      }
    } catch (err) {
      console.error('Error loading preferences:', err)
      setError('Failed to load notification preferences')
    } finally {
      setIsLoading(false)
    }
  }

  const updatePreference = (type: NotificationType, channel: 'email' | 'push', enabled: boolean) => {
    if (!preferences) return

    const updatedPreferences = {
      ...preferences,
      [`${channel}_enabled`]: {
        ...preferences[`${channel}_enabled`],
        [type]: enabled
      }
    }

    setPreferences(updatedPreferences)
  }

  const savePreferences = async () => {
    if (!preferences || !user) return

    setIsSaving(true)
    setError('')

    try {
      const { error } = await supabase
        .from('notification_preferences')
        .update({
          email_enabled: preferences.email_enabled,
          push_enabled: preferences.push_enabled,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)

      if (error) throw error

      // Optionnel : afficher un message de succès
      console.log('Preferences saved successfully')
    } catch (err) {
      console.error('Error saving preferences:', err)
      setError('Failed to save preferences')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="h-4 bg-gray-200 rounded w-32"></div>
                <div className="flex gap-4">
                  <div className="h-4 w-4 bg-gray-200 rounded"></div>
                  <div className="h-4 w-4 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!preferences) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="text-center text-gray-500">
          <Settings className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p>Failed to load notification preferences</p>
          <Button variant="secondary" onClick={loadPreferences} className="mt-4">
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center gap-2 mb-6">
        <Settings className="w-5 h-5 text-gray-700" />
        <h3 className="text-lg font-semibold text-gray-900">Notification Preferences</h3>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 text-red-700">
            <X size={16} />
            <span className="text-sm">{error}</span>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {/* Headers */}
        <div className="grid grid-cols-3 gap-4 text-sm font-medium text-gray-700 border-b border-gray-200 pb-3">
          <div>Notification Type</div>
          <div className="flex items-center justify-center gap-2">
            <Mail size={16} />
            Email
          </div>
          <div className="flex items-center justify-center gap-2">
            <Smartphone size={16} />
            In-App
          </div>
        </div>

        {/* Preference rows */}
        {notificationTypes.map((notifType) => (
          <div key={notifType.key} className="grid grid-cols-3 gap-4 items-center py-3 border-b border-gray-100 last:border-b-0">
            <div>
              <div className="font-medium text-gray-900">{notifType.label}</div>
              <div className="text-sm text-gray-500">{notifType.description}</div>
            </div>
            
            {/* Email toggle */}
            <div className="flex justify-center">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={preferences.email_enabled[notifType.key] || false}
                  onChange={(e) => updatePreference(notifType.key, 'email', e.target.checked)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {/* Push toggle */}
            <div className="flex justify-center">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={preferences.push_enabled[notifType.key] || false}
                  onChange={(e) => updatePreference(notifType.key, 'push', e.target.checked)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        ))}
      </div>

      {/* Save button */}
      <div className="flex justify-end mt-6 pt-4 border-t border-gray-200">
        <Button 
          onClick={savePreferences} 
          disabled={isSaving}
          className="flex items-center gap-2"
        >
          <Check size={16} />
          {isSaving ? 'Saving...' : 'Save Preferences'}
        </Button>
      </div>

      {/* Info note */}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-700">
          <strong>Note:</strong> Email notifications require a configured SMTP provider. 
          In-app notifications will always work regardless of these settings.
        </p>
      </div>
    </div>
  )
}
