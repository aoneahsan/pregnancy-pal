import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Heart, Calendar, Apple, Baby, TrendingUp, Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuthStore } from '@/stores/auth'

export const Route = createFileRoute('/dashboard')({
  component: DashboardPage,
})

function DashboardPage() {
  const navigate = useNavigate()
  const { user, signOut } = useAuthStore()

  const handleSignOut = async () => {
    try {
      await signOut()
      navigate({ to: '/' })
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  const currentWeek = 12 // This would come from user data
  const trimester = 1 // This would be calculated

  return (
    <div className="min-h-screen bg-gradient-to-br from-pregnancy-pink-50 via-white to-pregnancy-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Heart className="h-8 w-8 text-primary mr-2" />
              <h1 className="text-2xl font-bold">PregnancyPal</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <Bell className="h-6 w-6 text-gray-600" />
              <div className="flex items-center space-x-2">
                <div className="text-right">
                  <p className="text-sm font-medium">{user?.name}</p>
                  <p className="text-xs text-gray-500">Week {currentWeek}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                >
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.name?.split(' ')[0]}! 👋
          </h2>
          <p className="text-lg text-gray-600">
            You're in your {trimester === 1 ? 'first' : trimester === 2 ? 'second' : 'third'} trimester, week {currentWeek}
          </p>
        </div>

        {/* Progress Card */}
        <Card className="mb-8 bg-gradient-to-r from-pregnancy-pink-500 to-pregnancy-purple-500 text-white">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Baby className="h-6 w-6 mr-2" />
              Your Baby This Week
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-pregnancy-pink-100 mb-2">Week {currentWeek} of 40</p>
                <div className="w-full bg-white/20 rounded-full h-3">
                  <div
                    className="bg-white rounded-full h-3 transition-all duration-500"
                    style={{ width: `${(currentWeek / 40) * 100}%` }}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-pregnancy-pink-100 text-sm">Size</p>
                  <p className="text-lg font-semibold">Like a lime</p>
                </div>
                <div>
                  <p className="text-pregnancy-pink-100 text-sm">Length</p>
                  <p className="text-lg font-semibold">2.1 inches</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <Apple className="h-12 w-12 text-pregnancy-peach-500 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Meal Plans</h3>
              <p className="text-sm text-gray-600 mb-4">
                Personalized nutrition for your stage
              </p>
              <Button variant="outline" size="sm" className="w-full">
                View Plans
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <Calendar className="h-12 w-12 text-pregnancy-purple-500 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Appointments</h3>
              <p className="text-sm text-gray-600 mb-4">
                Track your prenatal visits
              </p>
              <Button variant="outline" size="sm" className="w-full">
                Schedule
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <TrendingUp className="h-12 w-12 text-pregnancy-pink-500 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Progress</h3>
              <p className="text-sm text-gray-600 mb-4">
                Monitor your health journey
              </p>
              <Button variant="outline" size="sm" className="w-full">
                View Stats
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <Heart className="h-12 w-12 text-pregnancy-peach-500 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Wellness</h3>
              <p className="text-sm text-gray-600 mb-4">
                Daily tips and guidance
              </p>
              <Button variant="outline" size="sm" className="w-full">
                Explore
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Today's Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Today's Meals */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Apple className="h-5 w-5 mr-2" />
                Today's Meals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { meal: 'Breakfast', food: 'Overnight oats with berries', time: '8:00 AM' },
                  { meal: 'Lunch', food: 'Quinoa salad with vegetables', time: '12:30 PM' },
                  { meal: 'Dinner', food: 'Grilled salmon with sweet potato', time: '6:00 PM' },
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between py-2">
                    <div>
                      <p className="font-medium">{item.meal}</p>
                      <p className="text-sm text-gray-600">{item.food}</p>
                    </div>
                    <span className="text-sm text-gray-500">{item.time}</span>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4">
                View Full Menu
              </Button>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { activity: 'Weight logged', details: '135 lbs', time: '2 hours ago' },
                  { activity: 'Prenatal vitamin taken', details: 'Daily supplement', time: '8 hours ago' },
                  { activity: 'Appointment scheduled', details: 'Dr. Smith - Jan 25', time: '1 day ago' },
                ].map((item, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                    <div className="flex-1">
                      <p className="font-medium">{item.activity}</p>
                      <p className="text-sm text-gray-600">{item.details}</p>
                      <p className="text-xs text-gray-500 mt-1">{item.time}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4">
                View All Activity
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}