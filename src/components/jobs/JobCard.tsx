import type { Job, JobStatus } from '../../lib/supabase'
import { Button } from '../ui/Button'
import { LocationDisplay } from '../maps/LocationDisplay'
import { NotesSection } from './NotesSection'
import { useJobNotesCount } from '../../hooks/useJobNotes'
import { 
  Calendar, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  MoreHorizontal,
  Edit,
  Trash2,
  User,
  ChevronDown,
  Repeat
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { useState } from 'react'

interface JobCardProps {
  job: Job
  onEdit: (job: Job) => void
  onDelete: (id: string) => void
  onComplete: (id: string) => void
  onStatusChange?: (id: string, status: JobStatus) => void
}

const statusConfig = {
  not_started: {
    label: 'Not Started',
    color: 'bg-gray-100 text-gray-800',
    icon: Clock,
  },
  completed: {
    label: 'Completed',
    color: 'bg-green-100 text-green-800',
    icon: CheckCircle,
  },
  cancelled: {
    label: 'Cancelled',
    color: 'bg-red-100 text-red-800',
    icon: AlertCircle,
  },
  no_parking: {
    label: 'No Parking',
    color: 'bg-yellow-100 text-yellow-800',
    icon: AlertCircle,
  },
}

const priorityConfig = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
}

export function JobCard({ job, onEdit, onDelete, onComplete, onStatusChange }: JobCardProps) {
  const [showStatusDropdown, setShowStatusDropdown] = useState(false)
  const [showNotes, setShowNotes] = useState(false)
  const status = statusConfig[job.status as keyof typeof statusConfig]
  const StatusIcon = status.icon
  
  // Get notes count
  const { data: notesCount = 0 } = useJobNotesCount(job.id)

           const statusOptions: { value: JobStatus; label: string }[] = [
           { value: 'not_started', label: 'Not Started' },
           { value: 'completed', label: 'Completed' },
           { value: 'cancelled', label: 'Cancelled' },
           { value: 'no_parking', label: 'No Parking' },
         ]

  const handleStatusChange = (newStatus: JobStatus) => {
    if (onStatusChange) {
      onStatusChange(job.id, newStatus)
    }
    setShowStatusDropdown(false)
  }

  return (
    <div className="card hover:shadow-md transition-shadow duration-200">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-2">{job.title}</h3>
          
          {/* Creator info */}
          {job.created_by_user && (
            <div className="flex items-center gap-1 mb-2 text-xs text-gray-500">
              <User size={12} />
              <span>Created by {job.created_by_user.name}</span>
            </div>
          )}
          
          <div className="flex items-center gap-2">
            {/* Clickable status with dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full hover:opacity-80 transition-opacity ${status.color}`}
              >
                <StatusIcon size={12} />
                {status.label}
                <ChevronDown size={10} />
              </button>
              
              {showStatusDropdown && (
                <div className="absolute top-8 left-0 bg-white border border-gray-200 rounded-lg shadow-lg z-20 min-w-[150px]">
                  <div className="p-1">
                    {statusOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => handleStatusChange(option.value)}
                        className={`flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-gray-100 rounded text-left ${
                          option.value === job.status ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {job.priority && (
              <span className="text-xs text-gray-500">
                Priority: {priorityConfig[job.priority]}
              </span>
            )}

            {/* Recurring indicator */}
            {job.is_recurring && (
              <div className="flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                <Repeat size={12} />
                <span>Recurring</span>
              </div>
            )}

            {/* Generated from recurring job indicator */}
            {job.parent_job_id && (
              <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                <Repeat size={12} />
                <span>Auto-generated</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Actions dropdown */}
        <div className="relative group">
          <Button variant="ghost" size="sm">
            <MoreHorizontal size={16} />
          </Button>
          <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
            <div className="p-1">
              <button
                onClick={() => onEdit(job)}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
              >
                <Edit size={14} />
                Edit
              </button>
              {!job.completed && (
                <button
                  onClick={() => onComplete(job.id)}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-green-700 hover:bg-green-50 rounded"
                >
                  <CheckCircle size={14} />
                  Mark Complete
                </button>
              )}
              <button
                onClick={() => onDelete(job.id)}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-700 hover:bg-red-50 rounded"
              >
                <Trash2 size={14} />
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      {job.description && (
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {job.description}
        </p>
      )}

      {/* Location */}
      {job.location && (
        <div className="mb-3">
          <LocationDisplay 
            location={job.location} 
            className="text-sm"
          />
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
        <div className="flex items-center gap-4">
          <span>
            Created {formatDistanceToNow(new Date(job.created_at), { 
              addSuffix: true
            })}
          </span>
          {job.due_date && (
            <div className="flex items-center gap-1">
              <Calendar size={12} />
              <span>
                Due {formatDistanceToNow(new Date(job.due_date), { 
                  addSuffix: true
                })}
              </span>
            </div>
          )}
        </div>
        
        {job.completed_at && (
          <span className="text-green-600">
            Completed {formatDistanceToNow(new Date(job.completed_at), { 
              addSuffix: true
            })}
          </span>
        )}
      </div>

      {/* Notes Section */}
      <NotesSection
        jobId={job.id}
        isExpanded={showNotes}
        onToggle={() => setShowNotes(!showNotes)}
        notesCount={notesCount}
      />
    </div>
  )
}
