import { createContext, use, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { AppState, Linking } from 'react-native';

import { useToday } from '@/hooks/use-today';
import {
  configureNotifications,
  getNotificationPermission,
  requestNotificationPermission,
  syncReminders,
  type NotificationPermission,
} from '@/lib/notifications';
import { planAllReminders } from '@/lib/reminders';
import { useGifts } from '@/providers/gifts-provider';

type NotificationContextValue = {
  permission: NotificationPermission;
  /** Asks for permission, or opens the system settings when it was denied before. */
  enable: () => Promise<boolean>;
  /** Asks only if the user has never been asked; used right after saving a gift. */
  askOnce: () => Promise<void>;
};

const NotificationContext = createContext<NotificationContextValue | null>(null);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { ready, gifts, settings } = useGifts();
  const today = useToday();
  const [permission, setPermission] = useState<NotificationPermission>('unknown');

  useEffect(() => {
    let active = true;
    const refresh = async () => {
      const next = await getNotificationPermission();
      if (active) setPermission(next);
    };
    configureNotifications().then(refresh);
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') refresh();
    });
    return () => {
      active = false;
      subscription.remove();
    };
  }, []);

  // Keep the phone's pending notifications in step with the gift list.
  useEffect(() => {
    if (!ready || permission !== 'granted') return;
    const timer = setTimeout(() => syncReminders(planAllReminders(gifts, settings, new Date())), 300);
    return () => clearTimeout(timer);
  }, [ready, permission, gifts, settings, today]);

  const enable = useCallback(async () => {
    if (permission === 'denied') {
      await Linking.openSettings();
      return false;
    }
    const next = await requestNotificationPermission();
    setPermission(next);
    return next === 'granted';
  }, [permission]);

  const askOnce = useCallback(async () => {
    if (permission !== 'undetermined') return;
    setPermission(await requestNotificationPermission());
  }, [permission]);

  const value = useMemo(() => ({ permission, enable, askOnce }), [permission, enable, askOnce]);

  return <NotificationContext value={value}>{children}</NotificationContext>;
}

export function useNotifications(): NotificationContextValue {
  const value = use(NotificationContext);
  if (!value) throw new Error('useNotifications must be used inside NotificationProvider');
  return value;
}
