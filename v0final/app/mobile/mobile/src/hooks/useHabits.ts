import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchHabits, fetchHabitLogs, fetchHabitStreaks, toggleHabitLog } from '../lib/habitApi';

export const habitKeys = {
  all: ['habits'] as const,
  list: () => [...habitKeys.all, 'list'] as const,
  logs: () => [...habitKeys.all, 'logs'] as const,
  logsForDate: (date: string) => [...habitKeys.logs(), date] as const,
  streaks: () => [...habitKeys.all, 'streaks'] as const,
};

/**
 * Fetch all active habits for the current client.
 */
export function useHabits() {
  return useQuery({
    queryKey: habitKeys.list(),
    queryFn: fetchHabits,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Fetch habit logs for a specific date.
 */
export function useHabitLogs(date: string) {
  return useQuery({
    queryKey: habitKeys.logsForDate(date),
    queryFn: () => fetchHabitLogs(date),
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Fetch streak data for all active habits.
 */
export function useHabitStreaks() {
  return useQuery({
    queryKey: habitKeys.streaks(),
    queryFn: fetchHabitStreaks,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Toggle a habit's completion for a given date.
 */
export function useToggleHabit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ habitId, date, completed }: { habitId: string; date: string; completed: boolean }) =>
      toggleHabitLog(habitId, date, completed),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: habitKeys.logs() });
      queryClient.invalidateQueries({ queryKey: habitKeys.streaks() });
    },
  });
}
