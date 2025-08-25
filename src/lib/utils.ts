import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string | number, format: 'short' | 'long' | 'relative' = 'short') {
  const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date
  
  if (format === 'relative') {
    const now = new Date()
    const diffInMs = now.getTime() - dateObj.getTime()
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))
    
    if (diffInDays === 0) return 'Today'
    if (diffInDays === 1) return 'Yesterday'
    if (diffInDays < 7) return `${diffInDays} days ago`
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`
    return dateObj.toLocaleDateString()
  }
  
  if (format === 'long') {
    return dateObj.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }
  
  return dateObj.toLocaleDateString()
}

export function calculatePregnancyWeek(lastMenstrualPeriod: Date): number {
  const today = new Date()
  const lmp = new Date(lastMenstrualPeriod)
  const diffInMs = today.getTime() - lmp.getTime()
  const diffInWeeks = Math.floor(diffInMs / (1000 * 60 * 60 * 24 * 7))
  return Math.max(0, diffInWeeks)
}

export function getPregnancyTrimester(week: number): 1 | 2 | 3 | 'postpartum' {
  if (week <= 13) return 1
  if (week <= 26) return 2
  if (week <= 40) return 3
  return 'postpartum'
}

export function formatWeight(weight: number, unit: 'kg' | 'lbs' = 'kg'): string {
  if (unit === 'lbs') {
    return `${weight.toFixed(1)} lbs`
  }
  return `${weight.toFixed(1)} kg`
}

export function convertWeight(weight: number, from: 'kg' | 'lbs', to: 'kg' | 'lbs'): number {
  if (from === to) return weight
  if (from === 'kg' && to === 'lbs') return weight * 2.20462
  return weight / 2.20462
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    const later = () => {
      timeout = null
      func(...args)
    }
    
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}