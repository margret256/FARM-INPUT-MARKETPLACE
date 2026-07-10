import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { formatUgx } from '@/api/marketplace-adapters';
import { listOrders, updateOrderStatus, type ApiOrder } from '@/api/orders';
import { marketplaceColors, marketplaceShadows } from '@/constants/marketplace';
import { DealerFloatingTabBar } from '@/components/marketplace/DealerFloatingTabBar';
import { useAuthStore } from '@/store/auth.store';

type OrderStatus = 'NEW ORDER' | 'Processing' | 'Shipped';

type Order = {
  id: string;
  product: string;
  orderId: string;
  timeAgo?: string;
  customer: string;
  customerRole?: string;
  amount: string;
  status: OrderStatus;
  avatar?: string;
};

const ORDERS: Order[] = [
  {
    id: '1',
    product: 'Tractor Spare Parts Bundle',
    orderId: '#AC-88901',
    timeAgo: '2 mins ago',
    customer: 'Samuel Okafor',
    amount: '$1,240.00',
    status: 'NEW ORDER',
  },
  {
    id: '2',
    product: 'Premium Hybrid Seeds (50kg)',
    orderId: '#AC-88744',
    customer: 'David Chen',
    customerRole: 'Verified Buyer',
    amount: '',
    status: 'Processing',
    avatar: 'https://via.placeholder.com/36x36/4CAF50/FFFFFF?text=D',
  },
  {
    id: '3',
    product: 'Organic NPK Fertilizer (10 Bags)',
    orderId: '#AC-88612',
    customer: 'Elena Rodriguez',
    customerRole: 'Golden Member',
    amount: '',
    status: 'Shipped',
    avatar: 'https://via.placeholder.com/36x36/FF9800/FFFFFF?text=E',
  },
];

const STATUS_STYLE: Record<OrderStatus, { bg: string; text: string }> = {
  'NEW ORDER': { bg: marketplaceColors.primaryDark, text: '#FFFFFF' },
  Processing: { bg: '#FF9800', text: '#FFFFFF' },
  Shipped: { bg: '#E8F5E9', text: '#2E7D32' },
};

const ORDER_ITEMS = [
  { label: 'Tractor Spare Parts x 1', value: '$980.00' },
  { label: 'Installation Service x 1', value: '$200.00' },
  { label: 'Express Shipping', value: '$60.00' },
];

export function OrderManagementScreen() {
  const user = useAuthStore((state) => state.user);
  const [orders, setOrders] = useState<Order[]>(ORDERS);
  const tabs = [`All Orders (${orders.length})`, 'New', 'Processing', 'Shipped'];
  const activeTab = 0;

  async function loadOrders() {
    try {
      const response = await listOrders({ dealerId: user?.dealer?.id });
      if (response.items.length === 0) return;
      setOrders(response.items.map(toDealerOrder));
    } catch {
      // Keep local fallback orders.
    }
  }

  useEffect(() => {
    loadOrders();
  }, [user?.dealer?.id]);

  function toDealerOrder(order: ApiOrder): Order {
    const status: OrderStatus =
      order.status === 'PENDING'
        ? 'NEW ORDER'
        : order.status === 'SHIPPED' || order.status === 'DELIVERED'
          ? 'Shipped'
          : 'Processing';

    return {
      id: order.id,
      product: order.items?.[0]?.product?.name ?? 'Marketplace order',
      orderId: `#${order.number}`,
      timeAgo: new Date(order.createdAt).toLocaleString(),
      customer: order.customer
        ? `${order.customer.firstName} ${order.customer.lastName}`.replace(' -', '')
        : 'Customer',
      customerRole: 'Verified Buyer',
      amount: formatUgx(order.total),
      status,
    };
  }

  async function handleStatus(orderId: string, status: 'CONFIRMED' | 'CANCELLED') {
    if (orderId.startsWith('fallback-')) return;
    await updateOrderStatus(orderId, status);
    await loadOrders();
  }

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
        <Text style={styles.pageTitle}>Order Management</Text>
        <Text style={styles.pageSubtitle}>
          Manage your active dealership inventory and shipments.
        </Text>

        {/* Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tabsScroll}
          contentContainerStyle={styles.tabsContent}
        >
          {tabs.map((tab, i) => (
            <Pressable
              key={tab}
              style={[styles.tab, i === activeTab && styles.tabActive]}
            >
              <Text style={[styles.tabText, i === activeTab && styles.tabTextActive]}>
                {tab}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Orders */}
        {orders.map((order) => {
          const statusStyle = STATUS_STYLE[order.status];
          const isNew = order.status === 'NEW ORDER';

          return (
            <View key={order.id} style={[styles.orderCard, isNew && styles.orderCardNew]}>
              {/* Status badge top-right */}
              <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                <Text style={[styles.statusBadgeText, { color: statusStyle.text }]}>
                  {order.status}
                </Text>
              </View>

              <View style={styles.orderTop}>
                <View style={styles.orderIconWrap}>
                  <Ionicons name="cube-outline" size={22} color={marketplaceColors.primary} />
                </View>
                <View style={styles.orderInfo}>
                  <Text style={styles.orderProduct}>{order.product}</Text>
                  <Text style={styles.orderMeta}>
                    Order ID: {order.orderId}
                    {order.timeAgo ? ` • ${order.timeAgo}` : ` • ${order.status}`}
                  </Text>
                </View>
              </View>

              <View style={styles.orderBottom}>
                {order.avatar ? (
                  <View style={styles.customerRow}>
                    <Image source={{ uri: order.avatar }} style={styles.avatar} />
                    <View>
                      <Text style={styles.customerName}>{order.customer}</Text>
                      <Text style={styles.customerRole}>{order.customerRole}</Text>
                    </View>
                  </View>
                ) : (
                  <View style={styles.customerRow}>
                    <Ionicons name="person-outline" size={16} color="#888" />
                    <Text style={styles.customerName}>{order.customer}</Text>
                  </View>
                )}

                {order.amount ? (
                  <Text style={styles.orderAmount}>{order.amount}</Text>
                ) : (
                  <Pressable style={styles.messageBtn}>
                    <Ionicons name="chatbox-outline" size={18} color="#888" />
                  </Pressable>
                )}
              </View>

              {isNew && (
                <View style={styles.actionButtonsRow}>
                  <Pressable style={styles.rejectButton} onPress={() => handleStatus(order.id, 'CANCELLED')}>
                    <Text style={styles.rejectButtonText}>Reject</Text>
                  </Pressable>
                  <Pressable style={styles.acceptButton} onPress={() => handleStatus(order.id, 'CONFIRMED')}>
                    <Text style={styles.acceptButtonText}>Accept Order</Text>
                  </Pressable>
                </View>
              )}
            </View>
          );
        })}

        {/* Current Order Details */}
        <View style={styles.detailsCard}>
          <View style={styles.detailsHeader}>
            <Text style={styles.detailsTitle}>Current Order Details</Text>
            <Ionicons name="ellipsis-vertical" size={18} color="#888" />
          </View>

          {/* Map placeholder */}
          <View style={styles.mapWrap}>
            <View style={styles.mapPlaceholder} />
            <View style={styles.mapLocationBadge}>
              <Ionicons name="location-outline" size={14} color={marketplaceColors.primaryDark} />
              <Text style={styles.mapLocationText}>Ibadan, Nigeria Delivery Zone</Text>
            </View>
          </View>

          {/* Customer location */}
          <View style={styles.detailSection}>
            <Text style={styles.detailSectionLabel}>CUSTOMER LOCATION</Text>
            <View style={styles.locationRow}>
              <Ionicons name="map-outline" size={16} color="#888" />
              <Text style={styles.locationText}>
                Block 4, Agritown Estate, Off Greenvalley Bypass, Ibadan West.
              </Text>
            </View>
          </View>

          {/* Order items */}
          <View style={styles.detailSection}>
            <Text style={styles.detailSectionLabel}>ORDER ITEMS</Text>
            {ORDER_ITEMS.map((item) => (
              <View key={item.label} style={styles.orderItemRow}>
                <Text style={styles.orderItemLabel}>{item.label}</Text>
                <Text style={styles.orderItemValue}>{item.value}</Text>
              </View>
            ))}
            <View style={styles.divider} />
            <View style={styles.orderItemRow}>
              <Text style={styles.totalLabel}>Total Amount</Text>
              <Text style={styles.totalValue}>$1,240.00</Text>
            </View>
          </View>

          {/* Action buttons */}
          <View style={styles.detailActions}>
            <Pressable style={styles.printButton}>
              <Ionicons name="print-outline" size={16} color="#444" />
              <Text style={styles.printButtonText}>Print Label</Text>
            </Pressable>
            <Pressable style={styles.invoiceButton}>
              <Ionicons name="document-outline" size={16} color="#FFF" />
              <Text style={styles.invoiceButtonText}>Invoice</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      {/* FAB */}
      <Pressable style={styles.fab}>
        <Ionicons name="add" size={24} color="#FFF" />
      </Pressable>
        <DealerFloatingTabBar active="orders" />
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
  pageTitle: { fontSize: 22, fontWeight: '900', color: '#101710', marginBottom: 4 },
  pageSubtitle: { fontSize: 12, color: '#888', marginBottom: 16, lineHeight: 17 },
  tabsScroll: { marginBottom: 16 },
  tabsContent: { gap: 8, paddingRight: 16 },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DDE6D6',
  },
  tabActive: {
    backgroundColor: marketplaceColors.primaryDark,
    borderColor: marketplaceColors.primaryDark,
  },
  tabText: { fontSize: 12, fontWeight: '700', color: '#666' },
  tabTextActive: { color: '#FFFFFF' },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    ...marketplaceShadows.card,
  },
  orderCardNew: {
    borderWidth: 1.5,
    borderColor: marketplaceColors.primaryDark,
  },
  statusBadge: {
    alignSelf: 'flex-end',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 10,
  },
  statusBadgeText: { fontSize: 11, fontWeight: '800' },
  orderTop: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  orderIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#F0F4ED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderInfo: { flex: 1 },
  orderProduct: { fontSize: 14, fontWeight: '800', color: '#101710', marginBottom: 3 },
  orderMeta: { fontSize: 11, color: '#888' },
  orderBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  customerRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  avatar: { width: 36, height: 36, borderRadius: 18 },
  customerName: { fontSize: 13, fontWeight: '700', color: '#101710' },
  customerRole: { fontSize: 10, color: '#888' },
  orderAmount: {
    fontSize: 15,
    fontWeight: '900',
    color: marketplaceColors.primaryDark,
  },
  messageBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F0F4ED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  rejectButton: {
    flex: 1,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#FFF0F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rejectButtonText: { fontSize: 14, fontWeight: '700', color: '#E53935' },
  acceptButton: {
    flex: 2,
    height: 44,
    borderRadius: 8,
    backgroundColor: marketplaceColors.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  acceptButtonText: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },
  detailsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    ...marketplaceShadows.card,
  },
  detailsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailsTitle: { fontSize: 15, fontWeight: '800', color: '#101710' },
  mapWrap: { borderRadius: 10, overflow: 'hidden', marginBottom: 14, position: 'relative' },
  mapPlaceholder: {
    height: 140,
    backgroundColor: '#C8DDB8',
    borderRadius: 10,
  },
  mapLocationBadge: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  mapLocationText: { fontSize: 12, fontWeight: '700', color: '#101710' },
  detailSection: { marginBottom: 14 },
  detailSectionLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#888',
    letterSpacing: 1,
    marginBottom: 8,
  },
  locationRow: { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
  locationText: { flex: 1, fontSize: 13, color: '#444', lineHeight: 18 },
  orderItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  orderItemLabel: { fontSize: 13, color: '#444' },
  orderItemValue: { fontSize: 13, color: '#444', fontWeight: '700' },
  divider: { height: 1, backgroundColor: '#F0F4ED', marginVertical: 8 },
  totalLabel: { fontSize: 14, fontWeight: '900', color: '#101710' },
  totalValue: { fontSize: 14, fontWeight: '900', color: '#101710' },
  detailActions: { flexDirection: 'row', gap: 10 },
  printButton: {
    flex: 1,
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DDE6D6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
  },
  printButtonText: { fontSize: 13, fontWeight: '700', color: '#444' },
  invoiceButton: {
    flex: 1,
    height: 44,
    borderRadius: 8,
    backgroundColor: marketplaceColors.primaryDark,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  invoiceButtonText: { fontSize: 13, fontWeight: '700', color: '#FFFFFF' },
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
