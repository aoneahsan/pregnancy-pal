import { useAuthStore } from '@/stores/auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { recoverUserProfile } from '@/utils/auth-recovery'
import { useToast } from '@/hooks/use-toast'

export function AuthDebug() {
  const { user, firebaseUser, isLoading, isInitialized, signOut } = useAuthStore()
  const { toast } = useToast()
  
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
  
  return (
    <Card className="fixed bottom-4 right-4 w-96 shadow-lg z-50">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">Auth Debug</CardTitle>
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