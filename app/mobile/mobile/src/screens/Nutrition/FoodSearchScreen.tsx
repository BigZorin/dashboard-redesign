import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { searchByName, type FoodProduct } from '../../lib/openFoodFacts';
import { theme } from '../../constants/theme';

export default function FoodSearchScreen() {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const { date, mealType } = route.params || {};

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<FoodProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = useCallback(async () => {
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);
    const products = await searchByName(query.trim());
    setResults(products);
    setLoading(false);
  }, [query]);

  const handleSelect = (product: FoodProduct) => {
    navigation.navigate('FoodDetail' as never, {
      product,
      date,
      mealType,
    } as never);
  };

  const renderItem = ({ item }: { item: FoodProduct }) => (
    <TouchableOpacity style={styles.resultItem} onPress={() => handleSelect(item)}>
      {item.imageUrl ? (
        <Image source={{ uri: item.imageUrl }} style={styles.productImage} />
      ) : (
        <View style={[styles.productImage, styles.productPlaceholder]}>
          <Ionicons name="nutrition-outline" size={20} color={theme.colors.textTertiary} />
        </View>
      )}
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={1}>
          {item.name}
        </Text>
        {item.brand ? (
          <Text style={styles.productBrand} numberOfLines={1}>
            {item.brand}
          </Text>
        ) : null}
        <Text style={styles.productMacros}>
          {item.calories} kcal | E{item.protein}g | K{item.carbs}g | V{item.fat}g
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={theme.colors.textTertiary} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Zoek voeding</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Search bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={theme.colors.textTertiary} />
          <TextInput
            style={styles.searchInput}
            value={query}
            onChangeText={setQuery}
            placeholder="Zoek een product..."
            placeholderTextColor={theme.colors.textTertiary}
            returnKeyType="search"
            onSubmitEditing={handleSearch}
            autoFocus
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => { setQuery(''); setResults([]); setSearched(false); }}>
              <Ionicons name="close-circle" size={18} color={theme.colors.textTertiary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Results */}
      {loading ? (
        <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 40 }} />
      ) : results.length > 0 ? (
        <FlatList
          data={results}
          keyExtractor={(item) => item.barcode || item.name}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
        />
      ) : searched ? (
        <View style={styles.emptyState}>
          <Ionicons name="search-outline" size={40} color={theme.colors.textTertiary} />
          <Text style={styles.emptyText}>Geen resultaten gevonden</Text>
          <Text style={styles.emptySubtext}>Probeer een andere zoekterm</Text>
        </View>
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="nutrition-outline" size={40} color={theme.colors.textTertiary} />
          <Text style={styles.emptyText}>Zoek een product</Text>
          <Text style={styles.emptySubtext}>
            Voer een productnaam in om te zoeken in de OpenFoodFacts database
          </Text>
        </View>
      )}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: theme.colors.headerDark,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: theme.colors.text,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  productImage: {
    width: 48,
    height: 48,
    borderRadius: 8,
    marginRight: 12,
  },
  productPlaceholder: {
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.text,
  },
  productBrand: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginTop: 1,
  },
  productMacros: {
    fontSize: 12,
    color: theme.colors.textTertiary,
    marginTop: 3,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 40,
    gap: 8,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  emptySubtext: {
    fontSize: 14,
    color: theme.colors.textTertiary,
    textAlign: 'center',
  },
});
