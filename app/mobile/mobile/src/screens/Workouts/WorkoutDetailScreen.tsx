import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useWorkoutDetail, useCompleteWorkout } from '../../hooks/useWorkouts';
import { loadWorkoutLogs, reopenWorkout } from '../../lib/api';
import { fetchPreviousWeekLogs } from '../../lib/programApi';
import { theme } from '../../constants/theme';

type Exercise = {
  id: string;
  name: string;
  description: string | null;
  category: string;
  muscleGroups: string[] | null;
  thumbnailUrl: string | null;
  gifUrl: string | null;
};

type TemplateExercise = {
  id: string;
  orderIndex: number;
  sets: number | null;
  reps: string | null;
  restSeconds: number | null;
  notes: string | null;
  intensityType: string;
  prescribedWeightKg: number | null;
  prescribedRpe: number | null;
  prescribedRir: number | null;
  prescribedPercentage: number | null;
  tempo: string | null;
  exercise: Exercise;
};

type WorkoutDetail = {
  id: string;
  scheduledDate: string | null;
  completed: boolean;
  completedAt: string | null;
  notes: string | null;
  workoutTemplate: {
    id: string;
    name: string;
    description: string | null;
    durationMinutes: number | null;
    exercises: TemplateExercise[];
  };
  coach: {
    profile: {
      firstName: string | null;
      lastName: string | null;
    } | null;
  };
};

type LogEntry = {
  id: string;
  exerciseId: string;
  setNumber: number;
  repsCompleted: number;
  weightKg: number | null;
  actualRpe: number | null;
  actualRir: number | null;
};

function getPrescriptionLabel(item: TemplateExercise): string | null {
  switch (item.intensityType) {
    case 'weight':
      return item.prescribedWeightKg ? `${item.prescribedWeightKg} kg` : null;
    case 'rpe':
      return item.prescribedRpe ? `RPE ${item.prescribedRpe}` : null;
    case 'rir':
      return item.prescribedRir != null ? `RIR ${item.prescribedRir}` : null;
    case 'percentage':
      return item.prescribedPercentage ? `${item.prescribedPercentage}% 1RM` : null;
    case 'bodyweight':
      return 'Lichaamsgewicht';
    default:
      return null;
  }
}

export default function WorkoutDetailScreen({ route, navigation }: any) {
  const { workoutId, templateData, weekNumber, clientProgramId } = route.params;

  const resolvedWeekNumber: number | null = weekNumber ?? templateData?.weekNumber ?? null;
  const resolvedProgramId: string | null = clientProgramId ?? templateData?.clientProgramId ?? null;

  const { data: fetchedWorkout, isLoading: fetchLoading, refetch } = useWorkoutDetail(workoutId || '') as {
    data: WorkoutDetail | undefined;
    isLoading: boolean;
    refetch: () => void;
  };

  const completeWorkoutMutation = useCompleteWorkout();

  const [workoutLogs, setWorkoutLogs] = useState<LogEntry[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [reopening, setReopening] = useState(false);
  const [prevWeekLogs, setPrevWeekLogs] = useState<LogEntry[]>([]);

  const isLoading = workoutId ? fetchLoading : false;
  const workout: WorkoutDetail | undefined = workoutId
    ? fetchedWorkout
    : templateData
      ? {
          id: '',
          scheduledDate: null,
          completed: false,
          completedAt: null,
          notes: null,
          workoutTemplate: templateData.workoutTemplate,
          coach: { profile: null },
        }
      : undefined;
  const isFromTemplate = !workoutId && !!templateData;

  useEffect(() => {
    if (workoutId && workout) {
      loadLogs();
    }
  }, [workoutId, workout?.completed]);

  useEffect(() => {
    if (resolvedProgramId && resolvedWeekNumber != null && resolvedWeekNumber > 0 && workout?.workoutTemplate?.id) {
      loadPrevWeekLogs();
    }
  }, [resolvedProgramId, resolvedWeekNumber, workout?.workoutTemplate?.id]);

  async function loadLogs() {
    if (!workoutId) return;
    setLogsLoading(true);
    try {
      const logs = await loadWorkoutLogs(workoutId);
      setWorkoutLogs(logs);
    } catch (e) {
      console.log('Could not load workout logs');
    }
    setLogsLoading(false);
  }

  async function loadPrevWeekLogs() {
    if (!resolvedProgramId || resolvedWeekNumber == null || !workout?.workoutTemplate?.id) return;
    try {
      const logs = await fetchPreviousWeekLogs(resolvedProgramId, workout.workoutTemplate.id, resolvedWeekNumber);
      setPrevWeekLogs(logs as LogEntry[]);
    } catch (e) {
      console.log('Could not load previous week logs');
    }
  }

  const logsByExercise: Record<string, LogEntry[]> = {};
  for (const log of workoutLogs) {
    if (!logsByExercise[log.exerciseId]) logsByExercise[log.exerciseId] = [];
    logsByExercise[log.exerciseId].push(log);
  }

  const prevLogsByExercise: Record<string, LogEntry[]> = {};
  for (const log of prevWeekLogs) {
    if (!prevLogsByExercise[log.exerciseId]) prevLogsByExercise[log.exerciseId] = [];
    prevLogsByExercise[log.exerciseId].push(log);
  }

  const handleComplete = () => {
    Alert.alert(
      'Workout Voltooien',
      'Weet je zeker dat je deze workout als voltooid wilt markeren?',
      [
        { text: 'Annuleren', style: 'cancel' },
        {
          text: 'Voltooien',
          onPress: () => {
            completeWorkoutMutation.mutate(
              { id: workoutId },
              {
                onSuccess: () => {
                  Alert.alert('Gelukt!', 'Workout is voltooid!', [
                    { text: 'OK', onPress: () => navigation.goBack() },
                  ]);
                },
                onError: (error) => {
                  console.error('Error completing workout:', error);
                  Alert.alert('Fout', 'Kan workout niet voltooien');
                },
              }
            );
          },
        },
      ]
    );
  };

  const handleEdit = () => {
    Alert.alert(
      'Workout bewerken',
      'Wil je deze workout heropenen om je sets aan te passen?',
      [
        { text: 'Annuleren', style: 'cancel' },
        {
          text: 'Bewerken',
          onPress: async () => {
            setReopening(true);
            try {
              await reopenWorkout(workoutId);
              refetch();
              navigation.navigate('ActiveWorkout', {
                workoutId,
                weekNumber: resolvedWeekNumber,
                clientProgramId: resolvedProgramId,
              });
            } catch (err: any) {
              console.error('Reopen error:', err?.message);
              Alert.alert('Fout', 'Kan workout niet heropenen.');
            } finally {
              setReopening(false);
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Workout laden...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!workout) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={theme.colors.textTertiary} />
          <Text style={styles.loadingText}>Workout niet gevonden</Text>
        </View>
      </SafeAreaView>
    );
  }

  const coachName =
    workout.coach?.profile?.firstName && workout.coach?.profile?.lastName
      ? `${workout.coach.profile.firstName} ${workout.coach.profile.lastName}`
      : 'Je coach';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Gradient Header */}
      <LinearGradient
        colors={theme.gradients.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {workout.workoutTemplate.name}
          </Text>
          {workout.scheduledDate && (
            <Text style={styles.headerDate}>
              {new Date(workout.scheduledDate).toLocaleDateString('nl-NL', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
              })}
            </Text>
          )}
        </View>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Status + Info Row */}
        <View style={styles.statusInfoRow}>
          {/* Status Badge */}
          {workout.completed ? (
            <View style={[styles.badge, styles.badgeCompleted]}>
              <Ionicons name="checkmark-circle" size={14} color="#065f46" />
              <Text style={[styles.badgeText, { color: '#065f46' }]}>Voltooid</Text>
            </View>
          ) : (
            <View style={[styles.badge, styles.badgePending]}>
              <Ionicons name="time-outline" size={14} color={theme.colors.primary} />
              <Text style={[styles.badgeText, { color: theme.colors.primary }]}>Te doen</Text>
            </View>
          )}
        </View>

        {/* Quick Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <View style={styles.statIconWrap}>
              <Ionicons name="person-outline" size={18} color={theme.colors.primary} />
            </View>
            <Text style={styles.statLabel}>Coach</Text>
            <Text style={styles.statValue}>{coachName}</Text>
          </View>
          {workout.workoutTemplate.durationMinutes && (
            <View style={styles.statCard}>
              <View style={styles.statIconWrap}>
                <Ionicons name="time-outline" size={18} color={theme.colors.primary} />
              </View>
              <Text style={styles.statLabel}>Duur</Text>
              <Text style={styles.statValue}>{workout.workoutTemplate.durationMinutes} min</Text>
            </View>
          )}
          <View style={styles.statCard}>
            <View style={styles.statIconWrap}>
              <Ionicons name="barbell-outline" size={18} color={theme.colors.primary} />
            </View>
            <Text style={styles.statLabel}>Oefeningen</Text>
            <Text style={styles.statValue}>{workout.workoutTemplate.exercises.length}</Text>
          </View>
        </View>

        {/* Description */}
        {workout.workoutTemplate.description && (
          <View style={styles.descriptionCard}>
            <Text style={styles.descriptionTitle}>Beschrijving</Text>
            <Text style={styles.descriptionText}>{workout.workoutTemplate.description}</Text>
          </View>
        )}

        {/* Coach Notes */}
        {workout.notes && (
          <View style={styles.notesCard}>
            <View style={styles.notesHeader}>
              <Ionicons name="chatbox-ellipses-outline" size={16} color="#92400e" />
              <Text style={styles.notesLabel}>Coach notities</Text>
            </View>
            <Text style={styles.notesText}>{workout.notes}</Text>
          </View>
        )}

        {/* Exercises List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Oefeningen</Text>
          {workout.workoutTemplate.exercises.map((item, index) => {
            const imageUrl = item.exercise?.gifUrl || item.exercise?.thumbnailUrl;
            const exerciseLogs = item.exercise?.id ? logsByExercise[item.exercise.id] : undefined;
            return (
              <View key={item.id} style={styles.exerciseCard}>
                <View style={styles.exerciseHeader}>
                  {imageUrl ? (
                    <Image
                      source={{ uri: imageUrl }}
                      style={styles.exerciseImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={styles.exerciseNumber}>
                      <Text style={styles.exerciseNumberText}>{index + 1}</Text>
                    </View>
                  )}
                  <View style={styles.exerciseContent}>
                    <Text style={styles.exerciseName}>{item.exercise?.name || 'Oefening'}</Text>
                    <View style={styles.exerciseMeta}>
                      {item.sets && (
                        <View style={styles.metaChip}>
                          <Text style={styles.metaChipText}>{item.sets} sets</Text>
                        </View>
                      )}
                      {item.reps && (
                        <View style={styles.metaChip}>
                          <Text style={styles.metaChipText}>{item.reps} reps</Text>
                        </View>
                      )}
                      {item.restSeconds && (
                        <View style={styles.metaChip}>
                          <Text style={styles.metaChipText}>{item.restSeconds}s rust</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>

                {/* Prescription info */}
                {(() => {
                  const label = getPrescriptionLabel(item);
                  return label || item.tempo ? (
                    <View style={styles.prescriptionRow}>
                      {label && (
                        <View style={styles.prescriptionChip}>
                          <Ionicons name="fitness-outline" size={11} color={theme.colors.primary} />
                          <Text style={styles.prescriptionText}>{label}</Text>
                        </View>
                      )}
                      {item.tempo && (
                        <View style={styles.prescriptionChip}>
                          <Ionicons name="timer-outline" size={11} color={theme.colors.primary} />
                          <Text style={styles.prescriptionText}>Tempo {item.tempo}</Text>
                        </View>
                      )}
                    </View>
                  ) : null;
                })()}

                {item.exercise?.muscleGroups && (
                  <Text style={styles.muscleText}>
                    {(item.exercise.muscleGroups as string[]).join(', ')}
                  </Text>
                )}

                {item.notes && (
                  <Text style={styles.exerciseNotes}>{item.notes}</Text>
                )}

                {/* Logged sets (current week) */}
                {exerciseLogs && exerciseLogs.length > 0 && (
                  <View style={styles.loggedSets}>
                    {exerciseLogs
                      .sort((a, b) => a.setNumber - b.setNumber)
                      .map((log) => (
                      <View key={log.id} style={styles.logRow}>
                        <View style={styles.logSetBadge}>
                          <Text style={styles.logSetBadgeText}>{log.setNumber}</Text>
                        </View>
                        <Text style={styles.logText}>
                          {log.repsCompleted} reps
                          {log.weightKg != null ? ` × ${log.weightKg} kg` : ''}
                        </Text>
                        {log.actualRpe != null && (
                          <View style={styles.logPill}>
                            <Text style={styles.logPillText}>RPE {log.actualRpe}</Text>
                          </View>
                        )}
                        {log.actualRir != null && (
                          <View style={styles.logPill}>
                            <Text style={styles.logPillText}>RIR {log.actualRir}</Text>
                          </View>
                        )}
                      </View>
                    ))}
                  </View>
                )}

                {/* Previous week's data */}
                {(() => {
                  const prevLogs = item.exercise?.id ? prevLogsByExercise[item.exercise.id] : undefined;
                  if (!prevLogs || prevLogs.length === 0) return null;
                  return (
                    <View style={styles.prevWeekSection}>
                      <Text style={styles.prevWeekLabel}>Vorige week</Text>
                      {prevLogs
                        .sort((a, b) => a.setNumber - b.setNumber)
                        .map((log, idx) => (
                        <View key={idx} style={styles.prevWeekRow}>
                          <View style={styles.prevWeekBadge}>
                            <Text style={styles.prevWeekBadgeText}>{log.setNumber}</Text>
                          </View>
                          <Text style={styles.prevWeekText}>
                            {log.repsCompleted} reps
                            {log.weightKg != null ? ` × ${log.weightKg} kg` : ''}
                          </Text>
                          {log.actualRpe != null && (
                            <Text style={styles.prevWeekPill}>RPE {log.actualRpe}</Text>
                          )}
                        </View>
                      ))}
                    </View>
                  );
                })()}
              </View>
            );
          })}
        </View>

        {/* Action Buttons */}
        {!workout.completed && (
          <View style={{ gap: 10 }}>
            <TouchableOpacity
              style={styles.startButton}
              activeOpacity={0.85}
              onPress={() => {
                if (isFromTemplate) {
                  navigation.navigate('ActiveWorkout', {
                    templateData,
                    weekNumber: resolvedWeekNumber,
                    clientProgramId: resolvedProgramId,
                  });
                } else {
                  navigation.navigate('ActiveWorkout', {
                    workoutId: workout.id,
                    weekNumber: resolvedWeekNumber,
                    clientProgramId: resolvedProgramId,
                  });
                }
              }}
            >
              <LinearGradient
                colors={theme.gradients.primary}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.startButtonGradient}
              >
                <Ionicons name="play-circle" size={22} color="#fff" />
                <Text style={styles.startButtonText}>
                  {workoutLogs.length > 0 ? 'Doorgaan' : 'Start Workout'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
            {!isFromTemplate && (
              <TouchableOpacity
                style={styles.completeButton}
                onPress={handleComplete}
                disabled={completeWorkoutMutation.isPending}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={theme.gradients.success}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.completeButtonGradient}
                >
                  {completeWorkoutMutation.isPending ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <>
                      <Ionicons name="checkmark-circle" size={22} color="#fff" />
                      <Text style={styles.completeButtonText}>Direct Voltooien</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            )}
          </View>
        )}

        {workout.completed && (
          <View style={{ gap: 10 }}>
            <View style={styles.completedBanner}>
              <Ionicons name="checkmark-circle" size={24} color={theme.colors.success} />
              <Text style={styles.completedText}>
                Voltooid{workout.completedAt ? ` op ${new Date(workout.completedAt).toLocaleDateString('nl-NL', {
                  day: 'numeric',
                  month: 'long',
                  hour: '2-digit',
                  minute: '2-digit',
                })}` : ''}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.editButton}
              onPress={handleEdit}
              disabled={reopening}
              activeOpacity={0.85}
            >
              {reopening ? (
                <ActivityIndicator color={theme.colors.primary} />
              ) : (
                <>
                  <Ionicons name="create-outline" size={20} color={theme.colors.primary} />
                  <Text style={styles.editButtonText}>Bewerken</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
  },
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: theme.spacing.sm,
  },
  headerTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textOnPrimary,
    textTransform: 'uppercase',
  },
  headerDate: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  scrollContent: {
    padding: theme.spacing.xl,
    paddingBottom: 40,
  },
  // Status + Info
  statusInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.sm,
  },
  badgeCompleted: {
    backgroundColor: '#d1fae5',
  },
  badgePending: {
    backgroundColor: theme.colors.primaryLight,
  },
  badgeText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
  },
  // Stats
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: theme.spacing.xxl,
  },
  statCard: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
    gap: 4,
    ...theme.shadow.sm,
  },
  statIconWrap: {
    width: 32,
    height: 32,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textTertiary,
    textTransform: 'uppercase',
    fontWeight: theme.fontWeight.semibold,
  },
  statValue: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  // Description
  descriptionCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    ...theme.shadow.sm,
  },
  descriptionTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  descriptionText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    lineHeight: 22,
  },
  // Notes
  notesCard: {
    backgroundColor: '#fef3c7',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.xxl,
  },
  notesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  notesLabel: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.bold,
    color: '#92400e',
  },
  notesText: {
    fontSize: theme.fontSize.sm + 1,
    color: '#78350f',
    lineHeight: 20,
  },
  // Section
  section: {
    marginBottom: theme.spacing.xxl,
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  // Exercise Card
  exerciseCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    marginBottom: 10,
    ...theme.shadow.sm,
  },
  exerciseHeader: {
    flexDirection: 'row',
  },
  exerciseImage: {
    width: 56,
    height: 56,
    borderRadius: 10,
    marginRight: theme.spacing.md,
    backgroundColor: theme.colors.border,
  },
  exerciseNumber: {
    width: 36,
    height: 36,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  exerciseNumberText: {
    color: '#fff',
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.bold,
  },
  exerciseContent: {
    flex: 1,
  },
  exerciseName: {
    fontSize: theme.fontSize.md + 1,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: 6,
  },
  exerciseMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  metaChip: {
    backgroundColor: theme.colors.background,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  metaChipText: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.textSecondary,
  },
  prescriptionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: theme.spacing.sm,
  },
  prescriptionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: theme.colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  prescriptionText: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.primary,
  },
  muscleText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textTertiary,
    marginTop: 4,
  },
  exerciseNotes: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
    marginTop: 6,
  },
  // Logged sets
  loggedSets: {
    marginTop: theme.spacing.sm,
    gap: 4,
  },
  logRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: '#f0fdf4',
    borderRadius: 6,
  },
  logSetBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#bbf7d0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logSetBadgeText: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.bold,
    color: '#166534',
  },
  logText: {
    flex: 1,
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
  },
  logPill: {
    backgroundColor: theme.colors.primaryLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  logPillText: {
    fontSize: 10,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.primary,
  },
  // Buttons
  startButton: {
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
    marginTop: theme.spacing.sm,
    ...theme.shadow.md,
  },
  startButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  startButtonText: {
    color: '#fff',
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
  },
  completeButton: {
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
  },
  completeButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
  },
  completeButtonText: {
    color: '#fff',
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
  },
  completedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#d1fae5',
    paddingVertical: 14,
    borderRadius: theme.borderRadius.md,
    marginTop: theme.spacing.sm,
  },
  completedText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: '#065f46',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: theme.colors.surface,
    paddingVertical: 14,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  editButtonText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.primary,
  },
  // Previous week reference
  prevWeekSection: {
    marginTop: theme.spacing.sm,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderLight,
    gap: 3,
  },
  prevWeekLabel: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textTertiary,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  prevWeekRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 2,
  },
  prevWeekBadge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: theme.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  prevWeekBadgeText: {
    fontSize: 10,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textTertiary,
  },
  prevWeekText: {
    flex: 1,
    fontSize: theme.fontSize.xs,
    color: theme.colors.textTertiary,
  },
  prevWeekPill: {
    fontSize: 10,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.textTertiary,
  },
});
