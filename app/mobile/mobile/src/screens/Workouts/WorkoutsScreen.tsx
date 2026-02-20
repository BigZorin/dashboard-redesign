import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import { useFocusEffect } from '@react-navigation/native';
import { useClientPrograms, programKeys } from '../../hooks/usePrograms';
import { theme } from '../../constants/theme';
import type { ClientProgram } from '../../lib/programApi';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function WorkoutsScreen({ navigation }: any) {
  const queryClient = useQueryClient();
  const { data: allPrograms = [], isLoading, isRefetching, refetch } = useClientPrograms();

  useFocusEffect(
    useCallback(() => {
      queryClient.invalidateQueries({ queryKey: programKeys.all });
    }, [queryClient])
  );

  const activePrograms = allPrograms.filter((p: ClientProgram) => p.status === 'active');
  const otherPrograms = allPrograms.filter((p: ClientProgram) => p.status !== 'active');

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Programma's laden...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={() => refetch()}
            tintColor={theme.colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Gradient Header */}
        <LinearGradient
          colors={theme.gradients.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <Text style={styles.headerTitle}>Trainingen</Text>
          <Text style={styles.headerSubtitle}>
            {activePrograms.length > 0
              ? `${activePrograms.length} actie${activePrograms.length === 1 ? 'f' : 've'} programma${activePrograms.length === 1 ? '' : "'s"}`
              : 'Geen actieve programma\'s'}
          </Text>
        </LinearGradient>

        {/* Active Programs */}
        <View style={styles.contentSection}>
          {activePrograms.length > 0 && (
            <Text style={styles.sectionLabel}>ACTIEF</Text>
          )}
          {activePrograms.map((program: ClientProgram) => (
            <TouchableOpacity
              key={program.id}
              style={styles.programCard}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('ProgramDetail', { assignmentId: program.id })}
            >
              <View style={styles.programBannerContainer}>
                {program.program.bannerUrl ? (
                  <Image
                    source={{ uri: program.program.bannerUrl }}
                    style={styles.programBannerImg}
                    resizeMode="cover"
                  />
                ) : (
                  <LinearGradient
                    colors={theme.gradients.primary}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.programBannerFallback}
                  >
                    <Ionicons name="barbell-outline" size={48} color="rgba(255,255,255,0.2)" />
                  </LinearGradient>
                )}
                {/* Gradient overlay at bottom */}
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.5)']}
                  style={styles.bannerOverlay}
                />
              </View>
              <View style={styles.programTitleBar}>
                <View style={styles.programTitleLeft}>
                  <View style={styles.activeDot} />
                  <Text style={styles.programName} numberOfLines={1}>
                    {program.program.name}
                  </Text>
                </View>
                <View style={styles.programArrow}>
                  <Ionicons name="chevron-forward" size={18} color={theme.colors.textTertiary} />
                </View>
              </View>
            </TouchableOpacity>
          ))}

          {/* Completed / Paused */}
          {otherPrograms.length > 0 && (
            <View style={styles.otherSection}>
              <Text style={styles.sectionLabel}>AFGEROND / GEPAUZEERD</Text>
              {otherPrograms.map((program: ClientProgram) => {
                const isPaused = program.status === 'paused';
                return (
                  <TouchableOpacity
                    key={program.id}
                    style={styles.otherCard}
                    activeOpacity={0.85}
                    onPress={() => navigation.navigate('ProgramDetail', { assignmentId: program.id })}
                  >
                    <View style={styles.otherBannerContainer}>
                      {program.program.bannerUrl ? (
                        <Image
                          source={{ uri: program.program.bannerUrl }}
                          style={[styles.programBannerImg, { opacity: 0.5 }]}
                          resizeMode="cover"
                        />
                      ) : (
                        <View style={styles.otherBannerFallback}>
                          <Ionicons name="barbell-outline" size={32} color="rgba(108,58,237,0.15)" />
                        </View>
                      )}
                    </View>
                    <View style={styles.otherInfoCol}>
                      <Text style={styles.otherName} numberOfLines={1}>
                        {program.program.name}
                      </Text>
                      <View style={[styles.statusPill, isPaused ? styles.statusPillPaused : styles.statusPillCompleted]}>
                        <Ionicons
                          name={isPaused ? 'pause-circle' : 'checkmark-circle'}
                          size={12}
                          color={isPaused ? '#92400e' : '#065f46'}
                        />
                        <Text style={[styles.statusPillText, isPaused ? styles.statusTextPaused : styles.statusTextCompleted]}>
                          {isPaused ? 'Gepauzeerd' : 'Voltooid'}
                        </Text>
                      </View>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={theme.colors.textTertiary} />
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {/* Empty state */}
          {allPrograms.length === 0 && (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconCircle}>
                <Ionicons name="barbell-outline" size={48} color={theme.colors.primaryMuted} />
              </View>
              <Text style={styles.emptyTitle}>Geen programma's</Text>
              <Text style={styles.emptyText}>
                Je coach heeft nog geen trainingsprogramma's{'\n'}aan je toegewezen.
              </Text>
            </View>
          )}
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
  scrollContent: {
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
  },
  // Gradient Header
  headerGradient: {
    paddingTop: theme.spacing.xxl,
    paddingBottom: theme.spacing.xxxl,
    paddingHorizontal: theme.spacing.xl,
  },
  headerTitle: {
    fontSize: theme.fontSize.hero,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textOnPrimary,
    marginBottom: theme.spacing.xs,
  },
  headerSubtitle: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.medium,
    color: 'rgba(255,255,255,0.7)',
  },
  // Content
  contentSection: {
    marginTop: -theme.spacing.lg,
    paddingHorizontal: theme.spacing.xl,
  },
  sectionLabel: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textTertiary,
    letterSpacing: 1,
    marginBottom: theme.spacing.md,
    marginTop: theme.spacing.xl,
  },
  // Active program card
  programCard: {
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    marginBottom: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    ...theme.shadows.lg,
  },
  programBannerContainer: {
    height: 180,
    position: 'relative',
  },
  programBannerImg: {
    width: '100%',
    height: '100%',
  },
  programBannerFallback: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
  },
  programTitleBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md + 2,
  },
  programTitleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 10,
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.success,
  },
  programName: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    flex: 1,
    textTransform: 'uppercase',
  },
  programArrow: {
    width: 32,
    height: 32,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Other programs
  otherSection: {
    marginTop: theme.spacing.sm,
  },
  otherCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    ...theme.shadows.sm,
  },
  otherBannerContainer: {
    width: 56,
    height: 56,
    borderRadius: theme.borderRadius.sm,
    overflow: 'hidden',
    marginRight: theme.spacing.md,
  },
  otherBannerFallback: {
    width: '100%',
    height: '100%',
    backgroundColor: theme.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  otherInfoCol: {
    flex: 1,
    gap: 4,
  },
  otherName: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    textTransform: 'uppercase',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: theme.borderRadius.full,
  },
  statusPillPaused: {
    backgroundColor: '#fef3c7',
  },
  statusPillCompleted: {
    backgroundColor: '#d1fae5',
  },
  statusPillText: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.semibold,
  },
  statusTextPaused: {
    color: '#92400e',
  },
  statusTextCompleted: {
    color: '#065f46',
  },
  // Empty state
  emptyState: {
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyIconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: theme.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  emptyTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  emptyText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});
