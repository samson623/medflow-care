import { supabase } from '@/shared/lib/supabase'
import type { Database } from '@/shared/types/database.types'
import type { ScheduleCreateInput } from '@/shared/types/contracts'

type Schedule = Database['public']['Tables']['schedules']['Row']

export const SchedulesService = {
  async getAll(): Promise<Schedule[]> {
    const { data, error } = await supabase
      .from('schedules')
      .select('*')
      .order('time')

    if (error) throw error
    return data
  },

  async create(sched: ScheduleCreateInput): Promise<Schedule> {
    const { data, error } = await supabase
      .from('schedules')
      .insert(sched)
      .select('*')
      .single()

    if (error) throw error
    return data
  },

  async update(id: string, updates: Partial<Schedule>): Promise<Schedule> {
    const { data, error } = await supabase
      .from('schedules')
      .update(updates)
      .eq('id', id)
      .select('*')
      .single()

    if (error) throw error
    return data
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('schedules')
      .delete()
      .eq('id', id)

    if (error) throw error
  },
}