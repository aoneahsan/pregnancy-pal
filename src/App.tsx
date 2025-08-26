import { useEffect } from 'react'
import { createRouter, RouterProvider } from '@tanstack/react-router'
import { Toaster } from '@/components/ui/toaster'
import { useAuthStore } from '@/stores/auth'
import { AuthDebug } from '@/components/AuthDebug'

// Import the generated route tree
import { routeTree } from './routeTree.gen'

// Create a new router instance
const router = createRouter({ 
  routeTree,
  defaultPreload: 'intent',
  defaultPreloadStaleTime: 0,
})

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

function App() {
  const initialize = useAuthStore(state => state.initialize)

  useEffect(() => {
    // Initialize auth state listener
    const unsubscribe = initialize()
    return unsubscribe
  }, [initialize])

  return (
    <>
      <RouterProvider router={router} />
      <Toaster />
      <AuthDebug />
    </>
  )
}

export default App