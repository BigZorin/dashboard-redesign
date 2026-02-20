import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useActiveMealPlan } from '../../hooks/useMealPlan';
import { theme } from '../../constants/theme';
import type { MealPlanEntry } from '../../lib/nutritionApi';

const DAYS = [
  { key: 1, short: 'Ma', label: 'Maandag' },
  { key: 2, short: 'Di', label: 'Dinsdag' },
  { key: 3, short: 'Wo', label: 'Woensdag' },
  { key: 4, short: 'Do', label: 'Donderdag' },
  { key: 5, short: 'Vr', label: 'Vrijdag' },
  { key: 6, short: 'Za', label: 'Zaterdag' },
  { key: 7, short: 'Zo', label: 'Zondag' },
];

const MEAL_ORDER: Record<string, { label: string; icon: string; order: number }> = {
  BREAKFAST: { label: 'Ontbijt', icon: 'sunny-outline', order: 0 },
  LUNCH: { label: 'Lunch', icon: 'restaurant-outline', order: 1 },
  DINNER: { label: 'Avondeten', icon: 'moon-outline', order: 2 },
  SNACK: { label: 'Snack', icon: 'cafe-outline', order: 3 },
};

function getTodayDayOfWeek(): number {
  const jsDay = new Date().getDay(); // 0=Sun
  return jsDay === 0 ? 7 : jsDay; // 1=Mon..7=Sun
}

export default function MealPlanScreen() {
  const navigation = useNavigation();
  const { data: mealPlan, isLoading } = useActiveMealPlan();
  const [selectedDay, setSelectedDay] = useState(getTodayDayOfWeek());

  const dayEntries = (mealPlan?.entries || [])
    .filter((e) => e.dayOfWeek === selectedDay)
    .sort((a, b) => (MEAL_ORDER[a.mealType]?.order ?? 9) - (MEAL_ORDER[b.mealType]?.order ?? 9));

  const dayCalories = dayEntries.reduce((sum, e) => sum + (e.recipe?.calories || 0), 0);
  const dayProtein = dayEntries.reduce((sum, e) => sum + (e.recipe?.proteinGrams || 0), 0);
  const dayCarbs = dayEntries.reduce((sum, e) => sum + (e.recipe?.carbsGrams || 0), 0);
  const dayFat = dayEntries.reduce((sum, e) => sum + (e.recipe?.fatGrams || 0), 0);

  // Group entries by meal type
  const groupedByMeal: Record<string, MealPlanEntry[]> = {};
  dayEntries.forEach((entry) => {
    if (!groupedByMeal[entry.mealType]) groupedByMeal[entry.mealType] = [];
    groupedByMeal[entry.mealType].push(entry);
  });

  const [expandedRecipe, setExpandedRecipe] = useState<string | null>(null);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Weekschema</Text>
          {mealPlan && <Text style={styles.headerSubtitle}>{mealPlan.name}</Text>}
        </View>
        <View style={styles.backBtn} />
      </View>

      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : !mealPlan ? (
        <View style={styles.centerContainer}>
          <Ionicons name="restaurant-outline" size={64} color={theme.colors.textTertiary} />
          <Text style={styles.emptyTitle}>Geen weekschema</Text>
          <Text style={styles.emptyText}>
            Je coach heeft nog geen meal plan aan je toegewezen.
          </Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollArea}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Day Tabs */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.dayTabs}
          >
            {DAYS.map((day) => {
              const isToday = day.key === getTodayDayOfWeek();
              const isSelected = day.key === selectedDay;
              const hasEntries = mealPlan.entries.some((e) => e.dayOfWeek === day.key);

              return (
                <TouchableOpacity
                  key={day.key}
                  style={[
                    styles.dayTab,
                    isSelected && styles.dayTabActive,
                  ]}
                  onPress={() => setSelectedDay(day.key)}
                >
                  <Text style={[styles.dayTabLabel, isSelected && styles.dayTabLabelActive]}>
                    {day.short}
                  </Text>
                  {isToday && <View style={[styles.todayDot, isSelected && styles.todayDotActive]} />}
                  {!hasEntries && !isSelected && <View style={styles.emptyDot} />}
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Day Title */}
          <View style={styles.dayHeader}>
            <Text style={styles.dayTitle}>
              {DAYS.find((d) => d.key === selectedDay)?.label}
            </Text>
            {dayCalories > 0 && (
              <View style={styles.dayMacros}>
                <Text style={styles.dayMacroText}>{dayCalories} kcal</Text>
                <Text style={styles.dayMacroDivider}>|</Text>
                <Text style={styles.dayMacroText}>E{dayProtein}g</Text>
                <Text style={styles.dayMacroDivider}>|</Text>
                <Text style={styles.dayMacroText}>K{dayCarbs}g</Text>
                <Text style={styles.dayMacroDivider}>|</Text>
                <Text style={styles.dayMacroText}>V{dayFat}g</Text>
              </View>
            )}
          </View>

          {/* Meals */}
          {dayEntries.length === 0 ? (
            <View style={styles.emptyDay}>
              <Ionicons name="calendar-outline" size={40} color={theme.colors.textTertiary} />
              <Text style={styles.emptyDayText}>Geen maaltijden voor deze dag</Text>
            </View>
          ) : (
            Object.entries(groupedByMeal).map(([mealType, entries]) => {
              const meal = MEAL_ORDER[mealType];
              const mealCals = entries.reduce((s, e) => s + (e.recipe?.calories || 0), 0);

              return (
                <View key={mealType} style={styles.mealSection}>
                  <View style={styles.mealHeader}>
                    <View style={styles.mealHeaderLeft}>
                      <Ionicons name={meal?.icon as any || 'restaurant-outline'} size={18} color={theme.colors.primary} />
                      <Text style={styles.mealTitle}>{meal?.label || mealType}</Text>
                    </View>
                    {mealCals > 0 && (
                      <Text style={styles.mealCals}>{mealCals} kcal</Text>
                    )}
                  </View>

                  {entries.map((entry) => {
                    const isExpanded = expandedRecipe === entry.id;
                    const recipe = entry.recipe;
                    const title = recipe?.title || entry.customTitle || 'Maaltijd';

                    return (
                      <TouchableOpacity
                        key={entry.id}
                        style={styles.recipeCard}
                        onPress={() => setExpandedRecipe(isExpanded ? null : entry.id)}
                        activeOpacity={0.7}
                      >
                        {/* Recipe Header */}
                        <View style={styles.recipeHeader}>
                          {recipe?.imageUrl ? (
                            <Image source={{ uri: recipe.imageUrl }} style={styles.recipeImage} />
                          ) : (
                            <View style={styles.recipePlaceholder}>
                              <Ionicons name="restaurant" size={20} color={theme.colors.textTertiary} />
                            </View>
                          )}
                          <View style={styles.recipeInfo}>
                            <Text style={styles.recipeName}>{title}</Text>
                            {recipe && (
                              <View style={styles.recipeMacroRow}>
                                <Text style={styles.recipeMacro}>{recipe.calories || 0} kcal</Text>
                                <Text style={styles.recipeMacroDivider}>·</Text>
                                <Text style={styles.recipeMacro}>E{recipe.proteinGrams || 0}g</Text>
                                <Text style={styles.recipeMacroDivider}>·</Text>
                                <Text style={styles.recipeMacro}>K{recipe.carbsGrams || 0}g</Text>
                                <Text style={styles.recipeMacroDivider}>·</Text>
                                <Text style={styles.recipeMacro}>V{recipe.fatGrams || 0}g</Text>
                              </View>
                            )}
                            {!recipe && entry.customDescription && (
                              <Text style={styles.recipeDesc} numberOfLines={2}>{entry.customDescription}</Text>
                            )}
                          </View>
                          <Ionicons
                            name={isExpanded ? 'chevron-up' : 'chevron-down'}
                            size={18}
                            color={theme.colors.textTertiary}
                          />
                        </View>

                        {/* Expanded Details */}
                        {isExpanded && recipe && (
                          <View style={styles.recipeDetails}>
                            {/* Time info */}
                            {(recipe.prepTimeMin || recipe.cookTimeMin) && (
                              <View style={styles.timeRow}>
                                {recipe.prepTimeMin ? (
                                  <View style={styles.timeItem}>
                                    <Ionicons name="timer-outline" size={14} color={theme.colors.textTertiary} />
                                    <Text style={styles.timeText}>Prep: {recipe.prepTimeMin} min</Text>
                                  </View>
                                ) : null}
                                {recipe.cookTimeMin ? (
                                  <View style={styles.timeItem}>
                                    <Ionicons name="flame-outline" size={14} color={theme.colors.textTertiary} />
                                    <Text style={styles.timeText}>Koken: {recipe.cookTimeMin} min</Text>
                                  </View>
                                ) : null}
                                {recipe.servings ? (
                                  <View style={styles.timeItem}>
                                    <Ionicons name="people-outline" size={14} color={theme.colors.textTertiary} />
                                    <Text style={styles.timeText}>{recipe.servings} porties</Text>
                                  </View>
                                ) : null}
                              </View>
                            )}

                            {/* Ingredients */}
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

                            {/* Instructions */}
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
                </View>
              );
            })
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: theme.colors.primary,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 2,
  },
  centerContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: theme.colors.textTertiary,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  scrollArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  // Day Tabs
  dayTabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 6,
  },
  dayTab: {
    width: 44,
    height: 56,
    borderRadius: 12,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  dayTabActive: {
    backgroundColor: theme.colors.primary,
  },
  dayTabLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
  },
  dayTabLabelActive: {
    color: '#fff',
  },
  todayDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: theme.colors.primary,
    marginTop: 4,
  },
  todayDotActive: {
    backgroundColor: '#fff',
  },
  emptyDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: theme.colors.border,
    marginTop: 4,
  },
  // Day Header
  dayHeader: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  dayTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
  },
  dayMacros: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 6,
  },
  dayMacroText: {
    fontSize: 13,
    fontWeight: '500',
    color: theme.colors.textTertiary,
  },
  dayMacroDivider: {
    fontSize: 13,
    color: theme.colors.border,
  },
  // Empty day
  emptyDay: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyDayText: {
    fontSize: 14,
    color: theme.colors.textTertiary,
    marginTop: 12,
  },
  // Meal section
  mealSection: {
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: theme.colors.primary + '08',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  mealHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  mealTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.text,
  },
  mealCals: {
    fontSize: 13,
    color: theme.colors.textTertiary,
    fontWeight: '500',
  },
  // Recipe card
  recipeCard: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  recipeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
  },
  recipeImage: {
    width: 52,
    height: 52,
    borderRadius: 10,
  },
  recipePlaceholder: {
    width: 52,
    height: 52,
    borderRadius: 10,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recipeInfo: {
    flex: 1,
  },
  recipeName: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.text,
  },
  recipeMacroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
    gap: 4,
  },
  recipeMacro: {
    fontSize: 12,
    color: theme.colors.textTertiary,
  },
  recipeMacroDivider: {
    fontSize: 12,
    color: theme.colors.border,
  },
  recipeDesc: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  // Expanded details
  recipeDetails: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: theme.colors.background + '80',
  },
  timeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    marginBottom: 12,
  },
  timeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontSize: 12,
    color: theme.colors.textTertiary,
  },
  detailSection: {
    marginBottom: 12,
  },
  detailTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 8,
  },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    paddingVertical: 3,
  },
  ingredientDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: theme.colors.primary,
    marginTop: 6,
  },
  ingredientText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    flex: 1,
  },
  instructionsText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 22,
  },
});
