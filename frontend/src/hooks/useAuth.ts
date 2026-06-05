import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { getInitData } from '@/lib/telegram';

export function useAuth() {
  const queryClient = useQueryClient();

  const loginMutation = useMutation({
    mutationFn: async () => {
      const initData = getInitData();
      const response = await api.auth.telegram(initData);
      api.setToken(response.token);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });

  const userQuery = useQuery({
    queryKey: ['user'],
    queryFn: () => api.user.get(),
    enabled: !!api.getToken(),
    refetchInterval: 30000,
  });

  return {
    login: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    loginError: loginMutation.error,
    user: userQuery.data,
    isLoading: userQuery.isLoading,
    refetch: userQuery.refetch,
    isAuthenticated: !!api.getToken() && !!userQuery.data,
  };
}
