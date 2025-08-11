import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase, type JobNote } from '../lib/supabase'
import { useAuth } from './useAuth'
import { useCreateNotification } from './useNotifications'

export function useJobNotes(jobId: string) {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const createNotification = useCreateNotification()

  const {
    data: notes = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['job-notes', jobId],
    queryFn: async () => {
      if (!user) return []

      const { data, error } = await supabase
        .from('job_notes')
        .select(`
          *,
          user:users!job_notes_user_id_fkey(
            id,
            name,
            email
          )
        `)
        .eq('job_id', jobId)
        .order('created_at', { ascending: true })

      if (error) throw error
      return data as JobNote[]
    },
    enabled: !!user && !!jobId,
    staleTime: 30 * 1000, // 30 seconds
  })

  const createNoteMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!user) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('job_notes')
        .insert([
          {
            job_id: jobId,
            user_id: user.id,
            content: content.trim(),
          },
        ])
        .select(`
          *,
          user:users!job_notes_user_id_fkey(
            id,
            name,
            email
          )
        `)
        .single()

      if (error) throw error
      return data as JobNote
    },
    onSuccess: async (newNote) => {
      // Optimistically update the cache
      queryClient.setQueryData(['job-notes', jobId], (oldData: JobNote[] | undefined) => {
        if (!oldData) return [newNote]
        return [...oldData, newNote]
      })
      queryClient.invalidateQueries({ queryKey: ['job-notes', jobId] })

      // Créer des notifications pour les autres membres de l'équipe
      try {
        // D'abord, récupérer les infos du job pour connaître l'équipe
        const { data: job, error: jobError } = await supabase
          .from('jobs')
          .select('id, title, team_id, created_by')
          .eq('id', jobId)
          .single()

        if (jobError || !job) return

        // Si c'est un job d'équipe, notifier les autres membres
        if (job.team_id) {
          const { data: teamMembers, error: membersError } = await supabase
            .from('team_members')
            .select('user_id, users(name, email)')
            .eq('team_id', job.team_id)
            .neq('user_id', user?.id) // Exclure l'auteur de la note

          if (membersError || !teamMembers) return

          // Créer une notification pour chaque membre de l'équipe
          for (const member of teamMembers) {
            createNotification.mutate({
              user_id: member.user_id,
              type: 'note_added',
              title: 'New note added',
              message: `${user?.email} added a note to "${job.title}"`,
              job_id: jobId,
              team_id: job.team_id,
              note_id: newNote.id,
              triggered_by: user?.id,
            })
          }
        } else if (job.created_by && job.created_by !== user?.id) {
          // Si c'est un job personnel et qu'on n'est pas le créateur, notifier le créateur
          createNotification.mutate({
            user_id: job.created_by,
            type: 'note_added',
            title: 'New note added',
            message: `${user?.email} added a note to your job "${job.title}"`,
            job_id: jobId,
            note_id: newNote.id,
            triggered_by: user?.id,
          })
        }
      } catch (error) {
        console.error('Error creating notifications:', error)
      }
    },
  })

  const updateNoteMutation = useMutation({
    mutationFn: async ({ noteId, content }: { noteId: string; content: string }) => {
      const { data, error } = await supabase
        .from('job_notes')
        .update({ content: content.trim() })
        .eq('id', noteId)
        .eq('user_id', user?.id) // Sécurité : seulement ses propres notes
        .select(`
          *,
          user:users!job_notes_user_id_fkey(
            id,
            name,
            email
          )
        `)
        .single()

      if (error) throw error
      return data as JobNote
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-notes', jobId] })
    },
  })

  const deleteNoteMutation = useMutation({
    mutationFn: async (noteId: string) => {
      const { error } = await supabase
        .from('job_notes')
        .delete()
        .eq('id', noteId)
        .eq('user_id', user?.id) // Sécurité : seulement ses propres notes

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-notes', jobId] })
    },
  })

  return {
    notes,
    isLoading,
    error,
    createNote: createNoteMutation.mutate,
    updateNote: updateNoteMutation.mutate,
    deleteNote: deleteNoteMutation.mutate,
    isCreating: createNoteMutation.isPending,
    isUpdating: updateNoteMutation.isPending,
    isDeleting: deleteNoteMutation.isPending,
  }
}

// Hook pour compter les notes d'un job (utilisé dans JobCard)
export function useJobNotesCount(jobId: string) {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['job-notes-count', jobId],
    queryFn: async () => {
      if (!user) return 0

      const { count, error } = await supabase
        .from('job_notes')
        .select('*', { count: 'exact', head: true })
        .eq('job_id', jobId)

      if (error) throw error
      return count || 0
    },
    enabled: !!user && !!jobId,
    staleTime: 60 * 1000, // 1 minute
  })
}
