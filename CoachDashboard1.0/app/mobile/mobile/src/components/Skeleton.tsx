import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, ViewStyle } from 'react-native';
import { theme } from '../constants/theme';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function Skeleton({ width = '100%', height = 16, borderRadius = 8, style }: SkeletonProps) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        {
          width: width as any,
          height,
          borderRadius,
          backgroundColor: theme.colors.border,
          opacity,
        },
        style,
      ]}
    />
  );
}

// Pre-built skeleton layouts for common patterns
export function SkeletonCard({ style }: { style?: ViewStyle }) {
  return (
    <View style={[styles.card, style]}>
      <Skeleton height={20} width="60%" style={{ marginBottom: 12 }} />
      <Skeleton height={14} width="100%" style={{ marginBottom: 8 }} />
      <Skeleton height={14} width="80%" />
    </View>
  );
}

export function SkeletonListItem({ style }: { style?: ViewStyle }) {
  return (
    <View style={[styles.listItem, style]}>
      <Skeleton width={48} height={48} borderRadius={24} />
      <View style={styles.listItemContent}>
        <Skeleton height={16} width="50%" style={{ marginBottom: 6 }} />
        <Skeleton height={12} width="75%" />
      </View>
    </View>
  );
}

export function SkeletonWorkoutCard({ style }: { style?: ViewStyle }) {
  return (
    <View style={[styles.card, style]}>
      <View style={styles.row}>
        <Skeleton width={44} height={44} borderRadius={12} />
        <View style={styles.listItemContent}>
          <Skeleton height={16} width="50%" style={{ marginBottom: 6 }} />
          <Skeleton height={12} width="35%" />
        </View>
        <Skeleton width={60} height={28} borderRadius={14} />
      </View>
      <View style={{ marginTop: 12 }}>
        <Skeleton height={12} width="100%" style={{ marginBottom: 6 }} />
        <Skeleton height={12} width="70%" />
      </View>
    </View>
  );
}

export function SkeletonMacroRings() {
  return (
    <View style={[styles.card, { alignItems: 'center', paddingVertical: 20 }]}>
      <Skeleton height={16} width="40%" style={{ marginBottom: 16 }} />
      <View style={styles.row}>
        {[1, 2, 3, 4].map((i) => (
          <View key={i} style={{ alignItems: 'center', marginHorizontal: 8 }}>
            <Skeleton width={56} height={56} borderRadius={28} />
            <Skeleton height={10} width={40} style={{ marginTop: 6 }} />
          </View>
        ))}
      </View>
    </View>
  );
}

export function SkeletonChart({ style }: { style?: ViewStyle }) {
  return (
    <View style={[styles.card, style]}>
      <Skeleton height={18} width="45%" style={{ marginBottom: 16 }} />
      <Skeleton height={120} width="100%" borderRadius={12} />
    </View>
  );
}

export function SkeletonMealCard({ style }: { style?: ViewStyle }) {
  return (
    <View style={[styles.card, style]}>
      <View style={[styles.row, { marginBottom: 12 }]}>
        <Skeleton height={18} width="30%" />
        <Skeleton height={14} width="20%" />
      </View>
      {[1, 2].map((i) => (
        <View key={i} style={[styles.listItem, { paddingHorizontal: 0, paddingVertical: 8 }]}>
          <Skeleton width={40} height={40} borderRadius={8} />
          <View style={styles.listItemContent}>
            <Skeleton height={14} width="60%" style={{ marginBottom: 4 }} />
            <Skeleton height={11} width="40%" />
          </View>
        </View>
      ))}
    </View>
  );
}

export function SkeletonChatItem({ style }: { style?: ViewStyle }) {
  return (
    <View style={[styles.listItem, style]}>
      <Skeleton width={52} height={52} borderRadius={26} />
      <View style={styles.listItemContent}>
        <View style={[styles.row, { marginBottom: 4 }]}>
          <Skeleton height={16} width="40%" />
          <Skeleton height={12} width={40} />
        </View>
        <Skeleton height={13} width="70%" />
      </View>
    </View>
  );
}

export function SkeletonCourseCard({ style }: { style?: ViewStyle }) {
  return (
    <View style={[styles.card, style]}>
      <Skeleton height={140} width="100%" borderRadius={12} style={{ marginBottom: 12 }} />
      <Skeleton height={18} width="70%" style={{ marginBottom: 8 }} />
      <Skeleton height={13} width="50%" style={{ marginBottom: 12 }} />
      <Skeleton height={6} width="100%" borderRadius={3} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    ...theme.shadows.sm,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  listItemContent: {
    flex: 1,
    marginLeft: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
