import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../constants/theme';
import { startRecording, stopRecording, cancelRecording } from '../../lib/voiceRecorder';

type Props = {
  onRecordingComplete: (uri: string, durationSeconds: number) => void;
};

export default function VoiceRecordButton({ onRecordingComplete }: Props) {
  const [isRecordingState, setIsRecordingState] = useState(false);
  const [recordDuration, setRecordDuration] = useState(0);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRecordingState) {
      // Pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Timer
      intervalRef.current = setInterval(() => {
        setRecordDuration((prev) => prev + 1);
      }, 1000);
    } else {
      pulseAnim.setValue(1);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRecordingState]);

  const handleStartRecording = async () => {
    try {
      await startRecording();
      setIsRecordingState(true);
      setRecordDuration(0);
    } catch (error) {
      // Permission denied or other error
    }
  };

  const handleStopRecording = async () => {
    setIsRecordingState(false);
    const result = await stopRecording();
    if (result) {
      onRecordingComplete(result.uri, result.durationSeconds);
    }
  };

  const handleCancelRecording = async () => {
    setIsRecordingState(false);
    await cancelRecording();
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  if (isRecordingState) {
    return (
      <View style={styles.recordingContainer}>
        <TouchableOpacityWorkaround onPress={handleCancelRecording} style={styles.cancelButton}>
          <Ionicons name="trash-outline" size={20} color={theme.colors.error} />
        </TouchableOpacityWorkaround>

        <View style={styles.recordingInfo}>
          <Animated.View
            style={[styles.recordDot, { transform: [{ scale: pulseAnim }] }]}
          />
          <Text style={styles.recordTime}>{formatTime(recordDuration)}</Text>
        </View>

        <TouchableOpacityWorkaround onPress={handleStopRecording} style={styles.sendRecordButton}>
          <Ionicons name="send" size={18} color="#fff" />
        </TouchableOpacityWorkaround>
      </View>
    );
  }

  return (
    <TouchableOpacityWorkaround onPress={handleStartRecording} style={styles.micButton}>
      <Ionicons name="mic" size={22} color={theme.colors.textSecondary} />
    </TouchableOpacityWorkaround>
  );
}

// Simple touchable wrapper since we need to avoid importing from RN in a loop
function TouchableOpacityWorkaround({
  children,
  onPress,
  style,
}: {
  children: React.ReactNode;
  onPress: () => void;
  style?: any;
}) {
  return (
    <Pressable onPress={onPress} style={style}>
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  micButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordingContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cancelButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordingInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  recordDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.error,
  },
  recordTime: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.error,
  },
  sendRecordButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
