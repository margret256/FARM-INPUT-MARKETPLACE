import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  addDeliveryAddress,
  deleteDeliveryAddress,
  listDeliveryAddresses,
  setDefaultDeliveryAddress,
  type DeliveryAddress,
} from '@/api/delivery-addresses';
import { AppHeader } from '@/components/marketplace/AppHeader';
import { marketplaceColors, marketplaceShadows } from '@/constants/marketplace';
import { useAuthStore } from '@/store/auth.store';

const deliveryAddresses = [
  {
    id: 1,
    type: 'Home',
    label: 'House',
    address: '123 Main Street, Kampala, Central Region, Uganda',
    phone: '+256 770 123 456',
    isDefault: true,
  },
  {
    id: 2,
    type: 'Work',
    label: 'Office',
    address: '456 Business Avenue, Kampala, Central Region, Uganda',
    phone: '+256 770 987 654',
    isDefault: false,
  },
  {
    id: 3,
    type: 'Farm',
    label: 'Farm Location',
    address: '789 Rural Road, Wakiso, Central Region, Uganda',
    phone: '+256 770 555 999',
    isDefault: false,
  },
];

const addressTypeIcons = {
  Home: 'home-outline',
  Work: 'briefcase-outline',
  Farm: 'leaf-outline',
};

export default function DeliveryAddressesScreen() {
  const user = useAuthStore((state) => state.user);
  const [addresses, setAddresses] = useState<DeliveryAddress[]>(
    deliveryAddresses.map((address) => ({
      ...address,
      id: String(address.id),
      userId: user?.id ?? 'guest',
    })),
  );

  async function loadAddresses() {
    try {
      const response = await listDeliveryAddresses(user?.id);
      if (response.items.length > 0) setAddresses(response.items);
    } catch {
      // Keep static fallback addresses.
    }
  }

  useEffect(() => {
    loadAddresses();
  }, [user?.id]);

  async function handleAdd() {
    await addDeliveryAddress({
      userId: user?.id ?? 'guest',
      type: 'Farm',
      label: 'Farm Location',
      address: 'New farm delivery address',
      phone: user?.phone ?? '+256 XXX XXX XXX',
      isDefault: addresses.length === 0,
    });
    await loadAddresses();
  }

  async function handleDelete(id: string) {
    await deleteDeliveryAddress(id, user?.id);
    await loadAddresses();
  }

  async function handleDefault(id: string) {
    await setDefaultDeliveryAddress(id, user?.id);
    await loadAddresses();
  }

  return (
    <SafeAreaView style={styles.screen}>
      <AppHeader back title="Delivery Addresses" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Delivery Addresses</Text>
        <Text style={styles.subtitle}>Manage your delivery locations</Text>

        <View style={styles.addressList}>
          {addresses.map((addr) => (
            <View key={addr.id} style={[styles.addressCard, marketplaceShadows.card]}>
              <View style={styles.addressHeader}>
                <View style={styles.addressTypeBox}>
                  <Ionicons 
                    name={addressTypeIcons[addr.type as keyof typeof addressTypeIcons] as any} 
                    size={16} 
                    color={marketplaceColors.primaryDark} 
                  />
                </View>
                <View style={styles.addressTypeInfo}>
                  <View style={styles.addressTypeRow}>
                    <Text style={styles.addressType}>{addr.type}</Text>
                    {addr.isDefault && (
                      <Text style={styles.defaultLabel}>Default</Text>
                    )}
                  </View>
                  <Text style={styles.addressLabel}>{addr.label}</Text>
                </View>
              </View>

              <Text style={styles.addressText}>{addr.address}</Text>
              <Text style={styles.phoneText}>{addr.phone}</Text>

              <View style={styles.addressActions}>
                <Pressable style={styles.editButton} onPress={() => handleDefault(addr.id)}>
                  <Ionicons name="create-outline" size={16} color={marketplaceColors.primaryDark} />
                  <Text style={styles.editText}>Default</Text>
                </Pressable>
                <Pressable style={styles.deleteButton} onPress={() => handleDelete(addr.id)}>
                  <Ionicons name="trash-outline" size={16} color="#EF4444" />
                  <Text style={styles.deleteText}>Delete</Text>
                </Pressable>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.divider} />

        <Pressable style={styles.addButton} onPress={handleAdd}>
          <Ionicons name="add-circle-outline" size={20} color={marketplaceColors.primaryDark} />
          <Text style={styles.addText}>Add New Address</Text>
        </Pressable>

        <View style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={16} color={marketplaceColors.primaryDark} />
          <Text style={styles.infoText}>Set a default address for faster checkout. You can change it anytime.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: marketplaceColors.screen },
  content: { padding: 14, paddingBottom: 40 },
  title: { color: '#101710', fontSize: 20, fontWeight: '900', marginBottom: 5 },
  subtitle: { color: marketplaceColors.inkSoft, fontSize: 13, marginBottom: 18 },
  addressList: { gap: 12, marginBottom: 16 },
  addressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#B8C6B1',
    padding: 12,
  },
  addressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  addressTypeBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#EAF4E8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addressTypeInfo: {
    flex: 1,
  },
  addressTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  addressType: {
    color: '#101710',
    fontSize: 13,
    fontWeight: '900',
  },
  defaultLabel: {
    color: marketplaceColors.primary,
    backgroundColor: '#EAF4E8',
    fontSize: 9,
    fontWeight: '900',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 5,
  },
  addressLabel: {
    color: marketplaceColors.inkSoft,
    fontSize: 11,
    marginTop: 2,
  },
  addressText: {
    color: '#101710',
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 6,
  },
  phoneText: {
    color: marketplaceColors.inkSoft,
    fontSize: 11,
    marginBottom: 10,
  },
  addressActions: {
    flexDirection: 'row',
    gap: 10,
  },
  editButton: {
    flex: 1,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: marketplaceColors.primaryDark,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  editText: {
    color: marketplaceColors.primaryDark,
    fontSize: 12,
    fontWeight: '800',
  },
  deleteButton: {
    flex: 1,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EF4444',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  deleteText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '800',
  },
  divider: {
    height: 1,
    backgroundColor: '#CAD5C4',
    marginVertical: 16,
  },
  addButton: {
    height: 52,
    backgroundColor: marketplaceColors.primary,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 18,
  },
  addText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
  },
  infoBox: {
    backgroundColor: '#E2E8DC',
    borderRadius: 10,
    padding: 12,
    flexDirection: 'row',
    gap: 10,
  },
  infoText: {
    flex: 1,
    color: marketplaceColors.inkSoft,
    fontSize: 12,
    lineHeight: 16,
  },
});
