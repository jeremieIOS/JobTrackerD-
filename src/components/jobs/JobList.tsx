import { useState } from 'react'
import { useJobs } from '../../hooks/useJobs'
import type { Job } from '../../lib/supabase'
import { JobCard } from './JobCard'
import { JobForm } from './JobForm'
import { Button } from '../ui/Button'
import { Plus, Search, Filter } from 'lucide-react'

export function JobList() {
  const { 
    jobs, 
    isLoading, 
    createJob, 
    updateJob, 
    deleteJob, 
    completeJob,
    isCreating,
    isUpdating 
  } = useJobs()

  const [showForm, setShowForm] = useState(false)
  const [editingJob, setEditingJob] = useState<Job | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  // Filtrer les jobs
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (job.description && job.description.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesStatus = statusFilter === 'all' || job.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const handleSubmit = (data: Partial<Job>) => {
    if (editingJob) {
      updateJob({ id: editingJob.id, updates: data })
    } else {
      createJob(data)
    }
    setShowForm(false)
    setEditingJob(null)
  }

  const handleEdit = (job: Job) => {
    setEditingJob(job)
    setShowForm(true)
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingJob(null)
  }

  const handleDelete = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce job ?')) {
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
            <h2 className="text-2xl font-bold text-gray-900">Mes Jobs</h2>
            <p className="text-gray-600 mt-1">
              {jobs.length} job{jobs.length > 1 ? 's' : ''} au total
            </p>
          </div>
          <Button onClick={() => setShowForm(true)}>
            <Plus size={16} className="mr-2" />
            Nouveau Job
          </Button>
        </div>

        {/* Barre de recherche et filtres */}
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Rechercher un job..."
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
              <option value="all">Tous les statuts</option>
              <option value="not_started">Non démarré</option>
              <option value="in_progress">En cours</option>
              <option value="completed">Terminé</option>
              <option value="blocked">Bloqué</option>
              <option value="cancelled">Annulé</option>
              <option value="cancelled_by_client">Annulé par client</option>
              <option value="no_parking">Pas de parking</option>
            </select>
          </div>
        </div>
      </div>

      {/* Liste des jobs */}
      {filteredJobs.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus size={32} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {jobs.length === 0 ? 'Aucun job pour le moment' : 'Aucun job trouvé'}
          </h3>
          <p className="text-gray-600 mb-6">
            {jobs.length === 0 
              ? 'Commencez par créer votre premier job pour suivre vos tâches.'
              : 'Essayez de modifier vos critères de recherche.'
            }
          </p>
          {jobs.length === 0 && (
            <Button onClick={() => setShowForm(true)}>
              <Plus size={16} className="mr-2" />
              Créer mon premier job
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
            />
          ))}
        </div>
      )}

      {/* Formulaire modal */}
      {showForm && (
        <JobForm
          job={editingJob || undefined}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={isCreating || isUpdating}
        />
      )}
    </div>
  )
}
