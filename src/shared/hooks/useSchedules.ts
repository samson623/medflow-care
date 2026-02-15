import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { SchedulesService } from '@/shared/services/schedules'
import { useAuthStore } from '@/shared/stores/auth-store'
import { useAppStore } from '@/shared/stores/app-store'
import { getErrorMessage } from '@/shared/lib/errors'

export function useSchedules() {
  const queryClient = useQueryClient()
  const { isDemo } = useAuthStore()
  const { toast } = useAppStore()

  const { data, isLoading } = useQuery({
    queryKey: ['schedules'],
    queryFn: SchedulesService.getAll,
    enabled: !isDemo,
    staleTime: 1000 * 60 * 5,
  })

  const createMutation = useMutation({
    mutationFn: SchedulesService.create,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['schedules'] })
      toast('Schedule updated', 'ts')
    },
    onError: (err: unknown) => toast(getErrorMessage(err, 'Failed to update schedule'), 'te'),
  })

  return {
    scheds: data ?? [],
    isLoading: isLoading && !isDemo,
    addSched: createMutation.mutate,
    isAdding: createMutation.isPending,
  }
}