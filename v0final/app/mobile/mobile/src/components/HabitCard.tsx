import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../constants/theme';
import StreakBadge from './StreakBadge';

type Props = {
  name: string;
  description: string | null;
  completed: boolean;
  streak: number;
  isToggling: boolean;
  onToggle: () => void;
};

export default function HabitCard({ name, description, completed, streak, isToggling, onToggle }: Props) {
  return (
    <TouchableOpacity
      style={[styles.container, completed && styles.containerCompleted]}
      onPress={onToggle}
      activeOpacity={0.7}
      disabled={isToggling}
    >
      <View style={styles.checkboxArea}>
        {isToggling ? (
          <ActivityIndicator size="small" color={theme.colors.primary} />
        ) : completed ? (
          <View style={styles.checkboxChecked}>
            <Ionicons name="checkmark" size={16} color="#fff" />
          </View>
        ) : (
          <View style={styles.checkboxUnchecked} />
        )}
      </View>

      <View style={styles.content}>
        <Text style={[styles.name, completed && styles.nameCompleted]}>{name}</Text>
        {description && <Text style={styles.description}>{description}</Text>}
      </View>

      <StreakBadge streak={streak} size="small" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  containerCompleted: {
    backgroundColor: '#f0fdf4',
  },
  checkboxArea: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkboxUnchecked: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: theme.colors.border,
  },
  checkboxChecked: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.success,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.text,
  },
  nameCompleted: {
    color: theme.colors.textSecondary,
  },
  description: {
    fontSize: 13,
    color: theme.colors.textTertiary,
    marginTop: 2,
  },
});
