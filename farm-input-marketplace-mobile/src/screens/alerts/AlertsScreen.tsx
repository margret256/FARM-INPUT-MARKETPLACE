import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { deleteAlert, listAlerts, markAlertRead, markAllAlertsRead } from '@/api/alerts';
import { AppScreen, StaticScreen } from '@/components/marketplace/AppScreen';
import { FloatingTabBar } from '@/components/marketplace/FloatingTabBar';
import { appImages } from '@/constants/mock-marketplace';
import { marketplaceColors } from '@/constants/marketplace';
import { useAuthStore } from '@/store/auth.store';

type Alert = {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'order' | 'payment' | 'offer' | 'profile';
  unread?: boolean;
  image?: boolean;
  read?: boolean;
};

const alerts: Alert[] = [
  {
    id: '1',
    title: 'Order Confirmed',
    message: 'Your order #AG-8821 for 50kg Organic Fertilizer has been confirmed by the dealer.',
    time: '2m ago',
    type: 'order',
    unread: true,
  },
  {
    id: '2',
    title: 'Payment Successful',
    message: 'Payment of $450.00 for the latest seed inventory was successfully processed.',
    time: '1h ago',
    type: 'payment',
    read: true,
  },
  {
    id: '3',
    title: 'Flash Offer: 15% OFF',
    message: 'Get exclusive discounts on high-yield corn seeds for the next 24 hours. Don\'t miss out!',
    time: '4h ago',
    type: 'offer',
    image: true,
  },
  {
    id: '4',
    title: 'Profile Updated',
    message: 'Your farm location and dealer preferences were updated successfully from your dashboard.',
    time: 'Yesterday',
    type: 'profile',
  },
];

const iconConfig: Record<Alert['type'], { bg: string; icon: string; color: string }> = {
  order: { bg: '#1A5E20', icon: 'receipt-outline', color: '#FFFFFF' },
  payment: { bg: '#F57C00', icon: 'wallet-outline', color: '#FFFFFF' },
  offer: { bg: '#FFF3CD', icon: 'pricetag-outline', color: '#F57C00' },
  profile: { bg: '#F0F0F0', icon: 'settings-outline', color: '#555' },
};

const chips = ['All', 'Orders', 'Payments', 'Offers'];

export function AlertsScreen() {
  const user = useAuthStore((state) => state.user);
  const [alertList, setAlertList] = useState(alerts);

  async function loadAlerts() {
    try {
      const response = await listAlerts({ userId: user?.id });
      if (response.items.length === 0) return;
      setAlertList(
        response.items.map((item) => ({
          id: item.id,
          title: item.title,
          message: item.message,
          time: new Date(item.createdAt).toLocaleString(),
          type: item.type.includes('payment')
            ? 'payment'
            : item.type.includes('offer')
              ? 'offer'
              : item.type.includes('profile')
                ? 'profile'
                : 'order',
          unread: !item.read,
          read: item.read,
        })),
      );
    } catch {
      // Keep local fallback alerts.
    }
  }

  useEffect(() => {
    loadAlerts();
  }, [user?.id]);

  async function handleMarkAllRead() {
    await markAllAlertsRead(user?.id);
    await loadAlerts();
  }

  async function handleMarkRead(id: string) {
    await markAlertRead(id, user?.id);
    await loadAlerts();
  }

  async function handleDelete(id: string) {
    await deleteAlert(id, user?.id);
    await loadAlerts();
  }

  return (
    <StaticScreen>
      <AppScreen title="AgroMarket">
        {/* Header */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.heading}>Alerts</Text>
            <Text style={styles.subheading}>Stay updated on your farm activity</Text>
          </View>
          <Pressable onPress={handleMarkAllRead}>
            <Text style={styles.markAll}>Mark all as read</Text>
          </Pressable>
        </View>

        {/* Filter chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chipScroll}
          contentContainerStyle={styles.chipRow}>
          {chips.map((chip, i) => (
            <Pressable key={chip} style={[styles.chip, i === 0 && styles.activeChip]}>
              <Text style={[styles.chipText, i === 0 && styles.activeChipText]}>{chip}</Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Alert cards */}
        <View style={styles.list}>
          {alertList.map((alert) => {
            const cfg = iconConfig[alert.type];
            return (
              <View
                key={alert.id}
                style={[styles.card, alert.unread && styles.unreadCard]}>
                {/* Unread left bar */}
                {alert.unread && <View style={styles.unreadBar} />}

                <View style={styles.cardInner}>
                  {/* Icon */}
                  <View style={[styles.iconWrap, { backgroundColor: cfg.bg }]}>
                    <Ionicons name={cfg.icon as any} size={22} color={cfg.color} />
                  </View>

                  {/* Content */}
                  <View style={styles.cardContent}>
                    <View style={styles.cardTopRow}>
                      <Text style={styles.cardTitle}>{alert.title}</Text>
                      <Text style={styles.cardTime}>{alert.time}</Text>
                    </View>
                    <Text style={styles.cardMessage}>{alert.message}</Text>

                    {/* Offer image */}
                    {alert.image && (
                      <View style={styles.offerImageWrap}>
                        <Image
                          source={appImages.smartFarming}
                          style={styles.offerImage}
                        />
                        <View style={styles.offerOverlay}>
                          <Text style={styles.offerOverlayText}>Limited time harvest deal</Text>
                        </View>
                      </View>
                    )}

                    {/* Actions */}
                    <View style={styles.actions}>
                      {alert.unread && (
                        <Pressable style={styles.actionBtn} onPress={() => handleMarkRead(alert.id)}>
                          <Ionicons name="checkmark-done-outline" size={14} color={marketplaceColors.primary} />
                          <Text style={styles.markReadText}>Mark as read</Text>
                        </Pressable>
                      )}
                      <Pressable style={styles.actionBtn} onPress={() => handleDelete(alert.id)}>
                        <Ionicons name="trash-outline" size={14} color="#D32F2F" />
                        <Text style={styles.deleteText}>Delete</Text>
                      </Pressable>
                    </View>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      </AppScreen>
      <FloatingTabBar active="alerts" />
    </StaticScreen>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  heading: {
    fontSize: 26,
    fontWeight: '900',
    color: '#101710',
  },
  subheading: {
    fontSize: 12,
    color: '#7A8A72',
    marginTop: 2,
  },
  markAll: {
    fontSize: 12,
    fontWeight: '700',
    color: marketplaceColors.primaryDark,
    marginTop: 6,
  },
  chipScroll: {
    marginBottom: 16,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 10,
    paddingRight: 16,
  },
  chip: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#E8EDE3',
  },
  activeChip: {
    backgroundColor: marketplaceColors.primaryDark,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#5A6A52',
  },
  activeChipText: {
    color: '#FFFFFF',
  },
  list: {
    gap: 12,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E1E8DA',
    overflow: 'hidden',
    flexDirection: 'row',
  },
  unreadCard: {
    borderColor: '#C8DFC0',
  },
  unreadBar: {
    width: 4,
    backgroundColor: marketplaceColors.primary,
  },
  cardInner: {
    flex: 1,
    flexDirection: 'row',
    padding: 14,
    gap: 12,
  },
  iconWrap: {
    width: 46,
    height: 46,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  cardContent: {
    flex: 1,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#101710',
    flex: 1,
  },
  cardTime: {
    fontSize: 11,
    color: '#9AA890',
    fontWeight: '600',
    flexShrink: 0,
  },
  cardMessage: {
    fontSize: 12,
    color: '#5A6A52',
    lineHeight: 17,
    marginTop: 4,
    fontWeight: '500',
  },
  offerImageWrap: {
    marginTop: 10,
    borderRadius: 10,
    overflow: 'hidden',
    height: 100,
  },
  offerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  offerOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.45)',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  offerOverlayText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  actions: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 10,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  markReadText: {
    fontSize: 12,
    fontWeight: '700',
    color: marketplaceColors.primary,
  },
  deleteText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#D32F2F',
  },
});
