import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { theme } from '../constants/theme';

interface MacroRingProps {
  value: number;
  target: number;
  label: string;
  color: string;
  unit?: string;
  size?: number;
}

export default function MacroRing({
  value,
  target,
  label,
  color,
  unit = '',
  size = 70,
}: MacroRingProps) {
  const strokeWidth = size > 80 ? 8 : 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = target > 0 ? Math.min(value / target, 1) : 0;
  const strokeDashoffset = circumference * (1 - progress);
  const isLarge = size > 80;

  return (
    <View style={styles.container}>
      <View style={{ width: size, height: size }}>
        <Svg width={size} height={size}>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color + '15'}
            strokeWidth={strokeWidth}
            fill="none"
          />
          {target > 0 && (
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={color}
              strokeWidth={strokeWidth}
              fill="none"
              strokeDasharray={`${circumference}`}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              transform={`rotate(-90, ${size / 2}, ${size / 2})`}
            />
          )}
        </Svg>
        <View style={[styles.valueContainer, { width: size, height: size }]}>
          <Text style={[styles.value, { fontSize: isLarge ? 20 : 14 }]}>
            {value}
          </Text>
          {isLarge && <Text style={[styles.ringLabel, { color }]}>{label}</Text>}
        </View>
      </View>
      {!isLarge && <Text style={styles.label}>{label}</Text>}
      {target > 0 && (
        <Text style={styles.target}>/ {target}{unit}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  valueContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  value: {
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  ringLabel: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.semibold,
    marginTop: 1,
  },
  label: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.textSecondary,
    marginTop: 6,
  },
  target: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textTertiary,
    marginTop: 1,
  },
});
