import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  createProduct,
  listProductCategories,
  type ProductCategory,
} from '@/api/products';
import { AppHeader } from '@/components/marketplace/AppHeader';
import { DealerFloatingTabBar } from '@/components/marketplace/DealerFloatingTabBar';
import { marketplaceColors } from '@/constants/marketplace';
import { useAuthStore } from '@/store/auth.store';
import { getApiErrorMessage } from '@/utils/api-error';

const fallbackCategories: ProductCategory[] = [
  { id: 'Seeds', name: 'Seeds' },
  { id: 'Fertilizer', name: 'Fertilizer' },
  { id: 'Pesticides', name: 'Pesticides' },
  { id: 'Equipment', name: 'Equipment' },
  { id: 'Soil', name: 'Soil' },
  { id: 'Other', name: 'Other' },
];

export function AddProductScreen() {
  const user = useAuthStore((state) => state.user);
  const [categories, setCategories] = useState<ProductCategory[]>(fallbackCategories);
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | undefined>();
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [productName, setProductName] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState(100);
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<(string | null)[]>([null, null, null, null, null]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadCategories() {
      try {
        setLoadingCategories(true);
        const nextCategories = await listProductCategories();
        if (mounted && nextCategories.length > 0) {
          setCategories(nextCategories);
        }
      } catch {
        if (mounted) setCategories(fallbackCategories);
      } finally {
        if (mounted) setLoadingCategories(false);
      }
    }

    loadCategories();
    return () => { mounted = false; };
  }, []);

  async function handlePickImage(index: number) {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Allow access to your photo library to add images.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const next = [...images];
        next[index] = result.assets[0].uri;
        setImages(next);
      }
    } catch {
      Alert.alert('Error', 'Failed to pick image');
    }
  }

  function resetForm() {
    setProductName('');
    setSelectedCategory(undefined);
    setPrice('');
    setQuantity(100);
    setDescription('');
    setShowCategoryDropdown(false);
    setImages([null, null, null, null, null]);
  }

  async function handlePublish() {
    const dealerId = user?.dealer?.id;
    const userId = user?.id;
    const numericPrice = Number(price.replace(/,/g, '').trim());
    const name = productName.trim();
    const details = description.trim();

    if (!dealerId && !userId) {
      Alert.alert('Missing account', 'Log in as a dealer before adding products.');
      return;
    }

    if (!name || !selectedCategory || !price.trim() || !details) {
      Alert.alert('Missing details', 'Fill in product name, category, price, and description.');
      return;
    }

    if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
      Alert.alert('Invalid price', 'Enter a valid product price.');
      return;
    }

    try {
      setSubmitting(true);
      const product = await createProduct({
        dealerId,
        userId: dealerId ? undefined : userId,
        categoryId:
          selectedCategory.id !== selectedCategory.name ? selectedCategory.id : undefined,
        categoryName: selectedCategory.name,
        name,
        description: details,
        price: numericPrice,
        stock: quantity,
      });

      resetForm();
      Alert.alert('Product published', `${product.name} is now in your inventory.`, [
        { text: 'View inventory', onPress: () => router.replace('/dealer/inventory') },
      ]);
    } catch (error) {
      Alert.alert('Could not publish product', getApiErrorMessage(error, 'Try again in a moment.'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.screen}>
      <AppHeader title="AgroConnect" hideActions={true} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        <View style={styles.breadcrumb}>
          <Text style={styles.breadcrumbMuted}>Inventory</Text>
          <Ionicons name="chevron-forward" size={12} color={marketplaceColors.inkMuted} />
          <Text style={styles.breadcrumbActive}>Add New Product</Text>
        </View>

        <Text style={styles.title}>List Your Harvest</Text>
        <Text style={styles.subtitle}>
          Fill in the details below to reach thousands of buyers across the region.
        </Text>

        {/* Product Gallery */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>PRODUCT GALLERY</Text>
          <View style={styles.galleryGrid}>
            <Pressable style={styles.primarySlot} onPress={() => handlePickImage(0)}>
              {images[0] ? (
                <Image source={{ uri: images[0] }} style={styles.slotImage} />
              ) : (
                <>
                  <Ionicons name="camera-outline" size={28} color={marketplaceColors.primary} />
                  <Text style={styles.primarySlotText}>Primary Photo</Text>
                </>
              )}
            </Pressable>
            <View style={styles.galleryRight}>
              {[1, 2].map((i) => (
                <Pressable key={i} style={styles.smallSlot} onPress={() => handlePickImage(i)}>
                  {images[i] ? (
                    <Image source={{ uri: images[i]! }} style={styles.slotImage} />
                  ) : (
                    <Ionicons name="add" size={22} color={marketplaceColors.inkMuted} />
                  )}
                </Pressable>
              ))}
            </View>
          </View>
          <View style={styles.galleryBottom}>
            {[3, 4].map((i) => (
              <Pressable key={i} style={styles.bottomSlot} onPress={() => handlePickImage(i)}>
                {images[i] ? (
                  <Image source={{ uri: images[i]! }} style={styles.slotImage} />
                ) : (
                  <Ionicons name="add" size={22} color={marketplaceColors.inkMuted} />
                )}
              </Pressable>
            ))}
          </View>
        </View>

        {/* Product Details */}
        <View style={styles.card}>
          <View style={styles.fieldWrap}>
            <Text style={styles.fieldLabel}>PRODUCT NAME</Text>
            <TextInput
              style={styles.fieldInput}
              placeholder="e.g. Premium Grade Hybrid Maize"
              placeholderTextColor="#BCBCBC"
              value={productName}
              onChangeText={setProductName}
            />
          </View>

          <View style={styles.fieldWrap}>
            <Text style={styles.fieldLabel}>CATEGORY</Text>
            <Pressable
              style={styles.selectInput}
              onPress={() => setShowCategoryDropdown((v) => !v)}
              disabled={loadingCategories}
            >
              <Text style={[styles.selectText, selectedCategory && styles.selectTextActive]}>
                {loadingCategories
                  ? 'Loading categories...'
                  : selectedCategory?.name ?? 'Select Category'}
              </Text>
              <Ionicons name="chevron-down" size={18} color={marketplaceColors.inkMuted} />
            </Pressable>
            {showCategoryDropdown && (
              <View style={styles.dropdown}>
                {categories.map((category) => (
                  <Pressable
                    key={category.id}
                    style={styles.dropdownItem}
                    onPress={() => {
                      setSelectedCategory(category);
                      setShowCategoryDropdown(false);
                    }}
                  >
                    <Text style={styles.dropdownItemText}>{category.name}</Text>
                  </Pressable>
                ))}
              </View>
            )}
          </View>

          <View style={styles.fieldWrap}>
            <Text style={styles.fieldLabel}>PRICE (UGX)</Text>
            <View style={styles.priceInput}>
              <Text style={styles.pricePrefix}>UGX</Text>
              <TextInput
                style={styles.priceField}
                placeholder="0.00"
                placeholderTextColor="#BCBCBC"
                keyboardType="numeric"
                value={price}
                onChangeText={setPrice}
              />
            </View>
          </View>

          <View style={styles.fieldWrap}>
            <Text style={styles.fieldLabel}>QUANTITY AVAILABLE</Text>
            <View style={styles.qtyRow}>
              <Pressable
                style={styles.qtyBtn}
                onPress={() => setQuantity((v) => Math.max(0, v - 1))}
              >
                <Ionicons name="remove" size={20} color={marketplaceColors.primaryDark} />
              </Pressable>
              <Text style={styles.qtyValue}>{quantity}</Text>
              <Pressable
                style={styles.qtyBtn}
                onPress={() => setQuantity((v) => v + 1)}
              >
                <Ionicons name="add" size={20} color={marketplaceColors.primaryDark} />
              </Pressable>
            </View>
          </View>
        </View>

        {/* Description */}
        <View style={styles.card}>
          <Text style={styles.fieldLabel}>PRODUCT DESCRIPTION</Text>
          <TextInput
            style={styles.descInput}
            placeholder="Describe the origin, quality, and any special features of your product..."
            placeholderTextColor="#BCBCBC"
            multiline
            numberOfLines={5}
            textAlignVertical="top"
            maxLength={1000}
            value={description}
            onChangeText={setDescription}
          />
          <View style={styles.descFooter}>
            <Text style={styles.descTip}>Helpful tip: Detailed descriptions increase buyer trust by 40%.</Text>
            <Text style={styles.descCount}>{description.length} / 1000</Text>
          </View>
        </View>

        <View style={styles.actionRow}>
          <Pressable
            style={[styles.publishButton, submitting && styles.disabledButton]}
            onPress={handlePublish}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="rocket-outline" size={18} color="#FFFFFF" />
                <Text style={styles.publishText}>Publish Product</Text>
              </>
            )}
          </Pressable>
        </View>

      </ScrollView>
      <DealerFloatingTabBar active="cart" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: marketplaceColors.screen },
  content: { padding: 16, paddingBottom: 120 },
  breadcrumb: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  breadcrumbMuted: { fontSize: 12, color: marketplaceColors.inkMuted, fontWeight: '600' },
  breadcrumbActive: { fontSize: 12, color: marketplaceColors.primaryDark, fontWeight: '800' },
  title: { fontSize: 22, fontWeight: '900', color: '#101710' },
  subtitle: { fontSize: 12, color: marketplaceColors.inkSoft, lineHeight: 17, marginTop: 4, marginBottom: 16 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
  },
  cardLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: marketplaceColors.inkMuted,
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  galleryGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  primarySlot: {
    flex: 2,
    height: 160,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#DDE6D6',
    borderStyle: 'dashed',
    backgroundColor: '#F7FAF0',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    overflow: 'hidden',
  },
  primarySlotText: {
    color: marketplaceColors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  galleryRight: {
    flex: 1,
    gap: 8,
  },
  smallSlot: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#DDE6D6',
    borderStyle: 'dashed',
    backgroundColor: '#F7FAF0',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 74,
    overflow: 'hidden',
  },
  galleryBottom: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  bottomSlot: {
    flex: 1,
    height: 72,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#DDE6D6',
    borderStyle: 'dashed',
    backgroundColor: '#F7FAF0',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  slotImage: {
    width: '100%',
    height: '100%',
    borderRadius: 9,
  },
  fieldWrap: { marginBottom: 16 },
  fieldLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: '#101710',
    letterSpacing: 0.6,
    marginBottom: 8,
  },
  fieldInput: {
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DDE6D6',
    backgroundColor: '#F7FAF0',
    paddingHorizontal: 12,
    fontSize: 13,
    color: '#101710',
  },
  selectInput: {
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DDE6D6',
    backgroundColor: '#F7FAF0',
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectText: { fontSize: 13, color: '#BCBCBC' },
  selectTextActive: { color: '#101710' },
  dropdown: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DDE6D6',
    backgroundColor: '#FFFFFF',
    marginTop: 4,
    overflow: 'hidden',
  },
  dropdownItem: {
    paddingHorizontal: 12,
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F4ED',
  },
  dropdownItemText: { fontSize: 13, color: '#101710' },
  priceInput: {
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DDE6D6',
    backgroundColor: '#F7FAF0',
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pricePrefix: { fontSize: 13, fontWeight: '700', color: marketplaceColors.inkSoft },
  priceField: { flex: 1, fontSize: 13, color: '#101710' },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7FAF0',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DDE6D6',
    height: 44,
  },
  qtyBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyValue: {
    flex: 1,
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '800',
    color: '#101710',
  },
  descInput: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DDE6D6',
    backgroundColor: '#F7FAF0',
    padding: 12,
    fontSize: 13,
    color: '#101710',
    minHeight: 110,
    marginBottom: 8,
  },
  descFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  descTip: { flex: 1, fontSize: 10, color: marketplaceColors.inkMuted, fontStyle: 'italic' },
  descCount: { fontSize: 11, color: marketplaceColors.inkMuted, fontWeight: '700' },
  actionRow: { marginTop: 4 },
  publishButton: {
    height: 46,
    borderRadius: 24,
    backgroundColor: marketplaceColors.primaryDark,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  disabledButton: { opacity: 0.6 },
  publishText: { color: '#FFFFFF', fontSize: 14, fontWeight: '900' },
});