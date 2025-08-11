import { useState } from 'react'
import type { Control } from 'react-hook-form'
import type { RecurrencePattern, RecurrenceType } from '../../lib/supabase'
import { Repeat, Clock } from 'lucide-react'

interface RecurrenceSettingsProps {
  control?: Control<any>
  value?: RecurrencePattern | null
  onChange: (pattern: RecurrencePattern | null) => void
}

const DAYS_OF_WEEK = [
  { value: 0, label: 'Sun', fullLabel: 'Sunday' },
  { value: 1, label: 'Mon', fullLabel: 'Monday' },
  { value: 2, label: 'Tue', fullLabel: 'Tuesday' },
  { value: 3, label: 'Wed', fullLabel: 'Wednesday' },
  { value: 4, label: 'Thu', fullLabel: 'Thursday' },
  { value: 5, label: 'Fri', fullLabel: 'Friday' },
  { value: 6, label: 'Sat', fullLabel: 'Saturday' },
]

export function RecurrenceSettings({ value, onChange }: RecurrenceSettingsProps) {
  const [isEnabled, setIsEnabled] = useState(!!value)

  const handleToggle = (enabled: boolean) => {
    setIsEnabled(enabled)
    if (enabled) {
      // Set default pattern
      onChange({
        type: 'weekly',
        interval: 1,
        days_of_week: [1] // Monday by default
      })
    } else {
      onChange(null)
    }
  }

  const handlePatternChange = (updates: Partial<RecurrencePattern>) => {
    if (!value) return
    
    const newPattern = { ...value, ...updates }
    
    // Clean up pattern based on type
    if (newPattern.type === 'daily') {
      delete newPattern.days_of_week
      delete newPattern.day_of_month
    } else if (newPattern.type === 'weekly') {
      delete newPattern.day_of_month
      if (!newPattern.days_of_week || newPattern.days_of_week.length === 0) {
        newPattern.days_of_week = [1] // Default to Monday
      }
    } else if (newPattern.type === 'monthly') {
      delete newPattern.days_of_week
      if (!newPattern.day_of_month) {
        newPattern.day_of_month = 1 // Default to 1st of month
      }
    }
    
    onChange(newPattern)
  }

  const handleDayToggle = (dayValue: number) => {
    if (!value?.days_of_week) return
    
    const days = value.days_of_week
    const newDays = days.includes(dayValue)
      ? days.filter(d => d !== dayValue)
      : [...days, dayValue].sort()
    
    // Ensure at least one day is selected
    if (newDays.length === 0) return
    
    handlePatternChange({ days_of_week: newDays })
  }

  return (
    <div className="space-y-4">
      {/* Toggle recurrence */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Repeat size={16} className="text-gray-600" />
          <label className="font-medium text-gray-700">Recurring Job</label>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={isEnabled}
            onChange={(e) => handleToggle(e.target.checked)}
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
        </label>
      </div>

      {isEnabled && value && (
        <div className="ml-6 space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          {/* Recurrence type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Repeat</label>
            <select
              value={value.type}
              onChange={(e) => handlePatternChange({ type: e.target.value as RecurrenceType })}
              className="input-field"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>

          {/* Interval */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Every</label>
              <input
                type="number"
                min="1"
                max="12"
                value={value.interval}
                onChange={(e) => handlePatternChange({ interval: parseInt(e.target.value) || 1 })}
                className="input-field"
              />
            </div>
            <div className="flex items-end">
              <span className="text-sm text-gray-600 pb-2">
                {value.type === 'daily' && (value.interval === 1 ? 'day' : 'days')}
                {value.type === 'weekly' && (value.interval === 1 ? 'week' : 'weeks')}
                {value.type === 'monthly' && (value.interval === 1 ? 'month' : 'months')}
              </span>
            </div>
          </div>

          {/* Days of week (for weekly) */}
          {value.type === 'weekly' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">On days</label>
              <div className="flex gap-2 flex-wrap">
                {DAYS_OF_WEEK.map((day) => (
                  <button
                    key={day.value}
                    type="button"
                    onClick={() => handleDayToggle(day.value)}
                    className={`px-3 py-2 text-sm rounded-md transition-colors ${
                      value.days_of_week?.includes(day.value)
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {day.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Day of month (for monthly) */}
          {value.type === 'monthly' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">On day</label>
              <select
                value={value.day_of_month || 1}
                onChange={(e) => handlePatternChange({ day_of_month: parseInt(e.target.value) })}
                className="input-field w-auto"
              >
                {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                  <option key={day} value={day}>
                    {day}{day === 1 ? 'st' : day === 2 ? 'nd' : day === 3 ? 'rd' : 'th'} of the month
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Preview */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Clock size={14} className="text-blue-600" />
              <span className="text-sm font-medium text-blue-900">Schedule Preview</span>
            </div>
            <p className="text-sm text-blue-800">
              {getRecurrenceDescription(value)}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

function getRecurrenceDescription(pattern: RecurrencePattern): string {
  const { type, interval } = pattern

  if (type === 'daily') {
    return interval === 1 ? 'Every day' : `Every ${interval} days`
  }

  if (type === 'weekly') {
    const daysText = pattern.days_of_week
      ?.map(d => DAYS_OF_WEEK.find(day => day.value === d)?.fullLabel)
      .join(', ') || 'Monday'
    
    return interval === 1 
      ? `Every week on ${daysText}`
      : `Every ${interval} weeks on ${daysText}`
  }

  if (type === 'monthly') {
    const dayText = pattern.day_of_month || 1
    const suffix = dayText === 1 ? 'st' : dayText === 2 ? 'nd' : dayText === 3 ? 'rd' : 'th'
    
    return interval === 1
      ? `Every month on the ${dayText}${suffix}`
      : `Every ${interval} months on the ${dayText}${suffix}`
  }

  return 'Custom schedule'
}
