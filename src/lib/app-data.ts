import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  CATEGORIES,
  DEFAULT_BUY_REMINDER_DAYS,
  GIFT_TYPES,
  OCCASIONS,
  REMIND_AGAIN_PRESETS,
  STATUSES,
  type CategoryId,
  type GiftStatus,
  type GiftType,
  type OccasionId,
  type RemindAgainPreset,
} from '@/constants/options';
import seedGifts from '@/data/gifts.json';
import { addDays, isDateKey, toDateKey } from '@/lib/dates';
import type { AppData, Gift, Purchase, RemindAgain, Settings, ThemePreference } from '@/types/gift';

const STORAGE_KEY = 'giftlist/data/v1';

export const DEFAULT_SETTINGS: Settings = { reminderTime: '09:00', theme: 'system' };
export const DEFAULT_REMIND_AGAIN_TIME = '08:00';

/* ------------------------------------------------------------- Dummy data */

/** Shape of `src/data/gifts.json`. Dates are relative so the demo always looks current. */
type SeedGift = {
  id: string;
  name: string;
  recipient: string;
  type: string;
  category: string;
  occasion: string;
  eventInDays: number;
  budget: number;
  status: string;
  notes: string;
  buyReminderDays: number[];
  purchase?: { daysAgo: number; price: number; store: string };
  remindAgain?: { preset: string; time: string; note: string };
  remindNextYear?: boolean;
};

export function createDemoData(now: Date): AppData {
  const today = toDateKey(now);
  const gifts = (seedGifts as SeedGift[]).map((seed) =>
    normalizeGift(
      {
        ...seed,
        eventDate: addDays(today, seed.eventInDays),
        purchase: seed.purchase ? { ...seed.purchase, date: addDays(today, -seed.purchase.daysAgo) } : null,
      },
      now,
    ),
  );
  return { version: 1, gifts: gifts.filter((gift) => gift !== null), settings: DEFAULT_SETTINGS };
}

/* ------------------------------------------------------------ Persistence */

export async function loadAppData(now: Date): Promise<AppData> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<AppData>;
      if (Array.isArray(parsed.gifts)) {
        return {
          version: 1,
          gifts: parsed.gifts.map((gift) => normalizeGift(gift, now)).filter((gift) => gift !== null),
          settings: normalizeSettings(parsed.settings),
        };
      }
    }
  } catch (error) {
    console.warn('[giftlist] Could not read saved data, starting from the demo data.', error);
  }
  return createDemoData(now);
}

export async function saveAppData(data: AppData): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.warn('[giftlist] Could not save data.', error);
  }
}

/* ------------------------------------------------------------- Validation */

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null;
const text = (value: unknown, fallback = '') => (typeof value === 'string' ? value : fallback);
const amount = (value: unknown) => (typeof value === 'number' && Number.isFinite(value) && value > 0 ? Math.round(value) : 0);
const isTime = (value: unknown): value is string => typeof value === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(value);

function oneOf<T extends string>(options: Record<T, unknown>, value: unknown, fallback: T): T {
  return typeof value === 'string' && Object.hasOwn(options, value) ? (value as T) : fallback;
}

function normalizePurchase(value: unknown, now: Date): Purchase | null {
  if (!isRecord(value)) return null;
  return {
    date: isDateKey(value.date) ? value.date : toDateKey(now),
    price: amount(value.price),
    store: text(value.store),
  };
}

function normalizeRemindAgain(value: unknown): RemindAgain | null {
  if (!isRecord(value)) return null;
  return {
    preset: oneOf<RemindAgainPreset>(REMIND_AGAIN_PRESETS, value.preset, 'day_before'),
    customDate: isDateKey(value.customDate) ? value.customDate : null,
    time: isTime(value.time) ? value.time : DEFAULT_REMIND_AGAIN_TIME,
    note: text(value.note),
  };
}

/** Accepts anything that was stored before and returns a complete gift, or null when it is unusable. */
export function normalizeGift(value: unknown, now: Date): Gift | null {
  if (!isRecord(value)) return null;
  const id = text(value.id);
  const name = text(value.name).trim();
  if (!id || !name || !isDateKey(value.eventDate)) return null;

  const timestamp = now.toISOString();
  const status = oneOf<GiftStatus>(STATUSES, value.status, 'idea');
  const owned = status === 'bought' || status === 'given';
  return {
    id,
    name,
    recipient: text(value.recipient).trim() || 'Someone',
    type: oneOf<GiftType>(GIFT_TYPES, value.type, 'gift'),
    category: oneOf<CategoryId>(CATEGORIES, value.category, 'other'),
    occasion: oneOf<OccasionId>(OCCASIONS, value.occasion, 'other'),
    eventDate: value.eventDate,
    budget: amount(value.budget),
    status,
    notes: text(value.notes),
    photo: text(value.photo) || null,
    buyReminderDays: Array.isArray(value.buyReminderDays)
      ? value.buyReminderDays.filter((day): day is number => Number.isInteger(day) && day >= 0)
      : DEFAULT_BUY_REMINDER_DAYS,
    purchase: owned ? normalizePurchase(value.purchase, now) : null,
    remindAgain: owned ? normalizeRemindAgain(value.remindAgain) : null,
    remindNextYear: value.remindNextYear === true,
    snoozedUntil: text(value.snoozedUntil) || null,
    createdAt: text(value.createdAt, timestamp),
    updatedAt: text(value.updatedAt, timestamp),
  };
}

function normalizeSettings(value: unknown): Settings {
  if (!isRecord(value)) return DEFAULT_SETTINGS;
  return {
    reminderTime: isTime(value.reminderTime) ? value.reminderTime : DEFAULT_SETTINGS.reminderTime,
    theme: oneOf<ThemePreference>({ system: 1, light: 1, dark: 1 }, value.theme, 'system'),
  };
}
