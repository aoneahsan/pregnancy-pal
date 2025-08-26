import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { 
  User as FirebaseUser, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth'
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore'
import { auth, db } from '@/config/firebase'
import { User, UserPreferences } from '@/types'

interface AuthState {
  user: User | null
  firebaseUser: FirebaseUser | null
  isLoading: boolean
  isInitialized: boolean
  
  // Actions
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, name: string) => Promise<void>
  signOut: () => Promise<void>
  updateUserProfile: (updates: Partial<User>) => Promise<void>
  setUser: (user: User | null) => void
  setFirebaseUser: (user: FirebaseUser | null) => void
  setLoading: (loading: boolean) => void
  setInitialized: (initialized: boolean) => void
  initialize: () => void
}

const defaultPreferences: UserPreferences = {
  notifications: {
    dailyTips: true,
    appointments: true,
    milestones: true,
    dietReminders: true,
  },
  units: {
    weight: 'kg',
    height: 'cm',
    temperature: 'C',
  },
  theme: 'system',
  language: 'en',
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set, get) => ({
        user: null,
        firebaseUser: null,
        isLoading: true,
        isInitialized: false,

        signIn: async (email: string, password: string) => {
          set({ isLoading: true })
          
          try {
            const { user: firebaseUser } = await signInWithEmailAndPassword(auth, email, password)
            
            // Get user data from Firestore
            const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid))
            if (userDoc.exists()) {
              const userData = userDoc.data() as Omit<User, 'id'>
              const user: User = {
                id: firebaseUser.uid,
                ...userData,
                createdAt: (userData.createdAt as any)?.toDate?.() || userData.createdAt || new Date(),
                updatedAt: (userData.updatedAt as any)?.toDate?.() || userData.updatedAt || new Date(),
                dateOfBirth: (userData.dateOfBirth as any)?.toDate?.() || userData.dateOfBirth || new Date(),
              }
              
              set({ 
                user, 
                firebaseUser, 
                isLoading: false 
              })
            } else {
              throw new Error('User profile not found')
            }
          } catch (error) {
            set({ isLoading: false })
            throw error
          }
        },

        signUp: async (email: string, password: string, name: string) => {
          set({ isLoading: true })
          
          try {
            const { user: firebaseUser } = await createUserWithEmailAndPassword(auth, email, password)
            
            // Update Firebase Auth profile
            await updateProfile(firebaseUser, { displayName: name })
            
            // Create user document in Firestore
            const userData: Omit<User, 'id'> = {
              email: firebaseUser.email || email,
              name,
              isOnboarded: false,
              createdAt: new Date(),
              updatedAt: new Date(),
              dateOfBirth: new Date(),
              preferences: defaultPreferences,
            }
            
            await setDoc(doc(db, 'users', firebaseUser.uid), userData)
            
            const user: User = {
              id: firebaseUser.uid,
              ...userData,
            }
            
            set({ 
              user, 
              firebaseUser, 
              isLoading: false 
            })
          } catch (error) {
            set({ isLoading: false })
            throw error
          }
        },

        signOut: async () => {
          set({ isLoading: true })
          
          try {
            await signOut(auth)
            set({ 
              user: null, 
              firebaseUser: null, 
              isLoading: false 
            })
          } catch (error) {
            set({ isLoading: false })
            throw error
          }
        },

        updateUserProfile: async (updates: Partial<User>) => {
          const { user, firebaseUser } = get()
          if (!user || !firebaseUser) throw new Error('No user signed in')

          set({ isLoading: true })

          try {
            const updatedUserData = {
              ...updates,
              updatedAt: new Date(),
            }

            await updateDoc(doc(db, 'users', firebaseUser.uid), updatedUserData)

            const updatedUser: User = {
              ...user,
              ...updates,
              updatedAt: new Date(),
            }

            set({ 
              user: updatedUser, 
              isLoading: false 
            })
          } catch (error) {
            set({ isLoading: false })
            throw error
          }
        },

        setUser: (user) => set({ user }),
        setFirebaseUser: (firebaseUser) => set({ firebaseUser }),
        setLoading: (isLoading) => set({ isLoading }),
        setInitialized: (isInitialized) => set({ isInitialized }),

        initialize: () => {
          const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            set({ isLoading: true })

            try {
              if (firebaseUser) {
                // Get user data from Firestore
                const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid))
                if (userDoc.exists()) {
                  const userData = userDoc.data() as Omit<User, 'id'>
                  const user: User = {
                    id: firebaseUser.uid,
                    ...userData,
                    createdAt: (userData.createdAt as any)?.toDate?.() || userData.createdAt || new Date(),
                    updatedAt: (userData.updatedAt as any)?.toDate?.() || userData.updatedAt || new Date(),
                    dateOfBirth: (userData.dateOfBirth as any)?.toDate?.() || userData.dateOfBirth || new Date(),
                  }
                  
                  set({ 
                    user, 
                    firebaseUser, 
                    isLoading: false,
                    isInitialized: true 
                  })
                } else {
                  // User exists in Auth but not in Firestore - clean up
                  await signOut(auth)
                  set({ 
                    user: null, 
                    firebaseUser: null, 
                    isLoading: false,
                    isInitialized: true 
                  })
                }
              } else {
                set({ 
                  user: null, 
                  firebaseUser: null, 
                  isLoading: false,
                  isInitialized: true 
                })
              }
            } catch (error) {
              console.error('Auth state change error:', error)
              set({ 
                user: null, 
                firebaseUser: null, 
                isLoading: false,
                isInitialized: true 
              })
            }
          })

          // Return cleanup function
          return unsubscribe
        },
      }),
      {
        name: 'pregnancy-pal-auth',
        partialize: (state) => ({
          // Only persist user data, not loading states
          user: state.user,
        }),
      }
    ),
    { name: 'auth-store' }
  )
)