import { useQuery } from '@tanstack/react-query';
import { fetchActiveMealPlan } from '../lib/nutritionApi';

export const mealPlanKeys = {
  all: ['mealPlan'] as const,
  active: () => [...mealPlanKeys.all, 'active'] as const,
};

/**
 * Fetch the active meal plan assigned to the current user.
 * Cached for 5 minutes — meal plan assignments change infrequently.
 */
export function useActiveMealPlan() {
  return useQuery({
    queryKey: mealPlanKeys.active(),
    queryFn: fetchActiveMealPlan,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}
