import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Team, TeamMember, TeamRole } from '../lib/supabase'
import { useAuth } from './useAuth'


// Get user's teams
export function useTeams() {
  const { user } = useAuth()
  
  return useQuery({
    queryKey: ['teams', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated')
      
      const { data, error } = await supabase
        .from('team_members')
        .select(`
          *,
          teams (*)
        `)
        .eq('user_id', user.id)
        
      if (error) throw error
      return data.map(member => ({
        ...member.teams,
        role: member.role,
        joined_at: member.joined_at
      })) as (Team & { role: TeamRole; joined_at: string })[]
    },
    enabled: !!user
  })
}

// Get team details
export function useTeam(teamId: string) {
  return useQuery({
    queryKey: ['team', teamId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .eq('id', teamId)
        .single()
        
      if (error) throw error
      return data as Team
    },
    enabled: !!teamId
  })
}

// Get team members
export function useTeamMembers(teamId: string) {
  return useQuery({
    queryKey: ['team-members', teamId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('team_members')
        .select(`
          *,
          users (*)
        `)
        .eq('team_id', teamId)
        
      if (error) throw error
      return data.map(member => ({
        ...member,
        user: member.users
      })) as (TeamMember & { user: any })[]
    },
    enabled: !!teamId
  })
}

// Create team
export function useCreateTeam() {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  
  return useMutation({
    mutationFn: async (teamData: { name: string }) => {
      if (!user) throw new Error('User not authenticated')
      
      // Generate a unique invite code
      const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase()
      
      const { data: team, error: teamError } = await supabase
        .from('teams')
        .insert({
          name: teamData.name,
          admin_id: user.id,
          invite_code: inviteCode,
        })
        .select()
        .single()
        
      if (teamError) throw teamError
      
      // Add creator as admin member
      const { error: memberError } = await supabase
        .from('team_members')
        .insert({
          team_id: team.id,
          user_id: user.id,
          role: 'admin' as TeamRole
        })
        
      if (memberError) throw memberError
      
      return team as Team
    },
    onSuccess: () => {
      // Invalider toutes les queries teams pour forcer le re-fetch
      queryClient.invalidateQueries({ queryKey: ['teams'] })
      queryClient.invalidateQueries({ queryKey: ['teams', user?.id] })
    }
  })
}

// Delete team (admin only)
export function useDeleteTeam() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (teamId: string) => {
      if (!user) throw new Error('User not authenticated')

      // Vérifier que l'utilisateur est admin de cette équipe
      const { data: teamData, error: teamError } = await supabase
        .from('teams')
        .select('admin_id')
        .eq('id', teamId)
        .single()

      if (teamError) throw teamError
      if (teamData.admin_id !== user.id) {
        throw new Error('Only team admin can delete the team')
      }

      // Supprimer d'abord tous les membres de l'équipe
      const { error: membersError } = await supabase
        .from('team_members')
        .delete()
        .eq('team_id', teamId)

      if (membersError) throw membersError

      // Supprimer tous les jobs de l'équipe (optionnel - ou les transférer)
      const { error: jobsError } = await supabase
        .from('jobs')
        .update({ team_id: null })  // Convertir en jobs personnels
        .eq('team_id', teamId)

      if (jobsError) throw jobsError

      // Enfin, supprimer l'équipe
      const { error: deleteError } = await supabase
        .from('teams')
        .delete()
        .eq('id', teamId)

      if (deleteError) throw deleteError

      return { teamId }
    },
    onSuccess: () => {
      // Invalider le cache des équipes
      queryClient.invalidateQueries({ queryKey: ['teams'] })
      queryClient.invalidateQueries({ queryKey: ['teams', user?.id] })
      // Invalider aussi le cache des jobs au cas où
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
    }
  })
}

// Join team by invite code
export function useJoinTeam() {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  
  return useMutation({
    mutationFn: async (inviteCode: string) => {
      if (!user) throw new Error('User not authenticated')
      
      // Find team by invite code
      const { data: team, error: teamError } = await supabase
        .from('teams')
        .select('*')
        .eq('invite_code', inviteCode.toUpperCase())
        .single()
        
      if (teamError) throw new Error('Invalid invite code')
      
      // Check if user is already a member
      const { data: existingMember } = await supabase
        .from('team_members')
        .select('*')
        .eq('team_id', team.id)
        .eq('user_id', user.id)
        .single()
        
      if (existingMember) {
        throw new Error('You are already a member of this team')
      }
      
      // Add user as team member
      const { error: memberError } = await supabase
        .from('team_members')
        .insert({
          team_id: team.id,
          user_id: user.id,
          role: 'editor' as TeamRole
        })
        
      if (memberError) throw memberError
      
      return team as Team
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] })
    }
  })
}

// Update team member role (admin only)
export function useUpdateMemberRole() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ teamId, userId, role }: { 
      teamId: string; 
      userId: string; 
      role: TeamRole 
    }) => {
      const { error } = await supabase
        .from('team_members')
        .update({ role })
        .eq('team_id', teamId)
        .eq('user_id', userId)
        
      if (error) throw error
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['team-members', variables.teamId] })
    }
  })
}

// Remove team member (admin only)
export function useRemoveTeamMember() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ teamId, userId }: { teamId: string; userId: string }) => {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('team_id', teamId)
        .eq('user_id', userId)
        
      if (error) throw error
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['team-members', variables.teamId] })
      queryClient.invalidateQueries({ queryKey: ['teams'] })
    }
  })
}

// Leave team
export function useLeaveTeam() {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  
  return useMutation({
    mutationFn: async (teamId: string) => {
      if (!user) throw new Error('User not authenticated')
      
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('team_id', teamId)
        .eq('user_id', user.id)
        
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] })
    }
  })
}


