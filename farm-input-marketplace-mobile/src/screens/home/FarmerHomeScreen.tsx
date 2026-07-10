import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { productToCard } from '@/api/marketplace-adapters';
import { listProducts } from '@/api/products';
import { AppScreen, StaticScreen } from '@/components/marketplace/AppScreen';
import { FloatingTabBar } from '@/components/marketplace/FloatingTabBar';
import { ProductCard } from '@/components/marketplace/ProductCard';
import {
  appImages,
  categories,
  featuredProducts,
  recommendedProducts,
} from '@/constants/mock-marketplace';
import { marketplaceColors, marketplaceShadows } from '@/constants/marketplace';
import { useAuthStore } from '@/store/auth.store';
import type { ProductItem } from '@/constants/mock-marketplace';

export function FarmerHomeScreen() {
  const user = useAuthStore((state) => state.user);
  const profileImage = useAuthStore((state) => state.profileImage);
  const [featured, setFeatured] = useState<ProductItem[]>(featuredProducts);
  const [recommended, setRecommended] = useState(recommendedProducts);

  useEffect(() => {
    let mounted = true;

    async function loadProducts() {
      try {
        const response = await listProducts();
        if (!mounted || response.items.length === 0) return;
        const cards = response.items.map(productToCard);
        setFeatured(cards.slice(0, 2));
        setRecommended(
          cards.slice(2, 4).map((item) => ({
            name: item.name,
            subtitle: item.subtitle,
            price: item.price,
            image: item.image,
          })),
        );
      } catch {
        // Keep bundled fallback content when the API is offline.
      }
    }

    loadProducts();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <StaticScreen>
      <AppScreen title="AgroMarket">
        <View style={styles.profileRow}>
          <Image source={profileImage ? { uri: profileImage } : appImages.smartFarming} style={styles.avatar} />
          <View>
            <Text style={styles.hello}>Hello, {user?.firstName || 'Farmer'}</Text>
            <Text style={styles.location}>Kampala, UG</Text>
          </View>
        </View>
        <View style={styles.searchRow}>
          <Ionicons name="search" size={16} color={marketplaceColors.inkMuted} />
          <Text style={styles.searchText}>Search seeds, tools, or dealers...</Text>
          <Ionicons name="mic-outline" size={18} color={marketplaceColors.primaryDark} />
          <Ionicons name="options-outline" size={18} color={marketplaceColors.primaryDark} />
        </View>

       

        {/* Horizontally scrollable categories — shows ALL */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryRow}>
          {categories.map((category) => (
            <Pressable key={category.name} style={styles.categoryItem}>
              <View style={styles.categoryIconWrap}>
                <MaterialCommunityIcons
                  name={category.icon}
                  size={30}
                  color={marketplaceColors.primary}
                />
              </View>
              <Text numberOfLines={2} style={styles.categoryLabel}>
                {category.name}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        <View style={styles.saleBanner}>
          <Image source={appImages.harvest} style={styles.saleImage} />
          <View style={styles.saleOverlay} />
          <Text style={styles.saleBadge}>SEASONAL OFFER</Text>
          <Text style={styles.saleTitle}>Season Sale:{'\n'}20% off all Seeds</Text>
          <Text style={styles.saleSmall}>Valid until October 15th</Text>
          <Pressable style={styles.shopNow}>
            <Text style={styles.shopNowText}>Shop Now</Text>
          </Pressable>
        </View>

        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Featured Products</Text>
          <Text style={styles.viewAll}>See More</Text>
        </View>
        <View style={styles.productRow}>
          {featured.map((product) => (
            <ProductCard key={product.id} compact product={product} />
          ))}
        </View>

        <Text style={styles.sectionTitle}>Recommended for You</Text>
        <View style={styles.recommendedList}>
          {recommended.map((item) => (
            <View key={item.name} style={[styles.recommendedCard, marketplaceShadows.card]}>
              <Image source={item.image} style={styles.recommendedImage} />
              <View style={styles.recommendedBody}>
                <Text style={styles.recommendedTitle}>{item.name}</Text>
                <Text style={styles.recommendedSubtitle}>{item.subtitle}</Text>
                <Text style={styles.recommendedPrice}>{item.price}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={marketplaceColors.inkMuted} />
            </View>
          ))}
        </View>
      </AppScreen>

      <Pressable style={styles.fab}>
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </Pressable>
      <FloatingTabBar active="home" />
    </StaticScreen>
  );
}

const styles = StyleSheet.create({
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    resizeMode: 'cover',
    overflow:'hidden',
  },
  hello: {
    fontSize: 12,
    fontWeight: '900',
    color: '#101710',
  },
  location: {
    fontSize: 10,
    color: marketplaceColors.inkMuted,
    fontWeight: '800',
  },
  searchRow: {
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DDE6D6',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 13,
    gap: 9,
    marginBottom:17,
  },
  searchText: {
    flex: 1,
    color: marketplaceColors.inkMuted,
    fontSize: 11,
    fontWeight: '700',
  },
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    color: '#101710',
    fontSize: 16,
    fontWeight: '900',
  },
   viewAll: {
     padding: 6,
   },
   viewAllText: {
     color: marketplaceColors.primaryDark,
     fontSize: 10,
     fontWeight: '900',
   },
  /* Horizontal scroll row for categories */
  categoryRow: {
    flexDirection: 'row',
    gap: 10,
    paddingRight: 16,
    paddingBottom: 4,
  },
  categoryItem: {
    width: 76,
    minHeight: 82,
    borderRadius: 13,
    backgroundColor: '#EAF4E8',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 6,
    gap: 6,
  },
  categoryIconWrap: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryLabel: {
    color: '#101710',
    fontSize: 9,
    fontWeight: '800',
    textAlign: 'center',
  },
  saleBanner: {
    height: 120,
    borderRadius: 14,
    marginTop: 18,
    overflow: 'hidden',
    padding: 14,
  },
  saleImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  saleOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  saleBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FF7F11',
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '900',
    borderRadius: 4,
    overflow: 'hidden',
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  saleTitle: {
    color: '#FFFFFF',
    fontSize: 19,
    lineHeight: 21,
    fontWeight: '900',
    marginTop: 7,
  },
  saleSmall: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  shopNow: {
    backgroundColor: marketplaceColors.primaryDark,
    borderRadius: 7,
    alignSelf: 'flex-start',
    paddingHorizontal: 13,
    paddingVertical: 5,
    marginTop: 6,
  },
  shopNowText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
  },
  productRow: {
    flexDirection: 'row',
    gap: 12,
  },
  recommendedList: {
    gap: 12,
    marginTop: 10,
  },
  recommendedCard: {
    minHeight: 74,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 9,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  recommendedImage: {
    width: 56,
    height: 56,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  recommendedBody: {
    flex: 1,
  },
  recommendedTitle: {
    color: '#101710',
    fontSize: 12,
    fontWeight: '900',
  },
  recommendedSubtitle: {
    color: marketplaceColors.inkMuted,
    fontSize: 9,
    fontWeight: '700',
    marginTop: 2,
  },
  recommendedPrice: {
    color: marketplaceColors.primaryDark,
    fontSize: 11,
    fontWeight: '900',
    marginTop: 4,
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 116,
    width: 50,
    height: 50,
    borderRadius: 18,
    backgroundColor: '#FF7F11',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
});
