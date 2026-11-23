import type { CategoryId, GiftStatus, GiftType, OccasionId, RemindAgainPreset } from '@/constants/options';

/** A local calendar day formatted as `YYYY-MM-DD`. */
export type DateKey = string;

/** Filled in once the gift has been bought. */
export type Purchase = {
  date: DateKey;
  price: number;
  store: string;
};

/** The "Remind me again" field that appears after a gift is bought. */
export type RemindAgain = {
  preset: RemindAgainPreset;
  /** Only used by the `custom` preset; the others follow the event date. */
  customDate: DateKey | null;
  /** `HH:mm` */
  time: string;
  note: string;
};

export type Gift = {
  id: string;
  name: string;
  recipient: string;
  type: GiftType;
  category: CategoryId;
  occasion: OccasionId;
  eventDate: DateKey;
  /** Rupiah. 0 means no budget was set. */
  budget: number;
  status: GiftStatus;
  notes: string;
  /** File name inside the app's photo folder (native only). */
  photo: string | null;
  /** Days before the event to send a "time to buy" notification. */
  buyReminderDays: number[];
  purchase: Purchase | null;
  remindAgain: RemindAgain | null;
  /** Also remind the user to plan a new gift before next year's event. */
  remindNextYear: boolean;
  /** ISO timestamp set by "Remind me tomorrow". */
  snoozedUntil: string | null;
  createdAt: string;
  updatedAt: string;
};

/** Everything the user can edit in the form. */
export type GiftDraft = Omit<Gift, 'id' | 'createdAt' | 'updatedAt' | 'snoozedUntil'>;

export type ThemePreference = 'system' | 'light' | 'dark';

export type Settings = {
  /** `HH:mm`, the time of day buy reminders are sent. */
  reminderTime: string;
  theme: ThemePreference;
};

export type AppData = {
  version: 1;
  gifts: Gift[];
  settings: Settings;
};
