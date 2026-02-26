import { supabase } from './supabase';

// Transform snake_case Supabase rows to camelCase format matching existing UI expectations
function transformWorkout(w: any) {
  const template = w.workout_templates;
  const exercises = template?.workout_template_exercises || [];

  return {
    id: w.id,
    clientId: w.client_id,
    coachId: w.coach_id,
    workoutTemplateId: w.workout_template_id,
    scheduledDate: w.scheduled_date,
    completed: w.completed,
    completedAt: w.completed_at,
    workoutTemplate: template
      ? {
          id: template.id,
          name: template.name,
          description: template.description,
          durationMinutes: template.duration_minutes,
          exercises: exercises
            .sort((a: any, b: any) => a.order_index - b.order_index)
            .map((wte: any) => ({
              id: wte.id,
              orderIndex: wte.order_index,
              sets: wte.sets,
              reps: wte.reps,
              restSeconds: wte.rest_seconds,
              notes: wte.notes,
              intensityType: wte.intensity_type || 'weight',
              prescribedWeightKg: wte.prescribed_weight_kg,
              prescribedRpe: wte.prescribed_rpe,
              prescribedRir: wte.prescribed_rir,
              prescribedPercentage: wte.prescribed_percentage,
              tempo: wte.tempo,
              section: wte.section || 'workout',
              exercise: wte.exercises
                ? {
                    id: wte.exercises.id,
                    name: wte.exercises.name,
                    description: wte.exercises.description,
                    category: wte.exercises.category,
                    equipmentNeeded: wte.exercises.equipment_needed,
                    videoUrl: wte.exercises.video_url,
                    thumbnailUrl: wte.exercises.thumbnail_url,
                    gifUrl: wte.exercises.gif_url,
                  }
                : null,
            })),
        }
      : null,
    coach: w.coach
      ? {
          id: w.coach.id,
          profile: w.coach.profiles
            ? {
                firstName: w.coach.profiles.first_name,
                lastName: w.coach.profiles.last_name,
                avatarUrl: w.coach.profiles.avatar_url,
              }
            : null,
        }
      : null,
  };
}

const WORKOUT_SELECT = `
  id,
  client_id,
  coach_id,
  workout_template_id,
  scheduled_date,
  completed,
  completed_at,
  workout_templates (
    id,
    name,
    description,
    duration_minutes,
    workout_template_exercises (
      id,
      order_index,
      sets,
      reps,
      rest_seconds,
      notes,
      intensity_type,
      prescribed_weight_kg,
      prescribed_rpe,
      prescribed_rir,
      prescribed_percentage,
      tempo,
      section,
      exercises (
        id,
        name,
        description,
        category,
        equipment_needed,
        video_url,
        thumbnail_url,
        gif_url
      )
    )
  ),
  coach:users!coach_id (
    id,
    profiles (
      first_name,
      last_name,
      avatar_url
    )
  )
`;

// Workout API calls — direct Supabase (no Next.js API hop)
export async function fetchWorkouts(filter?: 'upcoming' | 'completed' | 'all') {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  let query = supabase
    .from('client_workouts')
    .select(WORKOUT_SELECT)
    .eq('client_id', user.id)
    .order('scheduled_date', { ascending: false });

  if (filter === 'upcoming') {
    query = query.eq('completed', false);
  } else if (filter === 'completed') {
    query = query.eq('completed', true);
  }

  const { data, error } = await query;
  if (error) throw error;

  return { success: true, workouts: (data || []).map(transformWorkout) };
}

export async function fetchWorkoutDetail(id: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('client_workouts')
    .select(WORKOUT_SELECT)
    .eq('id', id)
    .eq('client_id', user.id)
    .single();

  if (error) throw error;

  return { success: true, workout: transformWorkout(data) };
}

export async function completeWorkout(id: string, exerciseLogs?: any[]) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Update the workout as completed
  const { error: updateError } = await supabase
    .from('client_workouts')
    .update({
      completed: true,
      completed_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('client_id', user.id);

  if (updateError) throw updateError;

  // Insert exercise logs if provided (for legacy batch-save path)
  if (exerciseLogs && exerciseLogs.length > 0) {
    const logs = exerciseLogs.map((log) => ({
      client_workout_id: id,
      user_id: user.id,
      exercise_id: log.exerciseId,
      set_number: log.setNumber,
      reps_completed: log.repsCompleted,
      weight_kg: log.weightKg || null,
      notes: log.notes || null,
      prescribed_reps: log.prescribedReps || null,
      prescribed_weight_kg: log.prescribedWeightKg || null,
      prescribed_rpe: log.prescribedRpe || null,
      prescribed_rir: log.prescribedRir || null,
      actual_rpe: log.actualRpe || null,
      actual_rir: log.actualRir || null,
    }));

    const { error: logError } = await supabase.from('workout_logs').insert(logs);
    if (logError) throw logError;
  }

  return { success: true, workoutId: id };
}

/**
 * Start a workout — creates the client_workout record immediately.
 * Returns the new client_workout ID so sets can be saved live.
 */
export async function startWorkout(
  templateId: string,
  coachId: string,
  clientProgramId: string | null,
  weekNumber?: number | null,
): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const insertData: any = {
    client_id: user.id,
    coach_id: coachId,
    workout_template_id: templateId,
    scheduled_date: new Date().toISOString(),
    completed: false,
  };
  if (clientProgramId) {
    insertData.client_program_id = clientProgramId;
  }
  if (weekNumber != null) {
    insertData.week_number = weekNumber;
  }

  const { data, error } = await supabase
    .from('client_workouts')
    .insert(insertData)
    .select('id')
    .single();

  if (error) throw error;
  return data.id;
}

/**
 * Save a single set log to the database immediately.
 * Called after each set is completed.
 */
export async function saveSetLog(
  clientWorkoutId: string,
  log: {
    exerciseId: string;
    setNumber: number;
    repsCompleted: number;
    weightKg: number | null;
    notes?: string | null;
    prescribedReps?: string | null;
    prescribedWeightKg?: number | null;
    prescribedRpe?: number | null;
    prescribedRir?: number | null;
    actualRpe?: number | null;
    actualRir?: number | null;
  }
): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('workout_logs')
    .insert({
      client_workout_id: clientWorkoutId,
      user_id: user.id,
      exercise_id: log.exerciseId,
      set_number: log.setNumber,
      reps_completed: log.repsCompleted,
      weight_kg: log.weightKg ?? null,
      notes: log.notes || null,
      prescribed_reps: log.prescribedReps || null,
      prescribed_weight_kg: log.prescribedWeightKg ?? null,
      prescribed_rpe: log.prescribedRpe ?? null,
      prescribed_rir: log.prescribedRir ?? null,
      actual_rpe: log.actualRpe ?? null,
      actual_rir: log.actualRir ?? null,
    })
    .select('id')
    .single();

  if (error) throw error;
  return data.id;
}

/**
 * Load existing workout logs for a client_workout (for resuming).
 */
export async function loadWorkoutLogs(clientWorkoutId: string) {
  const { data, error } = await supabase
    .from('workout_logs')
    .select('id, exercise_id, set_number, reps_completed, weight_kg, actual_rpe, actual_rir')
    .eq('client_workout_id', clientWorkoutId)
    .order('set_number', { ascending: true });

  if (error) throw error;
  return (data || []).map((log: any) => ({
    id: log.id,
    exerciseId: log.exercise_id,
    setNumber: log.set_number,
    repsCompleted: log.reps_completed,
    weightKg: log.weight_kg,
    actualRpe: log.actual_rpe,
    actualRir: log.actual_rir,
  }));
}

/**
 * Delete a workout and all its logs (for discarding in-progress workouts).
 */
export async function deleteWorkout(clientWorkoutId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Logs are cascade-deleted via FK
  const { error } = await supabase
    .from('client_workouts')
    .delete()
    .eq('id', clientWorkoutId)
    .eq('client_id', user.id);

  if (error) throw error;
}

/**
 * Mark an existing workout as completed. Used for live-save flow
 * where the client_workout already exists and logs are already saved.
 */
export async function finishWorkout(clientWorkoutId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('client_workouts')
    .update({
      completed: true,
      completed_at: new Date().toISOString(),
    })
    .eq('id', clientWorkoutId)
    .eq('client_id', user.id);

  if (error) throw error;
  return { success: true };
}

/**
 * Reopen a completed workout so the client can edit their logs.
 * Sets completed back to false and clears completed_at.
 */
export async function reopenWorkout(clientWorkoutId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('client_workouts')
    .update({
      completed: false,
      completed_at: null,
    })
    .eq('id', clientWorkoutId)
    .eq('client_id', user.id);

  if (error) throw error;
  return { success: true };
}

/**
 * Update an existing workout log entry.
 */
export async function updateSetLog(
  logId: string,
  updates: {
    repsCompleted?: number;
    weightKg?: number | null;
    actualRpe?: number | null;
    actualRir?: number | null;
  }
) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const updateData: any = {};
  if (updates.repsCompleted !== undefined) updateData.reps_completed = updates.repsCompleted;
  if (updates.weightKg !== undefined) updateData.weight_kg = updates.weightKg;
  if (updates.actualRpe !== undefined) updateData.actual_rpe = updates.actualRpe;
  if (updates.actualRir !== undefined) updateData.actual_rir = updates.actualRir;

  const { error } = await supabase
    .from('workout_logs')
    .update(updateData)
    .eq('id', logId)
    .eq('user_id', user.id);

  if (error) throw error;
}

/**
 * Delete a single workout log entry.
 */
export async function deleteSetLog(logId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('workout_logs')
    .delete()
    .eq('id', logId)
    .eq('user_id', user.id);

  if (error) throw error;
}
