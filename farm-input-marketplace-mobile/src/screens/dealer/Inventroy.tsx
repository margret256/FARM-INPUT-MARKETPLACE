import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { marketplaceColors, marketplaceShadows } from '@/constants/marketplace';
import { DealerFloatingTabBar } from '@/components/marketplace/DealerFloatingTabBar';
import { deleteProduct, getProductStats, listProducts, type DealerProduct, type ProductStats } from '@/api/products';
import { productImage, formatUgx } from '@/api/marketplace-adapters';
import { useAuthStore } from '@/store/auth.store';

type StockStatus = 'IN STOCK' | 'LOW STOCK' | 'OUT OF STOCK';

type Product = {
  id: string;
  name: string;
  category: string;
  sku: string;
  status: StockStatus;
  statusDetail: string;
  image: string;
};

const PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'High-Nitrog...',
    category: 'Fertilizer',
    sku: 'FER-001',
    status: 'IN STOCK',
    statusDetail: '245 units available',
    image: 'https://via.placeholder.com/60x60/4CAF50/FFFFFF?text=F',
  },
  {
    id: '2',
    name: 'Hybrid Maiz...',
    category: 'Seeds',
    sku: 'SED-442',
    status: 'LOW STOCK',
    statusDetail: '15 units remaining',
    image: 'https://via.placeholder.com/60x60/FFC107/FFFFFF?text=S',
  },
  {
    id: '3',
    name: 'Pro-Spray H...',
    category: 'Equipment',
    sku: 'EQP-099',
    status: 'OUT OF STOCK',
    statusDetail: 'Restocking Friday',
    image: 'https://via.placeholder.com/60x60/607D8B/FFFFFF?text=E',
  },
  {
    id: '4',
    name: 'Organic Soil...',
    category: 'Soil',
    sku: 'SOL-881',
    status: 'IN STOCK',
    statusDetail: '88 bags available',
    image: 'https://via.placeholder.com/60x60/8BC34A/FFFFFF?text=S',
  },
];

const STATUS_COLORS: Record<StockStatus, { bg: string; text: string }> = {
  'IN STOCK': { bg: '#E8F5E9', text: '#2E7D32' },
  'LOW STOCK': { bg: '#FFF3E0', text: '#E65100' },
  'OUT OF STOCK': { bg: '#FFEBEE', text: '#C62828' },
};

export function InventoryScreen() {
  const user = useAuthStore((state) => state.user);
  const [search, setSearch] = useState('');
  const [apiProducts, setApiProducts] = useState<Product[]>(PRODUCTS);
  const [stats, setStats] = useState<ProductStats | undefined>();

  const scope = { dealerId: user?.dealer?.id, userId: user?.dealer?.id ? undefined : user?.id };

  async function loadInventory() {
    try {
      const [productsResponse, statsResponse] = await Promise.all([
        listProducts({ ...scope, search: search || undefined }),
        getProductStats(scope),
      ]);
      setStats(statsResponse);
      setApiProducts(productsResponse.items.map(toInventoryProduct));
    } catch {
      // Keep local fallback inventory.
    }
  }

  useEffect(() => {
    loadInventory();
  }, [user?.id, user?.dealer?.id]);

  function toInventoryProduct(product: DealerProduct, index: number): Product {
    return {
      id: product.id,
      name: product.name,
      category: product.category?.name ?? 'Other',
      sku: product.sku,
      status: product.statusLabel as StockStatus,
      statusDetail: product.statusDetail,
      image: '',
    };
  }

  const filtered = apiProducts.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <SafeAreaView style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable>
          <Ionicons name="menu-outline" size={24} color={marketplaceColors.primaryDark} />
        </Pressable>
        <Text style={styles.headerTitle}>AgroConnect</Text>
        <Pressable onPress={() => router.push('/dealer/notifications')}>
          <Ionicons name="notifications-outline" size={24} color={marketplaceColors.primaryDark} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Search */}
        <View style={styles.searchRow}>
          <Ionicons name="search-outline" size={16} color="#888" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search inventory..."
            placeholderTextColor="#AAAAAA"
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* Filter button */}
        <View style={styles.filterRow}>
          <Pressable style={styles.filterButton}>
            <Ionicons name="options-outline" size={16} color="#444" />
            <Text style={styles.filterText}>Filters</Text>
          </Pressable>
        </View>

        {/* Stats grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Total Items</Text>
            <Text style={styles.statValue}>{stats?.totalItems ?? apiProducts.length}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Low Stock</Text>
            <Text style={[styles.statValue, { color: '#E65100' }]}>{stats?.lowStock ?? 0}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Out of Stock</Text>
            <Text style={[styles.statValue, { color: '#C62828' }]}>{stats?.outOfStock ?? 0}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Active Value</Text>
            <Text style={[styles.statValue, { color: marketplaceColors.primaryDark }]}>{formatUgx(stats?.activeValue ?? 0)}</Text>
          </View>
        </View>

        {/* Products list */}
        <Text style={styles.sectionTitle}>All Products</Text>
        <View style={styles.productList}>
          {filtered.map((product, index) => {
            const statusColor = STATUS_COLORS[product.status];
            return (
              <View
                key={product.id}
                style={[
                  styles.productRow,
                  index < filtered.length - 1 && styles.productRowBorder,
                ]}
              >
                <View style={styles.productImageWrap}>
                  <Image source={product.image ? { uri: product.image } : productImage(index)} style={styles.productImage} />
                </View>
                <View style={styles.productInfo}>
                  <Text style={styles.productName}>{product.name}</Text>
                  <Text style={styles.productMeta}>
                    Category: {product.category} • SKU: {product.sku}
                  </Text>
                  <View style={styles.productStatusRow}>
                    <View style={[styles.statusBadge, { backgroundColor: statusColor.bg }]}>
                      <Text style={[styles.statusBadgeText, { color: statusColor.text }]}>
                        {product.status}
                      </Text>
                    </View>
                    <Text style={styles.statusDetail}>{product.statusDetail}</Text>
                  </View>
                </View>
                <View style={styles.productActions}>
                  <Pressable style={styles.actionBtn} onPress={() => router.push({ pathname: '/product-details', params: { id: product.id } })}>
                    <Ionicons name="pencil-outline" size={18} color={marketplaceColors.primary} />
                  </Pressable>
                  <Pressable
                    style={styles.actionBtn}
                    onPress={async () => {
                      await deleteProduct(product.id, scope);
                      await loadInventory();
                    }}
                  >
                    <Ionicons name="trash-outline" size={18} color="#E53935" />
                  </Pressable>
                  <Pressable style={styles.actionBtn}>
                    <Ionicons name="chevron-forward" size={18} color="#888" />
                  </Pressable>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* FAB */}
      <Pressable
        style={styles.fab}
        onPress={() => router.push('/addNewProduct')}
      >
        <Ionicons name="add" size={20} color="#FFF" />
        <Text style={styles.fabText}>Add Product</Text>
      </Pressable>
        <DealerFloatingTabBar active="market" />
      </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F2F5EE' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: marketplaceColors.primaryDark,
  },
  content: { padding: 16, paddingBottom: 100 },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
    marginBottom: 12,
    ...marketplaceShadows.card,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 14, color: '#101710' },
  filterRow: { alignItems: 'center', marginBottom: 16 },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#DDE6D6',
    backgroundColor: '#FFFFFF',
  },
  filterText: { fontSize: 13, fontWeight: '700', color: '#444' },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 14,
    ...marketplaceShadows.card,
  },
  statLabel: { fontSize: 12, color: '#888', marginBottom: 4 },
  statValue: { fontSize: 22, fontWeight: '900', color: '#101710' },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#101710',
    marginBottom: 12,
  },
  productList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    ...marketplaceShadows.card,
  },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 10,
  },
  productRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F0F4ED',
  },
  productImageWrap: {
    width: 60,
    height: 60,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#F0F4ED',
  },
  productImage: { width: 60, height: 60 },
  productInfo: { flex: 1 },
  productName: { fontSize: 14, fontWeight: '800', color: '#101710', marginBottom: 2 },
  productMeta: { fontSize: 11, color: '#888', marginBottom: 6 },
  productStatusRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  statusBadge: {
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  statusBadgeText: { fontSize: 9, fontWeight: '900' },
  statusDetail: { fontSize: 12, color: '#444' },
  productActions: { flexDirection: 'row', alignItems: 'center' },
  actionBtn: { padding: 6 },
  fab: {
    position: 'absolute',
    bottom: 90,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F57C00',
    borderRadius: 28,
    paddingHorizontal: 20,
    paddingVertical: 14,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  fabText: { fontSize: 15, fontWeight: '800', color: '#FFFFFF' },
});
