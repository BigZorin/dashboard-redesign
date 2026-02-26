import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../constants/theme';

export default function PrivacyScreen({ navigation }: any) {
  const MenuItem = ({ icon, title, onPress }: any) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={styles.menuIconContainer}>
        <Ionicons name={icon} size={24} color={theme.colors.primary} />
      </View>
      <Text style={styles.menuTitle}>{title}</Text>
      <Ionicons name="chevron-forward" size={20} color={theme.colors.textTertiary} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy & Beveiliging</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.sectionTitle}>GEGEVENS</Text>
        <View style={styles.card}>
          <MenuItem
            icon="download"
            title="Download mijn gegevens"
            onPress={() => {}}
          />
          <View style={styles.divider} />
          <MenuItem
            icon="trash"
            title="Verwijder mijn account"
            onPress={() => {}}
          />
        </View>

        <Text style={styles.sectionTitle}>DOCUMENTEN</Text>
        <View style={styles.card}>
          <MenuItem
            icon="document-text"
            title="Privacybeleid"
            onPress={() => Linking.openURL('https://evotion.nl/privacy')}
          />
          <View style={styles.divider} />
          <MenuItem
            icon="shield-checkmark"
            title="Algemene voorwaarden"
            onPress={() => Linking.openURL('https://evotion.nl/terms')}
          />
        </View>

        <View style={styles.infoCard}>
          <Ionicons name="lock-closed" size={24} color={theme.colors.success} />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Jouw privacy is belangrijk</Text>
            <Text style={styles.infoText}>
              We gebruiken je gegevens alleen om je de best mogelijke ervaring te bieden. Je data wordt veilig opgeslagen en nooit gedeeld zonder jouw toestemming.
            </Text>
          </View>
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
    backgroundColor: theme.colors.headerDark,
  },
  backButton: {
    width: 40,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
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
    marginTop: 8,
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
    ...theme.shadows.md,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
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
  menuTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.borderLight,
    marginLeft: 68,
  },
  infoCard: {
    backgroundColor: `${theme.colors.success}15`,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 8,
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
});
