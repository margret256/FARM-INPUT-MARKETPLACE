import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { listAlerts, markAlertRead } from '@/api/alerts';
import { marketplaceColors, marketplaceShadows } from '@/constants/marketplace';
import { useAuthStore } from '@/store/auth.store';

const NOTIFICATIONS = [
  {
    id: '1',
    title: 'New Order Received',
    body: 'Samuel Okafor placed an order for Tractor Spare Parts Bundle.',
    time: '2 mins ago',
    color: marketplaceColors.primary,
    icon: 'receipt-outline',
    unread: true,
  },
  {
    id: '2',
    title: 'Low Stock Alert',
    body: 'NPK Fertilizer (50kg) is running low. Only 3 units left.',
    time: '1h ago',
    color: '#E53935',
    icon: 'warning-outline',
    unread: true,
  },
  {
    id: '3',
    title: 'Payment Successful',
    body: 'Payment of $1,240.00 for order #AC-88901 was processed.',
    time: '3h ago',
    color: '#2E7D32',
    icon: 'checkmark-circle-outline',
    unread: false,
  },
  {
    id: '4',
    title: 'Deal Request',
    body: 'Agro-Input Central wants to partner on bulk seeds.',
    time: 'Yesterday',
    color: '#F57C00',
    icon: 'handshake-outline',
    unread: false,
  },
];

export function DealerNotificationsScreen() {
  const user = useAuthStore((state) => state.user);
  const [notifications, setNotifications] = useState(NOTIFICATIONS);

  async function loadNotifications() {
    try {
      const response = await listAlerts({ userId: user?.id });
      if (response.items.length === 0) return;
      setNotifications(
        response.items.map((item) => ({
          id: item.id,
          title: item.title,
          body: item.message,
          time: new Date(item.createdAt).toLocaleString(),
          color: item.type.includes('payment')
            ? '#2E7D32'
            : item.type.includes('stock')
              ? '#E53935'
              : marketplaceColors.primary,
          icon: item.type.includes('payment')
            ? 'checkmark-circle-outline'
            : item.type.includes('stock')
              ? 'warning-outline'
              : 'receipt-outline',
          unread: !item.read,
        })),
      );
    } catch {
      // Keep local fallback notifications.
    }
  }

  useEffect(() => {
    loadNotifications();
  }, [user?.id]);

  async function handleOpen(id: string) {
    try {
      await markAlertRead(id, user?.id);
      await loadNotifications();
    } catch {
      setNotifications((current) =>
        current.map((item) => (item.id === id ? { ...item, unread: false } : item)),
      );
    }
  }

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.pageTitle}>Notifications</Text>
        <Text style={styles.pageSubtitle}>
          Stay updated on orders, stock, and dealer alerts.
        </Text>

        <View style={styles.list}>
          {notifications.map((item) => (
            <Pressable key={item.id} style={[styles.card, marketplaceShadows.card]} onPress={() => handleOpen(item.id)}>
              <View style={[styles.iconWrap, { backgroundColor: `${item.color}14` }]}>
                <Ionicons name={item.icon as any} size={20} color={item.color} />
              </View>
              <View style={styles.body}>
                <View style={styles.titleRow}>
                  <Text style={styles.title}>{item.title}</Text>
                  {item.unread && <View style={styles.dot} />}
                </View>
                <Text style={styles.bodyText}>{item.body}</Text>
                <Text style={styles.time}>{item.time}</Text>
              </View>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      <Pressable style={styles.fab} onPress={() => router.back()}>
        <Ionicons name="close" size={22} color="#FFFFFF" />
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F2F5EE' },
  content: { padding: 16, paddingBottom: 100 },
  pageTitle: { fontSize: 22, fontWeight: '900', color: '#101710', marginBottom: 4 },
  pageSubtitle: { fontSize: 12, color: '#888', marginBottom: 16, lineHeight: 17 },
  list: { gap: 10 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { flex: 1 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { fontSize: 13, fontWeight: '800', color: '#101710', flex: 1 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: marketplaceColors.primary },
  bodyText: { fontSize: 12, color: '#444', marginTop: 2, lineHeight: 17 },
  time: { fontSize: 11, color: '#888', marginTop: 4 },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: marketplaceColors.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
});
