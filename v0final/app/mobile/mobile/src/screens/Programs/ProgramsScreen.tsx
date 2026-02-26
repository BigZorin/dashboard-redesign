import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useQueryClient } from '@tanstack/react-query';
import { useClientPrograms, programKeys } from '../../hooks/usePrograms';
import { theme } from '../../constants/theme';
import type { ClientProgram } from '../../lib/programApi';

const STATUS_LABELS: Record<string, string> = {
  active: 'Actief',
  paused: 'Gepauzeerd',
  completed: 'Voltooid',
};

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  active: { bg: '#d1fae5', text: '#10b981' },
  paused: { bg: '#fef3c7', text: '#f59e0b' },
  completed: { bg: '#dbeafe', text: '#3b82f6' },
};

export default function ProgramsScreen({ navigation }: any) {
  const queryClient = useQueryClient();
  const { data: programs = [], isLoading, isRefetching, refetch } = useClientPrograms();

  useFocusEffect(
    useCallback(() => {
      queryClient.invalidateQueries({ queryKey: programKeys.all });
    }, [queryClient])
  );

  const activePrograms = programs.filter((p) => p.status === 'active');
  const otherPrograms = programs.filter((p) => p.status !== 'active');

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Programma's laden...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const renderProgramCard = (program: ClientProgram) => {
    const totalBlocks = program.program.blocks.length;
    const currentBlock = program.program.blocks[program.currentBlockIndex];
    const statusColor = STATUS_COLORS[program.status] || STATUS_COLORS.active;

    return (
      <TouchableOpacity
        key={program.id}
        style={styles.programCard}
        onPress={() => navigation.navigate('ProgramDetail', { assignmentId: program.id })}
      >
        {/* Banner */}
        <View style={styles.bannerContainer}>
          {program.program.bannerUrl ? (
            <Image
              source={{ uri: program.program.bannerUrl }}
              style={styles.banner}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.bannerFallback}>
              <Ionicons name="layers-outline" size={32} color="rgba(255,255,255,0.3)" />
            </View>
          )}
          <View style={[styles.statusBadge, { backgroundColor: statusColor.bg }]}>
            <Text style={[styles.statusText, { color: statusColor.text }]}>
              {STATUS_LABELS[program.status]}
            </Text>
          </View>
        </View>

        {/* Content */}
        <View style={styles.cardContent}>
          <Text style={styles.programName}>{program.program.name}</Text>
          {program.program.description && (
            <Text style={styles.programDesc} numberOfLines={2}>
              {program.program.description}
            </Text>
          )}

          {/* Progress */}
          <View style={styles.progressRow}>
            <View style={styles.progressBar}>
              {Array.from({ length: totalBlocks }).map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.progressSegment,
                    i <= program.currentBlockIndex && styles.progressSegmentActive,
                    i === 0 && { borderTopLeftRadius: 4, borderBottomLeftRadius: 4 },
                    i === totalBlocks - 1 && { borderTopRightRadius: 4, borderBottomRightRadius: 4 },
                  ]}
                />
              ))}
            </View>
            <Text style={styles.progressText}>
              Blok {program.currentBlockIndex + 1}/{totalBlocks}
            </Text>
          </View>

          {currentBlock && (
            <View style={styles.currentBlockInfo}>
              <Ionicons name="flag-outline" size={14} color={theme.colors.primary} />
              <Text style={styles.currentBlockName}>{currentBlock.name}</Text>
              <Text style={styles.currentBlockMeta}>
                {currentBlock.workouts.length} workouts · {currentBlock.durationWeeks} weken
              </Text>
            </View>
          )}
        </View>

        <Ionicons
          name="chevron-forward"
          size={20}
          color={theme.colors.textTertiary}
          style={styles.chevron}
        />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} />
        }
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.title}>Mijn Programma's</Text>
          <View style={{ width: 24 }} />
        </View>

        {programs.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="layers-outline" size={64} color={theme.colors.border} />
            <Text style={styles.emptyTitle}>Geen Programma's</Text>
            <Text style={styles.emptyText}>
              Je coach kan trainingsprogramma's aan je toewijzen.
            </Text>
          </View>
        ) : (
          <>
            {activePrograms.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Actief</Text>
                {activePrograms.map(renderProgramCard)}
              </View>
            )}

            {otherPrograms.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Overig</Text>
                {otherPrograms.map(renderProgramCard)}
              </View>
            )}
          </>
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
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: theme.colors.headerDark,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  programCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    ...theme.shadows.md,
  },
  bannerContainer: {
    position: 'relative',
  },
  banner: {
    width: '100%',
    height: 140,
  },
  bannerFallback: {
    width: '100%',
    height: 140,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  cardContent: {
    padding: 16,
  },
  programName: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 4,
  },
  programDesc: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  progressBar: {
    flex: 1,
    flexDirection: 'row',
    height: 6,
    gap: 2,
  },
  progressSegment: {
    flex: 1,
    backgroundColor: theme.colors.border,
  },
  progressSegmentActive: {
    backgroundColor: theme.colors.primary,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    minWidth: 60,
  },
  currentBlockInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  currentBlockName: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  currentBlockMeta: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  chevron: {
    position: 'absolute',
    right: 16,
    top: '50%',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});
