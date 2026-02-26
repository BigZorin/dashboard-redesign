// ============================================================================
// COURSES SCREEN -- E-Learning cursussenlijst (banner card stijl)
// ============================================================================

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../constants/theme';
import { Skeleton, SkeletonCourseCard } from '../../components/Skeleton';
import ScreenHeader from '../../components/ScreenHeader';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ============================================================
// TYPES
// ============================================================
type CourseStatus = 'all' | 'active' | 'completed';

export interface CourseData {
  id: string;
  title: string;
  description: string;
  thumbnail?: string | null;
  moduleCount: number;
  lessonCount: number;
  duration: string;
  completedLessons: number;
  totalLessons: number;
  category: string;
  instructor: string;
}

export interface CoursesScreenProps {
  loading?: boolean;
  courses?: CourseData[];
  onSelectCourse?: (courseId: string) => void;
}

// ============================================================
// DEFAULT MOCK DATA
// ============================================================
const defaultCourses: CourseData[] = [
  {
    id: '1',
    title: 'Fundamentals of Strength Training',
    description: 'Leer de basis van krachttraining met correcte techniek en programmering.',
    thumbnail: null,
    moduleCount: 6,
    lessonCount: 24,
    duration: '4 uur',
    completedLessons: 18,
    totalLessons: 24,
    category: 'Training',
    instructor: 'Mark Jensen',
  },
  {
    id: '2',
    title: 'Voeding & Macros Masterclass',
    description: 'Alles over macronutrienten, calorie-intake en maaltijdplanning.',
    thumbnail: null,
    moduleCount: 5,
    lessonCount: 20,
    duration: '3.5 uur',
    completedLessons: 20,
    totalLessons: 20,
    category: 'Voeding',
    instructor: 'Mark Jensen',
  },
  {
    id: '3',
    title: 'Mindset & Motivatie',
    description: 'Bouw mentale veerkracht en leer hoe je gemotiveerd blijft op lange termijn.',
    thumbnail: null,
    moduleCount: 4,
    lessonCount: 16,
    duration: '2.5 uur',
    completedLessons: 0,
    totalLessons: 16,
    category: 'Mindset',
    instructor: 'Mark Jensen',
  },
  {
    id: '4',
    title: 'Slaap & Herstel Optimalisatie',
    description: 'Verbeter je slaapkwaliteit en herstel voor betere resultaten.',
    thumbnail: null,
    moduleCount: 3,
    lessonCount: 12,
    duration: '2 uur',
    completedLessons: 5,
    totalLessons: 12,
    category: 'Lifestyle',
    instructor: 'Mark Jensen',
  },
];

const FILTERS: { key: CourseStatus; label: string }[] = [
  { key: 'all', label: 'Alles' },
  { key: 'active', label: 'Bezig' },
  { key: 'completed', label: 'Voltooid' },
];

const CATEGORY_GRADIENTS: Record<string, readonly [string, string]> = {
  Training: [theme.colors.primary, '#8B5CF6'] as const,
  Voeding: ['#059669', '#10B981'] as const,
  Mindset: ['#D97706', '#F59E0B'] as const,
  Lifestyle: ['#7C3AED', '#A78BFA'] as const,
};

const CATEGORY_ICONS: Record<string, string> = {
  Training: 'barbell',
  Voeding: 'nutrition',
  Mindset: 'bulb',
  Lifestyle: 'moon',
};

export default function CoursesScreen({ navigation, ...props }: CoursesScreenProps & { navigation?: any }) {
  const [filter, setFilter] = useState<CourseStatus>('all');
  const loading = props.loading ?? false;
  const courses = props.courses ?? defaultCourses;

  const filtered = courses.filter((c) => {
    if (filter === 'active') return c.completedLessons > 0 && c.completedLessons < c.totalLessons;
    if (filter === 'completed') return c.completedLessons === c.totalLessons;
    return true;
  });

  const totalCompleted = courses.filter((c) => c.completedLessons === c.totalLessons).length;
  const totalActive = courses.filter(
    (c) => c.completedLessons > 0 && c.completedLessons < c.totalLessons
  ).length;

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Cursussen"
        subtitle={`${totalCompleted} voltooid, ${totalActive} bezig`}
      >
        {/* Filter chips inside header */}
        <View style={styles.filterRow}>
          {FILTERS.map((f) => (
            <TouchableOpacity
              key={f.key}
              style={[styles.filterChip, filter === f.key && styles.filterChipActive]}
              onPress={() => setFilter(f.key)}
            >
              <Text style={[styles.filterText, filter === f.key && styles.filterTextActive]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScreenHeader>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={{ gap: 12 }}>
            <SkeletonCourseCard />
            <SkeletonCourseCard />
            <SkeletonCourseCard />
          </View>
        ) : filtered.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconWrap}>
              <Ionicons name="book-outline" size={48} color={theme.colors.textTertiary} />
            </View>
            <Text style={styles.emptyTitle}>Geen cursussen gevonden</Text>
            <Text style={styles.emptyText}>
              {filter === 'completed'
                ? 'Je hebt nog geen cursussen voltooid.'
                : 'Er zijn momenteel geen actieve cursussen.'}
            </Text>
          </View>
        ) : (
          filtered.map((course) => {
            const progress = course.totalLessons > 0
              ? course.completedLessons / course.totalLessons
              : 0;
            const isCompleted = progress === 1;
            const gradientColors = CATEGORY_GRADIENTS[course.category] || CATEGORY_GRADIENTS.Training;
            const categoryIcon = CATEGORY_ICONS[course.category] || 'book';

            return (
              <TouchableOpacity
                key={course.id}
                style={styles.courseCard}
                activeOpacity={0.85}
                onPress={() => {
                  if (props.onSelectCourse) props.onSelectCourse(course.id);
                  else navigation?.navigate('CourseDetail', { courseId: course.id, courseTitle: course.title });
                }}
              >
                {/* Banner */}
                <View style={styles.bannerContainer}>
                  {course.thumbnail ? (
                    <Image source={{ uri: course.thumbnail }} style={styles.bannerImage} resizeMode="cover" />
                  ) : (
                    <LinearGradient
                      colors={gradientColors as unknown as [string, string]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.bannerFallback}
                    >
                      <Ionicons name={categoryIcon as any} size={48} color="rgba(255,255,255,0.2)" />
                    </LinearGradient>
                  )}
                  {/* Dark gradient overlay */}
                  <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.65)']}
                    style={styles.bannerOverlay}
                  />
                  {/* Category badge on banner */}
                  <View style={styles.bannerBadge}>
                    <Text style={styles.bannerBadgeText}>{course.category}</Text>
                  </View>
                  {/* Title on banner */}
                  <View style={styles.bannerTitleWrap}>
                    <Text style={styles.bannerTitle} numberOfLines={2}>{course.title}</Text>
                  </View>
                  {/* Completed check */}
                  {isCompleted && (
                    <View style={styles.completedBadge}>
                      <Ionicons name="checkmark-circle" size={22} color="#fff" />
                    </View>
                  )}
                </View>

                {/* Card body */}
                <View style={styles.cardBody}>
                  {/* Progress bar */}
                  {course.completedLessons > 0 && (
                    <View style={styles.progressSection}>
                      <View style={styles.progressBar}>
                        <LinearGradient
                          colors={isCompleted
                            ? [theme.colors.success, '#34D399'] as readonly [string, string]
                            : [theme.colors.primary, theme.colors.primaryMuted] as readonly [string, string]
                          }
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                          style={[styles.progressFill, { width: `${progress * 100}%` }]}
                        />
                      </View>
                      <Text style={styles.progressText}>
                        {isCompleted
                          ? 'Voltooid'
                          : `${course.completedLessons}/${course.totalLessons} lessen`}
                      </Text>
                    </View>
                  )}

                  {/* Meta row */}
                  <View style={styles.metaRow}>
                    <View style={styles.metaItem}>
                      <Ionicons name="layers-outline" size={14} color={theme.colors.textTertiary} />
                      <Text style={styles.metaText}>{course.moduleCount} modules</Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Ionicons name="time-outline" size={14} color={theme.colors.textTertiary} />
                      <Text style={styles.metaText}>{course.duration}</Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Ionicons name="person-outline" size={14} color={theme.colors.textTertiary} />
                      <Text style={styles.metaText}>{course.instructor}</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  filterChipActive: {
    backgroundColor: '#fff',
  },
  filterText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    color: 'rgba(255,255,255,0.7)',
  },
  filterTextActive: {
    color: theme.colors.primaryDark,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  // Banner card
  courseCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    ...theme.shadows.md,
  },
  bannerContainer: {
    height: 150,
    position: 'relative',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  bannerFallback: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  bannerBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  bannerBadgeText: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.bold,
    color: '#fff',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  bannerTitleWrap: {
    position: 'absolute',
    bottom: 12,
    left: 14,
    right: 14,
  },
  bannerTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  completedBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.success,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardBody: {
    padding: 14,
  },
  progressSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: theme.colors.borderLight,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.textTertiary,
    minWidth: 80,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textTertiary,
  },
  // Empty state
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: 8,
  },
  emptyIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  emptyText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});
