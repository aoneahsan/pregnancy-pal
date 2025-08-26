import { createFileRoute, Link } from '@tanstack/react-router'
import { Baby, Heart, ArrowLeft, Thermometer, Calendar, TrendingUp, Info, Plus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/stores/auth'
import { format, addDays } from 'date-fns'
import { toast } from '@/hooks/use-toast'

export const Route = createFileRoute('/fertility')({
  component: FertilityPage,
})

interface FertilityData {
  date: Date
  temperature?: number
  cervicalMucus?: 'dry' | 'sticky' | 'creamy' | 'watery' | 'eggwhite'
  ovulationTest?: 'negative' | 'positive'
  symptoms: string[]
  notes?: string
}

function FertilityPage() {
  const { t } = useTranslation()
  const { user } = useAuthStore()
  
  const [todayTemp, setTodayTemp] = useState('')
  const [cervicalMucus, setCervicalMucus] = useState<string>('')
  const [ovulationTest, setOvulationTest] = useState<string>('')
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([])
  
  // Mock historical data
  const [fertilityHistory] = useState<FertilityData[]>([
    { date: new Date(2024, 1, 10), temperature: 97.2, cervicalMucus: 'creamy', ovulationTest: 'negative', symptoms: [] },
    { date: new Date(2024, 1, 11), temperature: 97.3, cervicalMucus: 'watery', ovulationTest: 'negative', symptoms: ['breast tenderness'] },
    { date: new Date(2024, 1, 12), temperature: 97.1, cervicalMucus: 'eggwhite', ovulationTest: 'positive', symptoms: ['ovulation pain'] },
    { date: new Date(2024, 1, 13), temperature: 97.8, cervicalMucus: 'eggwhite', ovulationTest: 'negative', symptoms: [] },
    { date: new Date(2024, 1, 14), temperature: 97.9, cervicalMucus: 'creamy', ovulationTest: 'negative', symptoms: [] },
  ])

  const symptoms = [
    { id: 'breast-tenderness', label: 'Breast tenderness', icon: '🤱' },
    { id: 'ovulation-pain', label: 'Ovulation pain', icon: '⚡' },
    { id: 'increased-libido', label: 'Increased libido', icon: '💕' },
    { id: 'bloating', label: 'Bloating', icon: '🎈' },
    { id: 'headache', label: 'Headache', icon: '🤕' },
    { id: 'mood-changes', label: 'Mood changes', icon: '🌙' },
  ]

  const mucusTypes = [
    { value: 'dry', label: 'Dry', fertility: 'low', color: 'bg-gray-200' },
    { value: 'sticky', label: 'Sticky', fertility: 'low', color: 'bg-yellow-200' },
    { value: 'creamy', label: 'Creamy', fertility: 'medium', color: 'bg-yellow-300' },
    { value: 'watery', label: 'Watery', fertility: 'high', color: 'bg-blue-300' },
    { value: 'eggwhite', label: 'Egg white', fertility: 'peak', color: 'bg-green-400' },
  ]

  const handleSaveData = () => {
    toast({
      title: 'Fertility data saved',
      description: 'Your fertility tracking data has been recorded successfully.'
    })
  }

  const getFertilityScore = () => {
    let score = 50 // Base score
    
    // Adjust based on cervical mucus
    if (cervicalMucus === 'eggwhite') score = 95
    else if (cervicalMucus === 'watery') score = 85
    else if (cervicalMucus === 'creamy') score = 60
    else if (cervicalMucus === 'sticky') score = 30
    else if (cervicalMucus === 'dry') score = 10
    
    // Boost if positive ovulation test
    if (ovulationTest === 'positive') score = Math.min(100, score + 20)
    
    return score
  }

  const fertilityScore = getFertilityScore()

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
              <h1 className="text-2xl font-bold">Fertility Tracking</h1>
            </div>
            <Button size="sm" onClick={handleSaveData}>
              <Plus className="h-4 w-4 mr-2" />
              Save Today's Data
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Fertility Status Card */}
        <Card className="mb-6 bg-gradient-to-r from-pink-100 to-purple-100">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Today's Fertility Status</span>
              <Badge className={fertilityScore > 80 ? 'bg-green-600' : fertilityScore > 50 ? 'bg-yellow-600' : 'bg-gray-600'}>
                {fertilityScore > 80 ? 'Peak Fertility' : fertilityScore > 50 ? 'High Fertility' : 'Low Fertility'}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Fertility Score</span>
                  <span className="font-bold">{fertilityScore}%</span>
                </div>
                <Progress value={fertilityScore} className="h-3" />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-xs text-gray-600">Ovulation Expected</p>
                  <p className="font-medium">In 2 days</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Fertile Window</p>
                  <p className="font-medium">Now - 5 days</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Chance of Conception</p>
                  <p className="font-medium">{fertilityScore > 80 ? 'Very High' : fertilityScore > 50 ? 'High' : 'Low'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Cycle Day</p>
                  <p className="font-medium">Day 14</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Tracking Tabs */}
        <Tabs defaultValue="bbt" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="bbt">BBT</TabsTrigger>
            <TabsTrigger value="cervical">Cervical Signs</TabsTrigger>
            <TabsTrigger value="tests">Tests</TabsTrigger>
            <TabsTrigger value="chart">Chart</TabsTrigger>
          </TabsList>

          {/* BBT Tab */}
          <TabsContent value="bbt" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Thermometer className="h-5 w-5 mr-2" />
                  Basal Body Temperature
                </CardTitle>
                <CardDescription>
                  Track your temperature first thing in the morning before getting out of bed
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="temperature">Today's Temperature (°F)</Label>
                  <Input
                    id="temperature"
                    type="number"
                    step="0.1"
                    placeholder="e.g., 97.6"
                    value={todayTemp}
                    onChange={(e) => setTodayTemp(e.target.value)}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Yesterday: 97.3°F • Average: 97.5°F
                  </p>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-start">
                    <Info className="h-4 w-4 text-blue-600 mr-2 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">BBT Tips:</p>
                      <ul className="space-y-1 text-xs">
                        <li>• Take temperature at the same time each morning</li>
                        <li>• Use the same thermometer consistently</li>
                        <li>• Temperature rises 0.5-1°F after ovulation</li>
                        <li>• Track for at least 3 months for best patterns</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Recent Temperature History */}
                <div>
                  <p className="font-medium mb-2">Recent Temperatures</p>
                  <div className="space-y-2">
                    {fertilityHistory.slice(-5).reverse().map((data, idx) => (
                      <div key={idx} className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">{format(data.date, 'MMM d')}</span>
                        <span className="font-medium">{data.temperature}°F</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Cervical Signs Tab */}
          <TabsContent value="cervical" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Cervical Mucus</CardTitle>
                <CardDescription>
                  Track changes in cervical mucus to identify fertile days
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <RadioGroup value={cervicalMucus} onValueChange={setCervicalMucus}>
                  {mucusTypes.map((type) => (
                    <div key={type.value} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                      <RadioGroupItem value={type.value} id={type.value} />
                      <Label htmlFor={type.value} className="flex-1 cursor-pointer">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={`w-4 h-4 rounded ${type.color}`}></div>
                            <span>{type.label}</span>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {type.fertility} fertility
                          </Badge>
                        </div>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>

                <div className="p-4 bg-purple-50 rounded-lg">
                  <p className="text-sm font-medium text-purple-900 mb-2">Understanding Cervical Mucus:</p>
                  <ul className="space-y-1 text-xs text-purple-800">
                    <li>• <strong>Dry/Sticky:</strong> Low fertility, early in cycle</li>
                    <li>• <strong>Creamy:</strong> Increasing fertility</li>
                    <li>• <strong>Watery:</strong> High fertility, approaching ovulation</li>
                    <li>• <strong>Egg white:</strong> Peak fertility, ovulation imminent</li>
                  </ul>
                </div>

                {/* Symptoms */}
                <div>
                  <Label>Additional Symptoms</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                    {symptoms.map((symptom) => (
                      <div
                        key={symptom.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedSymptoms.includes(symptom.id)
                            ? 'bg-primary text-white border-primary'
                            : 'hover:bg-gray-50'
                        }`}
                        onClick={() => {
                          setSelectedSymptoms(prev =>
                            prev.includes(symptom.id)
                              ? prev.filter(s => s !== symptom.id)
                              : [...prev, symptom.id]
                          )
                        }}
                      >
                        <div className="text-center">
                          <span className="text-2xl">{symptom.icon}</span>
                          <p className="text-xs mt-1">{symptom.label}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tests Tab */}
          <TabsContent value="tests" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Ovulation Tests</CardTitle>
                <CardDescription>
                  Record your ovulation and pregnancy test results
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Ovulation Test Result</Label>
                  <RadioGroup value={ovulationTest} onValueChange={setOvulationTest}>
                    <div className="flex gap-4">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="positive" id="positive" />
                        <Label htmlFor="positive">Positive (LH Surge)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="negative" id="negative" />
                        <Label htmlFor="negative">Negative</Label>
                      </div>
                    </div>
                  </RadioGroup>
                  {ovulationTest === 'positive' && (
                    <div className="mt-3 p-3 bg-green-100 rounded-lg">
                      <p className="text-sm text-green-800">
                        🎉 LH surge detected! Ovulation likely in the next 12-48 hours. 
                        This is your most fertile time!
                      </p>
                    </div>
                  )}
                </div>

                <div className="border-t pt-4">
                  <Label>Test History</Label>
                  <div className="space-y-2 mt-2">
                    {[
                      { date: 'Feb 12', type: 'OPK', result: 'Positive', dpo: null },
                      { date: 'Feb 11', type: 'OPK', result: 'Negative', dpo: null },
                      { date: 'Feb 10', type: 'OPK', result: 'Negative', dpo: null },
                      { date: 'Jan 26', type: 'Pregnancy', result: 'Negative', dpo: '14 DPO' },
                    ].map((test, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 border rounded">
                        <div>
                          <span className="font-medium text-sm">{test.date}</span>
                          <span className="ml-2 text-xs text-gray-600">{test.type}</span>
                          {test.dpo && <span className="ml-2 text-xs text-gray-500">({test.dpo})</span>}
                        </div>
                        <Badge variant={test.result === 'Positive' ? 'default' : 'outline'}>
                          {test.result}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Chart Tab */}
          <TabsContent value="chart">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Fertility Chart
                </CardTitle>
                <CardDescription>
                  Visual representation of your fertility signs over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                  <p className="text-gray-500">
                    Chart visualization would display BBT, cervical mucus, and test results over time
                  </p>
                </div>
                
                <div className="grid grid-cols-3 gap-4 mt-6 text-center">
                  <div>
                    <p className="text-xs text-gray-600">Average Cycle</p>
                    <p className="text-lg font-bold">28 days</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Ovulation Day</p>
                    <p className="text-lg font-bold">Day 14</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Luteal Phase</p>
                    <p className="text-lg font-bold">14 days</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Educational Content */}
        <Card className="mt-6 border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-900">Fertility Tracking Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-800">
              <div>
                <p className="font-medium mb-2">Best Times to Conceive:</p>
                <ul className="space-y-1 text-xs">
                  <li>• 5 days before ovulation</li>
                  <li>• Day of ovulation</li>
                  <li>• 24 hours after ovulation</li>
                </ul>
              </div>
              <div>
                <p className="font-medium mb-2">Improve Your Chances:</p>
                <ul className="space-y-1 text-xs">
                  <li>• Track multiple fertility signs</li>
                  <li>• Maintain a healthy lifestyle</li>
                  <li>• Reduce stress levels</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}