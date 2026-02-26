import { useQuery } from '@tanstack/react-query';
import {
  fetchClientPrograms,
  fetchClientProgram,
  fetchProgramWeeklyMap,
  type WeeklyWorkoutEntry,
} from '../lib/programApi';

export const programKeys = {
  all: ['programs'] as const,
  list: (status?: string) => [...programKeys.all, 'list', status || 'all'] as const,
  detail: (id: string) => [...programKeys.all, 'detail', id] as const,
  weeklyMap: (id: string) => [...programKeys.all, 'weeklyMap', id] as const,
};

export function useClientPrograms(status?: 'active' | 'paused' | 'completed') {
  return useQuery({
    queryKey: programKeys.list(status),
    queryFn: () => fetchClientPrograms(status),
    staleTime: 5 * 60 * 1000, // 5 min
  });
}

export function useClientProgram(assignmentId: string | null) {
  return useQuery({
    queryKey: programKeys.detail(assignmentId || ''),
    queryFn: () => fetchClientProgram(assignmentId!),
    enabled: !!assignmentId,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Returns: { templateId → { weekNumber → { id, completed, completedAt } } }
 */
export function useProgramWeeklyMap(clientProgramId: string | null) {
  return useQuery({
    queryKey: programKeys.weeklyMap(clientProgramId || ''),
    queryFn: () => fetchProgramWeeklyMap(clientProgramId!),
    enabled: !!clientProgramId,
    staleTime: 30 * 1000, // 30s — more frequent to catch completions
  });
}

export type { WeeklyWorkoutEntry };
