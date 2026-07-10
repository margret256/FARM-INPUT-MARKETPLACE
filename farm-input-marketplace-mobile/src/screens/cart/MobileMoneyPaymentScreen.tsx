import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { formatUgx } from '@/api/marketplace-adapters';
import { initiateMobileMoney } from '@/api/payments';
import { AppHeader } from '@/components/marketplace/AppHeader';
import { marketplaceColors, marketplaceShadows } from '@/constants/marketplace';
import { useAuthStore } from '@/store/auth.store';

const safetyItems = [
  ['shield-checkmark-outline', 'End-to-End Encryption', 'Your credentials are never stored on our servers.'],
  ['speedometer-outline', 'Instant Confirmation', 'Goods will be released immediately after payment.'],
] as const;

export function MobileMoneyPaymentScreen() {
  const params = useLocalSearchParams<{ amount?: string; orderId?: string }>();
  const user = useAuthStore((state) => state.user);
  const [phone, setPhone] = useState(user?.phone?.replace(/^\+256/, '') ?? '');
  const amount = Number(params.amount ?? 105000);
  const displayAmount = formatUgx(amount);

  async function handlePay() {
    try {
      await initiateMobileMoney({
        userId: user?.id,
        orderId: params.orderId,
        amount,
        phone: phone.startsWith('+') ? phone : `+256${phone.replace(/\D/g, '')}`,
        provider: 'MTN Uganda',
      });
      router.push('/payment-success');
    } catch {
      Alert.alert('Payment failed', 'Could not initiate mobile money payment.');
    }
  }

  return (
    <SafeAreaView style={styles.screen}>
      <AppHeader back title="Checkout" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.amountCard, marketplaceShadows.card]}>
          <View style={styles.amountTop}>
            <Text style={styles.cardLabel}>TOTAL AMOUNT</Text>
            <Text style={styles.pending}>Pending Payment</Text>
          </View>
          <Text style={styles.amount}>{displayAmount}</Text>
          <View style={styles.divider} />
          <View style={styles.purchaseRow}>
            <MaterialCommunityIcons name="tractor" size={18} color={marketplaceColors.primaryDark} />
            <Text style={styles.purchaseText}>AgroMarket Purchase {params.orderId ? `#${params.orderId.slice(-6).toUpperCase()}` : '#29482'}</Text>
          </View>
        </View>

        <Text style={styles.title}>Select Network</Text>
        <View style={styles.networkRow}>
          <View style={[styles.networkCard, styles.selectedNetwork]}>
            <View style={[styles.networkMark, { backgroundColor: '#1D2527' }]}>
              <Ionicons name="ellipse" size={16} color="#FBC02D" />
            </View>
            <Text style={styles.networkText}>MTN Uganda</Text>
            <Ionicons name="checkmark-circle-outline" size={20} color={marketplaceColors.primaryDark} style={styles.check} />
          </View>
          <View style={styles.networkCard}>
            <View style={[styles.networkMark, { backgroundColor: '#8E1717' }]}>
              <Ionicons name="ellipse" size={16} color="#EF4444" />
            </View>
            <Text style={styles.networkText}>Airtel Money</Text>
          </View>
        </View>

        <Text style={styles.inputLabel}>Phone Number</Text>
        <View style={styles.phoneBox}>
          <Text style={styles.countryCode}>+256</Text>
          <View style={styles.phoneDivider} />
          <TextInput
            style={styles.phoneInput}
            keyboardType="phone-pad"
            placeholder="770 000 000"
            placeholderTextColor="#7C8592"
            value={phone}
            onChangeText={setPhone}
          />
        </View>

        <View style={styles.notice}>
          <Ionicons name="information-circle-outline" size={18} color={marketplaceColors.primaryDark} />
          <Text style={styles.noticeText}>You will receive a prompt on your phone to enter your PIN to authorize the transaction.</Text>
        </View>

        <View style={styles.safetyDivider} />
        <Text style={styles.safetyTitle}>TRANSACTION SAFETY</Text>
        <View style={styles.safetyList}>
          {safetyItems.map(([icon, title, body]) => (
            <View key={title} style={styles.safetyItem}>
              <View style={styles.safetyIcon}>
                <Ionicons name={icon} size={16} color={marketplaceColors.primaryDark} />
              </View>
              <View style={styles.safetyBody}>
                <Text style={styles.safetyName}>{title}</Text>
                <Text style={styles.safetyText}>{body}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
      <View style={styles.bottom}>
        <Pressable onPress={handlePay} style={styles.payButton}>
          <Text style={styles.payText}>Pay Now</Text>
          <View style={styles.payDivider} />
          <Text style={styles.payText}>{displayAmount}</Text>
        </Pressable>
        <Text style={styles.gateway}>Secured by AgroMarket FinTrust Gateway</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: marketplaceColors.screen },
  content: { padding: 14, paddingBottom: 100 },
  amountCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#B8C6B1',
    padding: 14,
  },
  amountTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardLabel: { color: marketplaceColors.inkSoft, fontSize: 11, fontWeight: '900', letterSpacing: 1.1 },
  pending: {
    color: marketplaceColors.primaryDark,
    backgroundColor: '#E2E8DC',
    borderRadius: 8,
    overflow: 'hidden',
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 11,
    fontWeight: '900',
  },
  amount: { color: '#101710', fontSize: 28, fontWeight: '900', marginTop: 8 },
  divider: { height: 1, backgroundColor: '#B8C6B1', marginVertical: 12 },
  purchaseRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  purchaseText: { color: marketplaceColors.inkSoft, fontSize: 13 },
  title: { color: '#101710', fontSize: 18, fontWeight: '800', marginTop: 22, marginBottom: 12 },
  networkRow: { flexDirection: 'row', gap: 12 },
  networkCard: {
    flex: 1,
    height: 90,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    position: 'relative',
  },
  selectedNetwork: { borderWidth: 3, borderColor: marketplaceColors.primaryDark },
  networkMark: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  check: { position: 'absolute', right: 10, top: 10 },
  networkText: { color: marketplaceColors.inkSoft, fontSize: 12, fontWeight: '900' },
  inputLabel: { color: marketplaceColors.inkSoft, fontSize: 13, fontWeight: '700', marginTop: 18, marginBottom: 6 },
  phoneBox: {
    height: 52,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#B8C6B1',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    gap: 10,
  },
  countryCode: { color: '#101710', fontSize: 15, fontWeight: '800' },
  phoneDivider: { width: 1, height: 22, backgroundColor: '#B8C6B1' },
  phoneInput: { flex: 1, color: '#101710', fontSize: 15 },
  notice: {
    backgroundColor: '#E2E8DC',
    borderRadius: 10,
    padding: 12,
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  noticeText: { flex: 1, color: marketplaceColors.inkSoft, fontSize: 12, lineHeight: 18 },
  safetyDivider: { height: 1, backgroundColor: '#CAD5C4', marginVertical: 20 },
  safetyTitle: { color: marketplaceColors.inkSoft, fontSize: 11, fontWeight: '900', letterSpacing: 1 },
  safetyList: { gap: 14, marginTop: 12 },
  safetyItem: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  safetyIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#DDEDD9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  safetyBody: { flex: 1 },
  safetyName: { color: '#101710', fontSize: 12, fontWeight: '900' },
  safetyText: { color: marketplaceColors.inkSoft, fontSize: 11, marginTop: 2 },
  bottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopWidth: 1,
    borderTopColor: '#CAD5C4',
    backgroundColor: marketplaceColors.screen,
    padding: 12,
    alignItems: 'center',
  },
  payButton: {
    width: '100%',
    height: 52,
    borderRadius: 12,
    backgroundColor: marketplaceColors.primaryDark,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  payText: { color: '#FFFFFF', fontSize: 15, fontWeight: '900' },
  payDivider: { height: 24, width: 1, backgroundColor: 'rgba(255,255,255,0.55)' },
  gateway: { color: marketplaceColors.inkSoft, fontSize: 11, marginTop: 8 },
});
