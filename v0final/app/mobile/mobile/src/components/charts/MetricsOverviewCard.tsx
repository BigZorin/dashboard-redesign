import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ChartCard from './ChartCard';
import LineChart from './LineChart';
import { theme } from '../../constants/theme';
import { MetricItem } from '../../hooks/useProgressChartData';

type Props = {
  metrics: MetricItem[];
};

export default function MetricsOverviewCard({ metrics }: Props) {
  const hasAnyData = metrics.some((m) => m.currentValue !== null);

  if (!hasAnyData) {
    return (
      <ChartCard
        title="Weekoverzicht"
        isEmpty
        emptyText="Vul een wekelijkse check-in in om je metrics te zien"
      />
    );
  }

  return (
    <ChartCard title="Weekoverzicht">
      <View style={styles.grid}>
        {metrics.map((metric) => (
          <View key={metric.label} style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <Ionicons
                name={metric.icon as any}
                size={16}
                color={metric.color}
              />
              <Text style={styles.metricLabel}>{metric.label}</Text>
            </View>

            <Text style={styles.metricValue}>
              {metric.currentValue !== null
                ? `${metric.currentValue}/10`
                : '--'}
            </Text>

            {/* Mini sparkline */}
            {metric.data.length >= 2 && (
              <View style={styles.sparklineContainer}>
                <LineChart
                  series={[
                    {
                      data: metric.data.map((v, i) => ({
                        value: v,
                        label: String(i),
                      })),
                      color: metric.color,
                    },
                  ]}
                  height={30}
                  yDomain={[0, metric.maxValue]}
                  showAreaFill={false}
                  minimal
                />
              </View>
            )}
          </View>
        ))}
      </View>
    </ChartCard>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  metricCard: {
    width: '47%',
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.md,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 4,
  },
  sparklineContainer: {
    marginHorizontal: -theme.spacing.md,
    overflow: 'hidden',
  },
});
