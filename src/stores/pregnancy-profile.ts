import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { PregnancyProfile, HealthCondition } from '@/types'
import { PregnancyProfileService } from '@/services/pregnancy-profile.service'
import { useAuthStore } from './auth'

interface PregnancyProfileState {
  profile: PregnancyProfile | null
  isLoading: boolean
  error: string | null

  // Actions
  createProfile: (data: {
    lastMenstrualPeriod: Date
    babyCount: number
    isHighRisk: boolean
    complications: string[]
    healthConditions: HealthCondition[]
  }) => Promise<PregnancyProfile>
  
  fetchProfile: (userId: string) => Promise<void>
  updateProfile: (updates: Partial<PregnancyProfile>) => Promise<void>
  deleteProfile: () => Promise<void>
  setProfile: (profile: PregnancyProfile | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void
}

export const usePregnancyProfileStore = create<PregnancyProfileState>()(
  devtools(
    persist(
      (set, get) => ({
        profile: null,
        isLoading: false,
        error: null,

        createProfile: async (data) => {
          set({ isLoading: true, error: null })
          
          try {
            // Get userId from auth store
            const authStore = useAuthStore.getState()
            const userId = authStore.user?.id
            if (!userId) {
              throw new Error('User ID is required to create a profile')
            }

            const currentWeek = PregnancyProfileService.calculateCurrentWeek(data.lastMenstrualPeriod)
            const currentTrimester = PregnancyProfileService.calculateTrimester(currentWeek)
            const expectedDueDate = PregnancyProfileService.calculateDueDate(data.lastMenstrualPeriod)

            const profile = await PregnancyProfileService.create({
              userId,
              lastMenstrualPeriod: data.lastMenstrualPeriod,
              expectedDueDate,
              currentWeek,
              currentTrimester,
              babyCount: data.babyCount,
              isHighRisk: data.isHighRisk,
              complications: data.complications,
              healthConditions: data.healthConditions,
            })

            set({ profile, isLoading: false })
            return profile
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to create profile'
            set({ error: errorMessage, isLoading: false })
            throw error
          }
        },

        fetchProfile: async (userId: string) => {
          set({ isLoading: true, error: null })
          
          try {
            const profile = await PregnancyProfileService.getByUserId(userId)
            
            if (profile) {
              // Update current week and trimester
              const currentWeek = PregnancyProfileService.calculateCurrentWeek(profile.lastMenstrualPeriod)
              const currentTrimester = PregnancyProfileService.calculateTrimester(currentWeek)
              
              if (currentWeek !== profile.currentWeek || currentTrimester !== profile.currentTrimester) {
                await PregnancyProfileService.update(profile.id, {
                  currentWeek,
                  currentTrimester,
                })
                
                profile.currentWeek = currentWeek
                profile.currentTrimester = currentTrimester
              }
            }
            
            set({ profile, isLoading: false })
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch profile'
            set({ error: errorMessage, isLoading: false })
            throw error
          }
        },

        updateProfile: async (updates: Partial<PregnancyProfile>) => {
          const { profile } = get()
          if (!profile) {
            throw new Error('No profile to update')
          }

          set({ isLoading: true, error: null })
          
          try {
            await PregnancyProfileService.update(profile.id, updates)
            
            // Recalculate derived values if LMP changed
            if (updates.lastMenstrualPeriod) {
              updates.currentWeek = PregnancyProfileService.calculateCurrentWeek(updates.lastMenstrualPeriod)
              updates.currentTrimester = PregnancyProfileService.calculateTrimester(updates.currentWeek)
              updates.expectedDueDate = PregnancyProfileService.calculateDueDate(updates.lastMenstrualPeriod)
            }
            
            const updatedProfile = { ...profile, ...updates }
            set({ profile: updatedProfile, isLoading: false })
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to update profile'
            set({ error: errorMessage, isLoading: false })
            throw error
          }
        },

        deleteProfile: async () => {
          const { profile } = get()
          if (!profile) {
            throw new Error('No profile to delete')
          }

          set({ isLoading: true, error: null })
          
          try {
            await PregnancyProfileService.delete(profile.id)
            set({ profile: null, isLoading: false })
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to delete profile'
            set({ error: errorMessage, isLoading: false })
            throw error
          }
        },

        setProfile: (profile) => set({ profile }),
        setLoading: (isLoading) => set({ isLoading }),
        setError: (error) => set({ error }),
        clearError: () => set({ error: null }),
      }),
      {
        name: 'pregnancy-profile',
        partialize: (state) => ({
          profile: state.profile,
        }),
      }
    ),
    { name: 'pregnancy-profile-store' }
  )
)