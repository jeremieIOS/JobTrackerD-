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
export type JobStatus = 'not_started' | 'in_progress' | 'completed' | 'blocked' | 'cancelled' | 'cancelled_by_client' | 'no_parking'
export type PriorityLevel = 'low' | 'medium' | 'high'
export type TeamRole = 'admin' | 'editor' | 'viewer'

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
  recurrence?: {
    type: 'weekly' | 'monthly'
    interval: number
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

export type Thread = {
  id: string
  job_id?: string
  author_id?: string
  content: string
  mentions?: string[]
  created_at: string
  updated_at?: string
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

export type User = {
  id: string
  name: string
  email: string
  team_id?: string
  created_at: string
  updated_at: string
}
