import React from 'react';
import ChartCard from './ChartCard';
import LineChart, { DataPoint } from './LineChart';

const MOOD_COLOR = '#007AFF';
const SLEEP_COLOR = '#8B5CF6';

type Props = {
  moodData: DataPoint[];
  sleepData: DataPoint[];
};

export default function MoodSleepCard({ moodData, sleepData }: Props) {
  const hasData = moodData.length >= 2 || sleepData.length >= 2;

  if (!hasData) {
    return (
      <ChartCard
        title="Stemming & Slaap"
        isEmpty
        emptyText="Vul dagelijkse check-ins in om je stemming en slaap te zien"
      />
    );
  }

  const series = [];
  if (moodData.length >= 2) {
    series.push({ data: moodData, color: MOOD_COLOR, label: 'Stemming' });
  }
  if (sleepData.length >= 2) {
    series.push({ data: sleepData, color: SLEEP_COLOR, label: 'Slaap' });
  }

  return (
    <ChartCard title="Stemming & Slaap">
      <LineChart
        series={series}
        yDomain={[1, 5]}
        showAreaFill={false}
        showLegend={series.length > 1}
      />
    </ChartCard>
  );
}
