import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Image, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { getProfile, updateProfile, uploadProfileAvatar } from '@/api/users';
import { AppScreen, StaticScreen } from '@/components/marketplace/AppScreen';
import { FloatingTabBar } from '@/components/marketplace/FloatingTabBar';
import { DealerFloatingTabBar } from '@/components/marketplace/DealerFloatingTabBar';
import { appImages } from '@/constants/mock-marketplace';
import { marketplaceColors, marketplaceShadows } from '@/constants/marketplace';
import { useAuthStore } from '@/store/auth.store';

type ProfileScreenProps = {
  role?: 'dealer' | 'farmer';
};

export function ProfileScreen({ role = 'farmer' }: ProfileScreenProps) {
  const user = useAuthStore((state) => state.user);
  const profileImage = useAuthStore((state) => state.profileImage);
  const setProfileImage = useAuthStore((state) => state.setProfileImage);
  const clearSession = useAuthStore((state) => state.clearSession);
  const [editVisible, setEditVisible] = useState(false);
  const [fullName, setFullName] = useState(`${user?.firstName ?? 'Farmer'} ${user?.lastName && user.lastName !== '-' ? user.lastName : ''}`.trim());
  const [phone, setPhone] = useState(user?.phone ?? '+256 773 815 442');
  const [email, setEmail] = useState(user?.email || 'email@example.com');
  const [location, setLocation] = useState(user?.dealer?.address ?? 'Wakiso District, Uganda');
  const [farmType, setFarmType] = useState('Mixed Crop Farm');
  const [farmSize, setFarmSize] = useState('12 Hectares');

  useEffect(() => {
    let mounted = true;

    async function loadProfile() {
      try {
        const profile = await getProfile();
        if (!mounted) return;
        setFullName(`${profile.firstName} ${profile.lastName && profile.lastName !== '-' ? profile.lastName : ''}`.trim());
        setPhone(profile.phone);
        setEmail(profile.email);
        setLocation(profile.dealer?.address ?? location);
        if (profile.avatarUrl) {
          setProfileImage(profile.avatarUrl);
        }
      } catch {
        // Keep session/local profile fallback.
      }
    }

    if (user) loadProfile();
    return () => {
      mounted = false;
    };
  }, [user?.id]);

  const handleImageUpload = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setProfileImage(asset.uri);
      try {
        await uploadProfileAvatar({
          uri: asset.uri,
          name: asset.fileName ?? 'avatar.jpg',
          mimeType: asset.mimeType ?? 'image/jpeg',
        });
      } catch {
        Alert.alert('Upload failed', 'The image was selected locally but could not be uploaded.');
      }
    }
  };

  const handleLogout = async () => {
    await clearSession();
    router.dismissAll();
    router.replace('/role-selection');
  };

  async function handleSave() {
    const [firstName, ...rest] = fullName.trim().split(/\s+/);
    try {
      await updateProfile({
        firstName: firstName || fullName,
        lastName: rest.join(' ') || '-',
        phone,
        email,
        businessName: isDealer ? fullName : undefined,
        address: location,
      });
      setEditVisible(false);
      Alert.alert('Profile Updated', 'Your profile has been updated successfully.');
    } catch {
      Alert.alert('Update failed', 'Could not save your profile changes.');
    }
  }

  const isDealer = role === 'dealer';
  const profileTitle = isDealer ? 'AgroConnect' : 'AgroMarket';
  const userRole = isDealer ? 'Verified Dealer' : 'Verified Farmer';
  const editFields = isDealer
    ? [
        { label: 'Business Name', value: fullName, onChange: setFullName },
        { label: 'Phone Number', value: phone, onChange: setPhone },
        { label: 'Email Address', value: email, onChange: setEmail },
        { label: 'Business Location', value: location, onChange: setLocation },
      ]
    : [
        { label: 'Full Name', value: fullName, onChange: setFullName },
        { label: 'Phone Number', value: phone, onChange: setPhone },
        { label: 'Email Address', value: email, onChange: setEmail },
        { label: 'Location', value: location, onChange: setLocation },
        { label: 'Farm Type', value: farmType, onChange: setFarmType },
        { label: 'Farm Size', value: farmSize, onChange: setFarmSize },
      ];

  return (
    <StaticScreen>
      <AppScreen title={profileTitle}>
        {/* Hero banner */}
        <View style={styles.heroBanner}>
          <View style={styles.avatarWrap}>
            <Image source={profileImage ? { uri: profileImage } : appImages.smartFarming} style={styles.avatar} />
            <Pressable style={styles.editBadge} onPress={handleImageUpload}>
              <Ionicons name="pencil" size={12} color="#FFFFFF" />
            </Pressable>
          </View>
        </View>

        <Text style={styles.name}>{fullName}</Text>
        <Text style={styles.meta}>{userRole} • {location}</Text>

        {/* Personal Information */}
        <View style={[styles.section, marketplaceShadows.card]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="person-outline" size={16} color={marketplaceColors.primaryDark} />
            <Text style={styles.sectionTitle}>Personal Information</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Phone Number</Text>
            <Text style={styles.infoValue}>{phone}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email Address</Text>
            <Text style={styles.infoValue}>{email}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Location</Text>
            <Text style={styles.infoValue}>{location}</Text>
          </View>
        </View>

        {/* Farm/Business Information */}
        {!isDealer && (
          <View style={[styles.section, marketplaceShadows.card]}>
            <View style={styles.sectionHeader}>
              <Ionicons name="leaf-outline" size={16} color={marketplaceColors.primaryDark} />
              <Text style={styles.sectionTitle}>Farm Information</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Farm type</Text>
              <Text style={styles.infoValue}>{farmType}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Farm size</Text>
              <Text style={styles.infoValue}>{farmSize}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Crops grown</Text>
              <View style={styles.tagRow}>
                {['Maize', 'Beans', 'Cassava'].map((crop) => (
                  <View key={crop} style={styles.tag}>
                    <Text style={styles.tagText}>{crop}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* Account Settings */}
        <View style={[styles.section, marketplaceShadows.card]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="settings-outline" size={16} color={marketplaceColors.primaryDark} />
            <Text style={styles.sectionTitle}>Account Settings</Text>
          </View>
          {[
            { label: 'Change password', icon: 'lock-closed-outline', route: '/change-password' },
            { label: 'Payment methods', icon: 'wallet-outline', route: '/payment-methods' },
            { label: 'Delivery addresses', icon: 'location-outline', route: '/delivery-addresses' },
          ].map((item, i, arr) => (
            <Pressable
              key={item.label}
              style={[styles.settingRow, i < arr.length - 1 && styles.settingBorder]}
              onPress={() => router.push(item.route as any)}>
              <Ionicons name={item.icon as any} size={16} color="#555" />
              <Text style={styles.settingText}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={16} color={marketplaceColors.inkMuted} />
            </Pressable>
          ))}
        </View>

        {/* Edit Profile button */}
        <Pressable style={styles.editButton} onPress={() => setEditVisible(true)}>
          <Ionicons name="create-outline" size={16} color="#FFFFFF" />
          <Text style={styles.editButtonText}>Edit Profile</Text>
        </Pressable>

        {/* Logout button */}
        <Pressable
          style={styles.logoutButton}
          onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={16} color="#D32F2F" />
          <Text style={styles.logoutText}>Logout</Text>
        </Pressable>
      </AppScreen>

      {/* Edit Profile Modal */}
      <Modal
        visible={editVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setEditVisible(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setEditVisible(false)} />
        <View style={styles.modalSheet}>
          <View style={styles.modalHandle} />
          <Text style={styles.modalTitle}>Edit Profile</Text>

          <ScrollView showsVerticalScrollIndicator={false}>
            {editFields.map((field) => (
              <View key={field.label} style={styles.fieldWrap}>
                <Text style={styles.fieldLabel}>{field.label}</Text>
                <TextInput
                  style={styles.fieldInput}
                  value={field.value}
                  onChangeText={field.onChange}
                  placeholderTextColor="#9E9E9E"
                />
              </View>
            ))}

            <Pressable style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </Pressable>
            <Pressable style={styles.cancelButton} onPress={() => setEditVisible(false)}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </Pressable>
          </ScrollView>
        </View>
      </Modal>

      {isDealer ? (
        <DealerFloatingTabBar active="profile" />
      ) : (
        <FloatingTabBar active="profile" />
      )}
    </StaticScreen>
  );
}

const styles = StyleSheet.create({
  heroBanner: {
    height: 90,
    backgroundColor: marketplaceColors.primaryDark,
    borderRadius: 14,
    marginBottom: 44,
    alignItems: 'center',
  },
  avatarWrap: {
    position: 'absolute',
    bottom: -36,
    alignSelf: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    resizeMode: 'cover',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  editBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F57C00',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  name: {
    color: '#101710',
    fontSize: 18,
    fontWeight: '900',
    textAlign: 'center',
  },
  meta: {
    color: marketplaceColors.inkSoft,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 3,
    marginBottom: 16,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E1E8DA',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#101710',
  },
  infoRow: {
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 10,
    color: marketplaceColors.inkMuted,
    fontWeight: '600',
    marginBottom: 1,
  },
  infoValue: {
    fontSize: 13,
    color: '#101710',
    fontWeight: '700',
  },
  tagRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 3,
  },
  tag: {
    backgroundColor: '#E8F5E9',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  tagText: {
    color: marketplaceColors.primaryDark,
    fontSize: 11,
    fontWeight: '700',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 11,
  },
  settingBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F0F4ED',
  },
  settingText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: '#101710',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    minHeight: 46,
    borderRadius: 10,
    backgroundColor: marketplaceColors.primaryDark,
    marginBottom: 10,
  },
  editButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    minHeight: 46,
    borderRadius: 10,
    backgroundColor: '#FDE8E8',
    marginBottom: 24,
  },
  logoutText: {
    color: '#D32F2F',
    fontSize: 14,
    fontWeight: '800',
  },
  /* Modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '75%',
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E0E7DA',
    alignSelf: 'center',
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#101710',
    marginBottom: 16,
  },
  fieldWrap: {
    marginBottom: 12,
  },
  fieldLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: marketplaceColors.inkMuted,
    marginBottom: 4,
  },
  fieldInput: {
    height: 42,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DDE6D6',
    backgroundColor: '#F7FAF0',
    paddingHorizontal: 12,
    fontSize: 13,
    color: '#101710',
  },
  saveButton: {
    height: 46,
    borderRadius: 10,
    backgroundColor: marketplaceColors.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 10,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  cancelButton: {
    height: 42,
    borderRadius: 10,
    backgroundColor: '#F0F4ED',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  cancelButtonText: {
    color: marketplaceColors.inkSoft,
    fontSize: 13,
    fontWeight: '700',
  },
});
