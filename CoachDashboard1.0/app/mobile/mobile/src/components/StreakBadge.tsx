import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../constants/theme';

type Props = {
  streak: number;
  size?: 'small' | 'normal';
};

export default function StreakBadge({ streak, size = 'normal' }: Props) {
  if (streak <= 0) return null;

  const isSmall = size === 'small';

  return (
    <View style={[styles.container, isSmall && styles.containerSmall]}>
      <Text style={[styles.flame, isSmall && styles.flameSmall]}>🔥</Text>
      <Text style={[styles.text, isSmall && styles.textSmall]}>{streak}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  containerSmall: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  flame: {
    fontSize: 14,
  },
  flameSmall: {
    fontSize: 11,
  },
  text: {
    fontSize: 13,
    fontWeight: '700',
    color: '#92400e',
  },
  textSmall: {
    fontSize: 11,
  },
});
