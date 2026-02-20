import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView, Image, ActivityIndicator, Platform, ActionSheetIOS } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useUser, useUpdateProfile, useUpdateAvatar } from '../../hooks/useUser';
import { theme } from '../../constants/theme';

export default function EditProfileScreen({ navigation }: any) {
  const { data: userData } = useUser();
  const updateProfile = useUpdateProfile();
  const updateAvatar = useUpdateAvatar();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [avatarUri, setAvatarUri] = useState<string | null>(null);

  // Sync form with cached profile data
  useEffect(() => {
    if (userData?.profile) {
      setFirstName(userData.profile.first_name || '');
      setLastName(userData.profile.last_name || '');
      if (userData.profile.avatar_url) {
        setAvatarUri(userData.profile.avatar_url);
      }
    }
  }, [userData]);

  const launchPicker = async (useCamera: boolean) => {
    if (useCamera) {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Toestemming nodig', 'Geef toegang tot je camera om een profielfoto te maken.');
        return;
      }
    } else {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Toestemming nodig', 'Geef toegang tot je fotobibliotheek om een profielfoto te kiezen.');
        return;
      }
    }

    const pickerFn = useCamera
      ? ImagePicker.launchCameraAsync
      : ImagePicker.launchImageLibraryAsync;

    const result = await pickerFn({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
      ...(Platform.OS === 'ios' && { presentationStyle: ImagePicker.UIImagePickerPresentationStyle.FULL_SCREEN }),
    });

    if (result.canceled) return;

    const uri = result.assets[0].uri;
    setAvatarUri(uri);

    updateAvatar.mutate(uri, {
      onSuccess: () => {
        Alert.alert('Gelukt', 'Profielfoto bijgewerkt');
      },
      onError: (err: any) => {
        Alert.alert('Fout', err?.message || 'Kon profielfoto niet uploaden. Probeer opnieuw.');
        setAvatarUri(userData?.profile?.avatar_url || null);
      },
    });
  };

  const handlePickPhoto = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Annuleren', 'Maak foto', 'Kies uit bibliotheek'],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) launchPicker(true);
          if (buttonIndex === 2) launchPicker(false);
        }
      );
    } else {
      Alert.alert('Profielfoto', 'Kies een optie', [
        { text: 'Annuleren', style: 'cancel' },
        { text: 'Maak foto', onPress: () => launchPicker(true) },
        { text: 'Kies uit bibliotheek', onPress: () => launchPicker(false) },
      ]);
    }
  };

  const handleSave = () => {
    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert('Fout', 'Vul alle velden in');
      return;
    }

    updateProfile.mutate(
      { firstName: firstName.trim(), lastName: lastName.trim() },
      {
        onSuccess: () => {
          Alert.alert('Gelukt', 'Profiel bijgewerkt', [
            { text: 'OK', onPress: () => navigation.goBack() },
          ]);
        },
        onError: () => {
          Alert.alert('Fout', 'Kon profiel niet bijwerken');
        },
      }
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profiel bewerken</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.avatarContainer}>
          {avatarUri ? (
            <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatar}>
              <Ionicons name="person" size={40} color={theme.colors.secondary} />
            </View>
          )}
          {updateAvatar.isPending && (
            <ActivityIndicator size="small" color={theme.colors.secondary} style={{ marginBottom: 4 }} />
          )}
          <TouchableOpacity style={styles.changePhotoButton} onPress={handlePickPhoto} disabled={updateAvatar.isPending}>
            <Text style={styles.changePhotoText}>Foto wijzigen</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Voornaam</Text>
          <TextInput
            style={styles.input}
            value={firstName}
            onChangeText={setFirstName}
            placeholder="Voornaam"
            autoCapitalize="words"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Achternaam</Text>
          <TextInput
            style={styles.input}
            value={lastName}
            onChangeText={setLastName}
            placeholder="Achternaam"
            autoCapitalize="words"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>E-mail</Text>
          <TextInput
            style={[styles.input, styles.inputDisabled]}
            value={userData?.email}
            editable={false}
          />
          <Text style={styles.helpText}>E-mailadres kan niet worden gewijzigd</Text>
        </View>

        <TouchableOpacity
          style={[styles.saveButton, updateProfile.isPending && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={updateProfile.isPending}
        >
          <Text style={styles.saveButtonText}>
            {updateProfile.isPending ? 'Bezig met opslaan...' : 'Opslaan'}
          </Text>
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
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 20,
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 12,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  changePhotoButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  changePhotoText: {
    color: theme.colors.secondary,
    fontSize: 16,
    fontWeight: '500',
  },
  section: {
    marginBottom: 20,
  },
  label: {
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
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  inputDisabled: {
    backgroundColor: theme.colors.disabled,
    color: theme.colors.textTertiary,
  },
  helpText: {
    fontSize: 12,
    color: theme.colors.textTertiary,
    marginTop: 6,
  },
  saveButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
