import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase, type Job, type JobStatus } from '../lib/supabase'
import { useAuth } from './useAuth'

export function useJobs(teamId?: string) {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  // Récupérer tous les jobs de l'utilisateur ou d'une équipe spécifique
  const {
    data: jobs = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['jobs', user?.id, teamId],
    queryFn: async () => {
      if (!user) return []

      let query = supabase
        .from('jobs')
        .select(`
          *,
          created_by_user:users!jobs_created_by_fkey(name, email),
          team:teams(name)
        `)

      if (teamId) {
        // Filter by specific team
        query = query.eq('team_id', teamId)
      } else {
        // Personal jobs only (no team)
        query = query.is('team_id', null).eq('created_by', user.id)
      }

      const { data, error } = await query.order('created_at', { ascending: false })

      if (error) throw error
      return data as Job[]
    },
    enabled: !!user,
  })



  // Créer un job
  const createJobMutation = useMutation({
    mutationFn: async (newJob: Partial<Job>) => {
      if (!user) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('jobs')
        .insert([
          {
            ...newJob,
            created_by: user.id,
            status: newJob.status || 'not_started',
            completed: false,
            team_id: teamId || null, // Assign to current team if specified
          },
        ])
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
    },
  })

  // Mettre à jour un job
  const updateJobMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Job> }) => {
      const { data, error } = await supabase
        .from('jobs')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
    },
  })

  // Supprimer un job
  const deleteJobMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('jobs').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
    },
  })

  // Marquer un job comme terminé
  const completeJobMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('jobs')
        .update({
          status: 'completed' as JobStatus,
          completed: true,
          completed_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
    },
  })

  return {
    jobs,
    isLoading,
    error,
    createJob: createJobMutation.mutate,
    updateJob: updateJobMutation.mutate,
    deleteJob: deleteJobMutation.mutate,
    completeJob: completeJobMutation.mutate,
    isCreating: createJobMutation.isPending,
    isUpdating: updateJobMutation.isPending,
    isDeleting: deleteJobMutation.isPending,
    isCompleting: completeJobMutation.isPending,
  }
}
