import { supabase } from './supabase';

export interface TemplateQuestion {
  id: string;
  templateId: string;
  question: string;
  questionType: 'scale' | 'number' | 'text' | 'yes_no' | 'multiple_choice';
  options: string[] | null;
  scaleLabels: string[] | null;
  isRequired: boolean;
  orderIndex: number;
  fieldKey: string | null;
  unit: string | null;
}

export interface CheckInTemplate {
  id: string;
  coachId: string;
  name: string;
  description: string | null;
  checkInType: 'daily' | 'weekly';
  isDefault: boolean;
  questions: TemplateQuestion[];
}

function transformQuestion(raw: any): TemplateQuestion {
  return {
    id: raw.id,
    templateId: raw.template_id,
    question: raw.question,
    questionType: raw.question_type,
    options: raw.options,
    scaleLabels: raw.scale_labels,
    isRequired: raw.is_required,
    orderIndex: raw.order_index,
    fieldKey: raw.field_key,
    unit: raw.unit,
  };
}

/**
 * Fetch the check-in template assigned to the current user for a given type.
 * Falls back to the coach's default template if no direct assignment exists.
 * Returns null if no custom template is found (use built-in questions).
 */
export async function fetchClientTemplate(
  checkInType: 'daily' | 'weekly'
): Promise<CheckInTemplate | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // 1. Check for direct assignment
  const { data: assignments } = await supabase
    .from('check_in_template_assignments')
    .select(`
      template_id,
      check_in_templates (
        id, coach_id, name, description, check_in_type, is_default, is_active
      )
    `)
    .eq('client_id', user.id);

  // Find an active assignment for this check-in type
  const assignment = assignments?.find(
    (a: any) =>
      a.check_in_templates?.check_in_type === checkInType &&
      a.check_in_templates?.is_active
  );

  let templateData = assignment?.check_in_templates as any;

  // 2. If no assignment, look for a default template from any coach
  // (In practice the coach that manages this client)
  if (!templateData) {
    const { data: defaults } = await supabase
      .from('check_in_templates')
      .select('*')
      .eq('check_in_type', checkInType)
      .eq('is_default', true)
      .eq('is_active', true)
      .limit(1);

    if (defaults && defaults.length > 0) {
      templateData = defaults[0];
    }
  }

  if (!templateData) return null;

  // 3. Fetch questions for this template
  const { data: questions } = await supabase
    .from('template_questions')
    .select('*')
    .eq('template_id', templateData.id)
    .order('order_index', { ascending: true });

  return {
    id: templateData.id,
    coachId: templateData.coach_id,
    name: templateData.name,
    description: templateData.description,
    checkInType: templateData.check_in_type,
    isDefault: templateData.is_default,
    questions: (questions || []).map(transformQuestion),
  };
}

/**
 * Save answers for a custom template check-in.
 */
export async function saveCheckInAnswers(
  checkInId: string,
  checkInType: 'daily' | 'weekly',
  answers: { questionId: string; value: string }[]
): Promise<void> {
  if (answers.length === 0) return;

  const payload = answers.map((a) => ({
    check_in_id: checkInId,
    check_in_type: checkInType,
    question_id: a.questionId,
    answer_value: a.value,
  }));

  const { error } = await supabase.from('check_in_answers').insert(payload);
  if (error) throw error;
}
