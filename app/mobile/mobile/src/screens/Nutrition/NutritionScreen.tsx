import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useFoodLogs, useDailyMacros, useNutritionTargets, useDeleteFoodLog } from '../../hooks/useNutrition';
import { useActiveMealPlan } from '../../hooks/useMealPlan';
import MacroRing from '../../components/MacroRing';
import { theme } from '../../constants/theme';
import type { FoodLogRecord, MealPlanEntry } from '../../lib/nutritionApi';

const MEAL_TYPES = [
  { key: 'BREAKFAST', label: 'Ontbijt', icon: 'sunny-outline' as const },
  { key: 'LUNCH', label: 'Lunch', icon: 'restaurant-outline' as const },
  { key: 'DINNER', label: 'Avondeten', icon: 'moon-outline' as const },
  { key: 'SNACK', label: 'Snack', icon: 'cafe-outline' as const },
];

function getToday(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  const today = new Date();
  const todayStr = getToday();
  if (dateStr === todayStr) return 'Vandaag';

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
  if (dateStr === yesterdayStr) return 'Gisteren';

  return d.toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long' });
}

function getDayOfWeek(dateStr: string): number {
  const d = new Date(dateStr + 'T00:00:00');
  const jsDay = d.getDay();
  return jsDay === 0 ? 7 : jsDay; // 1=Mon..7=Sun
}

export default function NutritionScreen() {
  const navigation = useNavigation();
  const [selectedDate, setSelectedDate] = useState(getToday());

  const { data: logs = [], isLoading } = useFoodLogs(selectedDate);
  const macros = useDailyMacros(selectedDate);
  const { data: targets } = useNutritionTargets();
  const { data: mealPlan } = useActiveMealPlan();
  const deleteMutation = useDeleteFoodLog(selectedDate);

  // Targets with meal plan fallback
  const calTarget = targets?.dailyCalories || mealPlan?.dailyCalories || 0;
  const proteinTarget = targets?.dailyProteinGrams || mealPlan?.proteinGrams || 0;
  const carbsTarget = targets?.dailyCarbsGrams || mealPlan?.carbsGrams || 0;
  const fatTarget = targets?.dailyFatGrams || mealPlan?.fatGrams || 0;

  // Meal plan entries for the selected day
  const dayOfWeek = getDayOfWeek(selectedDate);
  const mealPlanEntries = useMemo(() => {
    if (!mealPlan?.entries?.length) return {};
    const grouped: Record<string, MealPlanEntry[]> = {};
    mealPlan.entries
      .filter((e) => e.dayOfWeek === dayOfWeek)
      .forEach((e) => {
        if (!grouped[e.mealType]) grouped[e.mealType] = [];
        grouped[e.mealType].push(e);
      });
    return grouped;
  }, [mealPlan, dayOfWeek]);

  const changeDate = (offset: number) => {
    const d = new Date(selectedDate + 'T00:00:00');
    d.setDate(d.getDate() + offset);
    const newDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    setSelectedDate(newDate);
  };

  const handleDelete = (log: FoodLogRecord) => {
    Alert.alert('Verwijderen', `${log.foodName} verwijderen?`, [
      { text: 'Annuleren', style: 'cancel' },
      { text: 'Verwijderen', style: 'destructive', onPress: () => deleteMutation.mutate(log.id) },
    ]);
  };

  const getMealLogs = (mealType: string) => logs.filter((l) => l.mealType === mealType);
  const getMealCalories = (mealType: string) =>
    getMealLogs(mealType).reduce((sum, l) => sum + (l.calories || 0) * (l.numberOfServings || 1), 0);

  const [expandedRecipe, setExpandedRecipe] = useState<string | null>(null);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Voeding</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.headerBtn}
            onPress={() => navigation.navigate('ShoppingList' as never)}
          >
            <Ionicons name="cart-outline" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollArea}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Date Selector */}
        <View style={styles.dateRow}>
          <TouchableOpacity onPress={() => changeDate(-1)} style={styles.dateArrow}>
            <Ionicons name="chevron-back" size={22} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.dateText}>{formatDate(selectedDate)}</Text>
          <TouchableOpacity
            onPress={() => changeDate(1)}
            style={styles.dateArrow}
            disabled={selectedDate === getToday()}
          >
            <Ionicons
              name="chevron-forward"
              size={22}
              color={selectedDate === getToday() ? theme.colors.textTertiary : theme.colors.text}
            />
          </TouchableOpacity>
        </View>

        {/* Macro Overview */}
        <View style={styles.macroCard}>
          <MacroRing
            value={macros.calories}
            target={calTarget}
            label="kcal"
            color="#FF6B35"
            size={90}
          />
          <View style={styles.macroSmallRow}>
            <MacroRing
              value={macros.protein}
              target={proteinTarget}
              label="Eiwit"
              color="#4ECDC4"
              unit="g"
              size={64}
            />
            <MacroRing
              value={macros.carbs}
              target={carbsTarget}
              label="Koolh."
              color="#FFD166"
              unit="g"
              size={64}
            />
            <MacroRing
              value={macros.fat}
              target={fatTarget}
              label="Vet"
              color="#EF476F"
              unit="g"
              size={64}
            />
          </View>
        </View>

        {/* Meal Sections */}
        {isLoading ? (
          <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 32 }} />
        ) : (
          MEAL_TYPES.map((meal) => {
            const mealLogs = getMealLogs(meal.key);
            const mealCals = getMealCalories(meal.key);
            const planEntries = mealPlanEntries[meal.key] || [];
            const hasPlanItems = planEntries.length > 0;
            const totalCals = mealCals + planEntries.reduce((s, e) => s + (e.recipe?.calories || 0), 0);

            return (
              <View key={meal.key} style={styles.mealSection}>
                <View style={styles.mealHeader}>
                  <View style={styles.mealHeaderLeft}>
                    <Ionicons name={meal.icon} size={20} color={theme.colors.primary} />
                    <Text style={styles.mealTitle}>{meal.label}</Text>
                    {totalCals > 0 && (
                      <Text style={styles.mealCals}>{totalCals} kcal</Text>
                    )}
                  </View>
                  <TouchableOpacity
                    style={styles.addBtn}
                    onPress={() =>
                      navigation.navigate('AddFood' as never, {
                        date: selectedDate,
                        mealType: meal.key,
                      } as never)
                    }
                  >
                    <Ionicons name="add" size={20} color={theme.colors.primary} />
                  </TouchableOpacity>
                </View>

                {/* Coach Meal Plan Items */}
                {planEntries.map((entry) => {
                  const recipe = entry.recipe;
                  const title = recipe?.title || entry.customTitle || 'Maaltijd';
                  const isExpanded = expandedRecipe === entry.id;

                  return (
                    <TouchableOpacity
                      key={entry.id}
                      style={styles.planItem}
                      onPress={() => setExpandedRecipe(isExpanded ? null : entry.id)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.planItemHeader}>
                        {recipe?.imageUrl ? (
                          <Image source={{ uri: recipe.imageUrl }} style={styles.planItemImage} />
                        ) : (
                          <View style={styles.planItemPlaceholder}>
                            <Ionicons name="restaurant" size={16} color={theme.colors.primary} />
                          </View>
                        )}
                        <View style={styles.planItemInfo}>
                          <View style={styles.planItemTitleRow}>
                            <Text style={styles.planItemName} numberOfLines={1}>{title}</Text>
                            <View style={styles.coachBadge}>
                              <Text style={styles.coachBadgeText}>Coach</Text>
                            </View>
                          </View>
                          {recipe && (
                            <Text style={styles.planItemMacros}>
                              {recipe.calories || 0} kcal  ·  E{recipe.proteinGrams || 0}g  ·  K{recipe.carbsGrams || 0}g  ·  V{recipe.fatGrams || 0}g
                            </Text>
                          )}
                          {!recipe && entry.customDescription && (
                            <Text style={styles.planItemMacros} numberOfLines={1}>{entry.customDescription}</Text>
                          )}
                        </View>
                        <Ionicons
                          name={isExpanded ? 'chevron-up' : 'chevron-down'}
                          size={16}
                          color={theme.colors.textTertiary}
                        />
                      </View>

                      {/* Expanded: ingredients + instructions */}
                      {isExpanded && recipe && (
                        <View style={styles.planItemDetails}>
                          {(recipe.prepTimeMin || recipe.cookTimeMin) && (
                            <View style={styles.timeRow}>
                              {recipe.prepTimeMin ? (
                                <View style={styles.timeChip}>
                                  <Ionicons name="timer-outline" size={12} color={theme.colors.textTertiary} />
                                  <Text style={styles.timeText}>{recipe.prepTimeMin} min prep</Text>
                                </View>
                              ) : null}
                              {recipe.cookTimeMin ? (
                                <View style={styles.timeChip}>
                                  <Ionicons name="flame-outline" size={12} color={theme.colors.textTertiary} />
                                  <Text style={styles.timeText}>{recipe.cookTimeMin} min koken</Text>
                                </View>
                              ) : null}
                              {recipe.servings ? (
                                <View style={styles.timeChip}>
                                  <Ionicons name="people-outline" size={12} color={theme.colors.textTertiary} />
                                  <Text style={styles.timeText}>{recipe.servings} porties</Text>
                                </View>
                              ) : null}
                            </View>
                          )}

                          {recipe.ingredients.length > 0 && (
                            <View style={styles.detailSection}>
                              <Text style={styles.detailTitle}>Ingrediënten</Text>
                              {recipe.ingredients.map((ing) => (
                                <View key={ing.id} style={styles.ingredientRow}>
                                  <View style={styles.ingredientDot} />
                                  <Text style={styles.ingredientText}>
                                    {ing.amount ? `${ing.amount} ${ing.unit || ''} ` : ''}{ing.name}
                                  </Text>
                                </View>
                              ))}
                            </View>
                          )}

                          {recipe.instructions && (
                            <View style={styles.detailSection}>
                              <Text style={styles.detailTitle}>Bereiding</Text>
                              <Text style={styles.instructionsText}>{recipe.instructions}</Text>
                            </View>
                          )}
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}

                {/* Logged Food Items */}
                {mealLogs.map((log) => (
                  <TouchableOpacity
                    key={log.id}
                    style={styles.foodItem}
                    onLongPress={() => handleDelete(log)}
                  >
                    <View style={styles.foodItemLeft}>
                      <Text style={styles.foodName}>{log.foodName}</Text>
                      <Text style={styles.foodMeta}>
                        {log.numberOfServings && log.numberOfServings !== 1
                          ? `${log.numberOfServings}x `
                          : ''}
                        {log.servingSize ? `${log.servingSize}${log.servingUnit || 'g'}` : ''}
                      </Text>
                    </View>
                    <View style={styles.foodItemRight}>
                      <Text style={styles.foodCals}>
                        {Math.round((log.calories || 0) * (log.numberOfServings || 1))} kcal
                      </Text>
                      <Text style={styles.foodMacros}>
                        E{Math.round((log.proteinGrams || 0) * (log.numberOfServings || 1))} |{' '}
                        K{Math.round((log.carbsGrams || 0) * (log.numberOfServings || 1))} |{' '}
                        V{Math.round((log.fatGrams || 0) * (log.numberOfServings || 1))}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}

                {/* Empty state — only if no plan items AND no logs */}
                {!hasPlanItems && mealLogs.length === 0 && (
                  <TouchableOpacity
                    style={styles.emptyMeal}
                    onPress={() =>
                      navigation.navigate('AddFood' as never, {
                        date: selectedDate,
                        mealType: meal.key,
                      } as never)
                    }
                  >
                    <Ionicons name="add-circle-outline" size={22} color={theme.colors.textTertiary} />
                    <Text style={styles.emptyMealText}>Voeding toevoegen</Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: theme.colors.headerDark,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
  },
  headerRight: {
    flexDirection: 'row',
    gap: 8,
  },
  headerBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  // Date selector
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 16,
  },
  dateArrow: {
    padding: 4,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    minWidth: 140,
    textAlign: 'center',
  },
  // Macro card
  macroCard: {
    backgroundColor: theme.colors.surface,
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    ...theme.shadows.md,
    marginBottom: 24,
  },
  macroSmallRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 16,
  },
  // Meal sections
  mealSection: {
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    overflow: 'hidden',
    ...theme.shadows.sm,
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  mealHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  mealTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  mealCals: {
    fontSize: 13,
    color: theme.colors.textTertiary,
    fontWeight: '500',
  },
  addBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.primary + '12',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Coach meal plan items
  planItem: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.primary + '04',
  },
  planItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 10,
  },
  planItemImage: {
    width: 44,
    height: 44,
    borderRadius: 8,
  },
  planItemPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: theme.colors.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
  },
  planItemInfo: {
    flex: 1,
  },
  planItemTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  planItemName: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    flex: 1,
  },
  coachBadge: {
    backgroundColor: theme.colors.primary + '15',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  coachBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.primary,
    textTransform: 'uppercase',
  },
  planItemMacros: {
    fontSize: 12,
    color: theme.colors.textTertiary,
    marginTop: 2,
  },
  // Expanded recipe details
  planItemDetails: {
    paddingHorizontal: 16,
    paddingBottom: 14,
    backgroundColor: theme.colors.background + '80',
  },
  timeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    marginBottom: 10,
  },
  timeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: theme.colors.background,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  timeText: {
    fontSize: 11,
    color: theme.colors.textTertiary,
  },
  detailSection: {
    marginBottom: 10,
  },
  detailTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 6,
  },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    paddingVertical: 2,
  },
  ingredientDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.primary,
    marginTop: 6,
  },
  ingredientText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    flex: 1,
  },
  instructionsText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  // Logged food items
  emptyMeal: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 20,
  },
  emptyMealText: {
    fontSize: 14,
    color: theme.colors.textTertiary,
  },
  foodItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  foodItemLeft: {
    flex: 1,
    marginRight: 12,
  },
  foodName: {
    fontSize: 15,
    fontWeight: '500',
    color: theme.colors.text,
  },
  foodMeta: {
    fontSize: 12,
    color: theme.colors.textTertiary,
    marginTop: 2,
  },
  foodItemRight: {
    alignItems: 'flex-end',
  },
  foodCals: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
  },
  foodMacros: {
    fontSize: 11,
    color: theme.colors.textTertiary,
    marginTop: 2,
  },
});
