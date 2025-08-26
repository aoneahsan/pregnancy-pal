import { createFileRoute } from '@tanstack/react-router'
import { ExerciseTracker } from '@/components/exercise/ExerciseTracker'
import { Activity } from 'lucide-react'

export const Route = createFileRoute('/exercise')({
  component: ExercisePage,
})

function ExercisePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center">
            <Activity className="h-8 w-8 text-green-600 mr-2" />
            <h1 className="text-2xl font-bold">PregnancyPal - Exercise Tracker</h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <ExerciseTracker />
      </div>
    </div>
  )
}