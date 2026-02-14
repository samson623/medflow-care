export type DoseStatus = 'upcoming' | 'due' | 'done' | 'late' | 'missed' | 'snoozed'

export type MedicationColor = 'sky' | 'emerald' | 'amber' | 'rose' | 'indigo' | 'teal'

export interface User {
    id: string
    email: string
    name: string
    avatar?: string
    plan: 'free' | 'pro' | 'family'
    isDemo: boolean
}

export interface Medication {
    id: string
    userId: string
    name: string
    dosage: string
    instructions: string
    warnings?: string
    barcode?: string
    color: MedicationColor
    icon?: string
    createdAt: string
}

export interface Schedule {
    id: string
    medicationId: string
    time: string // HH:mm format
    days: number[] // 0-6, Sun-Sat
    foodRestrictionMinutes: number // 0 = no restriction
    active: boolean
}

export interface DoseLog {
    id: string
    scheduleId: string
    medicationId: string
    date: string // YYYY-MM-DD
    status: DoseStatus
    scheduledTime: string
    confirmedAt?: string
    notes?: string
}

export interface Appointment {
    id: string
    userId: string
    title: string
    doctor: string
    location: string
    datetime: string
    reminderMinutes: number
    questions: string[]
}

export interface Note {
    id: string
    userId: string
    linkedType: 'medication' | 'appointment' | 'general'
    linkedId?: string
    content: string
    createdAt: string
}

export interface Refill {
    id: string
    medicationId: string
    pillsRemaining: number
    dosesPerDay: number
    refillAlertDays: number
    lastUpdated: string
}

export interface TimelineItem {
    id: string
    type: 'medication' | 'food_window' | 'appointment'
    time: string // HH:mm
    title: string
    subtitle?: string
    status?: DoseStatus
    metadata?: Record<string, unknown>
}
