import '../global.css';

import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { router, Stack, usePathname, useRootNavigationState } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuthStore } from '@/store/auth.store';

export const unstable_settings = {
  initialRouteName: 'splash',
};

const PUBLIC_ROUTES = new Set([
  '/',
  '/index',
  '/splash',
  '/onboarding',
  '/role-selection',
  '/dealer/onboarding',
]);

function isPublicRoute(pathname: string) {
  return PUBLIC_ROUTES.has(pathname) || pathname.startsWith('/auth/');
}

function SessionGuard() {
  const pathname = usePathname();
  const rootNavigationState = useRootNavigationState();
  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    if (!rootNavigationState?.key || token || isPublicRoute(pathname)) {
      return;
    }

    router.dismissAll();
    router.replace('/role-selection');
  }, [pathname, rootNavigationState?.key, token]);

  return null;
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <SessionGuard />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="splash" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="auth/login" />
        <Stack.Screen name="auth/register" />
        <Stack.Screen name="auth/forgot-password" />
        <Stack.Screen name="auth/otp-verification" />
        <Stack.Screen name="auth/reset-password" />
        <Stack.Screen name="role-selection" />
        <Stack.Screen name="dealer/onboarding" />
        <Stack.Screen name="dealer/dashboard" />
        <Stack.Screen name="dealer/inventory" />
        <Stack.Screen name="dealer/orders" />
        <Stack.Screen name="dealer/add-product" />
        <Stack.Screen name="dealer/analytics" />
        <Stack.Screen name="dealer/notifications" />
        <Stack.Screen name="dealer/profile" />
        <Stack.Screen name="product-details" />
        <Stack.Screen name="compare-prices" />
        <Stack.Screen name="wishlist" />
        <Stack.Screen name="cart" />
        <Stack.Screen name="checkout" />
        <Stack.Screen name="mobile-money-payment" />
        <Stack.Screen name="payment-success" />
        <Stack.Screen name="track-order" />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
