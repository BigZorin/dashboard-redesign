/**
 * OpenFoodFacts API integration for food search and barcode lookup.
 * Free, open-source food database — no API key required.
 */

const BASE_URL = 'https://world.openfoodfacts.org';

export interface FoodProduct {
  barcode: string;
  name: string;
  brand: string;
  imageUrl: string | null;
  // Per 100g
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  // Serving
  servingSize: string | null; // e.g. "30g", "1 slice (25g)"
  servingSizeGrams: number | null;
}

function parseProduct(product: any): FoodProduct | null {
  if (!product || !product.product_name) return null;

  const nutrients = product.nutriments || {};

  return {
    barcode: product.code || '',
    name: product.product_name || '',
    brand: product.brands || '',
    imageUrl: product.image_small_url || product.image_url || null,
    calories: Math.round(nutrients['energy-kcal_100g'] || nutrients['energy-kcal'] || 0),
    protein: Math.round(nutrients.proteins_100g || 0),
    carbs: Math.round(nutrients.carbohydrates_100g || 0),
    fat: Math.round(nutrients.fat_100g || 0),
    servingSize: product.serving_size || null,
    servingSizeGrams: product.serving_quantity || null,
  };
}

/**
 * Look up a product by barcode.
 */
export async function searchByBarcode(barcode: string): Promise<FoodProduct | null> {
  try {
    const response = await fetch(`${BASE_URL}/api/v0/product/${barcode}.json`);
    const data = await response.json();

    if (data.status !== 1 || !data.product) return null;
    return parseProduct(data.product);
  } catch (error) {
    console.log('OpenFoodFacts barcode lookup failed:', error);
    return null;
  }
}

/**
 * Search for products by name.
 */
export async function searchByName(query: string, page = 1): Promise<FoodProduct[]> {
  try {
    const params = new URLSearchParams({
      search_terms: query,
      search_simple: '1',
      action: 'process',
      json: '1',
      page_size: '20',
      page: String(page),
      fields: 'code,product_name,brands,image_small_url,nutriments,serving_size,serving_quantity',
    });

    const response = await fetch(`${BASE_URL}/cgi/search.pl?${params}`);
    const data = await response.json();

    if (!data.products) return [];

    return data.products
      .map(parseProduct)
      .filter((p: FoodProduct | null): p is FoodProduct => p !== null);
  } catch (error) {
    console.log('OpenFoodFacts search failed:', error);
    return [];
  }
}
