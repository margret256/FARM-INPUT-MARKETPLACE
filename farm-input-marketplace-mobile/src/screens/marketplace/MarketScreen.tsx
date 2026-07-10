import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { productToCard } from '@/api/marketplace-adapters';
import { listProducts } from '@/api/products';
import { AppScreen, StaticScreen } from '@/components/marketplace/AppScreen';
import { FloatingTabBar } from '@/components/marketplace/FloatingTabBar';
import { ProductCard } from '@/components/marketplace/ProductCard';
import { marketProducts, type ProductItem } from '@/constants/mock-marketplace';
import { marketplaceColors } from '@/constants/marketplace';

export function MarketScreen() {
  const [products, setProducts] = useState<ProductItem[]>(marketProducts);

  useEffect(() => {
    let mounted = true;

    async function loadProducts() {
      try {
        const response = await listProducts();
        if (mounted && response.items.length > 0) {
          setProducts(response.items.map(productToCard));
        }
      } catch {
        // Use local fallback data while the API is unavailable.
      }
    }

    loadProducts();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <StaticScreen>
      <AppScreen title="AgroMarket">
        <View style={styles.searchRow}>
          <Ionicons name="search" size={17} color={marketplaceColors.inkMuted} />
          <Text style={styles.searchText}>Search inputs, seeds, tools...</Text>
          <View style={styles.filterSquare}>
            <Ionicons name="options-outline" size={20} color="#FFFFFF" />
          </View>
        </View>
        <View style={styles.chipRow}>
          <Text style={[styles.chip, styles.activeChip]}>Price: Low-High x</Text>
          <Text style={styles.chip}>Seeds</Text>
          <Text style={styles.chip}>Verified Dealers</Text>
        </View>
        <View style={styles.grid}>
          {products.map((product) => (
            <View key={product.id} style={styles.gridItem}>
              <ProductCard compact product={product} />
            </View>
          ))}
        </View>
      </AppScreen>
      <Pressable style={styles.sortButton}>
        <Ionicons name="filter" size={18} color="#FFFFFF" />
        <Text style={styles.sortText}>Sort & Filter</Text>
      </Pressable>
      <FloatingTabBar active="market" />
    </StaticScreen>
  );
}

const styles = StyleSheet.create({
  searchRow: {
    height: 48,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DDE6D6',
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 15,
    gap: 10,
  },
  searchText: {
    flex: 1,
    color: marketplaceColors.inkMuted,
    fontSize: 11,
    fontWeight: '700',
  },
  filterSquare: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: marketplaceColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 3,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
    marginBottom: 16,
  },
  chip: {
    backgroundColor: '#E9EFE4',
    color: marketplaceColors.inkSoft,
    borderRadius: 16,
    overflow: 'hidden',
    paddingHorizontal: 12,
    paddingVertical: 7,
    fontSize: 10,
    fontWeight: '800',
  },
  activeChip: {
    backgroundColor: marketplaceColors.primaryDark,
    color: '#FFFFFF',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 13,
  },
  gridItem: {
    width: '47.8%',
  },
  sortButton: {
    position: 'absolute',
    bottom: 112,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    backgroundColor: marketplaceColors.primary,
    paddingHorizontal: 24,
    paddingVertical: 13,
    borderRadius: 24,
    elevation: 4,
  },
  sortText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
});
