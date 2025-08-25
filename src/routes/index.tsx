import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { Heart, Baby, Apple, Calendar, Users, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/stores/auth'

export const Route = createFileRoute('/')({
  component: LandingPage,
})

function LandingPage() {
  const navigate = useNavigate()
  const { user, isLoading } = useAuthStore()

  useEffect(() => {
    if (user && !isLoading) {
      if (!user.isOnboarded) {
        navigate({ to: '/onboarding' })
      } else {
        navigate({ to: '/dashboard' })
      }
    }
  }, [user, isLoading, navigate])

  const features = [
    {
      icon: Apple,
      title: 'Personalized Nutrition',
      description: 'Get customized meal plans based on your pregnancy stage and health needs'
    },
    {
      icon: Calendar,
      title: 'Weekly Tracking',
      description: 'Monitor your pregnancy journey week by week with detailed insights'
    },
    {
      icon: Baby,
      title: 'Baby Development',
      description: 'Learn about your baby\'s growth and development at every stage'
    },
    {
      icon: Heart,
      title: 'Health Monitoring',
      description: 'Track symptoms, mood, and overall wellness throughout your pregnancy'
    },
    {
      icon: Users,
      title: 'Expert Support',
      description: 'Access evidence-based guidance from healthcare professionals'
    },
    {
      icon: Star,
      title: 'Milestone Celebrations',
      description: 'Celebrate important moments and milestones in your pregnancy'
    }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-pregnancy-pink-500/10 to-pregnancy-purple-500/10" />
        
        <div className="relative container mx-auto px-4 py-24 text-center">
          <div className="mx-auto max-w-4xl space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl font-bold text-gray-900 md:text-7xl">
                Your{' '}
                <span className="bg-gradient-to-r from-pregnancy-pink-500 to-pregnancy-purple-500 bg-clip-text text-transparent">
                  Pregnancy
                </span>{' '}
                Companion
              </h1>
              
              <p className="mx-auto max-w-2xl text-xl text-gray-600 md:text-2xl">
                A warm, nurturing companion that provides personalized daily nutrition guidance and gentle support throughout your beautiful journey to motherhood.
              </p>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button
                size="lg"
                className="h-14 px-8 text-lg"
                onClick={() => navigate({ to: '/auth' })}
              >
                Start Your Journey
                <Heart className="ml-2 h-5 w-5" />
              </Button>
              
              <Button
                size="lg"
                variant="outline"
                className="h-14 px-8 text-lg"
                onClick={() => {
                  document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })
                }}
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section id="features" className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything You Need for a Healthy Pregnancy
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our comprehensive platform combines expert guidance, personalized recommendations, and caring support to help you thrive during pregnancy.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group p-8 rounded-2xl border border-gray-200 bg-white hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="p-4 rounded-full bg-gradient-to-br from-pregnancy-pink-100 to-pregnancy-purple-100 group-hover:from-pregnancy-pink-200 group-hover:to-pregnancy-purple-200 transition-colors">
                    <feature.icon className="h-8 w-8 text-pregnancy-pink-600" />
                  </div>
                  
                  <h3 className="text-xl font-semibold text-gray-900">
                    {feature.title}
                  </h3>
                  
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-pregnancy-pink-500 to-pregnancy-purple-500">
        <div className="container mx-auto px-4 text-center">
          <div className="mx-auto max-w-4xl space-y-8">
            <h2 className="text-4xl font-bold text-white md:text-5xl">
              Ready to Begin Your Journey?
            </h2>
            
            <p className="text-xl text-pregnancy-pink-100 max-w-2xl mx-auto">
              Join thousands of expecting mothers who trust PregnancyPal for their pregnancy wellness journey.
            </p>
            
            <Button
              size="lg"
              variant="secondary"
              className="h-14 px-8 text-lg bg-white text-pregnancy-pink-600 hover:bg-gray-50"
              onClick={() => navigate({ to: '/auth' })}
            >
              Get Started Today
              <Heart className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}