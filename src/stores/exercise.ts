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

interface Exercise {
  id: string
  name: string
  category: 'yoga' | 'walking' | 'swimming' | 'strength' | 'cardio' | 'stretching'
  duration: number // in minutes
  intensity: 'low' | 'moderate' | 'high'
  trimesterSafe: [boolean, boolean, boolean] // [first, second, third]
  description: string
  benefits: string[]
  precautions?: string[]
  videoUrl?: string
}

interface ExerciseSession {
  id: string
  userId: string
  exerciseId: string
  exercise: Exercise
  date: Date
  duration: number // actual duration
  intensity: 'low' | 'moderate' | 'high'
  heartRate?: number
  caloriesBurned?: number
  notes?: string
  completed: boolean
  createdAt: Date
  updatedAt: Date
}

interface ExerciseGoal {
  weeklyMinutes: number
  dailyMinutes: number
  preferredActivities: string[]
}

interface ExerciseStore {
  exercises: Exercise[]
  sessions: ExerciseSession[]
  todayProgress: number // minutes completed today
  weekProgress: number // minutes completed this week
  goals: ExerciseGoal
  isLoading: boolean
  error: string | null
  
  fetchExercises: () => Promise<void>
  fetchSessions: (userId: string, days?: number) => Promise<void>
  startSession: (userId: string, exerciseId: string) => Promise<void>
  completeSession: (sessionId: string, data: { duration: number; notes?: string }) => Promise<void>
  updateGoals: (goals: Partial<ExerciseGoal>) => void
  calculateProgress: () => void
  getRecommendedExercises: (trimester: 1 | 2 | 3) => Exercise[]
  clearExerciseData: () => void
}

const defaultExercises: Exercise[] = [
  {
    id: '1',
    name: 'Prenatal Yoga',
    category: 'yoga',
    duration: 30,
    intensity: 'low',
    trimesterSafe: [true, true, true],
    description: 'Gentle yoga poses designed for pregnancy',
    benefits: ['Improves flexibility', 'Reduces stress', 'Prepares for labor', 'Reduces back pain'],
    precautions: ['Avoid deep twists', 'Skip inverted poses'],
  },
  {
    id: '2',
    name: 'Brisk Walking',
    category: 'walking',
    duration: 45,
    intensity: 'moderate',
    trimesterSafe: [true, true, true],
    description: 'Low-impact cardio exercise',
    benefits: ['Maintains cardiovascular fitness', 'Helps control weight gain', 'Boosts mood'],
    precautions: ['Wear supportive shoes', 'Stay hydrated'],
  },
  {
    id: '3',
    name: 'Swimming',
    category: 'swimming',
    duration: 30,
    intensity: 'moderate',
    trimesterSafe: [true, true, true],
    description: 'Full-body exercise with minimal joint stress',
    benefits: ['Works all muscle groups', 'Relieves swelling', 'Improves circulation'],
    precautions: ['Avoid hot tubs and saunas'],
  },
  {
    id: '4',
    name: 'Pelvic Floor Exercises',
    category: 'strength',
    duration: 15,
    intensity: 'low',
    trimesterSafe: [true, true, true],
    description: 'Strengthen pelvic floor muscles',
    benefits: ['Prevents incontinence', 'Supports growing baby', 'Aids in recovery'],
  },
  {
    id: '5',
    name: 'Prenatal Pilates',
    category: 'strength',
    duration: 30,
    intensity: 'moderate',
    trimesterSafe: [true, true, false],
    description: 'Core-strengthening exercises modified for pregnancy',
    benefits: ['Strengthens core', 'Improves posture', 'Reduces back pain'],
    precautions: ['Avoid exercises on back after first trimester'],
  },
]

export const useExerciseStore = create<ExerciseStore>()(
  persist(
    (set, get) => ({
      exercises: defaultExercises,
      sessions: [],
      todayProgress: 0,
      weekProgress: 0,
      goals: {
        weeklyMinutes: 150, // WHO recommendation
        dailyMinutes: 30,
        preferredActivities: ['yoga', 'walking'],
      },
      isLoading: false,
      error: null,
      
      fetchExercises: async () => {
        set({ isLoading: true, error: null })
        try {
          // In a real app, fetch from Firestore
          // For now, use default exercises
          set({ exercises: defaultExercises })
        } catch (error) {
          set({ error: (error as Error).message })
        } finally {
          set({ isLoading: false })
        }
      },
      
      fetchSessions: async (userId: string, days = 30) => {
        set({ isLoading: true, error: null })
        try {
          const startDate = new Date()
          startDate.setDate(startDate.getDate() - days)
          
          const q = query(
            collection(db, 'exercise_sessions'),
            where('userId', '==', userId),
            where('date', '>=', startDate),
            orderBy('date', 'desc'),
            limit(days * 3) // Assuming max 3 sessions per day
          )
          
          const querySnapshot = await getDocs(q)
          const sessions: ExerciseSession[] = []
          
          querySnapshot.forEach((doc) => {
            const data = doc.data()
            const exercise = get().exercises.find(e => e.id === data.exerciseId) || defaultExercises[0]
            
            sessions.push({
              ...data,
              id: doc.id,
              exercise,
              date: data.date?.toDate() || new Date(),
              createdAt: data.createdAt?.toDate() || new Date(),
              updatedAt: data.updatedAt?.toDate() || new Date(),
            } as ExerciseSession)
          })
          
          set({ sessions })
          get().calculateProgress()
        } catch (error) {
          set({ error: (error as Error).message })
        } finally {
          set({ isLoading: false })
        }
      },
      
      startSession: async (userId: string, exerciseId: string) => {
        set({ isLoading: true, error: null })
        try {
          const exercise = get().exercises.find(e => e.id === exerciseId)
          if (!exercise) throw new Error('Exercise not found')
          
          const newSession: ExerciseSession = {
            id: crypto.randomUUID(),
            userId,
            exerciseId,
            exercise,
            date: new Date(),
            duration: 0,
            intensity: exercise.intensity,
            completed: false,
            createdAt: new Date(),
            updatedAt: new Date(),
          }
          
          await setDoc(doc(db, 'exercise_sessions', newSession.id), newSession)
          
          set((state) => ({
            sessions: [newSession, ...state.sessions],
          }))
        } catch (error) {
          set({ error: (error as Error).message })
        } finally {
          set({ isLoading: false })
        }
      },
      
      completeSession: async (sessionId: string, data) => {
        set({ isLoading: true, error: null })
        try {
          const updates = {
            ...data,
            completed: true,
            updatedAt: new Date(),
          }
          
          await setDoc(
            doc(db, 'exercise_sessions', sessionId),
            updates,
            { merge: true }
          )
          
          set((state) => ({
            sessions: state.sessions.map(s =>
              s.id === sessionId
                ? { ...s, ...updates }
                : s
            ),
          }))
          
          get().calculateProgress()
        } catch (error) {
          set({ error: (error as Error).message })
        } finally {
          set({ isLoading: false })
        }
      },
      
      updateGoals: (goals) => {
        set((state) => ({
          goals: { ...state.goals, ...goals },
        }))
      },
      
      calculateProgress: () => {
        const { sessions } = get()
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        
        const weekStart = new Date(today)
        weekStart.setDate(today.getDate() - today.getDay())
        
        const todaySessions = sessions.filter(s => {
          const sessionDate = new Date(s.date)
          sessionDate.setHours(0, 0, 0, 0)
          return sessionDate.getTime() === today.getTime() && s.completed
        })
        
        const weekSessions = sessions.filter(s => {
          return s.date >= weekStart && s.completed
        })
        
        const todayMinutes = todaySessions.reduce((sum, s) => sum + s.duration, 0)
        const weekMinutes = weekSessions.reduce((sum, s) => sum + s.duration, 0)
        
        set({
          todayProgress: todayMinutes,
          weekProgress: weekMinutes,
        })
      },
      
      getRecommendedExercises: (trimester) => {
        const { exercises } = get()
        const trimesterIndex = trimester - 1
        
        return exercises.filter(e => e.trimesterSafe[trimesterIndex])
      },
      
      clearExerciseData: () => {
        set({ sessions: [], todayProgress: 0, weekProgress: 0, error: null })
      },
    }),
    {
      name: 'exercise-storage',
      partialize: (state) => ({
        sessions: state.sessions,
        goals: state.goals,
        todayProgress: state.todayProgress,
        weekProgress: state.weekProgress,
      }),
    }
  )
)