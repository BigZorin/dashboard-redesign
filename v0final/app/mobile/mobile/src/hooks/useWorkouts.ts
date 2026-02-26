import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { fetchWorkouts, fetchWorkoutDetail, completeWorkout, finishWorkout } from '../lib/api';
import { programKeys } from './usePrograms';

// Query keys
export const workoutKeys = {
  all: ['workouts'] as const,
  lists: () => [...workoutKeys.all, 'list'] as const,
  list: (filter: string) => [...workoutKeys.lists(), filter] as const,
  details: () => [...workoutKeys.all, 'detail'] as const,
  detail: (id: string) => [...workoutKeys.details(), id] as const,
};

/**
 * Fetch all workouts with optional filter
 * Refetches when screen comes into focus
 */
export function useWorkouts(filter: 'upcoming' | 'completed' | 'all' = 'all') {
  return useQuery({
    queryKey: workoutKeys.list(filter),
    queryFn: () => fetchWorkouts(filter),
    select: (data) => data.workouts,
    staleTime: 30 * 1000, // 30 seconds before considered stale
    refetchOnWindowFocus: true,
  });
}

/**
 * Fetch single workout detail
 */
export function useWorkoutDetail(id: string) {
  return useQuery({
    queryKey: workoutKeys.detail(id),
    queryFn: () => fetchWorkoutDetail(id),
    select: (data) => data.workout,
    staleTime: 30 * 1000,
    enabled: !!id,
  });
}

/**
 * Complete a workout - invalidates all workout queries on success
 */
export function useCompleteWorkout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, exerciseLogs }: { id: string; exerciseLogs?: any[] }) =>
      completeWorkout(id, exerciseLogs),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: workoutKeys.lists() });
      queryClient.invalidateQueries({ queryKey: workoutKeys.detail(variables.id) });
    },
  });
}

/**
 * Finish a workout (live-save flow) — just marks it completed.
 * Invalidates all workout queries on success.
 */
export function useFinishWorkout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => finishWorkout(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workoutKeys.lists() });
      // Also invalidate program weekly maps so completion status updates
      queryClient.invalidateQueries({ queryKey: programKeys.all });
    },
  });
}
