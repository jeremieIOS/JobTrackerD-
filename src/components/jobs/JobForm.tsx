import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { Job } from '../../lib/supabase'
import { Button } from '../ui/Button'
import { X } from 'lucide-react'

const jobSchema = z.object({
  title: z.string().min(1, 'Le titre est obligatoire'),
  description: z.string().optional(),
  status: z.enum(['not_started', 'in_progress', 'completed', 'blocked', 'cancelled', 'cancelled_by_client', 'no_parking']),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  due_date: z.string().optional(),
})

type JobFormData = z.infer<typeof jobSchema>

interface JobFormProps {
  job?: Job
  onSubmit: (data: Partial<Job>) => void
  onCancel: () => void
  isLoading?: boolean
}

export function JobForm({ job, onSubmit, onCancel, isLoading = false }: JobFormProps) {
  const isEdit = !!job

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<JobFormData>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      title: job?.title || '',
      description: job?.description || '',
      status: job?.status || 'not_started',
      priority: job?.priority || 'medium',
      due_date: job?.due_date ? new Date(job.due_date).toISOString().split('T')[0] : '',
    },
  })

  const handleFormSubmit = (data: JobFormData) => {
    const submitData: Partial<Job> = {
      ...data,
      due_date: data.due_date ? new Date(data.due_date).toISOString() : undefined,
    }
    
    if (isEdit) {
      submitData.id = job.id
    }
    
    onSubmit(submitData)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {isEdit ? 'Modifier le job' : 'Nouveau job'}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-4">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Titre *
            </label>
            <input
              {...register('title')}
              type="text"
              id="title"
              className="input-field"
              placeholder="Nom du job"
            />
            {errors.title && (
              <p className="text-red-600 text-sm mt-1">{errors.title.message}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              {...register('description')}
              id="description"
              rows={3}
              className="input-field"
              placeholder="Description du job..."
            />
            {errors.description && (
              <p className="text-red-600 text-sm mt-1">{errors.description.message}</p>
            )}
          </div>

          {/* Status */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
              Statut
            </label>
            <select {...register('status')} id="status" className="input-field">
              <option value="not_started">Non démarré</option>
              <option value="in_progress">En cours</option>
              <option value="completed">Terminé</option>
              <option value="blocked">Bloqué</option>
              <option value="cancelled">Annulé</option>
              <option value="cancelled_by_client">Annulé par client</option>
              <option value="no_parking">Pas de parking</option>
            </select>
            {errors.status && (
              <p className="text-red-600 text-sm mt-1">{errors.status.message}</p>
            )}
          </div>

          {/* Priority */}
          <div>
            <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
              Priorité
            </label>
            <select {...register('priority')} id="priority" className="input-field">
              <option value="low">Faible</option>
              <option value="medium">Moyenne</option>
              <option value="high">Élevée</option>
            </select>
            {errors.priority && (
              <p className="text-red-600 text-sm mt-1">{errors.priority.message}</p>
            )}
          </div>

          {/* Due Date */}
          <div>
            <label htmlFor="due_date" className="block text-sm font-medium text-gray-700 mb-1">
              Date d'échéance
            </label>
            <input
              {...register('due_date')}
              type="date"
              id="due_date"
              className="input-field"
            />
            {errors.due_date && (
              <p className="text-red-600 text-sm mt-1">{errors.due_date.message}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={onCancel}
              className="flex-1"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              loading={isLoading}
              className="flex-1"
            >
              {isEdit ? 'Modifier' : 'Créer'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
