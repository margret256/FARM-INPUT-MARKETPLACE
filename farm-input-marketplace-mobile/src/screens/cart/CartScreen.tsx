// CartScreen.tsx
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { getCart, removeCartItem, updateCartItem, type CartResponse } from '@/api/cart';
import { formatUgx, productImage } from '@/api/marketplace-adapters';
import { AppHeader } from '@/components/marketplace/AppHeader';
import { FloatingTabBar } from '@/components/marketplace/FloatingTabBar';
import { cartItems } from '@/constants/mock-marketplace';
import { marketplaceColors, marketplaceShadows } from '@/constants/marketplace';
import { useAuthStore } from '@/store/auth.store';

export function CartScreen() {
  const insets = useSafeAreaInsets();
  const user = useAuthStore((state) => state.user);
  const [cart, setCart] = useState<CartResponse | undefined>();

  async function loadCart() {
    try {
      setCart(await getCart(user?.id));
    } catch {
      setCart(undefined);
    }
  }

  useEffect(() => {
    loadCart();
  }, [user?.id]);

  const displayItems =
    cart?.items.length
      ? cart.items.map((item, index) => ({
          id: item.id,
          name: item.product?.name ?? 'Marketplace item',
          description: item.product?.description ?? item.product?.category?.name ?? 'Agro input',
          price: formatUgx(item.unitPrice),
          quantity: item.quantity,
          image: productImage(index),
        }))
      : cartItems.map((item, index) => ({
          id: `fallback-${index}`,
          ...item,
        }));

  const summary = cart?.summary ?? {
    subtotal: 202.5,
    deliveryFee: 15,
    tax: 18.22,
    total: 235.72,
    itemCount: 3,
  };

  async function changeQuantity(id: string, quantity: number) {
    if (id.startsWith('fallback-')) return;
    await updateCartItem(id, { userId: user?.id, quantity: Math.max(1, quantity) });
    await loadCart();
  }

  async function removeItem(id: string) {
    if (id.startsWith('fallback-')) return;
    await removeCartItem(id, user?.id);
    await loadCart();
  }

  return (
    <SafeAreaView style={styles.screen}>
      <AppHeader title="AgroMarket" />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Your Cart</Text>
        <Text style={styles.subtitle}>Review items before checkout</Text>
        <View style={styles.items}>
          {displayItems.map((item) => (
            <View key={item.id} style={[styles.itemCard, marketplaceShadows.card]}>
              <Image source={item.image} style={styles.itemImage} />
              <View style={styles.itemBody}>
                <View style={styles.itemTop}>
                  <Text style={styles.itemTitle} numberOfLines={2}>{item.name}</Text>
                  <Text style={styles.itemPrice}>{item.price}</Text>
                </View>
                <Text style={styles.itemDescription} numberOfLines={2}>{item.description}</Text>
                <View style={styles.controls}>
                  <View style={styles.qty}>
                    <Pressable onPress={() => changeQuantity(item.id, item.quantity - 1)}>
                      <Text style={styles.qtyIcon}>−</Text>
                    </Pressable>
                    <Text style={styles.qtyText}>{item.quantity}</Text>
                    <Pressable onPress={() => changeQuantity(item.id, item.quantity + 1)}>
                      <Text style={styles.qtyIcon}>+</Text>
                    </Pressable>
                  </View>
                  <Pressable style={styles.actionBtn} onPress={() => removeItem(item.id)}>
                    <Ionicons name="bookmark-outline" size={12} color="#A84900" />
                    <Text style={styles.save}>Save</Text>
                  </Pressable>
                  <Pressable style={styles.actionBtn}>
                    <Ionicons name="trash-outline" size={12} color="#C62828" />
                    <Text style={styles.remove}>Remove</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          ))}
        </View>
        <View style={styles.summary}>
          <Text style={styles.summaryTitle}>Order Summary</Text>
          {[
            [`Subtotal (${summary.itemCount} items)`, formatUgx(summary.subtotal)],
            ['Delivery Fee', formatUgx(summary.deliveryFee)],
            ['Taxes (VAT)', formatUgx(summary.tax)],
          ].map(([label, value]) => (
            <View key={label} style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{label}</Text>
              <Text style={styles.summaryValue}>{value}</Text>
            </View>
          ))}
          <View style={styles.summaryLine} />
          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalValue}>{formatUgx(summary.total)}</Text>
          </View>
        </View>
      </ScrollView>
      <View style={[styles.bottom, { marginBottom: insets.bottom + 64 }]}>
        <Pressable onPress={() => router.push('/tabs/market')} style={styles.continueButton}>
          <Text style={styles.continueText}>Continue Shopping</Text>
        </Pressable>
        <Pressable onPress={() => router.push('/checkout')} style={styles.checkoutButton}>
          <Text style={styles.checkoutText}>Checkout</Text>
        </Pressable>
      </View>
      <FloatingTabBar active="market" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: marketplaceColors.screen,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 14,
    paddingBottom: 20,
  },
  title: {
    color: '#101710',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 0,
  },
  subtitle: {
    color: marketplaceColors.inkSoft,
    fontSize: 13,
    marginTop: 4,
  },
  items: {
    gap: 10,
    marginTop: 16,
  },
  itemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 10,
    flexDirection: 'row',
    gap: 10,
  },
  itemImage: {
    width: 70,
    height: 70,
    borderRadius: 8,
    resizeMode: 'cover',
    flexShrink: 0,
  },
  itemBody: {
    flex: 1,
  },
  itemTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
    alignItems: 'flex-start',
  },
  itemTitle: {
    flex: 1,
    color: '#101710',
    fontSize: 13,
    fontWeight: '900',
  },
  itemPrice: {
    color: marketplaceColors.primaryDark,
    fontSize: 13,
    fontWeight: '900',
    flexShrink: 0,
  },
  itemDescription: {
    color: marketplaceColors.inkSoft,
    fontSize: 10,
    fontWeight: '600',
    marginTop: 3,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  qty: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E9EFE4',
    borderRadius: 18,
    paddingHorizontal: 10,
    height: 28,
    gap: 10,
  },
  qtyIcon: {
    color: marketplaceColors.primaryDark,
    fontSize: 14,
    fontWeight: '900',
  },
  qtyText: {
    color: '#101710',
    fontSize: 12,
    fontWeight: '900',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  save: {
    color: '#A84900',
    fontSize: 10,
    fontWeight: '800',
  },
  remove: {
    color: '#C62828',
    fontSize: 10,
    fontWeight: '800',
  },
  summary: {
    backgroundColor: '#E2E8DC',
    borderRadius: 12,
    padding: 12,
    marginTop: 16,
  },
  summaryTitle: {
    color: '#101710',
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  summaryLabel: {
    color: marketplaceColors.inkSoft,
    fontSize: 12,
  },
  summaryValue: {
    color: '#101710',
    fontSize: 12,
    fontWeight: '700',
  },
  summaryLine: {
    height: 1,
    backgroundColor: '#B8C6B1',
    marginBottom: 10,
  },
  totalLabel: {
    color: '#101710',
    fontSize: 13,
    fontWeight: '900',
  },
  totalValue: {
    color: marketplaceColors.primaryDark,
    fontSize: 16,
    fontWeight: '900',
  },
  bottom: {
    height: 68,
    borderTopWidth: 1,
    borderTopColor: '#CAD5C4',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    backgroundColor: '#FFFFFF',
  },
  continueButton: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: marketplaceColors.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueText: {
    color: marketplaceColors.primaryDark,
    fontSize: 13,
    fontWeight: '900',
  },
  checkoutButton: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    backgroundColor: marketplaceColors.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkoutText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
});
