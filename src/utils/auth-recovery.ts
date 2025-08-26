import { auth, db } from '@/config/firebase'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { User, UserPreferences } from '@/types'

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

/**
 * Checks if a Firebase Auth user has a corresponding Firestore profile
 * and creates one if it doesn't exist
 */
export async function ensureUserProfile() {
  const firebaseUser = auth.currentUser
  
  if (!firebaseUser) {
    console.log('No authenticated user')
    return null
  }
  
  try {
    // Check if user document exists
    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid))
    
    if (userDoc.exists()) {
      console.log('User profile exists')
      return userDoc.data()
    }
    
    // Create missing profile
    console.log('Creating missing user profile for:', firebaseUser.email)
    
    const userData: Omit<User, 'id'> = {
      email: firebaseUser.email || '',
      name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
      isOnboarded: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      dateOfBirth: new Date(),
      preferences: defaultPreferences,
    }
    
    await setDoc(doc(db, 'users', firebaseUser.uid), userData)
    
    console.log('User profile created successfully')
    return userData
  } catch (error) {
    console.error('Error ensuring user profile:', error)
    throw error
  }
}

/**
 * Manually trigger profile recovery for the current user
 */
export async function recoverUserProfile() {
  try {
    const profile = await ensureUserProfile()
    
    if (profile) {
      // Reload the page to trigger auth state refresh
      window.location.reload()
    }
    
    return profile
  } catch (error) {
    console.error('Profile recovery failed:', error)
    throw error
  }
}