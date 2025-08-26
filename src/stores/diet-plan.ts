import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { DietPlan, DietaryRestriction, PregnancyProfile } from '@/types'
import { DietPlanService } from '@/services/diet-plan.service'

interface DietPlanState {
  activePlan: DietPlan | null
  allPlans: DietPlan[]
  isLoading: boolean
  error: string | null

  // Actions
  generatePlan: (profile: PregnancyProfile, restrictions?: DietaryRestriction[]) => Promise<DietPlan>
  fetchActivePlan: (userId: string) => Promise<void>
  fetchAllPlans: (userId: string) => Promise<void>
  setActivePlan: (planId: string) => Promise<void>
  updatePlan: (planId: string, updates: Partial<DietPlan>) => Promise<void>
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void
}

export const useDietPlanStore = create<DietPlanState>()(
  devtools(
    persist(
      (set, get) => ({
        activePlan: null,
        allPlans: [],
        isLoading: false,
        error: null,

        generatePlan: async (profile: PregnancyProfile, restrictions?: DietaryRestriction[]) => {
          set({ isLoading: true, error: null })
          
          try {
            const planData = DietPlanService.generateDefaultPlan(profile, restrictions)
            const plan = await DietPlanService.create(planData)
            
            const { allPlans } = get()
            set({ 
              activePlan: plan, 
              allPlans: [plan, ...allPlans],
              isLoading: false 
            })
            
            return plan
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to generate diet plan'
            set({ error: errorMessage, isLoading: false })
            throw error
          }
        },

        fetchActivePlan: async (userId: string) => {
          set({ isLoading: true, error: null })
          
          try {
            const plan = await DietPlanService.getActiveByUserId(userId)
            set({ activePlan: plan, isLoading: false })
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch active plan'
            set({ error: errorMessage, isLoading: false })
            throw error
          }
        },

        fetchAllPlans: async (userId: string) => {
          set({ isLoading: true, error: null })
          
          try {
            const plans = await DietPlanService.getAllByUserId(userId)
            const activePlan = plans.find(p => p.isActive) || null
            
            set({ 
              allPlans: plans, 
              activePlan,
              isLoading: false 
            })
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch diet plans'
            set({ error: errorMessage, isLoading: false })
            throw error
          }
        },

        setActivePlan: async (planId: string) => {
          const { allPlans } = get()
          const plan = allPlans.find(p => p.id === planId)
          
          if (!plan) {
            throw new Error('Plan not found')
          }

          set({ isLoading: true, error: null })
          
          try {
            await DietPlanService.setActive(plan.userId, planId)
            
            // Update local state
            const updatedPlans = allPlans.map(p => ({
              ...p,
              isActive: p.id === planId
            }))
            
            set({ 
              activePlan: plan,
              allPlans: updatedPlans,
              isLoading: false 
            })
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to set active plan'
            set({ error: errorMessage, isLoading: false })
            throw error
          }
        },

        updatePlan: async (planId: string, updates: Partial<DietPlan>) => {
          set({ isLoading: true, error: null })
          
          try {
            await DietPlanService.update(planId, updates)
            
            const { allPlans, activePlan } = get()
            const updatedPlans = allPlans.map(p => 
              p.id === planId ? { ...p, ...updates } : p
            )
            
            const updatedActivePlan = activePlan?.id === planId 
              ? { ...activePlan, ...updates }
              : activePlan
            
            set({ 
              allPlans: updatedPlans,
              activePlan: updatedActivePlan,
              isLoading: false 
            })
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to update plan'
            set({ error: errorMessage, isLoading: false })
            throw error
          }
        },

        setLoading: (isLoading) => set({ isLoading }),
        setError: (error) => set({ error }),
        clearError: () => set({ error: null }),
      }),
      {
        name: 'diet-plan',
        partialize: (state) => ({
          activePlan: state.activePlan,
          allPlans: state.allPlans,
        }),
      }
    ),
    { name: 'diet-plan-store' }
  )
)