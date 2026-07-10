import { Link, router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { forgotPassword } from '@/services/auth.service';
import { AuthLayout } from '@/screens/auth/AuthLayout';
import { AuthHero } from '@/screens/auth/AuthHero';
import { AuthTextField } from '@/components/ui/auth-text-field';
import { MarketplaceButton } from '@/components/ui/marketplace-button';
import { ScreenHeader } from '@/components/ui/screen-header';
import { marketplaceColors, marketplaceImages } from '@/constants/marketplace';

export function ForgotPasswordScreen() {
  const [identifier, setIdentifier] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSendCode() {
    if (!identifier.trim()) {
      Alert.alert('Missing contact', 'Enter your email or phone number.');
      return;
    }

    try {
      setLoading(true);
      await forgotPassword(identifier);
      router.push({
        pathname: '/auth/reset-password',
        params: { identifier },
      });
    } catch {
      Alert.alert('Request failed', 'Could not request a reset code.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      <ScreenHeader />
      <View style={styles.heroWrap}>
        <AuthHero source={marketplaceImages.forgotPassword} icon="mail-outline" />
      </View>
      <Text style={styles.title}>Forgot Password</Text>
      <Text style={styles.subtitle}>Enter your email or phone to receive a reset code</Text>
      <View style={styles.form}>
        <AuthTextField
          autoCapitalize="none"
          icon="mail-outline"
          keyboardType="email-address"
          label="Email or Phone Number"
          onChangeText={setIdentifier}
          placeholder="e.g. farmer@field.com"
          value={identifier}
        />
        <MarketplaceButton
          title="Send Reset Code"
          icon="arrow-forward"
          loading={loading}
          onPress={handleSendCode}
          style={styles.button}
        />
      </View>
      <Link href="/auth/login" asChild>
        <Pressable style={styles.backLink}>
          <Text style={styles.backText}>Back to Login</Text>
        </Pressable>
      </Link>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  heroWrap: {
    marginTop: 24,
  },
  title: {
    color: '#000000',
    fontSize: 26,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 0,
    marginTop: 28,
  },
  subtitle: {
    color: marketplaceColors.inkSoft,
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0,
    marginTop: 11,
  },
  form: {
    gap: 18,
    marginTop: 26,
  },
  button: {
    marginTop: 0,
    width: '100%',
    minHeight: 52,
    backgroundColor: marketplaceColors.primaryDark,
    borderColor: marketplaceColors.primaryDark,
  },
  backLink: {
    alignItems: 'center',
    marginTop: 36,
  },
  backText: {
    color: marketplaceColors.primaryDark,
    fontSize: 11,
    fontWeight: '900',
  },
});
