import { useJobs } from '../../hooks/useJobs'
import { useTeams } from '../../hooks/useTeams'
import { JobsTimeline } from './JobsTimeline'
import { Card } from '@/components/ui/card'
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
import { Badge } from '@/components/ui/badge'
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
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-xl text-primary">
            {icon}
          </div>
          <h3 className="font-medium text-foreground">{title}</h3>
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-sm font-medium ${
            trend.isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
          }`}>
            <TrendingUp size={14} className={trend.isPositive ? '' : 'rotate-180'} />
            <span>{trend.isPositive ? '+' : ''}{trend.value}%</span>
          </div>
        )}
      </div>
      <div className="mb-3">
        <span className="text-3xl font-bold text-foreground">{value}</span>
      </div>
      {description && (
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      )}
    </Card>
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
    no_parking: { label: 'No Parking', color: 'bg-muted-foreground' }
  }

  return (
    <Card className="p-6">
      <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
        <BarChart3 size={20} />
        Job Status Distribution
      </h3>
      
      {total === 0 ? (
        <p className="text-muted-foreground text-center py-8">No jobs found</p>
      ) : (
        <div className="space-y-4">
          {Object.entries(statusCounts).map(([status, count]) => {
            const percentage = total > 0 ? (count / total) * 100 : 0
            const config = statusConfig[status as keyof typeof statusConfig]
            
            return (
              <div key={status}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-foreground">
                    {config.label}
                  </span>
                  <span className="text-sm text-muted-foreground font-medium">
                    {count} ({percentage.toFixed(1)}%)
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-3 rounded-full ${config.color} transition-all duration-300 ease-out`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </Card>
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
    <Card className="p-6">
      <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
        <Clock size={20} />
        Recent Activity
      </h3>
      
      {recentJobs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Clock className="w-12 h-12 text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground font-medium">No recent jobs</p>
          <p className="text-sm text-muted-foreground/70 mt-1">Jobs will appear here as you create them</p>
        </div>
      ) : (
        <div className="space-y-4">
          {recentJobs.map((job) => (
            <div key={job.id} className="group relative flex items-start gap-4 p-4 bg-card hover:bg-muted/50 rounded-xl border border-border/60 hover:border-border transition-all duration-200 hover:shadow-sm">
              {/* Status indicator */}
              <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-2 ${
                job.status === 'completed' ? 'bg-emerald-500' :
                job.status === 'cancelled' ? 'bg-red-500' :
                job.status === 'no_parking' ? 'bg-muted-foreground' :
                'bg-amber-500'
              }`} />
              
              {/* Content */}
              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <h4 className="font-medium text-foreground truncate leading-5">
                    {job.title}
                  </h4>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {job.is_recurring && (
                      <Badge variant="secondary" className="h-6 px-2 text-xs">
                        <Repeat size={12} className="mr-1" />
                        Recurring
                      </Badge>
                    )}
                    {job.location && (
                      <Badge variant="outline" className="h-6 px-2 text-xs">
                        <MapPin size={12} className="mr-1" />
                        Located
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    {new Date(job.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>
                  <Badge 
                    variant={
                      job.status === 'completed' ? 'default' :
                      job.status === 'cancelled' ? 'destructive' :
                      job.status === 'no_parking' ? 'secondary' :
                      'secondary'
                    }
                    className="h-5 px-2 text-xs font-medium"
                  >
                    {job.status === 'not_started' ? 'Not Started' :
                     job.status === 'no_parking' ? 'No Parking' :
                     job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                  </Badge>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Unable to load analytics data</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Analytics Dashboard</h2>
        <p className="text-muted-foreground">
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
        <Card className="p-6 bg-gradient-to-r from-purple-500/5 to-blue-500/5 border-purple-500/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <Repeat className="text-purple-600 dark:text-purple-400" size={20} />
            </div>
            <h3 className="font-semibold text-foreground">Recurring Jobs Insight</h3>
          </div>
          <p className="text-foreground mb-3 leading-relaxed">
            You have <span className="font-semibold text-purple-600 dark:text-purple-400">{analytics.recurringJobs}</span> recurring job templates 
            helping automate your workflow.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Recurring jobs save time by automatically creating instances based on your schedule.
          </p>
        </Card>
      )}

      {/* Productivity Tip */}
      <Card className="p-6 bg-gradient-to-r from-emerald-500/5 to-green-500/5 border-emerald-500/20">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-emerald-500/10 rounded-lg">
            <TrendingUp className="text-emerald-600 dark:text-emerald-400" size={20} />
          </div>
          <h3 className="font-semibold text-foreground">Productivity Tip</h3>
        </div>
        <p className="text-foreground mb-3 leading-relaxed">
          {analytics.completionRate >= 80 ? 
            "Excellent job! You're maintaining a high completion rate." :
            analytics.completionRate >= 60 ?
            "Good progress! Consider breaking down larger tasks into smaller, manageable jobs." :
            "Focus on completing existing jobs before creating new ones to improve your completion rate."
          }
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {analytics.jobsWithLocation > 0 ? 
            "Adding locations to jobs helps with route planning and efficiency." :
            "Try adding locations to your jobs for better organization and route planning."
          }
        </p>
      </Card>
    </div>
  )
}
