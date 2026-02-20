import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../constants/theme';
import { useProgressEntries } from '../../hooks/useProgressPhotos';
import { getSignedPhotoUrl } from '../../lib/progressApi';

export default function ProgressPhotosScreen({ navigation }: any) {
  const { data: entries = [], isLoading, refetch } = useProgressEntries();
  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({});

  // Load signed URLs for all photos
  useEffect(() => {
    async function loadUrls() {
      const urls: Record<string, string> = {};
      for (const entry of entries) {
        for (const photo of entry.photos || []) {
          if (!signedUrls[photo.storagePath]) {
            const url = await getSignedPhotoUrl(photo.storagePath);
            if (url) urls[photo.storagePath] = url;
          }
        }
      }
      if (Object.keys(urls).length > 0) {
        setSignedUrls((prev) => ({ ...prev, ...urls }));
      }
    }
    if (entries.length > 0) loadUrls();
  }, [entries]);

  const entriesWithPhotos = entries.filter((e) => e.photos && e.photos.length > 0);

  // Get entries that have at least 2 dates for comparison
  const canCompare = entriesWithPhotos.length >= 2;

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Voortgang</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('PhotoUpload')}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={false} onRefresh={() => refetch()} />}
      >
        {/* Compare button */}
        {canCompare && (
          <TouchableOpacity
            style={styles.compareButton}
            onPress={() => navigation.navigate('PhotoComparison')}
          >
            <Ionicons name="git-compare" size={20} color="#fff" />
            <Text style={styles.compareButtonText}>Vergelijk voor/na</Text>
          </TouchableOpacity>
        )}

        {/* Entries by date */}
        {entriesWithPhotos.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="images-outline" size={64} color={theme.colors.border} />
            <Text style={styles.emptyTitle}>Nog geen foto's</Text>
            <Text style={styles.emptyText}>
              Maak voortgangsfoto's om je transformatie bij te houden.
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => navigation.navigate('PhotoUpload')}
            >
              <Ionicons name="camera" size={18} color="#fff" />
              <Text style={styles.emptyButtonText}>Eerste foto's maken</Text>
            </TouchableOpacity>
          </View>
        ) : (
          entriesWithPhotos.map((entry) => (
            <View key={entry.id} style={styles.entryCard}>
              <View style={styles.entryHeader}>
                <Text style={styles.entryDate}>
                  {new Date(entry.date).toLocaleDateString('nl-NL', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </Text>
                {entry.weightKg && (
                  <Text style={styles.entryWeight}>{entry.weightKg} kg</Text>
                )}
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photoRow}>
                {entry.photos.map((photo, idx) => {
                  const url = signedUrls[photo.storagePath];
                  return (
                    <View key={idx} style={styles.photoThumb}>
                      {url ? (
                        <Image source={{ uri: url }} style={styles.thumbImage} />
                      ) : (
                        <View style={[styles.thumbImage, styles.thumbPlaceholder]}>
                          <ActivityIndicator size="small" color={theme.colors.textTertiary} />
                        </View>
                      )}
                      <Text style={styles.thumbLabel}>
                        {photo.category === 'front' ? 'Voorkant' :
                         photo.category === 'side' ? 'Zijkant' : 'Achterkant'}
                      </Text>
                    </View>
                  );
                })}
              </ScrollView>
              {entry.notes && (
                <Text style={styles.entryNotes}>{entry.notes}</Text>
              )}
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  addButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  compareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: theme.colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 20,
  },
  compareButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  entryCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  entryDate: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.text,
  },
  entryWeight: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.secondary,
  },
  photoRow: {
    flexDirection: 'row',
  },
  photoThumb: {
    marginRight: 10,
    alignItems: 'center',
  },
  thumbImage: {
    width: 90,
    height: 120,
    borderRadius: 10,
  },
  thumbPlaceholder: {
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbLabel: {
    fontSize: 11,
    color: theme.colors.textTertiary,
    marginTop: 4,
  },
  entryNotes: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
    marginTop: 10,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 40,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 20,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});
