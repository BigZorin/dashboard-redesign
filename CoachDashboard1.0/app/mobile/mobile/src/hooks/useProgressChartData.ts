import { useMemo } from 'react';
import { useCheckInHistory, CheckInRecord } from './useCheckIn';
import { useDailyCheckInHistory, DailyCheckInRecord } from './useDailyCheckIn';

export type WeightPoint = {
  weight: number;
  label: string;
  date: string;
};

export type MetricItem = {
  label: string;
  currentValue: number | null;
  data: number[];
  color: string;
  maxValue: number;
  icon: string;
};

export function useProgressChartData() {
  const { data: dailyHistory = [] } = useDailyCheckInHistory(30);
  const { data: weeklyHistory = [] } = useCheckInHistory();

  return useMemo(() => {
    // 1. Weight — prefer daily if 2+ entries, fallback to weekly
    const dailyWeights = dailyHistory.filter(
      (c: DailyCheckInRecord) => c.weight != null && c.weight > 0,
    );
    const weeklyWeights = weeklyHistory.filter(
      (c: CheckInRecord) => c.weight != null && c.weight > 0,
    );
    const useDailyForWeight = dailyWeights.length >= 2;

    const weightData: WeightPoint[] = useDailyForWeight
      ? dailyWeights.map((c) => ({
          weight: c.weight!,
          label: new Date(c.check_in_date).toLocaleDateString('nl-NL', {
            day: 'numeric',
            month: 'short',
          }),
          date: c.check_in_date,
        }))
      : weeklyWeights.map((c) => ({
          weight: c.weight!,
          label: `W${c.week_number}`,
          date: c.created_at,
        }));

    // 2. Mood & Sleep — from daily check-ins (1-5 scale)
    const moodData = dailyHistory
      .filter((c: DailyCheckInRecord) => c.mood != null)
      .map((c) => ({
        value: c.mood!,
        label: new Date(c.check_in_date).toLocaleDateString('nl-NL', {
          day: 'numeric',
          month: 'short',
        }),
      }));

    const sleepData = dailyHistory
      .filter((c: DailyCheckInRecord) => c.sleep_quality != null)
      .map((c) => ({
        value: c.sleep_quality!,
        label: new Date(c.check_in_date).toLocaleDateString('nl-NL', {
          day: 'numeric',
          month: 'short',
        }),
      }));

    // 3. Compliance — from weekly check-ins (1-10 scale)
    const complianceData = weeklyHistory
      .filter(
        (c: CheckInRecord) =>
          c.nutrition_adherence != null || c.training_adherence != null,
      )
      .map((c) => ({
        label: `W${c.week_number}`,
        nutritionAdherence: c.nutrition_adherence ?? 0,
        trainingAdherence: c.training_adherence ?? 0,
      }));

    // 4. Metrics overview — last values + history from weekly
    const latestWeekly =
      weeklyHistory.length > 0
        ? weeklyHistory[weeklyHistory.length - 1]
        : null;

    const metrics: MetricItem[] = [
      {
        label: 'Energie',
        currentValue: latestWeekly?.energy_level ?? null,
        data: weeklyHistory.map((c: CheckInRecord) => c.energy_level ?? 0),
        color: '#FF9500',
        maxValue: 10,
        icon: 'flash',
      },
      {
        label: 'Stress',
        currentValue: latestWeekly?.stress_level ?? null,
        data: weeklyHistory.map((c: CheckInRecord) => c.stress_level ?? 0),
        color: '#ff3b30',
        maxValue: 10,
        icon: 'pulse',
      },
      {
        label: 'Voeding',
        currentValue: latestWeekly?.nutrition_adherence ?? null,
        data: weeklyHistory.map(
          (c: CheckInRecord) => c.nutrition_adherence ?? 0,
        ),
        color: '#FF9500',
        maxValue: 10,
        icon: 'nutrition',
      },
      {
        label: 'Training',
        currentValue: latestWeekly?.training_adherence ?? null,
        data: weeklyHistory.map(
          (c: CheckInRecord) => c.training_adherence ?? 0,
        ),
        color: '#007AFF',
        maxValue: 10,
        icon: 'barbell',
      },
    ];

    // 5. Check-in streak — consecutive days from today going backwards
    let checkInStreak = 0;
    if (dailyHistory.length > 0) {
      const checkInDates = new Set(
        dailyHistory.map((c: DailyCheckInRecord) => c.check_in_date),
      );
      const now = new Date();
      // Start from today and go backwards
      for (let i = 0; i < 60; i++) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        if (checkInDates.has(dateStr)) {
          checkInStreak++;
        } else if (i === 0) {
          // Today not done yet, don't break - check yesterday
          continue;
        } else {
          break;
        }
      }
    }

    return {
      weightData,
      hasWeightData: weightData.length >= 2,
      moodData,
      sleepData,
      hasMoodSleepData: moodData.length >= 2 || sleepData.length >= 2,
      complianceData,
      hasComplianceData: complianceData.length >= 2,
      metrics,
      hasMetricsData: weeklyHistory.length >= 1,
      checkInStreak,
    };
  }, [dailyHistory, weeklyHistory]);
}
