import { useQuery } from '@tanstack/react-query';
import { fetchClientTemplate } from '../lib/checkInTemplateApi';

export const templateKeys = {
  all: ['checkInTemplate'] as const,
  forType: (type: 'daily' | 'weekly') =>
    [...templateKeys.all, type] as const,
};

/**
 * Fetch the custom check-in template assigned to the current client.
 * Returns null if no custom template exists (use built-in questions).
 */
export function useCheckInTemplate(type: 'daily' | 'weekly') {
  return useQuery({
    queryKey: templateKeys.forType(type),
    queryFn: () => fetchClientTemplate(type),
    staleTime: 10 * 60 * 1000, // 10 min - templates rarely change
    retry: false,
  });
}
