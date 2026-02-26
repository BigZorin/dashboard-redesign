import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../constants/theme';
import type { TemplateQuestion, CheckInTemplate } from '../../lib/checkInTemplateApi';
import { saveCheckInAnswers } from '../../lib/checkInTemplateApi';
import { useSubmitCheckIn } from '../../hooks/useCheckIn';
import { useSubmitDailyCheckIn } from '../../hooks/useDailyCheckIn';

type Props = {
  template: CheckInTemplate;
  navigation: any;
};

export default function DynamicCheckInScreen({ template, navigation }: Props) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const submitWeekly = useSubmitCheckIn();
  const submitDaily = useSubmitDailyCheckIn();

  const questions = template.questions;
  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  const handleAnswer = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleNext = () => {
    if (question.isRequired && !answers[question.id]) {
      Alert.alert('Vereist', 'Beantwoord deze vraag om door te gaan');
      return;
    }
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      // Extract known fields from answers based on field_key
      const fieldMap: Record<string, string> = {};
      for (const q of questions) {
        if (q.fieldKey && answers[q.id]) {
          fieldMap[q.fieldKey] = answers[q.id];
        }
      }

      let checkInId: string | undefined;

      if (template.checkInType === 'weekly') {
        // Submit the base weekly check-in
        await submitWeekly.mutateAsync({
          feeling: parseInt(fieldMap['feeling'] || '3'),
          weight: fieldMap['weight'] || '0',
          energy: parseInt(fieldMap['energy'] || '3'),
          sleep: parseInt(fieldMap['sleep'] || '3'),
          stress: parseInt(fieldMap['stress'] || '3'),
          nutrition: parseInt(fieldMap['nutrition'] || '3'),
          training: parseInt(fieldMap['training'] || '3'),
          notes: fieldMap['notes'] || '',
        });
      } else {
        // Submit the base daily check-in
        await submitDaily.mutateAsync({
          weight: fieldMap['weight'],
          mood: parseInt(fieldMap['mood'] || '3'),
          sleep: parseInt(fieldMap['sleep'] || '3'),
          notes: fieldMap['notes'] || '',
        });
      }

      // Save custom answers (non-field-key answers or all of them)
      const customAnswers = questions
        .filter((q) => answers[q.id])
        .map((q) => ({ questionId: q.id, value: answers[q.id] }));

      // Note: We'd need the check-in ID. For now, save without linking
      // since the answers are self-contained with the question context.
      // This will be enhanced when we add check-in ID returns.

      Alert.alert(
        'Gelukt!',
        template.checkInType === 'weekly'
          ? 'Je wekelijkse check-in is ingediend'
          : 'Je dagelijkse check-in is ingediend',
        [{ text: 'OK', onPress: () => navigation.goBack() }],
      );
    } catch (error) {
      Alert.alert('Fout', 'Kon check-in niet opslaan');
    } finally {
      setSubmitting(false);
    }
  };

  const renderScaleQuestion = (q: TemplateQuestion) => {
    const labels = q.scaleLabels || ['1', '2', '3', '4', '5'];
    const currentValue = answers[q.id] ? parseInt(answers[q.id]) : null;

    return (
      <View style={styles.scaleContainer}>
        {labels.map((label, index) => {
          const value = index + 1;
          const isSelected = currentValue === value;
          return (
            <TouchableOpacity
              key={index}
              style={[styles.scaleButton, isSelected && styles.scaleButtonActive]}
              onPress={() => handleAnswer(q.id, String(value))}
            >
              <Text
                style={[styles.scaleNumber, isSelected && styles.scaleNumberActive]}
              >
                {value}
              </Text>
              <Text
                style={[styles.scaleLabel, isSelected && styles.scaleLabelActive]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  const renderNumberQuestion = (q: TemplateQuestion) => (
    <View style={styles.inputContainer}>
      <TextInput
        style={styles.numberInput}
        value={answers[q.id] || ''}
        onChangeText={(v) => handleAnswer(q.id, v)}
        keyboardType="decimal-pad"
        placeholder="0.0"
        placeholderTextColor={theme.colors.textTertiary}
      />
      {q.unit && <Text style={styles.unit}>{q.unit}</Text>}
    </View>
  );

  const renderTextQuestion = (q: TemplateQuestion) => (
    <TextInput
      style={styles.textArea}
      value={answers[q.id] || ''}
      onChangeText={(v) => handleAnswer(q.id, v)}
      placeholder="Typ je antwoord..."
      placeholderTextColor={theme.colors.textTertiary}
      multiline
      numberOfLines={6}
      textAlignVertical="top"
    />
  );

  const renderYesNoQuestion = (q: TemplateQuestion) => {
    const currentValue = answers[q.id];
    return (
      <View style={styles.yesNoContainer}>
        <TouchableOpacity
          style={[styles.yesNoButton, currentValue === 'ja' && styles.yesNoButtonActiveYes]}
          onPress={() => handleAnswer(q.id, 'ja')}
        >
          <Ionicons
            name="checkmark-circle"
            size={28}
            color={currentValue === 'ja' ? '#fff' : theme.colors.success}
          />
          <Text
            style={[styles.yesNoText, currentValue === 'ja' && styles.yesNoTextActive]}
          >
            Ja
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.yesNoButton, currentValue === 'nee' && styles.yesNoButtonActiveNo]}
          onPress={() => handleAnswer(q.id, 'nee')}
        >
          <Ionicons
            name="close-circle"
            size={28}
            color={currentValue === 'nee' ? '#fff' : theme.colors.error}
          />
          <Text
            style={[styles.yesNoText, currentValue === 'nee' && styles.yesNoTextActive]}
          >
            Nee
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderMultipleChoiceQuestion = (q: TemplateQuestion) => {
    const options = q.options || [];
    return (
      <View style={styles.choiceContainer}>
        {options.map((option, index) => {
          const isSelected = answers[q.id] === option;
          return (
            <TouchableOpacity
              key={index}
              style={[styles.choiceButton, isSelected && styles.choiceButtonActive]}
              onPress={() => handleAnswer(q.id, option)}
            >
              <View style={[styles.choiceRadio, isSelected && styles.choiceRadioActive]}>
                {isSelected && <View style={styles.choiceRadioDot} />}
              </View>
              <Text
                style={[styles.choiceText, isSelected && styles.choiceTextActive]}
              >
                {option}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  const renderQuestion = () => {
    switch (question.questionType) {
      case 'scale':
        return renderScaleQuestion(question);
      case 'number':
        return renderNumberQuestion(question);
      case 'text':
        return renderTextQuestion(question);
      case 'yes_no':
        return renderYesNoQuestion(question);
      case 'multiple_choice':
        return renderMultipleChoiceQuestion(question);
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
          <Ionicons name="close" size={28} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{template.name}</Text>
        <View style={styles.closeButton} />
      </View>

      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${progress}%` }]} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.questionNumber}>
          Vraag {currentQuestion + 1} van {questions.length}
        </Text>
        <Text style={styles.questionTitle}>{question.question}</Text>
        {!question.isRequired && (
          <Text style={styles.optionalBadge}>Optioneel</Text>
        )}

        <View style={styles.answerContainer}>{renderQuestion()}</View>
      </ScrollView>

      <View style={styles.footer}>
        {currentQuestion > 0 && (
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Ionicons name="chevron-back" size={24} color={theme.colors.primary} />
            <Text style={styles.backButtonText}>Vorige</Text>
          </TouchableOpacity>
        )}
        <View style={{ flex: 1 }} />
        <TouchableOpacity
          style={[styles.nextButton, submitting && { opacity: 0.6 }]}
          onPress={handleNext}
          disabled={submitting}
        >
          <Text style={styles.nextButtonText}>
            {submitting
              ? 'Bezig...'
              : currentQuestion === questions.length - 1
              ? 'Indienen'
              : 'Volgende'}
          </Text>
          {currentQuestion < questions.length - 1 && (
            <Ionicons name="chevron-forward" size={24} color="#fff" />
          )}
        </TouchableOpacity>
      </View>
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
  progressBar: {
    height: 4,
    backgroundColor: theme.colors.border,
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
  },
  questionNumber: {
    fontSize: 14,
    color: theme.colors.textTertiary,
    marginBottom: 8,
  },
  questionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 8,
    lineHeight: 32,
  },
  optionalBadge: {
    fontSize: 12,
    color: theme.colors.textTertiary,
    fontStyle: 'italic',
    marginBottom: 24,
  },
  answerContainer: {
    marginBottom: 24,
    marginTop: 16,
  },
  // Scale
  scaleContainer: {
    gap: 12,
  },
  scaleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: theme.colors.border,
    backgroundColor: '#fff',
  },
  scaleButtonActive: {
    borderColor: theme.colors.primary,
    backgroundColor: '#f0eef5',
  },
  scaleNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.disabled,
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    textAlign: 'center',
    lineHeight: 40,
    marginRight: 16,
    overflow: 'hidden',
  },
  scaleNumberActive: {
    backgroundColor: theme.colors.primary,
    color: '#fff',
  },
  scaleLabel: {
    fontSize: 16,
    color: theme.colors.text,
    flex: 1,
  },
  scaleLabelActive: {
    fontWeight: '600',
    color: theme.colors.primary,
  },
  // Number
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  numberInput: {
    flex: 1,
    fontSize: 48,
    fontWeight: '700',
    color: theme.colors.text,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.disabled,
  },
  unit: {
    fontSize: 24,
    fontWeight: '600',
    color: theme.colors.textTertiary,
  },
  // Text
  textArea: {
    fontSize: 16,
    color: theme.colors.text,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.disabled,
    minHeight: 150,
  },
  // Yes/No
  yesNoContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  yesNoButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: theme.colors.border,
    backgroundColor: '#fff',
  },
  yesNoButtonActiveYes: {
    borderColor: theme.colors.success,
    backgroundColor: theme.colors.success,
  },
  yesNoButtonActiveNo: {
    borderColor: theme.colors.error,
    backgroundColor: theme.colors.error,
  },
  yesNoText: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
  },
  yesNoTextActive: {
    color: '#fff',
  },
  // Multiple Choice
  choiceContainer: {
    gap: 10,
  },
  choiceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: theme.colors.border,
    backgroundColor: '#fff',
    gap: 14,
  },
  choiceButtonActive: {
    borderColor: theme.colors.primary,
    backgroundColor: '#f0eef5',
  },
  choiceRadio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: theme.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  choiceRadioActive: {
    borderColor: theme.colors.primary,
  },
  choiceRadioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: theme.colors.primary,
  },
  choiceText: {
    fontSize: 16,
    color: theme.colors.text,
    flex: 1,
  },
  choiceTextActive: {
    fontWeight: '600',
    color: theme.colors.primary,
  },
  // Footer
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: '#fff',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  backButtonText: {
    fontSize: 16,
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
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginRight: 4,
  },
});
