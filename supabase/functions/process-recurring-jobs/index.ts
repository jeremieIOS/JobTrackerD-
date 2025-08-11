import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { serve } from 'https://deno.land/std@0.208.0/http/server.ts'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

serve(async (req) => {
  try {
    console.log('🔄 Processing recurring jobs...')

    // Créer le client Supabase avec les privilèges service
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // Appeler la fonction PostgreSQL pour générer les jobs récurrents
    const { data, error } = await supabase.rpc('generate_recurring_jobs')

    if (error) {
      console.error('❌ Error generating recurring jobs:', error)
      return new Response(JSON.stringify({
        success: false,
        error: error.message
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const jobsCreated = data || 0
    console.log(`✅ Generated ${jobsCreated} recurring job instances`)

    // Récupérer quelques statistiques
    const { data: stats, error: statsError } = await supabase
      .from('jobs')
      .select('is_recurring, COUNT(*)')
      .group('is_recurring')

    const statistics = {
      jobs_created: jobsCreated,
      recurring_stats: statsError ? null : stats,
      processed_at: new Date().toISOString()
    }

    // Optionnel: Nettoyer les anciens jobs terminés de plus de 30 jours
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    
    const { error: cleanupError } = await supabase
      .from('jobs')
      .delete()
      .eq('status', 'completed')
      .not('parent_job_id', 'is', null) // Only delete generated instances, not templates
      .lt('completed_at', thirtyDaysAgo)

    if (cleanupError) {
      console.warn('Cleanup warning:', cleanupError)
    }

    return new Response(JSON.stringify({
      success: true,
      statistics
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('💥 Error in process-recurring-jobs function:', error)
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
