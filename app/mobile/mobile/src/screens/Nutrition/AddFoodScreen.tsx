import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAddFoodLog } from '../../hooks/useNutrition';
import { theme } from '../../constants/theme';

const MEAL_LABELS: Record<string, string> = {
  BREAKFAST: 'Ontbijt',
  LUNCH: 'Lunch',
  DINNER: 'Avondeten',
  SNACK: 'Snack',
};

export default function AddFoodScreen() {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const { date, mealType } = route.params || {};
  const addMutation = useAddFoodLog();

  const [mode, setMode] = useState<'options' | 'manual'>('options');

  // Manual entry state
  const [foodName, setFoodName] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [servingSize, setServingSize] = useState('');
  const [servingUnit, setServingUnit] = useState('g');

  const handleManualSave = async () => {
    if (!foodName.trim()) {
      Alert.alert('Vul een naam in');
      return;
    }

    addMutation.mutate(
      {
        date,
        mealType,
        foodName: foodName.trim(),
        calories: calories ? parseInt(calories) : undefined,
        proteinGrams: protein ? parseInt(protein) : undefined,
        carbsGrams: carbs ? parseInt(carbs) : undefined,
        fatGrams: fat ? parseInt(fat) : undefined,
        servingSize: servingSize ? parseFloat(servingSize) : undefined,
        servingUnit: servingUnit || undefined,
        source: 'manual',
      },
      {
        onSuccess: () => navigation.goBack(),
        onError: (error) => {
          Alert.alert('Fout bij opslaan', error.message || 'Kon voeding niet opslaan. Probeer het opnieuw.');
        },
      }
    );
  };

  if (mode === 'manual') {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setMode('options')}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Handmatig invoeren</Text>
          <View style={{ width: 24 }} />
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
        >
          <ScrollView style={styles.form} contentContainerStyle={{ paddingBottom: 40 }}>
            <Text style={styles.mealLabel}>{MEAL_LABELS[mealType] || mealType}</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Naam *</Text>
              <TextInput
                style={styles.input}
                value={foodName}
                onChangeText={setFoodName}
                placeholder="bijv. Havermout met banaan"
                placeholderTextColor={theme.colors.textTertiary}
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>Portie</Text>
                <TextInput
                  style={styles.input}
                  value={servingSize}
                  onChangeText={setServingSize}
                  placeholder="100"
                  keyboardType="numeric"
                  placeholderTextColor={theme.colors.textTertiary}
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>Eenheid</Text>
                <View style={styles.unitRow}>
                  {['g', 'ml', 'stuks'].map((u) => (
                    <TouchableOpacity
                      key={u}
                      style={[styles.unitBtn, servingUnit === u && styles.unitBtnActive]}
                      onPress={() => setServingUnit(u)}
                    >
                      <Text style={[styles.unitText, servingUnit === u && styles.unitTextActive]}>
                        {u}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            <Text style={styles.sectionLabel}>Voedingswaarden</Text>

            <View style={styles.macroRow}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>Calorieën</Text>
                <TextInput
                  style={styles.input}
                  value={calories}
                  onChangeText={setCalories}
                  placeholder="0"
                  keyboardType="numeric"
                  placeholderTextColor={theme.colors.textTertiary}
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>Eiwit (g)</Text>
                <TextInput
                  style={styles.input}
                  value={protein}
                  onChangeText={setProtein}
                  placeholder="0"
                  keyboardType="numeric"
                  placeholderTextColor={theme.colors.textTertiary}
                />
              </View>
            </View>

            <View style={styles.macroRow}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>Koolhydraten (g)</Text>
                <TextInput
                  style={styles.input}
                  value={carbs}
                  onChangeText={setCarbs}
                  placeholder="0"
                  keyboardType="numeric"
                  placeholderTextColor={theme.colors.textTertiary}
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>Vet (g)</Text>
                <TextInput
                  style={styles.input}
                  value={fat}
                  onChangeText={setFat}
                  placeholder="0"
                  keyboardType="numeric"
                  placeholderTextColor={theme.colors.textTertiary}
                />
              </View>
            </View>

            <TouchableOpacity
              style={[styles.saveBtn, addMutation.isPending && { opacity: 0.6 }]}
              onPress={handleManualSave}
              disabled={addMutation.isPending}
            >
              <Text style={styles.saveBtnText}>
                {addMutation.isPending ? 'Opslaan...' : 'Opslaan'}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // Options view
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Voeding toevoegen</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.optionsContainer}>
        <Text style={styles.mealLabel}>{MEAL_LABELS[mealType] || mealType}</Text>

        <TouchableOpacity
          style={styles.optionCard}
          onPress={() =>
            navigation.navigate('FoodSearch' as never, { date, mealType } as never)
          }
        >
          <View style={[styles.optionIcon, { backgroundColor: '#4ECDC420' }]}>
            <Ionicons name="search" size={24} color="#4ECDC4" />
          </View>
          <View style={styles.optionText}>
            <Text style={styles.optionTitle}>Zoeken</Text>
            <Text style={styles.optionDesc}>Zoek in de voedingsdatabase</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={theme.colors.textTertiary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.optionCard}
          onPress={() =>
            navigation.navigate('BarcodeScanner' as never, { date, mealType } as never)
          }
        >
          <View style={[styles.optionIcon, { backgroundColor: `${theme.colors.warning}20` }]}>
            <Ionicons name="barcode-outline" size={24} color={theme.colors.warning} />
          </View>
          <View style={styles.optionText}>
            <Text style={styles.optionTitle}>Barcode scannen</Text>
            <Text style={styles.optionDesc}>Scan het etiket van een product</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={theme.colors.textTertiary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.optionCard} onPress={() => setMode('manual')}>
          <View style={[styles.optionIcon, { backgroundColor: `${theme.colors.error}20` }]}>
            <Ionicons name="create-outline" size={24} color={theme.colors.error} />
          </View>
          <View style={styles.optionText}>
            <Text style={styles.optionTitle}>Handmatig invoeren</Text>
            <Text style={styles.optionDesc}>Voer voedingswaarden zelf in</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={theme.colors.textTertiary} />
        </TouchableOpacity>
      </View>
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
  mealLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 16,
  },
  // Options
  optionsContainer: {
    padding: 20,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    ...theme.shadows.sm,
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 2,
  },
  optionDesc: {
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  // Manual form
  form: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    marginBottom: 6,
  },
  input: {
    backgroundColor: theme.colors.surface,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: theme.colors.text,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.textSecondary,
    marginTop: 8,
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  macroRow: {
    flexDirection: 'row',
    gap: 12,
  },
  unitRow: {
    flexDirection: 'row',
    gap: 6,
  },
  unitBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  unitBtnActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  unitText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text,
  },
  unitTextActive: {
    color: '#fff',
  },
  saveBtn: {
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  saveBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});
