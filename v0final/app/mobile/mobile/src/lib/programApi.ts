import { supabase } from './supabase';

// Types
export interface ProgramBlock {
  id: string;
  name: string;
  description: string | null;
  orderIndex: number;
  durationWeeks: number;
  workouts: ProgramBlockWorkout[];
}

export interface ProgramBlockWorkout {
  id: string;
  orderIndex: number;
  dayOfWeek: number | null;
  notes: string | null;
  workoutTemplate: {
    id: string;
    name: string;
    description: string | null;
    durationMinutes: number | null;
    exercises: Array<{
      id: string;
      orderIndex: number;
      sets: number | null;
      reps: string | null;
      restSeconds: number | null;
      intensityType: string;
      prescribedWeightKg: number | null;
      prescribedRpe: number | null;
      prescribedRir: number | null;
      prescribedPercentage: number | null;
      tempo: string | null;
      section: string;
      exercise: {
        id: string;
        name: string;
        category: string;
        thumbnailUrl: string | null;
        gifUrl: string | null;
      } | null;
    }>;
  } | null;
}

export interface ClientProgram {
  id: string;
  clientId: string;
  coachId: string;
  programId: string;
  startDate: string;
  currentBlockIndex: number;
  status: 'active' | 'paused' | 'completed';
  notes: string | null;
  createdAt: string;
  program: {
    id: string;
    name: string;
    description: string | null;
    bannerUrl: string | null;
    isActive: boolean;
    blocks: ProgramBlock[];
  };
}

function transformBlock(b: any): ProgramBlock {
  return {
    id: b.id,
    name: b.name,
    description: b.description,
    orderIndex: b.order_index,
    durationWeeks: b.duration_weeks,
    workouts: (b.block_workouts || [])
      .sort((a: any, b: any) => a.order_index - b.order_index)
      .map((bw: any) => transformBlockWorkout(bw)),
  };
}

function transformBlockWorkout(bw: any): ProgramBlockWorkout {
  const tmpl = bw.workout_templates;
  return {
    id: bw.id,
    orderIndex: bw.order_index,
    dayOfWeek: bw.day_of_week,
    notes: bw.notes,
    workoutTemplate: tmpl
      ? {
          id: tmpl.id,
          name: tmpl.name,
          description: tmpl.description,
          durationMinutes: tmpl.duration_minutes,
          exercises: (tmpl.workout_template_exercises || [])
            .sort((a: any, b: any) => a.order_index - b.order_index)
            .map((wte: any) => ({
              id: wte.id,
              orderIndex: wte.order_index,
              sets: wte.sets,
              reps: wte.reps,
              restSeconds: wte.rest_seconds,
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
                    category: wte.exercises.category,
                    thumbnailUrl: wte.exercises.thumbnail_url,
                    gifUrl: wte.exercises.gif_url,
                  }
                : null,
            })),
        }
      : null,
  };
}

function transformClientProgram(cp: any): ClientProgram {
  const tp = cp.training_programs;
  const blocks = (tp?.program_blocks || [])
    .sort((a: any, b: any) => a.order_index - b.order_index)
    .map(transformBlock);

  return {
    id: cp.id,
    clientId: cp.client_id,
    coachId: cp.coach_id,
    programId: cp.program_id,
    startDate: cp.start_date,
    currentBlockIndex: cp.current_block_index,
    status: cp.status,
    notes: cp.notes,
    createdAt: cp.created_at,
    program: {
      id: tp?.id || '',
      name: tp?.name || 'Onbekend',
      description: tp?.description || null,
      bannerUrl: tp?.banner_url || null,
      isActive: tp?.is_active ?? true,
      blocks,
    },
  };
}

const PROGRAM_SELECT = `
  id, client_id, coach_id, program_id, start_date,
  current_block_index, status, notes, created_at,
  training_programs (
    id, name, description, banner_url, is_active,
    program_blocks (
      id, name, description, order_index, duration_weeks,
      block_workouts (
        id, order_index, day_of_week, notes,
        workout_templates (
          id, name, description, duration_minutes,
          workout_template_exercises (
            id, order_index, sets, reps, rest_seconds,
            intensity_type, prescribed_weight_kg, prescribed_rpe,
            prescribed_rir, prescribed_percentage, tempo, section,
            exercises (
              id, name, category, thumbnail_url, gif_url
            )
          )
        )
      )
    )
  )
`;

/**
 * Fetch all client programs for the current user
 */
export async function fetchClientPrograms(
  status?: 'active' | 'paused' | 'completed'
): Promise<ClientProgram[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  let query = supabase
    .from('client_programs')
    .select(PROGRAM_SELECT)
    .eq('client_id', user.id)
    .order('created_at', { ascending: false });

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;

  if (error) {
    console.log('fetchClientPrograms error:', error.message);
    return [];
  }

  return (data || []).map(transformClientProgram);
}

/** Weekly workout entry returned from the map */
export interface WeeklyWorkoutEntry {
  id: string;
  completed: boolean;
  completedAt: string | null;
}

/**
 * Fetch all client_workouts for a program assignment, grouped by template+week.
 * Returns: { "templateId" → { weekNumber → { id, completed, completedAt } } }
 *
 * Does NOT auto-create — workouts are created on-demand when the user starts one.
 */
export async function fetchProgramWeeklyMap(
  clientProgramId: string
): Promise<Record<string, Record<number, WeeklyWorkoutEntry>>> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return {};

  const { data, error } = await supabase
    .from('client_workouts')
    .select('id, workout_template_id, week_number, completed, completed_at')
    .eq('client_id', user.id)
    .eq('client_program_id', clientProgramId);

  if (error) {
    console.log('fetchProgramWeeklyMap error:', error.message);
    return {};
  }

  const map: Record<string, Record<number, WeeklyWorkoutEntry>> = {};
  for (const row of data || []) {
    const tid = row.workout_template_id;
    const week = row.week_number ?? 0; // legacy rows without week_number get week 0
    if (!map[tid]) map[tid] = {};
    map[tid][week] = {
      id: row.id,
      completed: row.completed,
      completedAt: row.completed_at,
    };
  }
  return map;
}

/**
 * Backwards-compatible wrapper — returns flat map for non-week-aware callers.
 * @deprecated Use fetchProgramWeeklyMap instead
 */
export async function fetchProgramWorkoutMap(
  clientProgramId: string
): Promise<Record<string, string>> {
  const weeklyMap = await fetchProgramWeeklyMap(clientProgramId);
  const flat: Record<string, string> = {};
  for (const [tid, weeks] of Object.entries(weeklyMap)) {
    // Pick the first available entry (for legacy callers)
    const firstWeek = Object.values(weeks)[0];
    if (firstWeek) flat[tid] = firstWeek.id;
  }
  return flat;
}

/**
 * Fetch workout_logs from the previous week for a given template in a program.
 * Used to show "vorige week" reference data.
 */
export async function fetchPreviousWeekLogs(
  clientProgramId: string,
  workoutTemplateId: string,
  currentWeekNumber: number
): Promise<Array<{
  exerciseId: string;
  setNumber: number;
  repsCompleted: number;
  weightKg: number | null;
  actualRpe: number | null;
  actualRir: number | null;
}>> {
  if (currentWeekNumber <= 0) return [];

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  // Find the client_workout for the previous week
  const { data: prevWorkout, error: prevErr } = await supabase
    .from('client_workouts')
    .select('id')
    .eq('client_id', user.id)
    .eq('client_program_id', clientProgramId)
    .eq('workout_template_id', workoutTemplateId)
    .eq('week_number', currentWeekNumber - 1)
    .maybeSingle();

  if (prevErr || !prevWorkout) return [];

  // Fetch the logs
  const { data: logs, error: logErr } = await supabase
    .from('workout_logs')
    .select('exercise_id, set_number, reps_completed, weight_kg, actual_rpe, actual_rir')
    .eq('client_workout_id', prevWorkout.id)
    .order('set_number', { ascending: true });

  if (logErr || !logs) return [];

  return logs.map((l: any) => ({
    exerciseId: l.exercise_id,
    setNumber: l.set_number,
    repsCompleted: l.reps_completed,
    weightKg: l.weight_kg,
    actualRpe: l.actual_rpe,
    actualRir: l.actual_rir,
  }));
}

/**
 * Fetch a single client program by id
 */
export async function fetchClientProgram(
  assignmentId: string
): Promise<ClientProgram | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('client_programs')
    .select(PROGRAM_SELECT)
    .eq('id', assignmentId)
    .eq('client_id', user.id)
    .single();

  if (error) {
    console.log('fetchClientProgram error:', error.message);
    return null;
  }

  return transformClientProgram(data);
}
