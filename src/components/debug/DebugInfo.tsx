import { useJobs } from '../../hooks/useJobs'
import { useAuth } from '../../hooks/useAuth'

interface DebugInfoProps {
  teamId?: string
}

export function DebugInfo({ teamId }: DebugInfoProps) {
  const { user } = useAuth()
  const { jobs, isLoading, error } = useJobs(teamId)

  if (process.env.NODE_ENV === 'production') {
    return null
  }

  return (
    <div className="fixed bottom-4 left-4 bg-black text-white p-4 rounded-lg text-xs max-w-md">
      <div className="font-bold mb-2">🐛 Debug Info</div>
      <div><strong>User:</strong> {user?.id}</div>
      <div><strong>TeamId:</strong> {teamId || 'null (Personal)'}</div>
      <div><strong>Jobs count:</strong> {jobs?.length || 0}</div>
      <div><strong>Is loading:</strong> {isLoading ? 'Yes' : 'No'}</div>
      {error && <div className="text-red-400"><strong>Error:</strong> {String(error)}</div>}
      <div className="mt-2">
        <strong>Jobs:</strong>
        {jobs?.map(job => (
          <div key={job.id} className="ml-2">
            - {job.title} (team_id: {job.team_id || 'null'})
          </div>
        ))}
      </div>
    </div>
  )
}
