import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { 
  PeriodEntry, 
  CycleData, 
  CyclePrediction, 
  CycleStatistics,
  FertilityData,
  FlowIntensity,
  PeriodSymptom,
  MoodEntry
} from '@/types/period'
import { PeriodService } from '@/services/period.service'

interface PeriodState {
  activePeriod: PeriodEntry | null
  periodHistory: PeriodEntry[]
  currentCycle: CycleData | null
  cycleHistory: CycleData[]
  predictions: CyclePrediction | null
  statistics: CycleStatistics | null
  fertilityData: FertilityData[]
  isLoading: boolean
  error: string | null

  // Actions
  startPeriod: (date: Date) => Promise<void>
  endPeriod: (date: Date) => Promise<void>
  fetchPeriodData: (userId: string) => Promise<void>
  fetchCycleData: (userId: string) => Promise<void>
  fetchPredictions: (userId: string) => Promise<void>
  fetchStatistics: (userId: string) => Promise<void>
  logFlowIntensity: (intensity: FlowIntensity) => Promise<void>
  logSymptom: (symptom: PeriodSymptom) => Promise<void>
  logMood: (mood: MoodEntry) => Promise<void>
  logFertilityData: (data: Omit<FertilityData, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void
}

export const usePeriodStore = create<PeriodState>()(
  devtools(
    persist(
      (set, get) => ({
        activePeriod: null,
        periodHistory: [],
        currentCycle: null,
        cycleHistory: [],
        predictions: null,
        statistics: null,
        fertilityData: [],
        isLoading: false,
        error: null,

        startPeriod: async (date: Date) => {
          set({ isLoading: true, error: null })
          
          try {
            const userId = get().activePeriod?.userId || localStorage.getItem('userId')
            if (!userId) throw new Error('User ID not found')

            const period = await PeriodService.startPeriod(userId, date)
            set({ 
              activePeriod: period, 
              isLoading: false 
            })

            // Refresh cycle data and predictions
            await get().fetchCycleData(userId)
            await get().fetchPredictions(userId)
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to start period'
            set({ error: errorMessage, isLoading: false })
            throw error
          }
        },

        endPeriod: async (date: Date) => {
          set({ isLoading: true, error: null })
          
          try {
            const userId = get().activePeriod?.userId || localStorage.getItem('userId')
            if (!userId) throw new Error('User ID not found')

            await PeriodService.endPeriod(userId, date)
            set({ 
              activePeriod: null, 
              isLoading: false 
            })

            // Refresh data
            await get().fetchPeriodData(userId)
            await get().fetchCycleData(userId)
            await get().fetchPredictions(userId)
            await get().fetchStatistics(userId)
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to end period'
            set({ error: errorMessage, isLoading: false })
            throw error
          }
        },

        fetchPeriodData: async (userId: string) => {
          set({ isLoading: true, error: null })
          
          try {
            const [activePeriod, periodHistory] = await Promise.all([
              PeriodService.getActivePeriod(userId),
              PeriodService.getPeriodHistory(userId)
            ])

            set({ 
              activePeriod,
              periodHistory,
              isLoading: false 
            })
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch period data'
            set({ error: errorMessage, isLoading: false })
            throw error
          }
        },

        fetchCycleData: async (userId: string) => {
          set({ isLoading: true, error: null })
          
          try {
            const [currentCycle, cycleHistory] = await Promise.all([
              PeriodService.getCurrentCycle(userId),
              PeriodService.getCycleHistory(userId)
            ])

            set({ 
              currentCycle,
              cycleHistory,
              isLoading: false 
            })
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch cycle data'
            set({ error: errorMessage, isLoading: false })
            throw error
          }
        },

        fetchPredictions: async (userId: string) => {
          set({ isLoading: true, error: null })
          
          try {
            const predictions = await PeriodService.predictNextCycle(userId)
            set({ 
              predictions,
              isLoading: false 
            })
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch predictions'
            set({ error: errorMessage, isLoading: false })
            throw error
          }
        },

        fetchStatistics: async (userId: string) => {
          set({ isLoading: true, error: null })
          
          try {
            const statistics = await PeriodService.getCycleStatistics(userId)
            set({ 
              statistics,
              isLoading: false 
            })
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch statistics'
            set({ error: errorMessage, isLoading: false })
            throw error
          }
        },

        logFlowIntensity: async (intensity: FlowIntensity) => {
          const { activePeriod } = get()
          if (!activePeriod) {
            throw new Error('No active period to log flow intensity')
          }

          set({ isLoading: true, error: null })
          
          try {
            // This would update the period entry in Firestore
            // For now, we'll update local state
            const updatedPeriod = {
              ...activePeriod,
              flowIntensity: [...activePeriod.flowIntensity, intensity],
              updatedAt: new Date()
            }

            set({ 
              activePeriod: updatedPeriod,
              isLoading: false 
            })
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to log flow intensity'
            set({ error: errorMessage, isLoading: false })
            throw error
          }
        },

        logSymptom: async (symptom: PeriodSymptom) => {
          const { activePeriod } = get()
          if (!activePeriod) {
            throw new Error('No active period to log symptom')
          }

          set({ isLoading: true, error: null })
          
          try {
            const updatedPeriod = {
              ...activePeriod,
              symptoms: [...activePeriod.symptoms, symptom],
              updatedAt: new Date()
            }

            set({ 
              activePeriod: updatedPeriod,
              isLoading: false 
            })
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to log symptom'
            set({ error: errorMessage, isLoading: false })
            throw error
          }
        },

        logMood: async (mood: MoodEntry) => {
          const { activePeriod } = get()
          if (!activePeriod) {
            throw new Error('No active period to log mood')
          }

          set({ isLoading: true, error: null })
          
          try {
            const updatedPeriod = {
              ...activePeriod,
              mood: [...activePeriod.mood, mood],
              updatedAt: new Date()
            }

            set({ 
              activePeriod: updatedPeriod,
              isLoading: false 
            })
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to log mood'
            set({ error: errorMessage, isLoading: false })
            throw error
          }
        },

        logFertilityData: async (data: Omit<FertilityData, 'id' | 'createdAt' | 'updatedAt'>) => {
          set({ isLoading: true, error: null })
          
          try {
            const fertilityEntry = await PeriodService.logFertilityData(data)
            const { fertilityData } = get()
            
            set({ 
              fertilityData: [...fertilityData, fertilityEntry],
              isLoading: false 
            })

            // Refresh cycle data as ovulation might be detected
            await get().fetchCycleData(data.userId)
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to log fertility data'
            set({ error: errorMessage, isLoading: false })
            throw error
          }
        },

        setLoading: (isLoading) => set({ isLoading }),
        setError: (error) => set({ error }),
        clearError: () => set({ error: null })
      }),
      {
        name: 'period-tracking',
        partialize: (state) => ({
          activePeriod: state.activePeriod,
          periodHistory: state.periodHistory.slice(0, 3), // Only persist last 3 for performance
          currentCycle: state.currentCycle,
          predictions: state.predictions
        })
      }
    ),
    { name: 'period-store' }
  )
)