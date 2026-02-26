import React from 'react';
import ChartCard from './ChartCard';
import BarChart from './BarChart';
import { theme } from '../../constants/theme';

const NUTRITION_COLOR = theme.colors.warning; // #FF9500
const TRAINING_COLOR = theme.colors.secondary; // #007AFF

type ComplianceEntry = {
  label: string;
  nutritionAdherence: number;
  trainingAdherence: number;
};

type Props = {
  data: ComplianceEntry[];
};

export default function ComplianceBarsCard({ data }: Props) {
  if (data.length < 2) {
    return (
      <ChartCard
        title="Naleving"
        isEmpty
        emptyText="Minimaal 2 wekelijkse check-ins nodig"
      />
    );
  }

  const groups = data.map((entry) => ({
    label: entry.label,
    values: [
      { value: entry.nutritionAdherence, color: NUTRITION_COLOR, label: 'Voeding' },
      { value: entry.trainingAdherence, color: TRAINING_COLOR, label: 'Training' },
    ],
  }));

  return (
    <ChartCard title="Naleving">
      <BarChart groups={groups} maxValue={10} showLegend />
    </ChartCard>
  );
}
