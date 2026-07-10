import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ImageBackground, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LogoMark } from '@/components/ui/logo-mark';
import { marketplaceColors, marketplaceImages } from '@/constants/marketplace';

function SplashContent() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.centerContent}>
        <LogoMark size={96} />
        <Text style={styles.title}>Farm Input{'\n'}Marketplace</Text>
        <Text style={styles.subtitle}>Quality Farm Inputs Delivered to Your{'\n'}Doorstep</Text>
        <View style={styles.loadingTrack}>
          <View style={styles.loadingFill} />
        </View>
         <Pressable style={styles.getStartedButton} onPress={() => router.replace('/onboarding')}>
           <Text style={styles.getStartedButtonText}>Get Started</Text>
         </Pressable>
      </View>
      <View style={styles.footer}>
        <View style={styles.footerItem}>
          <Ionicons name="shield-checkmark-outline" size={15} color="#FFFFFF" />
          <Text style={styles.footerText}>Verified Dealers</Text>
        </View>
        <View style={styles.footerItem}>
          <Ionicons name="leaf-outline" size={15} color="#FFFFFF" />
          <Text style={styles.footerText}>Eco Friendly</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

export function SplashScreen() {
   if (marketplaceImages.splashBackground) {
     return (
       <ImageBackground source={marketplaceImages.splashBackground} resizeMode="cover" style={styles.screen}>
         <View style={styles.greenOverlay} />
         <SplashContent />
       </ImageBackground>
     );
   }

   return (
     <View style={[styles.screen, styles.placeholderBackdrop]}>
       <View style={styles.fieldHorizon} />
       <View style={styles.fieldRows}>
         {Array.from({ length: 12 }).map((_, index) => (
           <View key={index} style={[styles.fieldRow, { left: `${index * 8 - 20}%` }]} />
         ))}
       </View>
       <SplashContent />
     </View>
   );
 }

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: marketplaceColors.primaryDark,
  },
  placeholderBackdrop: {
    overflow: 'hidden',
  },
  greenOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 92, 29, 0.62)',
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: 28,
    justifyContent: 'space-between',
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 44,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 29,
    lineHeight: 35,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 0,
    marginTop: 26,
  },
  subtitle: {
    color: '#FFFFFF',
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 0,
    marginTop: 12,
  },
  loadingTrack: {
    width: 74,
    height: 4,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
    marginTop: 45,
    overflow: 'hidden',
  },
  loadingFill: {
    width: 30,
    height: 4,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0,
    marginTop: 15,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 28,
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  footerText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0,
  },
  fieldHorizon: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '48%',
    backgroundColor: '#BBD8A8',
    opacity: 0.9,
  },
  fieldRows: {
    ...StyleSheet.absoluteFillObject,
    top: '35%',
    backgroundColor: 'rgba(27, 94, 32, 0.78)',
    transform: [{ skewY: '-8deg' }],
  },
   fieldRow: {
     position: 'absolute',
     top: -50,
     width: 22,
     height: '140%',
     backgroundColor: 'rgba(255, 255, 255, 0.08)',
     transform: [{ rotate: '12deg' }],
   },
   getStartedButton: {
     backgroundColor: marketplaceColors.primary,
     borderRadius: 12,
     paddingVertical: 16,
     paddingHorizontal: 24,
     marginTop: 24,
   },
   getStartedButtonText: {
     color: '#FFFFFF',
     fontSize: 16,
     fontWeight: '700',
     textAlign: 'center',
   },
 });
