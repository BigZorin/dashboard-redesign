import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../constants/theme';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  rightIcon?: React.ReactNode;
  leftIcon?: React.ReactNode;
  onBack?: () => void;
  /** Extra content below title, e.g. filter chips, stats */
  children?: React.ReactNode;
  /** Avatar URI for profile-style headers */
  avatarUrl?: string;
  /** Fallback initials when no avatar */
  avatarFallback?: string;
  /** Override gradient colors */
  gradientColors?: readonly [string, string, ...string[]];
  /** Style for the outer container */
  style?: ViewStyle;
  /** Make the header compact (less padding) */
  compact?: boolean;
}

export default function ScreenHeader({
  title,
  subtitle,
  rightIcon,
  leftIcon,
  onBack,
  children,
  avatarUrl,
  avatarFallback,
  gradientColors,
  style,
  compact = false,
}: ScreenHeaderProps) {
  const insets = useSafeAreaInsets();
  const colors = gradientColors ?? theme.gradients.headerSubtle;

  return (
    <LinearGradient
      colors={colors as unknown as [string, string, ...string[]]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[
        styles.gradient,
        { paddingTop: insets.top + (compact ? 8 : 12) },
        style,
      ]}
    >
      {/* Top row: back / title / right icon */}
      <View style={styles.topRow}>
        {onBack ? (
          <TouchableOpacity onPress={onBack} style={styles.backButton} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
        ) : leftIcon ? (
          <View style={styles.leftIconWrap}>{leftIcon}</View>
        ) : null}

        <View style={styles.titleArea}>
          {avatarUrl || avatarFallback ? (
            <View style={styles.avatarRow}>
              {avatarUrl ? (
                <Image source={{ uri: avatarUrl }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarFallback}>
                  <Text style={styles.avatarFallbackText}>{avatarFallback}</Text>
                </View>
              )}
              <View style={styles.titleTexts}>
                <Text style={[styles.title, compact && styles.titleCompact]} numberOfLines={1}>
                  {title}
                </Text>
                {subtitle ? (
                  <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text>
                ) : null}
              </View>
            </View>
          ) : (
            <>
              <Text style={[styles.title, compact && styles.titleCompact]} numberOfLines={1}>
                {title}
              </Text>
              {subtitle ? (
                <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text>
              ) : null}
            </>
          )}
        </View>

        {rightIcon ? (
          <View style={styles.rightIconWrap}>{rightIcon}</View>
        ) : (
          // Spacer to balance back button
          onBack ? <View style={{ width: 40 }} /> : null
        )}
      </View>

      {/* Optional children: filter chips, stats, etc. */}
      {children ? <View style={styles.childrenWrap}>{children}</View> : null}

      {/* Curved bottom edge */}
      <View style={styles.curveContainer}>
        <View style={styles.curve} />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    paddingBottom: 20,
    position: 'relative',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    minHeight: 44,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  leftIconWrap: {
    marginRight: 12,
  },
  titleArea: {
    flex: 1,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    marginRight: 14,
  },
  avatarFallback: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  avatarFallbackText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  titleTexts: {
    flex: 1,
  },
  title: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: '#fff',
    letterSpacing: -0.3,
  },
  titleCompact: {
    fontSize: theme.fontSize.xl,
  },
  subtitle: {
    fontSize: theme.fontSize.sm,
    color: 'rgba(255,255,255,0.65)',
    marginTop: 2,
  },
  rightIconWrap: {
    marginLeft: 12,
  },
  childrenWrap: {
    paddingHorizontal: 20,
    paddingTop: 14,
  },
  curveContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 16,
    overflow: 'hidden',
  },
  curve: {
    position: 'absolute',
    bottom: 0,
    left: -10,
    right: -10,
    height: 32,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: theme.colors.background,
  },
});
