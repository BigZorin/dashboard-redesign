import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export const dailyCheckInKeys = {
  all: ['dailyCheckIn'] as const,
  today: () => [...dailyCheckInKeys.all, 'today'] as const,
  history: (days?: number) => [...dailyCheckInKeys.all, 'history', days] as const,
};

function getTodayDateString(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

export type DailyCheckInRecord = {
  id: string;
  user_id: string;
  check_in_date: string;
  weight: number | null;
  mood: number | null;
  sleep_quality: number | null;
  notes: string | null;
  created_at: string;
};

/**
 * Check if user has already submitted a daily check-in today.
 */
export function useTodayCheckIn() {
  return useQuery({
    queryKey: dailyCheckInKeys.today(),
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const today = getTodayDateString();

      const { data, error } = await supabase
        .from('daily_check_ins')
        .select('*')
        .eq('user_id', user.id)
        .eq('check_in_date', today)
        .maybeSingle();

      // Gracefully handle missing table (migration not yet run)
      if (error) return null;
      return data;
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Fetch daily check-in history (last N days).
 * Used for weight chart and trend displays.
 */
export function useDailyCheckInHistory(days: number = 30) {
  return useQuery({
    queryKey: dailyCheckInKeys.history(days),
    queryFn: async (): Promise<DailyCheckInRecord[]> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('daily_check_ins')
        .select('*')
        .eq('user_id', user.id)
        .order('check_in_date', { ascending: true })
        .limit(days);

      // Gracefully handle missing table (migration not yet run)
      if (error) return [];
      return (data || []) as DailyCheckInRecord[];
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Submit a daily check-in. Invalidates cache so status updates everywhere.
 */
export function useSubmitDailyCheckIn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (answers: {
      weight?: string;
      mood: number;
      sleep: number;
      notes?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const today = getTodayDateString();

      const payload = {
        user_id: user.id,
        check_in_date: today,
        weight: answers.weight ? parseFloat(answers.weight) : null,
        mood: answers.mood,
        sleep_quality: answers.sleep,
        notes: answers.notes || null,
      };
      console.log('[DailyCheckIn] Inserting:', JSON.stringify(payload));

      const { error } = await supabase.from('daily_check_ins').insert(payload);

      if (error) {
        console.error('[DailyCheckIn] Supabase error:', error.message, error.code, error.details);
        throw new Error(error.message);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dailyCheckInKeys.all });
    },
  });
}
