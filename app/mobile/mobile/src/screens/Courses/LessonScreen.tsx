// ============================================================================
// LESSON SCREEN — Individuele les weergave
//
// CLIENT-SCOPED: Toont les content (video/artikel/quiz).
// Supabase: course_lessons, client_lesson_progress
// ============================================================================

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../constants/theme';

// PLACEHOLDER — Vervang met Supabase data
const LESSON_DATA = {
  id: 'l1',
  title: 'Welkom bij de cursus',
  type: 'video' as const,
  duration: '5 min',
  videoUrl: null,
  content: `Welkom bij deze cursus! In de komende modules gaan we je alles leren over krachttraining.\n\nWat je gaat leren:\n- De basis van krachttraining\n- Correcte techniek voor de grote oefeningen\n- Hoe je een effectief trainingsschema maakt\n- Progressief overbelasten en periodisering\n\nNeem de tijd om elke les goed door te nemen. Je kunt altijd terug naar eerdere lessen als je iets wilt herhalen.\n\nVeel succes!`,
  completed: false,
};

export default function LessonScreen({ navigation, route }: any) {
  const { lessonTitle } = route.params;
  const [completed, setCompleted] = useState(LESSON_DATA.completed);

  const handleComplete = () => {
    setCompleted(true);
    // TODO: Update Supabase client_lesson_progress
    Alert.alert('Les voltooid!', 'Je voortgang is opgeslagen.', [
      { text: 'Volgende les', onPress: () => navigation.goBack() },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{lessonTitle || 'Les'}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Video placeholder */}
        <View style={styles.videoPlaceholder}>
          <View style={styles.playButton}>
            <Ionicons name="play" size={32} color="#fff" />
          </View>
          <Text style={styles.videoLabel}>Video: {LESSON_DATA.duration}</Text>
        </View>

        {/* Lesson info */}
        <View style={styles.lessonHeader}>
          <View style={styles.typeChip}>
            <Ionicons
              name={LESSON_DATA.type === 'video' ? 'videocam' : LESSON_DATA.type === 'article' ? 'document-text' : 'help-circle'}
              size={14}
              color={theme.colors.primary}
            />
            <Text style={styles.typeChipText}>
              {LESSON_DATA.type === 'video' ? 'Video' : LESSON_DATA.type === 'article' ? 'Artikel' : 'Quiz'}
            </Text>
          </View>
          <View style={styles.durationChip}>
            <Ionicons name="time-outline" size={14} color={theme.colors.textTertiary} />
            <Text style={styles.durationText}>{LESSON_DATA.duration}</Text>
          </View>
        </View>

        <Text style={styles.lessonTitle}>{LESSON_DATA.title}</Text>

        {/* Content */}
        <View style={styles.contentCard}>
          <Text style={styles.contentText}>{LESSON_DATA.content}</Text>
        </View>

        {/* Mark as complete */}
        {!completed ? (
          <TouchableOpacity style={styles.completeBtn} onPress={handleComplete}>
            <Ionicons name="checkmark-circle" size={22} color="#fff" />
            <Text style={styles.completeBtnText}>Markeer als voltooid</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.completedBanner}>
            <Ionicons name="checkmark-circle" size={22} color={theme.colors.success} />
            <Text style={styles.completedText}>Les voltooid</Text>
          </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
  },
  scrollContent: {
    backgroundColor: theme.colors.background,
    minHeight: '100%',
  },
  videoPlaceholder: {
    aspectRatio: 16 / 9,
    backgroundColor: theme.colors.primaryDark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(108, 58, 237, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  videoLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
  },
  lessonHeader: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: theme.colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  typeChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  durationChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  durationText: {
    fontSize: 12,
    color: theme.colors.textTertiary,
  },
  lessonTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.colors.text,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
  },
  contentCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 14,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    ...theme.shadows.sm,
  },
  contentText: {
    fontSize: 15,
    lineHeight: 24,
    color: theme.colors.text,
  },
  completeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: theme.colors.primary,
    paddingVertical: 16,
    marginHorizontal: 20,
    marginBottom: 40,
    borderRadius: 14,
  },
  completeBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  completedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: `${theme.colors.success}15`,
    paddingVertical: 14,
    marginHorizontal: 20,
    marginBottom: 40,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.colors.success,
  },
  completedText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.success,
  },
});
