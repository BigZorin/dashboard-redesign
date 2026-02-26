import React, { useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
  ActionSheetIOS,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { theme } from '../../constants/theme';
import VoiceRecordButton from './VoiceRecordButton';

type Props = {
  onSendText: (text: string) => void;
  onSendVoice: (uri: string, durationSeconds: number) => void;
  onSendMedia: (uri: string, type: 'image' | 'video' | 'document', fileName?: string) => void;
  isSending: boolean;
};

export default function ChatInput({ onSendText, onSendVoice, onSendMedia, isSending }: Props) {
  const [text, setText] = useState('');

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || isSending) return;
    onSendText(trimmed);
    setText('');
  };

  const handleAttachment = () => {
    const options = ['Foto maken', 'Foto/video kiezen', 'Document', 'Annuleer'];
    const cancelIndex = 3;

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        { options, cancelButtonIndex: cancelIndex },
        (index) => {
          if (index === 0) handleCamera();
          else if (index === 1) handleImagePicker();
          else if (index === 2) handleDocumentPicker();
        }
      );
    } else {
      Alert.alert('Bijlage', 'Kies een optie', [
        { text: 'Foto maken', onPress: handleCamera },
        { text: 'Foto/video kiezen', onPress: handleImagePicker },
        { text: 'Document', onPress: handleDocumentPicker },
        { text: 'Annuleer', style: 'cancel' },
      ]);
    }
  };

  const handleCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Camera toegang nodig', 'Geef camera toegang in je instellingen.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 0.7,
    });

    if (!result.canceled && result.assets[0]) {
      onSendMedia(result.assets[0].uri, 'image');
    }
  };

  const handleImagePicker = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Galerij toegang nodig', 'Geef galerij toegang in je instellingen.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'videos'],
      quality: 0.7,
      videoMaxDuration: 60,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      const type = asset.type === 'video' ? 'video' : 'image';
      onSendMedia(asset.uri, type);
    }
  };

  const handleDocumentPicker = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        onSendMedia(asset.uri, 'document', asset.name);
      }
    } catch {
      // User cancelled
    }
  };

  const hasText = text.trim().length > 0;

  return (
    <View style={styles.container}>
      <View style={styles.inputRow}>
        <TouchableOpacity
          onPress={handleAttachment}
          style={styles.attachButton}
          disabled={isSending}
        >
          <Ionicons name="add-circle-outline" size={26} color={theme.colors.textSecondary} />
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder="Typ een bericht..."
          placeholderTextColor={theme.colors.textTertiary}
          multiline
          maxLength={2000}
          returnKeyType="default"
        />

        {hasText ? (
          <TouchableOpacity
            onPress={handleSend}
            disabled={isSending}
            style={[styles.sendButton, isSending && { opacity: 0.5 }]}
          >
            <Ionicons name="send" size={18} color="#fff" />
          </TouchableOpacity>
        ) : (
          <VoiceRecordButton onRecordingComplete={onSendVoice} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 8,
    paddingTop: 8,
    paddingBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
  },
  attachButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: theme.colors.text,
    backgroundColor: theme.colors.background,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
