import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../constants/theme';
import { useHabits, useHabitLogs, useHabitStreaks, useToggleHabit } from '../../hooks/useHabits';
import HabitCard from '../../components/HabitCard';
import StreakBadge from '../../components/StreakBadge';

function getToday(): string {
  const now = new Date();
  return now.toISOString().split('T')[0];
}

export default function HabitsScreen({ navigation }: any) {
  const today = getToday();
  const { data: habits, isLoading: habitsLoading, refetch } = useHabits();
  const { data: logs, isLoading: logsLoading } = useHabitLogs(today);
  const { data: streaks } = useHabitStreaks();
  const toggleMutation = useToggleHabit();

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

  const completedCount = habits?.filter((h) => logsMap.get(h.id) === true).length || 0;
  const totalCount = habits?.length || 0;

  const isLoading = habitsLoading || logsLoading;

  const handleToggle = (habitId: string) => {
    const currentCompleted = logsMap.get(habitId) || false;
    toggleMutation.mutate({
      habitId,
      date: today,
      completed: !currentCompleted,
    });
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Gewoontes</Text>
        <Text style={styles.headerDate}>
          {new Date().toLocaleDateString('nl-NL', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
          })}
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={false} onRefresh={() => refetch()} />}
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
            <Ionicons name="leaf-outline" size={64} color="#ccc" />
            <Text style={styles.emptyTitle}>Nog geen gewoontes</Text>
            <Text style={styles.emptyText}>
              Je coach kan dagelijkse gewoontes voor je instellen.
            </Text>
          </View>
        ) : (
          <View style={styles.habitsList}>
            {habits?.map((habit) => (
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
            <Text style={styles.allDoneEmoji}>🎉</Text>
            <Text style={styles.allDoneText}>Alle gewoontes voltooid!</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
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
  allDoneEmoji: {
    fontSize: 24,
  },
  allDoneText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#065f46',
  },
});
