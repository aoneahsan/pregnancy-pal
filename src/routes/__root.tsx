import { createRootRoute, Outlet, useRouterState } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import { Loader2 } from 'lucide-react'

export const Route = createRootRoute({
  component: RootComponent,
})

function RootComponent() {
  const routerState = useRouterState()
  const isLoading = routerState.status === 'pending'

  return (
    <div className="min-h-screen bg-gradient-to-br from-pregnancy-pink-50 via-white to-pregnancy-purple-50">
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-lg font-medium text-muted-foreground">Loading...</p>
          </div>
        </div>
      )}
      
      <Outlet />
      
      {import.meta.env.DEV && <TanStackRouterDevtools />}
    </div>
  )
}