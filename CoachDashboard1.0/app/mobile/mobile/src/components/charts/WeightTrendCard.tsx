import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ChartCard from './ChartCard';
import LineChart from './LineChart';
import { theme } from '../../constants/theme';
import { WeightPoint } from '../../hooks/useProgressChartData';

type Props = {
  data: WeightPoint[];
};

export default function WeightTrendCard({ data }: Props) {
  if (data.length < 2) {
    return (
      <ChartCard
        title="Gewichtsverloop"
        isEmpty
        emptyText="Minimaal 2 check-ins nodig voor de grafiek"
      />
    );
  }

  const firstWeight = data[0].weight;
  const lastWeight = data[data.length - 1].weight;
  const diff = lastWeight - firstWeight;
  const absDiff = Math.abs(diff).toFixed(1);
  const diffColor = diff <= 0 ? theme.colors.success : theme.colors.warning;
  const diffIcon = diff < 0 ? 'arrow-down' : diff > 0 ? 'arrow-up' : 'remove';

  const series = [
    {
      data: data.map((d) => ({ value: d.weight, label: d.label })),
      color: theme.colors.primary,
    },
  ];

  return (
    <ChartCard title="Gewichtsverloop">
      <View style={styles.weightRow}>
        <Text style={styles.currentWeight}>{lastWeight.toFixed(1)}</Text>
        <Text style={styles.weightUnit}>kg</Text>
        <View style={[styles.diffBadge, { backgroundColor: `${diffColor}12` }]}>
          <Ionicons name={diffIcon as any} size={12} color={diffColor} />
          <Text style={[styles.diffText, { color: diffColor }]}>{absDiff}</Text>
        </View>
      </View>
      <Text style={styles.weightSubtext}>Huidig gewicht</Text>
      <LineChart series={series} showAreaFill />
    </ChartCard>
  );
}

const styles = StyleSheet.create({
  weightRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  currentWeight: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  weightUnit: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.textSecondary,
    marginRight: 8,
  },
  diffBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: theme.borderRadius.sm,
  },
  diffText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
  },
  weightSubtext: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textTertiary,
    marginTop: 2,
    marginBottom: 12,
  },
});
