import * as Notifications from 'expo-notifications';
import { AndroidImportance, IosAuthorizationStatus } from 'expo-notifications';
import { Platform } from 'react-native';

import type { PlannedReminder, ReminderKind } from '@/lib/reminders';

export type NotificationPermission = 'unknown' | 'undetermined' | 'granted' | 'denied' | 'unsupported';

export type NotificationTap = {
  giftId: string;
  kind: ReminderKind;
  action: 'open' | 'bought' | 'given' | 'snooze';
};

export const notificationsSupported = true;

const CHANNEL_ID = 'gift-reminders';
const ID_PREFIX = 'giftlist.';
/** iOS silently drops anything past 64 pending notifications. */
const MAX_SCHEDULED = 60;

/** Category ids may not contain ":" or "-". */
const BUY_CATEGORY = 'giftBuy';
const GIVE_CATEGORY = 'giftGive';
const CATEGORY_BY_KIND: Record<ReminderKind, string | undefined> = {
  buy: BUY_CATEGORY,
  snooze: BUY_CATEGORY,
  again: GIVE_CATEGORY,
  'next-year': undefined,
};

export async function configureNotifications(): Promise<void> {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      // On Android a silent notification is never shown as a drop-down banner.
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });

  // Each step stands alone. Expo Go for Android rejects custom channels, and Android
  // then delivers reminders through its fallback channel, so that must not stop the rest.
  await Promise.allSettled([createChannel(), createCategories()]);
}

async function createChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
    name: 'Gift reminders',
    description: 'Reminders to buy and give your gifts on time',
    importance: AndroidImportance.HIGH,
    vibrationPattern: [0, 200, 120, 200],
    lightColor: '#695DDF',
  });
}

async function createCategories(): Promise<void> {
  const options = { opensAppToForeground: true };
  await Notifications.setNotificationCategoryAsync(BUY_CATEGORY, [
    { identifier: 'bought', buttonTitle: 'I bought it', options },
    { identifier: 'snooze', buttonTitle: 'Remind me tomorrow', options },
  ]);
  await Notifications.setNotificationCategoryAsync(GIVE_CATEGORY, [
    { identifier: 'given', buttonTitle: 'Mark as given', options },
  ]);
}

function toPermission(status: Notifications.NotificationPermissionsStatus): NotificationPermission {
  const ios = status.ios?.status;
  if (status.granted || ios === IosAuthorizationStatus.PROVISIONAL) return 'granted';
  return status.canAskAgain ? 'undetermined' : 'denied';
}

export async function getNotificationPermission(): Promise<NotificationPermission> {
  return toPermission(await Notifications.getPermissionsAsync());
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  return toPermission(
    await Notifications.requestPermissionsAsync({ ios: { allowAlert: true, allowBadge: true, allowSound: true } }),
  );
}

/* ------------------------------------------------------------- Scheduling */

/** Changes whenever the text changes, so edited gifts are rescheduled. */
function textHash(value: string): string {
  let hash = 5381;
  for (let index = 0; index < value.length; index += 1) hash = ((hash << 5) + hash + value.charCodeAt(index)) | 0;
  return (hash >>> 0).toString(36);
}

function identifierFor(reminder: PlannedReminder): string {
  return `${ID_PREFIX}${reminder.id}.${reminder.at.getTime()}.${textHash(reminder.title + reminder.body)}`;
}

function contentFor(reminder: PlannedReminder): Notifications.NotificationContentInput {
  return {
    title: reminder.title,
    body: reminder.body,
    sound: 'default',
    color: '#695DDF',
    categoryIdentifier: CATEGORY_BY_KIND[reminder.kind],
    data: { giftId: reminder.giftId, kind: reminder.kind },
  };
}

async function runSync(reminders: PlannedReminder[]): Promise<void> {
  const wanted = new Map(reminders.slice(0, MAX_SCHEDULED).map((reminder) => [identifierFor(reminder), reminder]));

  for (const request of await Notifications.getAllScheduledNotificationsAsync()) {
    if (!request.identifier.startsWith(ID_PREFIX)) continue;
    if (wanted.has(request.identifier)) wanted.delete(request.identifier);
    else await Notifications.cancelScheduledNotificationAsync(request.identifier);
  }

  for (const [identifier, reminder] of wanted) {
    await Notifications.scheduleNotificationAsync({
      identifier,
      content: contentFor(reminder),
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: reminder.at, channelId: CHANNEL_ID },
    });
  }
}

let syncQueue: Promise<void> = Promise.resolve();

/** Makes the phone's pending notifications match the plan. Runs one at a time. */
export function syncReminders(reminders: PlannedReminder[]): Promise<void> {
  syncQueue = syncQueue
    .then(() => runSync(reminders))
    .catch((error) => console.warn('[giftlist] Could not schedule reminders.', error));
  return syncQueue;
}

/** Sends a real reminder within seconds, for demos and for checking the permission. */
export async function sendPreview(reminder: PlannedReminder, seconds: number): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    identifier: `preview.${reminder.id}`,
    content: contentFor(reminder),
    trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds, channelId: CHANNEL_ID },
  });
}

/* ------------------------------------------------------------------- Taps */

function toTap(response: Notifications.NotificationResponse): NotificationTap | null {
  const { giftId, kind } = response.notification.request.content.data ?? {};
  if (typeof giftId !== 'string' || typeof kind !== 'string' || !Object.hasOwn(CATEGORY_BY_KIND, kind)) return null;
  const action = response.actionIdentifier;
  return {
    giftId,
    kind: kind as ReminderKind,
    action: action === 'bought' || action === 'given' || action === 'snooze' ? action : 'open',
  };
}

/** Calls back for taps while the app runs and for the tap that launched it. */
export function listenForNotificationTaps(onTap: (tap: NotificationTap) => void): () => void {
  const handled = new Set<string>();
  const handle = (response: Notifications.NotificationResponse) => {
    const key = `${response.notification.request.identifier}|${response.notification.date}|${response.actionIdentifier}`;
    if (handled.has(key)) return;
    handled.add(key);
    Notifications.clearLastNotificationResponse();
    const tap = toTap(response);
    if (tap) onTap(tap);
  };

  const launchResponse = Notifications.getLastNotificationResponse();
  if (launchResponse) handle(launchResponse);
  const subscription = Notifications.addNotificationResponseReceivedListener(handle);
  return () => subscription.remove();
}
