import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Heart, Mail, Lock, Eye, EyeOff, ArrowLeft, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/hooks/use-toast'

// Validation schemas
const signInSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

const signUpSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

type SignInForm = z.infer<typeof signInSchema>
type SignUpForm = z.infer<typeof signUpSchema>

export const Route = createFileRoute('/auth')({
  component: AuthPage,
})

function AuthPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const { user, signIn, signUp, isLoading } = useAuthStore()
  
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      if (!user.isOnboarded) {
        navigate({ to: '/onboarding' })
      } else {
        navigate({ to: '/dashboard' })
      }
    }
  }, [user, navigate])

  const signInForm = useForm<SignInForm>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const signUpForm = useForm<SignUpForm>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  })

  const onSignIn = async (data: SignInForm) => {
    try {
      await signIn(data.email, data.password)
      toast({
        title: 'Welcome back!',
        description: 'You have successfully signed in.',
      })
    } catch (error: any) {
      console.error('Sign in error:', error)
      let errorMessage = 'An unexpected error occurred'
      
      if (error?.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email'
      } else if (error?.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password'
      } else if (error?.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address'
      } else if (error?.code === 'auth/invalid-credential') {
        errorMessage = 'Invalid email or password'
      } else if (error?.message) {
        errorMessage = error.message
      }
      
      toast({
        title: 'Sign in failed',
        description: errorMessage,
        variant: 'destructive',
      })
    }
  }

  const onSignUp = async (data: SignUpForm) => {
    try {
      await signUp(data.email, data.password, data.name)
      toast({
        title: 'Welcome to PregnancyPal!',
        description: 'Your account has been created successfully.',
      })
    } catch (error: any) {
      console.error('Sign up error:', error)
      let errorMessage = 'An unexpected error occurred'
      
      if (error?.code === 'auth/email-already-in-use') {
        errorMessage = 'An account already exists with this email'
      } else if (error?.code === 'auth/weak-password') {
        errorMessage = 'Password should be at least 6 characters'
      } else if (error?.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address'
      } else if (error?.message) {
        errorMessage = error.message
      }
      
      toast({
        title: 'Sign up failed',
        description: errorMessage,
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <Button
              variant="ghost"
              className="mb-4"
              onClick={() => navigate({ to: '/' })}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
            
            <div className="flex items-center justify-center">
              <Heart className="h-8 w-8 text-primary mr-2" />
              <h1 className="text-2xl font-bold">PregnancyPal</h1>
            </div>
            
            <div className="space-y-2">
              <h2 className="text-3xl font-bold">
                {mode === 'signin' ? 'Welcome back' : 'Create your account'}
              </h2>
              <p className="text-muted-foreground">
                {mode === 'signin' 
                  ? 'Sign in to continue your pregnancy journey' 
                  : 'Start your beautiful pregnancy journey with us'
                }
              </p>
            </div>
          </div>

          {/* Auth Form */}
          <Card>
            <CardHeader className="space-y-1">
              <CardTitle className="text-xl">
                {mode === 'signin' ? 'Sign in' : 'Sign up'}
              </CardTitle>
              <CardDescription>
                {mode === 'signin' 
                  ? 'Enter your credentials to access your account' 
                  : 'Create an account to get started'
                }
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {mode === 'signin' ? (
                <form onSubmit={signInForm.handleSubmit(onSignIn)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        className="pl-10"
                        {...signInForm.register('email')}
                      />
                    </div>
                    {signInForm.formState.errors.email && (
                      <p className="text-sm text-destructive">
                        {signInForm.formState.errors.email.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                        className="pl-10 pr-10"
                        {...signInForm.register('password')}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    {signInForm.formState.errors.password && (
                      <p className="text-sm text-destructive">
                        {signInForm.formState.errors.password.message}
                      </p>
                    )}
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      'Sign in'
                    )}
                  </Button>
                </form>
              ) : (
                <form onSubmit={signUpForm.handleSubmit(onSignUp)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      placeholder="Enter your full name"
                      {...signUpForm.register('name')}
                    />
                    {signUpForm.formState.errors.name && (
                      <p className="text-sm text-destructive">
                        {signUpForm.formState.errors.name.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="Enter your email"
                        className="pl-10"
                        {...signUpForm.register('email')}
                      />
                    </div>
                    {signUpForm.formState.errors.email && (
                      <p className="text-sm text-destructive">
                        {signUpForm.formState.errors.email.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Create a password"
                        className="pl-10 pr-10"
                        {...signUpForm.register('password')}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    {signUpForm.formState.errors.password && (
                      <p className="text-sm text-destructive">
                        {signUpForm.formState.errors.password.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Confirm your password"
                        className="pl-10 pr-10"
                        {...signUpForm.register('confirmPassword')}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    {signUpForm.formState.errors.confirmPassword && (
                      <p className="text-sm text-destructive">
                        {signUpForm.formState.errors.confirmPassword.message}
                      </p>
                    )}
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      'Create account'
                    )}
                  </Button>
                </form>
              )}
            </CardContent>
            
            <CardFooter>
              <div className="text-center w-full text-sm text-muted-foreground">
                {mode === 'signin' ? (
                  <>
                    Don't have an account?{' '}
                    <Button
                      variant="link"
                      className="p-0 h-auto font-semibold"
                      type="button"
                      onClick={() => {
                        setMode('signup')
                        signInForm.reset()
                      }}
                    >
                      Sign up
                    </Button>
                  </>
                ) : (
                  <>
                    Already have an account?{' '}
                    <Button
                      variant="link"
                      className="p-0 h-auto font-semibold"
                      type="button"
                      onClick={() => {
                        setMode('signin')
                        signUpForm.reset()
                      }}
                    >
                      Sign in
                    </Button>
                  </>
                )}
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Right Side - Decorative */}
      <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-pregnancy-pink-500 to-pregnancy-purple-500 items-center justify-center p-12">
        <div className="text-center text-white space-y-8 max-w-lg">
          <Heart className="h-20 w-20 mx-auto text-white/80" />
          
          <div className="space-y-4">
            <h3 className="text-3xl font-bold">
              Your pregnancy journey starts here
            </h3>
            <p className="text-pregnancy-pink-100 text-lg leading-relaxed">
              Join thousands of expecting mothers who trust PregnancyPal for personalized nutrition guidance and caring support throughout their beautiful journey to motherhood.
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-4 text-left">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 rounded-full bg-white/60 mt-2.5" />
              <p className="text-pregnancy-pink-100">Personalized meal plans for every trimester</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 rounded-full bg-white/60 mt-2.5" />
              <p className="text-pregnancy-pink-100">Expert-backed nutritional guidance</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 rounded-full bg-white/60 mt-2.5" />
              <p className="text-pregnancy-pink-100">Track your baby's development weekly</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}