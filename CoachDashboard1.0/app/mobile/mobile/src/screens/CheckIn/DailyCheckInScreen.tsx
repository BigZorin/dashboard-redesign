import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useSubmitDailyCheckIn } from '../../hooks/useDailyCheckIn';
import { useCheckInTemplate } from '../../hooks/useCheckInTemplate';
import DynamicCheckInScreen from './DynamicCheckInScreen';
import { theme } from '../../constants/theme';

const MOOD_OPTIONS = [
  { value: 1, label: 'Slecht', icon: 'sad-outline' as const },
  { value: 2, label: 'Matig', icon: 'sad-outline' as const },
  { value: 3, label: 'Oké', icon: 'happy-outline' as const },
  { value: 4, label: 'Goed', icon: 'happy-outline' as const },
  { value: 5, label: 'Top', icon: 'star-outline' as const },
];

const SLEEP_OPTIONS = [
  { value: 1, label: 'Slecht' },
  { value: 2, label: 'Matig' },
  { value: 3, label: 'Oké' },
  { value: 4, label: 'Goed' },
  { value: 5, label: 'Diep' },
];

export default function DailyCheckInScreen({ navigation }: any) {
  const { data: template, isLoading: templateLoading } = useCheckInTemplate('daily');
  const [weight, setWeight] = useState('');
  const [mood, setMood] = useState<number | null>(null);
  const [sleep, setSleep] = useState<number | null>(null);
  const [notes, setNotes] = useState('');
  const submitDailyCheckIn = useSubmitDailyCheckIn();

  // If a custom template exists, use the dynamic screen
  if (templateLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (template && template.questions.length > 0) {
    return <DynamicCheckInScreen template={template} navigation={navigation} />;
  }

  // Fallback: original built-in daily check-in
  const handleSubmit = () => {
    if (!mood) {
      Alert.alert('Vereist', 'Selecteer je stemming');
      return;
    }
    if (!sleep) {
      Alert.alert('Vereist', 'Selecteer je slaapkwaliteit');
      return;
    }

    submitDailyCheckIn.mutate(
      {
        weight: weight || undefined,
        mood,
        sleep,
        notes: notes || undefined,
      },
      {
        onSuccess: () => {
          Alert.alert('Gelukt!', 'Je dagelijkse check-in is opgeslagen', [
            { text: 'OK', onPress: () => navigation.goBack() },
          ]);
        },
        onError: (error: any) => {
          console.error('Daily check-in error:', error);
          Alert.alert('Fout', `Kon check-in niet opslaan: ${error?.message || 'Onbekende fout'}`);
        },
      }
    );
  };

  const today = new Date().toLocaleDateString('nl-NL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
          <Ionicons name="close" size={28} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Dagelijkse Check-in</Text>
        <View style={styles.closeButton} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Date indicator */}
          <Text style={styles.dateText}>{today}</Text>

          {/* Weight */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Gewicht (optioneel)</Text>
            <View style={styles.weightRow}>
              <TextInput
                style={styles.weightInput}
                value={weight}
                onChangeText={setWeight}
                keyboardType="decimal-pad"
                placeholder="0.0"
                placeholderTextColor="#C7C7CC"
              />
              <Text style={styles.weightUnit}>kg</Text>
            </View>
          </View>

          {/* Mood */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Hoe voel je je vandaag?</Text>
            <View style={styles.optionRow}>
              {MOOD_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.optionButton,
                    mood === option.value && styles.optionButtonActive,
                  ]}
                  onPress={() => setMood(option.value)}
                >
                  <Text
                    style={[
                      styles.optionNumber,
                      mood === option.value && styles.optionNumberActive,
                    ]}
                  >
                    {option.value}
                  </Text>
                  <Text
                    style={[
                      styles.optionLabel,
                      mood === option.value && styles.optionLabelActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Sleep */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Hoe heb je geslapen?</Text>
            <View style={styles.optionRow}>
              {SLEEP_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.optionButton,
                    sleep === option.value && styles.optionButtonActive,
                  ]}
                  onPress={() => setSleep(option.value)}
                >
                  <Text
                    style={[
                      styles.optionNumber,
                      sleep === option.value && styles.optionNumberActive,
                    ]}
                  >
                    {option.value}
                  </Text>
                  <Text
                    style={[
                      styles.optionLabel,
                      sleep === option.value && styles.optionLabelActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Notes */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Notities (optioneel)</Text>
            <TextInput
              style={styles.notesInput}
              value={notes}
              onChangeText={setNotes}
              placeholder="Hoe gaat het? Bijzonderheden?"
              placeholderTextColor="#C7C7CC"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>
        </ScrollView>

        {/* Submit button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.submitButton,
              (!mood || !sleep) && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={submitDailyCheckIn.isPending || !mood || !sleep}
          >
            <Text style={styles.submitButtonText}>
              {submitDailyCheckIn.isPending ? 'Opslaan...' : 'Opslaan'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  closeButton: {
    width: 40,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: theme.colors.text,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  dateText: {
    fontSize: 14,
    color: theme.colors.textTertiary,
    marginBottom: 24,
    textTransform: 'capitalize',
  },
  section: {
    marginBottom: 28,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 12,
  },
  // Weight
  weightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  weightInput: {
    flex: 1,
    fontSize: 32,
    fontWeight: '700',
    color: theme.colors.text,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.disabled,
  },
  weightUnit: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.textTertiary,
  },
  // Option buttons (mood & sleep)
  optionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  optionButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: theme.colors.border,
    backgroundColor: '#fff',
  },
  optionButtonActive: {
    borderColor: theme.colors.primary,
    backgroundColor: `${theme.colors.primary}10`,
  },
  optionNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  optionNumberActive: {
    color: theme.colors.primary,
  },
  optionLabel: {
    fontSize: 10,
    color: theme.colors.textTertiary,
    textAlign: 'center',
  },
  optionLabelActive: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  // Notes
  notesInput: {
    fontSize: 16,
    color: theme.colors.text,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.disabled,
    minHeight: 90,
  },
  // Footer
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: '#fff',
  },
  submitButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#fff',
  },
});
