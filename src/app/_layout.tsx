import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { initAnalytics, track } from '@/lib/analytics';
import { useReminders } from '@/lib/notifications';
import { useProfileSync } from '@/lib/sync';
import { initTelemetry, wrapWithTelemetry } from '@/lib/telemetry';

initTelemetry();
SplashScreen.preventAutoHideAsync();

function RootLayout() {
  const colorScheme = useColorScheme();
  useProfileSync();
  useReminders();
  useEffect(() => {
    initAnalytics();
    track('session_started', {});
  }, []);
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="lesson/[id]" options={{ presentation: 'modal', gestureEnabled: false }} />
      </Stack>
    </ThemeProvider>
  );
}

export default wrapWithTelemetry(RootLayout);
