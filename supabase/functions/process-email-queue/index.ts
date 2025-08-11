import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { serve } from 'https://deno.land/std@0.208.0/http/server.ts'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

serve(async (req) => {
  try {
    console.log('Processing email queue...')

    // Créer le client Supabase
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // Récupérer les emails en attente (max 10 à la fois pour éviter les timeouts)
    const { data: queueItems, error: queueError } = await supabase
      .from('email_queue')
      .select(`
        id,
        notification_id,
        status,
        retry_count,
        notifications:notification_id (
          id,
          type,
          title,
          message,
          user_id,
          job_id,
          team_id,
          triggered_by
        )
      `)
      .eq('status', 'pending')
      .lt('retry_count', 3)
      .order('created_at', { ascending: true })
      .limit(10)

    if (queueError) {
      console.error('Error fetching email queue:', queueError)
      return new Response('Error fetching email queue', { status: 500 })
    }

    if (!queueItems || queueItems.length === 0) {
      console.log('No pending emails in queue')
      return new Response(JSON.stringify({ 
        processed: 0, 
        message: 'No pending emails' 
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    console.log(`Found ${queueItems.length} emails to process`)
    
    let successCount = 0
    let failureCount = 0

    // Traiter chaque email dans la queue
    for (const item of queueItems) {
      try {
        // Marquer comme en cours de traitement
        await supabase
          .from('email_queue')
          .update({ status: 'processing' })
          .eq('id', item.id)

        // Appeler la fonction d'envoi d'email
        const emailFunctionUrl = `${SUPABASE_URL}/functions/v1/send-notification-email`
        
        const emailResponse = await fetch(emailFunctionUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          },
          body: JSON.stringify({
            notification_id: item.notification_id
          }),
        })

        if (emailResponse.ok) {
          // Succès - marquer comme envoyé
          await supabase
            .from('email_queue')
            .update({ 
              status: 'sent', 
              processed_at: new Date().toISOString(),
              error_message: null
            })
            .eq('id', item.id)
          
          successCount++
          console.log(`Email sent successfully for notification ${item.notification_id}`)
        } else {
          // Échec - marquer comme échoué et incrémenter retry_count
          const errorText = await emailResponse.text()
          await supabase
            .from('email_queue')
            .update({ 
              status: 'failed',
              retry_count: item.retry_count + 1,
              error_message: errorText,
              processed_at: new Date().toISOString()
            })
            .eq('id', item.id)
          
          failureCount++
          console.error(`Failed to send email for notification ${item.notification_id}:`, errorText)
        }

      } catch (error) {
        // Erreur de traitement - marquer comme échoué
        await supabase
          .from('email_queue')
          .update({ 
            status: 'failed',
            retry_count: item.retry_count + 1,
            error_message: error.message,
            processed_at: new Date().toISOString()
          })
          .eq('id', item.id)
        
        failureCount++
        console.error(`Error processing email for notification ${item.notification_id}:`, error)
      }
    }

    console.log(`Email processing complete: ${successCount} sent, ${failureCount} failed`)

    return new Response(JSON.stringify({
      processed: queueItems.length,
      success: successCount,
      failures: failureCount,
      message: `Processed ${queueItems.length} emails`
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Error in process-email-queue function:', error)
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
})
