import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Heart, ArrowRight, ArrowLeft } from 'lucide-react'

export const Route = createFileRoute('/onboarding')({
  component: OnboardingPage,
})

function OnboardingPage() {
  const navigate = useNavigate()
  const [currentStep] = useState(1)

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
              Welcome to Your Journey
            </h2>
            <p className="text-lg text-gray-600">
              Let's set up your personalized pregnancy experience
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

          {/* Content */}
          <Card>
            <CardHeader>
              <CardTitle className="text-center">
                Let's Get Started
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center space-y-4">
                <div className="w-24 h-24 bg-gradient-to-br from-pregnancy-pink-100 to-pregnancy-purple-100 rounded-full flex items-center justify-center mx-auto">
                  <Heart className="h-12 w-12 text-pregnancy-pink-600" />
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">Tell Us About Your Pregnancy</h3>
                  <p className="text-gray-600">
                    We'll ask you a few questions to personalize your experience and provide the best guidance for your journey.
                  </p>
                </div>

                <div className="bg-pregnancy-pink-50 rounded-lg p-4">
                  <h4 className="font-medium text-pregnancy-pink-800 mb-2">
                    What we'll cover:
                  </h4>
                  <ul className="text-sm text-pregnancy-pink-700 space-y-1 text-left">
                    <li>• Your pregnancy timeline</li>
                    <li>• Health information and conditions</li>
                    <li>• Dietary preferences and restrictions</li>
                    <li>• Notification preferences</li>
                  </ul>
                </div>
              </div>

              <div className="flex justify-between pt-6">
                <Button
                  variant="outline"
                  onClick={() => navigate({ to: '/' })}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                
                <Button
                  onClick={() => navigate({ to: '/dashboard' })}
                >
                  Continue
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}