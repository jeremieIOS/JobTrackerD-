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
        .select(`
          *,
          created_by_user:users!jobs_created_by_fkey(name, email),
          team:teams(name)
        `)
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (newJob) => {
      // Invalidate all job queries to ensure the new job appears immediately
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
      // Also invalidate the specific query for current context
      queryClient.invalidateQueries({ queryKey: ['jobs', user?.id, teamId] })
      
      // Optimistically update the current query
      queryClient.setQueryData(['jobs', user?.id, teamId], (oldData: Job[] | undefined) => {
        if (!oldData) return [newJob]
        return [newJob, ...oldData]
      })
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
      // Invalidate all job queries to ensure updates appear immediately
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
      queryClient.invalidateQueries({ queryKey: ['jobs', user?.id, teamId] })
    },
  })

  // Supprimer un job
  const deleteJobMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('jobs').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      // Invalidate all job queries to ensure deletions appear immediately
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
      queryClient.invalidateQueries({ queryKey: ['jobs', user?.id, teamId] })
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
      // Invalidate all job queries to ensure completions appear immediately
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
      queryClient.invalidateQueries({ queryKey: ['jobs', user?.id, teamId] })
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
