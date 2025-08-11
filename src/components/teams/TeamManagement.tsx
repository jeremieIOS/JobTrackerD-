import { useState } from 'react'
import { useTeams, useTeamMembers, useUpdateMemberRole, useRemoveTeamMember, useLeaveTeam, useDeleteTeam } from '../../hooks/useTeams'
import { useAuth } from '../../hooks/useAuth'
import { Button } from '../../lib/components'
import { 
  Users, 
  Settings, 
  Crown, 
  Edit, 
  Eye, 
  UserMinus, 
  LogOut,
  Copy,
  Check,
  ChevronDown,
  Trash2,
  AlertTriangle
} from 'lucide-react'
import type { Team, TeamRole } from '../../lib/supabase'

interface TeamManagementProps {
  selectedTeamId?: string
  onTeamDeleted?: () => void
}

export function TeamManagement({ selectedTeamId, onTeamDeleted }: TeamManagementProps) {
  const [expandedTeam, setExpandedTeam] = useState<string | null>(null)
  const [copiedInviteCode, setCopiedInviteCode] = useState<string | null>(null)
  const { user } = useAuth()
  const { data: teams = [] } = useTeams()
  const updateMemberRole = useUpdateMemberRole()
  const removeMember = useRemoveTeamMember()
  const leaveTeam = useLeaveTeam()
  const deleteTeam = useDeleteTeam()
  
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)

  const handleDeleteTeam = async (teamId: string) => {
    try {
      await deleteTeam.mutateAsync(teamId)
      setShowDeleteConfirm(null)
      if (onTeamDeleted) {
        onTeamDeleted()
      }
    } catch (error) {
      console.error('Error deleting team:', error)
      alert('Failed to delete team. Make sure you are the team admin.')
    }
  }

  const currentTeam = teams.find((team: Team & { role: TeamRole }) => team.id === selectedTeamId)

  if (!selectedTeamId || !currentTeam) {
    return (
      <div className="text-center py-8">
        <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Team Selected</h3>
        <p className="text-gray-600">
          Select a team from the dropdown above to manage team members and settings.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <TeamCard 
        team={currentTeam}
        isExpanded={expandedTeam === currentTeam.id}
        onToggle={() => setExpandedTeam(expandedTeam === currentTeam.id ? null : currentTeam.id)}
        currentUserId={user?.id}
        copiedInviteCode={copiedInviteCode}
        setCopiedInviteCode={setCopiedInviteCode}
        updateMemberRole={updateMemberRole}
        removeMember={removeMember}
        leaveTeam={leaveTeam}
        onDeleteTeam={handleDeleteTeam}
        showDeleteConfirm={showDeleteConfirm}
        setShowDeleteConfirm={setShowDeleteConfirm}
        isDeleting={deleteTeam.isPending}
      />
    </div>
  )
}

interface TeamCardProps {
  team: Team & { role: TeamRole }
  isExpanded: boolean
  onToggle: () => void
  currentUserId?: string
  copiedInviteCode: string | null
  setCopiedInviteCode: (code: string | null) => void
  updateMemberRole: any
  removeMember: any
  leaveTeam: any
  onDeleteTeam: (teamId: string) => void
  showDeleteConfirm: string | null
  setShowDeleteConfirm: (teamId: string | null) => void
  isDeleting: boolean
}

function TeamCard({ 
  team, 
  isExpanded, 
  onToggle, 
  currentUserId,
  copiedInviteCode,
  setCopiedInviteCode,
  updateMemberRole,
  removeMember,
  leaveTeam,
  onDeleteTeam,
  showDeleteConfirm,
  setShowDeleteConfirm,
  isDeleting
}: TeamCardProps) {
  const { data: members = [] } = useTeamMembers(team.id)
  const isAdmin = team.role === 'admin'

  const handleCopyInviteCode = async () => {
    if (team.invite_code) {
      await navigator.clipboard.writeText(team.invite_code)
      setCopiedInviteCode(team.invite_code)
      setTimeout(() => setCopiedInviteCode(null), 2000)
    }
  }

  const handleRoleChange = (userId: string, newRole: TeamRole) => {
    updateMemberRole.mutate({ 
      teamId: team.id, 
      userId, 
      role: newRole 
    })
  }

  const handleRemoveMember = (userId: string) => {
    if (confirm('Are you sure you want to remove this member from the team?')) {
      removeMember.mutate({ teamId: team.id, userId })
    }
  }

  const handleLeaveTeam = () => {
    if (confirm('Are you sure you want to leave this team? You will lose access to all team jobs.')) {
      leaveTeam.mutate(team.id)
    }
  }

  const getRoleIcon = (role: TeamRole) => {
    switch (role) {
      case 'admin': return <Crown size={14} className="text-yellow-600" />
      case 'editor': return <Edit size={14} className="text-blue-600" />
      case 'viewer': return <Eye size={14} className="text-gray-600" />
    }
  }

  const getRoleColor = (role: TeamRole) => {
    switch (role) {
      case 'admin': return 'bg-yellow-100 text-yellow-800'
      case 'editor': return 'bg-blue-100 text-blue-800'
      case 'viewer': return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* Team Header */}
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
              <Users size={20} className="text-primary-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{team.name}</h3>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${getRoleColor(team.role)}`}>
                  {getRoleIcon(team.role)}
                  {team.role.charAt(0).toUpperCase() + team.role.slice(1)}
                </span>
                <span>•</span>
                <span>{members.length} member{members.length !== 1 ? 's' : ''}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {isAdmin && team.invite_code && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyInviteCode}
                className="flex items-center gap-1"
              >
                {copiedInviteCode === team.invite_code ? (
                  <>
                    <Check size={14} className="text-green-600" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy size={14} />
                    {team.invite_code}
                  </>
                )}
              </Button>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggle}
              className="flex items-center gap-1"
            >
              <Settings size={14} />
              <ChevronDown size={14} className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
            </Button>
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-gray-200 p-4 space-y-4">
          {/* Invite Section */}
          {isAdmin && team.invite_code && (
            <div className="bg-primary-50 border border-primary-200 rounded-lg p-3">
              <h4 className="font-medium text-primary-900 mb-1">Invite New Members</h4>
              <p className="text-sm text-primary-700 mb-2">
                Share this invite code: <span className="font-mono font-bold">{team.invite_code}</span>
              </p>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleCopyInviteCode}
                className="flex items-center gap-1"
              >
                {copiedInviteCode === team.invite_code ? (
                  <>
                    <Check size={14} />
                    Copied to clipboard
                  </>
                ) : (
                  <>
                    <Copy size={14} />
                    Copy invite code
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Members List */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Team Members</h4>
            <div className="space-y-2">
              {members.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-primary-600">
                        {member.user?.name?.charAt(0)?.toUpperCase() || member.user?.email?.charAt(0)?.toUpperCase() || '?'}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {member.user?.name || member.user?.email || 'Unknown User'}
                        {member.user_id === currentUserId && (
                          <span className="text-primary-600 ml-2">(You)</span>
                        )}
                      </div>
                      <div className="text-sm text-gray-600">{member.user?.email}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {isAdmin && member.user_id !== team.admin_id ? (
                      <>
                        <select
                          value={member.role}
                          onChange={(e) => handleRoleChange(member.user_id, e.target.value as TeamRole)}
                          className="text-sm border border-gray-300 rounded px-2 py-1"
                          disabled={updateMemberRole.isPending}
                        >
                          <option value="viewer">Viewer</option>
                          <option value="editor">Editor</option>
                          <option value="admin">Admin</option>
                        </select>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveMember(member.user_id)}
                          disabled={removeMember.isPending}
                          className="text-red-600 hover:text-red-700"
                        >
                          <UserMinus size={14} />
                        </Button>
                      </>
                    ) : (
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${getRoleColor(member.role)}`}>
                        {getRoleIcon(member.role)}
                        {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Team Actions */}
          {!isAdmin && (
            <div className="pt-4 border-t border-gray-200">
              <Button
                variant="ghost"
                onClick={handleLeaveTeam}
                disabled={leaveTeam.isPending}
                className="flex items-center gap-2 text-red-600 hover:text-red-700"
              >
                <LogOut size={14} />
                Leave Team
              </Button>
            </div>
          )}

          {/* Admin Actions */}
          {isAdmin && (
            <div className="pt-4 border-t border-gray-200">
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-900 flex items-center gap-2">
                  <Settings size={14} />
                  Admin Actions
                </h4>
                
                {showDeleteConfirm === team.id ? (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2 text-red-800">
                      <AlertTriangle size={16} />
                      <span className="font-medium">Delete Team</span>
                    </div>
                    <p className="text-sm text-red-700 mb-3">
                      This will permanently delete the team and convert all team jobs to personal jobs. This action cannot be undone.
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDeleteTeam(team.id)}
                        disabled={isDeleting}
                        className="bg-red-600 text-white hover:bg-red-700"
                      >
                        {isDeleting ? 'Deleting...' : 'Yes, Delete Team'}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowDeleteConfirm(null)}
                        disabled={isDeleting}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    variant="ghost"
                    onClick={() => setShowDeleteConfirm(team.id)}
                    className="flex items-center gap-2 text-red-600 hover:text-red-700"
                  >
                    <Trash2 size={14} />
                    Delete Team
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
