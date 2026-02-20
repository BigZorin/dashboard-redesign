import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useSubmitCheckIn } from '../../hooks/useCheckIn';
import { useCheckInTemplate } from '../../hooks/useCheckInTemplate';
import DynamicCheckInScreen from './DynamicCheckInScreen';
import { theme } from '../../constants/theme';

const QUESTIONS = [
  {
    id: 'feeling',
    title: 'Hoe voel je je deze week?',
    type: 'scale',
    labels: ['Slecht', 'Matig', 'Oké', 'Goed', 'Uitstekend'],
  },
  {
    id: 'weight',
    title: 'Wat is je huidige gewicht?',
    type: 'number',
    unit: 'kg',
  },
  {
    id: 'energy',
    title: 'Hoe is je energieniveau?',
    type: 'scale',
    labels: ['Laag', 'Matig', 'Gemiddeld', 'Hoog', 'Uitstekend'],
  },
  {
    id: 'sleep',
    title: 'Hoe is je slaapkwaliteit?',
    type: 'scale',
    labels: ['Slecht', 'Matig', 'Oké', 'Goed', 'Uitstekend'],
  },
  {
    id: 'stress',
    title: 'Wat is je stressniveau?',
    type: 'scale',
    labels: ['Zeer laag', 'Laag', 'Gemiddeld', 'Hoog', 'Zeer hoog'],
  },
  {
    id: 'nutrition',
    title: 'Hoe goed volg je je voedingsschema?',
    type: 'scale',
    labels: ['0%', '25%', '50%', '75%', '100%'],
  },
  {
    id: 'training',
    title: 'Hoe goed volg je je trainingsschema?',
    type: 'scale',
    labels: ['0%', '25%', '50%', '75%', '100%'],
  },
  {
    id: 'notes',
    title: 'Opmerkingen of vragen voor je coach?',
    type: 'text',
    placeholder: 'Typ hier je opmerkingen of vragen...',
  },
];

export default function CheckInScreen({ navigation }: any) {
  const { data: template, isLoading: templateLoading } = useCheckInTemplate('weekly');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<any>({});
  const submitCheckIn = useSubmitCheckIn();

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

  // Fallback: original built-in questions
  const question = QUESTIONS[currentQuestion];
  const progress = ((currentQuestion + 1) / QUESTIONS.length) * 100;

  const handleAnswer = (value: any) => {
    setAnswers({ ...answers, [question.id]: value });
  };

  const handleNext = () => {
    if (!answers[question.id] && question.type !== 'text') {
      Alert.alert('Vereist', 'Beantwoord deze vraag om door te gaan');
      return;
    }

    if (currentQuestion < QUESTIONS.length - 1) {
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

  const handleSubmit = () => {
    submitCheckIn.mutate(answers, {
      onSuccess: () => {
        Alert.alert('Gelukt!', 'Je wekelijkse check-in is ingediend', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      },
      onError: () => {
        Alert.alert('Fout', 'Kon check-in niet opslaan');
      },
    });
  };

  const renderQuestion = () => {
    if (question.type === 'scale') {
      return (
        <View style={styles.scaleContainer}>
          {question.labels?.map((label, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.scaleButton,
                answers[question.id] === index + 1 && styles.scaleButtonActive,
              ]}
              onPress={() => handleAnswer(index + 1)}
            >
              <Text style={[
                styles.scaleNumber,
                answers[question.id] === index + 1 && styles.scaleNumberActive,
              ]}>
                {index + 1}
              </Text>
              <Text style={[
                styles.scaleLabel,
                answers[question.id] === index + 1 && styles.scaleLabelActive,
              ]}>
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      );
    }

    if (question.type === 'number') {
      return (
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={answers[question.id]?.toString() || ''}
            onChangeText={handleAnswer}
            keyboardType="decimal-pad"
            placeholder="0.0"
          />
          <Text style={styles.unit}>{question.unit}</Text>
        </View>
      );
    }

    if (question.type === 'text') {
      return (
        <TextInput
          style={styles.textArea}
          value={answers[question.id] || ''}
          onChangeText={handleAnswer}
          placeholder={question.placeholder}
          multiline
          numberOfLines={6}
          textAlignVertical="top"
        />
      );
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
          <Ionicons name="close" size={28} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Wekelijkse Check-in</Text>
        <View style={styles.closeButton} />
      </View>

      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${progress}%` }]} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.questionNumber}>
          Vraag {currentQuestion + 1} van {QUESTIONS.length}
        </Text>
        <Text style={styles.questionTitle}>{question.title}</Text>

        <View style={styles.answerContainer}>
          {renderQuestion()}
        </View>
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
          style={styles.nextButton}
          onPress={handleNext}
          disabled={submitCheckIn.isPending}
        >
          <Text style={styles.nextButtonText}>
            {submitCheckIn.isPending ? 'Bezig...' : currentQuestion === QUESTIONS.length - 1 ? 'Indienen' : 'Volgende'}
          </Text>
          {currentQuestion < QUESTIONS.length - 1 && (
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
    backgroundColor: theme.colors.background,
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
    marginBottom: 32,
    lineHeight: 32,
  },
  answerContainer: {
    marginBottom: 24,
  },
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
    backgroundColor: theme.colors.surface,
  },
  scaleButtonActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryLight,
  },
  scaleNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    textAlign: 'center',
    lineHeight: 40,
    marginRight: 16,
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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 48,
    fontWeight: '700',
    color: theme.colors.text,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.background,
  },
  unit: {
    fontSize: 24,
    fontWeight: '600',
    color: theme.colors.textTertiary,
  },
  textArea: {
    fontSize: 16,
    color: theme.colors.text,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.background,
    minHeight: 150,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
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
