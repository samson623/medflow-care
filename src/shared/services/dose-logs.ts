import { supabase } from '@/shared/lib/supabase'
import type { Database } from '@/shared/types/database.types'
import type { DoseLogCreateInput } from '@/shared/types/contracts'

type DoseLog = Database['public']['Tables']['dose_logs']['Row']

export const DoseLogsService = {
  async getToday(): Promise<DoseLog[]> {
    const start = new Date()
    start.setHours(0, 0, 0, 0)

    const end = new Date()
    end.setHours(23, 59, 59, 999)

    const { data, error } = await supabase
      .from('dose_logs')
      .select('*')
      .gte('taken_at', start.toISOString())
      .lte('taken_at', end.toISOString())
      .order('taken_at')

    if (error) throw error
    return data
  },

  async logDose(log: DoseLogCreateInput): Promise<DoseLog> {
    const { data, error } = await supabase
      .from('dose_logs')
      .insert(log)
      .select('*')
      .single()

    if (error) throw error
    return data
  },
}