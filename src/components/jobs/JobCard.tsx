import type { Job } from '../../lib/supabase'
import { Button } from '../ui/Button'
import { 
  Calendar, 
  MapPin, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  MoreHorizontal,
  Edit,
  Trash2
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'

interface JobCardProps {
  job: Job
  onEdit: (job: Job) => void
  onDelete: (id: string) => void
  onComplete: (id: string) => void
}

const statusConfig = {
  not_started: {
    label: 'Non démarré',
    color: 'bg-gray-100 text-gray-800',
    icon: Clock,
  },
  in_progress: {
    label: 'En cours',
    color: 'bg-blue-100 text-blue-800',
    icon: Clock,
  },
  completed: {
    label: 'Terminé',
    color: 'bg-green-100 text-green-800',
    icon: CheckCircle,
  },
  blocked: {
    label: 'Bloqué',
    color: 'bg-red-100 text-red-800',
    icon: AlertCircle,
  },
  cancelled: {
    label: 'Annulé',
    color: 'bg-gray-100 text-gray-600',
    icon: AlertCircle,
  },
  cancelled_by_client: {
    label: 'Annulé par client',
    color: 'bg-orange-100 text-orange-800',
    icon: AlertCircle,
  },
  no_parking: {
    label: 'Pas de parking',
    color: 'bg-yellow-100 text-yellow-800',
    icon: AlertCircle,
  },
}

const priorityConfig = {
  low: 'Faible',
  medium: 'Moyenne',
  high: 'Élevée',
}

export function JobCard({ job, onEdit, onDelete, onComplete }: JobCardProps) {
  const status = statusConfig[job.status as keyof typeof statusConfig]
  const StatusIcon = status.icon

  return (
    <div className="card hover:shadow-md transition-shadow duration-200">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-2">{job.title}</h3>
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${status.color}`}>
              <StatusIcon size={12} />
              {status.label}
            </span>
            {job.priority && (
              <span className="text-xs text-gray-500">
                Priorité: {priorityConfig[job.priority]}
              </span>
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
                Modifier
              </button>
              {!job.completed && (
                <button
                  onClick={() => onComplete(job.id)}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-green-700 hover:bg-green-50 rounded"
                >
                  <CheckCircle size={14} />
                  Marquer terminé
                </button>
              )}
              <button
                onClick={() => onDelete(job.id)}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-700 hover:bg-red-50 rounded"
              >
                <Trash2 size={14} />
                Supprimer
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
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
          <MapPin size={14} />
          <span>{job.location.address || `${job.location.lat}, ${job.location.lng}`}</span>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
        <div className="flex items-center gap-4">
          <span>
            Créé {formatDistanceToNow(new Date(job.created_at), { 
              addSuffix: true, 
              locale: fr 
            })}
          </span>
          {job.due_date && (
            <div className="flex items-center gap-1">
              <Calendar size={12} />
              <span>
                Échéance {formatDistanceToNow(new Date(job.due_date), { 
                  addSuffix: true, 
                  locale: fr 
                })}
              </span>
            </div>
          )}
        </div>
        
        {job.completed_at && (
          <span className="text-green-600">
            Terminé {formatDistanceToNow(new Date(job.completed_at), { 
              addSuffix: true, 
              locale: fr 
            })}
          </span>
        )}
      </div>
    </div>
  )
}
