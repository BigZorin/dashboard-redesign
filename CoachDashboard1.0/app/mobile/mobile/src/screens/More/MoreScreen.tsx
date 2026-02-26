import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../../lib/supabase';
import { useUser } from '../../hooks/useUser';
import { useUnreadCount } from '../../hooks/useMessages';
import { theme } from '../../constants/theme';
import { Skeleton, SkeletonListItem } from '../../components/Skeleton';
import ScreenHeader from '../../components/ScreenHeader';

// ============================================================
// TYPES
// ============================================================
export interface MoreUserData {
  profile?: {
    first_name?: string;
    last_name?: string;
    avatar_url?: string;
  };
  email?: string;
}

export interface MoreScreenProps {
  loading?: boolean;
  userData?: MoreUserData;
  unreadCount?: number;
  onLogout?: () => void;
}

// ============================================================
// DEFAULT MOCK DATA
// ============================================================
const defaultUserData: MoreUserData = {
  profile: { first_name: 'Jelle', last_name: 'de Vries', avatar_url: undefined },
  email: 'jelle@evotion.nl',
};

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function MoreScreen(props: MoreScreenProps) {
  const navigation = useNavigation();

  const { data: hookUserData } = useUser();
  const { data: hookUnreadCount } = useUnreadCount();

  const loading = props.loading ?? false;
  const userData = props.userData ?? hookUserData ?? defaultUserData;
  const unreadCount = props.unreadCount ?? hookUnreadCount ?? 0;

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

  const MenuItem = ({ icon, title, subtitle, onPress, badge, iconColor }: any) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.6}>
      <View style={[styles.menuIconContainer, iconColor && { backgroundColor: iconColor + '15' }]}>
        <Ionicons name={icon} size={22} color={iconColor || theme.colors.primary} />
      </View>
      <View style={styles.menuContent}>
        <Text style={styles.menuTitle}>{title}</Text>
        {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
      </View>
      {badge > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge > 99 ? '99+' : badge}</Text>
        </View>
      )}
      <Ionicons name="chevron-forward" size={18} color={theme.colors.textTertiary} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScreenHeader
        title={loading ? 'Meer' : `${firstName} ${lastName}`}
        subtitle={loading ? '' : userData?.email}
        avatarUrl={userData?.profile?.avatar_url}
        avatarFallback={loading ? '' : initials}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Berichten sectie */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Berichten</Text>
          <View style={styles.card}>
            {loading ? (
              <SkeletonListItem />
            ) : (
              <MenuItem
                icon="chatbubbles"
                title="Berichten"
                subtitle="Chat met je coach"
                badge={unreadCount || 0}
                iconColor={theme.colors.primary}
                onPress={() => (navigation as any).navigate('ChatList')}
              />
            )}
          </View>
        </View>

        {/* Gezondheid sectie */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Gezondheid</Text>
          <View style={styles.card}>
            {loading ? (
              <>
                <SkeletonListItem />
                <SkeletonListItem />
              </>
            ) : (
              <>
                <MenuItem
                  icon="body"
                  title="Voortgang"
                  subtitle="Gewicht, foto's & metingen"
                  iconColor={theme.colors.success}
                  onPress={() => (navigation as any).navigate('ProgressDetail')}
                />
                <MenuItem
                  icon="checkmark-done-circle"
                  title="Gewoontes"
                  subtitle="Dagelijkse habits bijhouden"
                  iconColor={theme.colors.accent}
                  onPress={() => (navigation as any).navigate('Habits')}
                />
              </>
            )}
          </View>
        </View>

        {/* Instellingen sectie */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Instellingen</Text>
          <View style={styles.card}>
            {loading ? (
              <>
                <SkeletonListItem />
                <SkeletonListItem />
                <SkeletonListItem />
                <SkeletonListItem />
              </>
            ) : (
              <>
                <MenuItem
                  icon="person-circle"
                  title="Profiel bewerken"
                  subtitle="Pas je gegevens aan"
                  iconColor={theme.colors.primary}
                  onPress={() => (navigation as any).navigate('EditProfile')}
                />
                <MenuItem
                  icon="fitness"
                  title="Wearables"
                  subtitle="Koppel je smartwatch of tracker"
                  iconColor="#8B5CF6"
                  onPress={() => (navigation as any).navigate('Wearables')}
                />
                <MenuItem
                  icon="notifications"
                  title="Notificaties"
                  subtitle="Beheer je meldingen"
                  iconColor={theme.colors.accent}
                  onPress={() => (navigation as any).navigate('Notifications')}
                />
                <MenuItem
                  icon="lock-closed"
                  title="Privacy & Beveiliging"
                  iconColor={theme.colors.error}
                  onPress={() => (navigation as any).navigate('Privacy')}
                />
              </>
            )}
          </View>
        </View>

        {/* Uitloggen */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.7}>
          <Ionicons name="log-out-outline" size={20} color={theme.colors.error} />
          <Text style={styles.logoutText}>Uitloggen</Text>
        </TouchableOpacity>

        {/* Versie info */}
        <Text style={styles.versionText}>Evotion v1.0.0</Text>
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
    paddingBottom: 100,
  },
  section: {
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.textTertiary,
    textTransform: 'uppercase',
    marginBottom: 8,
    letterSpacing: 0.8,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    ...theme.shadows.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: 1,
  },
  menuSubtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textTertiary,
  },
  badge: {
    backgroundColor: theme.colors.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    marginRight: 8,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
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
    marginHorizontal: 20,
    marginTop: 8,
  },
  logoutText: {
    color: theme.colors.error,
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
  },
  versionText: {
    textAlign: 'center',
    fontSize: theme.fontSize.xs,
    color: theme.colors.textTertiary,
    marginTop: 20,
    marginBottom: 8,
  },
});
