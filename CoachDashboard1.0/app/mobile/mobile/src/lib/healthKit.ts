/**
 * Apple HealthKit wrapper.
 *
 * To enable: install react-native-health and create an EAS development build.
 * Until then, all methods return empty/null (safe for Expo Go).
 *
 * Install: npx expo install react-native-health
 * Then uncomment the native import below.
 */
import { Platform } from 'react-native';

// TODO: Uncomment when react-native-health is installed (EAS dev build required)
// import AppleHealthKit from 'react-native-health';
const AppleHealthKit: any = null;

export interface HealthSample {
  date: string;
  value: number;
}

export function isHealthKitAvailable(): boolean {
  return Platform.OS === 'ios' && AppleHealthKit != null;
}

export async function requestHealthKitPermissions(): Promise<boolean> {
  if (!AppleHealthKit) return false;

  return new Promise((resolve) => {
    AppleHealthKit.initHealthKit(
      {
        permissions: {
          read: [
            'StepCount',
            'SleepAnalysis',
            'HeartRate',
            'ActiveEnergyBurned',
            'RestingHeartRate',
            'DistanceWalkingRunning',
            'FlightsClimbed',
          ],
          write: [],
        },
      },
      (err: any) => resolve(!err)
    );
  });
}

export async function getSteps(_startDate: string, _endDate: string): Promise<HealthSample[]> {
  return [];
}

export async function getSleepHours(_startDate: string, _endDate: string): Promise<HealthSample[]> {
  return [];
}

export async function getHeartRate(_startDate: string, _endDate: string): Promise<HealthSample[]> {
  return [];
}

export async function getActiveCalories(_startDate: string, _endDate: string): Promise<HealthSample[]> {
  return [];
}
