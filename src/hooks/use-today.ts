import { useSyncExternalStore } from 'react';
import { AppState } from 'react-native';

import { toDateKey } from '@/lib/dates';

function subscribe(onChange: () => void): () => void {
  const subscription = AppState.addEventListener('change', onChange);
  const timer = setInterval(onChange, 60_000);
  return () => {
    subscription.remove();
    clearInterval(timer);
  };
}

const getSnapshot = () => toDateKey(new Date());

/** Today's date; updates at midnight and when the app comes back to the foreground. */
export function useToday(): string {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
