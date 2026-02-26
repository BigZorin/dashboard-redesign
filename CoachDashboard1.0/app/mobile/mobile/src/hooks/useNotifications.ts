import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchNotifications,
  getNotificationCount,
  markNotificationRead,
  markAllNotificationsRead,
} from '../lib/pushNotifications';

export const notificationKeys = {
  all: ['notifications'] as const,
  list: () => [...notificationKeys.all, 'list'] as const,
  count: () => [...notificationKeys.all, 'count'] as const,
};

export function useNotifications() {
  return useQuery({
    queryKey: notificationKeys.list(),
    queryFn: () => fetchNotifications(30),
    staleTime: 60 * 1000,
    retry: false,
  });
}

export function useNotificationCount() {
  return useQuery({
    queryKey: notificationKeys.count(),
    queryFn: getNotificationCount,
    staleTime: 60 * 1000,
    refetchInterval: 30 * 1000,
    retry: false,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}
