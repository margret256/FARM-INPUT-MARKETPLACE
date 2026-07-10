import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { formatUgx } from '@/api/marketplace-adapters';
import { compareProductPrices } from '@/api/products';
import { AppScreen } from '@/components/marketplace/AppScreen';
import { appImages, dealerOffers } from '@/constants/mock-marketplace';
import { marketplaceColors, marketplaceShadows } from '@/constants/marketplace';

export function ComparePricesScreen() {
  const [offers, setOffers] = useState(dealerOffers);
  const [summaryTitle, setSummaryTitle] = useState('Premium Urea Fertilizer');
  const [summaryCategory, setSummaryCategory] = useState('Fertilizer');

  useEffect(() => {
    let mounted = true;

    async function loadOffers() {
      try {
        const response = await compareProductPrices();
        if (!mounted || response.items.length === 0) return;
        setSummaryTitle(response.items[0].name);
        setSummaryCategory(response.items[0].category?.name ?? 'Input');
        setOffers(
          response.items.map((product, index) => ({
            name: product.dealer?.businessName ?? 'AgroConnect Dealer',
            price: formatUgx(product.price),
            delivery: 'Delivery calculated at checkout',
            rating: 'New dealer',
            status: product.statusDetail,
            selected: index === 0,
            icon: 'storefront-outline' as const,
          })),
        );
      } catch {
        // Keep local fallback offers.
      }
    }

    loadOffers();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppScreen back title="Compare Prices">
        <View style={[styles.productSummary, marketplaceShadows.card]}>
          <Image source={appImages.betterYields} style={styles.summaryImage} />
          <View style={styles.summaryBody}>
            <Text style={styles.summaryTitle}>{summaryTitle}</Text>
            <View style={styles.tags}>
              <Text style={styles.tag}>{summaryCategory}</Text>
              <Text style={styles.bag}>50kg Bag</Text>
            </View>
          </View>
        </View>
        <View style={styles.filterRow}>
          <Text style={[styles.filter, styles.activeFilter]}>Cheapest First</Text>
          <Text style={styles.filter}>Top Rated</Text>
          <Text style={styles.filter}>Nearest Dealer</Text>
        </View>
        <View style={styles.offerList}>
          {offers.map((offer) => (
            <View key={offer.name} style={[styles.offerCard, offer.selected && styles.selectedOffer]}>
              {offer.selected ? <Text style={styles.bestValue}>BEST VALUE</Text> : null}
              <View style={styles.offerTop}>
                <View style={styles.offerLeft}>
                  <View style={[styles.offerIcon, offer.selected && styles.offerIconSelected]}>
                    <Ionicons name={offer.icon} size={25} color={offer.selected ? '#8A3F00' : marketplaceColors.inkSoft} />
                  </View>
                  <View>
                    <Text style={styles.dealerName}>{offer.name}</Text>
                    <Text style={styles.rating}>Rating {offer.rating}</Text>
                  </View>
                </View>
                <View style={styles.priceBlock}>
                  <Text style={styles.offerPrice}>{offer.price}</Text>
                  <Text style={styles.delivery}>{offer.delivery}</Text>
                </View>
              </View>
              <View style={styles.line} />
              <View style={styles.offerBottom}>
                <Text style={[styles.stock, offer.status.startsWith('Low') && styles.lowStock]}>{offer.status}</Text>
                <Pressable style={[styles.selectButton, !offer.selected && styles.selectButtonMuted]}>
                  <Text style={[styles.selectText, !offer.selected && styles.selectTextMuted]}>Select</Text>
                </Pressable>
              </View>
            </View>
          ))}
        </View>
        <Text style={styles.highlightsTitle}>Comparison Highlights</Text>
        <View style={styles.highlightRow}>
          <View style={styles.highlightCard}>
            <Ionicons name="ribbon-outline" size={30} color={marketplaceColors.primaryDark} />
            <Text style={styles.highlightLabel}>Quality Check</Text>
            <Text style={styles.highlightText}>All dealers are UNBS certified</Text>
          </View>
          <View style={styles.highlightCard}>
            <Ionicons name="speedometer-outline" size={30} color="#8A5A00" />
            <Text style={styles.highlightLabel}>Fastest Delivery</Text>
            <Text style={styles.highlightText}>2-4 Hours (Agro-Input Central)</Text>
          </View>
        </View>
      </AppScreen>
      <View style={styles.bottom}>
        <View>
          <Text style={styles.totalSelected}>Total Selected</Text>
          <Text style={styles.total}>{offers[0]?.price ?? 'UGX 87,000'}</Text>
        </View>
        <View style={styles.qty}>
          <Text style={styles.qtySymbol}>-</Text>
          <Text style={styles.qtyNumber}>1</Text>
          <Text style={styles.qtySymbol}>+</Text>
        </View>
        <Pressable onPress={() => router.push('/checkout')} style={styles.checkout}>
          <Text style={styles.checkoutText}>Proceed to Checkout</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: marketplaceColors.screen },
  productSummary: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#DFE8DA',
    padding: 24,
    flexDirection: 'row',
    gap: 20,
  },
  summaryImage: { width: 116, height: 116, borderRadius: 8, resizeMode: 'cover' },
  summaryBody: { flex: 1, justifyContent: 'center' },
  summaryTitle: { color: '#101710', fontSize: 29, lineHeight: 37, fontWeight: '900' },
  tags: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 14 },
  tag: {
    color: marketplaceColors.primaryDark,
    backgroundColor: '#EAF4E8',
    borderRadius: 16,
    overflow: 'hidden',
    paddingHorizontal: 12,
    paddingVertical: 5,
    fontSize: 17,
    fontWeight: '900',
  },
  bag: { color: marketplaceColors.inkSoft, fontSize: 17, fontWeight: '800' },
  filterRow: { flexDirection: 'row', gap: 12, marginTop: 34, marginBottom: 24 },
  filter: {
    color: marketplaceColors.inkSoft,
    backgroundColor: '#E9EFE4',
    borderRadius: 22,
    overflow: 'hidden',
    paddingHorizontal: 18,
    paddingVertical: 12,
    fontSize: 17,
    fontWeight: '900',
    borderWidth: 1,
    borderColor: '#B8C6B1',
  },
  activeFilter: { backgroundColor: marketplaceColors.primaryDark, color: '#FFFFFF', borderColor: marketplaceColors.primaryDark },
  offerList: { gap: 22 },
  offerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 22,
    borderWidth: 1,
    borderColor: '#B8C6B1',
  },
  selectedOffer: { borderWidth: 2, borderColor: marketplaceColors.primaryDark },
  bestValue: {
    position: 'absolute',
    right: 0,
    top: 0,
    backgroundColor: marketplaceColors.primaryDark,
    color: '#FFFFFF',
    borderTopRightRadius: 12,
    borderBottomLeftRadius: 6,
    overflow: 'hidden',
    paddingHorizontal: 13,
    paddingVertical: 6,
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 1,
  },
  offerTop: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  offerLeft: { flexDirection: 'row', gap: 14, flex: 1 },
  offerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E9EFE4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  offerIconSelected: { backgroundColor: '#FFD9BF' },
  dealerName: { color: '#101710', fontSize: 24, lineHeight: 25, fontWeight: '800' },
  rating: { color: '#8A5A00', fontSize: 16, fontWeight: '900', marginTop: 5 },
  priceBlock: { alignItems: 'flex-end', paddingTop: 12 },
  offerPrice: { color: marketplaceColors.primaryDark, fontSize: 25, fontWeight: '900' },
  delivery: { color: '#101710', fontSize: 17, textAlign: 'right', marginTop: 3 },
  line: { height: 1, backgroundColor: '#B8C6B1', marginTop: 22 },
  offerBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 },
  stock: { color: marketplaceColors.primaryDark, fontSize: 16, fontWeight: '900' },
  lowStock: { color: '#F57C00' },
  selectButton: {
    backgroundColor: marketplaceColors.primaryDark,
    borderRadius: 10,
    paddingHorizontal: 38,
    paddingVertical: 14,
  },
  selectButtonMuted: { backgroundColor: '#E9EFE4', borderWidth: 1, borderColor: '#B8C6B1' },
  selectText: { color: '#FFFFFF', fontSize: 20, fontWeight: '900' },
  selectTextMuted: { color: marketplaceColors.inkSoft },
  highlightsTitle: { color: '#101710', fontSize: 27, fontWeight: '900', marginTop: 36, marginBottom: 20 },
  highlightRow: { flexDirection: 'row', gap: 20 },
  highlightCard: { flex: 1, minHeight: 140, borderRadius: 14, backgroundColor: '#EAF4E8', padding: 22 },
  highlightLabel: { color: '#101710', fontSize: 17, marginTop: 10 },
  highlightText: { color: '#101710', fontSize: 20, lineHeight: 23, fontWeight: '800' },
  bottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: marketplaceColors.screen,
    borderTopWidth: 1,
    borderTopColor: '#CAD5C4',
    padding: 20,
  },
  totalSelected: { color: marketplaceColors.inkSoft, fontSize: 16, fontWeight: '800' },
  total: { color: '#101710', fontSize: 28, fontWeight: '800', marginTop: 4 },
  qty: { position: 'absolute', right: 24, top: 20, flexDirection: 'row', alignItems: 'center', gap: 22 },
  qtySymbol: { backgroundColor: '#FFFFFF', color: marketplaceColors.primaryDark, borderRadius: 6, overflow: 'hidden', paddingHorizontal: 14, paddingVertical: 6, fontSize: 24, fontWeight: '900' },
  qtyNumber: { color: '#101710', fontSize: 21, fontWeight: '900' },
  checkout: { height: 62, borderRadius: 13, backgroundColor: marketplaceColors.primaryDark, alignItems: 'center', justifyContent: 'center', marginTop: 22 },
  checkoutText: { color: '#FFFFFF', fontSize: 20, fontWeight: '900' },
});
