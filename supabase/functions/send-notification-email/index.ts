import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { serve } from 'https://deno.land/std@0.208.0/http/server.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

// Templates d'email selon le type de notification
const emailTemplates = {
  job_assigned: {
    subject: '📋 New job assigned to you',
    getBody: (data: any) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">New Job Assignment</h2>
        <p>Hello! You have been assigned a new job:</p>
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0;">${data.job?.title}</h3>
          <p style="color: #64748b; margin: 0;">Click the link below to view details and get started.</p>
        </div>
        <a href="${data.app_url}/jobs/${data.job_id}" 
           style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          View Job Details
        </a>
        <p style="color: #64748b; font-size: 14px; margin-top: 30px;">
          Best regards,<br>Job Tracker Team
        </p>
      </div>
    `
  },
  job_completed: {
    subject: '✅ Job completed successfully',
    getBody: (data: any) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #16a34a;">Job Completed! 🎉</h2>
        <p>Great news! A job has been marked as completed:</p>
        <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #16a34a;">
          <h3 style="margin: 0 0 10px 0;">${data.job?.title}</h3>
          <p style="color: #15803d; margin: 0;">Completed by ${data.triggered_by_user?.name || data.triggered_by_user?.email}</p>
        </div>
        <a href="${data.app_url}/jobs/${data.job_id}" 
           style="background: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          View Job
        </a>
        <p style="color: #64748b; font-size: 14px; margin-top: 30px;">
          Best regards,<br>Job Tracker Team
        </p>
      </div>
    `
  },
  note_added: {
    subject: '💬 New note added to your job',
    getBody: (data: any) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #7c3aed;">New Note Added</h2>
        <p>${data.triggered_by_user?.name || data.triggered_by_user?.email} added a note to a job:</p>
        <div style="background: #faf5ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #7c3aed;">
          <h3 style="margin: 0 0 10px 0;">${data.job?.title}</h3>
          <p style="color: #6d28d9; margin: 0; font-style: italic;">"${data.message}"</p>
        </div>
        <a href="${data.app_url}/jobs/${data.job_id}" 
           style="background: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          View Note
        </a>
        <p style="color: #64748b; font-size: 14px; margin-top: 30px;">
          Best regards,<br>Job Tracker Team
        </p>
      </div>
    `
  },
  team_invited: {
    subject: '👥 You\'ve been invited to join a team',
    getBody: (data: any) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">Team Invitation</h2>
        <p>You've been invited to join a team:</p>
        <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
          <h3 style="margin: 0 0 10px 0;">${data.team?.name}</h3>
          <p style="color: #b91c1c; margin: 0;">Invited by ${data.triggered_by_user?.name || data.triggered_by_user?.email}</p>
        </div>
        <a href="${data.app_url}/teams" 
           style="background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          Join Team
        </a>
        <p style="color: #64748b; font-size: 14px; margin-top: 30px;">
          Best regards,<br>Job Tracker Team
        </p>
      </div>
    `
  }
}

serve(async (req) => {
  try {
    // Vérifier la méthode HTTP
    if (req.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 })
    }

    // Vérifier la clé API Resend
    if (!RESEND_API_KEY) {
      console.error('RESEND_API_KEY not configured')
      return new Response('Email service not configured', { status: 500 })
    }

    // Parser le body de la requête
    const { notification_id } = await req.json()

    if (!notification_id) {
      return new Response('notification_id is required', { status: 400 })
    }

    // Créer le client Supabase avec les privilèges service
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // Récupérer les détails de la notification
    const { data: notification, error: notificationError } = await supabase
      .from('notifications')
      .select(`
        *,
        triggered_by_user:users!notifications_triggered_by_fkey(id, name, email),
        job:jobs(id, title),
        team:teams(id, name)
      `)
      .eq('id', notification_id)
      .single()

    if (notificationError || !notification) {
      console.error('Notification not found:', notificationError)
      return new Response('Notification not found', { status: 404 })
    }

    // Récupérer l'utilisateur destinataire
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('email, name')
      .eq('id', notification.user_id)
      .single()

    if (userError || !user) {
      console.error('User not found:', userError)
      return new Response('User not found', { status: 404 })
    }

    // Récupérer le template email approprié
    const template = emailTemplates[notification.type as keyof typeof emailTemplates]
    if (!template) {
      console.error('No email template for notification type:', notification.type)
      return new Response('No email template found', { status: 400 })
    }

    // Préparer les données pour le template
    const templateData = {
      ...notification,
      app_url: 'https://jobtracker.yourdomain.com' // À remplacer par votre URL d'app
    }

    // Envoyer l'email via Resend
    const emailBody = template.getBody(templateData)
    
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Job Tracker <noreply@yourdomain.com>', // À remplacer par votre domaine
        to: [user.email],
        subject: template.subject,
        html: emailBody,
      }),
    })

    const emailResult = await emailResponse.json()

    if (!emailResponse.ok) {
      console.error('Failed to send email:', emailResult)
      return new Response('Failed to send email', { status: 500 })
    }

    console.log('Email sent successfully:', emailResult)

    // Mettre à jour la notification pour marquer qu'elle a été envoyée par email
    await supabase
      .from('notifications')
      .update({ 
        data: { 
          ...notification.data, 
          email_sent: true, 
          email_id: emailResult.id 
        } 
      })
      .eq('id', notification_id)

    return new Response(JSON.stringify({ 
      success: true, 
      email_id: emailResult.id 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Error in send-notification-email function:', error)
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
