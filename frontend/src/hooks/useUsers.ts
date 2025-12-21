import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { UserBasic, ApiResponse } from '@/lib/types';

export const userKeys = {
  all: ['users'] as const,
  list: () => [...userKeys.all, 'list'] as const,
};

// Fetch all users (for task assignment)
export function useUsers() {
  return useQuery({
    queryKey: userKeys.list(),
    queryFn: async () => {
      const response = await api.get<ApiResponse<{ users: UserBasic[] }>>('/auth/users');
      return response.data.data.users;
    },
  });
}
