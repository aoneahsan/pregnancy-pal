export interface User {
  id: string
  email: string
  name: string
  profilePicture?: string
  dateOfBirth: Date
  phoneNumber?: string
  isOnboarded: boolean
  createdAt: Date
  updatedAt: Date
  preferences: UserPreferences
}

export interface UserPreferences {
  notifications: {
    dailyTips: boolean
    appointments: boolean
    milestones: boolean
    dietReminders: boolean
  }
  units: {
    weight: 'kg' | 'lbs'
    height: 'cm' | 'ft'
    temperature: 'C' | 'F'
  }
  theme: 'light' | 'dark' | 'system'
  language: string
}

export interface PregnancyProfile {
  id: string
  userId: string
  lastMenstrualPeriod: Date
  expectedDueDate: Date
  currentWeek: number
  currentTrimester: 1 | 2 | 3
  babyCount: number
  isHighRisk: boolean
  complications: string[]
  healthConditions: HealthCondition[]
  createdAt: Date
  updatedAt: Date
}

export interface HealthCondition {
  id: string
  name: string
  description: string
  severity: 'low' | 'medium' | 'high'
  dietaryRestrictions: string[]
  recommendedNutrients: string[]
  avoidNutrients: string[]
}

export interface DietPlan {
  id: string
  userId: string
  pregnancyProfileId: string
  name: string
  description: string
  trimester: 1 | 2 | 3
  totalCalories: number
  meals: Meal[]
  nutritionTargets: NutritionTargets
  restrictions: DietaryRestriction[]
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Meal {
  id: string
  name: string
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  time: string
  foods: Food[]
  totalCalories: number
  nutrition: NutritionInfo
  preparationTime: number
  difficulty: 'easy' | 'medium' | 'hard'
  instructions: string[]
  tips: string[]
}

export interface Food {
  id: string
  name: string
  category: string
  serving: {
    amount: number
    unit: string
    description: string
  }
  nutrition: NutritionInfo
  isPregnancySafe: boolean
  warnings?: string[]
  benefits: string[]
}

export interface NutritionInfo {
  calories: number
  protein: number
  carbohydrates: number
  fat: number
  fiber: number
  sugar: number
  sodium: number
  calcium: number
  iron: number
  folate: number
  vitaminD: number
  omega3: number
}

export interface NutritionTargets {
  calories: { min: number; max: number }
  protein: { min: number; max: number }
  carbohydrates: { min: number; max: number }
  fat: { min: number; max: number }
  fiber: { min: number; max: number }
  calcium: { min: number; max: number }
  iron: { min: number; max: number }
  folate: { min: number; max: number }
  vitaminD: { min: number; max: number }
}

export interface DietaryRestriction {
  id: string
  name: string
  type: 'allergy' | 'intolerance' | 'preference' | 'medical'
  severity: 'mild' | 'moderate' | 'severe'
  description: string
  avoidFoods: string[]
  alternatives: string[]
}

export interface DailyTracking {
  id: string
  userId: string
  date: Date
  weight?: number
  symptoms: Symptom[]
  mood: MoodEntry
  activities: Activity[]
  mealsConsumed: Meal[]
  waterIntake: number
  supplements: Supplement[]
  notes: string
  createdAt: Date
  updatedAt: Date
}

export interface Symptom {
  id: string
  name: string
  severity: 1 | 2 | 3 | 4 | 5
  frequency: 'rare' | 'occasional' | 'frequent' | 'constant'
  description?: string
  triggers?: string[]
  relief?: string[]
}

export interface MoodEntry {
  level: 1 | 2 | 3 | 4 | 5
  emotions: string[]
  notes?: string
}

export interface Activity {
  id: string
  name: string
  type: 'exercise' | 'rest' | 'hobby' | 'work'
  duration: number
  intensity?: 'low' | 'moderate' | 'high'
  notes?: string
}

export interface Supplement {
  id: string
  name: string
  dosage: string
  frequency: string
  taken: boolean
  time?: Date
}

export interface Appointment {
  id: string
  userId: string
  title: string
  type: 'checkup' | 'ultrasound' | 'test' | 'specialist' | 'class'
  provider: string
  location: string
  date: Date
  duration: number
  notes?: string
  reminders: AppointmentReminder[]
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled'
  createdAt: Date
  updatedAt: Date
}

export interface AppointmentReminder {
  time: Date
  method: 'push' | 'email' | 'sms'
  sent: boolean
}

export interface Milestone {
  id: string
  week: number
  title: string
  description: string
  category: 'baby' | 'mother' | 'both'
  importance: 'low' | 'medium' | 'high'
  tips: string[]
  warnings?: string[]
}

export interface EducationalContent {
  id: string
  title: string
  content: string
  category: 'nutrition' | 'exercise' | 'symptoms' | 'development' | 'preparation'
  tags: string[]
  readingTime: number
  week?: number
  trimester?: 1 | 2 | 3
  createdAt: Date
  updatedAt: Date
}

export interface ApiResponse<T> {
  data: T
  message: string
  status: 'success' | 'error'
  timestamp: Date
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export type LoadingState = 'idle' | 'loading' | 'success' | 'error'

export interface ErrorInfo {
  message: string
  code?: string
  details?: unknown
}

export interface Notification {
  id: string
  userId: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error' | 'reminder' | 'milestone'
  category: 'appointment' | 'diet' | 'tracking' | 'milestone' | 'tip' | 'system'
  isRead: boolean
  isImportant: boolean
  actionUrl?: string
  actionText?: string
  metadata?: Record<string, any>
  createdAt: Date
  readAt?: Date
}