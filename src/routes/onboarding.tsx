import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { Heart, ArrowRight, ArrowLeft, Calendar, Baby, AlertCircle, Apple } from 'lucide-react'
import { useAuthStore } from '@/stores/auth'
import { usePregnancyProfileStore } from '@/stores/pregnancy-profile'
import { useDietPlanStore } from '@/stores/diet-plan'
import { useToast } from '@/hooks/use-toast'
import { HealthCondition, DietaryRestriction } from '@/types'
import { PregnancyProfileService } from '@/services/pregnancy-profile.service'

export const Route = createFileRoute('/onboarding')({
  component: OnboardingPage,
})

// Form schemas for each step
const step1Schema = z.object({
  lastMenstrualPeriod: z.string().min(1, 'Last menstrual period is required'),
  babyCount: z.string().min(1, 'Number of babies is required'),
})

const step2Schema = z.object({
  isHighRisk: z.boolean(),
  complications: z.array(z.string()),
})

const step3Schema = z.object({
  healthConditions: z.array(z.string()),
  otherCondition: z.string().optional(),
})

const step4Schema = z.object({
  dietaryRestrictions: z.array(z.string()),
  otherRestriction: z.string().optional(),
})

type Step1Data = z.infer<typeof step1Schema>
type Step2Data = z.infer<typeof step2Schema>
type Step3Data = z.infer<typeof step3Schema>
type Step4Data = z.infer<typeof step4Schema>

function OnboardingPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const { user, updateUserProfile } = useAuthStore()
  const { createProfile } = usePregnancyProfileStore()
  const { generatePlan } = useDietPlanStore()
  
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    lastMenstrualPeriod: '',
    babyCount: '1',
    isHighRisk: false,
    complications: [] as string[],
    healthConditions: [] as string[],
    dietaryRestrictions: [] as string[],
  })

  // Step 1 Form
  const step1Form = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      lastMenstrualPeriod: formData.lastMenstrualPeriod,
      babyCount: formData.babyCount,
    }
  })

  // Step 2 Form
  const step2Form = useForm<Step2Data>({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      isHighRisk: formData.isHighRisk,
      complications: formData.complications,
    }
  })

  // Step 3 Form
  const step3Form = useForm<Step3Data>({
    resolver: zodResolver(step3Schema),
    defaultValues: {
      healthConditions: formData.healthConditions,
      otherCondition: '',
    }
  })

  // Step 4 Form
  const step4Form = useForm<Step4Data>({
    resolver: zodResolver(step4Schema),
    defaultValues: {
      dietaryRestrictions: formData.dietaryRestrictions,
      otherRestriction: '',
    }
  })

  const handleStep1Submit = (data: Step1Data) => {
    setFormData(prev => ({ ...prev, ...data }))
    setCurrentStep(2)
  }

  const handleStep2Submit = (data: Step2Data) => {
    setFormData(prev => ({ ...prev, ...data }))
    setCurrentStep(3)
  }

  const handleStep3Submit = (data: Step3Data) => {
    const conditions = [...data.healthConditions]
    if (data.otherCondition?.trim()) {
      conditions.push(data.otherCondition.trim())
    }
    setFormData(prev => ({ ...prev, healthConditions: conditions }))
    setCurrentStep(4)
  }

  const handleStep4Submit = async (data: Step4Data) => {
    if (!user) return

    setIsSubmitting(true)
    
    try {
      const restrictions = [...data.dietaryRestrictions]
      if (data.otherRestriction?.trim()) {
        restrictions.push(data.otherRestriction.trim())
      }

      // Create health conditions array
      const healthConditions: HealthCondition[] = formData.healthConditions.map((condition, index) => ({
        id: `hc-${index}`,
        name: condition,
        description: '',
        severity: 'medium' as const,
        dietaryRestrictions: [],
        recommendedNutrients: [],
        avoidNutrients: [],
      }))

      // Create dietary restrictions array
      const dietaryRestrictions: DietaryRestriction[] = restrictions.map((restriction, index) => ({
        id: `dr-${index}`,
        name: restriction,
        type: 'preference' as const,
        severity: 'moderate' as const,
        description: '',
        avoidFoods: [],
        alternatives: [],
      }))

      // Create pregnancy profile
      const profile = await createProfile({
        lastMenstrualPeriod: new Date(formData.lastMenstrualPeriod),
        babyCount: parseInt(formData.babyCount),
        isHighRisk: formData.isHighRisk,
        complications: formData.complications,
        healthConditions,
      })

      // Generate initial diet plan
      await generatePlan(profile, dietaryRestrictions)

      // Update user as onboarded
      await updateUserProfile({ isOnboarded: true })

      toast({
        title: 'Welcome to PregnancyPal!',
        description: 'Your personalized pregnancy journey begins now.',
      })

      navigate({ to: '/dashboard' })
    } catch (error) {
      console.error('Onboarding error:', error)
      toast({
        title: 'Setup Failed',
        description: 'There was an error setting up your profile. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const complicationOptions = [
    'Gestational Diabetes',
    'Hypertension',
    'Preeclampsia',
    'Anemia',
    'Thyroid Issues',
    'Previous Miscarriage',
    'Placenta Previa',
    'Multiple Pregnancies',
  ]

  const healthConditionOptions = [
    'Diabetes',
    'Heart Disease',
    'Asthma',
    'Thyroid Disorder',
    'PCOS',
    'Endometriosis',
    'Autoimmune Condition',
    'Mental Health Condition',
  ]

  const dietaryRestrictionOptions = [
    'Vegetarian',
    'Vegan',
    'Gluten-Free',
    'Dairy-Free',
    'Nut Allergy',
    'Seafood Allergy',
    'Halal',
    'Kosher',
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-pregnancy-pink-50 via-white to-pregnancy-purple-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Heart className="h-8 w-8 text-primary mr-2" />
              <h1 className="text-2xl font-bold">PregnancyPal</h1>
            </div>
            
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Let's Personalize Your Journey
            </h2>
            <p className="text-lg text-gray-600">
              Tell us about your pregnancy so we can provide the best guidance
            </p>
          </div>

          {/* Progress */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center space-x-2">
              {[1, 2, 3, 4].map((step) => (
                <div key={step} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      currentStep >= step
                        ? 'bg-primary text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {step}
                  </div>
                  {step < 4 && (
                    <div
                      className={`w-12 h-1 ${
                        currentStep > step ? 'bg-primary' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Step Content */}
          <Card>
            <CardHeader>
              <CardTitle>
                {currentStep === 1 && 'Pregnancy Details'}
                {currentStep === 2 && 'Medical History'}
                {currentStep === 3 && 'Health Conditions'}
                {currentStep === 4 && 'Dietary Preferences'}
              </CardTitle>
              <CardDescription>
                {currentStep === 1 && 'Basic information about your pregnancy'}
                {currentStep === 2 && 'Help us understand any special considerations'}
                {currentStep === 3 && 'Any existing health conditions we should know about?'}
                {currentStep === 4 && 'Your dietary preferences and restrictions'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Step 1: Pregnancy Details */}
              {currentStep === 1 && (
                <form onSubmit={step1Form.handleSubmit(handleStep1Submit)} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="lmp">
                      <Calendar className="inline h-4 w-4 mr-1" />
                      First Day of Last Menstrual Period
                    </Label>
                    <Input
                      id="lmp"
                      type="date"
                      {...step1Form.register('lastMenstrualPeriod')}
                      max={new Date().toISOString().split('T')[0]}
                    />
                    {step1Form.formState.errors.lastMenstrualPeriod && (
                      <p className="text-sm text-red-500">
                        {step1Form.formState.errors.lastMenstrualPeriod.message}
                      </p>
                    )}
                    {step1Form.watch('lastMenstrualPeriod') && (
                      <div className="mt-2 p-3 bg-pregnancy-pink-50 rounded-lg">
                        <p className="text-sm text-gray-600">
                          Current Week: <span className="font-medium">
                            {PregnancyProfileService.calculateCurrentWeek(new Date(step1Form.watch('lastMenstrualPeriod')))}
                          </span>
                        </p>
                        <p className="text-sm text-gray-600">
                          Estimated Due Date: <span className="font-medium">
                            {PregnancyProfileService.calculateDueDate(new Date(step1Form.watch('lastMenstrualPeriod'))).toLocaleDateString()}
                          </span>
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>
                      <Baby className="inline h-4 w-4 mr-1" />
                      Number of Babies
                    </Label>
                    <RadioGroup
                      value={step1Form.watch('babyCount')}
                      onValueChange={(value) => step1Form.setValue('babyCount', value)}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="1" id="single" />
                        <Label htmlFor="single">Single</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="2" id="twins" />
                        <Label htmlFor="twins">Twins</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="3" id="triplets" />
                        <Label htmlFor="triplets">Triplets or More</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <Button type="submit" className="w-full">
                    Continue
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </form>
              )}

              {/* Step 2: Medical History */}
              {currentStep === 2 && (
                <form onSubmit={step2Form.handleSubmit(handleStep2Submit)} className="space-y-6">
                  <div className="space-y-2">
                    <Label>
                      <AlertCircle className="inline h-4 w-4 mr-1" />
                      Is this considered a high-risk pregnancy?
                    </Label>
                    <RadioGroup
                      value={step2Form.watch('isHighRisk') ? 'yes' : 'no'}
                      onValueChange={(value) => step2Form.setValue('isHighRisk', value === 'yes')}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="no-risk" />
                        <Label htmlFor="no-risk">No</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="high-risk" />
                        <Label htmlFor="high-risk">Yes</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-2">
                    <Label>Any pregnancy complications? (Select all that apply)</Label>
                    <div className="space-y-2">
                      {complicationOptions.map((complication) => (
                        <div key={complication} className="flex items-center space-x-2">
                          <Checkbox
                            id={complication}
                            checked={step2Form.watch('complications').includes(complication)}
                            onCheckedChange={(checked) => {
                              const current = step2Form.watch('complications')
                              if (checked) {
                                step2Form.setValue('complications', [...current, complication])
                              } else {
                                step2Form.setValue('complications', current.filter(c => c !== complication))
                              }
                            }}
                          />
                          <Label htmlFor={complication} className="font-normal cursor-pointer">
                            {complication}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button type="button" variant="outline" onClick={goToPreviousStep} className="flex-1">
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back
                    </Button>
                    <Button type="submit" className="flex-1">
                      Continue
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </form>
              )}

              {/* Step 3: Health Conditions */}
              {currentStep === 3 && (
                <form onSubmit={step3Form.handleSubmit(handleStep3Submit)} className="space-y-6">
                  <div className="space-y-2">
                    <Label>Do you have any of these health conditions?</Label>
                    <div className="space-y-2">
                      {healthConditionOptions.map((condition) => (
                        <div key={condition} className="flex items-center space-x-2">
                          <Checkbox
                            id={condition}
                            checked={step3Form.watch('healthConditions').includes(condition)}
                            onCheckedChange={(checked) => {
                              const current = step3Form.watch('healthConditions')
                              if (checked) {
                                step3Form.setValue('healthConditions', [...current, condition])
                              } else {
                                step3Form.setValue('healthConditions', current.filter(c => c !== condition))
                              }
                            }}
                          />
                          <Label htmlFor={condition} className="font-normal cursor-pointer">
                            {condition}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="other-condition">Other condition (optional)</Label>
                    <Input
                      id="other-condition"
                      placeholder="Enter any other health condition..."
                      {...step3Form.register('otherCondition')}
                    />
                  </div>

                  <div className="flex gap-4">
                    <Button type="button" variant="outline" onClick={goToPreviousStep} className="flex-1">
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back
                    </Button>
                    <Button type="submit" className="flex-1">
                      Continue
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </form>
              )}

              {/* Step 4: Dietary Preferences */}
              {currentStep === 4 && (
                <form onSubmit={step4Form.handleSubmit(handleStep4Submit)} className="space-y-6">
                  <div className="space-y-2">
                    <Label>
                      <Apple className="inline h-4 w-4 mr-1" />
                      Dietary Preferences & Restrictions
                    </Label>
                    <div className="space-y-2">
                      {dietaryRestrictionOptions.map((restriction) => (
                        <div key={restriction} className="flex items-center space-x-2">
                          <Checkbox
                            id={restriction}
                            checked={step4Form.watch('dietaryRestrictions').includes(restriction)}
                            onCheckedChange={(checked) => {
                              const current = step4Form.watch('dietaryRestrictions')
                              if (checked) {
                                step4Form.setValue('dietaryRestrictions', [...current, restriction])
                              } else {
                                step4Form.setValue('dietaryRestrictions', current.filter(r => r !== restriction))
                              }
                            }}
                          />
                          <Label htmlFor={restriction} className="font-normal cursor-pointer">
                            {restriction}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="other-restriction">Other dietary restriction (optional)</Label>
                    <Input
                      id="other-restriction"
                      placeholder="Enter any other dietary restriction..."
                      {...step4Form.register('otherRestriction')}
                    />
                  </div>

                  <div className="flex gap-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={goToPreviousStep} 
                      className="flex-1"
                      disabled={isSubmitting}
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back
                    </Button>
                    <Button type="submit" className="flex-1" disabled={isSubmitting}>
                      {isSubmitting ? 'Setting up...' : 'Complete Setup'}
                      <Heart className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}