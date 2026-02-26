import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getConnections,
  toggleConnection,
  syncHealthData,
  fetchHealthData,
  getTodayHealthSummary,
  getAvailableProvider,
  type HealthProvider,
  type HealthDataType,
} from '../lib/healthSync';

export const healthKeys = {
  all: ['health'] as const,
  connections: () => [...healthKeys.all, 'connections'] as const,
  summary: () => [...healthKeys.all, 'summary'] as const,
  data: (type?: HealthDataType) => [...healthKeys.all, 'data', type || 'all'] as const,
  provider: () => [...healthKeys.all, 'provider'] as const,
};

/**
 * Get available health provider for this platform.
 */
export function useAvailableProvider() {
  return useQuery({
    queryKey: healthKeys.provider(),
    queryFn: async () => getAvailableProvider(),
    staleTime: Infinity, // Platform doesn't change
  });
}

/**
 * Get wearable connections.
 */
export function useWearableConnections() {
  return useQuery({
    queryKey: healthKeys.connections(),
    queryFn: getConnections,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}

/**
 * Toggle a wearable connection.
 */
export function useToggleConnection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (provider: HealthProvider) => toggleConnection(provider),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: healthKeys.connections() });
    },
  });
}

/**
 * Sync health data from connected providers.
 */
export function useSyncHealth() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (days?: number) => syncHealthData(days),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: healthKeys.all });
    },
  });
}

/**
 * Get today's health summary.
 */
export function useHealthSummary() {
  return useQuery({
    queryKey: healthKeys.summary(),
    queryFn: getTodayHealthSummary,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}

/**
 * Get health data history.
 */
export function useHealthHistory(dataType?: HealthDataType, days: number = 30) {
  return useQuery({
    queryKey: healthKeys.data(dataType),
    queryFn: () => fetchHealthData(dataType, days),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}
