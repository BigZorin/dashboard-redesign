import { supabase } from './supabase';

export type HabitRecord = {
  id: string;
  clientId: string;
  coachId: string;
  name: string;
  description: string | null;
  targetFrequency: string;
  targetCount: number;
  isActive: boolean;
  createdAt: string;
};

export type HabitLogRecord = {
  id: string;
  habitId: string;
  date: string;
  completed: boolean;
  notes: string | null;
  loggedAt: string;
};

export type HabitStreakRecord = {
  id: string;
  habitId: string;
  currentStreakDays: number;
  longestStreakDays: number;
  lastCompletedDate: string | null;
};

function transformHabit(h: any): HabitRecord {
  return {
    id: h.id,
    clientId: h.client_id,
    coachId: h.coach_id,
    name: h.name,
    description: h.description,
    targetFrequency: h.target_frequency,
    targetCount: h.target_count,
    isActive: h.is_active,
    createdAt: h.created_at,
  };
}

function transformHabitLog(l: any): HabitLogRecord {
  return {
    id: l.id,
    habitId: l.habit_id,
    date: l.date,
    completed: l.completed,
    notes: l.notes,
    loggedAt: l.logged_at,
  };
}

function transformStreak(s: any): HabitStreakRecord {
  return {
    id: s.id,
    habitId: s.habit_id,
    currentStreakDays: s.current_streak_days,
    longestStreakDays: s.longest_streak_days,
    lastCompletedDate: s.last_completed_date,
  };
}

export async function fetchHabits(): Promise<HabitRecord[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('habits')
    .select('*')
    .eq('client_id', user.id)
    .eq('is_active', true)
    .order('created_at', { ascending: true });

  if (error) return [];
  return (data || []).map(transformHabit);
}

export async function fetchHabitLogs(date: string): Promise<HabitLogRecord[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // First get user's habit IDs
  const { data: habits, error: habitsError } = await supabase
    .from('habits')
    .select('id')
    .eq('client_id', user.id)
    .eq('is_active', true);

  if (habitsError || !habits?.length) return [];

  const habitIds = habits.map((h: any) => h.id);

  const { data, error } = await supabase
    .from('habit_logs')
    .select('*')
    .in('habit_id', habitIds)
    .eq('date', date);

  if (error) return [];
  return (data || []).map(transformHabitLog);
}

export async function fetchHabitStreaks(): Promise<HabitStreakRecord[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: habits, error: habitsError } = await supabase
    .from('habits')
    .select('id')
    .eq('client_id', user.id)
    .eq('is_active', true);

  if (habitsError || !habits?.length) return [];

  const habitIds = habits.map((h: any) => h.id);

  const { data, error } = await supabase
    .from('habit_streaks')
    .select('*')
    .in('habit_id', habitIds);

  if (error) return [];
  return (data || []).map(transformStreak);
}

export async function toggleHabitLog(habitId: string, date: string, completed: boolean): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Upsert the habit log
  const { error } = await supabase
    .from('habit_logs')
    .upsert(
      {
        habit_id: habitId,
        date,
        completed,
        logged_at: new Date().toISOString(),
      },
      { onConflict: 'habit_id,date' }
    );

  if (error) throw error;

  // Update streak
  await updateStreak(habitId, date, completed);
}

async function updateStreak(habitId: string, date: string, completed: boolean) {
  if (completed) {
    // Get current streak
    const { data: streak } = await supabase
      .from('habit_streaks')
      .select('*')
      .eq('habit_id', habitId)
      .maybeSingle();

    const yesterday = new Date(date);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    let newStreak = 1;
    if (streak && streak.last_completed_date === yesterdayStr) {
      newStreak = (streak.current_streak_days || 0) + 1;
    } else if (streak && streak.last_completed_date === date) {
      return; // Already counted
    }

    const longestStreak = streak
      ? Math.max(streak.longest_streak_days || 0, newStreak)
      : newStreak;

    await supabase.from('habit_streaks').upsert(
      {
        habit_id: habitId,
        current_streak_days: newStreak,
        longest_streak_days: longestStreak,
        last_completed_date: date,
      },
      { onConflict: 'habit_id' }
    );
  } else {
    // Unchecking: reset current streak
    await supabase
      .from('habit_streaks')
      .update({ current_streak_days: 0, last_completed_date: null })
      .eq('habit_id', habitId);
  }
}
