import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { theme } from '../../constants/theme';
import { useUploadProgress } from '../../hooks/useProgressPhotos';
import type { PhotoCategory } from '../../lib/progressApi';

type SelectedPhoto = {
  uri: string;
  category: PhotoCategory;
};

const CATEGORIES: { key: PhotoCategory; label: string; icon: string }[] = [
  { key: 'front', label: 'Voorkant', icon: 'person' },
  { key: 'side', label: 'Zijkant', icon: 'person-outline' },
  { key: 'back', label: 'Achterkant', icon: 'person' },
];

export default function PhotoUploadScreen({ navigation }: any) {
  const [photos, setPhotos] = useState<SelectedPhoto[]>([]);
  const [weightInput, setWeightInput] = useState('');
  const [notesInput, setNotesInput] = useState('');
  const uploadMutation = useUploadProgress();

  const today = new Date().toISOString().split('T')[0];

  const pickPhoto = async (category: PhotoCategory) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Toestemming nodig', 'We hebben toegang tot je foto\'s nodig.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
      aspect: [3, 4],
    });

    if (!result.canceled && result.assets[0]) {
      setPhotos((prev) => {
        // Replace existing photo of same category
        const filtered = prev.filter((p) => p.category !== category);
        return [...filtered, { uri: result.assets[0].uri, category }];
      });
    }
  };

  const takePhoto = async (category: PhotoCategory) => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Toestemming nodig', 'We hebben toegang tot je camera nodig.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8,
      aspect: [3, 4],
    });

    if (!result.canceled && result.assets[0]) {
      setPhotos((prev) => {
        const filtered = prev.filter((p) => p.category !== category);
        return [...filtered, { uri: result.assets[0].uri, category }];
      });
    }
  };

  const showPickerOptions = (category: PhotoCategory) => {
    Alert.alert('Foto toevoegen', 'Kies een optie', [
      { text: 'Camera', onPress: () => takePhoto(category) },
      { text: 'Galerij', onPress: () => pickPhoto(category) },
      { text: 'Annuleren', style: 'cancel' },
    ]);
  };

  const removePhoto = (category: PhotoCategory) => {
    setPhotos((prev) => prev.filter((p) => p.category !== category));
  };

  const handleUpload = () => {
    if (photos.length === 0) {
      Alert.alert('Geen foto\'s', 'Selecteer minimaal één foto.');
      return;
    }

    uploadMutation.mutate(
      {
        photos: photos.map((p) => ({ uri: p.uri, category: p.category })),
        date: today,
        weightKg: weightInput ? parseFloat(weightInput) : undefined,
        notes: notesInput.trim() || undefined,
      },
      {
        onSuccess: () => {
          Alert.alert('Opgeslagen!', 'Je voortgangsfoto\'s zijn geüpload.', [
            { text: 'OK', onPress: () => navigation.goBack() },
          ]);
        },
        onError: (error) => {
          Alert.alert('Fout', 'Kon foto\'s niet uploaden. Probeer het opnieuw.');
        },
      }
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Voortgangsfoto's</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.dateText}>
          {new Date().toLocaleDateString('nl-NL', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </Text>

        {/* Photo slots */}
        <View style={styles.photoGrid}>
          {CATEGORIES.map((cat) => {
            const photo = photos.find((p) => p.category === cat.key);
            return (
              <View key={cat.key} style={styles.photoSlot}>
                <Text style={styles.slotLabel}>{cat.label}</Text>
                {photo ? (
                  <View style={styles.photoContainer}>
                    <Image source={{ uri: photo.uri }} style={styles.photoImage} />
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => removePhoto(cat.key)}
                    >
                      <Ionicons name="close-circle" size={26} color="#ff3b30" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.addPhotoButton}
                    onPress={() => showPickerOptions(cat.key)}
                  >
                    <Ionicons name="camera-outline" size={32} color={theme.colors.textTertiary} />
                    <Text style={styles.addPhotoText}>Toevoegen</Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })}
        </View>

        {/* Optional weight input */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Gewicht (optioneel)</Text>
          <TextInput
            style={styles.input}
            value={weightInput}
            onChangeText={setWeightInput}
            keyboardType="decimal-pad"
            placeholder="bijv. 75.5"
            placeholderTextColor={theme.colors.textTertiary}
          />
        </View>

        {/* Optional notes */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Notities (optioneel)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={notesInput}
            onChangeText={setNotesInput}
            placeholder="Hoe voel je je?"
            placeholderTextColor={theme.colors.textTertiary}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Upload button */}
        <TouchableOpacity
          style={[styles.uploadButton, photos.length === 0 && styles.uploadButtonDisabled]}
          onPress={handleUpload}
          disabled={photos.length === 0 || uploadMutation.isPending}
        >
          {uploadMutation.isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="cloud-upload" size={22} color="#fff" />
              <Text style={styles.uploadButtonText}>
                {photos.length} foto{photos.length !== 1 ? "'s" : ''} opslaan
              </Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: theme.colors.headerDark,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  dateText: {
    fontSize: 15,
    color: theme.colors.textSecondary,
    marginBottom: 20,
  },
  photoGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },
  photoSlot: {
    flex: 1,
  },
  slotLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textTertiary,
    textAlign: 'center',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  addPhotoButton: {
    aspectRatio: 3 / 4,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  addPhotoText: {
    fontSize: 11,
    color: theme.colors.textTertiary,
  },
  photoContainer: {
    aspectRatio: 3 / 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  removeButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#fff',
    borderRadius: 13,
  },
  inputSection: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: theme.colors.surface,
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    color: theme.colors.text,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: theme.colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  uploadButtonDisabled: {
    opacity: 0.4,
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
});
