import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context';

import { addCartItem } from '@/api/cart';
import { formatUgx } from '@/api/marketplace-adapters';
import { getProduct, listProducts, type DealerProduct } from '@/api/products';
import { listReviews } from '@/api/reviews';
import { addWishlistItem } from '@/api/wishlist';
import { AppScreen } from '@/components/marketplace/AppScreen';
import { appImages } from '@/constants/mock-marketplace';
import { marketplaceColors, marketplaceShadows } from '@/constants/marketplace';
import { useAuthStore } from '@/store/auth.store';

const instructions = [
  ['Soil test', 'Determine nitrogen requirements before application to avoid over-saturation.'],
  ['Broadcast application', 'Spread evenly across the field using a spreader or manual broadcast technique.'],
  ['Incorporation', 'Mix into the top 2-4 inches of soil immediately to prevent nitrogen loss.'],
];

export function ProductDetailsScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ id?: string }>();
  const user = useAuthStore((state) => state.user);
  const [wishlisted, setWishlisted] = useState(false);
  const [inCart, setInCart] = useState(false);
  const [product, setProduct] = useState<DealerProduct | undefined>();
  const [reviewSummary, setReviewSummary] = useState<{ average?: number; total?: number }>();

  const bottomBarHeight = 68 + insets.bottom;
  const title = product?.name ?? 'Premium Urea Fertilizer (46-0-0)';
  const price = product ? formatUgx(product.price) : 'UGX 85,000';
  const description =
    product?.description ??
    'High-quality nitrogen fertilizer for rapid crop growth and healthy yields. Specifically formulated for East African soil conditions to maximize grain development.';
  const stockText = product?.stockStatus === 'OUT_OF_STOCK' ? 'Out of\nStock' : product?.stockStatus === 'LOW_STOCK' ? 'Low\nStock' : 'In\nStock';
  const rating = reviewSummary?.average ?? 4.8;
  const reviewCount = reviewSummary?.total ?? 120;

  useEffect(() => {
    let mounted = true;

    async function loadProduct() {
      try {
        const nextProduct = params.id
          ? await getProduct(params.id)
          : (await listProducts()).items[0];
        if (!mounted || !nextProduct) return;
        setProduct(nextProduct);
        const reviews = await listReviews({ productId: nextProduct.id });
        if (mounted) setReviewSummary(reviews.summary);
      } catch {
        // Keep static fallback details when the API is unavailable.
      }
    }

    loadProduct();
    return () => {
      mounted = false;
    };
  }, [params.id]);

  async function handleWishlist() {
    try {
      if (product) {
        await addWishlistItem({ userId: user?.id, productId: product.id });
      }
      setWishlisted(true);
    } catch {
      Alert.alert('Wishlist unavailable', 'Could not save this product.');
    }
  }

  async function handleAddToCart() {
    try {
      if (product) {
        await addCartItem({ userId: user?.id, productId: product.id, quantity: 1 });
      }
      setInCart(true);
      router.push('/cart');
    } catch {
      Alert.alert('Cart unavailable', 'Could not add this product to your cart.');
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppScreen back title="AgroMarket" padded={false}>
        <Image source={appImages.betterYields} style={styles.hero} />
        <View style={[styles.body, { paddingBottom: bottomBarHeight + 16 }]}>
          <View style={styles.titleRow}>
            <View style={styles.titleBlock}>
              <Text style={styles.title}>{title}</Text>
              <View style={styles.starRow}>
                {[0, 1, 2, 3, 4].map((star) => (
                  <Ionicons key={star} name="star" size={11} color="#8A5A00" />
                ))}
                <Text style={styles.reviewText}>{rating} ({reviewCount} reviews)</Text>
              </View>
              <Text style={styles.price}>{price}</Text>
            </View>
            <Text style={styles.stock}>{stockText}</Text>
          </View>

          <View style={styles.descriptionCard}>
            <Text style={styles.cardLabel}>DESCRIPTION</Text>
            <Text style={styles.description}>
              {description}
            </Text>
          </View>

          <Text style={styles.sectionTitle}>Usage Instructions</Text>
          {instructions.map((item, index) => (
            <View key={item[0]} style={styles.instructionRow}>
              <Text style={styles.step}>{index + 1}</Text>
              <View style={styles.instructionText}>
                <Text style={styles.instructionTitle}>{item[0]}</Text>
                <Text style={styles.instructionBody}>{item[1]}</Text>
              </View>
            </View>
          ))}

          <View style={[styles.dealerCard, marketplaceShadows.card]}>
            <Image source={appImages.agroHub} style={styles.dealerImage} />
            <View style={styles.dealerInfo}>
              <Text style={styles.dealerName}>{product?.dealer?.businessName ?? 'Agro-Input Dealer UG'}</Text>
              <Text style={styles.dealerMeta}>{product?.category?.name ?? 'Kampala, Central Region'}</Text>
            </View>
            <Ionicons name="chatbox-outline" size={20} color={marketplaceColors.primaryDark} />
          </View>

          <View style={styles.ratingsRow}>
            <View>
              <Text style={styles.bigRating}>{rating}</Text>
              <Text style={styles.outOf}>OUT OF 5</Text>
            </View>
            <View style={styles.ratingBars}>
              {[5, 4, 3, 2, 1].map((rating, index) => (
                <View key={rating} style={styles.barRow}>
                  <Text style={styles.barLabel}>{rating}</Text>
                  <View style={styles.barTrack}>
                    <View style={[styles.barFill, { width: `${90 - index * 16}%` }]} />
                  </View>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.reviewCard}>
            <Text style={styles.reviewer}>John Musoke</Text>
            <View style={styles.reviewStarRow}>
              {[0, 1, 2, 3, 4].map((star) => (
                <Ionicons key={star} name="star" size={10} color="#8A5A00" />
              ))}
            </View>
            <Text style={styles.reviewBody}>
              This urea worked wonders on my maize crop this season. Prompt delivery from the dealer as well.
            </Text>
          </View>
          <Pressable style={styles.allReviews}>
            <Text style={styles.allReviewsText}>See all {reviewCount} reviews</Text>
          </Pressable>
        </View>
      </AppScreen>

      <View style={[styles.bottomBar, { paddingBottom: insets.bottom || 10, height: bottomBarHeight }]}>
        <Pressable
          style={styles.heartButton}
          onPress={handleWishlist}
          accessibilityLabel={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}>
          <Ionicons
            name={wishlisted ? 'heart' : 'heart-outline'}
            size={22}
            color={wishlisted ? '#D84315' : marketplaceColors.primaryDark}
          />
        </Pressable>

        <Pressable
          onPress={handleAddToCart}
          style={[styles.outlineButton, inCart && styles.outlineButtonActive]}>
          <Text style={[styles.outlineText, inCart && styles.outlineTextActive]}>
            {inCart ? '✓ In Cart' : 'Add to Cart'}
          </Text>
        </Pressable>

        <Pressable onPress={() => router.push('/checkout')} style={styles.buyButton}>
          <Text style={styles.buyText}>Buy Now</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: marketplaceColors.screen },
  hero: { width: '100%', height: 160, resizeMode: 'cover' },
  body: { padding: 14 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  titleBlock: { flex: 1, paddingRight: 10 },
  title: { color: '#101710', fontSize: 18, lineHeight: 24, fontWeight: '900' },
  starRow: { flexDirection: 'row', alignItems: 'center', gap: 2, marginTop: 5 },
  reviewText: { color: marketplaceColors.inkSoft, fontSize: 10 },
  price: { color: '#B45500', fontSize: 20, fontWeight: '900', marginTop: 5 },
  stock: {
    color: marketplaceColors.primaryDark,
    backgroundColor: '#EAF4E8',
    borderRadius: 6,
    overflow: 'hidden',
    paddingHorizontal: 8,
    paddingVertical: 6,
    textAlign: 'center',
    fontSize: 9,
    fontWeight: '900',
  },
  descriptionCard: { backgroundColor: '#F0F5EA', borderRadius: 10, padding: 12, marginTop: 12 },
  cardLabel: { color: marketplaceColors.inkMuted, fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  description: { color: marketplaceColors.inkSoft, fontSize: 12, lineHeight: 18, marginTop: 5 },
  sectionTitle: { color: '#101710', fontSize: 15, fontWeight: '900', marginTop: 16, marginBottom: 10 },
  instructionRow: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  step: {
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: marketplaceColors.primary,
    color: '#FFFFFF', textAlign: 'center', lineHeight: 22, fontWeight: '900', fontSize: 11,
  },
  instructionText: { flex: 1 },
  instructionTitle: { color: '#101710', fontSize: 12, fontWeight: '900' },
  instructionBody: { color: marketplaceColors.inkSoft, fontSize: 11, lineHeight: 15, marginTop: 2 },
  dealerCard: {
    backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1,
    borderColor: '#DDE6D6', padding: 10, flexDirection: 'row',
    alignItems: 'center', gap: 10, marginTop: 12,
  },
  dealerImage: { width: 36, height: 36, borderRadius: 18 },
  dealerInfo: { flex: 1 },
  dealerName: { color: '#101710', fontSize: 12, fontWeight: '900' },
  dealerMeta: { color: marketplaceColors.inkMuted, fontSize: 10, marginTop: 2 },
  ratingsRow: { flexDirection: 'row', gap: 16, marginTop: 14, alignItems: 'center' },
  bigRating: { color: '#101710', fontSize: 30, fontWeight: '900' },
  outOf: { color: marketplaceColors.inkMuted, fontSize: 9, fontWeight: '800' },
  ratingBars: { flex: 1, gap: 4 },
  barRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  barLabel: { color: marketplaceColors.inkSoft, fontSize: 9, width: 9 },
  barTrack: { flex: 1, height: 4, borderRadius: 4, backgroundColor: '#DDE6D6' },
  barFill: { height: 4, borderRadius: 4, backgroundColor: marketplaceColors.primary },
  reviewCard: {
    backgroundColor: '#EAF4E8', borderLeftWidth: 3,
    borderLeftColor: marketplaceColors.primary, padding: 12, marginTop: 14,
  },
  reviewer: { color: '#101710', fontSize: 12, fontWeight: '900' },
  reviewStarRow: { flexDirection: 'row', gap: 2, marginTop: 3 },
  reviewBody: { color: marketplaceColors.inkSoft, fontSize: 11, lineHeight: 16, marginTop: 5 },
  allReviews: {
    borderWidth: 1, borderColor: '#B9C8B2', borderRadius: 10,
    height: 42, alignItems: 'center', justifyContent: 'center', marginTop: 14,
  },
  allReviewsText: { color: marketplaceColors.primaryDark, fontSize: 12, fontWeight: '900' },
  bottomBar: {
    position: 'absolute', left: 0, right: 0, bottom: 0,
    backgroundColor: marketplaceColors.screen, borderTopWidth: 1,
    borderTopColor: '#CAD5C4', flexDirection: 'row',
    alignItems: 'center', paddingHorizontal: 14, gap: 10, paddingTop: 8,
  },
  heartButton: {
    width: 40, height: 40, borderRadius: 20, borderWidth: 1,
    borderColor: '#DDE6D6', backgroundColor: '#FFFFFF',
    alignItems: 'center', justifyContent: 'center',
  },
  outlineButton: {
    flex: 1, height: 42, borderRadius: 10, borderWidth: 2,
    borderColor: marketplaceColors.primaryDark, alignItems: 'center', justifyContent: 'center',
  },
  outlineButtonActive: { backgroundColor: '#EAF4E8', borderColor: marketplaceColors.primary },
  outlineText: { color: marketplaceColors.primaryDark, fontSize: 13, fontWeight: '900' },
  outlineTextActive: { color: marketplaceColors.primary },
  buyButton: {
    flex: 1, height: 42, borderRadius: 10,
    backgroundColor: marketplaceColors.primaryDark, alignItems: 'center', justifyContent: 'center',
  },
  buyText: { color: '#FFFFFF', fontSize: 13, fontWeight: '900' },
});
