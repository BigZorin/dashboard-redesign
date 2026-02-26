/**
 * Google Fit wrapper.
 *
 * To enable: install react-native-google-fit and create an EAS development build.
 * Until then, all methods return empty/null (safe for Expo Go).
 *
 * Install: npx expo install react-native-google-fit
 * Then uncomment the native import below.
 */
import { Platform } from 'react-native';

// TODO: Uncomment when react-native-google-fit is installed (EAS dev build required)
// import GoogleFit from 'react-native-google-fit';
const GoogleFit: any = null;

export interface HealthSample {
  date: string;
  value: number;
}

export function isGoogleFitAvailable(): boolean {
  return Platform.OS === 'android' && GoogleFit != null;
}

export async function authorizeGoogleFit(): Promise<boolean> {
  return false;
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
