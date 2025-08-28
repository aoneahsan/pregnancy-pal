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
  limit,
  deleteDoc
} from 'firebase/firestore'
import { db } from '@/config/firebase'
import type { DailyTracking, Symptom, MoodEntry, Activity, Supplement } from '@/types'

interface TrackingStore {
  todayTracking: DailyTracking | null
  trackingHistory: DailyTracking[]
  isLoading: boolean
  error: string | null
  
  fetchTodayTracking: (userId: string) => Promise<void>
  fetchTrackingHistory: (userId: string, days?: number) => Promise<void>
  updateTodayTracking: (userId: string, updates: Partial<DailyTracking>) => Promise<void>
  addSymptom: (userId: string, symptom: Symptom) => Promise<void>
  updateMood: (userId: string, mood: MoodEntry) => Promise<void>
  addActivity: (userId: string, activity: Activity) => Promise<void>
  updateWaterIntake: (userId: string, amount: number) => Promise<void>
  addSupplement: (userId: string, supplement: Supplement) => Promise<void>
  updateWeight: (userId: string, weight: number) => Promise<void>
  clearTracking: () => void
}

const getToday = () => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return today
}

export const useTrackingStore = create<TrackingStore>()(
  persist(
    (set, get) => ({
      todayTracking: null,
      trackingHistory: [],
      isLoading: false,
      error: null,
      
      fetchTodayTracking: async (userId: string) => {
        set({ isLoading: true, error: null })
        try {
          const today = getToday()
          const docRef = doc(db, 'tracking', `${userId}_${today.toISOString().split('T')[0]}`)
          const docSnap = await getDoc(docRef)
          
          if (docSnap.exists()) {
            const data = docSnap.data()
            set({ 
              todayTracking: {
                ...data,
                id: docSnap.id,
                date: data.date?.toDate() || today,
                createdAt: data.createdAt?.toDate() || new Date(),
                updatedAt: data.updatedAt?.toDate() || new Date(),
              } as DailyTracking
            })
          } else {
            // Create empty tracking for today
            const newTracking: DailyTracking = {
              id: `${userId}_${today.toISOString().split('T')[0]}`,
              userId,
              date: today,
              symptoms: [],
              mood: { level: 3, emotions: [] },
              activities: [],
              mealsConsumed: [],
              waterIntake: 0,
              supplements: [],
              notes: '',
              createdAt: new Date(),
              updatedAt: new Date(),
            }
            
            await setDoc(docRef, newTracking)
            set({ todayTracking: newTracking })
          }
        } catch (error) {
          set({ error: (error as Error).message })
        } finally {
          set({ isLoading: false })
        }
      },
      
      fetchTrackingHistory: async (userId: string, days = 30) => {
        set({ isLoading: true, error: null })
        try {
          const startDate = new Date()
          startDate.setDate(startDate.getDate() - days)
          
          const q = query(
            collection(db, 'tracking'),
            where('userId', '==', userId),
            where('date', '>=', startDate),
            orderBy('date', 'desc'),
            limit(days)
          )
          
          const querySnapshot = await getDocs(q)
          const history: DailyTracking[] = []
          
          querySnapshot.forEach((doc) => {
            const data = doc.data()
            history.push({
              ...data,
              id: doc.id,
              date: data.date?.toDate() || new Date(),
              createdAt: data.createdAt?.toDate() || new Date(),
              updatedAt: data.updatedAt?.toDate() || new Date(),
            } as DailyTracking)
          })
          
          set({ trackingHistory: history })
        } catch (error) {
          set({ error: (error as Error).message })
        } finally {
          set({ isLoading: false })
        }
      },
      
      updateTodayTracking: async (userId: string, updates: Partial<DailyTracking>) => {
        const { todayTracking } = get()
        if (!todayTracking) {
          await get().fetchTodayTracking(userId)
        }
        
        const today = getToday()
        const docRef = doc(db, 'tracking', `${userId}_${today.toISOString().split('T')[0]}`)
        
        const updatedTracking = {
          ...todayTracking,
          ...updates,
          updatedAt: new Date(),
        }
        
        await setDoc(docRef, updatedTracking, { merge: true })
        set({ todayTracking: updatedTracking as DailyTracking })
      },
      
      addSymptom: async (userId: string, symptom: Symptom) => {
        const { todayTracking } = get()
        const symptoms = [...(todayTracking?.symptoms || []), symptom]
        await get().updateTodayTracking(userId, { symptoms })
      },
      
      updateMood: async (userId: string, mood: MoodEntry) => {
        await get().updateTodayTracking(userId, { mood })
      },
      
      addActivity: async (userId: string, activity: Activity) => {
        const { todayTracking } = get()
        const activities = [...(todayTracking?.activities || []), activity]
        await get().updateTodayTracking(userId, { activities })
      },
      
      updateWaterIntake: async (userId: string, amount: number) => {
        await get().updateTodayTracking(userId, { waterIntake: amount })
      },
      
      addSupplement: async (userId: string, supplement: Supplement) => {
        const { todayTracking } = get()
        const supplements = [...(todayTracking?.supplements || []), supplement]
        await get().updateTodayTracking(userId, { supplements })
      },
      
      updateWeight: async (userId: string, weight: number) => {
        await get().updateTodayTracking(userId, { weight })
      },
      
      clearTracking: () => {
        set({ todayTracking: null, trackingHistory: [], error: null })
      },
    }),
    {
      name: 'tracking-storage',
      partialize: (state) => ({
        todayTracking: state.todayTracking,
        trackingHistory: state.trackingHistory,
      }),
    }
  )
)