import { supabase } from './supabase';

// Types
export interface FoodLogRecord {
  id: string;
  userId: string;
  date: string;
  loggedAt: string;
  mealType: 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK';
  foodName: string;
  calories: number | null;
  proteinGrams: number | null;
  carbsGrams: number | null;
  fatGrams: number | null;
  servingSize: number | null;
  servingUnit: string | null;
  numberOfServings: number | null;
  barcode: string | null;
  source: string;
  photoUrl: string | null;
  notes: string | null;
  createdAt: string;
}

export interface NutritionTargets {
  dailyCalories: number | null;
  dailyProteinGrams: number | null;
  dailyCarbsGrams: number | null;
  dailyFatGrams: number | null;
}

export interface DailyMacros {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

function transformFoodLog(row: any): FoodLogRecord {
  return {
    id: row.id,
    userId: row.user_id,
    date: row.date,
    loggedAt: row.logged_at,
    mealType: row.meal_type,
    foodName: row.food_name,
    calories: row.calories,
    proteinGrams: row.protein_grams,
    carbsGrams: row.carbs_grams,
    fatGrams: row.fat_grams,
    servingSize: row.serving_size,
    servingUnit: row.serving_unit,
    numberOfServings: row.number_of_servings,
    barcode: row.barcode,
    source: row.source,
    photoUrl: row.photo_url,
    notes: row.notes,
    createdAt: row.created_at,
  };
}

/**
 * Fetch food logs for a specific date.
 */
export async function fetchFoodLogs(date: string): Promise<FoodLogRecord[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('food_logs')
    .select('*')
    .eq('user_id', user.id)
    .eq('date', date)
    .order('logged_at', { ascending: true });

  if (error) {
    console.log('fetchFoodLogs error:', error.message);
    return [];
  }

  return (data || []).map(transformFoodLog);
}

/**
 * Calculate daily macros from food logs.
 */
export function calculateDailyMacros(logs: FoodLogRecord[]): DailyMacros {
  return logs.reduce(
    (acc, log) => {
      const servings = log.numberOfServings || 1;
      return {
        calories: acc.calories + Math.round((log.calories || 0) * servings),
        protein: acc.protein + Math.round((log.proteinGrams || 0) * servings),
        carbs: acc.carbs + Math.round((log.carbsGrams || 0) * servings),
        fat: acc.fat + Math.round((log.fatGrams || 0) * servings),
      };
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );
}

/**
 * Add a food log entry.
 */
export async function addFoodLog(entry: {
  date: string;
  mealType: string;
  foodName: string;
  calories?: number;
  proteinGrams?: number;
  carbsGrams?: number;
  fatGrams?: number;
  servingSize?: number;
  servingUnit?: string;
  numberOfServings?: number;
  barcode?: string;
  source?: string;
  notes?: string;
}): Promise<FoodLogRecord> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Je bent niet ingelogd');

  const { data, error } = await supabase
    .from('food_logs')
    .insert({
      user_id: user.id,
      date: entry.date,
      meal_type: entry.mealType,
      food_name: entry.foodName,
      calories: entry.calories ?? null,
      protein_grams: entry.proteinGrams ?? null,
      carbs_grams: entry.carbsGrams ?? null,
      fat_grams: entry.fatGrams ?? null,
      serving_size: entry.servingSize ?? null,
      serving_unit: entry.servingUnit || null,
      number_of_servings: entry.numberOfServings || 1,
      barcode: entry.barcode || null,
      source: entry.source || 'manual',
      notes: entry.notes || null,
    })
    .select()
    .single();

  if (error) {
    console.error('addFoodLog error:', error.message, error.details, error.hint);
    throw new Error(`Opslaan mislukt: ${error.message}`);
  }

  return transformFoodLog(data);
}

/**
 * Delete a food log entry.
 */
export async function deleteFoodLog(id: string): Promise<void> {
  const { error } = await supabase
    .from('food_logs')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Verwijderen mislukt: ${error.message}`);
  }
}

// Meal Plan Types
export interface MealPlanRecipe {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  calories: number | null;
  proteinGrams: number | null;
  carbsGrams: number | null;
  fatGrams: number | null;
  servings: number | null;
  prepTimeMin: number | null;
  cookTimeMin: number | null;
  instructions: string | null;
  ingredients: { id: string; name: string; amount: number | null; unit: string | null }[];
}

export interface MealPlanEntry {
  id: string;
  dayOfWeek: number;
  mealType: string;
  customTitle: string | null;
  customDescription: string | null;
  recipe: MealPlanRecipe | null;
}

export interface ActiveMealPlan {
  id: string;
  name: string;
  description: string | null;
  dailyCalories: number | null;
  proteinGrams: number | null;
  carbsGrams: number | null;
  fatGrams: number | null;
  startDate: string | null;
  endDate: string | null;
  entries: MealPlanEntry[];
}

/**
 * Fetch the active meal plan assigned to the current user.
 */
export async function fetchActiveMealPlan(): Promise<ActiveMealPlan | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Get active assignment with nested meal plan + entries + recipes + ingredients
  const { data, error } = await supabase
    .from('client_meal_plans')
    .select(`
      id, start_date, end_date,
      meal_plans (
        id, name, description, daily_calories, protein_grams, carbs_grams, fat_grams,
        meal_plan_entries (
          id, day_of_week, meal_type, custom_title, custom_description,
          recipes (
            id, title, description, image_url, calories, protein_grams, carbs_grams, fat_grams,
            servings, prep_time_min, cook_time_min, instructions,
            recipe_ingredients ( id, name, amount, unit )
          )
        )
      )
    `)
    .eq('client_id', user.id)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data || !data.meal_plans) {
    if (error) console.log('fetchActiveMealPlan error:', error.message);
    return null;
  }

  const mp = data.meal_plans as any;
  const entries = (mp.meal_plan_entries || []).map((e: any) => ({
    id: e.id,
    dayOfWeek: e.day_of_week,
    mealType: e.meal_type,
    customTitle: e.custom_title,
    customDescription: e.custom_description,
    recipe: e.recipes ? {
      id: e.recipes.id,
      title: e.recipes.title,
      description: e.recipes.description,
      imageUrl: e.recipes.image_url,
      calories: e.recipes.calories,
      proteinGrams: e.recipes.protein_grams,
      carbsGrams: e.recipes.carbs_grams,
      fatGrams: e.recipes.fat_grams,
      servings: e.recipes.servings,
      prepTimeMin: e.recipes.prep_time_min,
      cookTimeMin: e.recipes.cook_time_min,
      instructions: e.recipes.instructions,
      ingredients: (e.recipes.recipe_ingredients || []).map((ing: any) => ({
        id: ing.id,
        name: ing.name,
        amount: ing.amount,
        unit: ing.unit,
      })),
    } : null,
  }));

  return {
    id: mp.id,
    name: mp.name,
    description: mp.description,
    dailyCalories: mp.daily_calories,
    proteinGrams: mp.protein_grams,
    carbsGrams: mp.carbs_grams,
    fatGrams: mp.fat_grams,
    startDate: data.start_date,
    endDate: data.end_date,
    entries,
  };
}

/**
 * Fetch nutrition targets for the current user.
 */
export async function fetchNutritionTargets(): Promise<NutritionTargets | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('nutrition_targets')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  if (error || !data) return null;

  return {
    dailyCalories: data.daily_calories,
    dailyProteinGrams: data.daily_protein_grams,
    dailyCarbsGrams: data.daily_carbs_grams,
    dailyFatGrams: data.daily_fat_grams,
  };
}
