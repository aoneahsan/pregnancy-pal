import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { 
  Activity, Timer, Flame, Heart, TrendingUp, PlayCircle, 
  CheckCircle2, AlertCircle, Info, Award, Calendar, Target,
  Dumbbell, PersonStanding, Waves, Wind, Brain, Baby
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useAuthStore } from '@/stores/auth'
import { usePregnancyProfileStore } from '@/stores/pregnancy-profile'
import { toast } from '@/hooks/use-toast'
import { format } from 'date-fns'

interface Exercise {
  id: string
  name: string
  category: 'yoga' | 'walking' | 'swimming' | 'strength' | 'pelvicFloor' | 'breathing'
  duration: number // minutes
  intensity: 'low' | 'moderate' | 'high'
  trimesterSafe: number[]
  description: string
  benefits: string[]
  precautions: string[]
  videoUrl?: string
  imageUrl?: string
  caloriesBurned: number
  icon: React.ReactNode
}

interface WorkoutSession {
  exerciseId: string
  duration: number
  completedAt: Date
  intensity: 'low' | 'moderate' | 'high'
  notes?: string
  heartRate?: number
  caloriesBurned: number
}

interface WeeklyGoal {
  targetMinutes: number
  targetSessions: number
  targetCalories: number
}

export function ExerciseTracker() {
  const { t } = useTranslation()
  const { user } = useAuthStore()
  const { profile } = usePregnancyProfileStore()
  
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [activeTab, setActiveTab] = useState('exercises')
  const [currentSession, setCurrentSession] = useState<WorkoutSession | null>(null)
  const [weeklyProgress, setWeeklyProgress] = useState({
    minutes: 0,
    sessions: 0,
    calories: 0
  })
  const [weeklyGoal] = useState<WeeklyGoal>({
    targetMinutes: 150, // CDC recommendation for pregnant women
    targetSessions: 5,
    targetCalories: 1000
  })

  const currentTrimester = profile?.currentTrimester || 1

  const exercises: Exercise[] = [
    // Prenatal Yoga
    {
      id: 'yoga-1',
      name: 'Gentle Prenatal Yoga',
      category: 'yoga',
      duration: 30,
      intensity: 'low',
      trimesterSafe: [1, 2, 3],
      description: 'A gentle flow designed for pregnancy with modified poses for safety and comfort',
      benefits: ['Improves flexibility', 'Reduces back pain', 'Promotes relaxation', 'Prepares body for labor'],
      precautions: ['Avoid poses on your back after first trimester', 'Skip deep twists', 'Use props for support'],
      caloriesBurned: 100,
      icon: <PersonStanding className="h-6 w-6" />
    },
    {
      id: 'yoga-2',
      name: 'Hip Opening Sequence',
      category: 'yoga',
      duration: 20,
      intensity: 'low',
      trimesterSafe: [1, 2, 3],
      description: 'Focus on hip flexibility and pelvic mobility for easier labor',
      benefits: ['Opens hips', 'Relieves pelvic pressure', 'Strengthens legs', 'Improves balance'],
      precautions: ['Move slowly', 'Use wall for balance', 'Stop if you feel pain'],
      caloriesBurned: 70,
      icon: <PersonStanding className="h-6 w-6" />
    },
    
    // Walking
    {
      id: 'walk-1',
      name: 'Brisk Walk',
      category: 'walking',
      duration: 30,
      intensity: 'moderate',
      trimesterSafe: [1, 2, 3],
      description: 'A moderate-paced walk to boost cardiovascular health',
      benefits: ['Improves circulation', 'Boosts mood', 'Controls weight gain', 'Increases energy'],
      precautions: ['Wear supportive shoes', 'Stay hydrated', 'Avoid overheating'],
      caloriesBurned: 120,
      icon: <Activity className="h-6 w-6" />
    },
    {
      id: 'walk-2',
      name: 'Nature Walk',
      category: 'walking',
      duration: 45,
      intensity: 'low',
      trimesterSafe: [1, 2, 3],
      description: 'A leisurely walk in nature for mental and physical wellness',
      benefits: ['Reduces stress', 'Vitamin D exposure', 'Gentle exercise', 'Fresh air'],
      precautions: ['Choose flat terrain', 'Bring water', 'Wear sun protection'],
      caloriesBurned: 135,
      icon: <Activity className="h-6 w-6" />
    },
    
    // Swimming
    {
      id: 'swim-1',
      name: 'Water Aerobics',
      category: 'swimming',
      duration: 30,
      intensity: 'moderate',
      trimesterSafe: [1, 2, 3],
      description: 'Low-impact water exercises perfect for pregnancy',
      benefits: ['No joint stress', 'Full body workout', 'Reduces swelling', 'Improves endurance'],
      precautions: ['Avoid hot tubs', 'Enter pool carefully', 'Stay in shallow water'],
      caloriesBurned: 150,
      icon: <Waves className="h-6 w-6" />
    },
    {
      id: 'swim-2',
      name: 'Gentle Swimming',
      category: 'swimming',
      duration: 25,
      intensity: 'low',
      trimesterSafe: [1, 2, 3],
      description: 'Easy-paced swimming laps with rest intervals',
      benefits: ['Weightless feeling', 'Cardiovascular fitness', 'Muscle toning', 'Back pain relief'],
      precautions: ['Avoid backstroke in later pregnancy', 'Listen to your body', 'Exit pool slowly'],
      caloriesBurned: 125,
      icon: <Waves className="h-6 w-6" />
    },
    
    // Strength Training
    {
      id: 'strength-1',
      name: 'Light Weights',
      category: 'strength',
      duration: 20,
      intensity: 'low',
      trimesterSafe: [1, 2],
      description: 'Modified strength training with light weights',
      benefits: ['Maintains muscle tone', 'Prepares for carrying baby', 'Improves posture', 'Bone health'],
      precautions: ['Use lighter weights than pre-pregnancy', 'Avoid lying flat', 'No breath holding'],
      caloriesBurned: 80,
      icon: <Dumbbell className="h-6 w-6" />
    },
    {
      id: 'strength-2',
      name: 'Resistance Bands',
      category: 'strength',
      duration: 25,
      intensity: 'low',
      trimesterSafe: [1, 2, 3],
      description: 'Safe resistance training using bands',
      benefits: ['Gentle resistance', 'Improves strength', 'Portable workout', 'Customizable intensity'],
      precautions: ['Check bands for damage', 'Maintain proper form', 'Avoid overstretching'],
      caloriesBurned: 90,
      icon: <Dumbbell className="h-6 w-6" />
    },
    
    // Pelvic Floor
    {
      id: 'pelvic-1',
      name: 'Kegel Exercises',
      category: 'pelvicFloor',
      duration: 10,
      intensity: 'low',
      trimesterSafe: [1, 2, 3],
      description: 'Strengthen pelvic floor muscles for labor and recovery',
      benefits: ['Prevents incontinence', 'Supports pelvic organs', 'Aids in labor', 'Faster postpartum recovery'],
      precautions: ['Don\'t hold breath', 'Relax between contractions', 'Focus on correct muscles'],
      caloriesBurned: 20,
      icon: <Heart className="h-6 w-6" />
    },
    {
      id: 'pelvic-2',
      name: 'Pelvic Tilts',
      category: 'pelvicFloor',
      duration: 15,
      intensity: 'low',
      trimesterSafe: [1, 2, 3],
      description: 'Gentle movements to strengthen core and relieve back pain',
      benefits: ['Reduces back pain', 'Strengthens abs', 'Improves posture', 'Prepares for labor'],
      precautions: ['Move slowly', 'Don\'t arch back', 'Stop if dizzy'],
      caloriesBurned: 30,
      icon: <Heart className="h-6 w-6" />
    },
    
    // Breathing
    {
      id: 'breath-1',
      name: 'Labor Breathing',
      category: 'breathing',
      duration: 15,
      intensity: 'low',
      trimesterSafe: [1, 2, 3],
      description: 'Practice breathing techniques for labor and relaxation',
      benefits: ['Reduces anxiety', 'Pain management', 'Increases oxygen', 'Labor preparation'],
      precautions: ['Don\'t hyperventilate', 'Sit comfortably', 'Stop if lightheaded'],
      caloriesBurned: 15,
      icon: <Wind className="h-6 w-6" />
    },
    {
      id: 'breath-2',
      name: 'Meditation & Breathing',
      category: 'breathing',
      duration: 20,
      intensity: 'low',
      trimesterSafe: [1, 2, 3],
      description: 'Combine meditation with deep breathing for mental wellness',
      benefits: ['Stress reduction', 'Better sleep', 'Mind-body connection', 'Emotional balance'],
      precautions: ['Find quiet space', 'Use props for comfort', 'Practice regularly'],
      caloriesBurned: 20,
      icon: <Brain className="h-6 w-6" />
    }
  ]

  // Filter exercises safe for current trimester
  const safeExercises = exercises.filter(ex => ex.trimesterSafe.includes(currentTrimester))
  
  // Filter by category
  const filteredExercises = selectedCategory === 'all' 
    ? safeExercises 
    : safeExercises.filter(ex => ex.category === selectedCategory)

  const startExercise = (exercise: Exercise) => {
    setCurrentSession({
      exerciseId: exercise.id,
      duration: 0,
      completedAt: new Date(),
      intensity: exercise.intensity,
      caloriesBurned: 0
    })
    toast({
      title: 'Workout Started',
      description: `Started ${exercise.name}. Stay safe and listen to your body!`
    })
  }

  const completeExercise = (exercise: Exercise) => {
    if (!currentSession) return
    
    const session: WorkoutSession = {
      ...currentSession,
      duration: exercise.duration,
      caloriesBurned: exercise.caloriesBurned,
      completedAt: new Date()
    }
    
    // Update weekly progress
    setWeeklyProgress(prev => ({
      minutes: prev.minutes + exercise.duration,
      sessions: prev.sessions + 1,
      calories: prev.calories + exercise.caloriesBurned
    }))
    
    setCurrentSession(null)
    
    toast({
      title: 'Workout Complete! 🎉',
      description: `Great job! You completed ${exercise.duration} minutes of ${exercise.name}`
    })
  }

  const categories = [
    { id: 'all', name: 'All Exercises', icon: <Activity className="h-4 w-4" /> },
    { id: 'yoga', name: t('dashboard.exercise.categories.yoga'), icon: <PersonStanding className="h-4 w-4" /> },
    { id: 'walking', name: t('dashboard.exercise.categories.walking'), icon: <Activity className="h-4 w-4" /> },
    { id: 'swimming', name: t('dashboard.exercise.categories.swimming'), icon: <Waves className="h-4 w-4" /> },
    { id: 'strength', name: t('dashboard.exercise.categories.strength'), icon: <Dumbbell className="h-4 w-4" /> },
    { id: 'pelvicFloor', name: t('dashboard.exercise.categories.pelvicFloor'), icon: <Heart className="h-4 w-4" /> },
    { id: 'breathing', name: t('dashboard.exercise.categories.breathing'), icon: <Wind className="h-4 w-4" /> }
  ]

  const progressPercentage = {
    minutes: (weeklyProgress.minutes / weeklyGoal.targetMinutes) * 100,
    sessions: (weeklyProgress.sessions / weeklyGoal.targetSessions) * 100,
    calories: (weeklyProgress.calories / weeklyGoal.targetCalories) * 100
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">{t('dashboard.exercise.title')}</h2>
          <p className="text-gray-600">Safe exercises for trimester {currentTrimester}</p>
        </div>
        <Badge variant="outline" className="px-4 py-2">
          <Baby className="h-4 w-4 mr-2" />
          Week {profile?.currentWeek || 0}
        </Badge>
      </div>

      {/* Weekly Progress */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="mr-2 h-5 w-5" />
            Weekly Goals
          </CardTitle>
          <CardDescription>Your exercise progress this week</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>{t('dashboard.exercise.duration')}</span>
                <span className="font-medium">{weeklyProgress.minutes} / {weeklyGoal.targetMinutes} min</span>
              </div>
              <Progress value={progressPercentage.minutes} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Sessions</span>
                <span className="font-medium">{weeklyProgress.sessions} / {weeklyGoal.targetSessions}</span>
              </div>
              <Progress value={progressPercentage.sessions} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Calories</span>
                <span className="font-medium">{weeklyProgress.calories} / {weeklyGoal.targetCalories} cal</span>
              </div>
              <Progress value={progressPercentage.calories} className="h-2" />
            </div>
          </div>
          
          {progressPercentage.minutes >= 100 && (
            <div className="mt-4 p-3 bg-green-100 rounded-lg flex items-center">
              <Award className="h-5 w-5 text-green-600 mr-2" />
              <span className="text-sm text-green-800 font-medium">
                Goal achieved! You're doing amazing! 🎉
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="exercises">Exercises</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="tips">Tips & Safety</TabsTrigger>
        </TabsList>

        {/* Exercises Tab */}
        <TabsContent value="exercises" className="space-y-4">
          {/* Category Filter */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map(cat => (
              <Button
                key={cat.id}
                variant={selectedCategory === cat.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(cat.id)}
                className="flex-shrink-0"
              >
                {cat.icon}
                <span className="ml-2">{cat.name}</span>
              </Button>
            ))}
          </div>

          {/* Exercise Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredExercises.map(exercise => {
              const isActive = currentSession?.exerciseId === exercise.id
              
              return (
                <Card key={exercise.id} className={isActive ? 'border-green-500 bg-green-50' : ''}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center">
                        {exercise.icon}
                        <span className="ml-2">{exercise.name}</span>
                      </span>
                      <Badge variant={
                        exercise.intensity === 'low' ? 'secondary' :
                        exercise.intensity === 'moderate' ? 'default' : 'destructive'
                      }>
                        {exercise.intensity}
                      </Badge>
                    </CardTitle>
                    <CardDescription>{exercise.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span className="flex items-center">
                        <Timer className="h-4 w-4 mr-1" />
                        {exercise.duration} min
                      </span>
                      <span className="flex items-center">
                        <Flame className="h-4 w-4 mr-1" />
                        {exercise.caloriesBurned} cal
                      </span>
                    </div>
                    
                    <div>
                      <p className="text-xs font-medium mb-1">Benefits:</p>
                      <ul className="text-xs text-gray-600 space-y-0.5">
                        {exercise.benefits.slice(0, 3).map((benefit, idx) => (
                          <li key={idx} className="flex items-start">
                            <CheckCircle2 className="h-3 w-3 mr-1 mt-0.5 text-green-500 flex-shrink-0" />
                            {benefit}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    {isActive ? (
                      <Button 
                        className="w-full" 
                        variant="default"
                        onClick={() => completeExercise(exercise)}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Complete Workout
                      </Button>
                    ) : (
                      <Button 
                        className="w-full" 
                        variant="outline"
                        onClick={() => startExercise(exercise)}
                      >
                        <PlayCircle className="h-4 w-4 mr-2" />
                        Start Exercise
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        {/* Schedule Tab */}
        <TabsContent value="schedule">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="mr-2 h-5 w-5" />
                Weekly Exercise Schedule
              </CardTitle>
              <CardDescription>Recommended workout plan for pregnancy</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day, idx) => {
                  const isRestDay = idx === 2 || idx === 6 // Wednesday and Sunday as rest days
                  
                  return (
                    <div key={day} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center">
                        <div className={`w-2 h-2 rounded-full mr-3 ${isRestDay ? 'bg-gray-300' : 'bg-green-500'}`} />
                        <div>
                          <p className="font-medium">{day}</p>
                          <p className="text-sm text-gray-600">
                            {isRestDay ? 'Rest Day' : 
                             idx % 2 === 0 ? '30 min Walk + 15 min Yoga' : '20 min Swimming + Pelvic Floor'}
                          </p>
                        </div>
                      </div>
                      {!isRestDay && (
                        <Button size="sm" variant="outline">
                          <PlayCircle className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  )
                })}
              </div>
              
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <Info className="h-4 w-4 inline mr-1" />
                  Aim for at least 150 minutes of moderate exercise per week, as recommended by ACOG.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tips & Safety Tab */}
        <TabsContent value="tips" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertCircle className="mr-2 h-5 w-5 text-yellow-600" />
                Safety Guidelines
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="font-medium mb-2 text-green-700">Safe to Continue:</p>
                  <ul className="space-y-1 text-sm">
                    <li className="flex items-start">
                      <CheckCircle2 className="h-4 w-4 mr-2 text-green-500 mt-0.5" />
                      Walking, swimming, stationary cycling
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="h-4 w-4 mr-2 text-green-500 mt-0.5" />
                      Modified yoga and Pilates
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="h-4 w-4 mr-2 text-green-500 mt-0.5" />
                      Low-impact aerobics
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="h-4 w-4 mr-2 text-green-500 mt-0.5" />
                      Strength training with light weights
                    </li>
                  </ul>
                </div>
                
                <div>
                  <p className="font-medium mb-2 text-red-700">Avoid During Pregnancy:</p>
                  <ul className="space-y-1 text-sm">
                    <li className="flex items-start">
                      <AlertCircle className="h-4 w-4 mr-2 text-red-500 mt-0.5" />
                      Contact sports (soccer, basketball, hockey)
                    </li>
                    <li className="flex items-start">
                      <AlertCircle className="h-4 w-4 mr-2 text-red-500 mt-0.5" />
                      Activities with falling risk (skiing, horseback riding)
                    </li>
                    <li className="flex items-start">
                      <AlertCircle className="h-4 w-4 mr-2 text-red-500 mt-0.5" />
                      Hot yoga or hot Pilates
                    </li>
                    <li className="flex items-start">
                      <AlertCircle className="h-4 w-4 mr-2 text-red-500 mt-0.5" />
                      Exercises lying flat on back after first trimester
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Heart className="mr-2 h-5 w-5 text-red-500" />
                Warning Signs - Stop Exercising If:
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <AlertCircle className="h-4 w-4 mr-2 text-red-500 mt-0.5" />
                  Vaginal bleeding or fluid leaking
                </li>
                <li className="flex items-start">
                  <AlertCircle className="h-4 w-4 mr-2 text-red-500 mt-0.5" />
                  Chest pain or difficulty breathing
                </li>
                <li className="flex items-start">
                  <AlertCircle className="h-4 w-4 mr-2 text-red-500 mt-0.5" />
                  Dizziness or feeling faint
                </li>
                <li className="flex items-start">
                  <AlertCircle className="h-4 w-4 mr-2 text-red-500 mt-0.5" />
                  Regular painful contractions
                </li>
                <li className="flex items-start">
                  <AlertCircle className="h-4 w-4 mr-2 text-red-500 mt-0.5" />
                  Calf pain or swelling
                </li>
              </ul>
              
              <div className="mt-4 p-3 bg-red-50 rounded-lg">
                <p className="text-sm text-red-800 font-medium">
                  Always consult your healthcare provider before starting any exercise program during pregnancy.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-50 to-pink-50">
            <CardHeader>
              <CardTitle>Hydration & Nutrition Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <Flame className="h-4 w-4 mr-2 text-orange-500 mt-0.5" />
                  Eat a light snack 30-60 minutes before exercise
                </li>
                <li className="flex items-start">
                  <Waves className="h-4 w-4 mr-2 text-blue-500 mt-0.5" />
                  Drink water before, during, and after exercise
                </li>
                <li className="flex items-start">
                  <Timer className="h-4 w-4 mr-2 text-green-500 mt-0.5" />
                  Avoid exercising in hot, humid weather
                </li>
                <li className="flex items-start">
                  <Heart className="h-4 w-4 mr-2 text-red-500 mt-0.5" />
                  Wear loose, comfortable clothing and supportive shoes
                </li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}