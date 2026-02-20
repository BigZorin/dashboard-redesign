import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { theme } from '../../constants/theme';
import { useQueryClient } from '@tanstack/react-query';
import { useWorkoutDetail, useCompleteWorkout, workoutKeys } from '../../hooks/useWorkouts';
import { programKeys } from '../../hooks/usePrograms';
import { useRestTimer } from '../../hooks/useRestTimer';
import RestTimer from '../../components/RestTimer';
import {
  startWorkout,
  saveSetLog,
  finishWorkout,
  loadWorkoutLogs,
  deleteWorkout,
  completeWorkout,
} from '../../lib/api';
import { fetchPreviousWeekLogs } from '../../lib/programApi';

const ACTIVE_WORKOUT_KEY = 'active_workout_session';

type SetLog = {
  repsCompleted: number;
  weightKg: number | null;
  actualRpe: number | null;
  actualRir: number | null;
  savedToDb?: boolean;
  dbLogId?: string;
};

function getPrescriptionLabel(ex: any): string | null {
  switch (ex.intensityType) {
    case 'weight':
      return ex.prescribedWeightKg ? `${ex.prescribedWeightKg} kg` : null;
    case 'rpe':
      return ex.prescribedRpe ? `RPE ${ex.prescribedRpe}` : null;
    case 'rir':
      return ex.prescribedRir != null ? `RIR ${ex.prescribedRir}` : null;
    case 'percentage':
      return ex.prescribedPercentage ? `${ex.prescribedPercentage}% 1RM` : null;
    case 'bodyweight':
      return 'Lichaamsgewicht';
    default:
      return null;
  }
}

export default function ActiveWorkoutScreen({ route, navigation }: any) {
  const { workoutId, templateData, weekNumber, clientProgramId } = route.params;
  const resolvedWeekNumber: number | null = weekNumber ?? templateData?.weekNumber ?? null;
  const resolvedProgramId: string | null = clientProgramId ?? templateData?.clientProgramId ?? null;

  const queryClient = useQueryClient();
  const { data: fetchedWorkout, isLoading: fetchLoading } = useWorkoutDetail(workoutId || '') as any;
  const completeWorkoutMutation = useCompleteWorkout();
  const timer = useRestTimer();

  const isFromTemplate = !workoutId && !!templateData;
  const isLoading = workoutId ? fetchLoading : false;
  const workout = workoutId
    ? fetchedWorkout
    : templateData
      ? { id: null, workoutTemplate: templateData.workoutTemplate }
      : null;

  const [liveWorkoutId, setLiveWorkoutId] = useState<string | null>(workoutId || null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [savingSet, setSavingSet] = useState(false);

  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSetIndex, setCurrentSetIndex] = useState(0);
  const [exerciseLogs, setExerciseLogs] = useState<Record<string, SetLog[]>>({});
  const [repsInput, setRepsInput] = useState('');
  const [weightInput, setWeightInput] = useState('');
  const [rpeInput, setRpeInput] = useState<number | null>(null);
  const [rirInput, setRirInput] = useState<number | null>(null);

  const [prevWeekByExercise, setPrevWeekByExercise] = useState<
    Record<string, Array<{ setNumber: number; repsCompleted: number; weightKg: number | null; actualRpe: number | null }>>
  >({});

  const exercises = workout?.workoutTemplate?.exercises || [];
  const currentExercise = exercises[currentExerciseIndex];
  const totalExercises = exercises.length;

  // Load previous week's data
  useEffect(() => {
    if (resolvedProgramId && resolvedWeekNumber != null && resolvedWeekNumber > 0 && workout?.workoutTemplate?.id) {
      fetchPreviousWeekLogs(resolvedProgramId, workout.workoutTemplate.id, resolvedWeekNumber)
        .then((logs) => {
          const grouped: typeof prevWeekByExercise = {};
          for (const l of logs) {
            if (!grouped[l.exerciseId]) grouped[l.exerciseId] = [];
            grouped[l.exerciseId].push(l);
          }
          setPrevWeekByExercise(grouped);
        })
        .catch(() => {});
    }
  }, [resolvedProgramId, resolvedWeekNumber, workout?.workoutTemplate?.id]);

  // Initialize workout session
  useEffect(() => {
    initializeSession();
  }, [workout]);

  async function initializeSession() {
    if (!workout?.workoutTemplate) return;
    try {
      const savedSession = await AsyncStorage.getItem(ACTIVE_WORKOUT_KEY);
      if (savedSession) {
        const session = JSON.parse(savedSession);
        const currentTemplateId = workout.workoutTemplate.id;
        if (session.templateId === currentTemplateId && session.liveWorkoutId) {
          setLiveWorkoutId(session.liveWorkoutId);
          setCurrentExerciseIndex(session.currentExerciseIndex || 0);
          try {
            const dbLogs = await loadWorkoutLogs(session.liveWorkoutId);
            if (dbLogs.length > 0) {
              const rebuilt: Record<string, SetLog[]> = {};
              for (const log of dbLogs) {
                const templateEx = exercises.find((ex: any) => ex.exercise?.id === log.exerciseId);
                if (templateEx) {
                  if (!rebuilt[templateEx.id]) rebuilt[templateEx.id] = [];
                  rebuilt[templateEx.id].push({
                    repsCompleted: log.repsCompleted,
                    weightKg: log.weightKg,
                    actualRpe: log.actualRpe,
                    actualRir: log.actualRir,
                    savedToDb: true,
                    dbLogId: log.id,
                  });
                }
              }
              setExerciseLogs(rebuilt);
            }
          } catch (e) {}
          setIsInitializing(false);
          return;
        }
      }
      if (isFromTemplate) {
        const newId = await startWorkout(
          templateData.workoutTemplate.id,
          templateData.coachId,
          templateData.clientProgramId || null,
          resolvedWeekNumber,
        );
        setLiveWorkoutId(newId);
        await AsyncStorage.setItem(ACTIVE_WORKOUT_KEY, JSON.stringify({
          templateId: workout.workoutTemplate.id, liveWorkoutId: newId, currentExerciseIndex: 0,
        }));
      } else if (workoutId) {
        setLiveWorkoutId(workoutId);
        await AsyncStorage.setItem(ACTIVE_WORKOUT_KEY, JSON.stringify({
          templateId: workout.workoutTemplate.id, liveWorkoutId: workoutId, currentExerciseIndex: 0,
        }));
      }
    } catch (err: any) {
      Alert.alert('Fout', `Kon workout niet starten: ${err?.message || 'Onbekende fout'}`);
    }
    setIsInitializing(false);
  }

  const saveSessionState = useCallback(async (exerciseIdx: number) => {
    if (!liveWorkoutId || !workout?.workoutTemplate) return;
    try {
      await AsyncStorage.setItem(ACTIVE_WORKOUT_KEY, JSON.stringify({
        templateId: workout.workoutTemplate.id, liveWorkoutId, currentExerciseIndex: exerciseIdx,
      }));
    } catch {}
  }, [liveWorkoutId, workout]);

  useEffect(() => {
    if (!currentExercise) return;
    const exerciseId = currentExercise.exercise?.id;
    const prevSets = exerciseId ? prevWeekByExercise[exerciseId] : undefined;
    if (prevSets && prevSets.length > 0) {
      const lastWeight = prevSets[prevSets.length - 1].weightKg;
      setWeightInput(lastWeight != null ? String(lastWeight) : '');
    } else {
      const intensity = currentExercise.intensityType || 'weight';
      if ((intensity === 'weight' || intensity === 'percentage') && currentExercise.prescribedWeightKg) {
        setWeightInput(String(currentExercise.prescribedWeightKg));
      } else {
        setWeightInput('');
      }
    }
    setRepsInput('');
    setRpeInput(null);
    setRirInput(null);
  }, [currentExerciseIndex, exercises.length, prevWeekByExercise]);

  const completedSetsCount = useMemo(() => {
    let count = 0;
    Object.values(exerciseLogs).forEach((sets) => { count += sets.length; });
    return count;
  }, [exerciseLogs]);

  const totalSetsCount = useMemo(() => {
    return exercises.reduce((sum: number, ex: any) => sum + (ex.sets || 1), 0);
  }, [exercises]);

  if (isLoading || isInitializing) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Workout laden...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!workout || !currentExercise) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.centered}>
          <Text style={styles.loadingText}>Workout niet gevonden</Text>
        </View>
      </SafeAreaView>
    );
  }

  const totalSets = currentExercise.sets || 1;
  const currentSets = exerciseLogs[currentExercise.id] || [];
  const setsCompleted = currentSets.length;
  const allSetsForExerciseDone = setsCompleted >= totalSets;
  const intensityType = currentExercise.intensityType || 'weight';
  const showRpeInput = intensityType === 'rpe' || intensityType === 'weight' || intensityType === 'percentage';
  const showRirInput = intensityType === 'rir';
  const isBodyweight = intensityType === 'bodyweight';
  const prescriptionLabel = getPrescriptionLabel(currentExercise);
  const progressPercent = totalSetsCount > 0 ? (completedSetsCount / totalSetsCount) * 100 : 0;

  const handleLogSet = async () => {
    const reps = parseInt(repsInput) || 0;
    if (reps <= 0) { Alert.alert('Voer reps in', 'Vul het aantal herhalingen in.'); return; }
    if (!liveWorkoutId) { Alert.alert('Fout', 'Workout sessie niet gestart.'); return; }
    if (!currentExercise.exercise?.id) { Alert.alert('Fout', 'Oefening data ontbreekt.'); return; }

    const weight = weightInput ? parseFloat(weightInput) : null;
    const newSet: SetLog = { repsCompleted: reps, weightKg: weight, actualRpe: rpeInput, actualRir: rirInput, savedToDb: false };
    const updatedSets = [...(exerciseLogs[currentExercise.id] || []), newSet];
    setExerciseLogs((prev) => ({ ...prev, [currentExercise.id]: updatedSets }));
    setRepsInput('');
    setRpeInput(null);
    setRirInput(null);

    const newSetsCompleted = setsCompleted + 1;
    const isLastSetForExercise = newSetsCompleted >= totalSets;
    const isLastExercise = currentExerciseIndex >= totalExercises - 1;

    if (!(isLastSetForExercise && isLastExercise)) {
      const restSeconds = currentExercise.restSeconds;
      if (restSeconds && restSeconds > 0) timer.start(restSeconds);
    }

    setSavingSet(true);
    try {
      const dbLogId = await saveSetLog(liveWorkoutId, {
        exerciseId: currentExercise.exercise.id, setNumber: newSetsCompleted,
        repsCompleted: reps, weightKg: weight,
        prescribedReps: currentExercise.reps || null,
        prescribedWeightKg: currentExercise.prescribedWeightKg ?? null,
        prescribedRpe: currentExercise.prescribedRpe ?? null,
        prescribedRir: currentExercise.prescribedRir ?? null,
        actualRpe: rpeInput, actualRir: rirInput,
      });
      setExerciseLogs((prev) => {
        const sets = [...(prev[currentExercise.id] || [])];
        const idx = sets.length - 1;
        if (idx >= 0) sets[idx] = { ...sets[idx], savedToDb: true, dbLogId };
        return { ...prev, [currentExercise.id]: sets };
      });
    } catch (err: any) {}
    setSavingSet(false);
  };

  const handleNextExercise = () => {
    if (currentExerciseIndex < totalExercises - 1) {
      timer.reset();
      const newIdx = currentExerciseIndex + 1;
      setCurrentExerciseIndex(newIdx);
      setCurrentSetIndex(0);
      saveSessionState(newIdx);
    }
  };

  const handlePreviousExercise = () => {
    if (currentExerciseIndex > 0) {
      timer.reset();
      const newIdx = currentExerciseIndex - 1;
      setCurrentExerciseIndex(newIdx);
      setCurrentSetIndex(0);
      saveSessionState(newIdx);
    }
  };

  const handleFinishWorkout = () => {
    const unsavedCount = Object.values(exerciseLogs).flat().filter((s) => !s.savedToDb).length;
    Alert.alert(
      'Workout Voltooien',
      `Je hebt ${completedSetsCount}/${totalSetsCount} sets voltooid.${unsavedCount > 0 ? ` (${unsavedCount} sets worden nog opgeslagen)` : ''} Workout afronden?`,
      [
        { text: 'Annuleren', style: 'cancel' },
        {
          text: 'Voltooien',
          onPress: async () => {
            if (!liveWorkoutId) return;
            setIsSubmitting(true);
            try {
              await finishWorkout(liveWorkoutId);
              await AsyncStorage.removeItem(ACTIVE_WORKOUT_KEY);
              queryClient.invalidateQueries({ queryKey: workoutKeys.lists() });
              queryClient.invalidateQueries({ queryKey: programKeys.all });
              Alert.alert('Gelukt!', 'Workout voltooid!', [{
                text: 'OK',
                onPress: () => { resolvedProgramId ? navigation.pop(2) : navigation.pop(1); },
              }]);
            } catch (err: any) {
              Alert.alert('Fout', `Kan workout niet afronden: ${err?.message}`);
            } finally { setIsSubmitting(false); }
          },
        },
      ]
    );
  };

  const handleQuit = () => {
    const hasSets = completedSetsCount > 0;
    Alert.alert(
      'Workout pauzeren?',
      hasSets ? `Je ${completedSetsCount} gelogde sets zijn opgeslagen.` : 'Je kunt later verdergaan.',
      [
        { text: 'Doorgaan', style: 'cancel' },
        { text: 'Pauzeren', onPress: () => navigation.goBack() },
        ...(hasSets ? [] : [{
          text: 'Verwijderen', style: 'destructive' as const,
          onPress: async () => {
            if (liveWorkoutId && isFromTemplate) {
              try { await deleteWorkout(liveWorkoutId); await AsyncStorage.removeItem(ACTIVE_WORKOUT_KEY); } catch {}
            }
            navigation.goBack();
          },
        }]),
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleQuit} style={styles.headerBtn}>
          <Ionicons name="close" size={22} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {workout.workoutTemplate.name}
          </Text>
          <View style={styles.headerSubRow}>
            <Text style={styles.headerSubtitle}>
              {completedSetsCount}/{totalSetsCount} sets
            </Text>
            {savingSet && <ActivityIndicator size="small" color="rgba(255,255,255,0.6)" />}
          </View>
        </View>
        <TouchableOpacity
          onPress={handleFinishWorkout}
          style={styles.headerBtn}
          disabled={completedSetsCount === 0 || isSubmitting}
        >
          <Ionicons
            name="checkmark-done"
            size={22}
            color={completedSetsCount > 0 ? theme.colors.success : 'rgba(255,255,255,0.3)'}
          />
        </TouchableOpacity>
      </View>

      {/* Progress bar */}
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Exercise navigation */}
        <View style={styles.exerciseNav}>
          <TouchableOpacity
            onPress={handlePreviousExercise}
            disabled={currentExerciseIndex === 0}
            style={[styles.navBtn, currentExerciseIndex === 0 && styles.navBtnDisabled]}
          >
            <Ionicons name="chevron-back" size={18} color={currentExerciseIndex === 0 ? theme.colors.border : theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.exerciseCounter}>
            Oefening {currentExerciseIndex + 1} / {totalExercises}
          </Text>
          <TouchableOpacity
            onPress={handleNextExercise}
            disabled={currentExerciseIndex >= totalExercises - 1}
            style={[styles.navBtn, currentExerciseIndex >= totalExercises - 1 && styles.navBtnDisabled]}
          >
            <Ionicons name="chevron-forward" size={18} color={currentExerciseIndex >= totalExercises - 1 ? theme.colors.border : theme.colors.text} />
          </TouchableOpacity>
        </View>

        {/* Current exercise card */}
        <View style={styles.exerciseCard}>
          {(currentExercise.exercise?.gifUrl || currentExercise.exercise?.thumbnailUrl) && (
            <Image
              source={{ uri: currentExercise.exercise.gifUrl || currentExercise.exercise.thumbnailUrl }}
              style={styles.exerciseGif}
              resizeMode="contain"
            />
          )}
          <Text style={styles.exerciseName}>{currentExercise.exercise?.name || 'Oefening'}</Text>
          <View style={styles.exerciseMeta}>
            {currentExercise.sets && (
              <View style={styles.metaChip}>
                <Text style={styles.metaChipText}>{currentExercise.sets} sets</Text>
              </View>
            )}
            {currentExercise.reps && (
              <View style={styles.metaChip}>
                <Text style={styles.metaChipText}>{currentExercise.reps} reps</Text>
              </View>
            )}
            {currentExercise.restSeconds && (
              <View style={styles.metaChip}>
                <Ionicons name="timer-outline" size={11} color={theme.colors.textSecondary} />
                <Text style={styles.metaChipText}>{currentExercise.restSeconds}s rust</Text>
              </View>
            )}
          </View>

          {/* Prescription banner */}
          {(prescriptionLabel || currentExercise.tempo) && (
            <View style={styles.prescriptionBanner}>
              {prescriptionLabel && (
                <View style={styles.prescriptionItem}>
                  <Ionicons name="fitness-outline" size={13} color={theme.colors.primary} />
                  <Text style={styles.prescriptionLabel}>Doel: {prescriptionLabel}</Text>
                </View>
              )}
              {currentExercise.tempo && (
                <View style={styles.prescriptionItem}>
                  <Ionicons name="timer-outline" size={13} color={theme.colors.primary} />
                  <Text style={styles.prescriptionLabel}>Tempo: {currentExercise.tempo}</Text>
                </View>
              )}
            </View>
          )}

          {currentExercise.notes && (
            <Text style={styles.exerciseNotes}>{currentExercise.notes}</Text>
          )}

          {/* Previous week reference */}
          {(() => {
            const prevSets = currentExercise.exercise?.id ? prevWeekByExercise[currentExercise.exercise.id] : undefined;
            if (!prevSets || prevSets.length === 0) return null;
            return (
              <View style={styles.prevWeekRef}>
                <View style={styles.prevWeekRefHeader}>
                  <Ionicons name="time-outline" size={13} color={theme.colors.textTertiary} />
                  <Text style={styles.prevWeekRefLabel}>Vorige week</Text>
                </View>
                <View style={styles.prevWeekRefSets}>
                  {prevSets.sort((a, b) => a.setNumber - b.setNumber).map((s, i) => (
                    <View key={i} style={styles.prevWeekRefRow}>
                      <View style={styles.prevWeekRefBadge}>
                        <Text style={styles.prevWeekRefBadgeText}>{s.setNumber}</Text>
                      </View>
                      <Text style={styles.prevWeekRefReps}>{s.repsCompleted} reps</Text>
                      {s.weightKg != null && <Text style={styles.prevWeekRefWeight}>{s.weightKg} kg</Text>}
                      {s.actualRpe != null && <Text style={styles.prevWeekRefRpe}>RPE {s.actualRpe}</Text>}
                    </View>
                  ))}
                </View>
              </View>
            );
          })()}
        </View>

        {/* Completed sets */}
        {currentSets.length > 0 && (
          <View style={styles.setsLog}>
            <Text style={styles.setsLogTitle}>Voltooide sets</Text>
            {currentSets.map((set, idx) => (
              <View key={idx} style={styles.setRow}>
                <View style={styles.setNumber}>
                  <Text style={styles.setNumberText}>{idx + 1}</Text>
                </View>
                <Text style={styles.setText}>
                  {set.repsCompleted} reps{set.weightKg != null ? ` x ${set.weightKg} kg` : ''}
                </Text>
                {set.actualRpe != null && (
                  <View style={styles.feedbackPill}>
                    <Text style={styles.feedbackPillText}>RPE {set.actualRpe}</Text>
                  </View>
                )}
                {set.actualRir != null && (
                  <View style={styles.feedbackPill}>
                    <Text style={styles.feedbackPillText}>RIR {set.actualRir}</Text>
                  </View>
                )}
                <Ionicons
                  name={set.savedToDb ? "checkmark-circle" : "cloud-upload-outline"}
                  size={18}
                  color={set.savedToDb ? theme.colors.success : theme.colors.textTertiary}
                />
              </View>
            ))}
          </View>
        )}

        {/* Rest Timer */}
        {timer.state !== 'idle' && (
          <RestTimer
            remaining={timer.remaining}
            totalSeconds={timer.totalSeconds}
            progress={timer.progress}
            state={timer.state}
            onPause={timer.pause}
            onResume={timer.resume}
            onSkip={timer.skip}
          />
        )}

        {/* Set input */}
        {!allSetsForExerciseDone && timer.state !== 'running' && timer.state !== 'paused' && (
          <View style={styles.inputCard}>
            <Text style={styles.inputTitle}>Set {setsCompleted + 1} van {totalSets}</Text>

            <View style={styles.inputRow}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Reps</Text>
                <TextInput
                  style={styles.input}
                  value={repsInput}
                  onChangeText={setRepsInput}
                  keyboardType="number-pad"
                  placeholder={currentExercise.reps || '0'}
                  placeholderTextColor={theme.colors.border}
                />
              </View>
              {!isBodyweight && (
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Gewicht (kg)</Text>
                  <TextInput
                    style={styles.input}
                    value={weightInput}
                    onChangeText={setWeightInput}
                    keyboardType="decimal-pad"
                    placeholder="optioneel"
                    placeholderTextColor={theme.colors.border}
                  />
                </View>
              )}
            </View>

            {/* RPE Input */}
            {showRpeInput && (
              <View style={styles.feedbackSection}>
                <Text style={styles.feedbackLabel}>Hoe zwaar voelde het? (RPE)</Text>
                <View style={styles.rpeRow}>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((val) => {
                    const isSelected = rpeInput === val;
                    const bgColor = isSelected
                      ? val <= 5 ? theme.colors.success : val <= 7 ? theme.colors.warning : theme.colors.error
                      : theme.colors.background;
                    return (
                      <TouchableOpacity
                        key={val}
                        style={[styles.rpeButton, { backgroundColor: bgColor }]}
                        onPress={() => setRpeInput(isSelected ? null : val)}
                      >
                        <Text style={[styles.rpeButtonText, isSelected && { color: '#fff' }]}>{val}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
                <Text style={styles.feedbackHint}>
                  {rpeInput ? rpeInput <= 5 ? 'Licht' : rpeInput <= 7 ? 'Gemiddeld' : rpeInput === 8 ? 'Zwaar' : rpeInput === 9 ? 'Zeer zwaar' : 'Maximaal' : 'Optioneel'}
                </Text>
              </View>
            )}

            {/* RIR Input */}
            {showRirInput && (
              <View style={styles.feedbackSection}>
                <Text style={styles.feedbackLabel}>Reps In Reserve</Text>
                <View style={styles.rirRow}>
                  {[0, 1, 2, 3, 4, 5].map((val) => {
                    const isSelected = rirInput === val;
                    return (
                      <TouchableOpacity
                        key={val}
                        style={[styles.rirButton, isSelected && styles.rirButtonSelected]}
                        onPress={() => setRirInput(isSelected ? null : val)}
                      >
                        <Text style={[styles.rirButtonText, isSelected && styles.rirButtonTextSelected]}>{val}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
                <Text style={styles.feedbackHint}>
                  {rirInput != null ? rirInput === 0 ? 'Tot falen' : `${rirInput} rep${rirInput > 1 ? 's' : ''} over` : 'Hoeveel reps had je nog kunnen doen?'}
                </Text>
              </View>
            )}

            <TouchableOpacity
              style={[styles.logSetButton, savingSet && { opacity: 0.7 }]}
              onPress={handleLogSet}
              disabled={savingSet}
            >
              {savingSet ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Ionicons name="checkmark" size={20} color="#fff" />
              )}
              <Text style={styles.logSetButtonText}>Set Loggen</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Next exercise / Finish */}
        {allSetsForExerciseDone && (timer.state === 'idle' || timer.state === 'finished') && (
          <View style={styles.nextSection}>
            {currentExerciseIndex < totalExercises - 1 ? (
              <TouchableOpacity style={styles.nextButton} onPress={() => { timer.reset(); handleNextExercise(); }}>
                <Text style={styles.nextButtonText}>Volgende Oefening</Text>
                <Ionicons name="arrow-forward" size={20} color="#fff" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.finishButton} onPress={handleFinishWorkout} disabled={isSubmitting}>
                {isSubmitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Ionicons name="trophy" size={22} color="#fff" />
                    <Text style={styles.finishButtonText}>Workout Voltooien</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
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
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  // Dark branded header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: theme.colors.headerDark,
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  headerSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
  },
  // Progress bar
  progressBar: {
    height: 3,
    backgroundColor: 'rgba(108,58,237,0.15)',
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: 2,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  // Exercise navigation
  exerciseNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  navBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.sm,
  },
  navBtnDisabled: {
    opacity: 0.4,
  },
  exerciseCounter: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  // Exercise card
  exerciseCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    ...theme.shadows.md,
  },
  exerciseGif: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    marginBottom: 14,
    backgroundColor: theme.colors.background,
  },
  exerciseName: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 10,
  },
  exerciseMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: theme.colors.background,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  metaChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  prescriptionBanner: {
    marginTop: 12,
    padding: 12,
    backgroundColor: theme.colors.primaryLight,
    borderRadius: 10,
    gap: 6,
  },
  prescriptionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  prescriptionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  exerciseNotes: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
    marginTop: 10,
    lineHeight: 20,
  },
  // Previous week reference
  prevWeekRef: {
    marginTop: 12,
    padding: 12,
    backgroundColor: theme.colors.background,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  prevWeekRefHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 8,
  },
  prevWeekRefLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  prevWeekRefSets: { gap: 4 },
  prevWeekRefRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  prevWeekRefBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: theme.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  prevWeekRefBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.textTertiary,
  },
  prevWeekRefReps: {
    fontSize: 13,
    fontWeight: '500',
    color: theme.colors.textSecondary,
  },
  prevWeekRefWeight: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.text,
  },
  prevWeekRefRpe: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.textTertiary,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  // Sets log
  setsLog: { marginBottom: 12 },
  setsLogTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 12,
    marginBottom: 6,
    gap: 10,
    ...theme.shadows.sm,
  },
  setNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: `${theme.colors.success}18`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  setNumberText: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.success,
  },
  setText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: theme.colors.text,
  },
  feedbackPill: {
    backgroundColor: theme.colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  feedbackPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  // Input card
  inputCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    ...theme.shadows.md,
  },
  inputTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 16,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  inputGroup: { flex: 1 },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.textSecondary,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: theme.colors.background,
    borderRadius: 12,
    padding: 14,
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  feedbackSection: { marginBottom: 16 },
  feedbackLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 8,
  },
  feedbackHint: {
    fontSize: 11,
    color: theme.colors.textTertiary,
    marginTop: 6,
  },
  rpeRow: {
    flexDirection: 'row',
    gap: 4,
  },
  rpeButton: {
    flex: 1,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  rpeButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.textSecondary,
  },
  rirRow: {
    flexDirection: 'row',
    gap: 8,
  },
  rirButton: {
    flex: 1,
    height: 42,
    borderRadius: 12,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  rirButtonSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  rirButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textSecondary,
  },
  rirButtonTextSelected: {
    color: '#fff',
  },
  // Log set button
  logSetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: theme.colors.primary,
    paddingVertical: 14,
    borderRadius: 14,
    ...theme.shadows.md,
  },
  logSetButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  // Next/Finish
  nextSection: { marginTop: 8 },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: theme.colors.primary,
    paddingVertical: 16,
    borderRadius: 14,
    ...theme.shadows.md,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
  finishButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: theme.colors.success,
    paddingVertical: 16,
    borderRadius: 14,
    ...theme.shadows.md,
  },
  finishButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
});
