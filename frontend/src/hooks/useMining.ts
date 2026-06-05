import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { hapticFeedback } from '@/lib/telegram';

export function useMining() {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['user'] });
    queryClient.invalidateQueries({ queryKey: ['mining'] });
  };

  const startMutation = useMutation({
    mutationFn: () => api.mining.start(),
    onSuccess: () => {
      hapticFeedback('success');
      invalidate();
    },
    onError: () => hapticFeedback('error'),
  });

  const stopMutation = useMutation({
    mutationFn: () => api.mining.stop(),
    onSuccess: () => {
      hapticFeedback('medium');
      invalidate();
    },
    onError: () => hapticFeedback('error'),
  });

  const claimMutation = useMutation({
    mutationFn: () => api.mining.claim(),
    onSuccess: () => {
      hapticFeedback('success');
      invalidate();
    },
    onError: () => hapticFeedback('error'),
  });

  return {
    startMining: startMutation.mutateAsync,
    stopMining: stopMutation.mutateAsync,
    claimRewards: claimMutation.mutateAsync,
    isStarting: startMutation.isPending,
    isStopping: stopMutation.isPending,
    isClaiming: claimMutation.isPending,
    claimResult: claimMutation.data,
  };
}
