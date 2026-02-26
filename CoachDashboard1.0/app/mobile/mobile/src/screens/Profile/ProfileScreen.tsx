import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Image, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import { useUser } from '../../hooks/useUser';
import { theme } from '../../constants/theme';
import { Skeleton } from '../../components/Skeleton';
import ScreenHeader from '../../components/ScreenHeader';

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

  const firstName = userData?.profile?.first_name || '';
  const lastName = userData?.profile?.last_name || '';
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || 'JD';

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
    <View style={styles.container}>
      <ScreenHeader
        title={loading ? 'Profiel' : `${firstName} ${lastName}`}
        subtitle={loading ? '' : userData?.email}
        avatarUrl={userData?.profile?.avatar_url}
        avatarFallback={loading ? '' : initials}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          {loading ? (
            <>
              <Skeleton height={18} width="60%" style={{ marginBottom: 10 }} />
              <Skeleton height={14} width="100%" style={{ marginBottom: 4 }} />
              <Skeleton height={14} width="80%" />
            </>
          ) : (
            <>
              <View style={styles.cardHeader}>
                <Ionicons name="information-circle-outline" size={20} color={theme.colors.primary} />
                <Text style={styles.cardTitle}>Account info</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Naam</Text>
                <Text style={styles.infoValue}>{firstName} {lastName}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>E-mail</Text>
                <Text style={styles.infoValue}>{userData?.email}</Text>
              </View>
              <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
                <Text style={styles.infoLabel}>Rol</Text>
                <View style={styles.roleBadge}>
                  <Text style={styles.roleBadgeText}>{userData?.role || 'client'}</Text>
                </View>
              </View>
            </>
          )}
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="settings-outline" size={20} color={theme.colors.primary} />
            <Text style={styles.cardTitle}>Instellingen</Text>
          </View>
          <Text style={styles.cardText}>
            Profiel bewerken en instellingen komen binnenkort beschikbaar.
          </Text>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.7}>
          <Ionicons name="log-out-outline" size={20} color={theme.colors.error} />
          <Text style={styles.logoutText}>Uitloggen</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    ...theme.shadows.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  infoLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  infoValue: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  roleBadge: {
    backgroundColor: theme.colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: theme.borderRadius.sm,
  },
  roleBadgeText: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.primary,
    textTransform: 'uppercase',
  },
  cardText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.error + '30',
    borderRadius: theme.borderRadius.lg,
    padding: 16,
    marginTop: 8,
  },
  logoutText: {
    color: theme.colors.error,
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
  },
});
