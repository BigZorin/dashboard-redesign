import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../constants/theme';

type Props = {
  uri: string;
  duration: number; // seconds
  isOwn: boolean;
};

export default function VoiceNotePlayer({ uri, duration, isOwn }: Props) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const soundRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    return () => {
      soundRef.current?.unloadAsync();
    };
  }, []);

  const togglePlay = async () => {
    if (isPlaying && soundRef.current) {
      await soundRef.current.pauseAsync();
      setIsPlaying(false);
      return;
    }

    if (soundRef.current) {
      await soundRef.current.playAsync();
      setIsPlaying(true);
      return;
    }

    // Load and play
    const { sound } = await Audio.Sound.createAsync(
      { uri },
      { shouldPlay: true },
      (status) => {
        if (status.isLoaded) {
          setPosition(status.positionMillis / 1000);
          if (status.didJustFinish) {
            setIsPlaying(false);
            setPosition(0);
            sound.setPositionAsync(0);
          }
        }
      }
    );
    soundRef.current = sound;
    setIsPlaying(true);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  const progress = duration > 0 ? position / duration : 0;

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={togglePlay} style={styles.playButton}>
        <Ionicons
          name={isPlaying ? 'pause' : 'play'}
          size={20}
          color={isOwn ? '#fff' : theme.colors.primary}
        />
      </TouchableOpacity>

      <View style={styles.waveform}>
        {/* Simple waveform bars */}
        {Array.from({ length: 20 }).map((_, i) => {
          const height = 4 + Math.random() * 16;
          const filled = i / 20 <= progress;
          return (
            <View
              key={i}
              style={[
                styles.bar,
                {
                  height,
                  backgroundColor: filled
                    ? isOwn
                      ? '#fff'
                      : theme.colors.primary
                    : isOwn
                    ? 'rgba(255,255,255,0.3)'
                    : 'rgba(30,24,57,0.2)',
                },
              ]}
            />
          );
        })}
      </View>

      <Text style={[styles.time, isOwn && styles.timeOwn]}>
        {isPlaying ? formatTime(position) : formatTime(duration)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minWidth: 200,
  },
  playButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  waveform: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    height: 24,
  },
  bar: {
    width: 3,
    borderRadius: 1.5,
  },
  time: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    fontWeight: '500',
    minWidth: 32,
  },
  timeOwn: {
    color: 'rgba(255,255,255,0.8)',
  },
});
