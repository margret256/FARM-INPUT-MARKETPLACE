import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';

import { formatUgx } from '@/api/marketplace-adapters';
import { listOrders } from '@/api/orders';
import { getProductStats, listProducts } from '@/api/products';
import { marketplaceColors, marketplaceShadows } from '@/constants/marketplace';
import { DealerFloatingTabBar } from '@/components/marketplace/DealerFloatingTabBar';
import { useAuthStore } from '@/store/auth.store';

const TOP_SELLERS = [
  { name: 'NPK 15-15-15', value: 'N1.2M', progress: 0.95 },
  { name: 'Hybrid Maize G1', value: 'N840k', progress: 0.7 },
  { name: 'Glyphosate 480', value: 'N510k', progress: 0.45 },
  { name: 'Heavy Duty Trowel', value: 'N220k', progress: 0.2 },
];

const RECENT_ORDERS = [
  { id: '#AG-9842', customer: 'Oluwaseun Farms', location: 'Kano, Nigeria', status: 'Completed', statusColor: '#2E7D32', statusBg: '#E8F5E9' },
  { id: '#AG-9841', customer: 'Green Valley Coop', location: 'Enugu, Nigeria', status: 'Pending', statusColor: '#E65100', statusBg: '#FFF3E0' },
  { id: '#AG-9839', customer: 'Ibrahim Agro Traders', location: 'Kaduna, Nigeria', status: 'Completed', statusColor: '#2E7D32', statusBg: '#E8F5E9' },
];

export function DealerAnalyticsScreen() {
  const user = useAuthStore((state) => state.user);
  const fallbackMetricCards = [
    {
      label: 'MONTHLY REVENUE',
      value: '₦4.2M',
      trend: '↑ 12.5% vs last month',
      trendColor: marketplaceColors.primary,
      icon: 'cash-outline',
      iconColor: marketplaceColors.primary,
    },
    {
      label: 'TOTAL ORDERS',
      value: '842',
      trend: '↑ 8% growth',
      trendColor: marketplaceColors.primary,
      icon: 'cube-outline',
      iconColor: marketplaceColors.primary,
    },
    {
      label: 'AVG. ORDER VALUE',
      value: '₦4.9k',
      trend: '— Stable',
      trendColor: '#888',
      icon: 'stats-chart-outline',
      iconColor: marketplaceColors.primary,
    },
    {
      label: 'ACTIVE CUSTOMERS',
      value: '1,240',
      trend: '↓ 2.1% churn',
      trendColor: '#E53935',
      icon: 'people-outline',
      iconColor: marketplaceColors.primary,
    },
  ];
  const [metricCards, setMetricCards] = useState(fallbackMetricCards);
  const [topSellers, setTopSellers] = useState(TOP_SELLERS);
  const [recentOrders, setRecentOrders] = useState(RECENT_ORDERS);

  useEffect(() => {
    let mounted = true;

    async function loadAnalytics() {
      try {
        const scope = { dealerId: user?.dealer?.id, userId: user?.dealer?.id ? undefined : user?.id };
        const [stats, products, orders] = await Promise.all([
          getProductStats(scope),
          listProducts(scope),
          listOrders({ dealerId: user?.dealer?.id }),
        ]);
        if (!mounted) return;

        setMetricCards([
          { ...fallbackMetricCards[0], value: formatUgx(stats.revenue), trend: `${stats.totalSales} delivered sales` },
          { ...fallbackMetricCards[1], value: String(orders.total ?? stats.orders), trend: `${stats.orders} total orders` },
          { ...fallbackMetricCards[2], value: orders.total ? formatUgx(stats.revenue / Math.max(1, orders.total)) : formatUgx(0) },
          { ...fallbackMetricCards[3], value: String(stats.inStock), trend: `${stats.lowStock} low stock` },
        ]);

        if (products.items.length > 0) {
          const maxValue = Math.max(...products.items.map((item) => item.price * item.stock), 1);
          setTopSellers(
            products.items.slice(0, 4).map((product) => ({
              name: product.name,
              value: formatUgx(product.price * product.stock),
              progress: Math.max(0.1, (product.price * product.stock) / maxValue),
            })),
          );
        }

        if (orders.items.length > 0) {
          setRecentOrders(
            orders.items.slice(0, 3).map((order) => ({
              id: `#${order.number}`,
              customer: order.customer
                ? `${order.customer.firstName} ${order.customer.lastName}`.replace(' -', '')
                : 'Customer',
              location: order.customer?.phone ?? 'Marketplace',
              status: order.status.replace(/_/g, ' '),
              statusColor: order.status === 'DELIVERED' ? '#2E7D32' : '#E65100',
              statusBg: order.status === 'DELIVERED' ? '#E8F5E9' : '#FFF3E0',
            })),
          );
        }
      } catch {
        // Keep fallback analytics.
      }
    }

    loadAnalytics();
    return () => {
      mounted = false;
    };
  }, [user?.id, user?.dealer?.id]);

  return (
    <SafeAreaView style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable>
          <Ionicons name="menu-outline" size={24} color={marketplaceColors.primaryDark} />
        </Pressable>
        <Text style={styles.headerTitle}>AgroConnect</Text>
        <View style={styles.headerIcons}>
          <Ionicons name="search-outline" size={22} color={marketplaceColors.primaryDark} />
          <Pressable onPress={() => router.push('/dealer/notifications')}>
            <View style={styles.notifWrap}>
              <Ionicons name="notifications-outline" size={22} color={marketplaceColors.primaryDark} />
              <View style={styles.notifDot} />
            </View>
          </Pressable>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.pageTitle}>Dealer Analytics</Text>
        <Text style={styles.pageSubtitle}>
          Performance insights for Harvesters Co. • Verified Dealer
        </Text>

        {/* Metric cards */}
        {metricCards.map((card) => (
          <View key={card.label} style={styles.metricCard}>
            <View style={styles.metricTop}>
              <Text style={styles.metricLabel}>{card.label}</Text>
              <Ionicons name={card.icon as any} size={20} color={card.iconColor} />
            </View>
            <Text style={styles.metricValue}>{card.value}</Text>
            <Text style={[styles.metricTrend, { color: card.trendColor }]}>{card.trend}</Text>
          </View>
        ))}

        {/* Revenue Growth Chart */}
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <View>
              <Text style={styles.chartTitle}>Revenue Growth</Text>
              <Text style={styles.chartSubtitle}>Last 30 Days trend</Text>
            </View>
            <View style={styles.chartToggle}>
              <Pressable style={styles.toggleBtn}>
                <Text style={styles.toggleBtnText}>Monthly</Text>
              </Pressable>
              <Pressable style={[styles.toggleBtn, styles.toggleBtnActive]}>
                <Text style={[styles.toggleBtnText, styles.toggleBtnTextActive]}>Weekly</Text>
              </Pressable>
            </View>
          </View>

          {/* Simple SVG-like chart using views */}
          <View style={styles.chartArea}>
            <View style={styles.chartLine}>
              {/* Simulated line chart using a curved path via borders */}
              <View style={styles.chartCurve} />
            </View>
          </View>
          <View style={styles.chartXAxis}>
            {['W1', 'W2', 'W3', 'W4'].map((w) => (
              <Text key={w} style={styles.chartXLabel}>{w}</Text>
            ))}
          </View>
        </View>

        {/* Top Sellers */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Top Sellers</Text>
          {topSellers.map((item) => (
            <View key={item.name} style={styles.sellerRow}>
              <View style={styles.sellerImageWrap}>
                <View style={styles.sellerImagePlaceholder} />
              </View>
              <View style={styles.sellerInfo}>
                <Text style={styles.sellerName}>{item.name}</Text>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${item.progress * 100}%` }]} />
                </View>
              </View>
              <Text style={styles.sellerValue}>{item.value}</Text>
            </View>
          ))}
          <Pressable style={styles.viewInventoryBtn}>
            <Text style={styles.viewInventoryText}>View Full Inventory</Text>
          </Pressable>
        </View>

        {/* Recent Orders */}
        <View style={styles.card}>
          <View style={styles.recentOrdersHeader}>
            <Text style={styles.sectionTitle}>Recent Orders</Text>
            <Pressable style={styles.viewAllBtn}>
              <Text style={styles.viewAllText}>View All </Text>
              <Ionicons name="chevron-forward" size={12} color={marketplaceColors.primaryDark} />
            </Pressable>
          </View>

          {/* Table header */}
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, { flex: 1 }]}>Order ID</Text>
            <Text style={[styles.tableHeaderText, { flex: 2 }]}>Customer</Text>
            <Text style={[styles.tableHeaderText, { flex: 1, textAlign: 'right' }]}>Status</Text>
          </View>

          {recentOrders.map((order) => (
            <View key={order.id} style={styles.recentOrderRow}>
              <Text style={[styles.recentOrderId, { flex: 1 }]}>{order.id}</Text>
              <View style={{ flex: 2 }}>
                <Text style={styles.recentOrderCustomer}>{order.customer}</Text>
                <Text style={styles.recentOrderLocation}>{order.location}</Text>
              </View>
              <View style={{ flex: 1, alignItems: 'flex-end' }}>
                <View style={[styles.statusPill, { backgroundColor: order.statusBg }]}>
                  <Text style={[styles.statusPillText, { color: order.statusColor }]}>
                    {order.status}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* FAB */}
      <Pressable style={styles.fab}>
        <Ionicons name="add" size={24} color="#FFF" />
      </Pressable>
         <DealerFloatingTabBar active="profile" />
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
  headerIcons: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  notifWrap: { position: 'relative' },
  notifDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E53935',
  },
  content: { padding: 16, paddingBottom: 100 },
  pageTitle: { fontSize: 22, fontWeight: '900', color: '#101710', marginBottom: 4 },
  pageSubtitle: { fontSize: 12, color: '#888', marginBottom: 20, lineHeight: 17 },
  metricCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    ...marketplaceShadows.card,
  },
  metricTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  metricLabel: { fontSize: 10, fontWeight: '800', color: '#888', letterSpacing: 1 },
  metricValue: { fontSize: 28, fontWeight: '900', color: '#101710', marginBottom: 4 },
  metricTrend: { fontSize: 12, fontWeight: '600' },
  chartCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    ...marketplaceShadows.card,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  chartTitle: { fontSize: 16, fontWeight: '800', color: '#101710' },
  chartSubtitle: { fontSize: 11, color: '#888', marginTop: 2 },
  chartToggle: {
    flexDirection: 'row',
    backgroundColor: '#F0F4ED',
    borderRadius: 20,
    padding: 3,
    gap: 2,
  },
  toggleBtn: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
  },
  toggleBtnActive: {
    backgroundColor: marketplaceColors.primaryDark,
  },
  toggleBtnText: { fontSize: 11, fontWeight: '700', color: '#888' },
  toggleBtnTextActive: { color: '#FFFFFF' },
  chartArea: {
    height: 100,
    justifyContent: 'flex-end',
    marginBottom: 8,
  },
  chartLine: {
    height: 60,
    justifyContent: 'center',
  },
  chartCurve: {
    height: 2,
    backgroundColor: marketplaceColors.primary,
    borderRadius: 1,
    marginHorizontal: 4,
    opacity: 0.6,
  },
  chartXAxis: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  chartXLabel: { fontSize: 11, color: '#888', fontWeight: '600' },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    ...marketplaceShadows.card,
  },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#101710', marginBottom: 14 },
  sellerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  sellerImageWrap: {
    width: 36,
    height: 36,
    borderRadius: 6,
    overflow: 'hidden',
  },
  sellerImagePlaceholder: {
    width: 36,
    height: 36,
    backgroundColor: '#C8DDB8',
    borderRadius: 6,
  },
  sellerInfo: { flex: 1 },
  sellerName: { fontSize: 13, fontWeight: '700', color: '#101710', marginBottom: 4 },
  progressBar: {
    height: 6,
    backgroundColor: '#F0F4ED',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: 6,
    backgroundColor: marketplaceColors.primaryDark,
    borderRadius: 3,
  },
  sellerValue: { fontSize: 13, fontWeight: '800', color: '#101710', minWidth: 50, textAlign: 'right' },
  viewInventoryBtn: {
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DDE6D6',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  viewInventoryText: { fontSize: 13, fontWeight: '700', color: '#444' },
  recentOrdersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  viewAllBtn: { flexDirection: 'row', alignItems: 'center' },
  viewAllText: { fontSize: 12, fontWeight: '700', color: marketplaceColors.primaryDark },
  tableHeader: {
    flexDirection: 'row',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F4ED',
    marginBottom: 8,
  },
  tableHeaderText: { fontSize: 11, fontWeight: '700', color: '#888' },
  recentOrderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F4ED',
  },
  recentOrderId: { fontSize: 12, fontWeight: '700', color: '#101710' },
  recentOrderCustomer: { fontSize: 12, fontWeight: '700', color: '#101710' },
  recentOrderLocation: { fontSize: 11, color: '#888', marginTop: 1 },
  statusPill: {
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusPillText: { fontSize: 11, fontWeight: '700' },
  fab: {
    position: 'absolute',
    bottom: 90,
    right: 16,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#F57C00',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
});
