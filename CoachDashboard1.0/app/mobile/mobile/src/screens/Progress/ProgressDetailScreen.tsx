import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useProgressChartData } from '../../hooks/useProgressChartData';
import WeightTrendCard from '../../components/charts/WeightTrendCard';
import MoodSleepCard from '../../components/charts/MoodSleepCard';
import ComplianceBarsCard from '../../components/charts/ComplianceBarsCard';
import MetricsOverviewCard from '../../components/charts/MetricsOverviewCard';
import { theme } from '../../constants/theme';
import { ScrollView } from 'react-native';
import { SkeletonChart, SkeletonCard } from '../../components/Skeleton';
import ScreenHeader from '../../components/ScreenHeader';

// ============================================================
// TYPES
// ============================================================
export interface ProgressDetailScreenProps {
  loading?: boolean;
  weightData?: any[];
  moodData?: any[];
  sleepData?: any[];
  complianceData?: any[];
  metrics?: any;
}

// ============================================================
// DEFAULT MOCK DATA
// ============================================================
function getDateOffset(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

const defaultWeightData = [
  { date: getDateOffset(-6), value: 82.5 },
  { date: getDateOffset(-5), value: 82.3 },
  { date: getDateOffset(-4), value: 82.1 },
  { date: getDateOffset(-3), value: 82.4 },
  { date: getDateOffset(-2), value: 81.9 },
  { date: getDateOffset(-1), value: 81.7 },
  { date: getDateOffset(0), value: 81.5 },
];

const defaultMoodData = [
  { date: getDateOffset(-6), value: 7 },
  { date: getDateOffset(-5), value: 8 },
  { date: getDateOffset(-4), value: 6 },
  { date: getDateOffset(-3), value: 7 },
  { date: getDateOffset(-2), value: 8 },
  { date: getDateOffset(-1), value: 9 },
  { date: getDateOffset(0), value: 8 },
];

const defaultSleepData = [
  { date: getDateOffset(-6), value: 7.5 },
  { date: getDateOffset(-5), value: 8.0 },
  { date: getDateOffset(-4), value: 6.5 },
  { date: getDateOffset(-3), value: 7.0 },
  { date: getDateOffset(-2), value: 8.5 },
  { date: getDateOffset(-1), value: 7.0 },
  { date: getDateOffset(0), value: 8.0 },
];

// ============================================================
// SKELETON STATE
// ============================================================
function ProgressSkeleton() {
  return (
    <View style={{ padding: 20, gap: 12 }}>
      <SkeletonChart />
      <SkeletonChart />
      <SkeletonCard />
      <SkeletonCard />
    </View>
  );
}

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function ProgressDetailScreen(props: ProgressDetailScreenProps = {}) {
  const navigation = useNavigation();
  const hookData = useProgressChartData();

  const loading = props.loading ?? false;
  const weightData = props.weightData ?? hookData.weightData ?? defaultWeightData;
  const moodData = props.moodData ?? hookData.moodData ?? defaultMoodData;
  const sleepData = props.sleepData ?? hookData.sleepData ?? defaultSleepData;
  const complianceData = props.complianceData ?? hookData.complianceData;
  const metrics = props.metrics ?? hookData.metrics;

  return (
    <View style={styles.safeArea}>
      <ScreenHeader
        title="Voortgang"
        subtitle="Gewicht, stemming & compliance"
        onBack={() => navigation.goBack()}
      />

      {loading ? (
        <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 100 }}>
          <ProgressSkeleton />
        </ScrollView>
      ) : (
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <WeightTrendCard data={weightData} />
          <MoodSleepCard moodData={moodData} sleepData={sleepData} />
          <ComplianceBarsCard data={complianceData} />
          <MetricsOverviewCard metrics={metrics} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
});
