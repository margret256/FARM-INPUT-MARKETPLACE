// app/dealer-onboarding.tsx
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import { useState, useEffect } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppHeader } from '@/components/marketplace/AppHeader';
import { MarketplaceButton } from '@/components/ui/marketplace-button';
import { marketplaceColors, marketplaceShadows } from '@/constants/marketplace';
import { uploadDealerDocument } from '@/api/dealers';
import { registerDealer } from '@/services/auth.service';

const steps = ['Business', 'Identity', 'Documents'];

type DocumentType = 'license' | 'permit';

type UploadedDoc = {
  name: string;
  uri: string;
  mimeType: string;
};

export function DealerOnboardingScreen() {
  const [businessName, setBusinessName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [businessLocation, setBusinessLocation] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [documents, setDocuments] = useState<{
    license?: UploadedDoc;
    permit?: UploadedDoc;
  }>({});

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required to set your business location.');
      }
    })();
  }, []);

  async function getCurrentLocation() {
    try {
      setLocationLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required to set your business location.');
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const { latitude, longitude } = location.coords;
      const address = await reverseGeocode(latitude, longitude);
      setBusinessLocation(address);

      Alert.alert('Location Set', 'Your business location has been set successfully!');
    } catch (error) {
      console.error('Location error:', error);
      Alert.alert('Error', 'Failed to get your location. Please try again or enter manually.');
    } finally {
      setLocationLoading(false);
    }
  }

  async function reverseGeocode(lat: number, lng: number): Promise<string> {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      );
      const data = await response.json();
      if (data && data.display_name) {
        return data.display_name;
      }
      return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    } catch {
      return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    }
  }

  async function handleDocumentPick(type: DocumentType) {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const file = result.assets[0];
        setDocuments((prev) => ({
          ...prev,
          [type]: {
            name: file.fileName ?? `${type}.jpg`,
            uri: file.uri,
            mimeType: file.mimeType ?? 'image/jpeg',
          },
        }));
      }
    } catch {
      Alert.alert('Error', 'Failed to pick document');
    }
  }

  async function handleSubmit() {
    if (!businessName || !ownerName || !businessLocation || !phone || !email) {
      Alert.alert('Missing details', 'Fill in all required fields.');
      return;
    }

    if (password.length < 8) {
      Alert.alert('Invalid password', 'Password must be at least 8 characters.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Password mismatch', 'Passwords do not match.');
      return;
    }

    if (!documents.license || !documents.permit) {
      Alert.alert('Missing documents', 'Upload both the trade license and business permit.');
      return;
    }

    try {
      setLoading(true);
      const uploadedDocuments = await Promise.all([
        uploadDealerDocument({
          type: 'Trade License',
          ...documents.license,
        }),
        uploadDealerDocument({
          type: 'Business Permit',
          ...documents.permit,
        }),
      ]);

      const payload = {
        businessName,
        ownerName,
        businessLocation,
        phone,
        email,
        password,
        confirmPassword,
        documents: uploadedDocuments,
      };

      await registerDealer(payload);
      router.replace({
        pathname: '/auth/otp-verification',
        params: { identifier: email, role: 'dealer' },
      });
    } catch (error: any) {
      console.error('Submission error:', error);
      const raw = error?.response?.data?.message;
      const errorMessage = Array.isArray(raw)
        ? raw.join('\n')
        : raw ?? error?.message ?? 'Submission failed. Please try again.';
      Alert.alert('Submission failed', errorMessage);
    } finally {
      setLoading(false);
    }
  }

  function handleSaveDraft() {
    if (!businessName && !ownerName && !businessLocation && !phone && !email && !password) {
      Alert.alert('No data', 'Fill in some fields before saving draft.');
      return;
    }
    Alert.alert('Draft saved', 'Your onboarding progress has been saved.');
  }

  return (
    <SafeAreaView style={styles.screen}>
      <AppHeader title="AgroConnect" hideActions={true} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Dealer Onboarding</Text>
          <Text style={styles.cardSubtitle}>
            Grow your business with AgroConnect. Complete the verification process to start listing your inventory.
          </Text>

          <View style={styles.stepsRow}>
            {steps.map((step, i) => (
              <View key={step} style={styles.stepItem}>
                <View style={styles.stepLineWrap}>
                  {i > 0 && <View style={[styles.stepLine, i === 0 && styles.stepLineActive]} />}
                  <View style={[styles.stepCircle, i === 0 && styles.stepCircleActive]}>
                    <Text style={[styles.stepNumber, i === 0 && styles.stepNumberActive]}>{i + 1}</Text>
                  </View>
                  {i < steps.length - 1 && <View style={styles.stepLine} />}
                </View>
                <Text style={[styles.stepLabel, i === 0 && styles.stepLabelActive]}>{step}</Text>
              </View>
            ))}
          </View>

          <View style={styles.fieldWrap}>
            <View style={styles.fieldLabelRow}>
              <Ionicons name="storefront-outline" size={13} color={marketplaceColors.inkMuted} />
              <Text style={styles.fieldLabel}>Business Name</Text>
            </View>
            <TextInput
              style={styles.fieldInput}
              placeholder="e.g. Green Field Supplies Co."
              placeholderTextColor="#BCBCBC"
              value={businessName}
              onChangeText={setBusinessName}
            />
          </View>

          <View style={styles.fieldWrap}>
            <View style={styles.fieldLabelRow}>
              <Ionicons name="person-outline" size={13} color={marketplaceColors.inkMuted} />
              <Text style={styles.fieldLabel}>Owner Name</Text>
            </View>
            <TextInput
              style={styles.fieldInput}
              placeholder="Full legal name"
              placeholderTextColor="#BCBCBC"
              value={ownerName}
              onChangeText={setOwnerName}
            />
          </View>

          <View style={styles.fieldWrap}>
            <View style={styles.fieldLabelRow}>
              <Ionicons name="location-outline" size={13} color={marketplaceColors.inkMuted} />
              <Text style={styles.fieldLabel}>Business Location</Text>
            </View>
            <View style={styles.locationRow}>
              <TextInput
                style={[styles.fieldInput, styles.locationInput]}
                placeholder="Enter address or tap 'Get Location'"
                placeholderTextColor="#BCBCBC"
                value={businessLocation}
                onChangeText={setBusinessLocation}
                editable={true}
              />
              <TouchableOpacity
                style={styles.locationButton}
                onPress={getCurrentLocation}
                disabled={locationLoading}
                activeOpacity={0.7}
              >
                {locationLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Ionicons name="locate" size={16} color="#FFFFFF" />
                    <Text style={styles.locationButtonText}>Get</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.fieldWrap}>
            <View style={styles.fieldLabelRow}>
              <Ionicons name="call-outline" size={13} color={marketplaceColors.inkMuted} />
              <Text style={styles.fieldLabel}>Phone Number</Text>
            </View>
            <TextInput
              style={styles.fieldInput}
              placeholder="+1 (555) 000-0000"
              placeholderTextColor="#BCBCBC"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
            />
          </View>

          <View style={styles.fieldWrap}>
            <View style={styles.fieldLabelRow}>
              <Ionicons name="mail-outline" size={13} color={marketplaceColors.inkMuted} />
              <Text style={styles.fieldLabel}>Email Address</Text>
            </View>
            <TextInput
              style={styles.fieldInput}
              placeholder="contact@business.com"
              placeholderTextColor="#BCBCBC"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <View style={styles.fieldWrap}>
            <View style={styles.fieldLabelRow}>
              <Ionicons name="lock-closed-outline" size={13} color={marketplaceColors.inkMuted} />
              <Text style={styles.fieldLabel}>Password</Text>
            </View>
            <View style={styles.passwordRow}>
              <TextInput
                style={[styles.fieldInput, styles.passwordInput]}
                placeholder="Enter password (min 8 characters)"
                placeholderTextColor="#BCBCBC"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={marketplaceColors.inkMuted}
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.fieldWrap}>
            <View style={styles.fieldLabelRow}>
              <Ionicons name="refresh-circle-outline" size={13} color={marketplaceColors.inkMuted} />
              <Text style={styles.fieldLabel}>Confirm Password</Text>
            </View>
            <View style={styles.passwordRow}>
              <TextInput
                style={[styles.fieldInput, styles.passwordInput]}
                placeholder="Confirm your password"
                placeholderTextColor="#BCBCBC"
                secureTextEntry={!showConfirmPassword}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={marketplaceColors.inkMuted}
                />
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.docTitle}>Document Verification</Text>

          <View style={styles.docWrap}>
            <Text style={styles.docLabel}>Trade License (PDF or JPEG)</Text>
            <TouchableOpacity
              style={styles.uploadBox}
              onPress={() => handleDocumentPick('license')}
              activeOpacity={0.7}
            >
              <Ionicons name="document-outline" size={32} color={marketplaceColors.primary} />
              <Text style={styles.uploadText}>
                {documents.license ? documents.license.name : 'Click to upload License'}
              </Text>
              <Text style={styles.uploadLimit}>MAX 10MB</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.docWrap}>
            <Text style={styles.docLabel}>Business Permit (PDF or JPEG)</Text>
            <TouchableOpacity
              style={styles.uploadBox}
              onPress={() => handleDocumentPick('permit')}
              activeOpacity={0.7}
            >
              <Ionicons name="shield-checkmark-outline" size={32} color={marketplaceColors.primary} />
              <Text style={styles.uploadText}>
                {documents.permit ? documents.permit.name : 'Click to upload Permit'}
              </Text>
              <Text style={styles.uploadLimit}>MAX 10MB</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.disclaimer}>
            <Ionicons name="information-circle-outline" size={14} color={marketplaceColors.inkMuted} />
            <Text style={styles.disclaimerText}>
              By submitting this form, you agree to our Dealer Terms of Service. Verification typically takes 24-48 business hours.
            </Text>
          </View>

          <MarketplaceButton
            title="Save Draft"
            icon="document-text-outline"
            onPress={handleSaveDraft}
            variant="outlined"
            style={styles.draftButton}
          />
          <MarketplaceButton
            title="Submit for Verification"
            icon="arrow-forward"
            onPress={handleSubmit}
            loading={loading}
            style={styles.submitButton}
          />

          <View style={styles.loginRow}>
            <Text style={styles.loginText}>Already have an account?</Text>
            <TouchableOpacity onPress={() => router.push('/auth/login')}>
              <Text style={styles.loginLink}> Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: marketplaceColors.screen },
  content: { padding: 16, paddingBottom: 40 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 18,
    marginBottom: 20,
    ...marketplaceShadows.card,
  },
  cardTitle: {
    color: marketplaceColors.primaryDark,
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'center',
  },
  cardSubtitle: {
    color: marketplaceColors.inkSoft,
    fontSize: 12,
    lineHeight: 17,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 20,
  },
  stepsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
    marginBottom: 20,
  },
  stepItem: {
    alignItems: 'center',
    flex: 1,
  },
  stepLineWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    justifyContent: 'center',
  },
  stepLine: {
    flex: 1,
    height: 1.5,
    backgroundColor: '#DDE6D6',
  },
  stepLineActive: {
    backgroundColor: marketplaceColors.primary,
  },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#DDE6D6',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCircleActive: {
    backgroundColor: marketplaceColors.primary,
    borderColor: marketplaceColors.primary,
  },
  stepNumber: {
    fontSize: 12,
    fontWeight: '900',
    color: marketplaceColors.inkMuted,
  },
  stepNumberActive: {
    color: '#FFFFFF',
  },
  stepLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: marketplaceColors.inkMuted,
    marginTop: 4,
  },
  stepLabelActive: {
    color: marketplaceColors.primaryDark,
    fontWeight: '900',
  },
  fieldWrap: { marginBottom: 14 },
  fieldLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 5,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#101710',
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
  locationRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  locationInput: {
    flex: 1,
  },
  locationButton: {
    backgroundColor: marketplaceColors.primary,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minWidth: 60,
    justifyContent: 'center',
    height: 44,
  },
  locationButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 12,
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  passwordInput: {
    flex: 1,
  },
  eyeButton: {
    padding: 8,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F7FAF0',
    borderWidth: 1,
    borderColor: '#DDE6D6',
    borderRadius: 8,
    width: 44,
  },
  docTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#101710',
    marginTop: 10,
    marginBottom: 12,
  },
  docWrap: { marginBottom: 14 },
  docLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#101710',
    marginBottom: 6,
  },
  uploadBox: {
    borderWidth: 1.5,
    borderColor: '#DDE6D6',
    borderStyle: 'dashed',
    borderRadius: 10,
    backgroundColor: '#F7FAF0',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 6,
  },
  uploadText: {
    color: marketplaceColors.primary,
    fontSize: 13,
    fontWeight: '800',
  },
  uploadLimit: {
    color: marketplaceColors.inkMuted,
    fontSize: 10,
    fontWeight: '600',
  },
  disclaimer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#F0F4ED',
    borderRadius: 8,
    padding: 12,
    marginTop: 6,
    marginBottom: 18,
  },
  disclaimerText: {
    flex: 1,
    color: marketplaceColors.inkSoft,
    fontSize: 11,
    lineHeight: 16,
  },
  draftButton: {
    minHeight: 46,
    borderRadius: 24,
    borderColor: marketplaceColors.primaryDark,
    borderWidth: 1.5,
    width: '100%',
  },
  submitButton: {
    minHeight: 46,
    borderRadius: 24,
    backgroundColor: '#F57C00',
    width: '100%',
    marginTop: 10,
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  loginText: {
    fontSize: 12,
    color: marketplaceColors.inkSoft,
    fontWeight: '600',
  },
  loginLink: {
    fontSize: 12,
    color: marketplaceColors.primaryDark,
    fontWeight: '900',
  },
});