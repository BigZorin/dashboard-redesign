import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export const checkInSettingsKeys = {
  all: ['checkInSettings'] as const,
  mine: () => [...checkInSettingsKeys.all, 'mine'] as const,
};

/**
 * Fetch the client's check-in settings (which day is the weekly check-in day).
 * Returns weeklyCheckInDay: 0=Sunday, 1=Monday, ..., 6=Saturday.
 * Default is 0 (Sunday) if no settings exist.
 */
export function useCheckInSettings() {
  return useQuery({
    queryKey: checkInSettingsKeys.mine(),
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('client_check_in_settings')
        .select('weekly_check_in_day')
        .eq('client_id', user.id)
        .maybeSingle();

      // Gracefully handle missing table
      if (error) return { weeklyCheckInDay: 0 };
      return { weeklyCheckInDay: data?.weekly_check_in_day ?? 0 };
    },
    staleTime: 30 * 60 * 1000, // 30 min - settings rarely change
    retry: false,
  });
}
