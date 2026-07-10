import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { formatUgx } from '@/api/marketplace-adapters';
import { trackOrder } from '@/api/orders';
import { AppScreen, StaticScreen } from '@/components/marketplace/AppScreen';
import { FloatingTabBar } from '@/components/marketplace/FloatingTabBar';
import { appImages } from '@/constants/mock-marketplace';
import { marketplaceColors, marketplaceShadows } from '@/constants/marketplace';

const timeline = [
  ['Order Placed', 'Oct 10, 02:30 PM', true, 'checkmark'],
  ['Payment Confirmed', 'Oct 10, 02:45 PM', true, 'checkmark'],
  ['Preparing Order', 'Oct 11, 09:00 AM', true, 'checkmark'],
  ['Shipped', 'Package is on the way to your location', true, 'car-outline'],
  ['Out for Delivery', 'Pending', false, 'bicycle-outline'],
  ['Delivered', 'Pending', false, 'checkmark-done-outline'],
] as const;

export function TrackOrderScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const [tracking, setTracking] = useState<any>();

  useEffect(() => {
    let mounted = true;

    async function loadTracking() {
      if (!params.id) return;
      try {
        const response = await trackOrder(params.id);
        if (mounted) setTracking(response);
      } catch {
        // Keep static fallback tracking.
      }
    }

    loadTracking();
    return () => {
      mounted = false;
    };
  }, [params.id]);

  const dynamicTimeline =
    tracking?.timeline?.map((step: any) => [
      step.label,
      step.timestamp ? new Date(step.timestamp).toLocaleString() : step.completed ? 'Completed' : 'Pending',
      step.completed,
      step.status === 'SHIPPED' ? 'car-outline' : step.completed ? 'checkmark' : 'bicycle-outline',
    ]) ?? timeline;
  const orderNumber = tracking?.order?.number ? `Order #${tracking.order.number}` : 'Order #AG-99821';
  const total = tracking?.order?.total ? formatUgx(tracking.order.total) : undefined;

  return (
    <StaticScreen>
      <AppScreen back help title="Track Order">
        <View style={[styles.mapCard, marketplaceShadows.card]}>
          <Image source={appImages.harvest} style={styles.mapImage} />
          <View style={styles.mapOverlay} />
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>Live Tracking</Text>
          </View>
          <View style={styles.routeLine} />
          <View style={styles.routePin} />
        </View>

        <View style={[styles.arrivalCard, marketplaceShadows.card]}>
          <Text style={styles.arrivalLabel}>ESTIMATED ARRIVAL</Text>
          <Text style={styles.arrivalTime}>{tracking?.order?.status === 'DELIVERED' ? 'Delivered' : 'In progress'}</Text>
          <View style={styles.progressTrack}>
            <View style={styles.progressFill} />
          </View>
          <View style={styles.arrivalRow}>
            <Text style={styles.orderNumber}>{orderNumber}</Text>
            <Text style={styles.distance}>{total ?? '6.4 km away'}</Text>
          </View>
        </View>

        <View style={styles.timeline}>
          {dynamicTimeline.map(([title, subtitle, completed, icon]: any, index: number) => (
            <View key={title} style={styles.timelineItem}>
              <View style={styles.timelineLeft}>
                {index < timeline.length - 1 ? <View style={[styles.verticalLine, !completed && styles.mutedLine]} /> : null}
                <View style={[styles.timelineIcon, completed ? styles.completedIcon : styles.pendingIcon, title === 'Shipped' && styles.currentIcon]}>
                  <Ionicons name={icon} size={completed ? 22 : 20} color={completed ? '#FFFFFF' : marketplaceColors.inkMuted} />
                </View>
              </View>
              <View style={styles.timelineBody}>
                <Text style={[styles.timelineTitle, completed && styles.completedTitle, title === 'Shipped' && styles.currentTitle]}>{title}</Text>
                <Text style={styles.timelineSubtitle}>{subtitle}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={[styles.riderCard, marketplaceShadows.card]}>
          <Image source={appImages.smartFarming} style={styles.riderPhoto} />
          <View style={styles.riderBody}>
            <Text style={styles.riderName}>Samuel Mwangi</Text>
            <Text style={styles.riderRating}>4.9 (240+ deliveries)</Text>
          </View>
          <Pressable style={styles.callButton}>
            <Ionicons name="call-outline" size={29} color="#FFFFFF" />
            <Text style={styles.callText}>Call Rider</Text>
          </Pressable>
        </View>
      </AppScreen>
      <FloatingTabBar active="orders" />
    </StaticScreen>
  );
}

const styles = StyleSheet.create({
  mapCard: { height: 180, borderRadius: 12, overflow: 'hidden', position: 'relative', borderWidth: 1, borderColor: '#B8C6B1' },
  mapImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  mapOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,40,20,0.28)' },
  liveBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    borderRadius: 24,
    backgroundColor: '#EAF4E8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: marketplaceColors.primary },
  liveText: { color: marketplaceColors.primaryDark, fontSize: 13, fontWeight: '900' },
  routeLine: {
    position: 'absolute',
    left: '37%',
    bottom: 24,
    width: 3,
    height: 100,
    backgroundColor: marketplaceColors.secondary,
    transform: [{ rotate: '19deg' }],
  },
  routePin: {
    position: 'absolute',
    left: '34%',
    bottom: 20,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: marketplaceColors.secondary,
    borderWidth: 1.5,
    borderColor: '#101710',
  },
  arrivalCard: { backgroundColor: '#FFFFFF', borderRadius: 14, borderWidth: 1, borderColor: '#B8C6B1', padding: 16, marginTop: 20 },
  arrivalLabel: { color: marketplaceColors.inkSoft, fontSize: 12, fontWeight: '800', letterSpacing: 1 },
  arrivalTime: { color: marketplaceColors.primaryDark, fontSize: 20, fontWeight: '900', marginTop: 8 },
  progressTrack: { height: 6, borderRadius: 6, backgroundColor: '#DDE6D6', marginTop: 16 },
  progressFill: { width: '67%', height: 6, borderRadius: 6, backgroundColor: marketplaceColors.primaryDark },
  arrivalRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  orderNumber: { color: marketplaceColors.primaryDark, fontSize: 14, fontWeight: '800' },
  distance: { color: marketplaceColors.inkSoft, fontSize: 14, fontWeight: '700' },
  timeline: { marginTop: 24, gap: 0 },
  timelineItem: { flexDirection: 'row', minHeight: 72 },
  timelineLeft: { width: 48, alignItems: 'center', position: 'relative' },
  verticalLine: { position: 'absolute', top: 28, width: 2, height: 48, backgroundColor: marketplaceColors.primaryDark },
  mutedLine: { backgroundColor: '#CAD5C4' },
  timelineIcon: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', zIndex: 2 },
  completedIcon: { backgroundColor: marketplaceColors.primaryDark },
  pendingIcon: { backgroundColor: '#E2E8DC' },
  currentIcon: { borderWidth: 6, borderColor: '#B9F0B9', backgroundColor: marketplaceColors.primary },
  timelineBody: { flex: 1, paddingTop: 2 },
  timelineTitle: { color: marketplaceColors.inkSoft, fontSize: 14, fontWeight: '500' },
  completedTitle: { color: marketplaceColors.primaryDark },
  currentTitle: { fontWeight: '800' },
  timelineSubtitle: { color: marketplaceColors.inkSoft, fontSize: 12, marginTop: 2 },
  riderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#B8C6B1',
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 16,
  },
  riderPhoto: { width: 56, height: 56, borderRadius: 28, borderWidth: 2, borderColor: '#8BEF90' },
  riderBody: { flex: 1 },
  riderName: { color: '#101710', fontSize: 16, fontWeight: '800' },
  riderRating: { color: marketplaceColors.inkSoft, fontSize: 12, marginTop: 2 },
  callButton: {
    width: 120,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#A24900',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  callText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
});
