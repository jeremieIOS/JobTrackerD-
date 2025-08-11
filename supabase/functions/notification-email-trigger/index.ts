import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { serve } from 'https://deno.land/std@0.208.0/http/server.ts'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

serve(async (req) => {
  try {
    // Vérifier la méthode HTTP
    if (req.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 })
    }

    // Parser le webhook de Supabase
    const payload = await req.json()
    
    if (!payload.record) {
      return new Response('Invalid webhook payload', { status: 400 })
    }

    const notification = payload.record

    // Créer le client Supabase
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // Vérifier les préférences de notification par email de l'utilisateur
    const { data: preferences, error: preferencesError } = await supabase
      .from('notification_preferences')
      .select('email_enabled')
      .eq('user_id', notification.user_id)
      .single()

    if (preferencesError) {
      // Si pas de préférences trouvées, créer des préférences par défaut
      const defaultPreferences = {
        user_id: notification.user_id,
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

      await supabase
        .from('notification_preferences')
        .insert(defaultPreferences)

      // Utiliser les préférences par défaut
      preferences = { email_enabled: defaultPreferences.email_enabled }
    }

    // Vérifier si l'utilisateur veut recevoir des emails pour ce type de notification
    const emailEnabled = preferences?.email_enabled?.[notification.type]
    
    if (!emailEnabled) {
      console.log(`Email disabled for notification type: ${notification.type}`)
      return new Response(JSON.stringify({ 
        skipped: true, 
        reason: 'Email disabled for this notification type' 
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Appeler la fonction d'envoi d'email
    const emailFunctionUrl = `${SUPABASE_URL}/functions/v1/send-notification-email`
    
    const emailResponse = await fetch(emailFunctionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({
        notification_id: notification.id
      }),
    })

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text()
      console.error('Failed to trigger email send:', errorText)
      return new Response('Failed to trigger email send', { status: 500 })
    }

    const emailResult = await emailResponse.json()
    console.log('Email triggered successfully:', emailResult)

    return new Response(JSON.stringify({ 
      success: true,
      notification_id: notification.id,
      email_result: emailResult
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Error in notification-email-trigger function:', error)
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
})
