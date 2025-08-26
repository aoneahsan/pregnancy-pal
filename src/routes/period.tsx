import { createFileRoute } from '@tanstack/react-router'
import { PeriodTracker } from '@/components/period/PeriodTracker'
import { Heart } from 'lucide-react'

export const Route = createFileRoute('/period')({
  component: PeriodPage,
})

function PeriodPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center">
            <Heart className="h-8 w-8 text-pink-500 mr-2" />
            <h1 className="text-2xl font-bold">PregnancyPal - Period Tracker</h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <PeriodTracker />
      </div>
    </div>
  )
}