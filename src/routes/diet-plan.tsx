import { createFileRoute, Link } from '@tanstack/react-router'
import { Apple, Heart, Clock, AlertTriangle, Droplet, TrendingUp, ArrowLeft } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useDietPlanStore } from '@/stores/diet-plan'
import { useAuthStore } from '@/stores/auth'
import { usePregnancyProfileStore } from '@/stores/pregnancy-profile'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

export const Route = createFileRoute('/diet-plan')({
  component: DietPlanPage,
})

function DietPlanPage() {
  const { t } = useTranslation()
  const { user } = useAuthStore()
  const { profile } = usePregnancyProfileStore()
  const { activePlan, fetchActivePlan } = useDietPlanStore()

  useEffect(() => {
    if (user?.id) {
      fetchActivePlan(user.id)
    }
  }, [user?.id, fetchActivePlan])

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