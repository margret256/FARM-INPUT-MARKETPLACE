import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Alert } from 'react-native';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { addCartItem } from '@/api/cart';
import { addWishlistItem } from '@/api/wishlist';
import { marketplaceColors, marketplaceShadows } from '@/constants/marketplace';
import type { ProductItem } from '@/constants/mock-marketplace';
import { useAuthStore } from '@/store/auth.store';

type ProductCardProps = {
  product: ProductItem;
  compact?: boolean;
};

export function ProductCard({ product, compact = false }: ProductCardProps) {
  const user = useAuthStore((state) => state.user);

  async function handleAddToCart() {
    try {
      await addCartItem({ userId: user?.id, productId: product.id, quantity: 1 });
      router.push('/cart');
    } catch {
      Alert.alert('Cart unavailable', 'Could not add this product to your cart.');
    }
  }

  async function handleWishlist() {
    try {
      await addWishlistItem({ userId: user?.id, productId: product.id });
      router.push('/wishlist');
    } catch {
      Alert.alert('Wishlist unavailable', 'Could not save this product.');
    }
  }

  return (
    <Pressable
      onPress={() => router.push({ pathname: '/product-details', params: { id: product.id } })}
      style={[styles.card, compact && styles.compact, marketplaceShadows.card]}>
      <View>
        <Image source={product.image} style={[styles.image, compact && styles.compactImage]} />
        {product.badge ? <Text style={styles.badge}>{product.badge}</Text> : null}
        <View style={styles.heart}>
          <Pressable onPress={handleWishlist}>
            <Ionicons name="heart-outline" size={18} color={marketplaceColors.primaryDark} />
          </Pressable>
        </View>
      </View>
      <View style={styles.body}>
        <Text numberOfLines={2} style={styles.name}>{product.name}</Text>
        <Text numberOfLines={1} style={styles.subtitle}>{product.subtitle}</Text>
        {product.rating ? (
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={10} color="#8A5A00" />
            <Text style={styles.rating}>{product.rating}</Text>
          </View>
        ) : null}
        <View style={styles.row}>
          <Text style={styles.price}>{product.price}</Text>
          <Pressable style={styles.addButton} onPress={handleAddToCart}>
            <Ionicons name="add" size={19} color="#FFFFFF" />
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 142,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 9,
    borderWidth: 1,
    borderColor: '#E4E9DF',
  },
  compact: {
    minWidth: 0,
  },
  image: {
    width: '100%',
    height: 126,
    borderRadius: 9,
    resizeMode: 'cover',
  },
  compactImage: {
    height: 112,
  },
  badge: {
    position: 'absolute',
    left: 7,
    top: 7,
    backgroundColor: '#FF7F11',
    color: '#FFFFFF',
    borderRadius: 4,
    overflow: 'hidden',
    paddingHorizontal: 6,
    paddingVertical: 2,
    fontSize: 8,
    fontWeight: '900',
  },
  heart: {
    position: 'absolute',
    top: 7,
    right: 7,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.88)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    paddingTop: 9,
    gap: 4,
  },
  name: {
    color: '#101710',
    fontSize: 12,
    lineHeight: 15,
    fontWeight: '900',
  },
  subtitle: {
    color: marketplaceColors.inkMuted,
    fontSize: 9,
    fontWeight: '700',
  },
  rating: {
    color: '#8A5A00',
    fontSize: 9,
    fontWeight: '800',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  price: {
    color: marketplaceColors.primaryDark,
    fontSize: 12,
    fontWeight: '900',
  },
  addButton: {
    width: 27,
    height: 27,
    borderRadius: 7,
    backgroundColor: marketplaceColors.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
