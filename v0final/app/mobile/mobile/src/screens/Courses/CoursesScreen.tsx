// ============================================================================
// COURSES SCREEN — E-Learning cursussenlijst
//
// CLIENT-SCOPED: Toont alle cursussen waartoe de client toegang heeft.
// Supabase: courses, course_modules, course_lessons, client_course_progress
// RLS: SELECT op courses via enrollment of openbare cursussen
// ============================================================================

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../constants/theme';
import { Skeleton, SkeletonCourseCard } from '../../components/Skeleton';

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

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'Training': return theme.colors.primary;
      case 'Voeding': return theme.colors.success;
      case 'Mindset': return theme.colors.accent;
      case 'Lifestyle': return '#8B5CF6';
      default: return theme.colors.primary;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Cursussen</Text>
          <Text style={styles.headerSub}>
            {totalCompleted} voltooid, {totalActive} bezig
          </Text>
        </View>
      </View>

      {/* Filter tabs */}
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

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={{ gap: 12 }}>
            <SkeletonCourseCard />
            <SkeletonCourseCard />
            <SkeletonCourseCard />
          </View>
        ) : filtered.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="book-outline" size={48} color={theme.colors.border} />
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
            const catColor = getCategoryColor(course.category);

            return (
              <TouchableOpacity
                key={course.id}
                style={styles.courseCard}
                activeOpacity={0.7}
                onPress={() => {
                  if (props.onSelectCourse) props.onSelectCourse(course.id);
                  else navigation?.navigate('CourseDetail', { courseId: course.id, courseTitle: course.title });
                }}
              >
                {/* Thumbnail placeholder */}
                <View style={[styles.thumbnail, { backgroundColor: `${catColor}15` }]}>
                  <Ionicons
                    name={
                      course.category === 'Training' ? 'barbell' :
                      course.category === 'Voeding' ? 'nutrition' :
                      course.category === 'Mindset' ? 'bulb' : 'moon'
                    }
                    size={32}
                    color={catColor}
                  />
                  {isCompleted && (
                    <View style={styles.completedBadge}>
                      <Ionicons name="checkmark-circle" size={20} color={theme.colors.success} />
                    </View>
                  )}
                </View>

                <View style={styles.courseInfo}>
                  {/* Category chip */}
                  <View style={[styles.categoryChip, { backgroundColor: `${catColor}15` }]}>
                    <Text style={[styles.categoryText, { color: catColor }]}>{course.category}</Text>
                  </View>

                  <Text style={styles.courseTitle} numberOfLines={2}>{course.title}</Text>
                  <Text style={styles.courseDesc} numberOfLines={2}>{course.description}</Text>

                  {/* Meta */}
                  <View style={styles.metaRow}>
                    <View style={styles.metaItem}>
                      <Ionicons name="layers-outline" size={14} color={theme.colors.textTertiary} />
                      <Text style={styles.metaText}>{course.moduleCount} modules</Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Ionicons name="play-circle-outline" size={14} color={theme.colors.textTertiary} />
                      <Text style={styles.metaText}>{course.lessonCount} lessen</Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Ionicons name="time-outline" size={14} color={theme.colors.textTertiary} />
                      <Text style={styles.metaText}>{course.duration}</Text>
                    </View>
                  </View>

                  {/* Progress bar */}
                  {course.completedLessons > 0 && (
                    <View style={styles.progressSection}>
                      <View style={styles.progressBar}>
                        <View
                          style={[
                            styles.progressFill,
                            {
                              width: `${progress * 100}%`,
                              backgroundColor: isCompleted ? theme.colors.success : theme.colors.primary,
                            },
                          ]}
                        />
                      </View>
                      <Text style={styles.progressText}>
                        {isCompleted
                          ? 'Voltooid'
                          : `${course.completedLessons}/${course.totalLessons} lessen`}
                      </Text>
                    </View>
                  )}
                </View>

                <Ionicons name="chevron-forward" size={20} color={theme.colors.textTertiary} />
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.headerDark,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
    backgroundColor: theme.colors.headerDark,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
  },
  headerSub: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 2,
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 8,
    backgroundColor: theme.colors.headerDark,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  filterChipActive: {
    backgroundColor: '#fff',
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.6)',
  },
  filterTextActive: {
    color: theme.colors.headerDark,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
    backgroundColor: theme.colors.background,
    minHeight: '100%',
  },
  courseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    gap: 14,
    ...theme.shadows.md,
  },
  thumbnail: {
    width: 72,
    height: 72,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  completedBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  courseInfo: {
    flex: 1,
  },
  categoryChip: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginBottom: 4,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  courseTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 2,
  },
  courseDesc: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    lineHeight: 16,
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  metaText: {
    fontSize: 11,
    color: theme.colors.textTertiary,
  },
  progressSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: theme.colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.textTertiary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
  },
  emptyText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});
