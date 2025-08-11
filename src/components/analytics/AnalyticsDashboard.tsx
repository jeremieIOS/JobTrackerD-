import { useJobs } from '../../hooks/useJobs'
import { useTeams } from '../../hooks/useTeams'
import { JobsTimeline } from './JobsTimeline'
import { 
  TrendingUp, 
  CheckCircle, 
  Clock, 
  Users, 
  MapPin, 
  Repeat,
  Target,
  BarChart3
} from 'lucide-react'
import { useMemo } from 'react'
import type { Job } from '../../lib/supabase'

interface MetricCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  description?: string
  trend?: {
    value: number
    isPositive: boolean
  }
}

function MetricCard({ title, value, icon, description, trend }: MetricCardProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
            {icon}
          </div>
          <h3 className="font-medium text-gray-900">{title}</h3>
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-sm ${
            trend.isPositive ? 'text-green-600' : 'text-red-600'
          }`}>
            <TrendingUp size={14} />
            <span>{trend.isPositive ? '+' : ''}{trend.value}%</span>
          </div>
        )}
      </div>
      <div className="mb-2">
        <span className="text-2xl font-bold text-gray-900">{value}</span>
      </div>
      {description && (
        <p className="text-sm text-gray-600">{description}</p>
      )}
    </div>
  )
}

interface StatusDistributionProps {
  jobs: Job[]
}

function StatusDistribution({ jobs }: StatusDistributionProps) {
  const statusCounts = useMemo(() => {
    const counts = {
      not_started: 0,
      completed: 0,
      cancelled: 0,
      no_parking: 0
    }
    
    jobs.forEach(job => {
      if (job.status in counts) {
        counts[job.status as keyof typeof counts]++
      }
    })
    
    return counts
  }, [jobs])

  const total = Object.values(statusCounts).reduce((sum, count) => sum + count, 0)

  const statusConfig = {
    not_started: { label: 'Not Started', color: 'bg-yellow-500' },
    completed: { label: 'Completed', color: 'bg-green-500' },
    cancelled: { label: 'Cancelled', color: 'bg-red-500' },
    no_parking: { label: 'No Parking', color: 'bg-gray-500' }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <BarChart3 size={20} />
        Job Status Distribution
      </h3>
      
      {total === 0 ? (
        <p className="text-gray-500 text-center py-8">No jobs found</p>
      ) : (
        <div className="space-y-4">
          {Object.entries(statusCounts).map(([status, count]) => {
            const percentage = total > 0 ? (count / total) * 100 : 0
            const config = statusConfig[status as keyof typeof statusConfig]
            
            return (
              <div key={status}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    {config.label}
                  </span>
                  <span className="text-sm text-gray-600">
                    {count} ({percentage.toFixed(1)}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${config.color}`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

interface RecentActivityProps {
  jobs: Job[]
}

function RecentActivity({ jobs }: RecentActivityProps) {
  const recentJobs = useMemo(() => {
    return jobs
      .filter(job => job.created_at)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5)
  }, [jobs])

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Clock size={20} />
        Recent Activity
      </h3>
      
      {recentJobs.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No recent jobs</p>
      ) : (
        <div className="space-y-3">
          {recentJobs.map((job) => (
            <div key={job.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className={`w-2 h-2 rounded-full ${
                job.status === 'completed' ? 'bg-green-500' :
                job.status === 'cancelled' ? 'bg-red-500' :
                job.status === 'no_parking' ? 'bg-gray-500' :
                'bg-yellow-500'
              }`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {job.title}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(job.created_at).toLocaleDateString()} • {job.status.replace('_', ' ')}
                </p>
              </div>
              {job.is_recurring && (
                <Repeat size={14} className="text-purple-600" />
              )}
              {job.location && (
                <MapPin size={14} className="text-blue-600" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export function AnalyticsDashboard() {
  const { jobs, isLoading } = useJobs()
  const { data: userTeams } = useTeams()

  const analytics = useMemo(() => {
    if (!jobs) return null

    const totalJobs = jobs.length
    const completedJobs = jobs.filter(job => job.status === 'completed').length
    const recurringJobs = jobs.filter(job => job.is_recurring).length
    const jobsWithLocation = jobs.filter(job => job.location).length
    const completionRate = totalJobs > 0 ? (completedJobs / totalJobs) * 100 : 0
    
    // Jobs created this week vs last week
    const now = new Date()
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)
    
    const thisWeekJobs = jobs.filter(job => 
      new Date(job.created_at) >= oneWeekAgo
    ).length
    
    const lastWeekJobs = jobs.filter(job => {
      const date = new Date(job.created_at)
      return date >= twoWeeksAgo && date < oneWeekAgo
    }).length
    
    const weeklyTrend = lastWeekJobs > 0 ? 
      ((thisWeekJobs - lastWeekJobs) / lastWeekJobs) * 100 : 0

    return {
      totalJobs,
      completedJobs,
      recurringJobs,
      jobsWithLocation,
      completionRate,
      weeklyTrend
    }
  }, [jobs])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Unable to load analytics data</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Analytics Dashboard</h2>
        <p className="text-gray-600">
          Track your productivity and job management insights
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Jobs"
          value={analytics.totalJobs}
          icon={<Target size={20} />}
          description="All jobs created"
          trend={{
            value: Math.round(analytics.weeklyTrend),
            isPositive: analytics.weeklyTrend >= 0
          }}
        />
        
        <MetricCard
          title="Completed"
          value={analytics.completedJobs}
          icon={<CheckCircle size={20} />}
          description={`${analytics.completionRate.toFixed(1)}% completion rate`}
        />
        
        <MetricCard
          title="Teams"
          value={userTeams?.length || 0}
          icon={<Users size={20} />}
          description="Active teams"
        />
        
        <MetricCard
          title="With Location"
          value={analytics.jobsWithLocation}
          icon={<MapPin size={20} />}
          description="Jobs with geolocation"
        />
      </div>

      {/* Charts and Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StatusDistribution jobs={jobs || []} />
        <RecentActivity jobs={jobs || []} />
      </div>

      {/* Timeline */}
      <JobsTimeline jobs={jobs || []} />

      {/* Recurring Jobs Insight */}
      {analytics.recurringJobs > 0 && (
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-lg border border-purple-200">
          <div className="flex items-center gap-3 mb-3">
            <Repeat className="text-purple-600" size={24} />
            <h3 className="font-semibold text-gray-900">Recurring Jobs Insight</h3>
          </div>
          <p className="text-gray-700 mb-2">
            You have <span className="font-semibold text-purple-600">{analytics.recurringJobs}</span> recurring job templates 
            helping automate your workflow.
          </p>
          <p className="text-sm text-gray-600">
            Recurring jobs save time by automatically creating instances based on your schedule.
          </p>
        </div>
      )}

      {/* Productivity Tip */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg border border-green-200">
        <div className="flex items-center gap-3 mb-3">
          <TrendingUp className="text-green-600" size={24} />
          <h3 className="font-semibold text-gray-900">Productivity Tip</h3>
        </div>
        <p className="text-gray-700 mb-2">
          {analytics.completionRate >= 80 ? 
            "Excellent job! You're maintaining a high completion rate." :
            analytics.completionRate >= 60 ?
            "Good progress! Consider breaking down larger tasks into smaller, manageable jobs." :
            "Focus on completing existing jobs before creating new ones to improve your completion rate."
          }
        </p>
        <p className="text-sm text-gray-600">
          {analytics.jobsWithLocation > 0 ? 
            "Adding locations to jobs helps with route planning and efficiency." :
            "Try adding locations to your jobs for better organization and route planning."
          }
        </p>
      </div>
    </div>
  )
}
