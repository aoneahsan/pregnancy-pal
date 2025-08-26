import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { 
  Thermometer, Heart, Activity, Calendar, TrendingUp, 
  Baby, Target, Info, ChevronRight, Timer, TestTube 
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from '@/hooks/use-toast'
import { useAuthStore } from '@/stores/auth'
import { format, addDays, isSameDay, isWithinInterval, startOfDay, endOfDay } from 'date-fns'

interface FertilityData {
  bbt?: number
  cervicalMucus?: 'none' | 'sticky' | 'creamy' | 'watery' | 'eggwhite'
  cervicalPosition?: 'low' | 'medium' | 'high'
  ovulationTest?: 'negative' | 'faint' | 'positive' | 'peak'
  sexualActivity?: boolean
  protected?: boolean
  notes?: string
  date: Date
}

interface FertilityPrediction {
  ovulationDate: Date
  fertileWindowStart: Date
  fertileWindowEnd: Date
  nextPeriod: Date
  confidence: number
}

export function FertilityTracker() {
  const { t } = useTranslation()
  const { user } = useAuthStore()
  
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [todayData, setTodayData] = useState<FertilityData>({
    date: new Date()
  })
  const [historicalData, setHistoricalData] = useState<FertilityData[]>([])
  const [activeTab, setActiveTab] = useState('track')
  const [predictions, setPredictions] = useState<FertilityPrediction | null>(null)

  // Calculate fertility predictions based on historical data
  useEffect(() => {
    // Mock prediction calculation
    const today = new Date()
    const ovulation = addDays(today, 5)
    setPredictions({
      ovulationDate: ovulation,
      fertileWindowStart: addDays(ovulation, -5),
      fertileWindowEnd: addDays(ovulation, 1),
      nextPeriod: addDays(ovulation, 14),
      confidence: 85
    })
  }, [historicalData])

  const handleSaveBBT = () => {
    if (!todayData.bbt) {
      toast({
        title: 'Error',
        description: 'Please enter BBT temperature',
        variant: 'destructive'
      })
      return
    }

    const updatedData = { ...todayData, date: selectedDate }
    setHistoricalData([...historicalData, updatedData])
    
    toast({
      title: 'BBT Logged',
      description: `Temperature ${todayData.bbt}°F recorded for ${format(selectedDate, 'MMM dd')}`
    })
  }

  const handleSaveCervicalData = () => {
    const updatedData = { ...todayData, date: selectedDate }
    setHistoricalData([...historicalData, updatedData])
    
    toast({
      title: 'Data Saved',
      description: 'Cervical observations have been recorded'
    })
  }

  const handleSaveOvulationTest = () => {
    const updatedData = { ...todayData, date: selectedDate }
    setHistoricalData([...historicalData, updatedData])
    
    toast({
      title: 'Test Result Saved',
      description: `Ovulation test: ${todayData.ovulationTest || 'Not recorded'}`
    })
  }

  const handleSaveActivity = () => {
    const updatedData = { ...todayData, date: selectedDate }
    setHistoricalData([...historicalData, updatedData])
    
    toast({
      title: 'Activity Logged',
      description: 'Sexual activity has been recorded'
    })
  }

  const getFertilityScore = () => {
    if (!predictions) return 0
    
    const today = startOfDay(new Date())
    const fertileStart = startOfDay(predictions.fertileWindowStart)
    const fertileEnd = endOfDay(predictions.fertileWindowEnd)
    const ovulation = startOfDay(predictions.ovulationDate)
    
    if (isSameDay(today, ovulation)) return 100
    if (isWithinInterval(today, { start: fertileStart, end: fertileEnd })) {
      const daysToOvulation = Math.abs((ovulation.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      return Math.max(30, 100 - (daysToOvulation * 15))
    }
    return 10
  }

  const getMucusQuality = (type: string | undefined) => {
    switch(type) {
      case 'eggwhite': return { text: 'Egg White - Most Fertile', color: 'text-green-600' }
      case 'watery': return { text: 'Watery - Very Fertile', color: 'text-green-500' }
      case 'creamy': return { text: 'Creamy - Fertile', color: 'text-yellow-600' }
      case 'sticky': return { text: 'Sticky - Less Fertile', color: 'text-orange-600' }
      default: return { text: 'None - Not Fertile', color: 'text-gray-600' }
    }
  }

  const fertilityScore = getFertilityScore()
  const mucusInfo = getMucusQuality(todayData.cervicalMucus)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">{t('dashboard.fertility.title')}</h2>
          <p className="text-gray-600">Track your fertility signs and predict ovulation</p>
        </div>
        <Badge variant={fertilityScore > 70 ? 'default' : fertilityScore > 30 ? 'secondary' : 'outline'}>
          Fertility Score: {fertilityScore}%
        </Badge>
      </div>

      {/* Predictions Card */}
      {predictions && (
        <Card className="bg-gradient-to-r from-pink-50 to-purple-50">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="mr-2 h-5 w-5" />
              Fertility Predictions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600">{t('dashboard.periodTracker.predictions.ovulation')}</p>
                <p className="text-lg font-semibold">
                  {format(predictions.ovulationDate, 'MMM dd')}
                </p>
                <p className="text-xs text-gray-500">
                  In {Math.ceil((predictions.ovulationDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">{t('dashboard.periodTracker.predictions.fertileWindow')}</p>
                <p className="text-lg font-semibold">
                  {format(predictions.fertileWindowStart, 'MMM dd')} - {format(predictions.fertileWindowEnd, 'MMM dd')}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">{t('dashboard.periodTracker.predictions.nextPeriod')}</p>
                <p className="text-lg font-semibold">
                  {format(predictions.nextPeriod, 'MMM dd')}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Confidence</p>
                <Progress value={predictions.confidence} className="h-2 mt-2" />
                <p className="text-xs text-gray-500 mt-1">{predictions.confidence}% accurate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="track">Track</TabsTrigger>
          <TabsTrigger value="bbt">BBT</TabsTrigger>
          <TabsTrigger value="cervical">Cervical</TabsTrigger>
          <TabsTrigger value="tests">Tests</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        {/* Track Overview Tab */}
        <TabsContent value="track" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Today's Fertility Status</CardTitle>
              <CardDescription>Your fertility indicators for {format(selectedDate, 'MMMM dd, yyyy')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Fertility Score Gauge */}
                <div className="p-6 bg-gradient-to-br from-pink-100 to-purple-100 rounded-lg">
                  <div className="text-center">
                    <div className="text-5xl font-bold mb-2">{fertilityScore}%</div>
                    <p className="text-lg font-medium">
                      {fertilityScore > 70 ? 'High Fertility' : 
                       fertilityScore > 30 ? 'Medium Fertility' : 'Low Fertility'}
                    </p>
                    <p className="text-sm text-gray-600 mt-2">
                      {fertilityScore > 70 ? 'Great time for conception' : 
                       fertilityScore > 30 ? 'Moderate chance of conception' : 'Lower chance of conception'}
                    </p>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <Thermometer className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                    <p className="text-sm text-gray-600">BBT</p>
                    <p className="font-semibold">{todayData.bbt ? `${todayData.bbt}°F` : '--'}</p>
                  </div>
                  <div className="text-center p-3 bg-pink-50 rounded-lg">
                    <Heart className="h-8 w-8 mx-auto mb-2 text-pink-600" />
                    <p className="text-sm text-gray-600">Cervical Mucus</p>
                    <p className="font-semibold text-xs">{mucusInfo.text.split(' - ')[0]}</p>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <TestTube className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                    <p className="text-sm text-gray-600">OPK Test</p>
                    <p className="font-semibold capitalize">{todayData.ovulationTest || '--'}</p>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <Activity className="h-8 w-8 mx-auto mb-2 text-green-600" />
                    <p className="text-sm text-gray-600">Activity</p>
                    <p className="font-semibold">{todayData.sexualActivity ? 'Yes' : '--'}</p>
                  </div>
                </div>

                {/* Tips */}
                <Card className="bg-yellow-50 border-yellow-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center">
                      <Info className="h-4 w-4 mr-2" />
                      Today's Tips
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      {fertilityScore > 70 && (
                        <>
                          <li className="flex items-start">
                            <ChevronRight className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
                            <span>Peak fertility window - ideal time for conception</span>
                          </li>
                          <li className="flex items-start">
                            <ChevronRight className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
                            <span>Have intercourse every 1-2 days during this window</span>
                          </li>
                        </>
                      )}
                      <li className="flex items-start">
                        <ChevronRight className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
                        <span>Take your BBT first thing in the morning before getting out of bed</span>
                      </li>
                      <li className="flex items-start">
                        <ChevronRight className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
                        <span>Check cervical mucus at the same time each day</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* BBT Tab */}
        <TabsContent value="bbt" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('dashboard.fertility.bbt')}</CardTitle>
              <CardDescription>Track your basal body temperature daily</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="bbt-temp">Temperature (°F)</Label>
                <div className="flex gap-2">
                  <Input
                    id="bbt-temp"
                    type="number"
                    step="0.1"
                    min="96"
                    max="100"
                    placeholder="98.6"
                    value={todayData.bbt || ''}
                    onChange={(e) => setTodayData({...todayData, bbt: parseFloat(e.target.value)})}
                  />
                  <Button onClick={handleSaveBBT}>
                    <Thermometer className="h-4 w-4 mr-2" />
                    Log BBT
                  </Button>
                </div>
              </div>

              {/* BBT Chart Placeholder */}
              <Card className="bg-gray-50">
                <CardContent className="py-8">
                  <div className="text-center">
                    <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600">BBT Chart</p>
                    <p className="text-sm text-gray-500">Temperature trends will appear here</p>
                  </div>
                </CardContent>
              </Card>

              {/* BBT Tips */}
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="font-medium text-blue-900 mb-2">BBT Tracking Tips:</p>
                <ul className="space-y-1 text-sm text-blue-800">
                  <li>• Take temperature immediately upon waking</li>
                  <li>• Use the same thermometer every day</li>
                  <li>• Take at the same time each morning</li>
                  <li>• Get at least 3 hours of uninterrupted sleep before measuring</li>
                  <li>• Record temperature before eating, drinking, or getting up</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cervical Tab */}
        <TabsContent value="cervical" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cervical Observations</CardTitle>
              <CardDescription>Track cervical mucus and position</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>{t('dashboard.fertility.cervicalMucus')}</Label>
                <RadioGroup 
                  value={todayData.cervicalMucus} 
                  onValueChange={(value) => setTodayData({...todayData, cervicalMucus: value as any})}
                >
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="none" id="cm-none" />
                      <Label htmlFor="cm-none" className="cursor-pointer">
                        None/Dry - Not fertile
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="sticky" id="cm-sticky" />
                      <Label htmlFor="cm-sticky" className="cursor-pointer">
                        Sticky/Tacky - Low fertility
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="creamy" id="cm-creamy" />
                      <Label htmlFor="cm-creamy" className="cursor-pointer">
                        Creamy/Lotion-like - Moderate fertility
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="watery" id="cm-watery" />
                      <Label htmlFor="cm-watery" className="cursor-pointer">
                        Watery/Wet - High fertility
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="eggwhite" id="cm-eggwhite" />
                      <Label htmlFor="cm-eggwhite" className="cursor-pointer">
                        Egg white/Stretchy - Peak fertility
                      </Label>
                    </div>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label>{t('dashboard.fertility.cervicalPosition')}</Label>
                <Select 
                  value={todayData.cervicalPosition}
                  onValueChange={(value) => setTodayData({...todayData, cervicalPosition: value as any})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select cervical position" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low, firm, closed</SelectItem>
                    <SelectItem value="medium">Medium height and firmness</SelectItem>
                    <SelectItem value="high">High, soft, open (fertile)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={handleSaveCervicalData} className="w-full">
                Save Cervical Observations
              </Button>

              {/* Mucus Quality Indicator */}
              {todayData.cervicalMucus && (
                <Card className="bg-gradient-to-r from-pink-50 to-purple-50">
                  <CardContent className="pt-6">
                    <p className="text-sm text-gray-600 mb-2">Current Mucus Quality</p>
                    <p className={`text-lg font-semibold ${mucusInfo.color}`}>
                      {mucusInfo.text}
                    </p>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tests Tab */}
        <TabsContent value="tests" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Ovulation Tests</CardTitle>
              <CardDescription>Log your OPK (Ovulation Predictor Kit) results</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>{t('dashboard.fertility.opk')}</Label>
                <RadioGroup 
                  value={todayData.ovulationTest}
                  onValueChange={(value) => setTodayData({...todayData, ovulationTest: value as any})}
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="negative" id="opk-negative" />
                      <Label htmlFor="opk-negative" className="cursor-pointer">
                        Negative
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="faint" id="opk-faint" />
                      <Label htmlFor="opk-faint" className="cursor-pointer">
                        Faint Line
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="positive" id="opk-positive" />
                      <Label htmlFor="opk-positive" className="cursor-pointer">
                        Positive
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="peak" id="opk-peak" />
                      <Label htmlFor="opk-peak" className="cursor-pointer">
                        Peak/Blazing Positive
                      </Label>
                    </div>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label htmlFor="test-time">Test Time</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="When did you test?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="morning">Morning (FMU)</SelectItem>
                    <SelectItem value="afternoon">Afternoon</SelectItem>
                    <SelectItem value="evening">Evening</SelectItem>
                    <SelectItem value="multiple">Multiple times</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={handleSaveOvulationTest} className="w-full">
                <TestTube className="h-4 w-4 mr-2" />
                Save Test Result
              </Button>

              {/* Test Result Interpretation */}
              {todayData.ovulationTest && (
                <Card className={
                  todayData.ovulationTest === 'peak' || todayData.ovulationTest === 'positive' 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-yellow-50 border-yellow-200'
                }>
                  <CardContent className="pt-6">
                    <p className="font-medium mb-2">Test Interpretation:</p>
                    {todayData.ovulationTest === 'peak' && (
                      <p className="text-sm text-green-700">
                        Peak fertility detected! Ovulation likely within 12-36 hours. 
                        This is the optimal time for conception.
                      </p>
                    )}
                    {todayData.ovulationTest === 'positive' && (
                      <p className="text-sm text-green-700">
                        LH surge detected! Ovulation expected within 24-48 hours. 
                        Good time for intercourse.
                      </p>
                    )}
                    {todayData.ovulationTest === 'faint' && (
                      <p className="text-sm text-yellow-700">
                        LH is rising but not at peak yet. Continue testing daily. 
                        Fertility is increasing.
                      </p>
                    )}
                    {todayData.ovulationTest === 'negative' && (
                      <p className="text-sm text-gray-700">
                        No LH surge detected. Continue testing daily as you approach 
                        your expected ovulation date.
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('dashboard.fertility.sexualActivity')}</CardTitle>
              <CardDescription>Track intercourse for conception timing</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="activity"
                  checked={todayData.sexualActivity}
                  onCheckedChange={(checked) => setTodayData({...todayData, sexualActivity: checked as boolean})}
                />
                <Label htmlFor="activity" className="cursor-pointer">
                  Sexual activity today
                </Label>
              </div>

              {todayData.sexualActivity && (
                <div>
                  <Label>Protection Used?</Label>
                  <RadioGroup 
                    value={todayData.protected ? 'yes' : 'no'}
                    onValueChange={(value) => setTodayData({...todayData, protected: value === 'yes'})}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="unprotected" />
                        <Label htmlFor="unprotected">{t('dashboard.fertility.unprotected')}</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="protected" />
                        <Label htmlFor="protected">{t('dashboard.fertility.protected')}</Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>
              )}

              <div>
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Input
                  id="notes"
                  placeholder="Add any additional notes..."
                  value={todayData.notes || ''}
                  onChange={(e) => setTodayData({...todayData, notes: e.target.value})}
                />
              </div>

              <Button onClick={handleSaveActivity} className="w-full">
                <Heart className="h-4 w-4 mr-2" />
                Save Activity
              </Button>

              {/* Timing Recommendations */}
              <Card className="bg-purple-50 border-purple-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center">
                    <Timer className="h-4 w-4 mr-2" />
                    Timing Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-purple-800">
                    <li className="flex items-start">
                      <Baby className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                      <span>For conception: Have intercourse every 1-2 days during fertile window</span>
                    </li>
                    <li className="flex items-start">
                      <Calendar className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Best timing: 1-2 days before ovulation through ovulation day</span>
                    </li>
                    <li className="flex items-start">
                      <Heart className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Sperm can survive 3-5 days, egg survives 12-24 hours</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}