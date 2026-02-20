import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useUser } from '../../hooks/useUser';
import { useTodayCheckIn, useDailyCheckInHistory } from '../../hooks/useDailyCheckIn';
import { useCurrentCheckIn } from '../../hooks/useCheckIn';
import { useCheckInSettings } from '../../hooks/useCheckInSettings';
import { useWorkouts } from '../../hooks/useWorkouts';
import { useProgressChartData } from '../../hooks/useProgressChartData';
import { useDailyMacros, useNutritionTargets } from '../../hooks/useNutrition';
import { useActiveMealPlan } from '../../hooks/useMealPlan';
import { useHabits, useHabitLogs, useToggleHabit } from '../../hooks/useHabits';
import { useUnreadCount } from '../../hooks/useMessages';
import { theme } from '../../constants/theme';
import MacroRing from '../../components/MacroRing';
import WeightTrendCard from '../../components/charts/WeightTrendCard';

const evotionFavicon = require('../../../assets/images/evotion-favicon-wit.png');
const { width: SCREEN_WIDTH } = Dimensions.get('window');

function getToday() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const DAY_NAMES = ['Zo', 'Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za'];
const DAY_NAMES_FULL = ['Zondag', 'Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag'];

function getDateStr(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Goedemorgen';
  if (h < 18) return 'Goedemiddag';
  return 'Goedenavond';
}

export default function HomeScreen() {
  const navigation = useNavigation();
  const { data: userData } = useUser();
  const { data: todayCheckIn, isLoading: dailyLoading } = useTodayCheckIn();
  const { data: weeklyCheckIn, isLoading: weeklyLoading } = useCurrentCheckIn();
  const { data: checkInSettings } = useCheckInSettings();
  const { data: allWorkouts = [] } = useWorkouts('all');
  const { weightData } = useProgressChartData();
  const { data: nutritionTargets } = useNutritionTargets();
  const { data: unreadCount = 0 } = useUnreadCount();
  const { data: mealPlan } = useActiveMealPlan();

  const today = getToday();
  const macros = useDailyMacros(today);

  const { data: habits = [] } = useHabits();
  const { data: habitLogs = [] } = useHabitLogs(today);
  const toggleHabit = useToggleHabit();

  const { data: checkInHistory = [] } = useDailyCheckInHistory(14);

  const firstName = userData?.profile?.first_name || 'daar';
  const hasDailyCheckIn = !dailyLoading && !!todayCheckIn;

  // Build 5-day strip
  const weekStrip = useMemo(() => {
    const completedDates = new Set(
      checkInHistory.map((c: any) => c.check_in_date || c.checkInDate)
    );
    if (todayCheckIn) completedDates.add(today);
    const days = [];
    const now = new Date();
    for (let i = -4; i <= 0; i++) {
      const d = new Date(now);
      d.setDate(now.getDate() + i);
      const dateStr = getDateStr(d);
      const isToday = i === 0;
      const isPast = i < 0;
      const completed = completedDates.has(dateStr);
      days.push({ key: dateStr, dayName: DAY_NAMES[d.getDay()], dayNum: d.getDate(), isToday, isPast, completed });
    }
    return days;
  }, [checkInHistory, todayCheckIn, today]);

  const todayDayOfWeek = new Date().getDay();
  const isWeeklyDay = todayDayOfWeek === (checkInSettings?.weeklyCheckInDay ?? 0);
  const weeklyCheckInDue = !weeklyLoading && !weeklyCheckIn && isWeeklyDay;

  // Today's workout
  const { todaysWorkout, nextWorkout, nextWorkoutDay } = useMemo(() => {
    const uncompleted = allWorkouts
      .filter((w: any) => !w.completed)
      .map((w: any) => ({ ...w, _date: w.scheduledDate || w.scheduled_date || '' }))
      .sort((a: any, b: any) => a._date.localeCompare(b._date));
    const todayW = uncompleted.find((w: any) => w._date.startsWith(today)) || null;
    let nextW = null;
    let nextDay = '';
    if (!todayW) {
      nextW = uncompleted.find((w: any) => w._date > today) || uncompleted[0] || null;
      if (nextW) {
        const d = new Date(nextW._date);
        if (!isNaN(d.getTime())) {
          const todayDate = new Date(today);
          const diffDays = Math.round((d.getTime() - todayDate.getTime()) / 86400000);
          if (diffDays === 1) nextDay = 'Morgen';
          else if (diffDays > 1 && diffDays < 7) nextDay = DAY_NAMES_FULL[d.getDay()];
          else if (nextW._date) nextDay = `${d.getDate()} ${['jan','feb','mrt','apr','mei','jun','jul','aug','sep','okt','nov','dec'][d.getMonth()]}`;
        }
      }
    }
    return { todaysWorkout: todayW, nextWorkout: nextW, nextWorkoutDay: nextDay };
  }, [allWorkouts, today]);

  // Nutrition targets
  const calTarget = nutritionTargets?.dailyCalories || mealPlan?.dailyCalories || 0;
  const proteinTarget = nutritionTargets?.dailyProteinGrams || mealPlan?.proteinGrams || 0;
  const carbsTarget = nutritionTargets?.dailyCarbsGrams || mealPlan?.carbsGrams || 0;
  const fatTarget = nutritionTargets?.dailyFatGrams || mealPlan?.fatGrams || 0;
  const hasNutritionTargets = calTarget > 0 || proteinTarget > 0;

  const todayMealPlanMeals = useMemo(() => {
    if (!mealPlan?.entries?.length) return 0;
    const jsDay = new Date().getDay();
    const dayOfWeek = jsDay === 0 ? 7 : jsDay;
    return mealPlan.entries.filter((e) => e.dayOfWeek === dayOfWeek).length;
  }, [mealPlan]);

  // Habits
  const completedHabitIds = new Set(habitLogs.map((l: any) => l.habit_id || l.habitId));
  const activeHabits = habits.filter((h: any) => h.is_active !== false);

  return (
    <View style={styles.container}>
      {/* Gradient Header */}
      <LinearGradient
        colors={theme.gradients.headerSubtle}
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <SafeAreaView edges={['top']} style={styles.headerSafe}>
          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              <View style={styles.logoWrap}>
                <Image source={evotionFavicon} style={styles.headerLogo} resizeMode="contain" />
              </View>
              <View>
                <Text style={styles.greeting}>{getGreeting()},</Text>
                <Text style={styles.name}>{firstName}</Text>
              </View>
            </View>

            <View style={styles.headerRight}>
              <TouchableOpacity
                style={styles.headerBtn}
                onPress={() => navigation.navigate('Notifications' as never)}
              >
                <Ionicons name="notifications-outline" size={20} color="rgba(255,255,255,0.9)" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.headerBtn}
                onPress={() => navigation.navigate('ChatList' as never)}
              >
                <Ionicons name="chatbubble-outline" size={19} color="rgba(255,255,255,0.9)" />
                {unreadCount > 0 && (
                  <View style={styles.unreadBadge}>
                    <Text style={styles.unreadText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        style={styles.scrollView}
      >
        {/* Week Strip Check-in Card */}
        <View style={[styles.card, styles.cardFirst]}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Dagelijkse check-in</Text>
            {hasDailyCheckIn && (
              <View style={styles.doneBadge}>
                <Ionicons name="checkmark-circle" size={14} color={theme.colors.success} />
                <Text style={styles.doneBadgeText}>Klaar</Text>
              </View>
            )}
          </View>
          <View style={styles.weekStripRow}>
            {weekStrip.map((day) => {
              const isCompleted = day.completed;
              const isMissed = day.isPast && !isCompleted;
              return (
                <TouchableOpacity
                  key={day.key}
                  style={[
                    styles.weekStripTile,
                    isMissed && styles.weekStripTileMissed,
                    isCompleted && !day.isToday && styles.weekStripTilePastDone,
                    day.isToday && (isCompleted ? styles.weekStripTileTodayDone : styles.weekStripTileToday),
                  ]}
                  activeOpacity={day.isToday ? 0.7 : 1}
                  onPress={day.isToday ? () => navigation.navigate('DailyCheckIn' as never) : undefined}
                >
                  {isCompleted && (
                    <Ionicons
                      name="checkmark"
                      size={day.isToday ? 18 : 14}
                      color={day.isToday ? theme.colors.textOnPrimary : theme.colors.success}
                      style={{ marginBottom: 1 }}
                    />
                  )}
                  <Text style={[
                    styles.weekStripDayName,
                    isMissed && { color: theme.colors.textTertiary },
                    isCompleted && !day.isToday && { color: theme.colors.success },
                    day.isToday && { color: 'rgba(255,255,255,0.7)' },
                  ]}>
                    {day.dayName.toUpperCase()}
                  </Text>
                  <Text style={[
                    styles.weekStripDayNum,
                    isMissed && { color: theme.colors.textTertiary },
                    isCompleted && !day.isToday && { color: theme.colors.success },
                    day.isToday && { color: theme.colors.textOnPrimary, fontSize: 17 },
                  ]}>
                    {day.dayNum}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Weekly Check-in CTA */}
        {weeklyCheckInDue && (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => navigation.navigate('CheckIn' as never)}
          >
            <LinearGradient
              colors={theme.gradients.header}
              style={styles.weeklyCard}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.weeklyIconCircle}>
                <Ionicons name="clipboard-outline" size={26} color={theme.colors.textOnPrimary} />
              </View>
              <View style={styles.weeklyText}>
                <Text style={styles.weeklyTitle}>Tijd voor je wekelijkse check-in</Text>
                <Text style={styles.weeklySub}>Deel je voortgang met je coach</Text>
              </View>
              <View style={styles.weeklyArrow}>
                <Ionicons name="arrow-forward" size={18} color="rgba(255,255,255,0.6)" />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* Training Card */}
        {todaysWorkout && (
          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.7}
            onPress={() => (navigation as any).navigate('WorkoutDetail', { id: todaysWorkout.id })}
          >
            <View style={styles.trainingRow}>
              <View style={styles.trainingIconWrap}>
                <Ionicons name="barbell-outline" size={22} color={theme.colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.trainingLabel}>Training vandaag</Text>
                <Text style={styles.trainingName} numberOfLines={1}>
                  {todaysWorkout.workoutTemplate?.name || 'Workout'}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.startBtn}
                onPress={() => (navigation as any).navigate('ActiveWorkout', { id: todaysWorkout.id })}
              >
                <Ionicons name="play" size={14} color={theme.colors.textOnPrimary} />
                <Text style={styles.startBtnText}>Start</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}

        {!todaysWorkout && nextWorkout && (
          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.7}
            onPress={() => (navigation as any).navigate('WorkoutDetail', { id: nextWorkout.id })}
          >
            <View style={styles.trainingRow}>
              <View style={[styles.trainingIconWrap, { backgroundColor: theme.colors.primaryLight }]}>
                <Ionicons name="barbell-outline" size={22} color={theme.colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.trainingLabel, { color: theme.colors.textSecondary }]}>
                  Volgende training{nextWorkoutDay ? ` \u00B7 ${nextWorkoutDay}` : ''}
                </Text>
                <Text style={styles.trainingName} numberOfLines={1}>
                  {nextWorkout.workoutTemplate?.name || 'Workout'}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={theme.colors.textTertiary} />
            </View>
          </TouchableOpacity>
        )}

        {/* Nutrition Card */}
        <TouchableOpacity
          style={styles.card}
          activeOpacity={0.7}
          onPress={() => (navigation as any).navigate('Voeding')}
        >
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Voeding vandaag</Text>
            {todayMealPlanMeals > 0 && (
              <View style={styles.mealPlanBadge}>
                <Ionicons name="restaurant-outline" size={11} color={theme.colors.primary} />
                <Text style={styles.mealPlanBadgeText}>{todayMealPlanMeals} maaltijden</Text>
              </View>
            )}
          </View>
          <View style={styles.nutritionLayout}>
            <MacroRing
              value={macros.calories}
              target={calTarget}
              label="kcal"
              color={theme.colors.accent}
              size={120}
            />
            <View style={styles.macroStack}>
              {[
                { label: 'Eiwit', value: macros.protein, target: proteinTarget, color: '#EF4444' },
                { label: 'Koolh.', value: macros.carbs, target: carbsTarget, color: theme.colors.primary },
                { label: 'Vet', value: macros.fat, target: fatTarget, color: theme.colors.accent },
              ].map((m) => (
                <View key={m.label} style={styles.macroStackItem}>
                  <View style={[styles.macroDot, { backgroundColor: m.color }]} />
                  <View style={styles.macroInfo}>
                    <Text style={styles.macroLabel}>{m.label}</Text>
                    <Text style={styles.macroValue}>
                      {m.value}<Text style={styles.macroUnit}>g</Text>
                      {m.target > 0 && <Text style={styles.macroTarget}> / {m.target}</Text>}
                    </Text>
                  </View>
                  {m.target > 0 && (
                    <View style={styles.macroBar}>
                      <View style={[styles.macroBarFill, {
                        backgroundColor: m.color,
                        width: `${Math.min((m.value / m.target) * 100, 100)}%`,
                      }]} />
                    </View>
                  )}
                </View>
              ))}
            </View>
          </View>
          {!hasNutritionTargets && (
            <View style={styles.noTargetsHint}>
              <Ionicons name="information-circle-outline" size={14} color={theme.colors.textTertiary} />
              <Text style={styles.noTargetsText}>Geen doelen ingesteld door coach</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Habits */}
        {activeHabits.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Gewoontes</Text>
            <View style={styles.habitsGrid}>
              {activeHabits.map((habit: any) => {
                const done = completedHabitIds.has(habit.id);
                return (
                  <TouchableOpacity
                    key={habit.id}
                    style={[styles.habitChip, done && styles.habitChipDone]}
                    activeOpacity={0.7}
                    onPress={() => toggleHabit.mutate({ habitId: habit.id, date: today, completed: !done })}
                  >
                    <Ionicons
                      name={done ? 'checkmark-circle' : 'ellipse-outline'}
                      size={18}
                      color={done ? theme.colors.success : theme.colors.textTertiary}
                    />
                    <Text style={[styles.habitChipText, done && styles.habitChipTextDone]} numberOfLines={1}>
                      {habit.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* Weight Trend */}
        <WeightTrendCard data={weightData} />

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },

  // -- Gradient Header --
  headerGradient: {
    paddingBottom: 20,
  },
  headerSafe: {
    paddingHorizontal: theme.spacing.xl,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 4,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerLogo: {
    width: 24,
    height: 24,
  },
  greeting: {
    fontSize: theme.fontSize.sm,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: theme.fontWeight.medium,
  },
  name: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textOnPrimary,
  },
  headerRight: {
    flexDirection: 'row',
    gap: 8,
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.10)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: theme.colors.error,
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: theme.colors.primaryDark,
  },
  unreadText: {
    fontSize: 9,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textOnPrimary,
  },

  // -- Scroll --
  scrollView: {
    flex: 1,
    marginTop: -8,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.xl,
    paddingTop: 12,
  },

  // -- Cards --
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: 10,
    ...theme.shadow.sm,
  },
  cardFirst: {
    ...theme.shadow.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  doneBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: theme.colors.success + '12',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
  },
  doneBadgeText: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.success,
  },

  // -- Week Strip --
  weekStripRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  weekStripTile: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.background,
    minHeight: 68,
  },
  weekStripTileToday: {
    backgroundColor: theme.colors.primary,
  },
  weekStripTileTodayDone: {
    backgroundColor: theme.colors.success,
  },
  weekStripTilePastDone: {
    backgroundColor: theme.colors.success + '12',
  },
  weekStripTileMissed: {
    backgroundColor: theme.colors.background,
  },
  weekStripDayName: {
    fontSize: 10,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.textSecondary,
    letterSpacing: 0.3,
  },
  weekStripDayNum: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginTop: 2,
  },

  // -- Weekly Check-in --
  weeklyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: 10,
    gap: 14,
  },
  weeklyIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  weeklyText: {
    flex: 1,
  },
  weeklyTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textOnPrimary,
    marginBottom: 2,
  },
  weeklySub: {
    fontSize: theme.fontSize.sm,
    color: 'rgba(255,255,255,0.6)',
  },
  weeklyArrow: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.10)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // -- Training Card --
  trainingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  trainingIconWrap: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: theme.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trainingLabel: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.success,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  trainingName: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginTop: 2,
  },
  startBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: theme.borderRadius.md,
  },
  startBtnText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textOnPrimary,
  },

  // -- Nutrition --
  mealPlanBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: theme.colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
  },
  mealPlanBadgeText: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.primary,
  },
  nutritionLayout: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  macroStack: {
    flex: 1,
    gap: 12,
  },
  macroStackItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  macroDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  macroInfo: {
    flex: 1,
  },
  macroLabel: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.textSecondary,
  },
  macroValue: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  macroUnit: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.textSecondary,
  },
  macroTarget: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.normal,
    color: theme.colors.textTertiary,
  },
  macroBar: {
    position: 'absolute',
    bottom: -3,
    left: 16,
    right: 0,
    height: 3,
    backgroundColor: theme.colors.borderLight,
    borderRadius: 2,
  },
  macroBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  noTargetsHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderLight,
  },
  noTargetsText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textTertiary,
  },

  // -- Habits --
  habitsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  habitChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: theme.colors.background,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  habitChipDone: {
    backgroundColor: theme.colors.success + '08',
    borderColor: theme.colors.success + '30',
  },
  habitChipText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    maxWidth: SCREEN_WIDTH / 2 - 60,
  },
  habitChipTextDone: {
    color: theme.colors.success,
  },
});
