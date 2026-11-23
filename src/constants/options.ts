import type { IconName } from '@/components/ui/icon-data';
import type { ColorToken } from '@/constants/theme';

/* ------------------------------------------------------------------ Type */

export const GIFT_TYPES = {
  gift: { label: 'Gift', icon: 'gift', description: 'Something to unwrap' },
  surprise: { label: 'Surprise', icon: 'party-popper', description: 'An event, dinner or experience' },
} as const satisfies Record<string, { label: string; icon: IconName; description: string }>;

export type GiftType = keyof typeof GIFT_TYPES;
export const GIFT_TYPE_IDS = Object.keys(GIFT_TYPES) as GiftType[];

/* -------------------------------------------------------------- Category */

export const CATEGORIES = {
  other: { label: 'General', icon: 'gift' },
  beauty: { label: 'Beauty', icon: 'spray-can' },
  dining: { label: 'Dining', icon: 'utensils' },
  fashion: { label: 'Fashion', icon: 'shirt' },
  tech: { label: 'Tech', icon: 'headphones' },
  experience: { label: 'Experience', icon: 'ticket' },
  flowers: { label: 'Flowers', icon: 'flower-2' },
  jewelry: { label: 'Jewelry', icon: 'gem' },
  books: { label: 'Books', icon: 'book-open' },
  home: { label: 'Home', icon: 'house' },
  hobby: { label: 'Hobby', icon: 'gamepad-2' },
  sweets: { label: 'Sweets', icon: 'cake-slice' },
} as const satisfies Record<string, { label: string; icon: IconName }>;

export type CategoryId = keyof typeof CATEGORIES;
export const CATEGORY_IDS = Object.keys(CATEGORIES) as CategoryId[];

/* -------------------------------------------------------------- Occasion */

/** `yearly` occasions fall on the same date every year, so they can offer a reminder for next year. */
export const OCCASIONS = {
  birthday: { label: 'Birthday', icon: 'cake', yearly: true },
  anniversary: { label: 'Anniversary', icon: 'heart', yearly: true },
  graduation: { label: 'Graduation', icon: 'graduation-cap', yearly: false },
  wedding: { label: 'Wedding', icon: 'gem', yearly: false },
  valentine: { label: "Valentine's Day", icon: 'heart', yearly: true },
  eid: { label: 'Eid', icon: 'moon-star', yearly: false },
  christmas: { label: 'Christmas', icon: 'tree-pine', yearly: true },
  thanks: { label: 'Thank You', icon: 'hand-heart', yearly: false },
  other: { label: 'Special Day', icon: 'sparkles', yearly: false },
} as const satisfies Record<string, { label: string; icon: IconName; yearly: boolean }>;

export type OccasionId = keyof typeof OCCASIONS;
export const OCCASION_IDS = Object.keys(OCCASIONS) as OccasionId[];

/* ---------------------------------------------------------------- Status */

export const STATUSES = {
  idea: {
    label: 'Idea',
    icon: 'lightbulb',
    description: 'Just a thought for now',
    bg: 'ideaBg',
    fg: 'ideaText',
  },
  planned: {
    label: 'Planned',
    icon: 'target',
    description: 'Decided, still need to buy it',
    bg: 'plannedBg',
    fg: 'plannedText',
  },
  bought: {
    label: 'Bought',
    icon: 'shopping-bag',
    description: 'Purchased, waiting to be given',
    bg: 'boughtBg',
    fg: 'boughtText',
  },
  given: {
    label: 'Given',
    icon: 'hand-heart',
    description: 'Handed over. Well done!',
    bg: 'givenBg',
    fg: 'givenText',
  },
} as const satisfies Record<
  string,
  { label: string; icon: IconName; description: string; bg: ColorToken; fg: ColorToken }
>;

export type GiftStatus = keyof typeof STATUSES;
export const STATUS_IDS = Object.keys(STATUSES) as GiftStatus[];

/* ------------------------------------------------------------- Reminders */

/** How many days before the event the "time to buy" notification can fire. */
export const BUY_REMINDER_DAYS = [14, 7, 3, 1] as const;
/** One week before, as suggested in the project review. */
export const DEFAULT_BUY_REMINDER_DAYS = [7];
/** Gifts that still need buying are flagged in the app from this many days before the event. */
export const BUY_SOON_WINDOW_DAYS = 7;
/** "Next year" reminders come earlier because the gift still has to be chosen. */
export const NEXT_YEAR_LEAD_DAYS = 14;

export const REMIND_AGAIN_PRESETS = {
  on_day: { label: 'On the day', daysBefore: 0 },
  day_before: { label: '1 day before', daysBefore: 1 },
  three_days_before: { label: '3 days before', daysBefore: 3 },
  custom: { label: 'Pick a date', daysBefore: null },
} as const satisfies Record<string, { label: string; daysBefore: number | null }>;

export type RemindAgainPreset = keyof typeof REMIND_AGAIN_PRESETS;
export const REMIND_AGAIN_PRESET_IDS = Object.keys(REMIND_AGAIN_PRESETS) as RemindAgainPreset[];

export const REMINDER_TIMES = Array.from({ length: 17 }, (_, index) => `${String(index + 6).padStart(2, '0')}:00`);
