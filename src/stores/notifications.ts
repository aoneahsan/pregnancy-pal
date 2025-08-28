import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Notification } from '@/types'

interface NotificationStore {
  notifications: Notification[]
  unreadCount: number
  isOpen: boolean
  
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'isRead'>) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  deleteNotification: (id: string) => void
  clearAll: () => void
  togglePanel: () => void
  openPanel: () => void
  closePanel: () => void
  
  generateSampleNotifications: (userId: string) => void
}

export const useNotificationStore = create<NotificationStore>()(
  persist(
    (set, get) => ({
      notifications: [],
      unreadCount: 0,
      isOpen: false,
      
      addNotification: (notification) => {
        const newNotification: Notification = {
          ...notification,
          id: crypto.randomUUID(),
          createdAt: new Date(),
          isRead: false,
        }
        
        set((state) => ({
          notifications: [newNotification, ...state.notifications],
          unreadCount: state.unreadCount + 1,
        }))
      },
      
      markAsRead: (id) => {
        set((state) => {
          const notification = state.notifications.find(n => n.id === id)
          if (!notification || notification.isRead) return state
          
          return {
            notifications: state.notifications.map(n =>
              n.id === id ? { ...n, isRead: true, readAt: new Date() } : n
            ),
            unreadCount: Math.max(0, state.unreadCount - 1),
          }
        })
      },
      
      markAllAsRead: () => {
        set((state) => ({
          notifications: state.notifications.map(n => ({
            ...n,
            isRead: true,
            readAt: n.isRead ? n.readAt : new Date(),
          })),
          unreadCount: 0,
        }))
      },
      
      deleteNotification: (id) => {
        set((state) => {
          const notification = state.notifications.find(n => n.id === id)
          return {
            notifications: state.notifications.filter(n => n.id !== id),
            unreadCount: notification && !notification.isRead 
              ? Math.max(0, state.unreadCount - 1) 
              : state.unreadCount,
          }
        })
      },
      
      clearAll: () => {
        set({ notifications: [], unreadCount: 0 })
      },
      
      togglePanel: () => {
        set((state) => ({ isOpen: !state.isOpen }))
      },
      
      openPanel: () => {
        set({ isOpen: true })
      },
      
      closePanel: () => {
        set({ isOpen: false })
      },
      
      generateSampleNotifications: (userId) => {
        const samples: Omit<Notification, 'id' | 'createdAt' | 'isRead'>[] = [
          {
            userId,
            title: 'Upcoming Appointment',
            message: 'You have a prenatal checkup scheduled for tomorrow at 2:00 PM with Dr. Sarah Johnson',
            type: 'reminder',
            category: 'appointment',
            isImportant: true,
            actionUrl: '/appointments',
            actionText: 'View Details',
          },
          {
            userId,
            title: 'Week 20 Milestone! 🎉',
            message: "Congratulations! You're halfway through your pregnancy journey. Your baby is now the size of a banana!",
            type: 'milestone',
            category: 'milestone',
            isImportant: false,
          },
          {
            userId,
            title: 'Daily Nutrition Tip',
            message: 'Remember to include iron-rich foods in your diet today. Try spinach, lean meat, or fortified cereals.',
            type: 'info',
            category: 'tip',
            isImportant: false,
          },
          {
            userId,
            title: 'Track Your Symptoms',
            message: "You haven't logged your daily symptoms yet. Take a moment to record how you're feeling.",
            type: 'reminder',
            category: 'tracking',
            isImportant: false,
            actionUrl: '/tracking',
            actionText: 'Log Now',
          },
          {
            userId,
            title: 'New Diet Plan Available',
            message: 'Your personalized diet plan for the second trimester is ready!',
            type: 'success',
            category: 'diet',
            isImportant: true,
            actionUrl: '/diet-plan',
            actionText: 'View Plan',
          },
        ]
        
        samples.forEach((notification, index) => {
          setTimeout(() => {
            get().addNotification(notification)
          }, index * 100)
        })
      },
    }),
    {
      name: 'notification-storage',
      partialize: (state) => ({
        notifications: state.notifications,
        unreadCount: state.unreadCount,
      }),
    }
  )
)