import { createFileRoute, useNavigate, Link } from '@tanstack/react-router'
import { useEffect } from 'react'
import { Heart, Calendar, Apple, Baby, TrendingUp, Droplet, Activity, Users, Dumbbell, HeartHandshake } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useAuthStore } from '@/stores/auth'
import { usePregnancyProfileStore } from '@/stores/pregnancy-profile'
import { useDietPlanStore } from '@/stores/diet-plan'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { NotificationPanel } from '@/components/notifications/NotificationPanel'
import { useNotificationStore } from '@/stores/notifications'

export const Route = createFileRoute('/dashboard')({
  component: DashboardPage,
})

function DashboardPage() {
  const navigate = useNavigate()
  const { user, signOut } = useAuthStore()
  const { profile, fetchProfile } = usePregnancyProfileStore()
  const { activePlan, fetchActivePlan } = useDietPlanStore()
  const { generateSampleNotifications, notifications } = useNotificationStore()

  useEffect(() => {
    if (user?.id) {
      fetchProfile(user.id)
      fetchActivePlan(user.id)
      
      // Generate sample notifications on first load if none exist
      if (notifications.length === 0) {
        generateSampleNotifications(user.id)
      }
    }
  }, [user?.id, fetchProfile, fetchActivePlan])

  const handleSignOut = async () => {
    try {
      await signOut()
      navigate({ to: '/' })
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  const trimesterName = profile?.currentTrimester === 1 ? 'First' : 
                        profile?.currentTrimester === 2 ? 'Second' : 'Third'

  const pregnancyProgress = profile ? (profile.currentWeek / 40) * 100 : 0

  const babySize = {
    12: { size: 'Lime', length: '2.1 inches', weight: '0.49 oz' },
    16: { size: 'Avocado', length: '4.6 inches', weight: '3.53 oz' },
    20: { size: 'Banana', length: '10 inches', weight: '10.6 oz' },
    24: { size: 'Ear of corn', length: '11.8 inches', weight: '1.32 lbs' },
    28: { size: 'Eggplant', length: '14.8 inches', weight: '2.22 lbs' },
    32: { size: 'Squash', length: '16.7 inches', weight: '3.75 lbs' },
    36: { size: 'Honeydew', length: '18.7 inches', weight: '5.78 lbs' },
    40: { size: 'Watermelon', length: '20.2 inches', weight: '7.63 lbs' },
  }

  const getCurrentBabySize = () => {
    if (!profile) return babySize[12]
    const week = profile.currentWeek
    const weeks = Object.keys(babySize).map(Number).sort((a, b) => a - b)
    const closestWeek = weeks.reduce((prev, curr) => 
      Math.abs(curr - week) < Math.abs(prev - week) ? curr : prev
    )
    return babySize[closestWeek as keyof typeof babySize]
  }

  const currentBabySize = getCurrentBabySize()

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
              <Link to="/donate">
                <Button variant="outline" size="sm" className="bg-pink-50 hover:bg-pink-100 text-pink-600 border-pink-200">
                  <HeartHandshake className="h-4 w-4 mr-2" />
                  Donate
                </Button>
              </Link>
              <NotificationPanel />
              <div className="flex items-center space-x-2">
                <div className="text-right">
                  <p className="text-sm font-medium">{user?.name}</p>
                  <p className="text-xs text-gray-500">Week {profile?.currentWeek || 0}</p>
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
            Welcome back, {user?.name?.split(' ')[0]}!
          </h2>
          <p className="text-lg text-gray-600">
            {profile && `You're in your ${trimesterName} trimester, week ${profile.currentWeek}`}
          </p>
        </div>

        {/* Progress Card */}
        {profile && (
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
                  <p className="text-pregnancy-pink-100 mb-2">Week {profile.currentWeek} of 40</p>
                  <Progress value={pregnancyProgress} className="h-3" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-pregnancy-pink-100 text-sm">Size</p>
                    <p className="text-lg font-semibold">Like a {currentBabySize.size}</p>
                  </div>
                  <div>
                    <p className="text-pregnancy-pink-100 text-sm">Length</p>
                    <p className="text-lg font-semibold">{currentBabySize.length}</p>
                  </div>
                  <div>
                    <p className="text-pregnancy-pink-100 text-sm">Weight</p>
                    <p className="text-lg font-semibold">{currentBabySize.weight}</p>
                  </div>
                </div>

                <div className="pt-4">
                  <p className="text-pregnancy-pink-100 text-sm mb-1">Due Date</p>
                  <p className="text-lg font-semibold">
                    {profile.expectedDueDate.toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Action Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Link to="/diet-plan">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="pt-6">
                <div className="text-center">
                  <Apple className="h-8 w-8 mx-auto mb-2 text-green-600" />
                  <p className="font-medium">Diet Plan</p>
                  <p className="text-xs text-gray-500">Today's meals</p>
                </div>
              </CardContent>
            </Card>
          </Link>
          
          <Link to="/tracking">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="pt-6">
                <div className="text-center">
                  <Activity className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                  <p className="font-medium">Daily Tracking</p>
                  <p className="text-xs text-gray-500">Log symptoms</p>
                </div>
              </CardContent>
            </Card>
          </Link>
          
          <Link to="/appointments">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="pt-6">
                <div className="text-center">
                  <Calendar className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                  <p className="font-medium">Appointments</p>
                  <p className="text-xs text-gray-500">Schedule visits</p>
                </div>
              </CardContent>
            </Card>
          </Link>
          
          <Link to="/period">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="pt-6">
                <div className="text-center">
                  <Droplet className="h-8 w-8 mx-auto mb-2 text-pink-600" />
                  <p className="font-medium">Period Tracker</p>
                  <p className="text-xs text-gray-500">Cycle tracking</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="fertility">Fertility</TabsTrigger>
            <TabsTrigger value="exercise">Exercise</TabsTrigger>
            <TabsTrigger value="community">Community</TabsTrigger>
            <TabsTrigger value="education">Learn</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Today's Meal Preview */}
              {activePlan && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center">
                      <Apple className="h-4 w-4 mr-2" />
                      Today's Meal Plan
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-gray-600 mb-2">Next meal: Lunch at 12:00 PM</p>
                    <p className="text-2xl font-bold">{activePlan.totalCalories} cal</p>
                    <Link to="/diet-plan">
                      <Button size="sm" className="w-full mt-3">View Full Plan</Button>
                    </Link>
                  </CardContent>
                </Card>
              )}
              
              {/* Upcoming Appointment */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    Next Appointment
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-gray-600 mb-2">Regular Checkup</p>
                  <p className="text-lg font-bold">In 3 days</p>
                  <p className="text-sm text-gray-600">Dr. Sarah Johnson</p>
                  <Link to="/appointments">
                    <Button size="sm" className="w-full mt-3">View All</Button>
                  </Link>
                </CardContent>
              </Card>
              
              {/* Today's Tracking */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center">
                    <Activity className="h-4 w-4 mr-2" />
                    Daily Check-in
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-gray-600 mb-2">Not logged today</p>
                  <div className="flex gap-2 text-xs">
                    <Badge variant="outline">Weight</Badge>
                    <Badge variant="outline">Mood</Badge>
                    <Badge variant="outline">Symptoms</Badge>
                  </div>
                  <Link to="/tracking">
                    <Button size="sm" className="w-full mt-3">Log Now</Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Fertility Tab */}
          <TabsContent value="fertility">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <Heart className="h-5 w-5 mr-2 text-red-500" />
                    Fertility Tracking
                  </span>
                  <Link to="/fertility">
                    <Button size="sm">Open Full Tracker</Button>
                  </Link>
                </CardTitle>
                <CardDescription>Track your fertile window and ovulation</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-gradient-to-r from-pink-100 to-purple-100 rounded-lg">
                    <p className="text-sm font-medium mb-2">Fertile Window</p>
                    <p className="text-lg font-bold">Dec 10 - Dec 15</p>
                    <p className="text-xs text-gray-600 mt-1">High fertility period</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Ovulation Day</p>
                      <p className="font-medium">Dec 13 (predicted)</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Fertility Score</p>
                      <p className="font-medium">85% High</p>
                    </div>
                  </div>
                  <Link to="/fertility">
                    <Button className="w-full" variant="outline">
                      Track BBT & Symptoms
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Exercise Tab */}
          <TabsContent value="exercise">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <Dumbbell className="h-5 w-5 mr-2 text-green-600" />
                    Exercise & Fitness
                  </span>
                  <Link to="/exercise">
                    <Button size="sm">Open Full Tracker</Button>
                  </Link>
                </CardTitle>
                <CardDescription>Safe exercises for your pregnancy stage</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <Card className="border-2 hover:border-primary cursor-pointer transition-colors">
                      <CardContent className="pt-6 text-center">
                        <div className="text-3xl mb-2">🧘‍♀️</div>
                        <p className="font-medium">Prenatal Yoga</p>
                        <p className="text-xs text-gray-500">30 min</p>
                      </CardContent>
                    </Card>
                    <Card className="border-2 hover:border-primary cursor-pointer transition-colors">
                      <CardContent className="pt-6 text-center">
                        <div className="text-3xl mb-2">🚶‍♀️</div>
                        <p className="font-medium">Walking</p>
                        <p className="text-xs text-gray-500">45 min</p>
                      </CardContent>
                    </Card>
                    <Card className="border-2 hover:border-primary cursor-pointer transition-colors">
                      <CardContent className="pt-6 text-center">
                        <div className="text-3xl mb-2">🏊‍♀️</div>
                        <p className="font-medium">Swimming</p>
                        <p className="text-xs text-gray-500">30 min</p>
                      </CardContent>
                    </Card>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <p className="text-sm font-medium text-green-800 mb-2">Today's Goal</p>
                    <Progress value={60} className="h-2 mb-2" />
                    <p className="text-xs text-gray-600">18 of 30 minutes completed</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Community Tab */}
          <TabsContent value="community">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2 text-blue-600" />
                  Community
                </CardTitle>
                <CardDescription>Connect with other women on similar journeys</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="hover:shadow-md cursor-pointer transition-shadow">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">Due Date Groups</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-xs text-gray-600">Connect with moms due the same month</p>
                        <Badge className="mt-2" variant="outline">March 2024</Badge>
                      </CardContent>
                    </Card>
                    <Card className="hover:shadow-md cursor-pointer transition-shadow">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">TTC Community</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-xs text-gray-600">Support for those trying to conceive</p>
                        <Badge className="mt-2" variant="outline">5.2k members</Badge>
                      </CardContent>
                    </Card>
                  </div>
                  <Button className="w-full" variant="outline">
                    <Users className="h-4 w-4 mr-2" />
                    Join Community Forums
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Education/Learn Tab */}
          <TabsContent value="education">
            <div className="space-y-6">
              {/* Featured Content */}
              <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
                    Featured This Week
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <h4 className="font-semibold mb-2">Understanding Your Baby's Movements</h4>
                      <p className="text-sm text-gray-600 mb-3">Learn what's normal and when to contact your doctor</p>
                      <Button size="sm" variant="outline">Read Article</Button>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <h4 className="font-semibold mb-2">Preparing Your Birth Plan</h4>
                      <p className="text-sm text-gray-600 mb-3">Create a comprehensive plan for your delivery day</p>
                      <Button size="sm" variant="outline">Download Template</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Educational Categories */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Pregnancy Stages */}
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg">📚 Pregnancy Stages</CardTitle>
                    <CardDescription>Week-by-week development guide</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="p-2 hover:bg-gray-50 rounded cursor-pointer">
                        <p className="font-medium text-sm">First Trimester (Weeks 1-12)</p>
                        <p className="text-xs text-gray-500">Early symptoms, development milestones</p>
                      </div>
                      <div className="p-2 hover:bg-gray-50 rounded cursor-pointer">
                        <p className="font-medium text-sm">Second Trimester (Weeks 13-27)</p>
                        <p className="text-xs text-gray-500">Baby movements, anatomy scan</p>
                      </div>
                      <div className="p-2 hover:bg-gray-50 rounded cursor-pointer">
                        <p className="font-medium text-sm">Third Trimester (Weeks 28-40)</p>
                        <p className="text-xs text-gray-500">Final preparations, signs of labor</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Nutrition & Health */}
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg">🥗 Nutrition & Health</CardTitle>
                    <CardDescription>Eating right for you and baby</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="p-2 hover:bg-gray-50 rounded cursor-pointer">
                        <p className="font-medium text-sm">Essential Nutrients</p>
                        <p className="text-xs text-gray-500">Folic acid, iron, calcium guide</p>
                      </div>
                      <div className="p-2 hover:bg-gray-50 rounded cursor-pointer">
                        <p className="font-medium text-sm">Foods to Avoid</p>
                        <p className="text-xs text-gray-500">Safe eating during pregnancy</p>
                      </div>
                      <div className="p-2 hover:bg-gray-50 rounded cursor-pointer">
                        <p className="font-medium text-sm">Managing Morning Sickness</p>
                        <p className="text-xs text-gray-500">Tips and remedies</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Baby Development */}
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg">👶 Baby Development</CardTitle>
                    <CardDescription>How your baby grows</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="p-2 hover:bg-gray-50 rounded cursor-pointer">
                        <p className="font-medium text-sm">Organ Development</p>
                        <p className="text-xs text-gray-500">When major organs form</p>
                      </div>
                      <div className="p-2 hover:bg-gray-50 rounded cursor-pointer">
                        <p className="font-medium text-sm">Brain Development</p>
                        <p className="text-xs text-gray-500">Neural growth stages</p>
                      </div>
                      <div className="p-2 hover:bg-gray-50 rounded cursor-pointer">
                        <p className="font-medium text-sm">Sensory Development</p>
                        <p className="text-xs text-gray-500">Hearing, sight, and touch</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Labor & Delivery */}
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg">🏥 Labor & Delivery</CardTitle>
                    <CardDescription>Preparing for the big day</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="p-2 hover:bg-gray-50 rounded cursor-pointer">
                        <p className="font-medium text-sm">Signs of Labor</p>
                        <p className="text-xs text-gray-500">Know when it's time</p>
                      </div>
                      <div className="p-2 hover:bg-gray-50 rounded cursor-pointer">
                        <p className="font-medium text-sm">Pain Management</p>
                        <p className="text-xs text-gray-500">Options and techniques</p>
                      </div>
                      <div className="p-2 hover:bg-gray-50 rounded cursor-pointer">
                        <p className="font-medium text-sm">C-Section Guide</p>
                        <p className="text-xs text-gray-500">What to expect</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Postpartum Care */}
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg">🤱 Postpartum Care</CardTitle>
                    <CardDescription>After baby arrives</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="p-2 hover:bg-gray-50 rounded cursor-pointer">
                        <p className="font-medium text-sm">Recovery Timeline</p>
                        <p className="text-xs text-gray-500">What to expect week by week</p>
                      </div>
                      <div className="p-2 hover:bg-gray-50 rounded cursor-pointer">
                        <p className="font-medium text-sm">Breastfeeding Basics</p>
                        <p className="text-xs text-gray-500">Tips for success</p>
                      </div>
                      <div className="p-2 hover:bg-gray-50 rounded cursor-pointer">
                        <p className="font-medium text-sm">Mental Health</p>
                        <p className="text-xs text-gray-500">Recognizing PPD signs</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Common Concerns */}
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg">❓ Common Concerns</CardTitle>
                    <CardDescription>Answers to frequent questions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="p-2 hover:bg-gray-50 rounded cursor-pointer">
                        <p className="font-medium text-sm">Is This Normal?</p>
                        <p className="text-xs text-gray-500">Common symptoms explained</p>
                      </div>
                      <div className="p-2 hover:bg-gray-50 rounded cursor-pointer">
                        <p className="font-medium text-sm">When to Call Doctor</p>
                        <p className="text-xs text-gray-500">Warning signs checklist</p>
                      </div>
                      <div className="p-2 hover:bg-gray-50 rounded cursor-pointer">
                        <p className="font-medium text-sm">Safe Medications</p>
                        <p className="text-xs text-gray-500">What's safe during pregnancy</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Interactive Tools */}
              <Card>
                <CardHeader>
                  <CardTitle>🛠️ Interactive Learning Tools</CardTitle>
                  <CardDescription>Calculators, quizzes, and more</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Button variant="outline" className="h-auto py-4 flex-col">
                      <span className="text-2xl mb-1">📊</span>
                      <span className="text-sm">Due Date Calculator</span>
                    </Button>
                    <Button variant="outline" className="h-auto py-4 flex-col">
                      <span className="text-2xl mb-1">📏</span>
                      <span className="text-sm">Weight Gain Tracker</span>
                    </Button>
                    <Button variant="outline" className="h-auto py-4 flex-col">
                      <span className="text-2xl mb-1">👟</span>
                      <span className="text-sm">Kick Counter</span>
                    </Button>
                    <Button variant="outline" className="h-auto py-4 flex-col">
                      <span className="text-2xl mb-1">📝</span>
                      <span className="text-sm">Birth Plan Builder</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Video Resources */}
              <Card>
                <CardHeader>
                  <CardTitle>🎥 Video Library</CardTitle>
                  <CardDescription>Visual guides and tutorials</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-100 rounded-lg p-4">
                      <div className="bg-gray-200 h-32 rounded mb-3 flex items-center justify-center">
                        <span className="text-4xl">▶️</span>
                      </div>
                      <h4 className="font-medium text-sm">Prenatal Yoga Session</h4>
                      <p className="text-xs text-gray-500">20 min • Beginner friendly</p>
                    </div>
                    <div className="bg-gray-100 rounded-lg p-4">
                      <div className="bg-gray-200 h-32 rounded mb-3 flex items-center justify-center">
                        <span className="text-4xl">▶️</span>
                      </div>
                      <h4 className="font-medium text-sm">Breathing Techniques</h4>
                      <p className="text-xs text-gray-500">15 min • Labor preparation</p>
                    </div>
                    <div className="bg-gray-100 rounded-lg p-4">
                      <div className="bg-gray-200 h-32 rounded mb-3 flex items-center justify-center">
                        <span className="text-4xl">▶️</span>
                      </div>
                      <h4 className="font-medium text-sm">Newborn Care Basics</h4>
                      <p className="text-xs text-gray-500">25 min • Essential skills</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Tips */}
              <Card className="bg-yellow-50">
                <CardHeader>
                  <CardTitle className="text-lg">💡 Quick Tips for Week {profile?.currentWeek || 1}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start space-x-2">
                      <span className="text-green-600 mt-1">✓</span>
                      <div>
                        <p className="font-medium text-sm">Stay Hydrated</p>
                        <p className="text-xs text-gray-600">Aim for 8-10 glasses of water daily</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-2">
                      <span className="text-green-600 mt-1">✓</span>
                      <div>
                        <p className="font-medium text-sm">Sleep Position</p>
                        <p className="text-xs text-gray-600">Sleep on your left side for better blood flow</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-2">
                      <span className="text-green-600 mt-1">✓</span>
                      <div>
                        <p className="font-medium text-sm">Gentle Exercise</p>
                        <p className="text-xs text-gray-600">30 minutes of walking daily is beneficial</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-2">
                      <span className="text-green-600 mt-1">✓</span>
                      <div>
                        <p className="font-medium text-sm">Prenatal Vitamins</p>
                        <p className="text-xs text-gray-600">Take them with food to avoid nausea</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}