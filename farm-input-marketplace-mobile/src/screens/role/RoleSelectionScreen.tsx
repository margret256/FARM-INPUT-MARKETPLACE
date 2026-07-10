import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppScreen } from '@/components/marketplace/AppScreen';
import { MarketplaceButton } from '@/components/ui/marketplace-button';
import { marketplaceColors, marketplaceShadows } from '@/constants/marketplace';

type Role = 'farmer' | 'dealer' | 'admin';

const roles: {
  key: Role;
  title: string;
  description: string;
  icon: React.ReactNode;
}[] = [
  {
    key: 'farmer',
    title: 'Farmer',
    description: 'I want to buy inputs for my farm',
    icon: <Ionicons name="leaf-outline" size={32} color={marketplaceColors.primary} />,
  },
  {
    key: 'dealer',
    title: 'Dealer',
    description: 'I want to sell agricultural supplies',
    icon: <MaterialCommunityIcons name="storefront-outline" size={32} color={marketplaceColors.primaryDark} />,
  },
  {
    key: 'admin',
    title: 'Admin',
    description: 'I manage the AgroMarket platform',
    icon: <Ionicons name="shield-checkmark-outline" size={32} color="#F57C00" />,
  },
];

export function RoleSelectionScreen() {
  const [selected, setSelected] = useState<Role>('farmer');

  function handleContinue() {
    if (selected === 'dealer') {
      router.push('/dealer/onboarding');
    } else {
      router.replace('/auth/login');
    }
  }

  return (
    <AppScreen title="AgroMarket">
      <View style={styles.container}>
        <Text style={styles.title}>Choose your role</Text>
        <Text style={styles.subtitle}>
          Select your primary role to customize your AgroMarket experience.
        </Text>

        <View style={styles.rolesList}>
          {roles.map((role) => {
            const isSelected = selected === role.key;
            return (
              <Pressable
                key={role.key}
                style={[styles.roleCard, isSelected && styles.selectedCard, marketplaceShadows.card]}
                onPress={() => setSelected(role.key)}>

                {/* Icon area */}
                <View style={[styles.roleIconWrap, isSelected && styles.roleIconWrapSelected]}>
                  {role.icon}
                </View>

                {/* Text */}
                <View style={styles.roleTextWrap}>
                  <Text style={[styles.roleTitle, isSelected && styles.roleTitleSelected]}>
                    {role.title}
                  </Text>
                  <Text style={styles.roleText}>{role.description}</Text>
                </View>

                {/* Radio */}
                <View style={[styles.radio, isSelected && styles.radioSelected]}>
                  {isSelected && <View style={styles.radioDot} />}
                </View>

                {/* Check badge */}
                {isSelected && (
                  <View style={styles.check}>
                    <Ionicons name="checkmark" size={11} color="#FFFFFF" />
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>

        <MarketplaceButton
          title="Continue"
          icon="arrow-forward"
          onPress={handleContinue}
          style={styles.button}
        />

        <View style={styles.brandRow}>
          <MaterialCommunityIcons name="tractor" size={16} color={marketplaceColors.primaryDark} />
          <Text style={styles.brandText}>AgroMarket</Text>
        </View>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    minHeight: 560,
    justifyContent: 'center',
    paddingVertical: 20,
  },
  title: {
    color: '#101710',
    fontSize: 20,
    fontWeight: '900',
    textAlign: 'center',
  },
  subtitle: {
    color: marketplaceColors.inkSoft,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 6,
    marginBottom: 24,
    textAlign: 'center',
  },
  rolesList: {
    gap: 12,
  },
  roleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E0E7DA',
    padding: 14,
    gap: 14,
  },
  selectedCard: {
    borderColor: marketplaceColors.primary,
    borderWidth: 2,
  },
  roleIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: '#EAF4E8',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  roleIconWrapSelected: {
    backgroundColor: '#C8E6C9',
  },
  roleTextWrap: {
    flex: 1,
  },
  roleTitle: {
    color: '#101710',
    fontSize: 15,
    fontWeight: '900',
  },
  roleTitleSelected: {
    color: marketplaceColors.primaryDark,
  },
  roleText: {
    color: marketplaceColors.inkSoft,
    fontSize: 11,
    marginTop: 3,
    fontWeight: '600',
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#9DA994',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  radioSelected: {
    borderColor: marketplaceColors.primary,
    borderWidth: 2,
  },
  radioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: marketplaceColors.primary,
  },
  check: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: marketplaceColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    marginTop: 24,
    minHeight: 52,
    width: '100%',
    backgroundColor: marketplaceColors.primaryDark,
    borderColor: marketplaceColors.primaryDark,
  },
  brandRow: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'center',
  },
  brandText: {
    color: marketplaceColors.primaryDark,
    fontSize: 13,
    fontWeight: '900',
  },
});
