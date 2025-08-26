import { createFileRoute, Link } from '@tanstack/react-router'
import { Calendar, Heart, ArrowLeft, Droplet, TrendingUp, AlertCircle, Plus, ChevronLeft, ChevronRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/stores/auth'
import { format, addDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, subMonths, addMonths } from 'date-fns'

export const Route = createFileRoute('/period')({
  component: PeriodPage,
})

interface PeriodData {
  startDate: Date
  endDate: Date
  flow: 'light' | 'medium' | 'heavy'
  symptoms: string[]
}

function PeriodPage() {
  const { t } = useTranslation()
  const { user } = useAuthStore()
  
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [periodHistory] = useState<PeriodData[]>([
    {
      startDate: new Date(2024, 0, 5),
      endDate: new Date(2024, 0, 9),
      flow: 'medium',
      symptoms: ['cramps', 'fatigue']
    },
    {
      startDate: new Date(2024, 1, 2),
      endDate: new Date(2024, 1, 6),
      flow: 'heavy',
      symptoms: ['headache', 'mood swings']
    }
  ])

  // Calculate cycle predictions
  const averageCycleLength = 28
  const averagePeriodLength = 5
  const lastPeriod = periodHistory[periodHistory.length - 1]
  const nextPeriodStart = lastPeriod ? addDays(lastPeriod.startDate, averageCycleLength) : new Date()
  const fertileWindowStart = lastPeriod ? addDays(lastPeriod.startDate, averageCycleLength - 16) : new Date()
  const ovulationDay = lastPeriod ? addDays(lastPeriod.startDate, averageCycleLength - 14) : new Date()
  
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const getDayType = (date: Date) => {
    // Check if it's a period day
    for (const period of periodHistory) {
      if (date >= period.startDate && date <= period.endDate) {
        return 'period'
      }
    }
    
    // Check if it's predicted period
    if (date >= nextPeriodStart && date <= addDays(nextPeriodStart, averagePeriodLength - 1)) {
      return 'predicted-period'
    }
    
    // Check if it's fertile window
    if (date >= fertileWindowStart && date <= addDays(fertileWindowStart, 5)) {
      return 'fertile'
    }
    
    // Check if it's ovulation day
    if (date.toDateString() === ovulationDay.toDateString()) {
      return 'ovulation'
    }
    
    return 'normal'
  }

  const getDayColor = (type: string) => {
    switch(type) {
      case 'period': return 'bg-red-500 text-white'
      case 'predicted-period': return 'bg-red-200 text-red-800'
      case 'fertile': return 'bg-green-200 text-green-800'
      case 'ovulation': return 'bg-purple-500 text-white'
      default: return ''
    }
  }

  const symptoms = [
    { icon: '😫', name: 'Cramps', selected: false },
    { icon: '🤕', name: 'Headache', selected: false },
    { icon: '😔', name: 'Mood swings', selected: false },
    { icon: '😴', name: 'Fatigue', selected: false },
    { icon: '🤢', name: 'Nausea', selected: false },
    { icon: '😣', name: 'Bloating', selected: false },
    { icon: '🥵', name: 'Hot flashes', selected: false },
    { icon: '😰', name: 'Anxiety', selected: false }
  ]

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
              <h1 className="text-2xl font-bold">Period & Cycle Tracker</h1>
            </div>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Log Period
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Cycle Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Cycle Day</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">Day 12</p>
              <p className="text-xs text-gray-600">of 28 day cycle</p>
              <Progress value={(12/28) * 100} className="mt-2 h-1" />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Next Period</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">16 days</p>
              <p className="text-xs text-gray-600">{format(nextPeriodStart, 'MMM d, yyyy')}</p>
              <Badge variant="outline" className="mt-2">Regular cycle</Badge>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Fertile Window</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">In 2 days</p>
              <p className="text-xs text-gray-600">{format(fertileWindowStart, 'MMM d')} - {format(addDays(fertileWindowStart, 5), 'MMM d')}</p>
              <Badge className="mt-2 bg-green-100 text-green-800">Medium fertility</Badge>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="calendar" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
            <TabsTrigger value="symptoms">Symptoms</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          {/* Calendar Tab */}
          <TabsContent value="calendar">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Cycle Calendar</CardTitle>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="font-medium">{format(currentMonth, 'MMMM yyyy')}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-1">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="text-center text-xs font-medium py-2">
                      {day}
                    </div>
                  ))}
                  {monthDays.map((day, idx) => {
                    const dayType = getDayType(day)
                    const dayColor = getDayColor(dayType)
                    return (
                      <button
                        key={idx}
                        onClick={() => setSelectedDate(day)}
                        className={`
                          aspect-square flex items-center justify-center text-sm rounded-lg
                          hover:bg-gray-100 transition-colors cursor-pointer
                          ${dayColor}
                          ${isToday(day) ? 'ring-2 ring-primary' : ''}
                          ${selectedDate?.toDateString() === day.toDateString() ? 'ring-2 ring-blue-500' : ''}
                        `}
                      >
                        {format(day, 'd')}
                      </button>
                    )
                  })}
                </div>
                
                {/* Legend */}
                <div className="flex flex-wrap gap-4 mt-6 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-500 rounded"></div>
                    <span>Period</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-200 rounded"></div>
                    <span>Predicted Period</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-200 rounded"></div>
                    <span>Fertile Window</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-purple-500 rounded"></div>
                    <span>Ovulation</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Symptoms Tab */}
          <TabsContent value="symptoms">
            <Card>
              <CardHeader>
                <CardTitle>Track Symptoms</CardTitle>
                <CardDescription>Select symptoms you're experiencing today</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {symptoms.map((symptom) => (
                    <Card
                      key={symptom.name}
                      className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-primary"
                    >
                      <CardContent className="pt-6 text-center">
                        <div className="text-3xl mb-2">{symptom.icon}</div>
                        <p className="text-sm font-medium">{symptom.name}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                <div className="mt-6">
                  <label className="text-sm font-medium">Additional Notes</label>
                  <textarea
                    className="w-full mt-2 p-3 border rounded-lg resize-none"
                    rows={3}
                    placeholder="Any additional symptoms or notes..."
                  />
                  <Button className="mt-3">Save Symptoms</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Insights Tab */}
          <TabsContent value="insights">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Cycle Insights</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Average Cycle Length</p>
                    <div className="flex items-center justify-between">
                      <Progress value={75} className="flex-1 mr-4" />
                      <span className="font-medium">28 days</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Average Period Length</p>
                    <div className="flex items-center justify-between">
                      <Progress value={60} className="flex-1 mr-4" />
                      <span className="font-medium">5 days</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Cycle Regularity</p>
                    <div className="flex items-center justify-between">
                      <Progress value={90} className="flex-1 mr-4" />
                      <span className="font-medium">Very Regular</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-yellow-200 bg-yellow-50">
                <CardHeader>
                  <CardTitle className="flex items-center text-yellow-900">
                    <AlertCircle className="h-5 w-5 mr-2" />
                    Cycle Tips
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-yellow-800">
                    <li>• Your cycle is very regular, which is great for family planning</li>
                    <li>• Track basal body temperature for more accurate ovulation prediction</li>
                    <li>• Stay hydrated and maintain a balanced diet during your period</li>
                    <li>• Light exercise can help reduce menstrual cramps</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Period History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {periodHistory.map((period, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center">
                        <Droplet className={`h-5 w-5 mr-3 ${
                          period.flow === 'heavy' ? 'text-red-600' :
                          period.flow === 'medium' ? 'text-red-500' :
                          'text-red-400'
                        }`} />
                        <div>
                          <p className="font-medium">
                            {format(period.startDate, 'MMM d')} - {format(period.endDate, 'MMM d, yyyy')}
                          </p>
                          <p className="text-sm text-gray-600">
                            {Math.round((period.endDate.getTime() - period.startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1} days • {period.flow} flow
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">Edit</Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}