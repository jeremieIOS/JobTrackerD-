import type { Job, JobStatus } from '../../lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
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
  RotateCw,
  MapPin,
  ExternalLink
} from '@/components/ui/icons'

import { formatDistanceToNow } from 'date-fns'
import { useState, useEffect, useRef } from 'react'

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
    color: 'bg-muted text-muted-foreground',
    icon: Clock,
  },
  completed: {
    label: 'Completed',
    color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    icon: CheckCircle,
  },
  cancelled: {
    label: 'Cancelled',
    color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    icon: AlertCircle,
  },
  no_parking: {
    label: 'No Parking',
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
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
  const [showActionsMenu, setShowActionsMenu] = useState(false)
  const actionsMenuRef = useRef<HTMLDivElement>(null)
  const status = statusConfig[job.status as keyof typeof statusConfig]
  const StatusIcon = status.icon
  
  // Get notes count
  const { data: notesCount = 0 } = useJobNotesCount(job.id)

  // Close actions menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (actionsMenuRef.current && !actionsMenuRef.current.contains(event.target as Node)) {
        setShowActionsMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

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
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-6">
        {/* 1. Job title + action */}
        <div className="flex items-start justify-between py-3">
        <h3 className="font-semibold text-foreground text-lg">{job.title}</h3>
        
        {/* Actions dropdown */}
        <div className="relative" ref={actionsMenuRef}>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setShowActionsMenu(!showActionsMenu)}
          >
            <MoreHorizontal size={16} />
          </Button>
          {showActionsMenu && (
            <div className="absolute right-0 top-8 bg-card border border-border rounded-lg shadow-lg z-10 min-w-[150px]">
            <div className="p-1">
              <button
                onClick={() => {
                  onEdit(job)
                  setShowActionsMenu(false)
                }}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-card-foreground hover:bg-accent rounded"
              >
                <Edit size={14} />
                Edit
              </button>
              {!job.completed && (
                <button
                  onClick={() => {
                    onComplete(job.id)
                    setShowActionsMenu(false)
                  }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-green-700 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/30 rounded"
                >
                  <CheckCircle size={14} />
                  Mark Complete
                </button>
              )}
              <button
                onClick={() => {
                  onDelete(job.id)
                  setShowActionsMenu(false)
                }}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30 rounded"
              >
                <Trash2 size={14} />
                Delete
              </button>
            </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. Created by + when created */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 py-3">
        {job.created_by_user && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <User size={14} />
            <span>Created by {job.created_by_user.name}</span>
          </div>
        )}
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Clock size={14} />
          <span>{formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}</span>
        </div>
      </div>

      {/* 3. Separator */}
      <div className="border-t border-border"></div>

      {/* 4. Due date + badge if recurring */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 py-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {job.due_date ? (
            <>
              <Calendar size={14} />
              <span>Due {formatDistanceToNow(new Date(job.due_date), { addSuffix: true })}</span>
            </>
          ) : (
            <>
              <Calendar size={14} />
              <span className="text-muted-foreground">No due date</span>
            </>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {/* Recurring indicator */}
          {job.is_recurring && (
            <div className="flex items-center gap-1 px-2 py-1 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-full text-xs font-medium">
              <RotateCw className="h-3 w-3 stroke-[1.5]" />
              <span>Recurring</span>
            </div>
          )}

          {/* Generated from recurring job indicator */}
          {job.parent_job_id && (
            <div className="flex items-center gap-1 px-2 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full text-xs font-medium">
              <RotateCw className="h-3 w-3 stroke-[1.5]" />
              <span>Auto-generated</span>
            </div>
          )}
        </div>
      </div>

      {/* 5. Separator */}
      <div className="border-t border-border"></div>

      {/* 6. Priority + Location */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 py-3">
        {/* Priority */}
        <div className="flex items-center gap-2 text-sm">
          {job.priority ? (
            <>
              <span className="text-muted-foreground">Priority:</span>
              <span className={`font-medium ${
                job.priority === 'high' ? 'text-red-600 dark:text-red-400' : 
                job.priority === 'medium' ? 'text-yellow-600 dark:text-yellow-400' : 
                'text-green-600 dark:text-green-400'
              }`}>
                {priorityConfig[job.priority]}
              </span>
            </>
          ) : (
            <span className="text-muted-foreground">No priority set</span>
          )}
        </div>

        {/* Location */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          {job.location ? (
            <>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin size={14} />
                <span>{job.location.lat.toFixed(4)}, {job.location.lng.toFixed(4)}</span>
              </div>
              <a
                href={`https://www.google.com/maps?q=${job.location.lat},${job.location.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-primary hover:text-primary/80"
              >
                <ExternalLink size={12} />
                <span>Open in Maps</span>
              </a>
            </>
          ) : (
            <span className="text-muted-foreground text-sm">No location</span>
          )}
        </div>
      </div>

      {/* 7. Separator */}
      <div className="border-t border-border"></div>

      {/* 8. Description */}
      <div className="py-3">
        {job.description ? (
          <p className="text-muted-foreground text-sm bg-muted p-3 rounded-lg">
            {job.description}
          </p>
        ) : (
          <p className="text-muted-foreground text-sm italic">No description</p>
        )}
      </div>

      {/* 9. Separator */}
      <div className="border-t border-border"></div>

      {/* 10. Status */}
      <div className="flex justify-center py-3">
        <div className="relative">
          <button
            onClick={() => setShowStatusDropdown(!showStatusDropdown)}
            className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg hover:opacity-80 transition-opacity ${status.color}`}
          >
            <StatusIcon size={16} />
            {status.label}
            <ChevronDown size={14} />
          </button>
          
          {showStatusDropdown && (
            <div className="absolute top-10 left-1/2 transform -translate-x-1/2 bg-card border border-border rounded-lg shadow-lg z-20 min-w-[150px]">
              <div className="p-1">
                {statusOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleStatusChange(option.value)}
                    className={`flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-muted rounded text-left ${
                      option.value === job.status ? 'bg-accent text-accent-foreground' : 'text-foreground'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 12. Note */}
      <div className="pt-3">
        <NotesSection
          jobId={job.id}
          isExpanded={showNotes}
          onToggle={() => setShowNotes(!showNotes)}
          notesCount={notesCount}
        />
        </div>
      </CardContent>
    </Card>
  )
}
