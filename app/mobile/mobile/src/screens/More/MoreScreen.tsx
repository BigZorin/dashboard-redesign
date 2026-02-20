import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../../lib/supabase';
import { useUser } from '../../hooks/useUser';
import { useUnreadCount } from '../../hooks/useMessages';
import { theme } from '../../constants/theme';

export default function MoreScreen() {
  const navigation = useNavigation();
  const { data: userData } = useUser();
  const { data: unreadCount } = useUnreadCount();

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
            await supabase.auth.signOut();
          },
        },
      ]
    );
  };

  const MenuItem = ({ icon, title, subtitle, onPress, badge }: any) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={styles.menuIconContainer}>
        <Ionicons name={icon} size={24} color={theme.colors.primary} />
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
      <Ionicons name="chevron-forward" size={20} color={theme.colors.textTertiary} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.headerBanner}>
        <Text style={styles.title}>Meer</Text>
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Profiel sectie */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profiel</Text>
          <View style={styles.card}>
            <View style={styles.profileHeader}>
              {userData?.profile?.avatar_url ? (
                <Image source={{ uri: userData.profile.avatar_url }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Ionicons name="person" size={32} color={theme.colors.secondary} />
                </View>
              )}
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>
                  {userData?.profile?.first_name} {userData?.profile?.last_name}
                </Text>
                <Text style={styles.profileEmail}>{userData?.email}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Berichten sectie */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Berichten</Text>
          <View style={styles.card}>
            <MenuItem
              icon="chatbubbles"
              title="Berichten"
              subtitle="Chat met je coach"
              badge={unreadCount || 0}
              onPress={() => (navigation as any).navigate('ChatList')}
            />
          </View>
        </View>

        {/* Instellingen sectie */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Instellingen</Text>
          <View style={styles.card}>
            <MenuItem
              icon="person-circle"
              title="Profiel bewerken"
              subtitle="Pas je gegevens aan"
              onPress={() => (navigation as any).navigate('EditProfile')}
            />
            <MenuItem
              icon="fitness"
              title="Wearables"
              subtitle="Koppel je smartwatch of fitness tracker"
              onPress={() => (navigation as any).navigate('Wearables')}
            />
            <MenuItem
              icon="notifications"
              title="Notificaties"
              subtitle="Beheer je meldingen"
              onPress={() => (navigation as any).navigate('Notifications')}
            />
            <MenuItem
              icon="lock-closed"
              title="Privacy & Beveiliging"
              onPress={() => (navigation as any).navigate('Privacy')}
            />
          </View>
        </View>

        {/* Uitloggen */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Uitloggen</Text>
        </TouchableOpacity>

        <View style={styles.bottomPadding} />
      </ScrollView>
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
  section: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textTertiary,
    textTransform: 'uppercase',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    overflow: 'hidden',
    ...theme.shadows.md,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
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
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.disabled,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text,
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 13,
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
    fontSize: 11,
    fontWeight: '700',
  },
  logoutButton: {
    backgroundColor: theme.colors.error,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 8,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomPadding: {
    height: 20,
  },
});
