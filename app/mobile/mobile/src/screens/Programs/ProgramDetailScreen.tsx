import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Modal,
  Pressable,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useQueryClient } from '@tanstack/react-query';
import { useClientProgram, useProgramWeeklyMap, programKeys } from '../../hooks/usePrograms';
import { theme } from '../../constants/theme';
import type { ProgramBlock, ProgramBlockWorkout } from '../../lib/programApi';

const DAY_LABELS: Record<number, string> = {
  1: 'Maandag', 2: 'Dinsdag', 3: 'Woensdag', 4: 'Donderdag',
  5: 'Vrijdag', 6: 'Zaterdag', 7: 'Zondag',
};

const DAY_SHORT: Record<number, string> = {
  1: 'Ma', 2: 'Di', 3: 'Wo', 4: 'Do', 5: 'Vr', 6: 'Za', 7: 'Zo',
};

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function formatDateRange(start: Date, end: Date): string {
  const opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };
  return `${start.toLocaleDateString('nl-NL', opts)} - ${end.toLocaleDateString('nl-NL', opts)}`;
}

export default function ProgramDetailScreen({ route, navigation }: any) {
  const { assignmentId } = route.params;
  const queryClient = useQueryClient();
  const { data: program, isLoading } = useClientProgram(assignmentId);
  const { data: weeklyMap = {} } = useProgramWeeklyMap(assignmentId);
  const [expandedBlocks, setExpandedBlocks] = useState<Set<number>>(new Set());
  const [expandedWeeks, setExpandedWeeks] = useState<Set<string>>(new Set());
  const [showInfo, setShowInfo] = useState(false);

  useFocusEffect(
    useCallback(() => {
      queryClient.invalidateQueries({ queryKey: programKeys.detail(assignmentId) });
      queryClient.invalidateQueries({ queryKey: programKeys.weeklyMap(assignmentId) });
    }, [assignmentId, queryClient])
  );

  React.useEffect(() => {
    if (program) {
      setExpandedBlocks(new Set());
      setExpandedWeeks(new Set());
    }
  }, [program?.currentBlockIndex]);

  const blockDates = useMemo(() => {
    if (!program) return [];
    const startDate = new Date(program.startDate);
    let offset = 0;
    return program.program.blocks.map((block) => {
      const blockStart = addDays(startDate, offset * 7);
      const weeks = block.durationWeeks || 1;
      offset += weeks;
      return { start: blockStart, weeks };
    });
  }, [program]);

  const toggleBlock = (index: number) => {
    setExpandedBlocks((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const toggleWeek = (key: string) => {
    setExpandedWeeks((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const getAbsoluteWeekNumber = (blockIndex: number, weekIndex: number): number => {
    let total = 0;
    for (let i = 0; i < blockIndex; i++) {
      total += blockDates[i]?.weeks || program?.program.blocks[i]?.durationWeeks || 1;
    }
    return total + weekIndex;
  };

  const handleWorkoutPress = (bw: ProgramBlockWorkout, blockIndex: number, weekIndex: number) => {
    if (!bw.workoutTemplate) return;
    const templateId = bw.workoutTemplate.id;
    const weekNum = getAbsoluteWeekNumber(blockIndex, weekIndex);
    const weekEntry = weeklyMap[templateId]?.[weekNum];

    if (weekEntry) {
      navigation.navigate('WorkoutDetail', {
        workoutId: weekEntry.id,
        weekNumber: weekNum,
        clientProgramId: assignmentId,
      });
    } else {
      navigation.navigate('WorkoutDetail', {
        templateData: {
          workoutTemplate: bw.workoutTemplate,
          coachId: program.coachId,
          clientProgramId: assignmentId,
          weekNumber: weekNum,
        },
      });
    }
  };

  if (isLoading || !program) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Programma laden...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const blocks = program.program.blocks;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
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
              <Ionicons name="barbell-outline" size={56} color="rgba(255,255,255,0.12)" />
            </View>
          )}
          {/* Bottom gradient overlay */}
          <View style={styles.bannerOverlay} />

          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>

          {program.program.description ? (
            <TouchableOpacity style={styles.infoButton} onPress={() => setShowInfo(true)}>
              <Ionicons name="information-circle-outline" size={22} color="#fff" />
            </TouchableOpacity>
          ) : null}

          <View style={styles.bannerTitleArea}>
            <Text style={styles.bannerTitle} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.6}>
              {program.program.name}
            </Text>
            <View style={styles.bannerMeta}>
              <View style={styles.bannerMetaChip}>
                <Ionicons name="layers-outline" size={12} color="rgba(255,255,255,0.8)" />
                <Text style={styles.bannerMetaText}>
                  {blocks.length} {blocks.length === 1 ? 'blok' : 'blokken'}
                </Text>
              </View>
              <View style={styles.bannerMetaChip}>
                <Ionicons name="calendar-outline" size={12} color="rgba(255,255,255,0.8)" />
                <Text style={styles.bannerMetaText}>
                  {blocks.reduce((sum, b) => sum + (b.durationWeeks || 1), 0)} weken
                </Text>
              </View>
              <View style={styles.bannerMetaChip}>
                <Ionicons name="barbell-outline" size={12} color="rgba(255,255,255,0.8)" />
                <Text style={styles.bannerMetaText}>
                  {blocks.reduce((sum, b) => sum + b.workouts.length, 0)} trainingen
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Blocks */}
        <View style={styles.blocksContainer}>
          {blocks.map((block, blockIndex) => {
            const isCurrentBlock = blockIndex === program.currentBlockIndex;
            const isBlockExpanded = expandedBlocks.has(blockIndex);
            const dates = blockDates[blockIndex];
            const weekCount = dates?.weeks || block.durationWeeks || 1;

            return (
              <View key={block.id} style={styles.blockSection}>
                {/* Block Header */}
                <TouchableOpacity
                  style={[styles.blockHeader, isCurrentBlock && styles.blockHeaderActive]}
                  onPress={() => toggleBlock(blockIndex)}
                  activeOpacity={0.7}
                >
                  <View style={styles.blockHeaderLeft}>
                    <View style={[styles.blockDot, isCurrentBlock && styles.blockDotActive]} />
                    <View style={styles.blockTextCol}>
                      <Text style={[styles.blockTitle, isCurrentBlock && styles.blockTitleActive]} numberOfLines={1}>
                        {block.name}
                      </Text>
                      <Text style={styles.blockSubtitle} numberOfLines={1}>
                        {weekCount} {weekCount === 1 ? 'week' : 'weken'} - {block.workouts.length} trainingen
                      </Text>
                    </View>
                  </View>
                  <Ionicons
                    name={isBlockExpanded ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color={isCurrentBlock ? theme.colors.primary : theme.colors.textSecondary}
                  />
                </TouchableOpacity>

                {/* Weeks inside block */}
                {isBlockExpanded && (
                  <View style={styles.weeksContainer}>
                    {block.description && (
                      <Text style={styles.blockDesc}>{block.description}</Text>
                    )}

                    {Array.from({ length: weekCount }).map((_, weekIndex) => {
                      const weekKey = `${blockIndex}-${weekIndex}`;
                      const isWeekExpanded = expandedWeeks.has(weekKey);
                      const weekStart = dates ? addDays(dates.start, weekIndex * 7) : null;
                      const weekEnd = weekStart ? addDays(weekStart, 6) : null;

                      const weekNum = getAbsoluteWeekNumber(blockIndex, weekIndex);
                      const completedInWeek = block.workouts.filter((bw) => {
                        const tid = bw.workoutTemplate?.id;
                        return tid && weeklyMap[tid]?.[weekNum]?.completed === true;
                      }).length;
                      const totalInWeek = block.workouts.length;
                      const allDone = completedInWeek === totalInWeek && totalInWeek > 0;

                      return (
                        <View key={weekKey} style={styles.weekCard}>
                          <TouchableOpacity
                            style={styles.weekHeader}
                            onPress={() => toggleWeek(weekKey)}
                            activeOpacity={0.7}
                          >
                            <View style={styles.weekHeaderLeft}>
                              <Text style={styles.weekTitle}>Week {weekIndex + 1}</Text>
                              {weekStart && weekEnd && (
                                <Text style={styles.weekDates}>
                                  {formatDateRange(weekStart, weekEnd)}
                                </Text>
                              )}
                            </View>
                            <View style={styles.weekHeaderRight}>
                              {completedInWeek > 0 && (
                                <View style={[styles.completionBadge, allDone && styles.completionBadgeDone]}>
                                  <Text style={[styles.completionBadgeText, allDone && styles.completionBadgeTextDone]}>
                                    {completedInWeek}/{totalInWeek}
                                  </Text>
                                </View>
                              )}
                              <Ionicons
                                name={isWeekExpanded ? 'chevron-up' : 'chevron-down'}
                                size={16}
                                color={theme.colors.textTertiary}
                              />
                            </View>
                          </TouchableOpacity>

                          {isWeekExpanded && (
                            <View style={styles.weekBody}>
                              {block.workouts.length === 0 ? (
                                <Text style={styles.noWorkouts}>Geen trainingen deze week</Text>
                              ) : (
                                block.workouts.map((bw, wIndex) => {
                                  const template = bw.workoutTemplate;
                                  if (!template) return null;

                                  const weekNum = getAbsoluteWeekNumber(blockIndex, weekIndex);
                                  const weekEntry = weeklyMap[template.id]?.[weekNum];
                                  const isCompleted = weekEntry?.completed === true;
                                  const isInProgress = weekEntry && !weekEntry.completed;

                                  return (
                                    <TouchableOpacity
                                      key={`${bw.id}-${weekIndex}`}
                                      style={styles.workoutRow}
                                      onPress={() => handleWorkoutPress(bw, blockIndex, weekIndex)}
                                      activeOpacity={0.7}
                                    >
                                      <View style={[
                                        styles.workoutDayCol,
                                        isCompleted && styles.workoutDayColCompleted,
                                        isInProgress && styles.workoutDayColInProgress,
                                      ]}>
                                        {isCompleted ? (
                                          <Ionicons name="checkmark" size={16} color={theme.colors.success} />
                                        ) : (
                                          <Text style={[
                                            styles.workoutDayLabel,
                                            isInProgress && styles.workoutDayLabelInProgress,
                                          ]}>
                                            {bw.dayOfWeek ? DAY_SHORT[bw.dayOfWeek] : `${wIndex + 1}`}
                                          </Text>
                                        )}
                                      </View>
                                      <View style={styles.workoutInfoCol}>
                                        <Text style={[
                                          styles.workoutName,
                                          isCompleted && styles.workoutNameCompleted,
                                        ]} numberOfLines={1}>{template.name}</Text>
                                        <View style={styles.workoutMeta}>
                                          {isCompleted && (
                                            <Text style={styles.workoutMetaCompleted}>Voltooid</Text>
                                          )}
                                          {isInProgress && (
                                            <Text style={styles.workoutMetaInProgress}>Bezig</Text>
                                          )}
                                          {!isCompleted && !isInProgress && (
                                            <>
                                              {template.durationMinutes && (
                                                <Text style={styles.workoutMetaText}>{template.durationMinutes} min</Text>
                                              )}
                                              <Text style={styles.workoutMetaText}>
                                                {template.exercises.length} oefeningen
                                              </Text>
                                            </>
                                          )}
                                        </View>
                                      </View>
                                      <Ionicons
                                        name="chevron-forward"
                                        size={18}
                                        color={isCompleted ? theme.colors.success : theme.colors.primary}
                                      />
                                    </TouchableOpacity>
                                  );
                                })
                              )}
                            </View>
                          )}
                        </View>
                      );
                    })}
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Info Modal */}
      <Modal
        visible={showInfo}
        transparent
        animationType="fade"
        onRequestClose={() => setShowInfo(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowInfo(false)}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Over dit programma</Text>
              <TouchableOpacity onPress={() => setShowInfo(false)}>
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalText}>{program?.program.description}</Text>
          </View>
        </Pressable>
      </Modal>
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

  // Banner - premium gradient
  bannerContainer: {
    position: 'relative',
    height: 200,
  },
  banner: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  bannerFallback: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: theme.colors.headerDark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(30,24,57,0.5)',
  },
  backButton: {
    position: 'absolute',
    top: 12,
    left: 16,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoButton: {
    position: 'absolute',
    top: 12,
    right: 16,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerTitleArea: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingBottom: 16,
    paddingTop: 40,
  },
  bannerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
    marginBottom: 10,
  },
  bannerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  bannerMetaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  bannerMetaText: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxHeight: '70%',
    ...theme.shadows.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
  },
  modalText: {
    fontSize: 15,
    color: theme.colors.textSecondary,
    lineHeight: 23,
  },

  // Blocks
  blocksContainer: {
    paddingTop: 4,
  },
  blockSection: {
    marginBottom: 2,
  },
  blockHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  blockHeaderActive: {
    backgroundColor: theme.colors.surface,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.primary,
  },
  blockHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    minWidth: 0,
  },
  blockTextCol: {
    flex: 1,
    minWidth: 0,
  },
  blockDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.border,
  },
  blockDotActive: {
    backgroundColor: theme.colors.primary,
  },
  blockTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text,
  },
  blockTitleActive: {
    color: theme.colors.primary,
  },
  blockSubtitle: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },

  // Weeks
  weeksContainer: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  blockDesc: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    lineHeight: 19,
    marginBottom: 10,
    marginTop: 4,
  },
  weekCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 14,
    overflow: 'hidden',
    marginTop: 8,
    ...theme.shadows.sm,
  },
  weekHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  weekHeaderLeft: {
    flex: 1,
  },
  weekTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.text,
  },
  weekDates: {
    fontSize: 12,
    color: theme.colors.textTertiary,
    marginTop: 2,
  },
  weekHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  completionBadge: {
    backgroundColor: theme.colors.background,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  completionBadgeDone: {
    backgroundColor: `${theme.colors.success}18`,
  },
  completionBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textTertiary,
  },
  completionBadgeTextDone: {
    color: theme.colors.success,
  },
  weekBody: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  noWorkouts: {
    fontSize: 13,
    color: theme.colors.textTertiary,
    textAlign: 'center',
    paddingVertical: 16,
  },

  // Workout row
  workoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  workoutDayCol: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: theme.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  workoutDayColCompleted: {
    backgroundColor: `${theme.colors.success}18`,
  },
  workoutDayColInProgress: {
    backgroundColor: '#dbeafe',
  },
  workoutDayLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  workoutDayLabelInProgress: {
    color: '#3b82f6',
  },
  workoutInfoCol: {
    flex: 1,
  },
  workoutName: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.text,
  },
  workoutNameCompleted: {
    color: theme.colors.textSecondary,
  },
  workoutMeta: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 3,
  },
  workoutMetaText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  workoutMetaCompleted: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.success,
  },
  workoutMetaInProgress: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3b82f6',
  },
});
