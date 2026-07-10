import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { formatUgx, productImage } from '@/api/marketplace-adapters';
import { listOrders } from '@/api/orders';
import { AppScreen, StaticScreen } from '@/components/marketplace/AppScreen';
import { FloatingTabBar } from '@/components/marketplace/FloatingTabBar';
import { appImages, orderItems } from '@/constants/mock-marketplace';
import { marketplaceColors, marketplaceShadows } from '@/constants/marketplace';
import { useAuthStore } from '@/store/auth.store';

export function OrdersScreen() {
  const user = useAuthStore((state) => state.user);
  const [orders, setOrders] = useState(
    orderItems.map((order, index) => ({
      id: `fallback-${index}`,
      number: order.number,
      title: order.title,
      status: order.status,
      total: order.total,
      statusColor: order.statusColor,
      images: order.images,
    })),
  );

  useEffect(() => {
    let mounted = true;

    async function loadOrders() {
      try {
        const response = await listOrders({ userId: user?.id });
        if (!mounted || response.items.length === 0) return;
        setOrders(
          response.items.map((order, index) => ({
            id: order.id,
            number: `#${order.number}`,
            title: order.items?.[0]?.product?.name ?? 'Marketplace order',
            status: order.status.replace(/_/g, ' '),
            total: formatUgx(order.total),
            statusColor: order.status === 'DELIVERED' ? '#99F09B' : '#FFD992',
            images: [productImage(index)],
          })),
        );
      } catch {
        // Keep bundled fallback orders.
      }
    }

    loadOrders();
    return () => {
      mounted = false;
    };
  }, [user?.id]);

  return (
    <StaticScreen>
      <AppScreen title="AgroMarket">
        <Text style={styles.title}>My Orders</Text>
        <Text style={styles.subtitle}>Track your supplies and equipment deliveries.</Text>
        <View style={styles.tabs}>
          <Text style={[styles.tab, styles.activeTab]}>Active</Text>
          <Text style={styles.tab}>Completed</Text>
          <Text style={styles.tab}>Cancelled</Text>
        </View>
        <View style={styles.orderList}>
          {orders.map((order) => (
            <View key={order.number} style={[styles.orderCard, marketplaceShadows.card]}>
              <View style={styles.orderTop}>
                <View style={styles.orderTopLeft}>
                  <Text style={styles.orderNumber}>ORDER {order.number}</Text>
                  <Text style={styles.orderTitle}>{order.title}</Text>
                </View>
                <View style={[styles.statusPill, { backgroundColor: order.statusColor }]}>
                  <Ionicons name="car-outline" size={12} color={marketplaceColors.primaryDark} />
                  <Text style={styles.statusText}>{order.status}</Text>
                </View>
              </View>
              <View style={styles.imageRow}>
                {order.images.map((image, index) => (
                  <Image key={`${order.number}-${index}`} source={image} style={styles.orderImage} />
                ))}
                {order.images.length > 1 ? (
                  <View style={styles.moreBox}>
                    <Text style={styles.moreText}>+1</Text>
                  </View>
                ) : null}
              </View>
              <View style={styles.line} />
              <View style={styles.orderBottom}>
                <View>
                  <Text style={styles.totalLabel}>Total Amount</Text>
                  <Text style={styles.totalText}>{order.total}</Text>
                </View>
                <Pressable
                  onPress={() =>
                    router.push({
                      pathname: '/track-order',
                      params: order.id.startsWith('fallback-') ? undefined : { id: order.id },
                    })
                  }
                  style={styles.detailsButton}
                >
                  <Text style={styles.detailsText}>View Details</Text>
                </Pressable>
              </View>
            </View>
          ))}
        </View>
        <View style={styles.offerCard}>
          <Text style={styles.offerBadge}>Exclusive Offer</Text>
          <Text style={styles.offerTitle}>Get 15% off on Irrigation Kits</Text>
          <Text style={styles.offerText}>Upgrade your farm efficiency with modern watering systems.</Text>
          <Pressable style={styles.offerButton}>
            <Text style={styles.offerButtonText}>Shop Now</Text>
          </Pressable>
          <Ionicons name="leaf-outline" size={80} color="rgba(255,255,255,0.18)" style={styles.offerLeaf} />
        </View>
      </AppScreen>
      <FloatingTabBar active="orders" />
    </StaticScreen>
  );
}

const styles = StyleSheet.create({
  title: {
    color: '#101710',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 0,
  },
  subtitle: {
    color: marketplaceColors.inkSoft,
    fontSize: 13,
    marginTop: 4,
  },
  tabs: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
    marginBottom: 14,
  },
  tab: {
    backgroundColor: '#E9EFE4',
    color: marketplaceColors.inkSoft,
    borderRadius: 20,
    overflow: 'hidden',
    paddingHorizontal: 16,
    paddingVertical: 7,
    fontSize: 12,
    fontWeight: '800',
  },
  activeTab: {
    backgroundColor: marketplaceColors.primaryDark,
    color: '#FFFFFF',
  },
  orderList: {
    gap: 14,
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8DC',
  },
  orderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  orderTopLeft: {
    flex: 1,
  },
  orderNumber: {
    color: marketplaceColors.inkMuted,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  orderTitle: {
    color: '#101710',
    fontSize: 14,
    fontWeight: '900',
    marginTop: 3,
  },
  statusPill: {
    borderRadius: 14,
    paddingHorizontal: 10,
    height: 26,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexShrink: 0,
  },
  statusText: {
    color: marketplaceColors.primaryDark,
    fontSize: 11,
    fontWeight: '900',
  },
  imageRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
  },
  orderImage: {
    width: 56,
    height: 56,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  moreBox: {
    width: 56,
    height: 56,
    borderRadius: 8,
    backgroundColor: '#E9EFE4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreText: {
    color: marketplaceColors.inkSoft,
    fontSize: 14,
    fontWeight: '900',
  },
  line: {
    height: 1,
    backgroundColor: '#DCE4D7',
    marginTop: 14,
  },
  orderBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  totalLabel: {
    color: marketplaceColors.inkMuted,
    fontSize: 11,
    fontWeight: '800',
  },
  totalText: {
    color: marketplaceColors.primaryDark,
    fontSize: 16,
    fontWeight: '900',
  },
  detailsButton: {
    borderWidth: 1,
    borderColor: marketplaceColors.primaryDark,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  detailsText: {
    color: marketplaceColors.primaryDark,
    fontSize: 13,
    fontWeight: '800',
  },
  offerCard: {
    marginTop: 18,
    borderRadius: 14,
    backgroundColor: '#FF7F11',
    padding: 18,
    overflow: 'hidden',
  },
  offerBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.24)',
    color: '#FFFFFF',
    borderRadius: 6,
    overflow: 'hidden',
    paddingHorizontal: 10,
    paddingVertical: 4,
    fontSize: 11,
    fontWeight: '900',
  },
  offerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '900',
    marginTop: 10,
  },
  offerText: {
    color: '#FFFFFF',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 8,
  },
  offerButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    alignSelf: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginTop: 14,
  },
  offerButtonText: {
    color: '#9C3F00',
    fontSize: 13,
    fontWeight: '800',
  },
  offerLeaf: {
    position: 'absolute',
    right: 20,
    bottom: 20,
  },
});
