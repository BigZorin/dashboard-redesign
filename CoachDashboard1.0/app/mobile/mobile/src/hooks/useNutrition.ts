import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchFoodLogs,
  addFoodLog,
  deleteFoodLog,
  fetchNutritionTargets,
  calculateDailyMacros,
} from '../lib/nutritionApi';

export const nutritionKeys = {
  all: ['nutrition'] as const,
  logs: (date: string) => [...nutritionKeys.all, 'logs', date] as const,
  targets: () => [...nutritionKeys.all, 'targets'] as const,
};

/**
 * Fetch food logs for a specific date.
 */
export function useFoodLogs(date: string) {
  return useQuery({
    queryKey: nutritionKeys.logs(date),
    queryFn: () => fetchFoodLogs(date),
    staleTime: 2 * 60 * 1000,
    retry: false,
  });
}

/**
 * Calculate daily macros from food logs.
 */
export function useDailyMacros(date: string) {
  const { data: logs = [] } = useFoodLogs(date);
  return calculateDailyMacros(logs);
}

/**
 * Fetch nutrition targets.
 */
export function useNutritionTargets() {
  return useQuery({
    queryKey: nutritionKeys.targets(),
    queryFn: fetchNutritionTargets,
    staleTime: 10 * 60 * 1000,
    retry: false,
  });
}

/**
 * Add a food log entry.
 */
export function useAddFoodLog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addFoodLog,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: nutritionKeys.logs(variables.date) });
    },
  });
}

/**
 * Delete a food log entry.
 */
export function useDeleteFoodLog(date: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteFoodLog,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: nutritionKeys.logs(date) });
    },
  });
}
