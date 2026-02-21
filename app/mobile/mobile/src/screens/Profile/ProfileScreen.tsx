import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import { useUser } from '../../hooks/useUser';
import { theme } from '../../constants/theme';
import { Skeleton } from '../../components/Skeleton';

// ============================================================
// TYPES
// ============================================================
export interface ProfileUserData {
  profile?: {
    first_name?: string;
    last_name?: string;
    avatar_url?: string;
  };
  email?: string;
  role?: string;
}

export interface ProfileScreenProps {
  loading?: boolean;
  userData?: ProfileUserData;
  onLogout?: () => void;
}

// ============================================================
// DEFAULT MOCK DATA
// ============================================================
const defaultUserData: ProfileUserData = {
  profile: { first_name: 'Jelle', last_name: 'de Vries', avatar_url: undefined },
  email: 'jelle@evotion.nl',
  role: 'client',
};

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function ProfileScreen(props: ProfileScreenProps) {
  const { data: hookUserData } = useUser();

  const loading = props.loading ?? false;
  const userData = props.userData ?? hookUserData ?? defaultUserData;

  const handleLogout = async () => {
    Alert.alert(
      'Uitloggen',
      'Weet je zeker dat je wilt uitloggen?',
      [
        { text: 'Annuleren', style: 'cancel' },
        {
          text: 'Uitloggen',
          style: 'destructive',
          onPress: async () => {
            if (props.onLogout) {
              props.onLogout();
            } else {
              await supabase.auth.signOut();
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.headerBanner}>
        <Text style={styles.title}>Profiel</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.card}>
          {loading ? (
            <View style={styles.profileHeader}>
              <Skeleton width={64} height={64} borderRadius={32} />
              <View style={{ flex: 1, marginLeft: 16 }}>
                <Skeleton height={18} width="55%" style={{ marginBottom: 6 }} />
                <Skeleton height={14} width="70%" style={{ marginBottom: 4 }} />
                <Skeleton height={12} width="30%" />
              </View>
            </View>
          ) : (
            <View style={styles.profileHeader}>
              {userData?.profile?.avatar_url ? (
                <Image source={{ uri: userData.profile.avatar_url }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Ionicons name="person" size={32} color={theme.colors.primary} />
                </View>
              )}
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>
                  {userData?.profile?.first_name} {userData?.profile?.last_name}
                </Text>
                <Text style={styles.profileEmail}>{userData?.email}</Text>
                <Text style={styles.profileRole}>{userData?.role}</Text>
              </View>
            </View>
          )}
        </View>

        <View style={styles.card}>
          {loading ? (
            <>
              <Skeleton height={18} width="60%" style={{ marginBottom: 10 }} />
              <Skeleton height={14} width="100%" style={{ marginBottom: 4 }} />
              <Skeleton height={14} width="80%" />
            </>
          ) : (
            <>
              <Text style={styles.cardTitle}>Account instellingen</Text>
              <Text style={styles.cardText}>
                Profiel bewerken en instellingen komen binnenkort beschikbaar.
              </Text>
            </>
          )}
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Uitloggen</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  headerBanner: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
    backgroundColor: theme.colors.headerDark,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    ...theme.shadows.md,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginRight: 16,
  },
  avatarPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
  profileRole: {
    fontSize: 12,
    color: theme.colors.textTertiary,
    textTransform: 'uppercase',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    color: theme.colors.text,
  },
  cardText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  logoutButton: {
    backgroundColor: theme.colors.error,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 'auto',
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
