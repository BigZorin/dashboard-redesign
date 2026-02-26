import { supabase } from './supabase';

export interface IntakeFormRecord {
  id: string;
  userId: string;
  goals: string | null;
  fitnessExperience: string | null;
  trainingHistory: string | null;
  injuries: string | null;
  medicalConditions: string | null;
  medications: string | null;
  dietaryRestrictions: string | null;
  allergies: string | null;
  sleepHours: number | null;
  stressLevel: number | null;
  occupation: string | null;
  availableDays: string[];
  preferredTrainingTime: string | null;
  equipmentAccess: string | null;
  additionalNotes: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

function transformIntakeForm(raw: any): IntakeFormRecord {
  return {
    id: raw.id,
    userId: raw.user_id,
    goals: raw.goals,
    fitnessExperience: raw.fitness_experience,
    trainingHistory: raw.training_history,
    injuries: raw.injuries,
    medicalConditions: raw.medical_conditions,
    medications: raw.medications,
    dietaryRestrictions: raw.dietary_restrictions,
    allergies: raw.allergies,
    sleepHours: raw.sleep_hours,
    stressLevel: raw.stress_level,
    occupation: raw.occupation,
    availableDays: raw.available_days || [],
    preferredTrainingTime: raw.preferred_training_time,
    equipmentAccess: raw.equipment_access,
    additionalNotes: raw.additional_notes,
    completedAt: raw.completed_at,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
  };
}

export async function fetchIntakeForm(): Promise<IntakeFormRecord | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('intake_forms')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  if (error) throw error;
  return data ? transformIntakeForm(data) : null;
}

export interface IntakeFormData {
  goals?: string;
  fitnessExperience?: string;
  trainingHistory?: string;
  injuries?: string;
  medicalConditions?: string;
  medications?: string;
  dietaryRestrictions?: string;
  allergies?: string;
  sleepHours?: number;
  stressLevel?: number;
  occupation?: string;
  availableDays?: string[];
  preferredTrainingTime?: string;
  equipmentAccess?: string;
  additionalNotes?: string;
}

export async function submitIntakeForm(formData: IntakeFormData): Promise<IntakeFormRecord> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const payload = {
    user_id: user.id,
    goals: formData.goals || null,
    fitness_experience: formData.fitnessExperience || null,
    training_history: formData.trainingHistory || null,
    injuries: formData.injuries || null,
    medical_conditions: formData.medicalConditions || null,
    medications: formData.medications || null,
    dietary_restrictions: formData.dietaryRestrictions || null,
    allergies: formData.allergies || null,
    sleep_hours: formData.sleepHours || null,
    stress_level: formData.stressLevel || null,
    occupation: formData.occupation || null,
    available_days: formData.availableDays || [],
    preferred_training_time: formData.preferredTrainingTime || null,
    equipment_access: formData.equipmentAccess || null,
    additional_notes: formData.additionalNotes || null,
    completed_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('intake_forms')
    .upsert(payload, { onConflict: 'user_id' })
    .select()
    .single();

  if (error) throw error;
  return transformIntakeForm(data);
}
