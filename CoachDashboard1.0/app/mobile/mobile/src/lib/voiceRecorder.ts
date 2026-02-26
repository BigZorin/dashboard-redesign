import { Audio } from 'expo-av';
import { Platform } from 'react-native';

let recording: Audio.Recording | null = null;

/**
 * Request microphone permissions.
 */
export async function requestAudioPermissions(): Promise<boolean> {
  const { status } = await Audio.requestPermissionsAsync();
  return status === 'granted';
}

/**
 * Start recording audio.
 */
export async function startRecording(): Promise<void> {
  const hasPermission = await requestAudioPermissions();
  if (!hasPermission) throw new Error('Geen microfoon toegang');

  await Audio.setAudioModeAsync({
    allowsRecordingIOS: true,
    playsInSilentModeIOS: true,
  });

  const { recording: newRecording } = await Audio.Recording.createAsync(
    Audio.RecordingOptionsPresets.HIGH_QUALITY
  );
  recording = newRecording;
}

/**
 * Stop recording and return the file URI + duration.
 */
export async function stopRecording(): Promise<{
  uri: string;
  durationSeconds: number;
} | null> {
  if (!recording) return null;

  await recording.stopAndUnloadAsync();
  await Audio.setAudioModeAsync({
    allowsRecordingIOS: false,
  });

  const uri = recording.getURI();
  const status = await recording.getStatusAsync();
  const durationSeconds = Math.round((status.durationMillis || 0) / 1000);

  recording = null;

  if (!uri) return null;
  return { uri, durationSeconds };
}

/**
 * Cancel recording without saving.
 */
export async function cancelRecording(): Promise<void> {
  if (!recording) return;

  try {
    await recording.stopAndUnloadAsync();
  } catch {}

  await Audio.setAudioModeAsync({
    allowsRecordingIOS: false,
  });

  recording = null;
}

/**
 * Check if currently recording.
 */
export function isRecording(): boolean {
  return recording !== null;
}
