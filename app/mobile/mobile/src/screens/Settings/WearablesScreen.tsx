import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../constants/theme';
import {
  useWearableConnections,
  useToggleConnection,
  useSyncHealth,
  useHealthSummary,
  useAvailableProvider,
} from '../../hooks/useHealthData';

export default function WearablesScreen({ navigation }: any) {
  const { data: provider } = useAvailableProvider();
  const { data: connections = [], isLoading: connectionsLoading } = useWearableConnections();
  const toggleConnection = useToggleConnection();
  const syncHealth = useSyncHealth();
  const { data: summary } = useHealthSummary();

  const appleConnected = connections.find((c) => c.provider === 'apple_health')?.isConnected || false;
  const googleConnected = connections.find((c) => c.provider === 'google_fit')?.isConnected || false;
  const lastSync = connections.find((c) => c.isConnected)?.lastSyncAt;

  const handleToggle = useCallback(
    (providerName: 'apple_health' | 'google_fit') => {
      if (!provider) {
        Alert.alert(
          'Niet beschikbaar',
          'Health integratie vereist een development build. Dit werkt niet in Expo Go.',
        );
        return;
      }

      toggleConnection.mutate(providerName, {
        onSuccess: (isNowConnected) => {
          if (isNowConnected) {
            Alert.alert('Gekoppeld', 'Je gezondheidsdata wordt nu gesynchroniseerd.');
            // Immediately sync
            syncHealth.mutate(7);
          } else {
            Alert.alert('Ontkoppeld', 'Synchronisatie is gestopt.');
          }
        },
        onError: () => {
          Alert.alert('Fout', 'Kon de koppeling niet wijzigen. Probeer het opnieuw.');
        },
      });
    },
    [provider, toggleConnection, syncHealth]
  );

  const handleManualSync = useCallback(() => {
    syncHealth.mutate(7, {
      onSuccess: (count) => {
        Alert.alert('Gesynchroniseerd', `${count} datapunten bijgewerkt.`);
      },
      onError: () => {
        Alert.alert('Fout', 'Synchronisatie mislukt.');
      },
    });
  }, [syncHealth]);

  const WearableItem = ({
    icon,
    name,
    description,
    enabled,
    onToggle,
    available,
  }: {
    icon: string;
    name: string;
    description: string;
    enabled: boolean;
    onToggle: () => void;
    available: boolean;
  }) => (
    <View style={styles.wearableItem}>
      <View style={[styles.wearableIcon, !available && { opacity: 0.4 }]}>
        <Ionicons name={icon as any} size={28} color={theme.colors.secondary} />
      </View>
      <View style={styles.wearableInfo}>
        <Text style={styles.wearableName}>{name}</Text>
        <Text style={styles.wearableDescription}>
          {available ? description : 'Vereist development build'}
        </Text>
      </View>
      <Switch
        value={enabled}
        onValueChange={onToggle}
        trackColor={{ false: theme.colors.border, true: theme.colors.success }}
        thumbColor="#fff"
        disabled={toggleConnection.isPending}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color={theme.colors.secondary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Wearables</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionTitle}>KOPPELINGEN</Text>

        <View style={styles.card}>
          {Platform.OS === 'ios' ? (
            <WearableItem
              icon="logo-apple"
              name="Apple Health"
              description={appleConnected ? 'Gekoppeld — data wordt gesynchroniseerd' : 'Synchroniseer je gezondheidsdata'}
              enabled={appleConnected}
              onToggle={() => handleToggle('apple_health')}
              available={provider === 'apple_health'}
            />
          ) : (
            <WearableItem
              icon="fitness"
              name="Google Fit"
              description={googleConnected ? 'Gekoppeld — data wordt gesynchroniseerd' : 'Koppel je activiteiten en stappen'}
              enabled={googleConnected}
              onToggle={() => handleToggle('google_fit')}
              available={provider === 'google_fit'}
            />
          )}
        </View>

        {/* Sync button */}
        {(appleConnected || googleConnected) && (
          <>
            <TouchableOpacity
              style={styles.syncButton}
              onPress={handleManualSync}
              disabled={syncHealth.isPending}
              activeOpacity={0.7}
            >
              {syncHealth.isPending ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Ionicons name="sync" size={18} color="#fff" />
              )}
              <Text style={styles.syncButtonText}>
                {syncHealth.isPending ? 'Synchroniseren...' : 'Nu synchroniseren'}
              </Text>
            </TouchableOpacity>

            {lastSync && (
              <Text style={styles.lastSyncText}>
                Laatst gesynchroniseerd:{' '}
                {new Date(lastSync).toLocaleString('nl-NL', {
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            )}
          </>
        )}

        {/* Health summary */}
        {summary && (summary.steps > 0 || summary.sleepHours > 0) && (
          <>
            <Text style={[styles.sectionTitle, { marginTop: 24 }]}>VANDAAG</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Ionicons name="footsteps" size={24} color={theme.colors.secondary} />
                <Text style={styles.statValue}>
                  {summary.steps > 0 ? summary.steps.toLocaleString('nl-NL') : '—'}
                </Text>
                <Text style={styles.statLabel}>Stappen</Text>
              </View>
              <View style={styles.statCard}>
                <Ionicons name="moon" size={24} color="#8B5CF6" />
                <Text style={styles.statValue}>
                  {summary.sleepHours > 0 ? `${summary.sleepHours}u` : '—'}
                </Text>
                <Text style={styles.statLabel}>Slaap</Text>
              </View>
              <View style={styles.statCard}>
                <Ionicons name="heart" size={24} color={theme.colors.error} />
                <Text style={styles.statValue}>
                  {summary.heartRate > 0 ? `${summary.heartRate}` : '—'}
                </Text>
                <Text style={styles.statLabel}>Hartslag</Text>
              </View>
              <View style={styles.statCard}>
                <Ionicons name="flame" size={24} color={theme.colors.warning} />
                <Text style={styles.statValue}>
                  {summary.activeCalories > 0 ? `${summary.activeCalories}` : '—'}
                </Text>
                <Text style={styles.statLabel}>Actieve kcal</Text>
              </View>
            </View>
          </>
        )}

        {/* Info card */}
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={24} color={theme.colors.secondary} />
          <Text style={styles.infoText}>
            {provider
              ? 'Koppel je wearable om automatisch je stappen, slaap, hartslag en calorieën te synchroniseren met Evotion.'
              : 'Health integratie vereist een Expo development build. In Expo Go zijn de toggles uitgeschakeld. De data wordt alsnog opgeslagen in je profiel.'}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    width: 40,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: theme.colors.text,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textTertiary,
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  wearableItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  wearableIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E5F0FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  wearableInfo: {
    flex: 1,
  },
  wearableName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 2,
  },
  wearableDescription: {
    fontSize: 13,
    color: theme.colors.textTertiary,
  },
  syncButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
    marginBottom: 8,
  },
  syncButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  lastSyncText: {
    textAlign: 'center',
    fontSize: 12,
    color: theme.colors.textTertiary,
    marginBottom: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    width: '47%',
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.textTertiary,
  },
  infoCard: {
    backgroundColor: '#E5F0FF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.text,
    lineHeight: 20,
    marginLeft: 12,
  },
});
