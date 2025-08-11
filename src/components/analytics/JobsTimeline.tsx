import { useMemo } from 'react'
import { Calendar } from 'lucide-react'
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
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Calendar size={20} />
        Jobs Created (Last 7 Days)
      </h3>
      
      <div className="space-y-4">
        {timelineData.map((day) => (
          <div key={day.date} className="flex items-center gap-4">
            <div className="w-12 text-sm text-gray-600 font-medium">
              {day.dayName}
            </div>
            <div className="flex-1 flex items-center gap-3">
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div
                  className="h-2 bg-blue-500 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${maxCount > 0 ? (day.count / maxCount) * 100 : 0}%` 
                  }}
                />
              </div>
              <div className="w-8 text-sm text-gray-700 text-right">
                {day.count}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {timelineData.every(d => d.count === 0) && (
        <div className="text-center py-8">
          <p className="text-gray-500">No jobs created in the last 7 days</p>
        </div>
      )}
    </div>
  )
}
