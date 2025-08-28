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
  deleteDoc,
  updateDoc
} from 'firebase/firestore'
import { db } from '@/config/firebase'
import type { Appointment, AppointmentReminder } from '@/types'

interface AppointmentStore {
  appointments: Appointment[]
  upcomingAppointments: Appointment[]
  pastAppointments: Appointment[]
  isLoading: boolean
  error: string | null
  
  fetchAppointments: (userId: string) => Promise<void>
  createAppointment: (userId: string, appointment: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  updateAppointment: (appointmentId: string, updates: Partial<Appointment>) => Promise<void>
  deleteAppointment: (appointmentId: string) => Promise<void>
  cancelAppointment: (appointmentId: string) => Promise<void>
  rescheduleAppointment: (appointmentId: string, newDate: Date) => Promise<void>
  completeAppointment: (appointmentId: string, notes?: string) => Promise<void>
  addReminder: (appointmentId: string, reminder: AppointmentReminder) => Promise<void>
  clearAppointments: () => void
  generateSampleAppointments: (userId: string) => Promise<void>
}

export const useAppointmentStore = create<AppointmentStore>()(
  persist(
    (set, get) => ({
      appointments: [],
      upcomingAppointments: [],
      pastAppointments: [],
      isLoading: false,
      error: null,
      
      fetchAppointments: async (userId: string) => {
        set({ isLoading: true, error: null })
        try {
          const q = query(
            collection(db, 'appointments'),
            where('userId', '==', userId),
            orderBy('date', 'asc')
          )
          
          const querySnapshot = await getDocs(q)
          const appointments: Appointment[] = []
          const now = new Date()
          
          querySnapshot.forEach((doc) => {
            const data = doc.data()
            appointments.push({
              ...data,
              id: doc.id,
              date: data.date?.toDate() || new Date(),
              createdAt: data.createdAt?.toDate() || new Date(),
              updatedAt: data.updatedAt?.toDate() || new Date(),
              reminders: data.reminders?.map((r: any) => ({
                ...r,
                time: r.time?.toDate() || new Date(),
              })) || [],
            } as Appointment)
          })
          
          const upcoming = appointments.filter(a => a.date >= now && a.status === 'scheduled')
          const past = appointments.filter(a => a.date < now || a.status === 'completed')
          
          set({ 
            appointments,
            upcomingAppointments: upcoming,
            pastAppointments: past
          })
        } catch (error) {
          set({ error: (error as Error).message })
        } finally {
          set({ isLoading: false })
        }
      },
      
      createAppointment: async (userId: string, appointment) => {
        set({ isLoading: true, error: null })
        try {
          const newAppointment: Appointment = {
            ...appointment,
            id: crypto.randomUUID(),
            createdAt: new Date(),
            updatedAt: new Date(),
          }
          
          await setDoc(doc(db, 'appointments', newAppointment.id), newAppointment)
          
          set((state) => ({
            appointments: [...state.appointments, newAppointment],
            upcomingAppointments: newAppointment.status === 'scheduled' && newAppointment.date >= new Date()
              ? [...state.upcomingAppointments, newAppointment].sort((a, b) => a.date.getTime() - b.date.getTime())
              : state.upcomingAppointments
          }))
        } catch (error) {
          set({ error: (error as Error).message })
        } finally {
          set({ isLoading: false })
        }
      },
      
      updateAppointment: async (appointmentId: string, updates) => {
        set({ isLoading: true, error: null })
        try {
          await updateDoc(doc(db, 'appointments', appointmentId), {
            ...updates,
            updatedAt: new Date(),
          })
          
          set((state) => {
            const updatedAppointments = state.appointments.map(a =>
              a.id === appointmentId
                ? { ...a, ...updates, updatedAt: new Date() }
                : a
            )
            
            const now = new Date()
            const upcoming = updatedAppointments.filter(a => a.date >= now && a.status === 'scheduled')
            const past = updatedAppointments.filter(a => a.date < now || a.status === 'completed')
            
            return {
              appointments: updatedAppointments,
              upcomingAppointments: upcoming,
              pastAppointments: past,
            }
          })
        } catch (error) {
          set({ error: (error as Error).message })
        } finally {
          set({ isLoading: false })
        }
      },
      
      deleteAppointment: async (appointmentId: string) => {
        set({ isLoading: true, error: null })
        try {
          await deleteDoc(doc(db, 'appointments', appointmentId))
          
          set((state) => ({
            appointments: state.appointments.filter(a => a.id !== appointmentId),
            upcomingAppointments: state.upcomingAppointments.filter(a => a.id !== appointmentId),
            pastAppointments: state.pastAppointments.filter(a => a.id !== appointmentId),
          }))
        } catch (error) {
          set({ error: (error as Error).message })
        } finally {
          set({ isLoading: false })
        }
      },
      
      cancelAppointment: async (appointmentId: string) => {
        await get().updateAppointment(appointmentId, { status: 'cancelled' })
      },
      
      rescheduleAppointment: async (appointmentId: string, newDate: Date) => {
        await get().updateAppointment(appointmentId, { 
          date: newDate,
          status: 'rescheduled' 
        })
      },
      
      completeAppointment: async (appointmentId: string, notes?: string) => {
        const updates: Partial<Appointment> = { status: 'completed' }
        if (notes) updates.notes = notes
        await get().updateAppointment(appointmentId, updates)
      },
      
      addReminder: async (appointmentId: string, reminder: AppointmentReminder) => {
        const appointment = get().appointments.find(a => a.id === appointmentId)
        if (appointment) {
          const reminders = [...(appointment.reminders || []), reminder]
          await get().updateAppointment(appointmentId, { reminders })
        }
      },
      
      clearAppointments: () => {
        set({ appointments: [], upcomingAppointments: [], pastAppointments: [], error: null })
      },
      
      generateSampleAppointments: async (userId: string) => {
        const sampleAppointments = [
          {
            userId,
            title: 'Regular Prenatal Checkup',
            type: 'checkup' as const,
            provider: 'Dr. Sarah Johnson',
            location: 'Women\'s Health Clinic, 123 Main St',
            date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
            duration: 30,
            notes: 'Routine checkup, bring recent test results',
            reminders: [
              {
                time: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
                method: 'push' as const,
                sent: false
              }
            ],
            status: 'scheduled' as const,
          },
          {
            userId,
            title: '20-Week Ultrasound',
            type: 'ultrasound' as const,
            provider: 'Dr. Michael Chen',
            location: 'Imaging Center, 456 Oak Ave',
            date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
            duration: 45,
            notes: 'Anatomy scan, arrive with full bladder',
            reminders: [
              {
                time: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000),
                method: 'email' as const,
                sent: false
              }
            ],
            status: 'scheduled' as const,
          },
          {
            userId,
            title: 'Glucose Screening Test',
            type: 'test' as const,
            provider: 'Lab Services',
            location: 'Medical Lab, 789 Pine St',
            date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
            duration: 60,
            notes: 'Fast for 8 hours before test',
            reminders: [
              {
                time: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
                method: 'sms' as const,
                sent: false
              }
            ],
            status: 'scheduled' as const,
          },
          {
            userId,
            title: 'Prenatal Yoga Class',
            type: 'class' as const,
            provider: 'Wellness Center',
            location: 'Community Center, 321 Elm St',
            date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
            duration: 60,
            notes: 'Bring yoga mat and water bottle',
            reminders: [],
            status: 'scheduled' as const,
          },
        ]
        
        for (const appointment of sampleAppointments) {
          await get().createAppointment(userId, appointment)
        }
      },
    }),
    {
      name: 'appointments-storage',
      partialize: (state) => ({
        appointments: state.appointments,
        upcomingAppointments: state.upcomingAppointments,
        pastAppointments: state.pastAppointments,
      }),
    }
  )
)