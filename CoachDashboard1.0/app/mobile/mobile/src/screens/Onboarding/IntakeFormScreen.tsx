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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../constants/theme';
import { useSubmitIntakeForm } from '../../hooks/useIntakeForm';
import type { IntakeFormData } from '../../lib/intakeApi';

const STEPS = [
  { title: 'Doelen & Ervaring', icon: 'trophy-outline' as const },
  { title: 'Gezondheid', icon: 'medkit-outline' as const },
  { title: 'Leefstijl', icon: 'moon-outline' as const },
  { title: 'Schema & Uitrusting', icon: 'calendar-outline' as const },
];

const GOAL_OPTIONS = [
  'Afvallen',
  'Spiermassa opbouwen',
  'Fitter worden',
  'Krachtopbouw',
  'Gezonder leven',
  'Revalidatie',
];

const EXPERIENCE_OPTIONS = [
  { label: 'Beginner', description: 'Weinig tot geen ervaring' },
  { label: 'Gemiddeld', description: '1-3 jaar ervaring' },
  { label: 'Gevorderd', description: '3+ jaar ervaring' },
  { label: 'Expert', description: '5+ jaar serieus trainen' },
];

const DAYS_OPTIONS = [
  'Maandag',
  'Dinsdag',
  'Woensdag',
  'Donderdag',
  'Vrijdag',
  'Zaterdag',
  'Zondag',
];

const TIME_OPTIONS = ['Ochtend', 'Middag', 'Avond', 'Wisselend'];

const EQUIPMENT_OPTIONS = [
  'Volledige sportschool',
  'Basis sportschool',
  'Thuis met uitrusting',
  'Thuis zonder uitrusting',
  'Buiten',
];

const STRESS_LABELS = ['Zeer laag', 'Laag', 'Gemiddeld', 'Hoog', 'Zeer hoog'];

export default function IntakeFormScreen({ onComplete }: { onComplete: () => void }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<IntakeFormData>({
    availableDays: [],
  });
  const submitIntake = useSubmitIntakeForm();

  const progress = ((currentStep + 1) / STEPS.length) * 100;

  const updateField = (field: keyof IntakeFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleDay = (day: string) => {
    const current = formData.availableDays || [];
    if (current.includes(day)) {
      updateField('availableDays', current.filter((d) => d !== day));
    } else {
      updateField('availableDays', [...current, day]);
    }
  };

  const toggleGoal = (goal: string) => {
    const current = formData.goals || '';
    const goals = current ? current.split(', ') : [];
    if (goals.includes(goal)) {
      updateField('goals', goals.filter((g) => g !== goal).join(', '));
    } else {
      updateField('goals', [...goals, goal].join(', '));
    }
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    submitIntake.mutate(formData, {
      onSuccess: () => {
        Alert.alert(
          'Welkom! 🎉',
          'Je intake formulier is ingevuld. Je coach gaat je gegevens bekijken en een plan voor je maken.',
          [{ text: 'Aan de slag!', onPress: onComplete }],
        );
      },
      onError: (error: any) => {
        console.error('Intake submit error:', error);
        Alert.alert('Fout', `Kon het formulier niet opslaan: ${error?.message || 'Onbekende fout'}`);
      },
    });
  };

  const renderStep0 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.sectionTitle}>Wat zijn je doelen?</Text>
      <Text style={styles.sectionSubtitle}>Selecteer alles wat van toepassing is</Text>
      <View style={styles.chipContainer}>
        {GOAL_OPTIONS.map((goal) => {
          const selected = (formData.goals || '').includes(goal);
          return (
            <TouchableOpacity
              key={goal}
              style={[styles.chip, selected && styles.chipSelected]}
              onPress={() => toggleGoal(goal)}
            >
              <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{goal}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={[styles.sectionTitle, { marginTop: 28 }]}>Wat is je ervaring?</Text>
      <View style={styles.optionsList}>
        {EXPERIENCE_OPTIONS.map((opt) => {
          const selected = formData.fitnessExperience === opt.label;
          return (
            <TouchableOpacity
              key={opt.label}
              style={[styles.optionCard, selected && styles.optionCardSelected]}
              onPress={() => updateField('fitnessExperience', opt.label)}
            >
              <Text style={[styles.optionLabel, selected && styles.optionLabelSelected]}>
                {opt.label}
              </Text>
              <Text style={[styles.optionDescription, selected && styles.optionDescriptionSelected]}>
                {opt.description}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={[styles.sectionTitle, { marginTop: 28 }]}>Trainingsgeschiedenis</Text>
      <TextInput
        style={styles.textArea}
        value={formData.trainingHistory || ''}
        onChangeText={(v) => updateField('trainingHistory', v)}
        placeholder="Beschrijf je trainingsachtergrond..."
        placeholderTextColor={theme.colors.textTertiary}
        multiline
        numberOfLines={4}
        textAlignVertical="top"
      />
    </View>
  );

  const renderStep1 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.sectionTitle}>Blessures</Text>
      <Text style={styles.sectionSubtitle}>Huidige of eerdere blessures waar we rekening mee moeten houden</Text>
      <TextInput
        style={styles.textArea}
        value={formData.injuries || ''}
        onChangeText={(v) => updateField('injuries', v)}
        placeholder="Bijv. knieblessure links, schouderklachten..."
        placeholderTextColor={theme.colors.textTertiary}
        multiline
        numberOfLines={3}
        textAlignVertical="top"
      />

      <Text style={[styles.sectionTitle, { marginTop: 28 }]}>Medische aandoeningen</Text>
      <Text style={styles.sectionSubtitle}>Aandoeningen die van invloed kunnen zijn op je training</Text>
      <TextInput
        style={styles.textArea}
        value={formData.medicalConditions || ''}
        onChangeText={(v) => updateField('medicalConditions', v)}
        placeholder="Bijv. astma, diabetes, hoge bloeddruk..."
        placeholderTextColor={theme.colors.textTertiary}
        multiline
        numberOfLines={3}
        textAlignVertical="top"
      />

      <Text style={[styles.sectionTitle, { marginTop: 28 }]}>Medicijnen</Text>
      <TextInput
        style={styles.textArea}
        value={formData.medications || ''}
        onChangeText={(v) => updateField('medications', v)}
        placeholder="Gebruik je momenteel medicijnen? Zo ja, welke?"
        placeholderTextColor={theme.colors.textTertiary}
        multiline
        numberOfLines={3}
        textAlignVertical="top"
      />
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.sectionTitle}>Voedingsrestricties</Text>
      <TextInput
        style={styles.textArea}
        value={formData.dietaryRestrictions || ''}
        onChangeText={(v) => updateField('dietaryRestrictions', v)}
        placeholder="Bijv. vegetarisch, veganistisch, glutenvrij..."
        placeholderTextColor={theme.colors.textTertiary}
        multiline
        numberOfLines={2}
        textAlignVertical="top"
      />

      <Text style={[styles.sectionTitle, { marginTop: 28 }]}>Allergieën</Text>
      <TextInput
        style={styles.textArea}
        value={formData.allergies || ''}
        onChangeText={(v) => updateField('allergies', v)}
        placeholder="Bijv. noten, lactose, gluten..."
        placeholderTextColor={theme.colors.textTertiary}
        multiline
        numberOfLines={2}
        textAlignVertical="top"
      />

      <Text style={[styles.sectionTitle, { marginTop: 28 }]}>Gemiddelde slaap per nacht</Text>
      <View style={styles.sleepRow}>
        <TouchableOpacity
          style={styles.sleepButton}
          onPress={() => updateField('sleepHours', Math.max(3, (formData.sleepHours || 7) - 0.5))}
        >
          <Ionicons name="remove" size={20} color={theme.colors.text} />
        </TouchableOpacity>
        <View style={styles.sleepValue}>
          <Text style={styles.sleepNumber}>{formData.sleepHours || 7}</Text>
          <Text style={styles.sleepUnit}>uur</Text>
        </View>
        <TouchableOpacity
          style={styles.sleepButton}
          onPress={() => updateField('sleepHours', Math.min(12, (formData.sleepHours || 7) + 0.5))}
        >
          <Ionicons name="add" size={20} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      <Text style={[styles.sectionTitle, { marginTop: 28 }]}>Stressniveau</Text>
      <View style={styles.stressContainer}>
        {STRESS_LABELS.map((label, index) => {
          const level = index + 1;
          const selected = formData.stressLevel === level;
          return (
            <TouchableOpacity
              key={label}
              style={[styles.stressChip, selected && styles.stressChipSelected]}
              onPress={() => updateField('stressLevel', level)}
            >
              <Text style={[styles.stressText, selected && styles.stressTextSelected]}>
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={[styles.sectionTitle, { marginTop: 28 }]}>Beroep</Text>
      <TextInput
        style={styles.input}
        value={formData.occupation || ''}
        onChangeText={(v) => updateField('occupation', v)}
        placeholder="Bijv. kantoorwerk, fysiek werk, student..."
        placeholderTextColor={theme.colors.textTertiary}
      />
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.sectionTitle}>Beschikbare trainingsdagen</Text>
      <Text style={styles.sectionSubtitle}>Selecteer de dagen waarop je kunt trainen</Text>
      <View style={styles.daysGrid}>
        {DAYS_OPTIONS.map((day) => {
          const selected = (formData.availableDays || []).includes(day);
          return (
            <TouchableOpacity
              key={day}
              style={[styles.dayChip, selected && styles.dayChipSelected]}
              onPress={() => toggleDay(day)}
            >
              <Text style={[styles.dayText, selected && styles.dayTextSelected]}>
                {day.substring(0, 2)}
              </Text>
              <Text style={[styles.dayFull, selected && styles.dayFullSelected]}>
                {day}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={[styles.sectionTitle, { marginTop: 28 }]}>Voorkeurstijd</Text>
      <View style={styles.chipContainer}>
        {TIME_OPTIONS.map((time) => {
          const selected = formData.preferredTrainingTime === time;
          return (
            <TouchableOpacity
              key={time}
              style={[styles.chip, selected && styles.chipSelected]}
              onPress={() => updateField('preferredTrainingTime', time)}
            >
              <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{time}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={[styles.sectionTitle, { marginTop: 28 }]}>Beschikbare uitrusting</Text>
      <View style={styles.optionsList}>
        {EQUIPMENT_OPTIONS.map((eq) => {
          const selected = formData.equipmentAccess === eq;
          return (
            <TouchableOpacity
              key={eq}
              style={[styles.optionCard, selected && styles.optionCardSelected]}
              onPress={() => updateField('equipmentAccess', eq)}
            >
              <Text style={[styles.optionLabel, selected && styles.optionLabelSelected]}>
                {eq}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={[styles.sectionTitle, { marginTop: 28 }]}>Overige opmerkingen</Text>
      <TextInput
        style={styles.textArea}
        value={formData.additionalNotes || ''}
        onChangeText={(v) => updateField('additionalNotes', v)}
        placeholder="Is er nog iets dat je coach moet weten?"
        placeholderTextColor={theme.colors.textTertiary}
        multiline
        numberOfLines={4}
        textAlignVertical="top"
      />
    </View>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0: return renderStep0();
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      default: return null;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Ionicons name="clipboard-outline" size={24} color={theme.colors.primary} />
          <Text style={styles.headerTitle}>Intake Formulier</Text>
        </View>
        <Text style={styles.headerSubtitle}>
          Vul dit in zodat je coach een plan op maat kan maken
        </Text>
      </View>

      {/* Step indicators */}
      <View style={styles.stepIndicators}>
        {STEPS.map((step, idx) => (
          <View key={idx} style={styles.stepIndicator}>
            <View
              style={[
                styles.stepDot,
                idx === currentStep && styles.stepDotActive,
                idx < currentStep && styles.stepDotCompleted,
              ]}
            >
              {idx < currentStep ? (
                <Ionicons name="checkmark" size={14} color="#fff" />
              ) : (
                <Ionicons
                  name={step.icon}
                  size={14}
                  color={idx === currentStep ? '#fff' : theme.colors.textTertiary}
                />
              )}
            </View>
            <Text
              style={[
                styles.stepLabel,
                idx === currentStep && styles.stepLabelActive,
              ]}
              numberOfLines={1}
            >
              {step.title}
            </Text>
          </View>
        ))}
      </View>

      {/* Progress bar */}
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${progress}%` }]} />
      </View>

      {/* Content */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {renderCurrentStep()}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Footer */}
      <View style={styles.footer}>
        {currentStep > 0 ? (
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Ionicons name="chevron-back" size={20} color={theme.colors.primary} />
            <Text style={styles.backButtonText}>Vorige</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ flex: 1 }} />
        )}
        <TouchableOpacity
          style={[styles.nextButton, submitIntake.isPending && styles.nextButtonDisabled]}
          onPress={handleNext}
          disabled={submitIntake.isPending}
        >
          <Text style={styles.nextButtonText}>
            {submitIntake.isPending
              ? 'Opslaan...'
              : currentStep === STEPS.length - 1
              ? 'Voltooien'
              : 'Volgende'}
          </Text>
          {currentStep < STEPS.length - 1 && (
            <Ionicons name="chevron-forward" size={20} color="#fff" />
          )}
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
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: theme.colors.surface,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.colors.text,
  },
  headerSubtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 4,
    marginLeft: 34,
  },
  stepIndicators: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: theme.colors.surface,
    gap: 4,
  },
  stepIndicator: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.disabled,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepDotActive: {
    backgroundColor: theme.colors.primary,
  },
  stepDotCompleted: {
    backgroundColor: theme.colors.success,
  },
  stepLabel: {
    fontSize: 10,
    color: theme.colors.textTertiary,
    textAlign: 'center',
  },
  stepLabelActive: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  progressBar: {
    height: 3,
    backgroundColor: theme.colors.border,
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  stepContent: {},
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 6,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginBottom: 12,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
  },
  chipSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text,
  },
  chipTextSelected: {
    color: '#fff',
  },
  optionsList: {
    gap: 8,
  },
  optionCard: {
    padding: 14,
    borderRadius: 12,
    backgroundColor: theme.colors.surface,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
  },
  optionCardSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryLight,
  },
  optionLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.text,
  },
  optionLabelSelected: {
    color: theme.colors.primary,
  },
  optionDescription: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  optionDescriptionSelected: {
    color: theme.colors.primary,
  },
  textArea: {
    fontSize: 15,
    color: theme.colors.text,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    minHeight: 80,
  },
  input: {
    fontSize: 15,
    color: theme.colors.text,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  sleepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    marginTop: 8,
  },
  sleepButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.surface,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sleepValue: {
    alignItems: 'center',
  },
  sleepNumber: {
    fontSize: 36,
    fontWeight: '700',
    color: theme.colors.text,
  },
  sleepUnit: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: -4,
  },
  stressContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  stressChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
  },
  stressChipSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  stressText: {
    fontSize: 13,
    fontWeight: '500',
    color: theme.colors.text,
  },
  stressTextSelected: {
    color: '#fff',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dayChip: {
    width: '30%',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: theme.colors.surface,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    alignItems: 'center',
  },
  dayChipSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  dayText: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text,
  },
  dayTextSelected: {
    color: '#fff',
  },
  dayFull: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  dayFullSelected: {
    color: 'rgba(255,255,255,0.8)',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  backButtonText: {
    fontSize: 15,
    color: theme.colors.primary,
    fontWeight: '600',
    marginLeft: 4,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 4,
  },
  nextButtonDisabled: {
    opacity: 0.6,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
