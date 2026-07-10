import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { resetPassword } from '@/services/auth.service';
import { AuthLayout } from '@/screens/auth/AuthLayout';
import { AuthTextField } from '@/components/ui/auth-text-field';
import { MarketplaceButton } from '@/components/ui/marketplace-button';
import { ScreenHeader } from '@/components/ui/screen-header';
import { marketplaceColors, marketplaceImages } from '@/constants/marketplace';
import { AuthHero } from '@/screens/auth/AuthHero';

export function ResetPasswordScreen() {
  const params = useLocalSearchParams<{ identifier?: string }>();
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSavePassword() {
    const identifier = params.identifier ?? '';
    if (!identifier || !code || !newPassword || !confirmPassword) {
      Alert.alert('Missing details', 'Enter your reset code and new password.');
      return;
    }

    try {
      setLoading(true);
      await resetPassword({ identifier, code, newPassword, confirmPassword });
      Alert.alert('Password saved', 'You can now log in with your new password.', [
        { text: 'Login', onPress: () => router.replace('/auth/login') },
      ]);
    } catch {
      Alert.alert('Reset failed', 'Could not reset your password.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      <ScreenHeader showHelp />
      <View style={styles.centerIcon}>
        <Ionicons name="reload-circle-outline" size={48} color="#FFFFFF" />
      </View>
      <Text style={styles.title}>Reset Password</Text>
      <Text style={styles.subtitle}>Create a new secure password to protect your{'\n'}farm data and marketplace orders.</Text>
      <View style={styles.formCard}>
        <AuthTextField
          icon="key-outline"
          keyboardType="number-pad"
          label="Reset Code"
          onChangeText={setCode}
          placeholder="Enter the OTP code"
          value={code}
        />
        <AuthTextField
          icon="lock-closed-outline"
          label="New Password"
          onChangeText={setNewPassword}
          placeholder="Enter your new password"
          secureTextEntry
          trailingIcon="eye-outline"
          value={newPassword}
        />
        <View style={styles.rules}>
          <View style={styles.ruleRow}>
            <Ionicons name="checkmark-circle-outline" size={12} color={marketplaceColors.primary} />
            <Text style={styles.ruleText}>At least 8 characters long</Text>
          </View>
          <View style={styles.ruleRow}>
            <Ionicons name="ellipse-outline" size={12} color={marketplaceColors.inkMuted} />
            <Text style={styles.ruleText}>Contains a special character (!@#)</Text>
          </View>
        </View>
        <AuthTextField
          icon="shield-checkmark-outline"
          label="Confirm Password"
          onChangeText={setConfirmPassword}
          placeholder="Repeat your new password"
          secureTextEntry
          value={confirmPassword}
        />
        <MarketplaceButton
          title="Save Password"
          icon="arrow-forward"
          loading={loading}
          onPress={handleSavePassword}
          style={styles.saveButton}
        />
      </View>
      <View style={styles.warningBox}>
        <Ionicons name="information-circle-outline" size={18} color={marketplaceColors.secondary} />
        <Text style={styles.warningText}>
          Changing your password will sign you out of all other active sessions on AgroConnect to ensure your account security.
        </Text>
      </View>
      <View style={styles.bottomHero}>
        <AuthHero source={marketplaceImages.forgotPassword} icon="leaf-outline" />
      </View>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  centerIcon: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: marketplaceColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: 38,
  },
  title: {
    color: '#000000',
    fontSize: 26,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 0,
    marginTop: 18,
  },
  subtitle: {
    color: marketplaceColors.inkSoft,
    fontSize: 11,
    lineHeight: 17,
    textAlign: 'center',
    letterSpacing: 0,
    marginTop: 11,
  },
  formCard: {
    gap: 13,
    marginTop: 36,
  },
  rules: {
    gap: 4,
    marginTop: -3,
    marginLeft: 5,
  },
  ruleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  ruleText: {
    color: marketplaceColors.inkSoft,
    fontSize: 9,
    fontWeight: '700',
  },
  saveButton: {
    marginTop: 4,
    width: '100%',
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    borderRadius: 8,
    backgroundColor: marketplaceColors.warningSoft,
    padding: 15,
    marginTop: 34,
  },
  warningText: {
    flex: 1,
    color: '#9A4B00',
    fontSize: 10,
    lineHeight: 15,
    fontWeight: '700',
  },
  bottomHero: {
    marginTop: 48,
    opacity: 0.45,
  },
});
