import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useActiveMealPlan } from '../../hooks/useMealPlan';
import { theme } from '../../constants/theme';

interface ShoppingItem {
  key: string;
  name: string;
  amount: number | null;
  unit: string | null;
}

export default function ShoppingListScreen() {
  const navigation = useNavigation();
  const { data: mealPlan, isLoading } = useActiveMealPlan();
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  // Aggregate all ingredients from the entire week's meal plan
  const shoppingList = useMemo(() => {
    if (!mealPlan?.entries?.length) return [];

    const ingredientMap = new Map<string, ShoppingItem>();

    mealPlan.entries.forEach((entry) => {
      if (!entry.recipe?.ingredients) return;
      entry.recipe.ingredients.forEach((ing) => {
        const key = `${ing.name.toLowerCase()}-${ing.unit || ''}`;
        const existing = ingredientMap.get(key);
        if (existing && existing.amount !== null && ing.amount !== null) {
          existing.amount = (existing.amount || 0) + (ing.amount || 0);
        } else if (!existing) {
          ingredientMap.set(key, {
            key,
            name: ing.name,
            amount: ing.amount,
            unit: ing.unit,
          });
        }
      });
    });

    return Array.from(ingredientMap.values()).sort((a, b) =>
      a.name.localeCompare(b.name, 'nl')
    );
  }, [mealPlan]);

  const toggleItem = (key: string) => {
    setCheckedItems((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const checkedCount = checkedItems.size;
  const totalCount = shoppingList.length;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Boodschappenlijst</Text>
          {mealPlan && (
            <Text style={styles.headerSubtitle}>{mealPlan.name}</Text>
          )}
        </View>
        {checkedCount > 0 ? (
          <TouchableOpacity
            onPress={() => setCheckedItems(new Set())}
            style={styles.clearBtn}
          >
            <Text style={styles.clearBtnText}>Reset</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.backBtn} />
        )}
      </View>

      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : !mealPlan || shoppingList.length === 0 ? (
        <View style={styles.centerContainer}>
          <Ionicons name="cart-outline" size={64} color={theme.colors.textTertiary} />
          <Text style={styles.emptyTitle}>Geen boodschappenlijst</Text>
          <Text style={styles.emptyText}>
            {!mealPlan
              ? 'Je coach heeft nog geen voedingsschema aan je toegewezen.'
              : 'Er zijn geen ingrediënten gevonden in je weekschema.'}
          </Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollArea}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Progress */}
          <View style={styles.progressRow}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: totalCount > 0 ? `${(checkedCount / totalCount) * 100}%` : '0%' },
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {checkedCount}/{totalCount}
            </Text>
          </View>

          {/* Items */}
          {shoppingList.map((item) => {
            const isChecked = checkedItems.has(item.key);
            return (
              <TouchableOpacity
                key={item.key}
                style={[styles.listItem, isChecked && styles.listItemChecked]}
                activeOpacity={0.7}
                onPress={() => toggleItem(item.key)}
              >
                <View style={[styles.checkbox, isChecked && styles.checkboxChecked]}>
                  {isChecked && <Ionicons name="checkmark" size={14} color="#fff" />}
                </View>
                <Text style={[styles.itemName, isChecked && styles.itemNameChecked]}>
                  {item.name}
                </Text>
                {item.amount != null && (
                  <Text style={[styles.itemAmount, isChecked && styles.itemAmountChecked]}>
                    {item.amount}{item.unit ? ` ${item.unit}` : ''}
                  </Text>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
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
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: theme.colors.headerDark,
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
  clearBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  clearBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
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
  // Progress
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: theme.colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.success,
    borderRadius: 3,
  },
  progressText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    minWidth: 40,
    textAlign: 'right',
  },
  // List items
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    gap: 12,
  },
  listItemChecked: {
    backgroundColor: theme.colors.success + '08',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: theme.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: theme.colors.success,
    borderColor: theme.colors.success,
  },
  itemName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: theme.colors.text,
  },
  itemNameChecked: {
    textDecorationLine: 'line-through',
    color: theme.colors.textTertiary,
  },
  itemAmount: {
    fontSize: 13,
    fontWeight: '500',
    color: theme.colors.textSecondary,
  },
  itemAmountChecked: {
    color: theme.colors.textTertiary,
  },
});
