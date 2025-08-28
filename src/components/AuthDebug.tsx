import { useState } from 'react'
import { useAuthStore } from '@/stores/auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { recoverUserProfile } from '@/utils/auth-recovery'
import { useToast } from '@/hooks/use-toast'
import { X, Minimize2, Bug } from 'lucide-react'

export function AuthDebug() {
  const { user, firebaseUser, isLoading, isInitialized, signOut } = useAuthStore()
  const { toast } = useToast()
  const [isMinimized, setIsMinimized] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  
  // Always show in development
  if (import.meta.env.PROD) {
    return null
  }
  
  const handleRecover = async () => {
    try {
      await recoverUserProfile()
      toast({
        title: 'Profile Recovery',
        description: 'Profile recovery attempted. Page will reload.',
      })
    } catch (error) {
      toast({
        title: 'Recovery Failed',
        description: 'Could not recover profile. Please try signing in again.',
        variant: 'destructive'
      })
    }
  }
  
  // If closed completely, show a small floating button to reopen
  if (!isVisible) {
    return (
      <Button
        size="sm"
        variant="secondary"
        className="fixed bottom-4 right-4 z-50 shadow-lg"
        onClick={() => {
          setIsVisible(true)
          setIsMinimized(false)
        }}
        title="Open Auth Debug"
      >
        <Bug className="h-4 w-4 mr-1" />
        Debug
      </Button>
    )
  }
  
  // If minimized, show a smaller version
  if (isMinimized) {
    return (
      <Card className="fixed bottom-4 right-4 shadow-lg z-50 cursor-pointer hover:shadow-xl transition-shadow"
        onClick={() => setIsMinimized(false)}
      >
        <CardHeader className="pb-2 pt-2 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Bug className="h-4 w-4" />
            <CardTitle className="text-sm">Auth Debug</CardTitle>
          </div>
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0"
            onClick={(e) => {
              e.stopPropagation()
              setIsVisible(false)
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
      </Card>
    )
  }
  
  return (
    <Card className="fixed bottom-4 right-4 w-96 shadow-lg z-50">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <CardTitle className="text-sm flex items-center gap-2">
          <Bug className="h-4 w-4" />
          Auth Debug
        </CardTitle>
        <div className="flex gap-1">
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0"
            onClick={() => setIsMinimized(true)}
            title="Minimize"
          >
            <Minimize2 className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0"
            onClick={() => setIsVisible(false)}
            title="Close"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="text-xs space-y-2">
        <div>
          <span className="font-semibold">Initialized:</span> {isInitialized ? 'Yes' : 'No'}
        </div>
        <div>
          <span className="font-semibold">Loading:</span> {isLoading ? 'Yes' : 'No'}
        </div>
        <div>
          <span className="font-semibold">User:</span> {user ? user.email : 'None'}
        </div>
        <div>
          <span className="font-semibold">Firebase User:</span> {firebaseUser ? firebaseUser.email : 'None'}
        </div>
        {user && (
          <div>
            <span className="font-semibold">Onboarded:</span> {user.isOnboarded ? 'Yes' : 'No'}
          </div>
        )}
        
        <div className="flex gap-2 mt-2">
          {firebaseUser && !user && (
            <Button 
              size="sm" 
              variant="secondary" 
              className="flex-1"
              onClick={handleRecover}
            >
              Recover Profile
            </Button>
          )}
          {user && (
            <Button 
              size="sm" 
              variant="destructive" 
              className="flex-1"
              onClick={() => signOut()}
            >
              Sign Out
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}