import { supabase } from '@/shared/lib/supabase'
import type { Database } from '@/shared/types/database.types'

type Notification = Database['public']['Tables']['notifications']['Row']

export const NotificationsService = {
  async getAll(): Promise<Notification[]> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  async markRead(id: string): Promise<Notification> {
    const { data, error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id)
      .select('*')
      .single()

    if (error) throw error
    return data
  },
}