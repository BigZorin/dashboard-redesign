import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../constants/theme';

type Props = {
  remaining: number;
  totalSeconds: number;
  progress: number;
  state: 'idle' | 'running' | 'paused' | 'finished';
  onPause: () => void;
  onResume: () => void;
  onSkip: () => void;
};

const SIZE = 160;
const STROKE_WIDTH = 8;
const RADIUS = (SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function RestTimer({
  remaining,
  totalSeconds,
  progress,
  state,
  onPause,
  onResume,
  onSkip,
}: Props) {
  const strokeDashoffset = CIRCUMFERENCE * (1 - progress);
  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const timeDisplay = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  if (state === 'idle') return null;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {state === 'finished' ? 'Rust voorbij!' : 'Rust'}
      </Text>

      <View style={styles.timerWrapper}>
        <Svg width={SIZE} height={SIZE}>
          {/* Background circle */}
          <Circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            stroke={theme.colors.border}
            strokeWidth={STROKE_WIDTH}
            fill="none"
          />
          {/* Progress circle */}
          <Circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            stroke={state === 'finished' ? theme.colors.success : theme.colors.secondary}
            strokeWidth={STROKE_WIDTH}
            fill="none"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            rotation="-90"
            origin={`${SIZE / 2}, ${SIZE / 2}`}
          />
        </Svg>
        <View style={styles.timeContainer}>
          {state === 'finished' ? (
            <Ionicons name="checkmark-circle" size={48} color={theme.colors.success} />
          ) : (
            <Text style={styles.timeText}>{timeDisplay}</Text>
          )}
        </View>
      </View>

      <View style={styles.controls}>
        {state === 'running' && (
          <TouchableOpacity style={styles.controlButton} onPress={onPause}>
            <Ionicons name="pause" size={20} color={theme.colors.text} />
            <Text style={styles.controlText}>Pauze</Text>
          </TouchableOpacity>
        )}
        {state === 'paused' && (
          <TouchableOpacity style={styles.controlButton} onPress={onResume}>
            <Ionicons name="play" size={20} color={theme.colors.text} />
            <Text style={styles.controlText}>Hervatten</Text>
          </TouchableOpacity>
        )}
        {(state === 'running' || state === 'paused') && (
          <TouchableOpacity style={[styles.controlButton, styles.skipButton]} onPress={onSkip}>
            <Ionicons name="play-skip-forward" size={20} color="#fff" />
            <Text style={[styles.controlText, { color: '#fff' }]}>Overslaan</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 24,
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    marginVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    marginBottom: 16,
  },
  timerWrapper: {
    width: SIZE,
    height: SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 40,
    fontWeight: '700',
    color: theme.colors.text,
    fontVariant: ['tabular-nums'],
  },
  controls: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: theme.colors.background,
  },
  skipButton: {
    backgroundColor: theme.colors.primary,
  },
  controlText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
  },
});
