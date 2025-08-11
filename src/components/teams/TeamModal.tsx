import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCreateTeam, useJoinTeam } from '../../hooks/useTeams'
import { Button } from '../ui/Button'
import { X, UserPlus, Plus } from 'lucide-react'

const createTeamSchema = z.object({
  name: z.string().min(1, 'Team name is required').max(50, 'Team name must be less than 50 characters')
})

const joinTeamSchema = z.object({
  inviteCode: z.string().min(6, 'Invite code must be 6 characters').max(6, 'Invite code must be 6 characters')
})

type CreateTeamData = z.infer<typeof createTeamSchema>
type JoinTeamData = z.infer<typeof joinTeamSchema>

interface TeamModalProps {
  onClose: () => void
  onTeamCreated?: (teamId: string) => void
}

export function TeamModal({ onClose, onTeamCreated }: TeamModalProps) {
  const [mode, setMode] = useState<'select' | 'create' | 'join'>('select')
  const createTeamMutation = useCreateTeam()
  const joinTeamMutation = useJoinTeam()

  const createForm = useForm<CreateTeamData>({
    resolver: zodResolver(createTeamSchema)
  })

  const joinForm = useForm<JoinTeamData>({
    resolver: zodResolver(joinTeamSchema)
  })

  const handleCreateTeam = async (data: CreateTeamData) => {
    try {
      const team = await createTeamMutation.mutateAsync(data)
      if (onTeamCreated && team) {
        onTeamCreated(team.id)
      }
      onClose()
    } catch (error) {
      console.error('Error creating team:', error)
    }
  }

  const handleJoinTeam = async (data: JoinTeamData) => {
    try {
      await joinTeamMutation.mutateAsync(data.inviteCode)
      onClose()
    } catch (error) {
      console.error('Error joining team:', error)
    }
  }

  const isLoading = createTeamMutation.isPending || joinTeamMutation.isPending

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {mode === 'select' && 'Team Management'}
            {mode === 'create' && 'Create Team'}
            {mode === 'join' && 'Join Team'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          {mode === 'select' && (
            <div className="space-y-4">
              <p className="text-gray-600 text-sm mb-4">
                Create a new team to collaborate with others, or join an existing team with an invite code.
              </p>
              
              <Button
                onClick={() => setMode('create')}
                className="w-full flex items-center justify-center gap-2"
              >
                <Plus size={16} />
                Create New Team
              </Button>
              
              <Button
                variant="secondary"
                onClick={() => setMode('join')}
                className="w-full flex items-center justify-center gap-2"
              >
                <UserPlus size={16} />
                Join Existing Team
              </Button>
            </div>
          )}

          {mode === 'create' && (
            <form onSubmit={createForm.handleSubmit(handleCreateTeam)} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Team Name *
                </label>
                <input
                  {...createForm.register('name')}
                  type="text"
                  id="name"
                  className="input-field"
                  placeholder="My Awesome Team"
                  disabled={isLoading}
                />
                {createForm.formState.errors.name && (
                  <p className="text-red-600 text-sm mt-1">
                    {createForm.formState.errors.name.message}
                  </p>
                )}
              </div>

              {createTeamMutation.error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm">
                    {createTeamMutation.error instanceof Error 
                      ? createTeamMutation.error.message 
                      : 'Failed to create team'}
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setMode('select')}
                  className="flex-1"
                  disabled={isLoading}
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  loading={isLoading}
                  className="flex-1"
                >
                  Create Team
                </Button>
              </div>
            </form>
          )}

          {mode === 'join' && (
            <form onSubmit={joinForm.handleSubmit(handleJoinTeam)} className="space-y-4">
              <div>
                <label htmlFor="inviteCode" className="block text-sm font-medium text-gray-700 mb-1">
                  Invite Code *
                </label>
                <input
                  {...joinForm.register('inviteCode')}
                  type="text"
                  id="inviteCode"
                  className="input-field uppercase tracking-wider"
                  placeholder="ABC123"
                  maxLength={6}
                  disabled={isLoading}
                  onChange={(e) => {
                    e.target.value = e.target.value.toUpperCase()
                    joinForm.setValue('inviteCode', e.target.value)
                  }}
                />
                {joinForm.formState.errors.inviteCode && (
                  <p className="text-red-600 text-sm mt-1">
                    {joinForm.formState.errors.inviteCode.message}
                  </p>
                )}
                <p className="text-gray-500 text-xs mt-1">
                  Enter the 6-character invite code shared by your team admin
                </p>
              </div>

              {joinTeamMutation.error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm">
                    {joinTeamMutation.error instanceof Error 
                      ? joinTeamMutation.error.message 
                      : 'Failed to join team'}
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setMode('select')}
                  className="flex-1"
                  disabled={isLoading}
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  loading={isLoading}
                  className="flex-1"
                >
                  Join Team
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
