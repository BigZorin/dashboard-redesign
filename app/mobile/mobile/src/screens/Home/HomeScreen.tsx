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
import { Skeleton, SkeletonCard, SkeletonMacroRings, SkeletonChart } from '../../components/Skeleton';

const evotionFavicon = require('../../../assets/images/evotion-favicon-wit.png');
const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ============================================================
// TYPES
// ============================================================
export interface HomeWorkout {
  id: string;
  completed: boolean;
  scheduledDate?: string;
  scheduled_date?: string;
  workoutTemplate?: { name: string };
}

export interface HomeHabit {
  id: string;
  name: string;
  is_active?: boolean;
}

export interface HomeHabitLog {
  habit_id?: string;
  habitId?: string;
}

export interface HomeMealPlanEntry {
  dayOfWeek: number;
}

export interface HomeMealPlan {
  dailyCalories?: number;
  proteinGrams?: number;
  carbsGrams?: number;
  fatGrams?: number;
  entries?: HomeMealPlanEntry[];
}

export interface HomeNutritionTargets {
  dailyCalories?: number;
  dailyProteinGrams?: number;
  dailyCarbsGrams?: number;
  dailyFatGrams?: number;
}

export interface HomeMacros {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface HomeCheckInHistory {
  check_in_date?: string;
  checkInDate?: string;
}

export interface HomeUserData {
  profile?: {
    first_name?: string;
    last_name?: string;
    avatar_url?: string;
  };
  email?: string;
}

export interface HomeScreenProps {
  loading?: boolean;
  userData?: HomeUserData;
  todayCheckIn?: any;
  weeklyCheckIn?: any;
  checkInSettings?: { weeklyCheckInDay?: number };
  allWorkouts?: HomeWorkout[];
  weightData?: any[];
  nutritionTargets?: HomeNutritionTargets;
  unreadCount?: number;
  mealPlan?: HomeMealPlan;
  macros?: HomeMacros;
  habits?: HomeHabit[];
  habitLogs?: HomeHabitLog[];
  checkInHistory?: HomeCheckInHistory[];
  onToggleHabit?: (habitId: string, date: string, completed: boolean) => void;
}

// ============================================================
// DEFAULT MOCK DATA
// ============================================================
const defaultUserData: HomeUserData = {
  profile: { first_name: 'Jelle', avatar_url: undefined },
  email: 'jelle@evotion.nl',
};

const defaultWorkouts: HomeWorkout[] = [
  {
    id: 'mock-w1',
    completed: false,
    scheduled_date: new Date().toISOString().slice(0, 10),
    workoutTemplate: { name: 'Upper Body - Push' },
  },
];

const defaultNutritionTargets: HomeNutritionTargets = {
  dailyCalories: 2400,
  dailyProteinGrams: 180,
  dailyCarbsGrams: 260,
  dailyFatGrams: 75,
};

const defaultMacros: HomeMacros = { calories: 1680, protein: 132, carbs: 190, fat: 52 };

const defaultHabits: HomeHabit[] = [
  { id: 'h1', name: '3L water', is_active: true },
  { id: 'h2', name: 'Creatine', is_active: true },
  { id: 'h3', name: '10k stappen', is_active: true },
  { id: 'h4', name: '8u slaap', is_active: true },
];

const defaultHabitLogs: HomeHabitLog[] = [{ habit_id: 'h1' }, { habit_id: 'h3' }];

const defaultCheckInHistory: HomeCheckInHistory[] = [
  { check_in_date: getDateOffset(-1) },
  { check_in_date: getDateOffset(-2) },
];

const defaultWeightData = [
  { date: getDateOffset(-6), value: 82.5 },
  { date: getDateOffset(-5), value: 82.3 },
  { date: getDateOffset(-4), value: 82.1 },
  { date: getDateOffset(-3), value: 82.4 },
  { date: getDateOffset(-2), value: 81.9 },
  { date: getDateOffset(-1), value: 81.7 },
  { date: getDateOffset(0), value: 81.5 },
];

// ============================================================
// HELPERS
// ============================================================
function getToday() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getDateOffset(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
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

// ============================================================
// SKELETON STATES
// ============================================================
function HomeSkeletonContent() {
  return (
    <View style={{ paddingHorizontal: theme.spacing.xl, paddingTop: 12 }}>
      {/* Week strip skeleton */}
      <View style={[styles.card, styles.cardFirst]}>
        <Skeleton height={16} width="50%" style={{ marginBottom: 14 }} />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <View key={i} style={{ flex: 1, alignItems: 'center' }}>
              <Skeleton width={40} height={68} borderRadius={12} />
            </View>
          ))}
        </View>
      </View>

      {/* Training card skeleton */}
      <View style={styles.card}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Skeleton width={46} height={46} borderRadius={14} />
          <View style={{ flex: 1 }}>
            <Skeleton height={11} width="30%" style={{ marginBottom: 6 }} />
            <Skeleton height={17} width="60%" />
          </View>
          <Skeleton width={70} height={36} borderRadius={12} />
        </View>
      </View>

      {/* Nutrition skeleton */}
      <SkeletonMacroRings />

      {/* Habits skeleton */}
      <View style={styles.card}>
        <Skeleton height={16} width="30%" style={{ marginBottom: 12 }} />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} width={100} height={36} borderRadius={8} />
          ))}
        </View>
      </View>

      {/* Weight chart skeleton */}
      <SkeletonChart />
    </View>
  );
}

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function HomeScreen(props: HomeScreenProps) {
  const navigation = useNavigation();

  // Hooks (used when no props passed)
  const { data: hookUserData } = useUser();
  const { data: hookTodayCheckIn, isLoading: dailyLoading } = useTodayCheckIn();
  const { data: hookWeeklyCheckIn, isLoading: weeklyLoading } = useCurrentCheckIn();
  const { data: hookCheckInSettings } = useCheckInSettings();
  const { data: hookAllWorkouts = [] } = useWorkouts('all');
  const { weightData: hookWeightData } = useProgressChartData();
  const { data: hookNutritionTargets } = useNutritionTargets();
  const { data: hookUnreadCount = 0 } = useUnreadCount();
  const { data: hookMealPlan } = useActiveMealPlan();
  const today = getToday();
  const hookMacros = useDailyMacros(today);
  const { data: hookHabits = [] } = useHabits();
  const { data: hookHabitLogs = [] } = useHabitLogs(today);
  const hookToggleHabit = useToggleHabit();
  const { data: hookCheckInHistory = [] } = useDailyCheckInHistory(14);

  // Merge: props override hooks, fallback to defaults for storybook
  const loading = props.loading ?? false;
  const userData = props.userData ?? hookUserData ?? defaultUserData;
  const todayCheckIn = props.todayCheckIn ?? hookTodayCheckIn;
  const weeklyCheckIn = props.weeklyCheckIn ?? hookWeeklyCheckIn;
  const checkInSettings = props.checkInSettings ?? hookCheckInSettings;
  const allWorkouts = props.allWorkouts ?? hookAllWorkouts ?? defaultWorkouts;
  const weightData = props.weightData ?? hookWeightData ?? defaultWeightData;
  const nutritionTargets = props.nutritionTargets ?? hookNutritionTargets ?? defaultNutritionTargets;
  const unreadCount = props.unreadCount ?? hookUnreadCount ?? 0;
  const mealPlan = props.mealPlan ?? hookMealPlan;
  const macros = props.macros ?? hookMacros ?? defaultMacros;
  const habits = props.habits ?? hookHabits ?? defaultHabits;
  const habitLogs = props.habitLogs ?? hookHabitLogs ?? defaultHabitLogs;
  const checkInHistory = props.checkInHistory ?? hookCheckInHistory ?? defaultCheckInHistory;

  const firstName = userData?.profile?.first_name || 'daar';
  const hasDailyCheckIn = !dailyLoading && !!todayCheckIn;

  // Build 5-day strip
  const weekStrip = useMemo(() => {
    const completedDates = new Set(
      (checkInHistory as HomeCheckInHistory[]).map((c) => c.check_in_date || c.checkInDate)
    );
    if (todayCheckIn) completedDates.add(today);
    const days: any[] = [];
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
    const uncompleted = (allWorkouts as HomeWorkout[])
      .filter((w) => !w.completed)
      .map((w) => ({ ...w, _date: w.scheduledDate || w.scheduled_date || '' }))
      .sort((a, b) => a._date.localeCompare(b._date));
    const todayW = uncompleted.find((w) => w._date.startsWith(today)) || null;
    let nextW: any = null;
    let nextDay = '';
    if (!todayW) {
      nextW = uncompleted.find((w) => w._date > today) || uncompleted[0] || null;
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
  const completedHabitIds = new Set((habitLogs as HomeHabitLog[]).map((l) => l.habit_id || l.habitId));
  const activeHabits = (habits as HomeHabit[]).filter((h) => h.is_active !== false);

  const handleToggleHabit = (habitId: string, date: string, completed: boolean) => {
    if (props.onToggleHabit) {
      props.onToggleHabit(habitId, date, completed);
    } else {
      hookToggleHabit.mutate({ habitId, date, completed });
    }
  };

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
                {loading ? (
                  <>
                    <Skeleton height={12} width={80} style={{ marginBottom: 4, opacity: 0.3 }} />
                    <Skeleton height={20} width={120} style={{ opacity: 0.3 }} />
                  </>
                ) : (
                  <>
                    <Text style={styles.greeting}>{getGreeting()},</Text>
                    <Text style={styles.name}>{firstName}</Text>
                  </>
                )}
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

      {loading ? (
        <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
          <HomeSkeletonContent />
          <View style={{ height: 100 }} />
        </ScrollView>
      ) : (
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
                {activeHabits.map((habit) => {
                  const done = completedHabitIds.has(habit.id);
                  return (
                    <TouchableOpacity
                      key={habit.id}
                      style={[styles.habitChip, done && styles.habitChipDone]}
                      activeOpacity={0.7}
                      onPress={() => handleToggleHabit(habit.id, today, !done)}
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
      )}
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
    ...theme.shadows.sm,
  },
  cardFirst: {
    ...theme.shadows.md,
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
