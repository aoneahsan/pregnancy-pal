import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Calendar, Droplet, Heart, Activity, Brain, Moon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { usePeriodStore } from '@/stores/period'
import { useAuthStore } from '@/stores/auth'
import { FlowIntensity, PERIOD_SYMPTOMS, PeriodSymptom, MoodEntry } from '@/types/period'
import { format, addDays, isWithinInterval, startOfDay, endOfDay } from 'date-fns'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { toast } from '@/hooks/use-toast'

export function PeriodTracker() {
  const { t } = useTranslation()
  const { user } = useAuthStore()
  const { 
    activePeriod, 
    predictions, 
    statistics,
    currentCycle,
    startPeriod, 
    endPeriod, 
    logFlowIntensity,
    logSymptom,
    logMood,
    fetchPeriodData,
    fetchCycleData,
    fetchPredictions,
    fetchStatistics
  } = usePeriodStore()

  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedFlow, setSelectedFlow] = useState<FlowIntensity>('medium')
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([])
  const [selectedMood, setSelectedMood] = useState<number>(3)
  const [symptomNotes, setSymptomNotes] = useState('')
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    if (user?.id) {
      fetchPeriodData(user.id)
      fetchCycleData(user.id)
      fetchPredictions(user.id)
      fetchStatistics(user.id)
    }
  }, [user?.id])

  const handleStartPeriod = async () => {
    try {
      await startPeriod(selectedDate)
      toast({
        title: 'Period Started',
        description: 'Your period has been logged successfully.',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to start period tracking.',
        variant: 'destructive',
      })
    }
  }

  const handleEndPeriod = async () => {
    try {
      await endPeriod(selectedDate)
      toast({
        title: 'Period Ended',
        description: 'Your period has been marked as complete.',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to end period.',
        variant: 'destructive',
      })
    }
  }

  const handleLogFlow = async () => {
    try {
      await logFlowIntensity(selectedFlow)
      toast({
        title: 'Flow Logged',
        description: `Flow intensity: ${selectedFlow}`,
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to log flow intensity.',
        variant: 'destructive',
      })
    }
  }

  const handleLogSymptoms = async () => {
    try {
      for (const symptom of selectedSymptoms) {
        const symptomEntry: PeriodSymptom = {
          id: `sym-${Date.now()}-${Math.random()}`,
          category: 'physical', // This should be determined based on symptom
          name: symptom,
          severity: 5,
          timestamp: new Date(),
          notes: symptomNotes
        }
        await logSymptom(symptomEntry)
      }
      toast({
        title: 'Symptoms Logged',
        description: `Logged ${selectedSymptoms.length} symptoms`,
      })
      setSelectedSymptoms([])
      setSymptomNotes('')
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to log symptoms.',
        variant: 'destructive',
      })
    }
  }

  const handleLogMood = async () => {
    try {
      const moodEntry: MoodEntry = {
        level: selectedMood as 1 | 2 | 3 | 4 | 5,
        emotions: [],
        timestamp: new Date(),
        notes: ''
      }
      await logMood(moodEntry)
      toast({
        title: 'Mood Logged',
        description: `Mood level: ${selectedMood}/5`,
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to log mood.',
        variant: 'destructive',
      })
    }
  }

  const flowIntensityOptions: FlowIntensity[] = ['spotting', 'light', 'medium', 'heavy', 'very_heavy']
  
  const getMoodEmoji = (level: number) => {
    switch(level) {
      case 1: return '😢'
      case 2: return '😕'
      case 3: return '😐'
      case 4: return '🙂'
      case 5: return '😊'
      default: return '😐'
    }
  }

  const getFlowColor = (intensity: FlowIntensity) => {
    switch(intensity) {
      case 'spotting': return 'bg-pink-100'
      case 'light': return 'bg-pink-200'
      case 'medium': return 'bg-pink-400'
      case 'heavy': return 'bg-red-500'
      case 'very_heavy': return 'bg-red-700'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">{t('dashboard.periodTracker.title')}</h2>
          <p className="text-gray-600">Track your menstrual cycle and symptoms</p>
        </div>
        <div className="flex gap-2">
          {!activePeriod ? (
            <Button onClick={handleStartPeriod} className="bg-pink-500 hover:bg-pink-600">
              <Droplet className="mr-2 h-4 w-4" />
              {t('dashboard.periodTracker.startPeriod')}
            </Button>
          ) : (
            <Button onClick={handleEndPeriod} variant="outline">
              {t('dashboard.periodTracker.endPeriod')}
            </Button>
          )}
        </div>
      </div>

      {/* Predictions Card */}
      {predictions && (
        <Card className="bg-gradient-to-r from-pink-50 to-purple-50">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="mr-2 h-5 w-5" />
              {t('dashboard.periodTracker.predictions.nextPeriod')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">{t('dashboard.periodTracker.predictions.nextPeriod')}</p>
                <p className="text-lg font-semibold">
                  {format(predictions.nextPeriodStart, 'MMM dd, yyyy')}
                </p>
                <p className="text-xs text-gray-500">
                  In {Math.ceil((predictions.nextPeriodStart.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">{t('dashboard.periodTracker.predictions.ovulation')}</p>
                <p className="text-lg font-semibold">
                  {format(predictions.nextOvulation, 'MMM dd')}
                </p>
                <Badge className="mt-1" variant="outline">
                  Confidence: {Math.round(predictions.confidence * 100)}%
                </Badge>
              </div>
              <div>
                <p className="text-sm text-gray-600">{t('dashboard.periodTracker.predictions.fertileWindow')}</p>
                <p className="text-lg font-semibold">
                  {format(predictions.nextFertileStart, 'MMM dd')} - {format(predictions.nextFertileEnd, 'MMM dd')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="symptoms">Symptoms</TabsTrigger>
          <TabsTrigger value="flow">Flow</TabsTrigger>
          <TabsTrigger value="mood">Mood</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          {/* Current Status */}
          {activePeriod && (
            <Card>
              <CardHeader>
                <CardTitle>Current Period</CardTitle>
                <CardDescription>
                  Started {format(activePeriod.startDate, 'MMM dd, yyyy')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Day {Math.ceil((new Date().getTime() - activePeriod.startDate.getTime()) / (1000 * 60 * 60 * 24))}</p>
                    <Progress value={20} className="h-2" />
                  </div>
                  {activePeriod.flowIntensity.length > 0 && (
                    <div className="flex gap-2">
                      {activePeriod.flowIntensity.map((flow, idx) => (
                        <div
                          key={idx}
                          className={`w-8 h-8 rounded-full ${getFlowColor(flow)}`}
                          title={flow}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Statistics */}
          {statistics && (
            <Card>
              <CardHeader>
                <CardTitle>{t('dashboard.periodTracker.statistics.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">{t('dashboard.periodTracker.statistics.averageLength')}</p>
                    <p className="text-2xl font-bold">{statistics.averageCycleLength} days</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">{t('dashboard.periodTracker.statistics.periodLength')}</p>
                    <p className="text-2xl font-bold">{statistics.averagePeriodLength} days</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">{t('dashboard.periodTracker.statistics.regularity')}</p>
                    <Badge variant={statistics.cycleRegularity === 'regular' ? 'default' : 'secondary'}>
                      {t(`dashboard.periodTracker.statistics.${statistics.cycleRegularity}`)}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Cycles</p>
                    <p className="text-2xl font-bold">{statistics.totalCycles}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Symptoms Tab */}
        <TabsContent value="symptoms" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Log Symptoms</CardTitle>
              <CardDescription>Track your symptoms throughout your cycle</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(PERIOD_SYMPTOMS).map(([category, symptoms]) => (
                <div key={category}>
                  <h4 className="font-medium mb-2 capitalize flex items-center">
                    {category === 'physical' && <Activity className="mr-2 h-4 w-4" />}
                    {category === 'emotional' && <Brain className="mr-2 h-4 w-4" />}
                    {category === 'energy' && <Moon className="mr-2 h-4 w-4" />}
                    {t(`dashboard.periodTracker.symptoms.${category}`)}
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {symptoms.map((symptom) => (
                      <div key={symptom} className="flex items-center space-x-2">
                        <Checkbox
                          id={symptom}
                          checked={selectedSymptoms.includes(symptom)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedSymptoms([...selectedSymptoms, symptom])
                            } else {
                              setSelectedSymptoms(selectedSymptoms.filter(s => s !== symptom))
                            }
                          }}
                        />
                        <Label htmlFor={symptom} className="text-sm cursor-pointer">
                          {symptom}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <div>
                <Label htmlFor="symptom-notes">Notes</Label>
                <Input
                  id="symptom-notes"
                  placeholder="Add any additional notes..."
                  value={symptomNotes}
                  onChange={(e) => setSymptomNotes(e.target.value)}
                />
              </div>
              <Button onClick={handleLogSymptoms} disabled={selectedSymptoms.length === 0}>
                Log Symptoms ({selectedSymptoms.length})
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Flow Tab */}
        <TabsContent value="flow" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Flow Intensity</CardTitle>
              <CardDescription>Log today's flow intensity</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <RadioGroup value={selectedFlow} onValueChange={(value) => setSelectedFlow(value as FlowIntensity)}>
                {flowIntensityOptions.map((intensity) => (
                  <div key={intensity} className="flex items-center space-x-3">
                    <RadioGroupItem value={intensity} id={intensity} />
                    <Label htmlFor={intensity} className="flex items-center cursor-pointer">
                      <div className={`w-6 h-6 rounded-full mr-3 ${getFlowColor(intensity)}`} />
                      <span className="capitalize">{t(`dashboard.periodTracker.${intensity}`)}</span>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
              <Button onClick={handleLogFlow}>
                <Droplet className="mr-2 h-4 w-4" />
                Log Flow
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Mood Tab */}
        <TabsContent value="mood" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Mood Tracking</CardTitle>
              <CardDescription>How are you feeling today?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                {[1, 2, 3, 4, 5].map((level) => (
                  <Button
                    key={level}
                    variant={selectedMood === level ? 'default' : 'outline'}
                    size="lg"
                    className="text-2xl"
                    onClick={() => setSelectedMood(level)}
                  >
                    {getMoodEmoji(level)}
                  </Button>
                ))}
              </div>
              <div className="text-center">
                <p className="text-lg font-medium">Mood Level: {selectedMood}/5</p>
              </div>
              <Button onClick={handleLogMood} className="w-full">
                <Heart className="mr-2 h-4 w-4" />
                Log Mood
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}