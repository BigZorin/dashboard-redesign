import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../constants/theme';
import { useHabits, useHabitLogs, useHabitStreaks, useToggleHabit } from '../../hooks/useHabits';
import HabitCard from '../../components/HabitCard';
import { Skeleton } from '../../components/Skeleton';

// ============================================================
// TYPES
// ============================================================
export interface HabitData {
  id: string;
  name: string;
  description?: string;
}

export interface HabitLogData {
  habitId: string;
  completed: boolean;
}

export interface HabitStreakData {
  habitId: string;
  currentStreakDays: number;
}

export interface HabitsScreenProps {
  loading?: boolean;
  habits?: HabitData[];
  logs?: HabitLogData[];
  streaks?: HabitStreakData[];
  onToggle?: (habitId: string, date: string, completed: boolean) => void;
  onRefresh?: () => void;
}

// ============================================================
// DEFAULT MOCK DATA
// ============================================================
const defaultHabits: HabitData[] = [
  { id: 'h1', name: '3L water drinken', description: 'Drink minstens 3 liter water per dag' },
  { id: 'h2', name: 'Creatine innemen', description: '5g creatine per dag' },
  { id: 'h3', name: '10.000 stappen', description: 'Minimaal 10k stappen per dag' },
  { id: 'h4', name: '8 uur slaap', description: 'Ga op tijd naar bed' },
];

const defaultLogs: HabitLogData[] = [
  { habitId: 'h1', completed: true },
  { habitId: 'h3', completed: true },
];

const defaultStreaks: HabitStreakData[] = [
  { habitId: 'h1', currentStreakDays: 12 },
  { habitId: 'h2', currentStreakDays: 5 },
  { habitId: 'h3', currentStreakDays: 8 },
  { habitId: 'h4', currentStreakDays: 3 },
];

// ============================================================
// SKELETON STATE
// ============================================================
function HabitsSkeleton() {
  return (
    <View style={{ padding: 20, gap: 12 }}>
      {/* Summary skeleton */}
      <View style={[styles.summaryCard, { paddingVertical: 24 }]}>
        <View>
          <Skeleton height={32} width={60} style={{ marginBottom: 6 }} />
          <Skeleton height={14} width={120} />
        </View>
        <Skeleton width={56} height={56} borderRadius={28} />
      </View>
      {/* Habit cards skeleton */}
      {[1, 2, 3, 4].map((i) => (
        <View key={i} style={styles.skeletonHabitCard}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Skeleton width={44} height={44} borderRadius={22} />
            <View style={{ flex: 1 }}>
              <Skeleton height={16} width="50%" style={{ marginBottom: 6 }} />
              <Skeleton height={12} width="75%" />
            </View>
          </View>
        </View>
      ))}
    </View>
  );
}

// ============================================================
// MAIN COMPONENT
// ============================================================
function getToday(): string {
  const now = new Date();
  return now.toISOString().split('T')[0];
}

export default function HabitsScreen({ navigation, ...props }: HabitsScreenProps & { navigation?: any }) {
  const today = getToday();
  const { data: hookHabits, isLoading: hookLoading, refetch } = useHabits();
  const { data: hookLogs, isLoading: hookLogsLoading } = useHabitLogs(today);
  const { data: hookStreaks } = useHabitStreaks();
  const toggleMutation = useToggleHabit();

  const loading = props.loading ?? (hookLoading || hookLogsLoading);
  const habits = props.habits ?? hookHabits ?? defaultHabits;
  const logs = props.logs ?? hookLogs ?? defaultLogs;
  const streaks = props.streaks ?? hookStreaks ?? defaultStreaks;

  const logsMap = useMemo(() => {
    const map = new Map<string, boolean>();
    (logs || []).forEach((log) => {
      map.set(log.habitId, log.completed);
    });
    return map;
  }, [logs]);

  const streaksMap = useMemo(() => {
    const map = new Map<string, number>();
    (streaks || []).forEach((s) => {
      map.set(s.habitId, s.currentStreakDays);
    });
    return map;
  }, [streaks]);

  const completedCount = habits.filter((h) => logsMap.get(h.id) === true).length;
  const totalCount = habits.length;

  const handleToggle = (habitId: string) => {
    const currentCompleted = logsMap.get(habitId) || false;
    if (props.onToggle) {
      props.onToggle(habitId, today, !currentCompleted);
    } else {
      toggleMutation.mutate({ habitId, date: today, completed: !currentCompleted });
    }
  };

  const handleRefresh = () => {
    if (props.onRefresh) props.onRefresh();
    else refetch();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        {loading ? (
          <>
            <Skeleton height={24} width="40%" style={{ marginBottom: 6 }} />
            <Skeleton height={14} width="55%" />
          </>
        ) : (
          <>
            <Text style={styles.headerTitle}>Gewoontes</Text>
            <Text style={styles.headerDate}>
              {new Date().toLocaleDateString('nl-NL', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
              })}
            </Text>
          </>
        )}
      </View>

      {loading ? (
        <ScrollView><HabitsSkeleton /></ScrollView>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={false} onRefresh={handleRefresh} />}
        >
          {/* Progress summary */}
          {totalCount > 0 && (
            <View style={styles.summaryCard}>
              <View style={styles.summaryLeft}>
                <Text style={styles.summaryCount}>
                  {completedCount}/{totalCount}
                </Text>
                <Text style={styles.summaryLabel}>voltooid vandaag</Text>
              </View>
              <View style={styles.progressCircle}>
                <Text style={styles.progressText}>
                  {totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0}%
                </Text>
              </View>
            </View>
          )}

          {/* Habits list */}
          {totalCount === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="leaf-outline" size={64} color={theme.colors.textTertiary} />
              <Text style={styles.emptyTitle}>Nog geen gewoontes</Text>
              <Text style={styles.emptyText}>
                Je coach kan dagelijkse gewoontes voor je instellen.
              </Text>
            </View>
          ) : (
            <View style={styles.habitsList}>
              {habits.map((habit) => (
                <HabitCard
                  key={habit.id}
                  name={habit.name}
                  description={habit.description}
                  completed={logsMap.get(habit.id) === true}
                  streak={streaksMap.get(habit.id) || 0}
                  isToggling={
                    toggleMutation.isPending &&
                    (toggleMutation.variables as any)?.habitId === habit.id
                  }
                  onToggle={() => handleToggle(habit.id)}
                />
              ))}
            </View>
          )}

          {/* Completion banner */}
          {totalCount > 0 && completedCount === totalCount && (
            <View style={styles.allDoneBanner}>
              <Text style={styles.allDoneText}>Alle gewoontes voltooid!</Text>
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text,
  },
  headerDate: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    ...theme.shadows.md,
  },
  summaryLeft: {},
  summaryCount: {
    fontSize: 32,
    fontWeight: '700',
    color: theme.colors.text,
  },
  summaryLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  progressCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#d1fae5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#065f46',
  },
  habitsList: {},
  skeletonHabitCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 16,
    ...theme.shadows.sm,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 40,
  },
  allDoneBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#d1fae5',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  allDoneText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#065f46',
  },
});
