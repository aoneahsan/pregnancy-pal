import { createFileRoute, Link } from '@tanstack/react-router'
import { Dumbbell, Heart, ArrowLeft, Clock, Calendar, TrendingUp, Activity, Play, CheckCircle2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/stores/auth'
import { usePregnancyProfileStore } from '@/stores/pregnancy-profile'

export const Route = createFileRoute('/exercise')({
  component: ExercisePage,
})

interface Exercise {
  id: string
  name: string
  duration: number
  category: 'yoga' | 'cardio' | 'strength' | 'flexibility' | 'breathing'
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  trimesterSafe: number[]
  description: string
  benefits: string[]
  icon: string
}

function ExercisePage() {
  const { t } = useTranslation()
  const { user } = useAuthStore()
  const { profile } = usePregnancyProfileStore()
  
  const [completedToday, setCompletedToday] = useState<string[]>([])
  
  const exercises: Exercise[] = [
    {
      id: '1',
      name: 'Prenatal Yoga',
      duration: 30,
      category: 'yoga',
      difficulty: 'beginner',
      trimesterSafe: [1, 2, 3],
      description: 'Gentle stretches and poses designed for pregnancy',
      benefits: ['Improves flexibility', 'Reduces stress', 'Helps with breathing'],
      icon: '🧘‍♀️'
    },
    {
      id: '2',
      name: 'Walking',
      duration: 45,
      category: 'cardio',
      difficulty: 'beginner',
      trimesterSafe: [1, 2, 3],
      description: 'Low-impact cardio perfect for all trimesters',
      benefits: ['Improves circulation', 'Maintains fitness', 'Mood booster'],
      icon: '🚶‍♀️'
    },
    {
      id: '3',
      name: 'Swimming',
      duration: 30,
      category: 'cardio',
      difficulty: 'intermediate',
      trimesterSafe: [1, 2, 3],
      description: 'Full-body workout with minimal joint stress',
      benefits: ['Relieves back pain', 'Full body workout', 'Reduces swelling'],
      icon: '🏊‍♀️'
    },
    {
      id: '4',
      name: 'Pelvic Floor Exercises',
      duration: 15,
      category: 'strength',
      difficulty: 'beginner',
      trimesterSafe: [1, 2, 3],
      description: 'Strengthen pelvic floor muscles for labor and recovery',
      benefits: ['Prepares for labor', 'Prevents incontinence', 'Faster recovery'],
      icon: '💪'
    },
    {
      id: '5',
      name: 'Prenatal Pilates',
      duration: 25,
      category: 'strength',
      difficulty: 'intermediate',
      trimesterSafe: [1, 2, 3],
      description: 'Core strengthening with pregnancy modifications',
      benefits: ['Core strength', 'Better posture', 'Balance improvement'],
      icon: '🤸‍♀️'
    },
    {
      id: '6',
      name: 'Breathing Exercises',
      duration: 10,
      category: 'breathing',
      difficulty: 'beginner',
      trimesterSafe: [1, 2, 3],
      description: 'Breathing techniques for relaxation and labor',
      benefits: ['Stress relief', 'Labor preparation', 'Better oxygen flow'],
      icon: '🫁'
    }
  ]

  const getCurrentTrimester = () => {
    if (!profile?.currentWeek) return 1
    if (profile.currentWeek <= 13) return 1
    if (profile.currentWeek <= 27) return 2
    return 3
  }

  const trimester = getCurrentTrimester()
  const safeExercises = exercises.filter(ex => ex.trimesterSafe.includes(trimester))

  const handleCompleteExercise = (exerciseId: string) => {
    setCompletedToday(prev => 
      prev.includes(exerciseId) 
        ? prev.filter(id => id !== exerciseId)
        : [...prev, exerciseId]
    )
  }

  const totalMinutesCompleted = exercises
    .filter(ex => completedToday.includes(ex.id))
    .reduce((sum, ex) => sum + ex.duration, 0)

  const dailyGoal = 30
  const progressPercentage = Math.min((totalMinutesCompleted / dailyGoal) * 100, 100)

  const getCategoryColor = (category: string) => {
    switch(category) {
      case 'yoga': return 'bg-purple-100 text-purple-800'
      case 'cardio': return 'bg-blue-100 text-blue-800'
      case 'strength': return 'bg-green-100 text-green-800'
      case 'flexibility': return 'bg-pink-100 text-pink-800'
      case 'breathing': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pregnancy-pink-50 via-white to-pregnancy-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link to="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
            </div>
            <div className="flex items-center">
              <Heart className="h-8 w-8 text-primary mr-2" />
              <h1 className="text-2xl font-bold">Exercise & Fitness</h1>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline">Week {profile?.currentWeek || 0}</Badge>
              <Badge variant="outline">Trimester {trimester}</Badge>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Daily Progress */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Today's Progress
              </span>
              <Badge variant={progressPercentage >= 100 ? 'default' : 'outline'}>
                {totalMinutesCompleted} / {dailyGoal} min
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={progressPercentage} className="h-3 mb-2" />
            <p className="text-sm text-gray-600">
              {progressPercentage >= 100 
                ? '🎉 Daily goal achieved! Great job!' 
                : `${dailyGoal - totalMinutesCompleted} more minutes to reach your daily goal`}
            </p>
          </CardContent>
        </Card>

        {/* Exercise Tabs */}
        <Tabs defaultValue="recommended" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="recommended">Recommended</TabsTrigger>
            <TabsTrigger value="all">All Exercises</TabsTrigger>
            <TabsTrigger value="schedule">Weekly Plan</TabsTrigger>
          </TabsList>

          {/* Recommended Tab */}
          <TabsContent value="recommended" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {safeExercises.slice(0, 4).map((exercise) => (
                <Card key={exercise.id} className={completedToday.includes(exercise.id) ? 'border-green-500' : ''}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center">
                        <span className="text-3xl mr-3">{exercise.icon}</span>
                        <div>
                          <CardTitle className="text-lg">{exercise.name}</CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className={getCategoryColor(exercise.category)}>
                              {exercise.category}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              <Clock className="h-3 w-3 inline mr-1" />
                              {exercise.duration} min
                            </span>
                          </div>
                        </div>
                      </div>
                      {completedToday.includes(exercise.id) && (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-3">{exercise.description}</p>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        className="flex-1"
                        variant={completedToday.includes(exercise.id) ? 'outline' : 'default'}
                        onClick={() => handleCompleteExercise(exercise.id)}
                      >
                        {completedToday.includes(exercise.id) ? 'Mark Incomplete' : 'Mark Complete'}
                      </Button>
                      <Button size="sm" variant="outline">
                        <Play className="h-4 w-4 mr-1" />
                        Tutorial
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* All Exercises Tab */}
          <TabsContent value="all" className="space-y-4">
            {['yoga', 'cardio', 'strength', 'breathing'].map((category) => (
              <div key={category}>
                <h3 className="text-lg font-semibold mb-3 capitalize">{category}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {exercises
                    .filter(ex => ex.category === category && ex.trimesterSafe.includes(trimester))
                    .map((exercise) => (
                      <Card key={exercise.id} className="hover:shadow-md transition-shadow cursor-pointer">
                        <CardContent className="py-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <span className="text-2xl mr-3">{exercise.icon}</span>
                              <div>
                                <p className="font-medium">{exercise.name}</p>
                                <p className="text-sm text-gray-500">{exercise.duration} min</p>
                              </div>
                            </div>
                            <Button size="sm" variant="ghost">
                              <Play className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </div>
            ))}
          </TabsContent>

          {/* Weekly Plan Tab */}
          <TabsContent value="schedule">
            <Card>
              <CardHeader>
                <CardTitle>Your Weekly Exercise Plan</CardTitle>
                <CardDescription>Recommended schedule for trimester {trimester}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day, index) => {
                    const dayExercise = safeExercises[index % safeExercises.length]
                    return (
                      <div key={day} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-3 text-gray-500" />
                          <div>
                            <p className="font-medium">{day}</p>
                            <p className="text-sm text-gray-600">
                              {dayExercise.icon} {dayExercise.name} - {dayExercise.duration} min
                            </p>
                          </div>
                        </div>
                        <Button size="sm" variant="outline">
                          Schedule
                        </Button>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Safety Guidelines */}
        <Card className="mt-6 border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-yellow-900">Exercise Safety Guidelines</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-yellow-800">
              <li>• Always warm up before exercising and cool down after</li>
              <li>• Stay hydrated - drink water before, during, and after exercise</li>
              <li>• Avoid exercises that involve lying flat on your back after first trimester</li>
              <li>• Stop immediately if you feel dizzy, short of breath, or experience pain</li>
              <li>• Consult your healthcare provider before starting any new exercise routine</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}