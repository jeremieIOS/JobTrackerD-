import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { serve } from 'https://deno.land/std@0.208.0/http/server.ts'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

// Cette Edge Function est destinée à être appelée par un cron job
// Elle traite la queue d'emails en attente
serve(async (req) => {
  try {
    console.log('🔄 Email queue processor started...')

    // Créer le client Supabase
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // Nettoyer d'abord les anciens emails échoués (plus de 24h)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    
    const { error: cleanupError } = await supabase
      .from('email_queue')
      .delete()
      .eq('status', 'failed')
      .gte('retry_count', 3)
      .lt('created_at', oneDayAgo)

    if (cleanupError) {
      console.warn('Cleanup warning:', cleanupError)
    }

    // Appeler la fonction de traitement de la queue
    const processorUrl = `${SUPABASE_URL}/functions/v1/process-email-queue`
    
    const response = await fetch(processorUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
    })

    const result = await response.json()

    if (!response.ok) {
      console.error('❌ Queue processing failed:', result)
      return new Response(JSON.stringify({
        success: false,
        error: result.error || 'Queue processing failed'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    console.log('✅ Queue processing completed:', result)

    // Récupérer des statistiques
    const { data: stats, error: statsError } = await supabase
      .from('email_queue')
      .select('status, COUNT(*)')
      .group('status')

    const statistics = {
      queue_processing: result,
      queue_stats: statsError ? null : stats,
      processed_at: new Date().toISOString()
    }

    return new Response(JSON.stringify({
      success: true,
      statistics
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('💥 Email queue processor error:', error)
    return new Response(JSON.stringify({
      success: false,
      error: 'Internal server error',
      details: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
})
