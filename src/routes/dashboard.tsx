import { createFileRoute, useNavigate, Link } from '@tanstack/react-router'
import { useEffect } from 'react'
import { Heart, Calendar, Apple, Baby, TrendingUp, Bell, Droplet, Clock, ChefHat, AlertTriangle, Activity, Users, Dumbbell, HeartHandshake } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useAuthStore } from '@/stores/auth'
import { usePregnancyProfileStore } from '@/stores/pregnancy-profile'
import { useDietPlanStore } from '@/stores/diet-plan'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'

export const Route = createFileRoute('/dashboard')({
  component: DashboardPage,
})

function DashboardPage() {
  const navigate = useNavigate()
  const { user, signOut } = useAuthStore()
  const { profile, fetchProfile } = usePregnancyProfileStore()
  const { activePlan, fetchActivePlan } = useDietPlanStore()

  useEffect(() => {
    if (user?.id) {
      fetchProfile(user.id)
      fetchActivePlan(user.id)
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
              <Bell className="h-6 w-6 text-gray-600 cursor-pointer hover:text-gray-900" />
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

        {/* Main Content Tabs */}
        <Tabs defaultValue="diet" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
            <TabsTrigger value="diet">Diet Plan</TabsTrigger>
            <TabsTrigger value="tracking">Daily Tracking</TabsTrigger>
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
            <TabsTrigger value="education">Learn</TabsTrigger>
            <TabsTrigger value="period">Period</TabsTrigger>
            <TabsTrigger value="fertility">Fertility</TabsTrigger>
            <TabsTrigger value="exercise">Exercise</TabsTrigger>
            <TabsTrigger value="community">Community</TabsTrigger>
          </TabsList>

          {/* Diet Plan Tab */}
          <TabsContent value="diet" className="space-y-4">
            {activePlan ? (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center">
                        <Apple className="h-5 w-5 mr-2" />
                        Today's Meal Plan
                      </span>
                      <Badge variant="outline">{activePlan.totalCalories} calories</Badge>
                    </CardTitle>
                    <CardDescription>
                      {activePlan.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {activePlan.meals.map((meal) => (
                      <Card key={meal.id} className="border-l-4 border-l-primary">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg flex items-center">
                              <Clock className="h-4 w-4 mr-2" />
                              {meal.time} - {meal.name}
                            </CardTitle>
                            <Badge>{meal.type}</Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">Calories</span>
                              <span className="font-medium">{meal.totalCalories}</span>
                            </div>
                            
                            <div>
                              <p className="text-sm font-medium mb-2">Instructions:</p>
                              <ol className="list-decimal list-inside space-y-1">
                                {meal.instructions.map((instruction, idx) => (
                                  <li key={idx} className="text-sm text-gray-600">
                                    {instruction}
                                  </li>
                                ))}
                              </ol>
                            </div>

                            {meal.tips.length > 0 && (
                              <div className="bg-pregnancy-pink-50 p-3 rounded-lg">
                                <p className="text-sm font-medium mb-1">Tips:</p>
                                <ul className="space-y-1">
                                  {meal.tips.map((tip, idx) => (
                                    <li key={idx} className="text-sm text-gray-600">
                                      • {tip}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            <div className="grid grid-cols-3 gap-2 text-xs">
                              <div>
                                <span className="text-gray-500">Protein:</span>
                                <span className="ml-1 font-medium">{meal.nutrition.protein}g</span>
                              </div>
                              <div>
                                <span className="text-gray-500">Carbs:</span>
                                <span className="ml-1 font-medium">{meal.nutrition.carbohydrates}g</span>
                              </div>
                              <div>
                                <span className="text-gray-500">Fat:</span>
                                <span className="ml-1 font-medium">{meal.nutrition.fat}g</span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </CardContent>
                </Card>

                {/* Nutrition Targets */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <TrendingUp className="h-5 w-5 mr-2" />
                      Daily Nutrition Targets
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Protein</p>
                        <p className="font-medium">{activePlan.nutritionTargets.protein.min}-{activePlan.nutritionTargets.protein.max}g</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Calcium</p>
                        <p className="font-medium">{activePlan.nutritionTargets.calcium.min}-{activePlan.nutritionTargets.calcium.max}mg</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Iron</p>
                        <p className="font-medium">{activePlan.nutritionTargets.iron.min}-{activePlan.nutritionTargets.iron.max}mg</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Folate</p>
                        <p className="font-medium">{activePlan.nutritionTargets.folate.min}-{activePlan.nutritionTargets.folate.max}mcg</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Fiber</p>
                        <p className="font-medium">{activePlan.nutritionTargets.fiber.min}-{activePlan.nutritionTargets.fiber.max}g</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Vitamin D</p>
                        <p className="font-medium">{activePlan.nutritionTargets.vitaminD.min}-{activePlan.nutritionTargets.vitaminD.max}IU</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Hydration Reminder */}
                <Card className="border-blue-200 bg-blue-50">
                  <CardHeader>
                    <CardTitle className="flex items-center text-blue-900">
                      <Droplet className="h-5 w-5 mr-2" />
                      Hydration Reminder
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-blue-800">
                      Aim for at least 8-10 glasses of water today. Proper hydration is essential for:
                    </p>
                    <ul className="mt-2 space-y-1 text-sm text-blue-700">
                      <li>• Maintaining amniotic fluid levels</li>
                      <li>• Preventing constipation and UTIs</li>
                      <li>• Supporting increased blood volume</li>
                      <li>• Regulating body temperature</li>
                    </ul>
                  </CardContent>
                </Card>

                {/* Foods to Avoid */}
                <Card className="border-red-200 bg-red-50">
                  <CardHeader>
                    <CardTitle className="flex items-center text-red-900">
                      <AlertTriangle className="h-5 w-5 mr-2" />
                      Foods to Avoid During Pregnancy
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="font-medium text-red-800 mb-2">High-Risk Foods:</p>
                        <ul className="space-y-1 text-sm text-red-700">
                          <li>• Raw or undercooked meat</li>
                          <li>• Raw fish and high-mercury fish</li>
                          <li>• Raw eggs</li>
                          <li>• Unpasteurized dairy products</li>
                        </ul>
                      </div>
                      <div>
                        <p className="font-medium text-red-800 mb-2">Limit Consumption:</p>
                        <ul className="space-y-1 text-sm text-red-700">
                          <li>• Caffeine (max 200mg/day)</li>
                          <li>• Processed foods</li>
                          <li>• High-sugar foods</li>
                          <li>• Artificial sweeteners</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <Apple className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600">No diet plan found. Please complete your profile setup.</p>
                  <Button className="mt-4" onClick={() => navigate({ to: '/onboarding' })}>
                    Complete Setup
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Daily Tracking Tab */}
          <TabsContent value="tracking">
            <Card>
              <CardHeader>
                <CardTitle>Daily Tracking</CardTitle>
                <CardDescription>Track your symptoms, mood, and wellness</CardDescription>
              </CardHeader>
              <CardContent className="text-center py-8">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600">Daily tracking feature coming soon!</p>
                <p className="text-sm text-gray-500 mt-2">
                  You'll be able to track symptoms, mood, weight, and more.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appointments Tab */}
          <TabsContent value="appointments">
            <Card>
              <CardHeader>
                <CardTitle>Appointments</CardTitle>
                <CardDescription>Manage your prenatal appointments</CardDescription>
              </CardHeader>
              <CardContent className="text-center py-8">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600">Appointment scheduling coming soon!</p>
                <p className="text-sm text-gray-500 mt-2">
                  Track and manage all your prenatal appointments in one place.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Education Tab */}
          <TabsContent value="education">
            <Card>
              <CardHeader>
                <CardTitle>Educational Resources</CardTitle>
                <CardDescription>Learn about your pregnancy journey</CardDescription>
              </CardHeader>
              <CardContent className="text-center py-8">
                <ChefHat className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600">Educational content coming soon!</p>
                <p className="text-sm text-gray-500 mt-2">
                  Articles, tips, and guidance for every stage of pregnancy.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Period Tracker Tab */}
          <TabsContent value="period">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <Droplet className="h-5 w-5 mr-2 text-pink-500" />
                    Period Tracker
                  </span>
                  <Link to="/period">
                    <Button size="sm">Open Full Tracker</Button>
                  </Link>
                </CardTitle>
                <CardDescription>Track your menstrual cycle and symptoms</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <Card className="bg-pink-50 border-pink-200">
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold text-pink-600">Day 14</div>
                      <p className="text-sm text-gray-600">Current cycle day</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-purple-50 border-purple-200">
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold text-purple-600">28 days</div>
                      <p className="text-sm text-gray-600">Average cycle length</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold text-blue-600">5 days</div>
                      <p className="text-sm text-gray-600">Next period in</p>
                    </CardContent>
                  </Card>
                </div>
                <Link to="/period">
                  <Button className="w-full" variant="outline">
                    <Activity className="h-4 w-4 mr-2" />
                    Log Symptoms & Flow
                  </Button>
                </Link>
              </CardContent>
            </Card>
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
        </Tabs>
      </div>
    </div>
  )
}