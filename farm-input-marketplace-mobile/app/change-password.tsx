import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { changePassword } from '@/services/auth.service';
import { AppScreen, StaticScreen } from '@/components/marketplace/AppScreen';
import { FloatingTabBar } from '@/components/marketplace/FloatingTabBar';
import { marketplaceColors } from '@/constants/marketplace';

export default function ChangePasswordScreen() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  async function handleUpdatePassword() {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Missing details', 'Fill in all password fields.');
      return;
    }

    try {
      await changePassword({ currentPassword, newPassword, confirmPassword });
      Alert.alert('Password updated', 'Your password was changed successfully.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch {
      Alert.alert('Update failed', 'Could not change your password.');
    }
  }

  return (
    <StaticScreen>
      <AppScreen back title="Change Password">
        <View style={styles.container}>
          <Text style={styles.title}>Change Password</Text>
          <Text style={styles.subtitle}>Update your account password</Text>

          {/* Current Password */}
          <Text style={styles.label}>Current Password</Text>
          <View style={styles.inputBox}>
            <Ionicons name="lock-closed-outline" size={18} color={marketplaceColors.inkSoft} />
            <TextInput
              style={styles.input}
              placeholder="Enter current password"
              placeholderTextColor="#9AA89A"
              secureTextEntry={!showCurrent}
              value={currentPassword}
              onChangeText={setCurrentPassword}
            />
            <Pressable onPress={() => setShowCurrent(v => !v)}>
              <Ionicons name={showCurrent ? 'eye-outline' : 'eye-off-outline'} size={18} color={marketplaceColors.inkSoft} />
            </Pressable>
          </View>

          {/* New Password */}
          <Text style={styles.label}>New Password</Text>
          <View style={styles.inputBox}>
            <Ionicons name="lock-open-outline" size={18} color={marketplaceColors.inkSoft} />
            <TextInput
              style={styles.input}
              placeholder="Enter new password"
              placeholderTextColor="#9AA89A"
              secureTextEntry={!showNew}
              value={newPassword}
              onChangeText={setNewPassword}
            />
            <Pressable onPress={() => setShowNew(v => !v)}>
              <Ionicons name={showNew ? 'eye-outline' : 'eye-off-outline'} size={18} color={marketplaceColors.inkSoft} />
            </Pressable>
          </View>

          {/* Confirm Password */}
          <Text style={styles.label}>Confirm New Password</Text>
          <View style={[
            styles.inputBox,
            confirmPassword.length > 0 && newPassword !== confirmPassword && styles.inputBoxError,
          ]}>
            <Ionicons name="shield-checkmark-outline" size={18} color={marketplaceColors.inkSoft} />
            <TextInput
              style={styles.input}
              placeholder="Re-enter new password"
              placeholderTextColor="#9AA89A"
              secureTextEntry={!showConfirm}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
            <Pressable onPress={() => setShowConfirm(v => !v)}>
              <Ionicons name={showConfirm ? 'eye-outline' : 'eye-off-outline'} size={18} color={marketplaceColors.inkSoft} />
            </Pressable>
          </View>
          {confirmPassword.length > 0 && newPassword !== confirmPassword && (
            <Text style={styles.errorText}>Passwords do not match</Text>
          )}

          <View style={styles.divider} />

          <Pressable style={styles.button} onPress={handleUpdatePassword}>
            <Text style={styles.buttonText}>Update Password</Text>
          </Pressable>
          <Pressable style={styles.cancelButton} onPress={() => router.back()}>
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>
        </View>
      </AppScreen>
      <FloatingTabBar active="profile" />
    </StaticScreen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 24 },
  title: { fontSize: 20, fontWeight: '900', color: '#101710', marginBottom: 6 },
  subtitle: { fontSize: 13, color: marketplaceColors.inkSoft, marginBottom: 28 },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: marketplaceColors.inkSoft,
    marginBottom: 8,
    marginTop: 16,
  },
  inputBox: {
    height: 52,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#B8C6B1',
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    gap: 10,
  },
  inputBoxError: {
    borderColor: '#EF4444',
    backgroundColor: '#FFF5F5',
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#101710',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 11,
    marginTop: 5,
  },
  divider: {
    height: 1,
    backgroundColor: '#CAD5C4',
    marginTop: 32,
    marginBottom: 24,
  },
  button: {
    backgroundColor: marketplaceColors.primaryDark,
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '900' },
  cancelButton: {
    height: 52,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#B8C6B1',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  cancelText: { color: marketplaceColors.inkSoft, fontSize: 15, fontWeight: '800' },
});
