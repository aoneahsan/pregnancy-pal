import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  updateDoc,
  deleteDoc,
  Timestamp
} from 'firebase/firestore'
import { db } from '@/config/firebase'
import { PregnancyProfile } from '@/types'

const COLLECTION_NAME = 'pregnancyProfiles'

export class PregnancyProfileService {
  static async create(profile: Omit<PregnancyProfile, 'id' | 'createdAt' | 'updatedAt'>): Promise<PregnancyProfile> {
    const docRef = doc(collection(db, COLLECTION_NAME))
    const now = new Date()
    
    const newProfile: PregnancyProfile = {
      ...profile,
      id: docRef.id,
      createdAt: now,
      updatedAt: now,
    }

    await setDoc(docRef, {
      ...newProfile,
      lastMenstrualPeriod: Timestamp.fromDate(profile.lastMenstrualPeriod),
      expectedDueDate: Timestamp.fromDate(profile.expectedDueDate),
      createdAt: Timestamp.fromDate(now),
      updatedAt: Timestamp.fromDate(now),
    })

    return newProfile
  }

  static async getByUserId(userId: string): Promise<PregnancyProfile | null> {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    )

    const querySnapshot = await getDocs(q)
    
    if (querySnapshot.empty) {
      return null
    }

    const doc = querySnapshot.docs[0]
    const data = doc.data()

    return {
      ...data,
      id: doc.id,
      lastMenstrualPeriod: data.lastMenstrualPeriod?.toDate() || new Date(),
      expectedDueDate: data.expectedDueDate?.toDate() || new Date(),
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as PregnancyProfile
  }

  static async update(id: string, updates: Partial<PregnancyProfile>): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, id)
    
    const updateData: any = {
      ...updates,
      updatedAt: Timestamp.fromDate(new Date()),
    }

    if (updates.lastMenstrualPeriod) {
      updateData.lastMenstrualPeriod = Timestamp.fromDate(updates.lastMenstrualPeriod)
    }

    if (updates.expectedDueDate) {
      updateData.expectedDueDate = Timestamp.fromDate(updates.expectedDueDate)
    }

    delete updateData.id
    delete updateData.createdAt

    await updateDoc(docRef, updateData)
  }

  static async delete(id: string): Promise<void> {
    await deleteDoc(doc(db, COLLECTION_NAME, id))
  }

  static calculateCurrentWeek(lastMenstrualPeriod: Date): number {
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - lastMenstrualPeriod.getTime())
    const diffWeeks = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7))
    return Math.min(diffWeeks, 42) // Max 42 weeks
  }

  static calculateTrimester(weekNumber: number): 1 | 2 | 3 {
    if (weekNumber <= 12) return 1
    if (weekNumber <= 27) return 2
    return 3
  }

  static calculateDueDate(lastMenstrualPeriod: Date): Date {
    const dueDate = new Date(lastMenstrualPeriod)
    dueDate.setDate(dueDate.getDate() + 280) // 40 weeks = 280 days
    return dueDate
  }
}