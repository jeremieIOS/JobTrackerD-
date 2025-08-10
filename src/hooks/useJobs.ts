import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase, type Job, type JobStatus } from '../lib/supabase'
import { useAuth } from './useAuth'

export function useJobs() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  // Récupérer tous les jobs de l'utilisateur
  const {
    data: jobs = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['jobs', user?.id],
    queryFn: async () => {
      if (!user) return []

      const { data, error } = await supabase
        .from('jobs')
        .select(`
          *,
          created_by_user:users!jobs_created_by_fkey(name, email),
          team:teams(name)
        `)
        .or(`created_by.eq.${user.id},team_id.in.(${await getUserTeamIds()})`)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data as Job[]
    },
    enabled: !!user,
  })

  // Récupérer les IDs des équipes de l'utilisateur
  const getUserTeamIds = async () => {
    if (!user) return ''
    
    const { data } = await supabase
      .from('team_members')
      .select('team_id')
      .eq('user_id', user.id)
    
    return data?.map(tm => tm.team_id).join(',') || ''
  }

  // Créer un job
  const createJobMutation = useMutation({
    mutationFn: async (newJob: Partial<Job>) => {
      if (!user) throw new Error('Utilisateur non connecté')

      const { data, error } = await supabase
        .from('jobs')
        .insert([
          {
            ...newJob,
            created_by: user.id,
            status: newJob.status || 'not_started',
            completed: false,
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
