import type { Database } from '@/shared/types/database.types'

export type DoseStatus = Database['public']['Enums']['dose_status']
export type NotificationType = Database['public']['Enums']['notification_type']

export type MedicationRow = Database['public']['Tables']['medications']['Row']
export type MedicationCreateInput = Pick<
  Database['public']['Tables']['medications']['Insert'],
  'name' | 'dosage' | 'instructions' | 'warnings' | 'freq' | 'color' | 'icon'
>
export type MedicationUpdateInput = Partial<MedicationCreateInput>

export type ScheduleCreateInput = Pick<
  Database['public']['Tables']['schedules']['Insert'],
  'time' | 'days' | 'food_context_minutes' | 'active'
> & { medication_id: string }

export type MedicationBundleScheduleInput = Pick<
  Database['public']['Tables']['schedules']['Insert'],
  'time' | 'days' | 'food_context_minutes' | 'active'
>

export type DoseLogCreateInput = Pick<
  Database['public']['Tables']['dose_logs']['Insert'],
  'medication_id' | 'schedule_id' | 'taken_at' | 'status' | 'notes'
>

export type AppointmentCreateInput = Pick<
  Database['public']['Tables']['appointments']['Insert'],
  'title' | 'doctor' | 'location' | 'commute_minutes' | 'start_time' | 'notes'
>

export type RefillUpsertInput = Pick<
  Database['public']['Tables']['refills']['Insert'],
  'medication_id' | 'current_quantity' | 'total_quantity' | 'refill_date' | 'pharmacy'
>

export type MedicationBundleRefillInput = Pick<
  Database['public']['Tables']['refills']['Insert'],
  'current_quantity' | 'total_quantity' | 'refill_date' | 'pharmacy'
>

export interface MedicationBundleCreateInput {
  medication: MedicationCreateInput
  schedules: MedicationBundleScheduleInput[]
  refill: MedicationBundleRefillInput
}
