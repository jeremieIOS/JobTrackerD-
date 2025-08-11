import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Types pour l'authentification (Supabase User déjà défini)

// Types pour les jobs (adaptés au schéma existant)
export type JobStatus = 'not_started' | 'completed' | 'cancelled' | 'no_parking'
export type PriorityLevel = 'low' | 'medium' | 'high'
export type TeamRole = 'admin' | 'editor' | 'viewer'

export type RecurrenceType = 'daily' | 'weekly' | 'monthly'

export type RecurrencePattern = {
  type: RecurrenceType
  interval: number
  days_of_week?: number[] // For weekly: [1,2,3] = Mon,Tue,Wed (0=Sunday, 1=Monday, etc.)
  day_of_month?: number   // For monthly: 15 = 15th of each month
}

export type Job = {
  id: string
  title: string
  description?: string
  status: JobStatus
  created_at: string
  updated_at: string
  created_by?: string
  team_id?: string
  due_date?: string
  priority?: PriorityLevel
  completed: boolean
  completed_at?: string
  location?: {
    lat: number
    lng: number
    address?: string
  }
  // Recurrence fields
  is_recurring?: boolean
  recurrence_pattern?: RecurrencePattern
  parent_job_id?: string
  next_occurrence?: string
  recurrence_end_date?: string
  // Relations populées
  created_by_user?: {
    name: string
    email: string
  }
}

export type Team = {
  id: string
  name: string
  admin_id?: string
  invite_code?: string
  created_at: string
  updated_at: string
}

export type TeamMember = {
  id: string
  team_id: string
  user_id: string
  role: TeamRole
  joined_at: string
}

export type JobNote = {
  id: string
  job_id: string
  user_id: string
  content: string
  mentions?: string[]
  created_at: string
  updated_at: string
  // Relations populées
  user?: {
    id: string
    name: string
    email: string
  }
}

export type JobHistory = {
  id: string
  job_id?: string
  user_id?: string
  action: 'created' | 'updated' | 'status_changed' | 'completed' | 'note_added'
  previous_value?: Record<string, any>
  new_value?: Record<string, any>
  timestamp: string
}

export type NotificationType = 
  | 'job_assigned'
  | 'job_completed'
  | 'job_status_changed'
  | 'note_added'
  | 'note_mentioned'
  | 'team_invited'
  | 'team_role_changed'

export type Notification = {
  id: string
  user_id: string
  type: NotificationType
  title: string
  message: string
  data?: Record<string, any>
  read_at?: string
  created_at: string
  job_id?: string
  team_id?: string
  note_id?: string
  triggered_by?: string
  // Relations populées
  triggered_by_user?: {
    id: string
    name: string
    email: string
  }
  job?: {
    id: string
    title: string
  }
  team?: {
    id: string
    name: string
  }
}

export type NotificationPreferences = {
  id: string
  user_id: string
  email_enabled: Record<NotificationType, boolean>
  push_enabled: Record<NotificationType, boolean>
  created_at: string
  updated_at: string
}

export type User = {
  id: string
  name: string
  email: string
  team_id?: string
  created_at: string
  updated_at: string
}
