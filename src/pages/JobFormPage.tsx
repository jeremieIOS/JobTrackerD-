import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useJobs } from '../hooks/useJobs'
import { JobFormContent } from '../components/jobs/JobFormContent'
import { Button } from '../lib/components'
import { Card } from '../components/ui/card'
import { ArrowLeft, Briefcase } from 'lucide-react'
import type { Job } from '../lib/supabase'

export function JobFormPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { id } = useParams()
  const isEdit = !!id
  const { jobs, createJob, updateJob, isCreating, isUpdating } = useJobs()

  // Find the job to edit if in edit mode
  const jobToEdit = isEdit ? jobs?.find(job => job.id === id) : undefined

  const handleSubmit = (data: Partial<Job>) => {
    if (isEdit && jobToEdit) {
      updateJob({
        id: jobToEdit.id,
        updates: data
      })
    } else {
      createJob(data)
    }
    navigate('/dashboard')
  }

  const handleCancel = () => {
    navigate('/dashboard')
  }

  // Redirect if trying to edit a non-existent job
  if (isEdit && !jobToEdit && jobs) {
    navigate('/dashboard')
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card shadow-sm border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancel}
                className="flex items-center gap-2"
              >
                <ArrowLeft size={16} />
                Back to Jobs
              </Button>
              <div className="h-6 w-px bg-border" />
              <div className="flex items-center gap-2">
                <Briefcase size={20} className="text-muted-foreground" />
                <h1 className="text-xl font-semibold text-foreground">
                  {isEdit ? 'Edit Job' : 'Create New Job'}
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                {user?.email}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <div className="p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                {isEdit ? 'Edit Job Details' : 'Job Information'}
              </h2>
              <p className="text-muted-foreground">
                {isEdit 
                  ? 'Update the job details below. Changes will be saved immediately.'
                  : 'Fill in the details below to create a new job. You can set up recurring jobs and add location information.'
                }
              </p>
            </div>

            <JobFormContent
              job={jobToEdit}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              isLoading={isCreating || isUpdating}
            />
          </div>
        </Card>

        {/* Help Section */}
        <Card className="mt-8">
          <h3 className="text-lg font-semibold text-foreground mb-3">💡 Tips for Creating Jobs</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-muted-foreground">
            <div>
              <h4 className="font-medium mb-2">📋 Job Details</h4>
              <ul className="space-y-1">
                <li>• Use clear, descriptive titles</li>
                <li>• Add detailed descriptions for complex tasks</li>
                <li>• Set realistic due dates</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">♻️ Recurring Jobs</h4>
              <ul className="space-y-1">
                <li>• Perfect for routine maintenance</li>
                <li>• Choose specific days for weekly tasks</li>
                <li>• Monthly jobs can target specific dates</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">📍 Location</h4>
              <ul className="space-y-1">
                <li>• Add locations for on-site jobs</li>
                <li>• Search by address or click on map</li>
                <li>• Helps with route planning</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">👥 Teams</h4>
              <ul className="space-y-1">
                <li>• Assign jobs to specific teams</li>
                <li>• Team members get notifications</li>
                <li>• Collaborate with notes and comments</li>
              </ul>
            </div>
          </div>
        </Card>
      </main>
    </div>
  )
}
