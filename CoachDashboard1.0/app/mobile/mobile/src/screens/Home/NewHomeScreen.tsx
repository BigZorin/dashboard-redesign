import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useUser } from '../../hooks/useUser';
import { useWorkouts } from '../../hooks/useWorkouts';
import { useCurrentCheckIn } from '../../hooks/useCheckIn';
import { useTodayCheckIn } from '../../hooks/useDailyCheckIn';
import { useHabits, useHabitLogs } from '../../hooks/useHabits';
import { useUnreadCount } from '../../hooks/useMessages';
import { useDailyMacros, useNutritionTargets } from '../../hooks/useNutrition';
import { useHealthSummary, useWearableConnections } from '../../hooks/useHealthData';
import { useCheckInSettings } from '../../hooks/useCheckInSettings';
import { useProgressChartData } from '../../hooks/useProgressChartData';
import ProgressChartsSection from './ProgressChartsSection';
import MacroRing from '../../components/MacroRing';
import { theme } from '../../constants/theme';

const evotionFavicon = require('../../../assets/images/evotion-favicon-wit.png');

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Goedemorgen';
  if (hour < 18) return 'Goedemiddag';
  return 'Goedenavond';
}

function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Zojuist';
  if (diffMins < 60) return `${diffMins} min geleden`;
  if (diffHours < 24) return `${diffHours} uur geleden`;
  if (diffDays === 1) return 'Gisteren';
  if (diffDays < 7) return `${diffDays} dagen geleden`;
  return date.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' });
}

function formatScheduledDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const scheduled = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.round((scheduled.getTime() - today.getTime()) / 86400000);

  if (diffDays === 0) return 'Vandaag';
  if (diffDays === 1) return 'Morgen';
  return date.toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'short' });
}

export default function NewHomeScreen() {
  const navigation = useNavigation();
  const { data: userData } = useUser();
  const { data: workouts = [], isLoading: workoutsLoading } = useWorkouts('all');
  const { data: currentCheckIn, isLoading: checkInLoading } = useCurrentCheckIn();
  const { data: todayCheckIn, isLoading: dailyCheckInLoading } = useTodayCheckIn();

  const today = new Date().toISOString().split('T')[0];
  const { data: habits = [] } = useHabits();
  const { data: habitLogs = [] } = useHabitLogs(today);

  const habitsCompletedToday = habits.filter((h: any) => habitLogs.some((l: any) => l.habitId === h.id && l.completed)).length;
  const totalHabits = habits.length;

  const { data: unreadCount = 0 } = useUnreadCount();
  const todayMacros = useDailyMacros(today);
  const { data: nutritionTargets } = useNutritionTargets();
  const { data: healthSummary } = useHealthSummary();
  const { data: wearableConnections = [] } = useWearableConnections();
  const hasWearableConnected = wearableConnections.some((c) => c.isConnected);

  const upcomingWorkouts = workouts.filter((w: any) => !w.completed);
  const completedWorkouts = workouts.filter((w: any) => w.completed);
  const { data: checkInSettings } = useCheckInSettings();
  const todayDayOfWeek = new Date().getDay(); // 0=Sunday, 1=Monday, ..., 6=Saturday
  const isWeeklyDay = todayDayOfWeek === (checkInSettings?.weeklyCheckInDay ?? 0);

  // Weekly banner: only on the coach-configured day + if not yet done this week
  const weeklyCheckInDue = !checkInLoading && !currentCheckIn && isWeeklyDay;
  // Daily banner: only on non-weekly days + if not yet done today
  const dailyCheckInDue = !dailyCheckInLoading && !todayCheckIn && !isWeeklyDay;

  const { checkInStreak } = useProgressChartData();

  // Today's scheduled workout
  const todayDateStr = new Date().toISOString().split('T')[0];
  const todayWorkout = upcomingWorkouts.find((w: any) => {
    if (!w.scheduledDate) return false;
    return w.scheduledDate.split('T')[0] === todayDateStr;
  });

  // Next upcoming workout (sorted by scheduled date)
  const nextWorkout = upcomingWorkouts
    .filter((w: any) => w.scheduledDate)
    .sort((a: any, b: any) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime())[0]
    || upcomingWorkouts[0];

  // Recent completed workouts for activity feed
  const recentCompleted = completedWorkouts
    .filter((w: any) => w.completedAt)
    .sort((a: any, b: any) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
    .slice(0, 3);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Branded Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.iconContainer}>
            <Image source={evotionFavicon} style={styles.headerLogo} />
          </View>
          <View>
            <Text style={styles.headerGreeting}>{getGreeting()},</Text>
            <Text style={styles.headerName}>
              {userData?.profile?.first_name || 'daar'}
            </Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.headerIconBtn}
            onPress={() => navigation.navigate('ChatList' as never)}
          >
            <Ionicons name="chatbubble" size={20} color="#fff" />
            {unreadCount > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadBadgeText}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.avatarBtn}
            onPress={() => navigation.navigate('Meer' as never)}
          >
            {userData?.profile?.first_name ? (
              <Text style={styles.avatarInitials}>
                {(userData.profile.first_name[0] || '').toUpperCase()}
                {(userData.profile.last_name?.[0] || '').toUpperCase()}
              </Text>
            ) : (
              <Ionicons name="person" size={18} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollArea}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >

        {/* Daily Check-in Banner */}
        {dailyCheckInDue && (
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.dailyCheckInCard}
              onPress={() => navigation.navigate('DailyCheckIn' as never)}
            >
              <View style={styles.checkInContent}>
                <View style={styles.dailyCheckInIcon}>
                  <Ionicons name="today" size={24} color={theme.colors.primary} />
                </View>
                <View style={styles.checkInText}>
                  <Text style={styles.dailyCheckInTitle}>Dagelijkse Check-in</Text>
                  <Text style={styles.dailyCheckInSubtitle}>Gewicht, stemming & slaap</Text>
                </View>
                <Ionicons name="chevron-forward" size={22} color={theme.colors.textTertiary} />
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* Weekly Check-in Banner */}
        {weeklyCheckInDue && (
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.checkInCard}
              onPress={() => navigation.navigate('CheckIn' as never)}
            >
              <View style={styles.checkInContent}>
                <View style={styles.checkInIcon}>
                  <Ionicons name="clipboard" size={28} color="#fff" />
                </View>
                <View style={styles.checkInText}>
                  <Text style={styles.checkInTitle}>Wekelijkse Check-in</Text>
                  <Text style={styles.checkInSubtitle}>Beantwoord 8 vragen voor je coach</Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color="#fff" />
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* Quick Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>OVERZICHT</Text>
          <View style={styles.statsRow}>
            {/* Calories Ring */}
            <View style={styles.statCard}>
              <MacroRing
                value={todayMacros.calories}
                target={nutritionTargets?.dailyCalories || 0}
                label="kcal"
                color="#FF6B35"
                size={56}
              />
              <Text style={styles.statLabel}>Calorie\u00ebn</Text>
            </View>

            {/* Today's Training */}
            <TouchableOpacity
              style={styles.statCard}
              onPress={() => {
                if (todayWorkout) {
                  navigation.navigate('Training' as never, {
                    screen: 'WorkoutDetail',
                    params: { workoutId: todayWorkout.id },
                  } as never);
                } else {
                  navigation.navigate('Training' as never);
                }
              }}
            >
              <View style={[styles.statIconBg, { backgroundColor: todayWorkout ? '#007AFF20' : `${theme.colors.border}80` }]}>
                <Ionicons
                  name={todayWorkout ? 'barbell' : 'bed'}
                  size={22}
                  color={todayWorkout ? '#007AFF' : theme.colors.textTertiary}
                />
              </View>
              <Text style={styles.statValueSmall} numberOfLines={1}>
                {workoutsLoading ? '...' : todayWorkout ? todayWorkout.workoutTemplate?.name || 'Training' : 'Rustdag'}
              </Text>
              <Text style={styles.statLabel}>Vandaag</Text>
            </TouchableOpacity>

            {/* Check-in Streak */}
            <View style={styles.statCard}>
              <View style={[styles.statIconBg, { backgroundColor: checkInStreak > 0 ? '#FF950020' : `${theme.colors.border}80` }]}>
                <Ionicons
                  name="flame"
                  size={22}
                  color={checkInStreak > 0 ? '#FF9500' : theme.colors.textTertiary}
                />
              </View>
              <Text style={styles.statValue}>{checkInStreak}</Text>
              <Text style={styles.statLabel}>{checkInStreak === 1 ? 'dag' : 'dagen'}</Text>
            </View>
          </View>
        </View>

        {/* Habits Card */}
        {totalHabits > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>GEWOONTES</Text>
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate('Habits' as never)}
            >
              <View style={styles.cardHeader}>
                <View style={[styles.cardIconBg, { backgroundColor: habitsCompletedToday === totalHabits ? '#34C75915' : '#FF950015' }]}>
                  <Ionicons
                    name={habitsCompletedToday === totalHabits ? 'checkmark-circle' : 'leaf'}
                    size={22}
                    color={habitsCompletedToday === totalHabits ? '#34C759' : '#FF9500'}
                  />
                </View>
                <View style={styles.cardHeaderText}>
                  <Text style={styles.cardTitle}>
                    {habitsCompletedToday}/{totalHabits} voltooid
                  </Text>
                  <Text style={{ fontSize: 13, color: theme.colors.textSecondary }}>
                    {habitsCompletedToday === totalHabits ? 'Alles gedaan vandaag!' : 'Tik om je gewoontes te bekijken'}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* Nutrition Summary Card */}
        {todayMacros.calories > 0 && (
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate('Voeding' as never)}
            >
              <View style={styles.cardHeader}>
                <View style={[styles.cardIconBg, { backgroundColor: '#FF6B3515' }]}>
                  <Ionicons name="nutrition" size={22} color="#FF6B35" />
                </View>
                <View style={styles.cardHeaderText}>
                  <Text style={styles.cardTitle}>
                    {todayMacros.calories}{nutritionTargets?.dailyCalories ? ` / ${nutritionTargets.dailyCalories}` : ''} kcal
                  </Text>
                  <Text style={{ fontSize: 13, color: theme.colors.textSecondary }}>
                    E{todayMacros.protein}g | K{todayMacros.carbs}g | V{todayMacros.fat}g
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* Health Data Card */}
        {hasWearableConnected && healthSummary && (healthSummary.steps > 0 || healthSummary.sleepHours > 0) && (
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate('Meer' as never)}
            >
              <View style={styles.cardHeader}>
                <View style={[styles.cardIconBg, { backgroundColor: '#34C75915' }]}>
                  <Ionicons name="heart" size={22} color={theme.colors.success} />
                </View>
                <View style={styles.cardHeaderText}>
                  <Text style={styles.cardTitle}>
                    {healthSummary.steps > 0 ? `${healthSummary.steps.toLocaleString('nl-NL')} stappen` : 'Gezondheidsdata'}
                  </Text>
                  <Text style={{ fontSize: 13, color: theme.colors.textSecondary }}>
                    {[
                      healthSummary.sleepHours > 0 ? `${healthSummary.sleepHours}u slaap` : null,
                      healthSummary.heartRate > 0 ? `${healthSummary.heartRate} bpm` : null,
                      healthSummary.activeCalories > 0 ? `${healthSummary.activeCalories} kcal` : null,
                    ].filter(Boolean).join(' · ') || 'Bekijk je gezondheidsoverzicht'}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* Progress Photos Card */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('ProgressPhotos' as never)}
          >
            <View style={styles.cardHeader}>
              <View style={[styles.cardIconBg, { backgroundColor: '#8B5CF615' }]}>
                <Ionicons name="images" size={22} color="#8B5CF6" />
              </View>
              <View style={styles.cardHeaderText}>
                <Text style={styles.cardTitle}>Voortgangsfoto's</Text>
                <Text style={{ fontSize: 13, color: theme.colors.textSecondary }}>
                  Leg je transformatie vast
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Progress Charts (Weight, Mood/Sleep, Compliance, Metrics) */}
        <ProgressChartsSection />

        {/* Next Workout */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>VOLGENDE TRAINING</Text>
          {workoutsLoading ? (
            <View style={styles.card}>
              <ActivityIndicator size="small" color={theme.colors.primary} />
            </View>
          ) : nextWorkout ? (
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate('Training' as never, {
                screen: 'WorkoutDetail',
                params: { workoutId: nextWorkout.id },
              } as never)}
            >
              <View style={styles.cardHeader}>
                <View style={styles.cardIconBg}>
                  <Ionicons name="barbell" size={22} color="#007AFF" />
                </View>
                <View style={styles.cardHeaderText}>
                  <Text style={styles.cardTitle}>{nextWorkout.workoutTemplate?.name}</Text>
                  {nextWorkout.scheduledDate && (
                    <Text style={styles.cardDate}>
                      {formatScheduledDate(nextWorkout.scheduledDate)}
                    </Text>
                  )}
                </View>
                <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
              </View>
              <View style={styles.cardMeta}>
                {nextWorkout.workoutTemplate?.durationMinutes && (
                  <View style={styles.metaItem}>
                    <Ionicons name="time-outline" size={14} color={theme.colors.textSecondary} />
                    <Text style={styles.metaText}>{nextWorkout.workoutTemplate.durationMinutes} min</Text>
                  </View>
                )}
                <View style={styles.metaItem}>
                  <Ionicons name="list-outline" size={14} color={theme.colors.textSecondary} />
                  <Text style={styles.metaText}>
                    {nextWorkout.workoutTemplate?.exercises?.length || 0} oefeningen
                  </Text>
                </View>
                {nextWorkout.coach?.profile?.firstName && (
                  <View style={styles.metaItem}>
                    <Ionicons name="person-outline" size={14} color={theme.colors.textSecondary} />
                    <Text style={styles.metaText}>
                      {nextWorkout.coach.profile.firstName}
                    </Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ) : (
            <View style={styles.emptyCard}>
              <Ionicons name="barbell-outline" size={32} color="#C7C7CC" />
              <Text style={styles.emptyText}>Geen openstaande trainingen</Text>
            </View>
          )}
        </View>

        {/* All Upcoming Workouts (if more than 1) */}
        {upcomingWorkouts.length > 1 && (
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>GEPLAND</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Training' as never)}>
                <Text style={styles.seeAllText}>Bekijk alles</Text>
              </TouchableOpacity>
            </View>
            {upcomingWorkouts.slice(1, 4).map((workout: any) => (
              <TouchableOpacity
                key={workout.id}
                style={styles.miniCard}
                onPress={() => navigation.navigate('Training' as never, {
                  screen: 'WorkoutDetail',
                  params: { workoutId: workout.id },
                } as never)}
              >
                <View style={styles.miniCardLeft}>
                  <View style={styles.miniDot} />
                  <View>
                    <Text style={styles.miniTitle}>{workout.workoutTemplate?.name}</Text>
                    {workout.scheduledDate && (
                      <Text style={styles.miniDate}>
                        {formatScheduledDate(workout.scheduledDate)}
                      </Text>
                    )}
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#C7C7CC" />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Recent Activity */}
        {recentCompleted.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>RECENTE ACTIVITEIT</Text>
            <View style={styles.activityCard}>
              {recentCompleted.map((workout: any, index: number) => (
                <View
                  key={workout.id}
                  style={[
                    styles.activityItem,
                    index === recentCompleted.length - 1 && { borderBottomWidth: 0 },
                  ]}
                >
                  <View style={styles.activityIconBg}>
                    <Ionicons name="checkmark" size={16} color="#34C759" />
                  </View>
                  <View style={styles.activityContent}>
                    <Text style={styles.activityTitle}>
                      {workout.workoutTemplate?.name}
                    </Text>
                    <Text style={styles.activityTime}>
                      {formatRelativeDate(workout.completedAt)}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.primary, // status bar area matches header
  },
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: theme.colors.primary,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerLogo: {
    width: 22,
    height: 22,
    resizeMode: 'contain',
  },
  headerGreeting: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  headerName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    position: 'relative' as const,
    alignItems: 'center',
  },
  avatarBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitials: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
  },
  scrollArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    paddingBottom: 100,
    paddingTop: 20,
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.textTertiary,
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.secondary,
  },
  // Check-in card
  checkInCard: {
    backgroundColor: theme.colors.primary,
    borderRadius: 16,
    padding: 20,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  checkInContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkInIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  checkInText: {
    flex: 1,
  },
  checkInTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  checkInSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  // Daily check-in card (light style)
  dailyCheckInCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1.5,
    borderColor: theme.colors.primary + '30',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  dailyCheckInIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.primary + '12',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  dailyCheckInTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 3,
  },
  dailyCheckInSubtitle: {
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  // Stats
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  statIconBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.colors.text,
  },
  statValueSmall: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    textAlign: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.textTertiary,
    marginTop: 2,
  },
  // Workout card
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardIconBg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#007AFF15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardHeaderText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 2,
  },
  cardDate: {
    fontSize: 14,
    color: theme.colors.secondary,
    fontWeight: '500',
  },
  cardMeta: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  // Empty state
  emptyCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    gap: 8,
  },
  emptyText: {
    fontSize: 14,
    color: theme.colors.textTertiary,
  },
  // Mini workout list
  miniCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.surface,
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
  },
  miniCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  miniDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.secondary,
  },
  miniTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: theme.colors.text,
  },
  miniDate: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  // Activity
  activityCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  activityIconBg: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#34C75920',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: theme.colors.text,
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 13,
    color: theme.colors.textTertiary,
  },
  unreadBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: theme.colors.error,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  unreadBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
});
