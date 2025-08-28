import { createFileRoute, Link } from '@tanstack/react-router'
import { Apple, Heart, Clock, AlertTriangle, Droplet, TrendingUp, ArrowLeft, Settings } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useDietPlanStore } from '@/stores/diet-plan'
import { useAuthStore } from '@/stores/auth'
import { usePregnancyProfileStore } from '@/stores/pregnancy-profile'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { DietaryRestriction } from '@/types'

export const Route = createFileRoute('/diet-plan')({
  component: DietPlanPage,
})

function DietPlanPage() {
  const { t } = useTranslation()
  const { toast } = useToast()
  const { user } = useAuthStore()
  const { profile, updateProfile } = usePregnancyProfileStore()
  const { activePlan, fetchActivePlan, generatePlan } = useDietPlanStore()
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  
  // Form state for diet preferences
  const [dietaryRestrictions, setDietaryRestrictions] = useState<DietaryRestriction[]>([])
  const [allergies, setAllergies] = useState<string>('')
  const [mealPreferences, setMealPreferences] = useState({
    breakfast: true,
    lunch: true,
    dinner: true,
    snacks: true
  })
  const [calorieTarget, setCalorieTarget] = useState<string>('2200')
  const [additionalNotes, setAdditionalNotes] = useState<string>('')

  useEffect(() => {
    if (user?.id) {
      fetchActivePlan(user.id)
    }
  }, [user?.id, fetchActivePlan])
  
  useEffect(() => {
    // Initialize form with existing preferences
    if (profile?.dietaryRestrictions) {
      setDietaryRestrictions(profile.dietaryRestrictions)
    }
    if (profile?.allergies) {
      setAllergies(profile.allergies.join(', '))
    }
  }, [profile])
  
  const handleSavePreferences = async () => {
    if (!profile || !user) return
    
    setIsUpdating(true)
    try {
      // Parse allergies string into array
      const allergiesArray = allergies
        .split(',')
        .map(a => a.trim())
        .filter(a => a.length > 0)
      
      // Update profile with new preferences
      await updateProfile(user.id, {
        dietaryRestrictions,
        allergies: allergiesArray,
      })
      
      // Regenerate diet plan with new preferences
      if (profile) {
        await generatePlan(
          { ...profile, dietaryRestrictions, allergies: allergiesArray },
          dietaryRestrictions
        )
      }
      
      toast({
        title: 'Preferences Updated',
        description: 'Your diet preferences have been saved and your meal plan has been updated.',
      })
      
      setIsEditDialogOpen(false)
      
      // Refresh the active plan
      await fetchActivePlan(user.id)
    } catch (error) {
      toast({
        title: 'Update Failed',
        description: 'Could not update your preferences. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setIsUpdating(false)
    }
  }
  
  const toggleRestriction = (restriction: DietaryRestriction) => {
    setDietaryRestrictions(prev => 
      prev.includes(restriction)
        ? prev.filter(r => r !== restriction)
        : [...prev, restriction]
    )
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
              <h1 className="text-2xl font-bold">Diet Plan</h1>
            </div>
            <div className="flex items-center space-x-2">
              <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Edit Preferences
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Edit Diet Preferences</DialogTitle>
                    <DialogDescription>
                      Update your dietary restrictions and preferences to customize your meal plan.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-6 mt-4">
                    {/* Dietary Restrictions */}
                    <div>
                      <Label className="text-base font-semibold mb-3 block">Dietary Restrictions</Label>
                      <div className="grid grid-cols-2 gap-3">
                        {['vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'nut-free', 'halal', 'kosher', 'low-sodium'].map((restriction) => (
                          <div key={restriction} className="flex items-center space-x-2">
                            <Checkbox
                              id={restriction}
                              checked={dietaryRestrictions.includes(restriction as DietaryRestriction)}
                              onCheckedChange={() => toggleRestriction(restriction as DietaryRestriction)}
                            />
                            <Label
                              htmlFor={restriction}
                              className="text-sm font-normal capitalize cursor-pointer"
                            >
                              {restriction.replace('-', ' ')}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Allergies */}
                    <div>
                      <Label htmlFor="allergies" className="text-base font-semibold mb-2 block">
                        Allergies or Intolerances
                      </Label>
                      <Textarea
                        id="allergies"
                        placeholder="Enter allergies separated by commas (e.g., peanuts, shellfish, eggs)"
                        value={allergies}
                        onChange={(e) => setAllergies(e.target.value)}
                        className="min-h-[80px]"
                      />
                      <p className="text-xs text-gray-500 mt-1">Separate multiple allergies with commas</p>
                    </div>
                    
                    {/* Meal Preferences */}
                    <div>
                      <Label className="text-base font-semibold mb-3 block">Meal Preferences</Label>
                      <div className="grid grid-cols-2 gap-3">
                        {Object.entries(mealPreferences).map(([meal, enabled]) => (
                          <div key={meal} className="flex items-center space-x-2">
                            <Checkbox
                              id={meal}
                              checked={enabled}
                              onCheckedChange={(checked) => 
                                setMealPreferences(prev => ({ ...prev, [meal]: checked as boolean }))
                              }
                            />
                            <Label
                              htmlFor={meal}
                              className="text-sm font-normal capitalize cursor-pointer"
                            >
                              Include {meal}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Calorie Target */}
                    <div>
                      <Label htmlFor="calories" className="text-base font-semibold mb-2 block">
                        Daily Calorie Target
                      </Label>
                      <Select value={calorieTarget} onValueChange={setCalorieTarget}>
                        <SelectTrigger id="calories">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1800">1800 calories (Light)</SelectItem>
                          <SelectItem value="2000">2000 calories (Moderate)</SelectItem>
                          <SelectItem value="2200">2200 calories (Standard)</SelectItem>
                          <SelectItem value="2400">2400 calories (Active)</SelectItem>
                          <SelectItem value="2600">2600 calories (Very Active)</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-gray-500 mt-1">Recommended for pregnancy: 2200-2400 calories</p>
                    </div>
                    
                    {/* Additional Notes */}
                    <div>
                      <Label htmlFor="notes" className="text-base font-semibold mb-2 block">
                        Additional Notes or Preferences
                      </Label>
                      <Textarea
                        id="notes"
                        placeholder="Any other dietary preferences or notes (e.g., prefer organic, no spicy food)"
                        value={additionalNotes}
                        onChange={(e) => setAdditionalNotes(e.target.value)}
                        className="min-h-[100px]"
                      />
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-3 pt-4 border-t">
                      <Button 
                        variant="outline" 
                        onClick={() => setIsEditDialogOpen(false)}
                        disabled={isUpdating}
                      >
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleSavePreferences}
                        disabled={isUpdating}
                      >
                        {isUpdating ? 'Saving...' : 'Save Preferences'}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              <Badge variant="outline">Week {profile?.currentWeek || 0}</Badge>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {activePlan ? (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <Apple className="h-5 w-5 mr-2" />
                    {t('dashboard.dietPlan.title')}
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
                          <p className="text-sm font-medium mb-2">{t('dashboard.dietPlan.instructions')}:</p>
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
                            <p className="text-sm font-medium mb-1">{t('dashboard.dietPlan.tips')}:</p>
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
                  {t('dashboard.dietPlan.nutrition.title')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">{t('dashboard.dietPlan.nutrition.protein')}</p>
                    <p className="font-medium">{activePlan.nutritionTargets.protein.min}-{activePlan.nutritionTargets.protein.max}g</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">{t('dashboard.dietPlan.nutrition.calcium')}</p>
                    <p className="font-medium">{activePlan.nutritionTargets.calcium.min}-{activePlan.nutritionTargets.calcium.max}mg</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">{t('dashboard.dietPlan.nutrition.iron')}</p>
                    <p className="font-medium">{activePlan.nutritionTargets.iron.min}-{activePlan.nutritionTargets.iron.max}mg</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">{t('dashboard.dietPlan.nutrition.folate')}</p>
                    <p className="font-medium">{activePlan.nutritionTargets.folate.min}-{activePlan.nutritionTargets.folate.max}mcg</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">{t('dashboard.dietPlan.nutrition.fiber')}</p>
                    <p className="font-medium">{activePlan.nutritionTargets.fiber.min}-{activePlan.nutritionTargets.fiber.max}g</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">{t('dashboard.dietPlan.nutrition.vitaminD')}</p>
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
                  {t('dashboard.dietPlan.hydration.title')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-blue-800">
                  {t('dashboard.dietPlan.hydration.description')}
                </p>
                <ul className="mt-2 space-y-1 text-sm text-blue-700">
                  {(t('dashboard.dietPlan.hydration.benefits', { returnObjects: true }) as string[]).map((benefit: string, idx: number) => (
                    <li key={idx}>• {benefit}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Foods to Avoid */}
            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="flex items-center text-red-900">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  {t('dashboard.dietPlan.foodsToAvoid.title')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="font-medium text-red-800 mb-2">{t('dashboard.dietPlan.foodsToAvoid.highRisk.title')}:</p>
                    <ul className="space-y-1 text-sm text-red-700">
                      {(t('dashboard.dietPlan.foodsToAvoid.highRisk.items', { returnObjects: true }) as string[]).map((item: string, idx: number) => (
                        <li key={idx}>• {item}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="font-medium text-red-800 mb-2">{t('dashboard.dietPlan.foodsToAvoid.limit.title')}:</p>
                    <ul className="space-y-1 text-sm text-red-700">
                      {(t('dashboard.dietPlan.foodsToAvoid.limit.items', { returnObjects: true }) as string[]).map((item: string, idx: number) => (
                        <li key={idx}>• {item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-8">
              <Apple className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600">No diet plan found. Please complete your profile setup.</p>
              <Link to="/onboarding">
                <Button className="mt-4">Complete Setup</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}