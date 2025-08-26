import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Heart, Coffee, Pizza, Gift, Star, Crown, CreditCard, DollarSign } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { toast } from '@/hooks/use-toast'

interface DonationAmount {
  value: number
  label: string
  icon: React.ReactNode
  popular?: boolean
}

export function DonationPage() {
  const { t } = useTranslation()
  const [selectedAmount, setSelectedAmount] = useState<number>(10)
  const [customAmount, setCustomAmount] = useState('')
  const [isMonthly, setIsMonthly] = useState(false)
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('card')

  const donationAmounts: DonationAmount[] = [
    { value: 5, label: 'Coffee', icon: <Coffee className="h-4 w-4" /> },
    { value: 10, label: 'Lunch', icon: <Pizza className="h-4 w-4" />, popular: true },
    { value: 25, label: 'Gift', icon: <Gift className="h-4 w-4" /> },
    { value: 50, label: 'Premium', icon: <Star className="h-4 w-4" /> },
    { value: 100, label: 'Champion', icon: <Crown className="h-4 w-4" /> },
  ]

  const handleDonate = async () => {
    const amount = customAmount ? parseFloat(customAmount) : selectedAmount
    
    if (amount < 1) {
      toast({
        title: 'Invalid Amount',
        description: 'Please enter an amount of at least $1',
        variant: 'destructive',
      })
      return
    }

    // Here you would integrate with a payment processor like Stripe
    toast({
      title: 'Thank You! 💝',
      description: `Your ${isMonthly ? 'monthly' : 'one-time'} donation of $${amount} helps keep PregnancyPal free for everyone.`,
    })

    // In production, redirect to payment processor
    console.log('Processing donation:', { amount, isMonthly, paymentMethod, isAnonymous })
  }

  const impactStatements = [
    { number: '1M+', label: 'Women Helped', icon: '👩' },
    { number: '50+', label: 'Countries', icon: '🌍' },
    { number: '100%', label: 'Free Forever', icon: '💝' },
    { number: '24/7', label: 'Support', icon: '🤝' },
  ]

  const donorBenefits = [
    'Early access to new features',
    'Priority customer support',
    'Exclusive community badge',
    'Monthly impact reports',
    'Vote on new features',
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full mb-4">
            <Heart className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-4">{t('donation.title')}</h1>
          <p className="text-xl text-gray-600 mb-2">{t('donation.subtitle')}</p>
          <p className="text-lg text-gray-700 max-w-3xl mx-auto">
            {t('donation.message')}
          </p>
        </div>

        {/* Impact Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {impactStatements.map((stat) => (
            <Card key={stat.label} className="text-center">
              <CardContent className="pt-6">
                <div className="text-3xl mb-2">{stat.icon}</div>
                <div className="text-2xl font-bold text-primary">{stat.number}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Donation Form */}
          <Card>
            <CardHeader>
              <CardTitle>{t('donation.amounts.title')}</CardTitle>
              <CardDescription>Every contribution makes a difference</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Frequency Toggle */}
              <div className="flex justify-center space-x-4">
                <Button
                  variant={!isMonthly ? 'default' : 'outline'}
                  onClick={() => setIsMonthly(false)}
                >
                  {t('donation.amounts.oneTime')}
                </Button>
                <Button
                  variant={isMonthly ? 'default' : 'outline'}
                  onClick={() => setIsMonthly(true)}
                >
                  {t('donation.amounts.monthly')}
                  <Badge className="ml-2" variant="secondary">Save 20%</Badge>
                </Button>
              </div>

              {/* Preset Amounts */}
              <div className="grid grid-cols-3 gap-3">
                {donationAmounts.map((amount) => (
                  <Button
                    key={amount.value}
                    variant={selectedAmount === amount.value && !customAmount ? 'default' : 'outline'}
                    className="relative"
                    onClick={() => {
                      setSelectedAmount(amount.value)
                      setCustomAmount('')
                    }}
                  >
                    {amount.popular && (
                      <Badge className="absolute -top-2 -right-2" variant="default">
                        Popular
                      </Badge>
                    )}
                    <div className="flex flex-col items-center">
                      {amount.icon}
                      <span className="text-lg font-semibold">${amount.value}</span>
                      <span className="text-xs text-gray-500">{amount.label}</span>
                    </div>
                  </Button>
                ))}
              </div>

              {/* Custom Amount */}
              <div>
                <Label htmlFor="custom-amount">{t('donation.amounts.custom')}</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input
                    id="custom-amount"
                    type="number"
                    placeholder="Enter amount"
                    className="pl-10"
                    value={customAmount}
                    onChange={(e) => {
                      setCustomAmount(e.target.value)
                      setSelectedAmount(0)
                    }}
                  />
                </div>
              </div>

              {/* Payment Methods */}
              <div>
                <Label>{t('donation.methods.title')}</Label>
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center space-x-2 border rounded-lg p-3">
                      <RadioGroupItem value="card" id="card" />
                      <Label htmlFor="card" className="cursor-pointer flex items-center">
                        <CreditCard className="mr-2 h-4 w-4" />
                        {t('donation.methods.card')}
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 border rounded-lg p-3">
                      <RadioGroupItem value="paypal" id="paypal" />
                      <Label htmlFor="paypal" className="cursor-pointer">
                        {t('donation.methods.paypal')}
                      </Label>
                    </div>
                  </div>
                </RadioGroup>
              </div>

              {/* Anonymous Option */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="anonymous"
                  checked={isAnonymous}
                  onCheckedChange={(checked) => setIsAnonymous(checked as boolean)}
                />
                <Label htmlFor="anonymous" className="cursor-pointer">
                  {t('donation.anonymous')}
                </Label>
              </div>

              {/* Donate Button */}
              <Button 
                onClick={handleDonate} 
                size="lg" 
                className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
              >
                <Heart className="mr-2 h-5 w-5" />
                Donate ${customAmount || selectedAmount} {isMonthly && 'Monthly'}
              </Button>

              {/* Security Note */}
              <p className="text-xs text-center text-gray-500">
                🔒 {t('donation.secure')}
              </p>
            </CardContent>
          </Card>

          {/* Why Donate Section */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('donation.why.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {(t('donation.why.items', { returnObjects: true }) as string[]).map((item: string, index: number) => (
                    <li key={index} className="flex items-start">
                      <Heart className="h-5 w-5 text-pink-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-pink-50">
              <CardHeader>
                <CardTitle>Donor Benefits</CardTitle>
                <CardDescription>As a thank you for your support</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {donorBenefits.map((benefit) => (
                    <li key={benefit} className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-500 mr-2" />
                      <span className="text-sm">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">
                    {t('donation.tax')}
                  </p>
                  <p className="text-xs text-gray-500">
                    Tax ID: 12-3456789 (PregnancyPal Foundation)
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Thank You Message */}
        <Card className="mt-12 bg-gradient-to-r from-pink-500 to-purple-500 text-white">
          <CardContent className="text-center py-8">
            <h3 className="text-2xl font-bold mb-3">Every Dollar Counts</h3>
            <p className="text-lg opacity-95 max-w-2xl mx-auto">
              Your generosity directly impacts millions of women worldwide who rely on PregnancyPal 
              for their health journey. Together, we're making healthcare accessible to everyone.
            </p>
            <div className="mt-6 flex justify-center space-x-4">
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                100% Transparent
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                Monthly Reports
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                Direct Impact
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}