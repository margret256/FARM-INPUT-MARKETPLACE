import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { addPaymentMethod, deletePaymentMethod, listPaymentMethods, type PaymentMethod } from '@/api/payments';
import { AppHeader } from '@/components/marketplace/AppHeader';
import { marketplaceColors, marketplaceShadows } from '@/constants/marketplace';
import { useAuthStore } from '@/store/auth.store';

const paymentMethods = [
  {
    id: 1,
    type: 'Mobile Money',
    provider: 'MTN Uganda',
    identifier: '+256 770 XXX 000',
    icon: 'phone-portrait-outline',
    isDefault: true,
  },
  {
    id: 2,
    type: 'Bank Card',
    provider: 'Visa',
    identifier: '**** **** **** 4242',
    icon: 'card-outline',
    isDefault: false,
  },
  {
    id: 3,
    type: 'AgroWallet',
    provider: 'AgroMarket Balance',
    identifier: 'UGX 125,500 available',
    icon: 'wallet-outline',
    isDefault: false,
  },
];

export default function PaymentMethodsScreen() {
  const user = useAuthStore((state) => state.user);
  const [methods, setMethods] = useState<PaymentMethod[]>(
    paymentMethods.map((method) => ({
      id: String(method.id),
      userId: user?.id ?? 'guest',
      type: method.type,
      provider: method.provider,
      identifier: method.identifier,
      isDefault: method.isDefault,
    })),
  );

  async function loadMethods() {
    try {
      const response = await listPaymentMethods(user?.id);
      setMethods(response);
    } catch {
      // Keep static fallback methods.
    }
  }

  useEffect(() => {
    loadMethods();
  }, [user?.id]);

  async function handleAdd(type: string) {
    await addPaymentMethod({
      userId: user?.id,
      type,
      provider: type === 'Mobile Money' ? 'MTN Uganda' : type,
      identifier: type === 'Mobile Money' ? user?.phone ?? '+256 XXX XXX XXX' : 'New method',
    });
    await loadMethods();
  }

  async function handleDelete(id: string) {
    await deletePaymentMethod(id, user?.id);
    await loadMethods();
  }

  return (
    <SafeAreaView style={styles.screen}>
      <AppHeader back title="Payment Methods" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Payment Methods</Text>
        <Text style={styles.subtitle}>Manage your payment options</Text>

        <View style={styles.methodsList}>
          {methods.map((method) => (
            <View key={method.id} style={[styles.methodCard, marketplaceShadows.card]}>
              <View style={styles.methodLeft}>
                <View style={styles.methodIcon}>
                  <Ionicons name={method.type.includes('Card') ? 'card-outline' : method.type.includes('Wallet') ? 'wallet-outline' : 'phone-portrait-outline'} size={20} color={marketplaceColors.primaryDark} />
                </View>
                <View style={styles.methodInfo}>
                  <View style={styles.methodHeader}>
                    <Text style={styles.methodType}>{method.type}</Text>
                    {method.isDefault && (
                      <Text style={styles.defaultBadge}>Default</Text>
                    )}
                  </View>
                  <Text style={styles.methodProvider}>{method.provider}</Text>
                  <Text style={styles.methodIdentifier}>{method.identifier}</Text>
                </View>
              </View>
              <View style={styles.methodActions}>
                <Pressable style={styles.actionButton}>
                  <Ionicons name="create-outline" size={18} color={marketplaceColors.primaryDark} />
                </Pressable>
                <Pressable style={styles.actionButton} onPress={() => handleDelete(method.id)}>
                  <Ionicons name="trash-outline" size={18} color="#EF4444" />
                </Pressable>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.divider} />
        <Text style={styles.sectionTitle}>Add Payment Method</Text>
        
        <Pressable style={styles.addMethodButton} onPress={() => handleAdd('Mobile Money')}>
          <View style={styles.addIconBox}>
            <Ionicons name="phone-portrait-outline" size={18} color="#FFFFFF" />
          </View>
          <Text style={styles.addMethodText}>Mobile Money</Text>
          <Ionicons name="chevron-forward-outline" size={20} color={marketplaceColors.inkSoft} />
        </Pressable>

        <Pressable style={styles.addMethodButton} onPress={() => handleAdd('Bank Card')}>
          <View style={styles.addIconBox}>
            <Ionicons name="card-outline" size={18} color="#FFFFFF" />
          </View>
          <Text style={styles.addMethodText}>Bank Card</Text>
          <Ionicons name="chevron-forward-outline" size={20} color={marketplaceColors.inkSoft} />
        </Pressable>

        <Pressable style={styles.addMethodButton} onPress={() => handleAdd('Bank Transfer')}>
          <View style={styles.addIconBox}>
            <Ionicons name="wallet-outline" size={18} color="#FFFFFF" />
          </View>
          <Text style={styles.addMethodText}>Bank Transfer</Text>
          <Ionicons name="chevron-forward-outline" size={20} color={marketplaceColors.inkSoft} />
        </Pressable>

        <View style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={18} color={marketplaceColors.primaryDark} />
          <Text style={styles.infoText}>Your payment information is encrypted and secure. We never store your full card details.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: marketplaceColors.screen },
  content: { padding: 14, paddingBottom: 40 },
  title: { color: '#101710', fontSize: 20, fontWeight: '900', marginBottom: 5 },
  subtitle: { color: marketplaceColors.inkSoft, fontSize: 13, marginBottom: 20 },
  methodsList: { gap: 12, marginBottom: 20 },
  methodCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#B8C6B1',
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  methodLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  methodIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#EAF4E8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  methodInfo: {
    flex: 1,
  },
  methodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  methodType: {
    color: '#101710',
    fontSize: 14,
    fontWeight: '900',
  },
  defaultBadge: {
    color: marketplaceColors.primary,
    backgroundColor: '#EAF4E8',
    fontSize: 10,
    fontWeight: '900',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  methodProvider: {
    color: marketplaceColors.inkSoft,
    fontSize: 12,
    marginTop: 2,
  },
  methodIdentifier: {
    color: '#7C8592',
    fontSize: 11,
    marginTop: 1,
  },
  methodActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#F0F5EA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: '#CAD5C4',
    marginVertical: 18,
  },
  sectionTitle: {
    color: '#101710',
    fontSize: 14,
    fontWeight: '900',
    marginBottom: 12,
  },
  addMethodButton: {
    height: 56,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#B8C6B1',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    gap: 12,
    marginBottom: 10,
  },
  addIconBox: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: marketplaceColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addMethodText: {
    flex: 1,
    color: '#101710',
    fontSize: 14,
    fontWeight: '800',
  },
  infoBox: {
    backgroundColor: '#E2E8DC',
    borderRadius: 10,
    padding: 12,
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },
  infoText: {
    flex: 1,
    color: marketplaceColors.inkSoft,
    fontSize: 12,
    lineHeight: 17,
  },
});
