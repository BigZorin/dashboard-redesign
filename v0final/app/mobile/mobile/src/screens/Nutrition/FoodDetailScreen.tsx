import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAddFoodLog } from '../../hooks/useNutrition';
import MacroRing from '../../components/MacroRing';
import { theme } from '../../constants/theme';
import type { FoodProduct } from '../../lib/openFoodFacts';

export default function FoodDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const { product, date, mealType } = route.params as {
    product: FoodProduct;
    date: string;
    mealType: string;
  };

  const addMutation = useAddFoodLog();

  // Default serving: use product's serving size or 100g
  const defaultServingGrams = product.servingSizeGrams || 100;
  const [servingGrams, setServingGrams] = useState(String(defaultServingGrams));
  const [numberOfServings, setNumberOfServings] = useState('1');

  const grams = parseFloat(servingGrams) || 0;
  const servings = parseFloat(numberOfServings) || 1;
  const multiplier = (grams / 100) * servings;

  const adjustedCalories = Math.round(product.calories * multiplier);
  const adjustedProtein = Math.round(product.protein * multiplier);
  const adjustedCarbs = Math.round(product.carbs * multiplier);
  const adjustedFat = Math.round(product.fat * multiplier);

  const handleSave = () => {
    addMutation.mutate(
      {
        date,
        mealType,
        foodName: product.brand ? `${product.name} (${product.brand})` : product.name,
        calories: Math.round(product.calories * (grams / 100)),
        proteinGrams: Math.round(product.protein * (grams / 100)),
        carbsGrams: Math.round(product.carbs * (grams / 100)),
        fatGrams: Math.round(product.fat * (grams / 100)),
        servingSize: grams,
        servingUnit: 'g',
        numberOfServings: servings,
        barcode: product.barcode || undefined,
        source: product.barcode ? 'barcode' : 'search',
      },
      {
        onSuccess: () => {
          navigation.navigate('NutritionHome' as never);
        },
        onError: (error) => {
          Alert.alert('Fout bij opslaan', error.message || 'Kon voeding niet opslaan. Probeer het opnieuw.');
        },
      }
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Product details</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Product info */}
        <View style={styles.productCard}>
          {product.imageUrl ? (
            <Image source={{ uri: product.imageUrl }} style={styles.productImage} />
          ) : null}
          <Text style={styles.productName}>{product.name}</Text>
          {product.brand ? <Text style={styles.productBrand}>{product.brand}</Text> : null}
        </View>

        {/* Per 100g info */}
        <View style={styles.per100Card}>
          <Text style={styles.per100Title}>Per 100g</Text>
          <View style={styles.per100Row}>
            <Text style={styles.per100Item}>{product.calories} kcal</Text>
            <Text style={styles.per100Item}>E {product.protein}g</Text>
            <Text style={styles.per100Item}>K {product.carbs}g</Text>
            <Text style={styles.per100Item}>V {product.fat}g</Text>
          </View>
        </View>

        {/* Serving size */}
        <View style={styles.servingCard}>
          <Text style={styles.servingTitle}>Portiegrootte</Text>
          <View style={styles.servingRow}>
            <View style={styles.servingInput}>
              <TextInput
                style={styles.servingTextInput}
                value={servingGrams}
                onChangeText={setServingGrams}
                keyboardType="numeric"
              />
              <Text style={styles.servingUnit}>gram</Text>
            </View>
            <Text style={styles.servingX}>x</Text>
            <View style={styles.servingInput}>
              <TextInput
                style={styles.servingTextInput}
                value={numberOfServings}
                onChangeText={setNumberOfServings}
                keyboardType="numeric"
              />
              <Text style={styles.servingUnit}>porties</Text>
            </View>
          </View>
          {product.servingSize && (
            <TouchableOpacity
              style={styles.presetBtn}
              onPress={() => setServingGrams(String(product.servingSizeGrams || 100))}
            >
              <Text style={styles.presetBtnText}>
                Standaardportie: {product.servingSize}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Calculated macros */}
        <View style={styles.macroCard}>
          <Text style={styles.macroTitle}>Totale voedingswaarden</Text>
          <View style={styles.macroRingsRow}>
            <MacroRing value={adjustedCalories} target={0} label="kcal" color="#FF6B35" size={80} />
            <MacroRing value={adjustedProtein} target={0} label="Eiwit" color="#4ECDC4" unit="g" size={64} />
            <MacroRing value={adjustedCarbs} target={0} label="Koolh." color="#FFD166" unit="g" size={64} />
            <MacroRing value={adjustedFat} target={0} label="Vet" color="#EF476F" unit="g" size={64} />
          </View>
        </View>

        {/* Save button */}
        <TouchableOpacity
          style={[styles.saveBtn, addMutation.isPending && { opacity: 0.6 }]}
          onPress={handleSave}
          disabled={addMutation.isPending}
        >
          <Ionicons name="add-circle" size={22} color="#fff" />
          <Text style={styles.saveBtnText}>
            {addMutation.isPending ? 'Opslaan...' : 'Toevoegen'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
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
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  scroll: {
    flex: 1,
    padding: 20,
  },
  productCard: {
    alignItems: 'center',
    marginBottom: 20,
  },
  productImage: {
    width: 100,
    height: 100,
    borderRadius: 12,
    marginBottom: 12,
  },
  productName: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
    textAlign: 'center',
  },
  productBrand: {
    fontSize: 15,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  per100Card: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  per100Title: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textTertiary,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  per100Row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  per100Item: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text,
  },
  servingCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  servingTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textTertiary,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  servingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  servingInput: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 6,
  },
  servingTextInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
  },
  servingUnit: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  servingX: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textTertiary,
  },
  presetBtn: {
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: theme.colors.primary + '12',
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  presetBtnText: {
    fontSize: 13,
    fontWeight: '500',
    color: theme.colors.primary,
  },
  macroCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  macroTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textTertiary,
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  macroRingsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: theme.colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
  },
  saveBtnText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#fff',
  },
});
