import { useMemo } from 'react'
import { Calendar } from 'lucide-react'
import { Card } from '../ui/card'
import type { Job } from '../../lib/supabase'

interface JobsTimelineProps {
  jobs: Job[]
}

interface DayData {
  date: string
  count: number
  dayName: string
}

export function JobsTimeline({ jobs }: JobsTimelineProps) {
  const timelineData = useMemo(() => {
    // Get last 7 days
    const days: DayData[] = []
    const today = new Date()
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      
      const dayCount = jobs.filter(job => {
        const jobDate = new Date(job.created_at)
        return jobDate.toDateString() === date.toDateString()
      }).length
      
      days.push({
        date: date.toISOString().split('T')[0],
        count: dayCount,
        dayName: date.toLocaleDateString('en', { weekday: 'short' })
      })
    }
    
    return days
  }, [jobs])

  const maxCount = Math.max(...timelineData.map(d => d.count), 1)

  return (
    <Card className="p-6">
      <h3 className="font-semibold text-foreground mb-6 flex items-center gap-2">
        <Calendar size={20} />
        Jobs Created (Last 7 Days)
      </h3>
      
      <div className="space-y-5">
        {timelineData.map((day) => (
          <div key={day.date} className="flex items-center gap-6">
            <div className="w-14 text-sm text-muted-foreground font-medium text-center">
              {day.dayName}
            </div>
            <div className="flex-1 flex items-center gap-4">
              <div className="flex-1 bg-muted rounded-full h-3 overflow-hidden">
                <div
                  className="h-3 bg-primary rounded-full transition-all duration-500 ease-out"
                  style={{ 
                    width: `${maxCount > 0 ? (day.count / maxCount) * 100 : 0}%` 
                  }}
                />
              </div>
              <div className="w-10 text-sm text-foreground font-semibold text-right">
                {day.count}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {timelineData.every(d => d.count === 0) && (
        <div className="flex flex-col items-center justify-center py-12 text-center mt-6">
          <Calendar className="w-12 h-12 text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground font-medium">No jobs created recently</p>
          <p className="text-sm text-muted-foreground/70 mt-1">Activity will show up here as you create jobs</p>
        </div>
      )}
    </Card>
  )
}
