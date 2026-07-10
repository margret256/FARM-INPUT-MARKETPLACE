import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { MarketplaceButton } from '@/components/ui/marketplace-button';
import { ScreenHeader } from '@/components/ui/screen-header';
import { marketplaceColors, marketplaceImages, marketplaceShadows } from '@/constants/marketplace';
import { AuthHero } from '@/screens/auth/AuthHero';
import { AuthLayout } from '@/screens/auth/AuthLayout';
import { resendOtp, verifyOtp } from '@/services/auth.service';
import { useAuthStore } from '@/store/auth.store';
import { getApiErrorMessage } from '@/utils/api-error';

export function OtpVerificationScreen() {
  const params = useLocalSearchParams<{ identifier?: string; role?: string }>();
  const [codeDigits, setCodeDigits] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const setSession = useAuthStore((state) => state.setSession);
  const identifier = params.identifier ?? '';
  const role = params.role ?? '';

  function updateDigit(value: string, index: number) {
    const digit = value.replace(/\D/g, '').slice(-1);
    const nextDigits = [...codeDigits];
    nextDigits[index] = digit;
    setCodeDigits(nextDigits);

    if (digit && index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  async function handleVerify() {
    const code = codeDigits.join('');

    if (!identifier) {
      Alert.alert('Missing contact', 'Register again so we know where to verify the OTP.');
      return;
    }

    if (code.length !== 6) {
      Alert.alert('Invalid code', 'Enter the 6-digit OTP sent to your email.');
      return;
    }

    try {
      setLoading(true);
      const response = await verifyOtp({ identifier, code });
      await setSession(response.accessToken, response.user);
      if (role === 'dealer' || response.user.role === 'DEALER') {
        router.replace('/dealer/dashboard');
      } else {
        router.replace('/tabs/home' as any);
      }
    } catch (error) {
      Alert.alert('Verification failed', getApiErrorMessage(error, 'Try again in a moment.'));
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (!identifier) {
      Alert.alert('Missing contact', 'Register again so we know where to send the OTP.');
      return;
    }

    try {
      setResending(true);
      const response = await resendOtp(identifier);
      Alert.alert('OTP sent', response.message);
    } catch (error) {
      Alert.alert('Could not resend OTP', getApiErrorMessage(error, 'Try again in a moment.'));
    } finally {
      setResending(false);
    }
  }

  return (
    <AuthLayout>
      <ScreenHeader />
      <View style={[styles.card, marketplaceShadows.card]}>
        <AuthHero source={marketplaceImages.otpHero} icon="phone-portrait-outline" />
        <Text style={styles.title}>Verify Account</Text>
        <Text style={styles.subtitle}>Enter the code sent to your email</Text>
        <View style={styles.otpRow}>
          {codeDigits.map((digit, index) => (
            <TextInput
              key={index}
              ref={(input) => {
                inputRefs.current[index] = input;
              }}
              keyboardType="number-pad"
              maxLength={1}
              onChangeText={(value) => updateDigit(value, index)}
              style={styles.otpBox}
              textAlign="center"
              value={digit}
            />
          ))}
        </View>
        <View style={styles.timerRow}>
          <Ionicons name="timer-outline" size={14} color={marketplaceColors.secondary} />
          <Text style={styles.timerText}>0:59</Text>
        </View>
        <Pressable disabled={resending} onPress={handleResend}>
          <Text style={styles.resendText}>{resending ? 'Sending...' : 'Resend Code'}</Text>
        </Pressable>
        <MarketplaceButton
          title="Verify Account"
          loading={loading}
          onPress={handleVerify}
          style={styles.button}
        />
        <View style={styles.helpRow}>
          <Ionicons name="help-circle-outline" size={12} color={marketplaceColors.primary} />
          <Text style={styles.helpText}>Need help? Contact support</Text>
        </View>
      </View>
      <Text style={styles.footer}>Secure Verification by AgroConnect (c) 2024</Text>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 18,
    marginTop: 24,
  },
  title: {
    color: marketplaceColors.primaryDark,
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'center',
    marginTop: 18,
    letterSpacing: 0,
  },
  subtitle: {
    color: marketplaceColors.inkSoft,
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 9,
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 9,
    marginTop: 24,
  },
  otpBox: {
    flex: 1,
    height: 48,
    borderRadius: 7,
    backgroundColor: marketplaceColors.muted,
    borderWidth: 1,
    borderColor: '#E3E8DD',
    color: '#000000',
    fontSize: 18,
    fontWeight: '900',
  },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginTop: 24,
  },
  timerText: {
    color: marketplaceColors.ink,
    fontSize: 10,
    fontWeight: '800',
  },
  resendText: {
    color: marketplaceColors.ink,
    fontSize: 9,
    fontWeight: '900',
    textAlign: 'center',
    marginTop: 4,
  },
  button: {
    marginTop: 22,
    minHeight: 52,
    width: '100%',
    backgroundColor: marketplaceColors.primaryDark,
    borderColor: marketplaceColors.primaryDark,
  },
  helpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginTop: 21,
  },
  helpText: {
    color: marketplaceColors.primaryDark,
    fontSize: 9,
    fontWeight: '800',
  },
  footer: {
    color: marketplaceColors.inkMuted,
    fontSize: 9,
    textAlign: 'center',
    marginTop: 34,
  },
});
