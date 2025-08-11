import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useJobs } from '../../hooks/useJobs'
import type { Job, JobStatus } from '../../lib/supabase'
import { JobCard } from './JobCard'
import { TeamSelector } from '../teams/TeamSelector'
import { Button } from '../ui/button'
import { Plus, Search, Filter } from 'lucide-react'

export function JobList() {
  const navigate = useNavigate()
  const [selectedTeamId, setSelectedTeamId] = useState<string | undefined>(undefined)
  const { 
    jobs, 
    isLoading, 
    updateJob, 
    deleteJob, 
    completeJob
  } = useJobs(selectedTeamId)

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  // Filtrer les jobs
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (job.description && job.description.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesStatus = statusFilter === 'all' || job.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const handleEdit = (job: Job) => {
    navigate(`/jobs/${job.id}/edit`)
  }

  const handleCreateNew = () => {
    navigate('/jobs/new')
  }

  const handleStatusChange = (id: string, status: JobStatus) => {
    updateJob({ id, updates: { status } })
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this job?')) {
      deleteJob(id)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div>
      {/* Header avec recherche et filtres */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">My Jobs</h2>
            <p className="text-muted-foreground mt-1">
              {jobs.length} job{jobs.length > 1 ? 's' : ''} total
            </p>
          </div>
          <div className="flex items-center gap-3">
            <TeamSelector
              selectedTeamId={selectedTeamId}
              onTeamSelect={setSelectedTeamId}
              className="min-w-[200px]"
            />
            <Button onClick={handleCreateNew}>
              <Plus size={16} className="mr-2" />
              New Job
            </Button>
          </div>
        </div>

        {/* Barre de recherche et filtres */}
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search jobs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-field pl-10 pr-4"
            >
              <option value="all">All Statuses</option>
              <option value="not_started">Not Started</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="no_parking">No Parking</option>
            </select>
          </div>
        </div>
      </div>

      {/* Liste des jobs */}
      {filteredJobs.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus size={32} className="text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">
            {jobs.length === 0 ? 'No jobs yet' : 'No jobs found'}
          </h3>
          <p className="text-muted-foreground mb-6">
            {jobs.length === 0 
              ? 'Start by creating your first job to track your tasks.'
              : 'Try adjusting your search criteria.'
            }
          </p>
          {jobs.length === 0 && (
            <Button onClick={handleCreateNew}>
              <Plus size={16} className="mr-2" />
              Create my first job
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredJobs.map((job) => (
                          <JobCard
                key={job.id}
                job={job}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onComplete={completeJob}
                onStatusChange={handleStatusChange}
              />
          ))}
        </div>
      )}

      {/* Debug Info - Completed and removed */}
    </div>
  )
}
