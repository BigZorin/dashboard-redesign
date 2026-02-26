import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export const checkInKeys = {
  all: ['checkIn'] as const,
  current: () => [...checkInKeys.all, 'current'] as const,
  history: () => [...checkInKeys.all, 'history'] as const,
};

function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

/**
 * Check if user has already submitted a check-in this week.
 */
export function useCurrentCheckIn() {
  return useQuery({
    queryKey: checkInKeys.current(),
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const now = new Date();
      const weekNumber = getWeekNumber(now);

      const { data } = await supabase
        .from('check_ins')
        .select('*')
        .eq('user_id', user.id)
        .eq('week_number', weekNumber)
        .eq('year', now.getFullYear())
        .maybeSingle();

      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export type CheckInRecord = {
  id: string;
  week_number: number;
  year: number;
  weight: number | null;
  feeling: number | null;
  energy_level: number | null;
  sleep_quality: number | null;
  stress_level: number | null;
  nutrition_adherence: number | null;
  training_adherence: number | null;
  notes: string | null;
  created_at: string;
};

/**
 * Fetch all historical check-ins for the current user (last 12).
 */
export function useCheckInHistory() {
  return useQuery({
    queryKey: checkInKeys.history(),
    queryFn: async (): Promise<CheckInRecord[]> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('check_ins')
        .select('*')
        .eq('user_id', user.id)
        .order('year', { ascending: true })
        .order('week_number', { ascending: true })
        .limit(12);

      if (error) throw error;
      return (data || []) as CheckInRecord[];
    },
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Submit a weekly check-in. Invalidates cache so status updates everywhere.
 */
export function useSubmitCheckIn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (answers: {
      feeling: number;
      weight: string;
      energy: number;
      sleep: number;
      stress: number;
      nutrition: number;
      training: number;
      notes?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const now = new Date();
      const weekNumber = getWeekNumber(now);

      const payload = {
        user_id: user.id,
        week_number: weekNumber,
        year: now.getFullYear(),
        feeling: answers.feeling,
        weight: parseFloat(answers.weight),
        energy_level: answers.energy,
        sleep_quality: answers.sleep,
        stress_level: answers.stress,
        nutrition_adherence: answers.nutrition,
        training_adherence: answers.training,
        notes: answers.notes || '',
      };
      console.log('[WeeklyCheckIn] Inserting:', JSON.stringify(payload));

      const { error } = await supabase.from('check_ins').insert(payload);

      if (error) {
        console.error('[WeeklyCheckIn] Supabase error:', error.message, error.code, error.details);
        throw new Error(error.message);
      }
      console.log('[WeeklyCheckIn] Success!');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: checkInKeys.all });
    },
  });
}
