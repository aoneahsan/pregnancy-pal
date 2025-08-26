import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  updateDoc,
  Timestamp,
  limit as firestoreLimit
} from 'firebase/firestore'
import { db } from '@/config/firebase'
import { 
  PeriodEntry, 
  CycleData, 
  CyclePrediction, 
  CycleStatistics,
  FertilityData
} from '@/types/period'

export class PeriodService {
  private static readonly PERIOD_COLLECTION = 'periods'
  private static readonly CYCLE_COLLECTION = 'cycles'
  private static readonly FERTILITY_COLLECTION = 'fertility'

  // Period Management
  static async startPeriod(userId: string, startDate: Date): Promise<PeriodEntry> {
    // Check if there's an active period
    const activePeriod = await this.getActivePeriod(userId)
    if (activePeriod) {
      throw new Error('There is already an active period. Please end it first.')
    }

    const docRef = doc(collection(db, this.PERIOD_COLLECTION))
    const now = new Date()
    
    const newPeriod: PeriodEntry = {
      id: docRef.id,
      userId,
      startDate,
      isActive: true,
      flowIntensity: [],
      symptoms: [],
      mood: [],
      createdAt: now,
      updatedAt: now
    }

    await setDoc(docRef, {
      ...newPeriod,
      startDate: Timestamp.fromDate(startDate),
      createdAt: Timestamp.fromDate(now),
      updatedAt: Timestamp.fromDate(now)
    })

    // Create or update cycle
    await this.updateCycleData(userId, startDate)

    return newPeriod
  }

  static async endPeriod(userId: string, endDate: Date): Promise<void> {
    const activePeriod = await this.getActivePeriod(userId)
    if (!activePeriod) {
      throw new Error('No active period to end')
    }

    await updateDoc(doc(db, this.PERIOD_COLLECTION, activePeriod.id), {
      endDate: Timestamp.fromDate(endDate),
      isActive: false,
      updatedAt: Timestamp.fromDate(new Date())
    })

    // Update cycle data
    await this.completeCycleData(userId, activePeriod.startDate, endDate)
  }

  static async getActivePeriod(userId: string): Promise<PeriodEntry | null> {
    const q = query(
      collection(db, this.PERIOD_COLLECTION),
      where('userId', '==', userId),
      where('isActive', '==', true),
      firestoreLimit(1)
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
      startDate: data.startDate?.toDate() || new Date(),
      endDate: data.endDate?.toDate(),
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date()
    } as PeriodEntry
  }

  static async getPeriodHistory(userId: string, limit = 12): Promise<PeriodEntry[]> {
    const q = query(
      collection(db, this.PERIOD_COLLECTION),
      where('userId', '==', userId),
      orderBy('startDate', 'desc'),
      firestoreLimit(limit)
    )

    const querySnapshot = await getDocs(q)
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data()
      return {
        ...data,
        id: doc.id,
        startDate: data.startDate?.toDate() || new Date(),
        endDate: data.endDate?.toDate(),
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date()
      } as PeriodEntry
    })
  }

  // Cycle Management
  private static async updateCycleData(userId: string, periodStart: Date): Promise<void> {
    const previousCycle = await this.getLastCycle(userId)
    
    if (previousCycle && previousCycle.endDate) {
      // Complete previous cycle
      const cycleLength = Math.floor(
        (periodStart.getTime() - previousCycle.startDate.getTime()) / (1000 * 60 * 60 * 24)
      )
      
      await updateDoc(doc(db, this.CYCLE_COLLECTION, previousCycle.id), {
        endDate: Timestamp.fromDate(periodStart),
        cycleLength,
        updatedAt: Timestamp.fromDate(new Date())
      })
    }

    // Create new cycle
    const docRef = doc(collection(db, this.CYCLE_COLLECTION))
    const cycleNumber = previousCycle ? previousCycle.cycleNumber + 1 : 1
    
    const newCycle: CycleData = {
      id: docRef.id,
      userId,
      cycleNumber,
      startDate: periodStart,
      isRegular: true, // Will be updated based on history
      createdAt: new Date(),
      updatedAt: new Date()
    }

    await setDoc(docRef, {
      ...newCycle,
      startDate: Timestamp.fromDate(periodStart),
      createdAt: Timestamp.fromDate(new Date()),
      updatedAt: Timestamp.fromDate(new Date())
    })
  }

  private static async completeCycleData(userId: string, periodStart: Date, periodEnd: Date): Promise<void> {
    const currentCycle = await this.getCurrentCycle(userId)
    if (!currentCycle) return

    const periodLength = Math.floor(
      (periodEnd.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24)
    ) + 1

    // Calculate ovulation (typically day 14 for 28-day cycle)
    const avgCycleLength = await this.getAverageCycleLength(userId)
    const ovulationDay = Math.floor(avgCycleLength - 14)
    const ovulationDate = new Date(periodStart)
    ovulationDate.setDate(ovulationDate.getDate() + ovulationDay)

    // Fertile window (5 days before ovulation + ovulation day)
    const fertileStart = new Date(ovulationDate)
    fertileStart.setDate(fertileStart.getDate() - 5)
    const fertileEnd = new Date(ovulationDate)
    fertileEnd.setDate(fertileEnd.getDate() + 1)

    await updateDoc(doc(db, this.CYCLE_COLLECTION, currentCycle.id), {
      periodLength,
      ovulationDate: Timestamp.fromDate(ovulationDate),
      fertileWindowStart: Timestamp.fromDate(fertileStart),
      fertileWindowEnd: Timestamp.fromDate(fertileEnd),
      updatedAt: Timestamp.fromDate(new Date())
    })
  }

  static async getLastCycle(userId: string): Promise<CycleData | null> {
    const q = query(
      collection(db, this.CYCLE_COLLECTION),
      where('userId', '==', userId),
      orderBy('startDate', 'desc'),
      firestoreLimit(1)
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
      startDate: data.startDate?.toDate() || new Date(),
      endDate: data.endDate?.toDate(),
      ovulationDate: data.ovulationDate?.toDate(),
      fertileWindowStart: data.fertileWindowStart?.toDate(),
      fertileWindowEnd: data.fertileWindowEnd?.toDate(),
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date()
    } as CycleData
  }

  static async getCurrentCycle(userId: string): Promise<CycleData | null> {
    const q = query(
      collection(db, this.CYCLE_COLLECTION),
      where('userId', '==', userId),
      where('endDate', '==', null),
      firestoreLimit(1)
    )

    const querySnapshot = await getDocs(q)
    
    if (querySnapshot.empty) {
      return this.getLastCycle(userId)
    }

    const doc = querySnapshot.docs[0]
    const data = doc.data()

    return {
      ...data,
      id: doc.id,
      startDate: data.startDate?.toDate() || new Date(),
      endDate: data.endDate?.toDate(),
      ovulationDate: data.ovulationDate?.toDate(),
      fertileWindowStart: data.fertileWindowStart?.toDate(),
      fertileWindowEnd: data.fertileWindowEnd?.toDate(),
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date()
    } as CycleData
  }

  static async getCycleHistory(userId: string, limit = 12): Promise<CycleData[]> {
    const q = query(
      collection(db, this.CYCLE_COLLECTION),
      where('userId', '==', userId),
      orderBy('startDate', 'desc'),
      firestoreLimit(limit)
    )

    const querySnapshot = await getDocs(q)
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data()
      return {
        ...data,
        id: doc.id,
        startDate: data.startDate?.toDate() || new Date(),
        endDate: data.endDate?.toDate(),
        ovulationDate: data.ovulationDate?.toDate(),
        fertileWindowStart: data.fertileWindowStart?.toDate(),
        fertileWindowEnd: data.fertileWindowEnd?.toDate(),
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date()
      } as CycleData
    })
  }

  // Predictions
  static async predictNextCycle(userId: string): Promise<CyclePrediction | null> {
    const cycles = await this.getCycleHistory(userId, 6)
    
    if (cycles.length < 2) {
      return null // Not enough data for prediction
    }

    const completedCycles = cycles.filter(c => c.cycleLength)
    if (completedCycles.length === 0) return null

    // Calculate averages
    const avgCycleLength = Math.round(
      completedCycles.reduce((sum, c) => sum + (c.cycleLength || 0), 0) / completedCycles.length
    )
    
    const avgPeriodLength = Math.round(
      completedCycles.filter(c => c.periodLength).reduce((sum, c) => sum + (c.periodLength || 0), 0) / 
      completedCycles.filter(c => c.periodLength).length
    )

    // Calculate variation
    const cycleLengths = completedCycles.map(c => c.cycleLength || avgCycleLength)
    const variance = cycleLengths.reduce((sum, length) => 
      sum + Math.pow(length - avgCycleLength, 2), 0
    ) / cycleLengths.length
    const cycleVariation = Math.sqrt(variance)

    // Determine regularity
    const isRegular = cycleVariation <= 7 // Within 7 days is considered regular
    const confidence = isRegular ? 0.85 : 0.65

    // Calculate predictions
    const lastCycle = cycles[0]
    const nextPeriodStart = new Date(lastCycle.startDate)
    nextPeriodStart.setDate(nextPeriodStart.getDate() + avgCycleLength)

    const nextPeriodEnd = new Date(nextPeriodStart)
    nextPeriodEnd.setDate(nextPeriodEnd.getDate() + avgPeriodLength - 1)

    const nextOvulation = new Date(nextPeriodStart)
    nextOvulation.setDate(nextOvulation.getDate() + avgCycleLength - 14)

    const nextFertileStart = new Date(nextOvulation)
    nextFertileStart.setDate(nextFertileStart.getDate() - 5)

    const nextFertileEnd = new Date(nextOvulation)
    nextFertileEnd.setDate(nextFertileEnd.getDate() + 1)

    return {
      nextPeriodStart,
      nextPeriodEnd,
      nextOvulation,
      nextFertileStart,
      nextFertileEnd,
      confidence,
      isRegular,
      averageCycleLength: avgCycleLength,
      averagePeriodLength: avgPeriodLength,
      cycleVariation
    }
  }

  static async getAverageCycleLength(userId: string): Promise<number> {
    const cycles = await this.getCycleHistory(userId, 6)
    const completedCycles = cycles.filter(c => c.cycleLength)
    
    if (completedCycles.length === 0) {
      return 28 // Default cycle length
    }

    return Math.round(
      completedCycles.reduce((sum, c) => sum + (c.cycleLength || 0), 0) / completedCycles.length
    )
  }

  // Statistics
  static async getCycleStatistics(userId: string): Promise<CycleStatistics | null> {
    const cycles = await this.getCycleHistory(userId, 24) // 2 years of data
    const periods = await this.getPeriodHistory(userId, 24)
    
    if (cycles.length === 0) {
      return null
    }

    const completedCycles = cycles.filter(c => c.cycleLength)
    if (completedCycles.length === 0) {
      return null
    }

    const cycleLengths = completedCycles.map(c => c.cycleLength || 0)
    const periodLengths = cycles.filter(c => c.periodLength).map(c => c.periodLength || 0)

    const avgCycleLength = Math.round(
      cycleLengths.reduce((sum, l) => sum + l, 0) / cycleLengths.length
    )

    const avgPeriodLength = periodLengths.length > 0
      ? Math.round(periodLengths.reduce((sum, l) => sum + l, 0) / periodLengths.length)
      : 5 // Default

    // Calculate regularity
    const variance = cycleLengths.reduce((sum, length) => 
      sum + Math.pow(length - avgCycleLength, 2), 0
    ) / cycleLengths.length
    const stdDev = Math.sqrt(variance)
    
    let cycleRegularity: 'regular' | 'irregular' | 'very_irregular'
    if (stdDev <= 3) cycleRegularity = 'regular'
    else if (stdDev <= 7) cycleRegularity = 'irregular'
    else cycleRegularity = 'very_irregular'

    // Count cycles this year
    const thisYear = new Date().getFullYear()
    const cyclesThisYear = cycles.filter(c => 
      c.startDate.getFullYear() === thisYear
    ).length

    // Get symptom data
    const allSymptoms: string[] = []
    periods.forEach(p => {
      p.symptoms.forEach(s => allSymptoms.push(s.name))
    })

    const symptomCounts = allSymptoms.reduce((acc, symptom) => {
      acc[symptom] = (acc[symptom] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const mostCommonSymptoms = Object.entries(symptomCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([symptom]) => symptom)

    const avgSymptomSeverity = periods.reduce((sum, p) => {
      const periodAvg = p.symptoms.length > 0
        ? p.symptoms.reduce((s, symptom) => s + symptom.severity, 0) / p.symptoms.length
        : 0
      return sum + periodAvg
    }, 0) / (periods.filter(p => p.symptoms.length > 0).length || 1)

    return {
      totalCycles: cycles.length,
      averageCycleLength: avgCycleLength,
      shortestCycle: Math.min(...cycleLengths),
      longestCycle: Math.max(...cycleLengths),
      averagePeriodLength: avgPeriodLength,
      cycleRegularity,
      lastPeriodDate: periods[0]?.startDate || new Date(),
      cyclesThisYear,
      averageSymptomSeverity: Math.round(avgSymptomSeverity),
      mostCommonSymptoms
    }
  }

  // Fertility Tracking
  static async logFertilityData(data: Omit<FertilityData, 'id' | 'createdAt' | 'updatedAt'>): Promise<FertilityData> {
    const docRef = doc(collection(db, this.FERTILITY_COLLECTION))
    const now = new Date()
    
    const fertilityData: FertilityData = {
      ...data,
      id: docRef.id,
      createdAt: now,
      updatedAt: now
    }

    await setDoc(docRef, {
      ...fertilityData,
      date: Timestamp.fromDate(data.date),
      createdAt: Timestamp.fromDate(now),
      updatedAt: Timestamp.fromDate(now)
    })

    // Check for ovulation based on fertility signs
    if (data.bbt || data.cervicalMucus === 'egg_white' || data.opkResult === 'positive') {
      await this.checkAndUpdateOvulation(data.userId, data.date, data)
    }

    return fertilityData
  }

  private static async checkAndUpdateOvulation(
    userId: string, 
    date: Date, 
    fertilityData: Partial<FertilityData>
  ): Promise<void> {
    const currentCycle = await this.getCurrentCycle(userId)
    if (!currentCycle) return

    // Determine if this is likely ovulation
    const isLikelyOvulation = 
      (fertilityData.bbt && fertilityData.bbt > 36.5) ||
      fertilityData.cervicalMucus === 'egg_white' ||
      fertilityData.opkResult === 'positive'

    if (isLikelyOvulation && !currentCycle.ovulationDate) {
      await updateDoc(doc(db, this.CYCLE_COLLECTION, currentCycle.id), {
        ovulationDate: Timestamp.fromDate(date),
        fertileWindowStart: Timestamp.fromDate(new Date(date.getTime() - 5 * 24 * 60 * 60 * 1000)),
        fertileWindowEnd: Timestamp.fromDate(new Date(date.getTime() + 1 * 24 * 60 * 60 * 1000)),
        updatedAt: Timestamp.fromDate(new Date())
      })
    }
  }

  static async getFertilityData(userId: string, startDate: Date, endDate: Date): Promise<FertilityData[]> {
    const q = query(
      collection(db, this.FERTILITY_COLLECTION),
      where('userId', '==', userId),
      where('date', '>=', Timestamp.fromDate(startDate)),
      where('date', '<=', Timestamp.fromDate(endDate)),
      orderBy('date', 'asc')
    )

    const querySnapshot = await getDocs(q)
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data()
      return {
        ...data,
        id: doc.id,
        date: data.date?.toDate() || new Date(),
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date()
      } as FertilityData
    })
  }
}