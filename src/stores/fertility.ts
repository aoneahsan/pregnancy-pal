import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  limit
} from 'firebase/firestore'
import { db } from '@/config/firebase'

interface FertilityData {
  id: string
  userId: string
  date: Date
  temperature?: number // Basal body temperature
  cervicalMucus?: 'dry' | 'sticky' | 'creamy' | 'watery' | 'eggWhite'
  ovulationTest?: 'negative' | 'positive' | 'peak'
  symptoms?: string[]
  intercourse: boolean
  notes?: string
  createdAt: Date
  updatedAt: Date
}

interface FertilityWindow {
  startDate: Date
  endDate: Date
  ovulationDate: Date
  fertilityScore: number
  phase: 'menstrual' | 'follicular' | 'ovulation' | 'luteal'
}

interface FertilityStore {
  fertilityData: FertilityData[]
  currentWindow: FertilityWindow | null
  isLoading: boolean
  error: string | null
  
  fetchFertilityData: (userId: string, days?: number) => Promise<void>
  addFertilityData: (userId: string, data: Omit<FertilityData, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<void>
  updateFertilityData: (dataId: string, updates: Partial<FertilityData>) => Promise<void>
  calculateFertilityWindow: (cycleLength?: number) => void
  clearFertilityData: () => void
}

export const useFertilityStore = create<FertilityStore>()(
  persist(
    (set, get) => ({
      fertilityData: [],
      currentWindow: null,
      isLoading: false,
      error: null,
      
      fetchFertilityData: async (userId: string, days = 60) => {
        set({ isLoading: true, error: null })
        try {
          const startDate = new Date()
          startDate.setDate(startDate.getDate() - days)
          
          const q = query(
            collection(db, 'fertility'),
            where('userId', '==', userId),
            where('date', '>=', startDate),
            orderBy('date', 'desc'),
            limit(days)
          )
          
          const querySnapshot = await getDocs(q)
          const data: FertilityData[] = []
          
          querySnapshot.forEach((doc) => {
            const docData = doc.data()
            data.push({
              ...docData,
              id: doc.id,
              date: docData.date?.toDate() || new Date(),
              createdAt: docData.createdAt?.toDate() || new Date(),
              updatedAt: docData.updatedAt?.toDate() || new Date(),
            } as FertilityData)
          })
          
          set({ fertilityData: data })
          
          // Calculate fertility window based on data
          get().calculateFertilityWindow()
        } catch (error) {
          set({ error: (error as Error).message })
        } finally {
          set({ isLoading: false })
        }
      },
      
      addFertilityData: async (userId: string, data) => {
        set({ isLoading: true, error: null })
        try {
          const newData: FertilityData = {
            ...data,
            id: crypto.randomUUID(),
            userId,
            createdAt: new Date(),
            updatedAt: new Date(),
          }
          
          await setDoc(doc(db, 'fertility', newData.id), newData)
          
          set((state) => ({
            fertilityData: [newData, ...state.fertilityData].sort(
              (a, b) => b.date.getTime() - a.date.getTime()
            ),
          }))
          
          // Recalculate fertility window
          get().calculateFertilityWindow()
        } catch (error) {
          set({ error: (error as Error).message })
        } finally {
          set({ isLoading: false })
        }
      },
      
      updateFertilityData: async (dataId: string, updates) => {
        set({ isLoading: true, error: null })
        try {
          await setDoc(
            doc(db, 'fertility', dataId),
            {
              ...updates,
              updatedAt: new Date(),
            },
            { merge: true }
          )
          
          set((state) => ({
            fertilityData: state.fertilityData.map(d =>
              d.id === dataId
                ? { ...d, ...updates, updatedAt: new Date() }
                : d
            ),
          }))
          
          // Recalculate fertility window
          get().calculateFertilityWindow()
        } catch (error) {
          set({ error: (error as Error).message })
        } finally {
          set({ isLoading: false })
        }
      },
      
      calculateFertilityWindow: (cycleLength = 28) => {
        const { fertilityData } = get()
        
        // Find temperature spike to identify ovulation
        let ovulationDate: Date | null = null
        const temps = fertilityData
          .filter(d => d.temperature)
          .sort((a, b) => a.date.getTime() - b.date.getTime())
        
        // Look for temperature rise pattern (simplified)
        for (let i = 3; i < temps.length; i++) {
          const current = temps[i].temperature!
          const prev3Avg = (temps[i-1].temperature! + temps[i-2].temperature! + temps[i-3].temperature!) / 3
          
          if (current > prev3Avg + 0.2) { // 0.2°C rise indicates ovulation
            ovulationDate = temps[i].date
            break
          }
        }
        
        // If no ovulation detected from temp, estimate based on cycle
        if (!ovulationDate) {
          const today = new Date()
          const dayOfCycle = 14 // Assume ovulation on day 14 for a 28-day cycle
          ovulationDate = new Date(today)
          ovulationDate.setDate(today.getDate() - (cycleLength - dayOfCycle))
        }
        
        // Calculate fertile window (5 days before to 1 day after ovulation)
        const startDate = new Date(ovulationDate)
        startDate.setDate(ovulationDate.getDate() - 5)
        
        const endDate = new Date(ovulationDate)
        endDate.setDate(ovulationDate.getDate() + 1)
        
        // Determine current phase
        const today = new Date()
        const daysSinceOvulation = Math.floor((today.getTime() - ovulationDate.getTime()) / (1000 * 60 * 60 * 24))
        
        let phase: FertilityWindow['phase']
        let fertilityScore: number
        
        if (daysSinceOvulation < -5) {
          phase = 'follicular'
          fertilityScore = 30
        } else if (daysSinceOvulation >= -5 && daysSinceOvulation <= 1) {
          phase = 'ovulation'
          fertilityScore = daysSinceOvulation === 0 ? 100 : 85
        } else if (daysSinceOvulation > 1 && daysSinceOvulation <= 14) {
          phase = 'luteal'
          fertilityScore = 10
        } else {
          phase = 'menstrual'
          fertilityScore = 5
        }
        
        set({
          currentWindow: {
            startDate,
            endDate,
            ovulationDate,
            fertilityScore,
            phase,
          },
        })
      },
      
      clearFertilityData: () => {
        set({ fertilityData: [], currentWindow: null, error: null })
      },
    }),
    {
      name: 'fertility-storage',
      partialize: (state) => ({
        fertilityData: state.fertilityData,
        currentWindow: state.currentWindow,
      }),
    }
  )
)