import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useProgressChartData } from '../../hooks/useProgressChartData';
import WeightTrendCard from '../../components/charts/WeightTrendCard';
import MoodSleepCard from '../../components/charts/MoodSleepCard';
import ComplianceBarsCard from '../../components/charts/ComplianceBarsCard';
import MetricsOverviewCard from '../../components/charts/MetricsOverviewCard';
import { theme } from '../../constants/theme';

export default function ProgressChartsSection() {
  const navigation = useNavigation();
  const {
    weightData,
    hasWeightData,
    moodData,
    sleepData,
    hasMoodSleepData,
    complianceData,
    hasComplianceData,
    metrics,
    hasMetricsData,
  } = useProgressChartData();

  // Don't render section at all if no data
  const hasAnyData = hasWeightData || hasMoodSleepData || hasComplianceData || hasMetricsData;
  if (!hasAnyData) return null;

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>VOORTGANG</Text>
        <TouchableOpacity onPress={() => navigation.navigate('ProgressDetail' as never)}>
          <Text style={styles.seeAllText}>Meer</Text>
        </TouchableOpacity>
      </View>

      {hasWeightData && <WeightTrendCard data={weightData} />}
      {hasMoodSleepData && <MoodSleepCard moodData={moodData} sleepData={sleepData} />}
      {hasComplianceData && <ComplianceBarsCard data={complianceData} />}
      {hasMetricsData && <MetricsOverviewCard metrics={metrics} />}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.textTertiary,
    letterSpacing: 0.5,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.secondary,
  },
});
