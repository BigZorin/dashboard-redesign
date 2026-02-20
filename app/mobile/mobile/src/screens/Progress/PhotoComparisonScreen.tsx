import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../constants/theme';
import { useProgressEntries } from '../../hooks/useProgressPhotos';
import { getSignedPhotoUrl } from '../../lib/progressApi';
import PhotoComparisonSlider from '../../components/PhotoComparisonSlider';
import type { PhotoCategory } from '../../lib/progressApi';

export default function PhotoComparisonScreen({ navigation }: any) {
  const { data: entries = [] } = useProgressEntries();
  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({});
  const [selectedCategory, setSelectedCategory] = useState<PhotoCategory>('front');
  const [beforeIndex, setBeforeIndex] = useState(0);
  const [afterIndex, setAfterIndex] = useState(0);

  // Filter entries that have photos for the selected category
  const filteredEntries = useMemo(() => {
    return entries
      .filter((e) => e.photos?.some((p) => p.category === selectedCategory))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [entries, selectedCategory]);

  // Set defaults: before = first, after = last
  useEffect(() => {
    if (filteredEntries.length >= 2) {
      setBeforeIndex(0);
      setAfterIndex(filteredEntries.length - 1);
    }
  }, [filteredEntries.length, selectedCategory]);

  // Load signed URLs
  useEffect(() => {
    async function loadUrls() {
      const urls: Record<string, string> = {};
      for (const entry of filteredEntries) {
        for (const photo of entry.photos || []) {
          if (photo.category === selectedCategory && !signedUrls[photo.storagePath]) {
            const url = await getSignedPhotoUrl(photo.storagePath);
            if (url) urls[photo.storagePath] = url;
          }
        }
      }
      if (Object.keys(urls).length > 0) {
        setSignedUrls((prev) => ({ ...prev, ...urls }));
      }
    }
    loadUrls();
  }, [filteredEntries, selectedCategory]);

  const beforeEntry = filteredEntries[beforeIndex];
  const afterEntry = filteredEntries[afterIndex];

  const beforePhoto = beforeEntry?.photos?.find((p) => p.category === selectedCategory);
  const afterPhoto = afterEntry?.photos?.find((p) => p.category === selectedCategory);

  const beforeUrl = beforePhoto ? signedUrls[beforePhoto.storagePath] : null;
  const afterUrl = afterPhoto ? signedUrls[afterPhoto.storagePath] : null;

  const categories: { key: PhotoCategory; label: string }[] = [
    { key: 'front', label: 'Voorkant' },
    { key: 'side', label: 'Zijkant' },
    { key: 'back', label: 'Achterkant' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Vergelijking</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Category tabs */}
        <View style={styles.tabs}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.key}
              style={[styles.tab, selectedCategory === cat.key && styles.tabActive]}
              onPress={() => setSelectedCategory(cat.key)}
            >
              <Text style={[styles.tabText, selectedCategory === cat.key && styles.tabTextActive]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Comparison slider */}
        {filteredEntries.length < 2 ? (
          <View style={styles.noData}>
            <Ionicons name="images-outline" size={48} color="#ccc" />
            <Text style={styles.noDataText}>
              Je hebt minimaal 2 foto's van de {selectedCategory === 'front' ? 'voorkant' : selectedCategory === 'side' ? 'zijkant' : 'achterkant'} nodig om te vergelijken.
            </Text>
          </View>
        ) : beforeUrl && afterUrl ? (
          <>
            <PhotoComparisonSlider
              beforeUri={beforeUrl}
              afterUri={afterUrl}
              beforeLabel={beforeEntry ? new Date(beforeEntry.date).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' }) : 'Voor'}
              afterLabel={afterEntry ? new Date(afterEntry.date).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' }) : 'Na'}
            />

            {/* Date selectors */}
            <View style={styles.dateSelectors}>
              <View style={styles.dateSelector}>
                <Text style={styles.dateSelectorLabel}>Voor</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {filteredEntries.map((entry, idx) => (
                    <TouchableOpacity
                      key={entry.id}
                      style={[styles.dateChip, beforeIndex === idx && styles.dateChipActive]}
                      onPress={() => setBeforeIndex(idx)}
                    >
                      <Text style={[styles.dateChipText, beforeIndex === idx && styles.dateChipTextActive]}>
                        {new Date(entry.date).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
              <View style={styles.dateSelector}>
                <Text style={styles.dateSelectorLabel}>Na</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {filteredEntries.map((entry, idx) => (
                    <TouchableOpacity
                      key={entry.id}
                      style={[styles.dateChip, afterIndex === idx && styles.dateChipActive]}
                      onPress={() => setAfterIndex(idx)}
                    >
                      <Text style={[styles.dateChipText, afterIndex === idx && styles.dateChipTextActive]}>
                        {new Date(entry.date).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>
          </>
        ) : (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.loadingText}>Foto's laden...</Text>
          </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  tabs: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: theme.colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  tabTextActive: {
    color: '#fff',
  },
  noData: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  noDataText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: 12,
    paddingHorizontal: 40,
  },
  loading: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 12,
  },
  dateSelectors: {
    marginTop: 20,
    gap: 12,
  },
  dateSelector: {},
  dateSelectorLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textTertiary,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  dateChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: theme.colors.surface,
    marginRight: 8,
  },
  dateChipActive: {
    backgroundColor: theme.colors.primary,
  },
  dateChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: theme.colors.text,
  },
  dateChipTextActive: {
    color: '#fff',
  },
});
