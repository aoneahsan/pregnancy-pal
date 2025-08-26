export interface PeriodEntry {
  id: string
  userId: string
  startDate: Date
  endDate?: Date
  flowIntensity: FlowIntensity[]
  symptoms: PeriodSymptom[]
  mood: MoodEntry[]
  notes?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface CycleData {
  id: string
  userId: string
  cycleNumber: number
  startDate: Date
  endDate?: Date
  cycleLength?: number
  periodLength?: number
  ovulationDate?: Date
  fertileWindowStart?: Date
  fertileWindowEnd?: Date
  isRegular: boolean
  createdAt: Date
  updatedAt: Date
}

export type FlowIntensity = 'spotting' | 'light' | 'medium' | 'heavy' | 'very_heavy'

export interface PeriodSymptom {
  id: string
  category: SymptomCategory
  name: string
  severity: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10
  timestamp: Date
  notes?: string
}

export type SymptomCategory = 
  | 'physical'
  | 'emotional' 
  | 'digestive'
  | 'skin'
  | 'energy'
  | 'sexual'
  | 'other'

export const PERIOD_SYMPTOMS = {
  physical: [
    'Cramps',
    'Bloating',
    'Breast tenderness',
    'Headache',
    'Backache',
    'Joint pain',
    'Muscle aches',
    'Dizziness',
    'Hot flashes',
    'Cold sweats',
    'Nausea',
    'Pelvic pressure'
  ],
  emotional: [
    'Mood swings',
    'Irritability',
    'Anxiety',
    'Depression',
    'Crying spells',
    'Anger',
    'Feeling overwhelmed',
    'Restlessness',
    'Sensitivity',
    'Happiness'
  ],
  digestive: [
    'Nausea',
    'Constipation',
    'Diarrhea',
    'Gas',
    'Appetite changes',
    'Food cravings',
    'Vomiting',
    'Indigestion'
  ],
  skin: [
    'Acne',
    'Oily skin',
    'Dry skin',
    'Rashes',
    'Sensitivity',
    'Breakouts'
  ],
  energy: [
    'Fatigue',
    'Insomnia',
    'Drowsiness',
    'High energy',
    'Low energy',
    'Restless sleep'
  ],
  sexual: [
    'High libido',
    'Low libido',
    'Vaginal dryness',
    'Increased arousal'
  ],
  other: []
} as const

export interface OvulationData {
  id: string
  userId: string
  cycleId: string
  date: Date
  confirmed: boolean
  confirmationMethod?: 'bbt' | 'opk' | 'cervical_mucus' | 'ultrasound' | 'symptoms'
  basalBodyTemp?: number
  cervicalMucus?: CervicalMucusType
  cervicalPosition?: CervicalPosition
  opkResult?: 'negative' | 'positive' | 'peak'
  symptoms: string[]
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export type CervicalMucusType = 
  | 'dry'
  | 'sticky'
  | 'creamy'
  | 'watery'
  | 'egg_white'
  | 'unusual'

export interface CervicalPosition {
  height: 'low' | 'medium' | 'high'
  firmness: 'soft' | 'medium' | 'firm'
  opening: 'closed' | 'slightly_open' | 'open'
}

export interface FertilityData {
  id: string
  userId: string
  date: Date
  bbt?: number
  cervicalMucus?: CervicalMucusType
  cervicalPosition?: CervicalPosition
  opkResult?: 'negative' | 'positive' | 'peak'
  ferningTest?: 'negative' | 'partial' | 'full'
  sexualActivity?: SexualActivity
  fertilityScore?: number
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export interface SexualActivity {
  occurred: boolean
  protected: boolean
  timestamp?: Date
  notes?: string
}

export interface MoodEntry {
  level: 1 | 2 | 3 | 4 | 5
  emotions: string[]
  timestamp: Date
  notes?: string
}

export interface CyclePrediction {
  nextPeriodStart: Date
  nextPeriodEnd: Date
  nextOvulation: Date
  nextFertileStart: Date
  nextFertileEnd: Date
  confidence: number
  isRegular: boolean
  averageCycleLength: number
  averagePeriodLength: number
  cycleVariation: number
}

export interface CycleStatistics {
  totalCycles: number
  averageCycleLength: number
  shortestCycle: number
  longestCycle: number
  averagePeriodLength: number
  cycleRegularity: 'regular' | 'irregular' | 'very_irregular'
  lastPeriodDate: Date
  cyclesThisYear: number
  averageSymptomSeverity: number
  mostCommonSymptoms: string[]
}