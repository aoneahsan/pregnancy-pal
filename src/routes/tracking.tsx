import { createFileRoute, Link, useNavigate, useSearch } from '@tanstack/react-router'
import { Heart, Calendar, Weight, Brain, Activity, ArrowLeft, Plus, Save, Apple, AlertTriangle, Phone, Download, CalendarCheck } from 'lucide-react'
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

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
  
  // Dialog states
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false)
  const [contactDialogOpen, setContactDialogOpen] = useState(false)
  const [appointmentDate, setAppointmentDate] = useState('')
  const [appointmentTime, setAppointmentTime] = useState('')
  const [appointmentReason, setAppointmentReason] = useState('')
  const [contactMethod, setContactMethod] = useState('')
  const [contactMessage, setContactMessage] = useState('')
  const [urgencyLevel, setUrgencyLevel] = useState('normal')
  
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

  // Symptom recommendations mapping
  const symptomRecommendations: Record<string, {
    diet: string[]
    rest: string[]
    actions: string[]
    avoid: string[]
  }> = {
    'Nausea': {
      diet: [
        'Eat small, frequent meals instead of three large ones',
        'Try ginger tea or ginger candies',
        'Consume bland foods like crackers, toast, or rice',
        'Stay hydrated with clear fluids between meals',
        'Eat protein-rich snacks before bed'
      ],
      rest: [
        'Get fresh air - open windows or take short walks',
        'Rest in a well-ventilated room',
        'Avoid strong smells that trigger nausea'
      ],
      actions: [
        'Keep crackers by your bedside for morning sickness',
        'Wear acupressure wristbands',
        'Take prenatal vitamins with food'
      ],
      avoid: [
        'Fatty, greasy, or spicy foods',
        'Strong odors and perfumes',
        'Lying down immediately after eating'
      ]
    },
    'Fatigue': {
      diet: [
        'Increase iron-rich foods (lean meat, spinach, beans)',
        'Eat complex carbohydrates for sustained energy',
        'Include vitamin B12 sources (eggs, dairy, fortified cereals)',
        'Stay well-hydrated throughout the day'
      ],
      rest: [
        'Take 20-30 minute power naps when possible',
        'Go to bed earlier than usual',
        'Practice good sleep hygiene'
      ],
      actions: [
        'Delegate tasks when possible',
        'Light exercise like prenatal yoga',
        'Check iron levels with your doctor'
      ],
      avoid: [
        'Caffeine after 2 PM',
        'Heavy meals before bedtime',
        'Overexertion'
      ]
    },
    'Headache': {
      diet: [
        'Stay consistently hydrated (10-12 glasses of water daily)',
        'Maintain stable blood sugar with regular meals',
        'Include magnesium-rich foods (nuts, seeds, whole grains)',
        'Eat foods high in riboflavin (dairy, eggs, lean meats)'
      ],
      rest: [
        'Rest in a dark, quiet room',
        'Apply cold compress to head and neck',
        'Practice relaxation techniques'
      ],
      actions: [
        'Maintain good posture',
        'Get regular gentle exercise',
        'Try prenatal massage',
        'Monitor blood pressure'
      ],
      avoid: [
        'Trigger foods (chocolate, aged cheese, MSG)',
        'Bright lights and loud noises',
        'Dehydration',
        'Skipping meals'
      ]
    },
    'Back pain': {
      diet: [
        'Increase calcium intake (dairy, leafy greens)',
        'Consume anti-inflammatory foods (fatty fish, berries)',
        'Maintain adequate vitamin D levels',
        'Stay hydrated to keep discs healthy'
      ],
      rest: [
        'Sleep on your side with a pillow between knees',
        'Use proper lumbar support when sitting',
        'Take frequent breaks from standing'
      ],
      actions: [
        'Practice prenatal yoga or swimming',
        'Wear supportive shoes with low heels',
        'Use a maternity support belt',
        'Apply heat or ice packs'
      ],
      avoid: [
        'High heels',
        'Heavy lifting',
        'Prolonged standing or sitting',
        'Sleeping on your back after 20 weeks'
      ]
    },
    'Heartburn': {
      diet: [
        'Eat smaller, more frequent meals',
        'Choose low-acid foods (bananas, melons, oatmeal)',
        'Drink milk or yogurt to neutralize acid',
        'Chew food thoroughly and eat slowly'
      ],
      rest: [
        'Sleep with head elevated on extra pillows',
        'Wait 2-3 hours after eating before lying down',
        'Sleep on your left side'
      ],
      actions: [
        'Wear loose-fitting clothes',
        'Take a short walk after meals',
        'Try papaya enzyme supplements (with doctor approval)'
      ],
      avoid: [
        'Spicy, fatty, or fried foods',
        'Citrus fruits and tomatoes',
        'Chocolate and caffeine',
        'Large meals before bedtime'
      ]
    },
    'Constipation': {
      diet: [
        'Increase fiber gradually (25-35g daily)',
        'Eat prunes or drink prune juice',
        'Include whole grains, fruits, and vegetables',
        'Drink warm water with lemon in the morning',
        'Add ground flaxseed to smoothies or yogurt'
      ],
      rest: [
        'Establish a regular bathroom routine',
        'Don\'t strain during bowel movements',
        'Take time and don\'t rush'
      ],
      actions: [
        'Exercise regularly (walking, swimming)',
        'Try squatting position on toilet',
        'Consider a fiber supplement (with doctor approval)',
        'Massage abdomen gently in circular motions'
      ],
      avoid: [
        'Processed foods',
        'Excessive dairy',
        'Iron supplements on empty stomach',
        'Dehydration'
      ]
    },
    'Severe headache': {
      diet: ['Hydrate immediately', 'Eat if blood sugar might be low'],
      rest: ['Lie down in a dark room immediately'],
      actions: [
        '⚠️ Contact your healthcare provider immediately',
        'Check blood pressure if possible',
        'Monitor for vision changes or swelling'
      ],
      avoid: ['Ignoring the symptom - could indicate preeclampsia']
    },
    'Vision changes': {
      diet: ['Stay hydrated', 'Monitor salt intake'],
      rest: ['Rest your eyes', 'Avoid screens'],
      actions: [
        '🚨 Call your doctor immediately',
        'Check blood pressure',
        'Note any other symptoms'
      ],
      avoid: ['Driving until cleared by doctor']
    },
    'Swelling': {
      diet: [
        'Reduce sodium intake',
        'Increase water consumption',
        'Eat potassium-rich foods (bananas, sweet potatoes)',
        'Include natural diuretics (cucumber, watermelon)'
      ],
      rest: [
        'Elevate feet above heart level when resting',
        'Sleep on your left side',
        'Take breaks from standing'
      ],
      actions: [
        'Monitor for sudden or severe swelling',
        'Wear compression stockings',
        'Do ankle pumps and circles',
        'Contact doctor if swelling is sudden or severe'
      ],
      avoid: [
        'Standing for long periods',
        'Tight clothing or jewelry',
        'Excessive salt',
        'Sitting with crossed legs'
      ]
    },
    'Bleeding': {
      diet: ['Stay hydrated'],
      rest: ['Rest immediately', 'Lie down on your left side'],
      actions: [
        '🚨 EMERGENCY: Contact your doctor or go to ER immediately',
        'Note amount and color of bleeding',
        'Save any tissue that passes'
      ],
      avoid: ['Sexual activity until cleared by doctor', 'Heavy lifting']
    },
    'Severe cramping': {
      diet: ['Stay hydrated', 'Maintain electrolyte balance'],
      rest: ['Lie down immediately', 'Try different positions'],
      actions: [
        '🚨 Contact healthcare provider urgently',
        'Time the cramps if regular',
        'Monitor for other symptoms'
      ],
      avoid: ['Ignoring persistent or severe cramps']
    },
    'Fever': {
      diet: [
        'Increase fluid intake significantly',
        'Eat vitamin C rich foods',
        'Consume clear broths',
        'Stay hydrated with electrolyte drinks'
      ],
      rest: [
        'Rest as much as possible',
        'Keep room cool',
        'Use light bedding'
      ],
      actions: [
        '⚠️ Contact doctor for fever over 100.4°F',
        'Take acetaminophen if approved by doctor',
        'Monitor temperature regularly',
        'Use cool compresses'
      ],
      avoid: [
        'Hot baths or saunas',
        'Heavy blankets',
        'Aspirin or ibuprofen unless approved'
      ]
    }
  }

  const handleSaveDaily = () => {
    toast({
      title: 'Daily tracking saved',
      description: 'Your health data has been recorded successfully.'
    })
  }

  const handleScheduleDoctor = () => {
    setScheduleDialogOpen(true)
    // Pre-fill reason with selected symptoms
    if (selectedSymptoms.length > 0) {
      setAppointmentReason(`Experiencing symptoms: ${selectedSymptoms.join(', ')}`)
    }
  }

  const confirmScheduleAppointment = () => {
    if (!appointmentDate || !appointmentTime) {
      toast({
        title: 'Missing Information',
        description: 'Please select both date and time for the appointment.',
        variant: 'destructive'
      })
      return
    }

    // Here you would typically send this to your backend
    const appointmentData = {
      date: appointmentDate,
      time: appointmentTime,
      reason: appointmentReason,
      symptoms: selectedSymptoms,
      urgency: selectedSymptoms.some(s => symptoms.concerning.includes(s)) ? 'high' : 'normal'
    }

    console.log('Scheduling appointment:', appointmentData)
    
    toast({
      title: 'Appointment Scheduled',
      description: `Your appointment has been scheduled for ${appointmentDate} at ${appointmentTime}. You will receive a confirmation email shortly.`
    })
    
    setScheduleDialogOpen(false)
    // Reset form
    setAppointmentDate('')
    setAppointmentTime('')
    setAppointmentReason('')
  }

  const handleSaveRecommendations = () => {
    if (selectedSymptoms.length === 0) {
      toast({
        title: 'No symptoms selected',
        description: 'Please select symptoms first to save recommendations.',
        variant: 'destructive'
      })
      return
    }

    // Create recommendations document
    const recommendationsDoc = {
      date: new Date().toISOString(),
      symptoms: selectedSymptoms,
      recommendations: selectedSymptoms.map(symptom => ({
        symptom,
        ...symptomRecommendations[symptom]
      })),
      week: profile?.currentWeek || 0
    }

    // Convert to downloadable format
    const recommendationsText = `
Pregnancy Health Recommendations
Date: ${format(new Date(), 'MMMM d, yyyy')}
Week: ${profile?.currentWeek || 0}

${
      selectedSymptoms.map(symptom => {
        const rec = symptomRecommendations[symptom]
        if (!rec) return ''
        return `
${symptom.toUpperCase()}
${'='.repeat(symptom.length)}

Diet Suggestions:
${rec.diet?.map(d => `• ${d}`).join('\n') || 'None'}

Rest & Recovery:
${rec.rest?.map(r => `• ${r}`).join('\n') || 'None'}

Recommended Actions:
${rec.actions?.map(a => `• ${a}`).join('\n') || 'None'}

Things to Avoid:
${rec.avoid?.map(a => `• ${a}`).join('\n') || 'None'}
`
      }).join('\n')
    }

IMPORTANT: Always consult with your healthcare provider for personalized medical advice.`

    // Create and download file
    const blob = new Blob([recommendationsText], { type: 'text/plain' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `pregnancy-recommendations-${format(new Date(), 'yyyy-MM-dd')}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)

    // Also save to localStorage for future reference
    const savedRecommendations = JSON.parse(localStorage.getItem('savedRecommendations') || '[]')
    savedRecommendations.push(recommendationsDoc)
    localStorage.setItem('savedRecommendations', JSON.stringify(savedRecommendations))

    toast({
      title: 'Recommendations Saved',
      description: 'Your personalized recommendations have been saved and downloaded.'
    })
  }

  const handleContactProvider = () => {
    setContactDialogOpen(true)
    // Pre-fill message with concerning symptoms
    const concerningSelected = selectedSymptoms.filter(s => symptoms.concerning.includes(s))
    if (concerningSelected.length > 0) {
      setContactMessage(`I am experiencing the following concerning symptoms: ${concerningSelected.join(', ')}. I would like to discuss these with my healthcare provider.`)
      setUrgencyLevel('urgent')
    } else if (selectedSymptoms.length > 0) {
      setContactMessage(`I am experiencing: ${selectedSymptoms.join(', ')}. I would like to discuss management options.`)
      setUrgencyLevel('normal')
    }
  }

  const confirmContactProvider = () => {
    if (!contactMethod || !contactMessage) {
      toast({
        title: 'Missing Information',
        description: 'Please select a contact method and enter a message.',
        variant: 'destructive'
      })
      return
    }

    // Here you would typically send this to your backend
    const contactData = {
      method: contactMethod,
      message: contactMessage,
      urgency: urgencyLevel,
      symptoms: selectedSymptoms,
      week: profile?.currentWeek || 0,
      timestamp: new Date().toISOString()
    }

    console.log('Contacting provider:', contactData)

    // Simulate different contact methods
    switch (contactMethod) {
      case 'phone':
        toast({
          title: 'Call Request Sent',
          description: 'Your healthcare provider will call you within 2-4 hours. Emergency? Call 911.'
        })
        break
      case 'email':
        toast({
          title: 'Email Sent',
          description: 'Your message has been sent. Expect a response within 24-48 hours.'
        })
        break
      case 'portal':
        toast({
          title: 'Message Sent via Patient Portal',
          description: 'Your provider will respond through the patient portal within 24 hours.'
        })
        break
      case 'emergency':
        toast({
          title: 'Emergency Contact',
          description: 'Please call 911 or go to the nearest emergency room immediately.',
          variant: 'destructive'
        })
        // Could also trigger a phone call here
        window.location.href = 'tel:911'
        break
    }

    setContactDialogOpen(false)
    // Reset form
    setContactMethod('')
    setContactMessage('')
    setUrgencyLevel('normal')
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
            
            {/* Symptom Recommendations */}
            {selectedSymptoms.length > 0 && (
              <div className="space-y-4">
                <Card className="border-2 border-primary/20">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      <Heart className="h-5 w-5 mr-2 text-primary" />
                      Personalized Recommendations
                    </CardTitle>
                    <CardDescription>
                      Based on your selected symptoms, here are some helpful suggestions
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {selectedSymptoms.map((symptom) => {
                      const recommendations = symptomRecommendations[symptom]
                      if (!recommendations) return null
                      
                      const isConcerning = symptoms.concerning.includes(symptom)
                      
                      return (
                        <div key={symptom} className={`space-y-3 p-4 rounded-lg ${
                          isConcerning ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'
                        }`}>
                          <h4 className={`font-semibold text-lg flex items-center ${
                            isConcerning ? 'text-red-800' : 'text-green-800'
                          }`}>
                            {isConcerning && '⚠️ '}
                            {symptom}
                          </h4>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Diet Recommendations */}
                            {recommendations.diet && recommendations.diet.length > 0 && (
                              <div className="bg-white p-3 rounded-lg">
                                <h5 className="font-medium text-sm mb-2 flex items-center">
                                  <Apple className="h-4 w-4 mr-1 text-green-600" />
                                  Diet Suggestions
                                </h5>
                                <ul className="space-y-1 text-sm text-gray-700">
                                  {recommendations.diet.map((tip, idx) => (
                                    <li key={idx} className="flex items-start">
                                      <span className="text-green-500 mr-1">•</span>
                                      <span>{tip}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            {/* Rest Tips */}
                            {recommendations.rest && recommendations.rest.length > 0 && (
                              <div className="bg-white p-3 rounded-lg">
                                <h5 className="font-medium text-sm mb-2 flex items-center">
                                  <Brain className="h-4 w-4 mr-1 text-blue-600" />
                                  Rest & Recovery
                                </h5>
                                <ul className="space-y-1 text-sm text-gray-700">
                                  {recommendations.rest.map((tip, idx) => (
                                    <li key={idx} className="flex items-start">
                                      <span className="text-blue-500 mr-1">•</span>
                                      <span>{tip}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            {/* Actions to Take */}
                            {recommendations.actions && recommendations.actions.length > 0 && (
                              <div className="bg-white p-3 rounded-lg">
                                <h5 className="font-medium text-sm mb-2 flex items-center">
                                  <Activity className="h-4 w-4 mr-1 text-purple-600" />
                                  Recommended Actions
                                </h5>
                                <ul className="space-y-1 text-sm text-gray-700">
                                  {recommendations.actions.map((action, idx) => (
                                    <li key={idx} className="flex items-start">
                                      <span className="text-purple-500 mr-1">•</span>
                                      <span>{action}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            {/* Things to Avoid */}
                            {recommendations.avoid && recommendations.avoid.length > 0 && (
                              <div className="bg-white p-3 rounded-lg">
                                <h5 className="font-medium text-sm mb-2 flex items-center">
                                  <AlertTriangle className="h-4 w-4 mr-1 text-orange-600" />
                                  Things to Avoid
                                </h5>
                                <ul className="space-y-1 text-sm text-gray-700">
                                  {recommendations.avoid.map((item, idx) => (
                                    <li key={idx} className="flex items-start">
                                      <span className="text-orange-500 mr-1">•</span>
                                      <span>{item}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                    
                    {/* General Advice */}
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-sm text-blue-800">
                        <strong>Remember:</strong> These are general recommendations. Always consult with your healthcare provider 
                        for personalized medical advice, especially if symptoms persist or worsen.
                      </p>
                    </div>
                    
                    {/* Quick Action Buttons */}
                    <div className="flex flex-wrap gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={handleScheduleDoctor}
                        className="hover:bg-primary/10"
                      >
                        <CalendarCheck className="h-4 w-4 mr-1" />
                        Schedule Doctor Visit
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={handleSaveRecommendations}
                        className="hover:bg-green-50"
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Save Recommendations
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={handleContactProvider}
                        className={`hover:bg-red-50 ${
                          selectedSymptoms.some(s => symptoms.concerning.includes(s)) 
                            ? 'border-red-500 text-red-600' 
                            : ''
                        }`}
                      >
                        <Phone className="h-4 w-4 mr-1" />
                        Contact Healthcare Provider
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
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

      {/* Schedule Appointment Dialog */}
      <Dialog open={scheduleDialogOpen} onOpenChange={setScheduleDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <CalendarCheck className="h-5 w-5 mr-2 text-primary" />
              Schedule Doctor Visit
            </DialogTitle>
            <DialogDescription>
              Book an appointment with your healthcare provider
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="appointment-date">Preferred Date</Label>
              <Input
                id="appointment-date"
                type="date"
                value={appointmentDate}
                onChange={(e) => setAppointmentDate(e.target.value)}
                min={format(new Date(), 'yyyy-MM-dd')}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="appointment-time">Preferred Time</Label>
              <Select value={appointmentTime} onValueChange={setAppointmentTime}>
                <SelectTrigger id="appointment-time">
                  <SelectValue placeholder="Select a time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="09:00">9:00 AM</SelectItem>
                  <SelectItem value="09:30">9:30 AM</SelectItem>
                  <SelectItem value="10:00">10:00 AM</SelectItem>
                  <SelectItem value="10:30">10:30 AM</SelectItem>
                  <SelectItem value="11:00">11:00 AM</SelectItem>
                  <SelectItem value="11:30">11:30 AM</SelectItem>
                  <SelectItem value="14:00">2:00 PM</SelectItem>
                  <SelectItem value="14:30">2:30 PM</SelectItem>
                  <SelectItem value="15:00">3:00 PM</SelectItem>
                  <SelectItem value="15:30">3:30 PM</SelectItem>
                  <SelectItem value="16:00">4:00 PM</SelectItem>
                  <SelectItem value="16:30">4:30 PM</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="appointment-reason">Reason for Visit</Label>
              <Textarea
                id="appointment-reason"
                placeholder="Describe your symptoms or reason for the visit"
                value={appointmentReason}
                onChange={(e) => setAppointmentReason(e.target.value)}
                rows={3}
              />
            </div>
            
            {selectedSymptoms.some(s => symptoms.concerning.includes(s)) && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800 font-medium">
                  ⚠️ You have selected concerning symptoms. 
                  We recommend scheduling an urgent appointment.
                </p>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setScheduleDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmScheduleAppointment}>
              Confirm Appointment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Contact Healthcare Provider Dialog */}
      <Dialog open={contactDialogOpen} onOpenChange={setContactDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Phone className="h-5 w-5 mr-2 text-primary" />
              Contact Healthcare Provider
            </DialogTitle>
            <DialogDescription>
              Choose how you'd like to contact your healthcare provider
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Contact Method</Label>
              <Select value={contactMethod} onValueChange={setContactMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Select contact method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="phone">Request Phone Call</SelectItem>
                  <SelectItem value="email">Send Email</SelectItem>
                  <SelectItem value="portal">Patient Portal Message</SelectItem>
                  {selectedSymptoms.some(s => symptoms.concerning.includes(s)) && (
                    <SelectItem value="emergency" className="text-red-600">
                      Emergency Contact (911)
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Urgency Level</Label>
              <Select value={urgencyLevel} onValueChange={setUrgencyLevel}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal - Within 48 hours</SelectItem>
                  <SelectItem value="urgent">Urgent - Within 24 hours</SelectItem>
                  {selectedSymptoms.some(s => symptoms.concerning.includes(s)) && (
                    <SelectItem value="emergency" className="text-red-600">
                      Emergency - Immediate
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="contact-message">Message</Label>
              <Textarea
                id="contact-message"
                placeholder="Describe your symptoms and concerns"
                value={contactMessage}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setContactMessage(e.target.value)}
                rows={4}
              />
            </div>
            
            {urgencyLevel === 'emergency' && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800 font-medium">
                  🚨 For emergencies, please call 911 or go to the nearest emergency room immediately.
                </p>
              </div>
            )}
            
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Your symptoms:</strong> {selectedSymptoms.join(', ') || 'None selected'}
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setContactDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={confirmContactProvider}
              className={urgencyLevel === 'emergency' ? 'bg-red-600 hover:bg-red-700' : ''}
            >
              {urgencyLevel === 'emergency' ? 'Contact Emergency' : 'Send Message'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}