// ============================================================================
// COURSE DETAIL SCREEN — Modules & lessen overzicht
//
// CLIENT-SCOPED: Toont modules en lessen binnen een cursus.
// Supabase: course_modules, course_lessons, client_lesson_progress
// ============================================================================

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../constants/theme';

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

// PLACEHOLDER — Vervang met Supabase data
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
  const [expandedModule, setExpandedModule] = useState<string | null>(MODULES[0]?.id || null);

  const totalLessons = MODULES.reduce((sum, m) => sum + m.lessons.length, 0);
  const completedLessons = MODULES.reduce(
    (sum, m) => sum + m.lessons.filter((l) => l.completed).length,
    0
  );
  const progress = totalLessons > 0 ? completedLessons / totalLessons : 0;

  // Find first incomplete lesson for "Continue" button
  const nextLesson = MODULES.flatMap((m) => m.lessons).find((l) => !l.completed);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle} numberOfLines={1}>{courseTitle || 'Cursus'}</Text>
          <Text style={styles.headerSub}>
            {completedLessons}/{totalLessons} lessen voltooid
          </Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Progress overview */}
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Voortgang</Text>
            <Text style={styles.progressPercent}>{Math.round(progress * 100)}%</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
          </View>

          {nextLesson && (
            <TouchableOpacity
              style={styles.continueBtn}
              onPress={() => navigation.navigate('Lesson', { lessonId: nextLesson.id, lessonTitle: nextLesson.title })}
            >
              <Ionicons name="play" size={18} color="#fff" />
              <Text style={styles.continueBtnText}>Verder met: {nextLesson.title}</Text>
            </TouchableOpacity>
          )}
        </View>

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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.headerDark,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: theme.colors.headerDark,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  headerSub: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
    backgroundColor: theme.colors.background,
    minHeight: '100%',
  },
  progressCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    ...theme.shadows.md,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  progressLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.text,
  },
  progressPercent: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  progressBar: {
    height: 6,
    backgroundColor: theme.colors.border,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 14,
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: 3,
  },
  continueBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: theme.colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  continueBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  moduleCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 14,
    marginBottom: 12,
    overflow: 'hidden',
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
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.text,
  },
  moduleMeta: {
    fontSize: 12,
    color: theme.colors.textTertiary,
    marginTop: 1,
  },
  lessonList: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  lessonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  lessonIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: theme.colors.background,
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
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text,
  },
  lessonTitleDone: {
    color: theme.colors.textTertiary,
    textDecorationLine: 'line-through',
  },
  lessonMeta: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 2,
  },
  lessonDuration: {
    fontSize: 12,
    color: theme.colors.textTertiary,
  },
  lessonType: {
    fontSize: 12,
    color: theme.colors.textTertiary,
    fontWeight: '500',
  },
});
