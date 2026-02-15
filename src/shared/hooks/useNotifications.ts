import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { NotificationsService } from '@/shared/services/notifications'
import { useAuthStore } from '@/shared/stores/auth-store'
import { useAppStore } from '@/shared/stores/app-store'
import { getErrorMessage } from '@/shared/lib/errors'

export function useNotifications() {
  const queryClient = useQueryClient()
  const { isDemo } = useAuthStore()
  const { toast } = useAppStore()

  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: NotificationsService.getAll,
    enabled: !isDemo,
    staleTime: 1000 * 60,
  })

  const markReadMutation = useMutation({
    mutationFn: NotificationsService.markRead,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
    onError: (error: unknown) => {
      toast(getErrorMessage(error, 'Failed to update notification'), 'te')
    },
  })

  return {
    notifications: data ?? [],
    isLoading: isLoading && !isDemo,
    markRead: markReadMutation.mutate,
  }
}