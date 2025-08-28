import { createFileRoute, Link, useNavigate, useSearch } from '@tanstack/react-router'
import { Heart, Calendar, Weight, Brain, Activity, ArrowLeft, Plus, Save } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/stores/auth'
import { usePregnancyProfileStore } from '@/stores/pregnancy-profile'
import { format } from 'date-fns'
import { toast } from '@/hooks/use-toast'

export const Route = createFileRoute('/tracking')({
  component: TrackingPage,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      tab: (search.tab as string) || 'vitals'
    }
  }
})

function TrackingPage() {
  const { t } = useTranslation()
  const { user } = useAuthStore()
  const { profile } = usePregnancyProfileStore()
  const navigate = useNavigate()
  const search = useSearch({ from: '/tracking' })
  const activeTab = search.tab || 'vitals'
  
  const [weight, setWeight] = useState('')
  const [bloodPressureSystolic, setBloodPressureSystolic] = useState('')
  const [bloodPressureDiastolic, setBloodPressureDiastolic] = useState('')
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([])
  const [mood, setMood] = useState<number>(3)
  const [sleepHours, setSleepHours] = useState('')
  const [waterGlasses, setWaterGlasses] = useState(0)
  const [kickCount, setKickCount] = useState('')
  const [notes, setNotes] = useState('')
  
  const handleTabChange = (value: string) => {
    navigate({ 
      to: '/tracking',
      search: { tab: value }
    })
  }

  const symptoms = {
    common: ['Nausea', 'Fatigue', 'Headache', 'Back pain', 'Heartburn', 'Constipation'],
    concerning: ['Severe headache', 'Vision changes', 'Swelling', 'Bleeding', 'Severe cramping', 'Fever']
  }

  const handleSaveDaily = () => {
    toast({
      title: 'Daily tracking saved',
      description: 'Your health data has been recorded successfully.'
    })
  }

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
              <h1 className="text-2xl font-bold">{t('dashboard.tabs.tracking')}</h1>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline">Week {profile?.currentWeek || 0}</Badge>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Date Header */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Today's Check-in
                </CardTitle>
                <CardDescription>
                  {format(new Date(), 'EEEE, MMMM d, yyyy')}
                </CardDescription>
              </div>
              <Button onClick={handleSaveDaily}>
                <Save className="h-4 w-4 mr-2" />
                Save All
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Main Tracking Tabs */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="vitals">Vitals</TabsTrigger>
            <TabsTrigger value="symptoms">Symptoms</TabsTrigger>
            <TabsTrigger value="wellness">Wellness</TabsTrigger>
            <TabsTrigger value="baby">Baby</TabsTrigger>
          </TabsList>

          {/* Vitals Tab */}
          <TabsContent value="vitals" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Weight className="h-5 w-5 mr-2" />
                  Physical Measurements
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    placeholder="Enter your weight"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Last recorded: 65 kg (3 days ago)
                  </p>
                </div>

                <div>
                  <Label>Blood Pressure</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Systolic"
                      value={bloodPressureSystolic}
                      onChange={(e) => setBloodPressureSystolic(e.target.value)}
                    />
                    <span className="self-center">/</span>
                    <Input
                      type="number"
                      placeholder="Diastolic"
                      value={bloodPressureDiastolic}
                      onChange={(e) => setBloodPressureDiastolic(e.target.value)}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Normal range: 90-120 / 60-80 mmHg
                  </p>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    💡 Tip: Track your weight weekly and blood pressure at each prenatal visit
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Weight Gain Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Weight Gain Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Total Gain</span>
                      <span className="font-medium">8 kg</span>
                    </div>
                    <Progress value={60} className="h-2" />
                  </div>
                  <p className="text-sm text-gray-600">
                    Recommended total gain: 11-16 kg (based on your BMI)
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Symptoms Tab */}
          <TabsContent value="symptoms" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  Track Your Symptoms
                </CardTitle>
                <CardDescription>
                  Select any symptoms you're experiencing today
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Common Symptoms</Label>
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    {symptoms.common.map((symptom) => (
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
                        <Label htmlFor={symptom} className="cursor-pointer">
                          {symptom}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Concerning Symptoms</Label>
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    {symptoms.concerning.map((symptom) => (
                      <div key={symptom} className="flex items-center space-x-2">
                        <Checkbox
                          id={symptom}
                          checked={selectedSymptoms.includes(symptom)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedSymptoms([...selectedSymptoms, symptom])
                              toast({
                                title: 'Important',
                                description: 'Please contact your healthcare provider about this symptom.',
                                variant: 'destructive'
                              })
                            } else {
                              setSelectedSymptoms(selectedSymptoms.filter(s => s !== symptom))
                            }
                          }}
                        />
                        <Label htmlFor={symptom} className="cursor-pointer text-red-600">
                          {symptom}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedSymptoms.length > 0 && (
                  <div className="p-3 bg-yellow-50 rounded-lg">
                    <p className="text-sm font-medium">Selected symptoms: {selectedSymptoms.length}</p>
                    <p className="text-xs text-gray-600 mt-1">
                      These will be tracked in your health history
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Wellness Tab */}
          <TabsContent value="wellness" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Brain className="h-5 w-5 mr-2" />
                  Mental & Physical Wellness
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>How are you feeling today?</Label>
                  <div className="flex justify-between items-center mt-3">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <Button
                        key={level}
                        variant={mood === level ? 'default' : 'outline'}
                        size="lg"
                        className="text-2xl"
                        onClick={() => setMood(level)}
                      >
                        {getMoodEmoji(level)}
                      </Button>
                    ))}
                  </div>
                  <p className="text-center text-sm text-gray-600 mt-2">
                    Mood Level: {mood}/5
                  </p>
                </div>

                <div>
                  <Label htmlFor="sleep">Sleep (hours)</Label>
                  <Input
                    id="sleep"
                    type="number"
                    placeholder="How many hours did you sleep?"
                    value={sleepHours}
                    onChange={(e) => setSleepHours(e.target.value)}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Recommended: 7-9 hours per night
                  </p>
                </div>

                <div>
                  <Label>Water Intake</Label>
                  <div className="flex items-center space-x-3 mt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setWaterGlasses(Math.max(0, waterGlasses - 1))}
                    >
                      -
                    </Button>
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">💧</span>
                      <span className="text-xl font-medium">{waterGlasses}</span>
                      <span className="text-sm text-gray-600">glasses</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setWaterGlasses(waterGlasses + 1)}
                    >
                      +
                    </Button>
                  </div>
                  <Progress value={(waterGlasses / 10) * 100} className="mt-3" />
                  <p className="text-xs text-gray-500 mt-1">
                    Goal: 8-10 glasses per day
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Baby Tab */}
          <TabsContent value="baby" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Baby Movement Tracking</CardTitle>
                <CardDescription>
                  Track your baby's kicks and movements (usually starts around week 18-20)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {profile && profile.currentWeek >= 18 ? (
                  <>
                    <div>
                      <Label htmlFor="kicks">Kick Count (per hour)</Label>
                      <Input
                        id="kicks"
                        type="number"
                        placeholder="Number of kicks/movements"
                        value={kickCount}
                        onChange={(e) => setKickCount(e.target.value)}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Normal: 10 movements in 2 hours
                      </p>
                    </div>

                    <div className="p-4 bg-pink-50 rounded-lg">
                      <p className="text-sm font-medium mb-2">When to track:</p>
                      <ul className="text-sm text-gray-700 space-y-1">
                        <li>• Same time each day</li>
                        <li>• After meals when baby is active</li>
                        <li>• While lying on your side</li>
                      </ul>
                    </div>

                    <Button className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Start Kick Counter Timer
                    </Button>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-600">
                      You'll start feeling baby movements around week 18-20
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      Currently: Week {profile?.currentWeek || 0}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Notes Section */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Additional Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <textarea
              className="w-full p-3 border rounded-lg resize-none"
              rows={4}
              placeholder="Any additional notes or concerns to discuss with your doctor..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}