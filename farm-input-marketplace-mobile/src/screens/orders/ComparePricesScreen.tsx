// ComparePricesScreen.tsx
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { compareProductPrices } from '@/api/products';
import { AppHeader } from '@/components/marketplace/AppHeader';
import { appImages } from '@/constants/mock-marketplace';
import { marketplaceColors, marketplaceShadows } from '@/constants/marketplace';

const dealers = [
  {
    id: 1,
    name: 'Agro-Input Central',
    icon: 'storefront-outline',
    rating: 4.8,
    reviews: 120,
    price: 82000,
    delivery: 5000,
    stock: '24 units',
    status: 'in-stock',
    isBestValue: true,
  },
  {
    id: 2,
    name: 'Farmer\'s Choice Ltd',
    icon: 'leaf-outline',
    rating: 4.5,
    reviews: 89,
    price: 85000,
    delivery: 0,
    stock: 'In Stock',
    status: 'in-stock',
    isBestValue: false,
  },
  {
    id: 3,
    name: 'Green Valley Supplies',
    icon: 'car-outline',
    rating: 4.2,
    reviews: 45,
    price: 84500,
    delivery: 8000,
    stock: '3 left',
    status: 'low-stock',
    isBestValue: false,
  },
];

export function ComparePricesScreen() {
  const [dealerList, setDealerList] = useState(dealers);
  const [productTitle, setProductTitle] = useState('Premium Urea Fertilizer');

  useEffect(() => {
    let mounted = true;

    async function loadDealers() {
      try {
        const response = await compareProductPrices();
        if (!mounted || response.items.length === 0) return;
        setProductTitle(response.items[0].name);
        setDealerList(
          response.items.map((product, index) => ({
            id: index + 1,
            name: product.dealer?.businessName ?? 'AgroConnect Dealer',
            icon: 'storefront-outline',
            rating: 0,
            reviews: 0,
            price: product.price,
            delivery: 0,
            stock: product.statusDetail,
            status: product.stockStatus === 'LOW_STOCK' ? 'low-stock' : 'in-stock',
            isBestValue: index === 0,
          })),
        );
      } catch {
        // Keep local fallback comparison data.
      }
    }

    loadDealers();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <SafeAreaView style={styles.screen}>
      <AppHeader back title="Compare Prices" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Product Header */}
        <View style={[styles.productCard, marketplaceShadows.card]}>
          <Image source={appImages.betterYields} style={styles.productImage} />
          <View style={styles.productInfo}>
            <Text style={styles.productTitle}>{productTitle}</Text>
            <View style={styles.productTags}>
              <View style={styles.tag}>
                <Text style={styles.tagText}>Fertilizer</Text>
              </View>
              <Text style={styles.tagText2}>50kg Bag</Text>
            </View>
          </View>
        </View>

        {/* Filter Buttons */}
        <View style={styles.filterButtons}>
          <Pressable style={[styles.filterBtn, styles.filterBtnActive]}>
            <Text style={styles.filterBtnTextActive}>Cheapest First</Text>
          </Pressable>
          <Pressable style={styles.filterBtn}>
            <Text style={styles.filterBtnText}>Top Rated</Text>
          </Pressable>
          <Pressable style={styles.filterBtn}>
            <Text style={styles.filterBtnText}>Nearest Dealer</Text>
          </Pressable>
        </View>

        {/* Dealer Cards */}
        {dealerList.map((dealer) => (
          <View key={dealer.id} style={[styles.dealerCard, marketplaceShadows.card, dealer.isBestValue && styles.dealerCardBestValue]}>
            {dealer.isBestValue && (
              <View style={styles.bestValueBadge}>
                <Text style={styles.bestValueText}>BEST VALUE</Text>
              </View>
            )}
            <View style={styles.dealerHeader}>
              <View style={styles.dealerIconBox}>
                <Ionicons name={dealer.icon as any} size={18} color={marketplaceColors.primaryDark} />
              </View>
              <View style={styles.dealerNameSection}>
                <Text style={styles.dealerName}>{dealer.name}</Text>
                <View style={styles.ratingRow}>
                  <Ionicons name="star" size={10} color="#8A5A00" />
                  <Text style={styles.ratingText}>{dealer.rating} ({dealer.reviews}+)</Text>
                </View>
              </View>
            </View>

            <View style={styles.dealerBody}>
              <View style={styles.priceSection}>
                <Text style={styles.price}>UGX {dealer.price.toLocaleString()}</Text>
                {dealer.delivery > 0 && (
                  <Text style={styles.delivery}>+ UGX {dealer.delivery.toLocaleString()} delivery</Text>
                )}
              </View>

              <View style={styles.stockSection}>
                <View style={[styles.stockBadge, dealer.status === 'in-stock' ? styles.stockGreen : styles.stockOrange]}>
                  <View style={[styles.stockDot, dealer.status === 'in-stock' ? styles.stockDotGreen : styles.stockDotOrange]} />
                  <Text style={[styles.stockText, dealer.status === 'in-stock' ? styles.stockTextGreen : styles.stockTextOrange]}>
                    {dealer.status === 'in-stock' ? `In Stock (${dealer.stock})` : `Low Stock (${dealer.stock})`}
                  </Text>
                </View>
              </View>

              <Pressable style={styles.selectButton}>
                <Text style={styles.selectButtonText}>Select</Text>
              </Pressable>
            </View>
          </View>
        ))}

        {/* Comparison Highlights */}
        <View style={styles.highlightsSection}>
          <Text style={styles.highlightsTitle}>Comparison Highlights</Text>
          <View style={styles.highlightsGrid}>
            <View style={styles.highlightCard}>
              <Ionicons name="checkmark-circle-outline" size={24} color={marketplaceColors.primaryDark} />
              <Text style={styles.highlightCardTitle}>Quality Check</Text>
              <Text style={styles.highlightCardText}>All dealers are UNBS certified</Text>
            </View>
            <View style={styles.highlightCard}>
              <Ionicons name="flash-outline" size={24} color={marketplaceColors.primaryDark} />
              <Text style={styles.highlightCardTitle}>Fastest Delivery</Text>
              <Text style={styles.highlightCardText}>2-4 Hours (Agro-Input Central)</Text>
            </View>
          </View>
        </View>

        {/* Total and Checkout */}
        <View style={styles.totalSection}>
          <Text style={styles.totalLabel}>Total Selected</Text>
          <Text style={styles.totalPrice}>UGX {(dealerList[0]?.price + dealerList[0]?.delivery).toLocaleString()}</Text>
          <View style={styles.qtySelector}>
            <Pressable style={styles.qtyButton}>
              <Text style={styles.qtyButtonText}>−</Text>
            </Pressable>
            <Text style={styles.qtyValue}>1</Text>
            <Pressable style={styles.qtyButton}>
              <Text style={styles.qtyButtonText}>+</Text>
            </Pressable>
          </View>
        </View>

        <Pressable onPress={() => router.push('/checkout')} style={styles.checkoutButton}>
          <Ionicons name="cart-outline" size={18} color="#FFFFFF" />
          <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: marketplaceColors.screen },
  content: { padding: 14, paddingBottom: 40 },
  productCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#B8C6B1',
    padding: 10,
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  productInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  productTitle: {
    color: '#101710',
    fontSize: 14,
    fontWeight: '900',
  },
  productTags: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  tag: {
    backgroundColor: '#EAF4E8',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  tagText: {
    color: marketplaceColors.primaryDark,
    fontSize: 10,
    fontWeight: '700',
  },
  tagText2: {
    color: marketplaceColors.inkSoft,
    fontSize: 10,
    fontWeight: '600',
  },
  filterButtons: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  filterBtn: {
    height: 32,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#B8C6B1',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBtnActive: {
    backgroundColor: marketplaceColors.primaryDark,
    borderColor: marketplaceColors.primaryDark,
  },
  filterBtnText: {
    color: marketplaceColors.inkSoft,
    fontSize: 12,
    fontWeight: '700',
  },
  filterBtnTextActive: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },
  dealerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#B8C6B1',
    padding: 12,
    marginBottom: 12,
    position: 'relative',
  },
  dealerCardBestValue: {
    borderWidth: 2,
    borderColor: marketplaceColors.primaryDark,
  },
  bestValueBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: marketplaceColors.primaryDark,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  bestValueText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
  },
  dealerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  dealerIconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#F0F5EA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dealerNameSection: {
    flex: 1,
  },
  dealerName: {
    color: '#101710',
    fontSize: 13,
    fontWeight: '900',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 3,
  },
  ratingText: {
    color: marketplaceColors.inkSoft,
    fontSize: 10,
  },
  dealerBody: {
    gap: 10,
  },
  priceSection: {
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
    paddingBottom: 10,
  },
  price: {
    color: '#101710',
    fontSize: 16,
    fontWeight: '900',
  },
  delivery: {
    color: marketplaceColors.inkSoft,
    fontSize: 11,
    marginTop: 2,
  },
  stockSection: {
    marginBottom: 8,
  },
  stockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  stockGreen: {
    backgroundColor: '#EAF4E8',
  },
  stockOrange: {
    backgroundColor: '#FFF3E0',
  },
  stockDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  stockDotGreen: {
    backgroundColor: marketplaceColors.primaryDark,
  },
  stockDotOrange: {
    backgroundColor: '#F57C00',
  },
  stockText: {
    fontSize: 11,
    fontWeight: '700',
  },
  stockTextGreen: {
    color: marketplaceColors.primaryDark,
  },
  stockTextOrange: {
    color: '#F57C00',
  },
  selectButton: {
    height: 40,
    backgroundColor: '#F0F5EA',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectButtonText: {
    color: marketplaceColors.primaryDark,
    fontSize: 13,
    fontWeight: '900',
  },
  highlightsSection: {
    marginTop: 16,
    marginBottom: 20,
  },
  highlightsTitle: {
    color: '#101710',
    fontSize: 14,
    fontWeight: '900',
    marginBottom: 10,
  },
  highlightsGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  highlightCard: {
    flex: 1,
    backgroundColor: '#E2E8DC',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
  },
  highlightCardTitle: {
    color: '#101710',
    fontSize: 12,
    fontWeight: '900',
    marginTop: 6,
  },
  highlightCardText: {
    color: marketplaceColors.inkSoft,
    fontSize: 10,
    marginTop: 4,
    textAlign: 'center',
  },
  totalSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#B8C6B1',
  },
  totalLabel: {
    color: marketplaceColors.inkSoft,
    fontSize: 12,
    fontWeight: '700',
  },
  totalPrice: {
    color: '#101710',
    fontSize: 18,
    fontWeight: '900',
    marginTop: 4,
    marginBottom: 10,
  },
  qtySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  qtyButton: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: '#E9EFE4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyButtonText: {
    color: marketplaceColors.primaryDark,
    fontSize: 16,
    fontWeight: '900',
  },
  qtyValue: {
    color: '#101710',
    fontSize: 14,
    fontWeight: '900',
    marginHorizontal: 12,
  },
  checkoutButton: {
    height: 52,
    backgroundColor: marketplaceColors.primaryDark,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  checkoutButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
  },
});
