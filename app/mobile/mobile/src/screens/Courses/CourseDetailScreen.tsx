// ============================================================================
// COURSE DETAIL SCREEN -- Modules & lessen met hero banner
// ============================================================================

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HERO_HEIGHT = 220;

type Lesson = {
  id: string;
  title: string;
  duration: string;
  type: 'video' | 'article' | 'quiz';
  completed: boolean;
};

type Module = {
  id: string;
  title: string;
  lessons: Lesson[];
};

// PLACEHOLDER -- Vervang met Supabase data
const MODULES: Module[] = [
  {
    id: 'm1',
    title: 'Module 1: Introductie',
    lessons: [
      { id: 'l1', title: 'Welkom bij de cursus', duration: '5 min', type: 'video', completed: true },
      { id: 'l2', title: 'Wat kun je verwachten?', duration: '3 min', type: 'article', completed: true },
      { id: 'l3', title: 'Basiskennis test', duration: '10 min', type: 'quiz', completed: true },
    ],
  },
  {
    id: 'm2',
    title: 'Module 2: Fundamentals',
    lessons: [
      { id: 'l4', title: 'De grote oefeningen', duration: '12 min', type: 'video', completed: true },
      { id: 'l5', title: 'Techniek: Squat', duration: '8 min', type: 'video', completed: true },
      { id: 'l6', title: 'Techniek: Deadlift', duration: '10 min', type: 'video', completed: false },
      { id: 'l7', title: 'Techniek: Bench Press', duration: '8 min', type: 'video', completed: false },
    ],
  },
  {
    id: 'm3',
    title: 'Module 3: Programmering',
    lessons: [
      { id: 'l8', title: 'Sets & reps uitgelegd', duration: '7 min', type: 'video', completed: false },
      { id: 'l9', title: 'Progressief overbelasten', duration: '9 min', type: 'video', completed: false },
      { id: 'l10', title: 'Je eerste schema', duration: '6 min', type: 'article', completed: false },
      { id: 'l11', title: 'Kennis check', duration: '5 min', type: 'quiz', completed: false },
    ],
  },
];

const LESSON_TYPE_ICONS: Record<string, { name: string; color: string }> = {
  video: { name: 'play-circle', color: theme.colors.primary },
  article: { name: 'document-text', color: theme.colors.accent },
  quiz: { name: 'help-circle', color: theme.colors.success },
};

export default function CourseDetailScreen({ navigation, route }: any) {
  const { courseTitle } = route.params;
  const insets = useSafeAreaInsets();
  const [expandedModule, setExpandedModule] = useState<string | null>(MODULES[0]?.id || null);

  const totalLessons = MODULES.reduce((sum, m) => sum + m.lessons.length, 0);
  const completedLessons = MODULES.reduce(
    (sum, m) => sum + m.lessons.filter((l) => l.completed).length,
    0
  );
  const progress = totalLessons > 0 ? completedLessons / totalLessons : 0;
  const nextLesson = MODULES.flatMap((m) => m.lessons).find((l) => !l.completed);

  return (
    <View style={styles.container}>
      {/* Hero Banner */}
      <View style={[styles.heroContainer, { paddingTop: insets.top }]}>
        <LinearGradient
          colors={theme.gradients.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        {/* Back button */}
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>

        {/* Hero content */}
        <View style={styles.heroContent}>
          <Text style={styles.heroTitle} numberOfLines={2}>{courseTitle || 'Cursus'}</Text>
          <Text style={styles.heroSubtitle}>
            {completedLessons}/{totalLessons} lessen voltooid
          </Text>

          {/* Progress bar on hero */}
          <View style={styles.heroProgressBar}>
            <LinearGradient
              colors={[theme.colors.primary, '#A78BFA'] as readonly [string, string]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.heroProgressFill, { width: `${Math.max(progress * 100, 2)}%` }]}
            />
          </View>
          <Text style={styles.heroPercent}>{Math.round(progress * 100)}% voltooid</Text>
        </View>

        {/* Curved bottom */}
        <View style={styles.heroCurve}>
          <View style={styles.heroCurveInner} />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Continue button */}
        {nextLesson && (
          <TouchableOpacity
            style={styles.continueBtn}
            onPress={() => navigation.navigate('Lesson', { lessonId: nextLesson.id, lessonTitle: nextLesson.title })}
            activeOpacity={0.85}
          >
            <View style={styles.continueBtnIcon}>
              <Ionicons name="play" size={20} color="#fff" />
            </View>
            <View style={styles.continueBtnText}>
              <Text style={styles.continueBtnLabel}>Verder met</Text>
              <Text style={styles.continueBtnTitle} numberOfLines={1}>{nextLesson.title}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.textTertiary} />
          </TouchableOpacity>
        )}

        {/* Modules */}
        {MODULES.map((mod, modIdx) => {
          const isExpanded = expandedModule === mod.id;
          const modCompleted = mod.lessons.filter((l) => l.completed).length;
          const modTotal = mod.lessons.length;
          const allDone = modCompleted === modTotal;

          return (
            <View key={mod.id} style={styles.moduleCard}>
              <TouchableOpacity
                style={styles.moduleHeader}
                onPress={() => setExpandedModule(isExpanded ? null : mod.id)}
                activeOpacity={0.7}
              >
                <View style={styles.moduleHeaderLeft}>
                  {allDone ? (
                    <View style={styles.moduleCheckDone}>
                      <Ionicons name="checkmark" size={14} color="#fff" />
                    </View>
                  ) : (
                    <View style={styles.moduleNumber}>
                      <Text style={styles.moduleNumberText}>{modIdx + 1}</Text>
                    </View>
                  )}
                  <View style={styles.moduleHeaderText}>
                    <Text style={styles.moduleTitle} numberOfLines={1}>{mod.title}</Text>
                    <Text style={styles.moduleMeta}>
                      {modCompleted}/{modTotal} voltooid
                    </Text>
                  </View>
                </View>
                <Ionicons
                  name={isExpanded ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color={theme.colors.textTertiary}
                />
              </TouchableOpacity>

              {isExpanded && (
                <View style={styles.lessonList}>
                  {mod.lessons.map((lesson, idx) => {
                    const typeConfig = LESSON_TYPE_ICONS[lesson.type] || LESSON_TYPE_ICONS.video;
                    return (
                      <TouchableOpacity
                        key={lesson.id}
                        style={[styles.lessonItem, idx === mod.lessons.length - 1 && { borderBottomWidth: 0 }]}
                        onPress={() => navigation.navigate('Lesson', { lessonId: lesson.id, lessonTitle: lesson.title })}
                        activeOpacity={0.7}
                      >
                        <View style={[styles.lessonIcon, lesson.completed && styles.lessonIconDone]}>
                          {lesson.completed ? (
                            <Ionicons name="checkmark" size={14} color="#fff" />
                          ) : (
                            <Ionicons name={typeConfig.name as any} size={16} color={typeConfig.color} />
                          )}
                        </View>
                        <View style={styles.lessonInfo}>
                          <Text
                            style={[styles.lessonTitle, lesson.completed && styles.lessonTitleDone]}
                            numberOfLines={1}
                          >
                            {lesson.title}
                          </Text>
                          <View style={styles.lessonMeta}>
                            <Text style={styles.lessonDuration}>{lesson.duration}</Text>
                            <Text style={styles.lessonType}>
                              {lesson.type === 'video' ? 'Video' : lesson.type === 'article' ? 'Artikel' : 'Quiz'}
                            </Text>
                          </View>
                        </View>
                        <Ionicons name="chevron-forward" size={16} color={theme.colors.textTertiary} />
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  // Hero
  heroContainer: {
    position: 'relative',
    minHeight: HERO_HEIGHT,
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 12,
  },
  heroContent: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  heroTitle: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: '#fff',
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  heroSubtitle: {
    fontSize: theme.fontSize.sm,
    color: 'rgba(255,255,255,0.65)',
    marginBottom: 12,
  },
  heroProgressBar: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 6,
  },
  heroProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  heroPercent: {
    fontSize: theme.fontSize.xs,
    color: 'rgba(255,255,255,0.5)',
    fontWeight: theme.fontWeight.semibold,
  },
  heroCurve: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 16,
    overflow: 'hidden',
  },
  heroCurveInner: {
    position: 'absolute',
    bottom: 0,
    left: -10,
    right: -10,
    height: 32,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: theme.colors.background,
  },
  // Scroll content
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  // Continue button
  continueBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: 14,
    marginBottom: 20,
    gap: 12,
    borderWidth: 1,
    borderColor: theme.colors.primary + '25',
    ...theme.shadows.md,
  },
  continueBtnIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  continueBtnText: {
    flex: 1,
  },
  continueBtnLabel: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  continueBtnTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  // Modules
  moduleCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    ...theme.shadows.sm,
  },
  moduleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  moduleHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  moduleNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moduleNumberText: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  moduleCheckDone: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.success,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moduleHeaderText: {
    flex: 1,
  },
  moduleTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  moduleMeta: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textTertiary,
    marginTop: 1,
  },
  // Lessons
  lessonList: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderLight,
  },
  lessonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
    gap: 12,
  },
  lessonIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: theme.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lessonIconDone: {
    backgroundColor: theme.colors.success,
  },
  lessonInfo: {
    flex: 1,
  },
  lessonTitle: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: 2,
  },
  lessonTitleDone: {
    color: theme.colors.textTertiary,
  },
  lessonMeta: {
    flexDirection: 'row',
    gap: 8,
  },
  lessonDuration: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textTertiary,
  },
  lessonType: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textTertiary,
  },
});
