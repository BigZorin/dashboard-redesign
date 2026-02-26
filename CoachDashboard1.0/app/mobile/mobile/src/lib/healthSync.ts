/**
 * Unified health sync manager.
 * Coordinates syncing from Apple Health / Google Fit → Supabase.
 */
import { Platform } from 'react-native';
import { supabase } from './supabase';
import * as HealthKit from './healthKit';
import * as GoogleFitLib from './googleFit';

export type HealthProvider = 'apple_health' | 'google_fit';
export type HealthDataType = 'steps' | 'sleep_hours' | 'heart_rate_avg' | 'active_calories';

export interface HealthDataRecord {
  id: string;
  userId: string;
  date: string;
  dataType: HealthDataType;
  value: number;
  source: HealthProvider;
  syncedAt: string;
}

export interface WearableConnection {
  id: string;
  userId: string;
  provider: HealthProvider;
  isConnected: boolean;
  lastSyncAt: string | null;
}

function transformRecord(raw: any): HealthDataRecord {
  return {
    id: raw.id,
    userId: raw.user_id,
    date: raw.date,
    dataType: raw.data_type,
    value: raw.value,
    source: raw.source,
    syncedAt: raw.synced_at,
  };
}

function transformConnection(raw: any): WearableConnection {
  return {
    id: raw.id,
    userId: raw.user_id,
    provider: raw.provider,
    isConnected: raw.is_connected,
    lastSyncAt: raw.last_sync_at,
  };
}

/**
 * Check which health provider is available on this platform.
 */
export function getAvailableProvider(): HealthProvider | null {
  if (Platform.OS === 'ios' && HealthKit.isHealthKitAvailable()) {
    return 'apple_health';
  }
  if (Platform.OS === 'android' && GoogleFitLib.isGoogleFitAvailable()) {
    return 'google_fit';
  }
  return null;
}

/**
 * Request health permissions.
 */
export async function requestPermissions(provider: HealthProvider): Promise<boolean> {
  if (provider === 'apple_health') {
    return HealthKit.requestHealthKitPermissions();
  }
  if (provider === 'google_fit') {
    return GoogleFitLib.authorizeGoogleFit();
  }
  return false;
}

/**
 * Get wearable connections from Supabase.
 */
export async function getConnections(): Promise<WearableConnection[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from('wearable_connections')
    .select('*')
    .eq('user_id', user.id);

  return (data || []).map(transformConnection);
}

/**
 * Connect or disconnect a provider.
 */
export async function toggleConnection(provider: HealthProvider): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  // Check current state
  const { data: existing } = await supabase
    .from('wearable_connections')
    .select('*')
    .eq('user_id', user.id)
    .eq('provider', provider)
    .maybeSingle();

  if (existing?.is_connected) {
    // Disconnect
    await supabase
      .from('wearable_connections')
      .update({ is_connected: false, updated_at: new Date().toISOString() })
      .eq('id', existing.id);
    return false;
  }

  // Connect — request permissions first
  const granted = await requestPermissions(provider);
  if (!granted) return false;

  await supabase
    .from('wearable_connections')
    .upsert({
      user_id: user.id,
      provider,
      is_connected: true,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id,provider' });

  return true;
}

/**
 * Sync health data from provider → Supabase.
 * Syncs the last 7 days by default.
 */
export async function syncHealthData(days: number = 7): Promise<number> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return 0;

  // Check which providers are connected
  const connections = await getConnections();
  const activeConnections = connections.filter((c) => c.isConnected);

  if (activeConnections.length === 0) return 0;

  const endDate = new Date().toISOString();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  const startDateStr = startDate.toISOString();

  let totalSynced = 0;

  for (const connection of activeConnections) {
    const records: Array<{ date: string; data_type: string; value: number; source: string }> = [];

    if (connection.provider === 'apple_health') {
      const [steps, sleep, heartRate, calories] = await Promise.all([
        HealthKit.getSteps(startDateStr, endDate),
        HealthKit.getSleepHours(startDateStr, endDate),
        HealthKit.getHeartRate(startDateStr, endDate),
        HealthKit.getActiveCalories(startDateStr, endDate),
      ]);

      for (const s of steps) records.push({ date: s.date, data_type: 'steps', value: s.value, source: 'apple_health' });
      for (const s of sleep) records.push({ date: s.date, data_type: 'sleep_hours', value: s.value, source: 'apple_health' });
      for (const s of heartRate) records.push({ date: s.date, data_type: 'heart_rate_avg', value: s.value, source: 'apple_health' });
      for (const s of calories) records.push({ date: s.date, data_type: 'active_calories', value: s.value, source: 'apple_health' });
    }

    if (connection.provider === 'google_fit') {
      const [steps, sleep, heartRate, calories] = await Promise.all([
        GoogleFitLib.getSteps(startDateStr, endDate),
        GoogleFitLib.getSleepHours(startDateStr, endDate),
        GoogleFitLib.getHeartRate(startDateStr, endDate),
        GoogleFitLib.getActiveCalories(startDateStr, endDate),
      ]);

      for (const s of steps) records.push({ date: s.date, data_type: 'steps', value: s.value, source: 'google_fit' });
      for (const s of sleep) records.push({ date: s.date, data_type: 'sleep_hours', value: s.value, source: 'google_fit' });
      for (const s of heartRate) records.push({ date: s.date, data_type: 'heart_rate_avg', value: s.value, source: 'google_fit' });
      for (const s of calories) records.push({ date: s.date, data_type: 'active_calories', value: s.value, source: 'google_fit' });
    }

    // Upsert to Supabase
    if (records.length > 0) {
      const rows = records.map((r) => ({
        user_id: user.id,
        date: r.date,
        data_type: r.data_type,
        value: r.value,
        source: r.source,
        synced_at: new Date().toISOString(),
      }));

      const { error } = await supabase
        .from('health_data')
        .upsert(rows, { onConflict: 'user_id,date,data_type,source' });

      if (!error) totalSynced += rows.length;
    }

    // Update last sync timestamp
    await supabase
      .from('wearable_connections')
      .update({ last_sync_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .eq('provider', connection.provider);
  }

  return totalSynced;
}

/**
 * Fetch health data from Supabase.
 */
export async function fetchHealthData(
  dataType?: HealthDataType,
  days: number = 30
): Promise<HealthDataRecord[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  let query = supabase
    .from('health_data')
    .select('*')
    .eq('user_id', user.id)
    .gte('date', startDate.toISOString().split('T')[0])
    .order('date', { ascending: false });

  if (dataType) {
    query = query.eq('data_type', dataType);
  }

  const { data } = await query;
  return (data || []).map(transformRecord);
}

/**
 * Get today's health summary.
 */
export async function getTodayHealthSummary(): Promise<{
  steps: number;
  sleepHours: number;
  heartRate: number;
  activeCalories: number;
}> {
  const today = new Date().toISOString().split('T')[0];
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { steps: 0, sleepHours: 0, heartRate: 0, activeCalories: 0 };

  const { data } = await supabase
    .from('health_data')
    .select('data_type, value')
    .eq('user_id', user.id)
    .eq('date', today);

  const summary = { steps: 0, sleepHours: 0, heartRate: 0, activeCalories: 0 };
  for (const record of data || []) {
    switch (record.data_type) {
      case 'steps': summary.steps = record.value; break;
      case 'sleep_hours': summary.sleepHours = record.value; break;
      case 'heart_rate_avg': summary.heartRate = record.value; break;
      case 'active_calories': summary.activeCalories = record.value; break;
    }
  }

  return summary;
}
