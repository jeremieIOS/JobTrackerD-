import { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { supabase, type NotificationPreferences, type NotificationType } from '../../lib/supabase'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
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
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-muted rounded w-48 mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="h-4 bg-muted rounded w-32"></div>
                <div className="flex gap-4">
                  <div className="h-4 w-4 bg-muted rounded"></div>
                  <div className="h-4 w-4 bg-muted rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    )
  }

  if (!preferences) {
    return (
      <Card className="p-6">
        <div className="text-center text-muted-foreground">
          <Settings className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
          <p>Failed to load notification preferences</p>
          <Button variant="secondary" onClick={loadPreferences} className="mt-4">
            Try Again
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <Settings className="w-5 h-5 text-foreground/70" />
        <h3 className="text-lg font-semibold text-foreground">Notification Preferences</h3>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
          <div className="flex items-center gap-2 text-destructive">
            <X size={16} />
            <span className="text-sm">{error}</span>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {/* Headers */}
        <div className="grid grid-cols-3 gap-4 text-sm font-medium text-foreground/70 border-b border-border pb-3">
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
          <div key={notifType.key} className="grid grid-cols-3 gap-4 items-center py-3 border-b border-border/50 last:border-b-0">
            <div>
              <div className="font-medium text-foreground">{notifType.label}</div>
              <div className="text-sm text-muted-foreground">{notifType.description}</div>
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
                <div className="w-11 h-6 bg-input peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-ring/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-background after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-background after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
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
                <div className="w-11 h-6 bg-input peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-ring/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-background after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-background after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          </div>
        ))}
      </div>

      {/* Save button */}
      <div className="flex justify-end mt-6 pt-4 border-t border-border">
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
      <div className="mt-4 p-3 bg-primary/5 border border-primary/20 rounded-lg">
        <p className="text-sm text-primary">
          <strong>Note:</strong> Email notifications require a configured SMTP provider. 
          In-app notifications will always work regardless of these settings.
        </p>
      </div>
    </Card>
  )
}
