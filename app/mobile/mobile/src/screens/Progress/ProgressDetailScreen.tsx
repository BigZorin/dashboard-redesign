import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useProgressChartData } from '../../hooks/useProgressChartData';
import WeightTrendCard from '../../components/charts/WeightTrendCard';
import MoodSleepCard from '../../components/charts/MoodSleepCard';
import ComplianceBarsCard from '../../components/charts/ComplianceBarsCard';
import MetricsOverviewCard from '../../components/charts/MetricsOverviewCard';
import { theme } from '../../constants/theme';
import { ScrollView } from 'react-native';

export default function ProgressDetailScreen() {
  const navigation = useNavigation();
  const {
    weightData,
    moodData,
    sleepData,
    complianceData,
    metrics,
  } = useProgressChartData();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Voortgang</Text>
        <View style={{ width: 40 }} />
      </View>

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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: theme.colors.headerDark,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
});
