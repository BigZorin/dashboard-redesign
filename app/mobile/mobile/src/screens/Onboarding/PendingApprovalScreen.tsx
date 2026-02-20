import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../constants/theme';

type Props = {
  status: 'pending' | 'rejected';
  rejectionReason?: string | null;
  onLogout: () => void;
};

export default function PendingApprovalScreen({
  status,
  rejectionReason,
  onLogout,
}: Props) {
  const isRejected = status === 'rejected';
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Gradient header */}
      <LinearGradient
        colors={theme.gradients.header}
        style={[styles.header, { paddingTop: insets.top + 24 }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Image
          source={require('../../../assets/images/evotion-logo-white.png')}
          style={styles.headerLogo}
          resizeMode="contain"
        />
      </LinearGradient>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.contentCard}>
          <View
            style={[
              styles.iconCircle,
              isRejected ? styles.iconCircleRejected : styles.iconCirclePending,
            ]}
          >
            <Ionicons
              name={isRejected ? 'close-circle' : 'hourglass'}
              size={44}
              color={isRejected ? theme.colors.error : theme.colors.primary}
            />
          </View>

          <Text style={styles.title}>
            {isRejected ? 'Aanvraag afgewezen' : 'Wacht op goedkeuring'}
          </Text>

          <Text style={styles.subtitle}>
            {isRejected
              ? 'Je aanvraag is helaas afgewezen door je coach.'
              : 'Je account is aangemaakt en je intake is ontvangen. Je coach beoordeelt je aanvraag zo snel mogelijk.'}
          </Text>

          {isRejected && rejectionReason && (
            <View style={styles.reasonCard}>
              <Text style={styles.reasonLabel}>Reden</Text>
              <Text style={styles.reasonText}>{rejectionReason}</Text>
            </View>
          )}

          {!isRejected && (
            <View style={styles.infoCard}>
              <Ionicons name="information-circle" size={20} color={theme.colors.primary} />
              <Text style={styles.infoText}>
                Je ontvangt automatisch toegang zodra je bent goedgekeurd. Dit
                scherm wordt dan automatisch bijgewerkt.
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Footer */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
          <Ionicons name="log-out-outline" size={18} color={theme.colors.textSecondary} />
          <Text style={styles.logoutText}>Uitloggen</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    paddingBottom: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerLogo: {
    height: 32,
    width: 140,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.xxl,
    marginTop: -24,
  },
  contentCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xxl,
    padding: 32,
    alignItems: 'center',
    ...theme.shadow.md,
  },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  iconCirclePending: {
    backgroundColor: theme.colors.primaryLight,
  },
  iconCircleRejected: {
    backgroundColor: `${theme.colors.error}12`,
  },
  title: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  reasonCard: {
    backgroundColor: `${theme.colors.error}08`,
    borderRadius: theme.borderRadius.md,
    padding: 16,
    width: '100%',
    borderWidth: 1,
    borderColor: `${theme.colors.error}20`,
  },
  reasonLabel: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.error,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  reasonText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
    lineHeight: 20,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: theme.colors.primaryLight,
    borderRadius: theme.borderRadius.md,
    padding: 14,
    width: '100%',
  },
  infoText: {
    flex: 1,
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    lineHeight: 18,
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 16,
    alignItems: 'center',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.surface,
    ...theme.shadow.sm,
  },
  logoutText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.textSecondary,
  },
});
