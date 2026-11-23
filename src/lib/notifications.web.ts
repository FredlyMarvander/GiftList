import type { PlannedReminder, ReminderKind } from '@/lib/reminders';

export type NotificationPermission = 'unknown' | 'undetermined' | 'granted' | 'denied' | 'unsupported';

export type NotificationTap = {
  giftId: string;
  kind: ReminderKind;
  action: 'open' | 'bought' | 'given' | 'snooze';
};

/** Scheduled notifications need a phone; on web the in-app reminder list takes over. */
export const notificationsSupported = false;

export async function configureNotifications(): Promise<void> {}

export async function getNotificationPermission(): Promise<NotificationPermission> {
  return 'unsupported';
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  return 'unsupported';
}

export async function syncReminders(_reminders: PlannedReminder[]): Promise<void> {}

export async function sendPreview(_reminder: PlannedReminder, _seconds: number): Promise<void> {}

export function listenForNotificationTaps(_onTap: (tap: NotificationTap) => void): () => void {
  return () => {};
}
