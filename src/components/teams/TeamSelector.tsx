import { useState } from 'react'
import { useTeams } from '../../hooks/useTeams'
import { TeamModal } from './TeamModal'
import { ChevronDown, Plus, Users } from '../ui/icons'
import type { Team, TeamRole } from '../../lib/supabase'

interface TeamSelectorProps {
  selectedTeamId?: string
  onTeamSelect: (teamId: string | undefined) => void
  className?: string
}

export function TeamSelector({ selectedTeamId, onTeamSelect, className = '' }: TeamSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [showTeamModal, setShowTeamModal] = useState(false)
  const { data: teams = [], isLoading } = useTeams()

  const selectedTeam = teams.find((team: Team & { role: TeamRole }) => team.id === selectedTeamId)

  const handleTeamSelect = (teamId: string | undefined) => {
    onTeamSelect(teamId)
    setIsOpen(false)
  }

  if (isLoading) {
    return (
      <div className={`animate-pulse bg-gray-200 h-10 rounded-lg ${className}`} />
    )
  }

  return (
    <>
      <div className={`relative ${className}`}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-between w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <div className="flex items-center gap-2">
            <Users size={16} className="text-gray-400" />
            <span className="text-gray-700">
              {selectedTeam ? selectedTeam.name : 'Personal Jobs'}
            </span>
            {selectedTeam && (
              <span className="px-2 py-0.5 text-xs bg-primary-100 text-primary-700 rounded-full">
                {selectedTeam.role}
              </span>
            )}
          </div>
          <ChevronDown size={16} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
            <div className="py-1">
              {/* Personal Jobs Option */}
              <button
                onClick={() => handleTeamSelect(undefined)}
                className={`flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-gray-100 ${
                  !selectedTeamId ? 'bg-primary-50 text-primary-700' : 'text-gray-700'
                }`}
              >
                <Users size={16} className="text-gray-400" />
                Personal Jobs
                {!selectedTeamId && (
                  <span className="ml-auto text-primary-600">✓</span>
                )}
              </button>

              {/* Team Options */}
              {teams.map((team: Team & { role: TeamRole }) => (
                <button
                  key={team.id}
                  onClick={() => handleTeamSelect(team.id)}
                  className={`flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-gray-100 ${
                    selectedTeamId === team.id ? 'bg-primary-50 text-primary-700' : 'text-gray-700'
                  }`}
                >
                  <Users size={16} className="text-gray-400" />
                  <span className="flex-1 text-left">{team.name}</span>
                  <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full">
                    {team.role}
                  </span>
                  {selectedTeamId === team.id && (
                    <span className="text-primary-600">✓</span>
                  )}
                </button>
              ))}

              {/* Divider */}
              {teams.length > 0 && <div className="border-t border-gray-100 my-1" />}

              {/* Create/Join Team */}
              <button
                onClick={() => {
                  setShowTeamModal(true)
                  setIsOpen(false)
                }}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-primary-600 hover:bg-primary-50"
              >
                <Plus size={16} />
                Create or Join Team
              </button>
            </div>
          </div>
        )}

        {/* Click outside to close */}
        {isOpen && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
        )}
      </div>

      {/* Team Modal */}
      {showTeamModal && (
        <TeamModal onClose={() => setShowTeamModal(false)} />
      )}
    </>
  )
}
