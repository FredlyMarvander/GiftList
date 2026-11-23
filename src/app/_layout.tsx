import { Inter_400Regular } from '@expo-google-fonts/inter/400Regular';
import { Inter_500Medium } from '@expo-google-fonts/inter/500Medium';
import { Inter_600SemiBold } from '@expo-google-fonts/inter/600SemiBold';
import { Inter_700Bold } from '@expo-google-fonts/inter/700Bold';
import { Inter_800ExtraBold } from '@expo-google-fonts/inter/800ExtraBold';
import { useFonts } from 'expo-font';
import { router, Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useEffectEvent } from 'react';
import { View } from 'react-native';

import { useGiftActions } from '@/hooks/use-gift-actions';
import { listenForNotificationTaps, type NotificationTap } from '@/lib/notifications';
import { needsBuying } from '@/lib/reminders';
import { CelebrationProvider } from '@/providers/celebration-provider';
import { ConfirmProvider } from '@/providers/confirm-provider';
import { GiftsProvider, useGifts } from '@/providers/gifts-provider';
import { NotificationProvider } from '@/providers/notification-provider';
import { AppThemeProvider, useTheme } from '@/providers/theme-provider';
import { ToastProvider } from '@/providers/toast-provider';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
  });

  // If a font fails to load the app still opens with the system font.
  const fontsReady = fontsLoaded || fontError !== null;

  return (
    <GiftsProvider>
      <AppThemeProvider>
        <NotificationProvider>
          <CelebrationProvider>
            <ToastProvider>
              <ConfirmProvider>
                <AppNavigator fontsReady={fontsReady} />
              </ConfirmProvider>
            </ToastProvider>
          </CelebrationProvider>
        </NotificationProvider>
      </AppThemeProvider>
    </GiftsProvider>
  );
}

function AppNavigator({ fontsReady }: { fontsReady: boolean }) {
  const { ready: dataReady } = useGifts();
  const { colors } = useTheme();
  const ready = fontsReady && dataReady;

  useEffect(() => {
    if (ready) SplashScreen.hide();
  }, [ready]);

  useNotificationTaps(ready);

  // The navigator mounts right away so a deep link that launched the app is kept;
  // only the screens wait for fonts and data behind the splash screen.
  return (
    <Stack
      screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}
      screenLayout={({ children }) => (ready ? children : <View />)}>
      <Stack.Screen name="index" options={{ title: 'GiftList' }} />
      <Stack.Screen name="gifts" options={{ title: 'My Gift Ideas' }} />
      <Stack.Screen name="gift/new" options={{ title: 'Add Gift Idea' }} />
      <Stack.Screen name="gift/[id]/index" options={{ title: 'Gift Detail' }} />
      <Stack.Screen name="gift/[id]/edit" options={{ title: 'Edit Gift Idea' }} />
      <Stack.Screen name="gift/[id]/bought" options={{ title: 'Mark as Bought', animation: 'slide_from_bottom' }} />
      <Stack.Screen name="person/[name]" options={{ title: 'Person' }} />
      <Stack.Screen name="reminders" options={{ title: 'Reminders' }} />
      <Stack.Screen name="inspiration" options={{ title: 'Inspiration' }} />
      <Stack.Screen name="budget" options={{ title: 'Budget' }} />
      <Stack.Screen name="settings" options={{ title: 'Settings' }} />
    </Stack>
  );
}

/** Opens the right gift, or runs the chosen action, when a notification is tapped. */
function useNotificationTaps(ready: boolean) {
  const { gifts } = useGifts();
  const { openBoughtForm, markGiven, snoozeUntilTomorrow } = useGiftActions();

  const onTap = useEffectEvent((tap: NotificationTap) => {
    const gift = gifts.find((item) => item.id === tap.giftId);
    if (!gift) return;
    if (tap.action === 'snooze' && needsBuying(gift)) return snoozeUntilTomorrow(gift);

    router.push({ pathname: '/gift/[id]', params: { id: gift.id } });
    if (tap.action === 'bought' && needsBuying(gift)) openBoughtForm(gift);
    if (tap.action === 'given' && gift.status === 'bought') markGiven(gift);
  });

  useEffect(() => {
    if (!ready) return;
    return listenForNotificationTaps((tap) => onTap(tap));
  }, [ready]);
}
