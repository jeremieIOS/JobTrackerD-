import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { Job, RecurrencePattern } from '../../lib/supabase'
import { Button } from '../ui/button'
import { LocationPicker } from '../maps/LocationPicker'
import { LocationDisplay } from '../maps/LocationDisplay'
import { RecurrenceSettings } from './RecurrenceSettings'
import { MapPin, Plus, X } from 'lucide-react'

const jobSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  status: z.enum(['not_started', 'completed', 'cancelled', 'no_parking']),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  due_date: z.string().optional(),
})

type JobFormData = z.infer<typeof jobSchema>

interface LocationData {
  lat: number
  lng: number
  address?: string
}

interface JobFormContentProps {
  job?: Job
  onSubmit: (data: Partial<Job>) => void
  onCancel: () => void
  isLoading?: boolean
}

export function JobFormContent({ job, onSubmit, onCancel, isLoading = false }: JobFormContentProps) {
  const isEdit = !!job
  const [showLocationPicker, setShowLocationPicker] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(
    job?.location || null
  )
  const [recurrencePattern, setRecurrencePattern] = useState<RecurrencePattern | null>(
    job?.recurrence_pattern || null
  )

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
      location: selectedLocation || undefined,
      is_recurring: !!recurrencePattern,
      recurrence_pattern: recurrencePattern || undefined,
      next_occurrence: recurrencePattern ? new Date().toISOString() : undefined,
    }
    
    if (isEdit) {
      submitData.id = job.id
    }
    
    onSubmit(submitData)
  }

  const handleLocationSelect = (location: LocationData) => {
    setSelectedLocation(location)
    setShowLocationPicker(false)
  }

  const handleRemoveLocation = () => {
    setSelectedLocation(null)
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Title *
          </label>
          <input
            id="title"
            type="text"
            className="input-field"
            placeholder="Job name"
            {...register('title')}
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
            id="description"
            rows={3}
            className="input-field"
            placeholder="Job description..."
            {...register('description')}
          />
          {errors.description && (
            <p className="text-red-600 text-sm mt-1">{errors.description.message}</p>
          )}
        </div>

        {/* Status */}
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select id="status" className="input-field" {...register('status')}>
            <option value="not_started">Not Started</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="no_parking">No Parking</option>
          </select>
          {errors.status && (
            <p className="text-red-600 text-sm mt-1">{errors.status.message}</p>
          )}
        </div>

        {/* Priority */}
        <div>
          <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
            Priority
          </label>
          <select id="priority" className="input-field" {...register('priority')}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          {errors.priority && (
            <p className="text-red-600 text-sm mt-1">{errors.priority.message}</p>
          )}
        </div>

        {/* Due Date */}
        <div>
          <label htmlFor="due_date" className="block text-sm font-medium text-gray-700 mb-1">
            Due Date
          </label>
          <input
            id="due_date"
            type="date"
            className="input-field"
            {...register('due_date')}
          />
          {errors.due_date && (
            <p className="text-red-600 text-sm mt-1">{errors.due_date.message}</p>
          )}
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Location (Optional)
          </label>
          
          {selectedLocation ? (
            <div className="border border-gray-300 rounded-lg p-3">
              <LocationDisplay 
                location={selectedLocation} 
                showMapLink={false}
                className="mb-2"
              />
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowLocationPicker(true)}
                >
                  <MapPin size={14} className="mr-1" />
                  Change
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveLocation}
                >
                  <X size={14} className="mr-1" />
                  Remove
                </Button>
              </div>
            </div>
          ) : (
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowLocationPicker(true)}
              className="w-full"
            >
              <Plus size={16} className="mr-2" />
              Add Location
            </Button>
          )}
        </div>

        {/* Recurrence Settings - Only for new jobs */}
        {!isEdit && (
          <RecurrenceSettings
            control={undefined}
            value={recurrencePattern}
            onChange={setRecurrencePattern}
          />
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            className="flex-1"
          >
            {isEdit ? 'Update' : 'Create'}
          </Button>
        </div>
      </form>
      
      {/* Location Picker Modal */}
      {showLocationPicker && (
        <LocationPicker
          initialLocation={selectedLocation || undefined}
          onLocationSelect={handleLocationSelect}
          onClose={() => setShowLocationPicker(false)}
        />
      )}
    </div>
  )
}
