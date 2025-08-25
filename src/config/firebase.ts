import { initializeApp } from 'firebase/app'
import { getAuth, connectAuthEmulator } from 'firebase/auth'
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore'
import { getStorage, connectStorageEmulator } from 'firebase/storage'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase services
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)

// Connect to emulators in development
if (import.meta.env.DEV) {
  const isDev = import.meta.env.MODE === 'development'
  
  // Only connect to emulators if not already connected
  if (isDev && !auth.config.emulator) {
    try {
      connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true })
    } catch (error) {
      console.warn('Failed to connect to Auth emulator:', error)
    }
  }

  if (isDev && !(db as any)._delegate._databaseId.projectId.includes('demo-')) {
    try {
      connectFirestoreEmulator(db, 'localhost', 8080)
    } catch (error) {
      console.warn('Failed to connect to Firestore emulator:', error)
    }
  }

  if (isDev && !storage._host.includes('localhost')) {
    try {
      connectStorageEmulator(storage, 'localhost', 9199)
    } catch (error) {
      console.warn('Failed to connect to Storage emulator:', error)
    }
  }
}

export default app