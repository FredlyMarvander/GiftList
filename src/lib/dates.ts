import type { DateKey } from '@/types/gift';

/**
 * Event dates are stored as local calendar days (`YYYY-MM-DD`) instead of
 * timestamps, so an event never shifts by a day when the timezone changes.
 */

export const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const;

/** Monday-first, matching the calendar most people use in Indonesia. */
export const WEEKDAYS_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;

const DAY_MS = 24 * 60 * 60 * 1000;
const pad = (value: number) => String(value).padStart(2, '0');

export function makeDateKey(year: number, monthIndex: number, day: number): DateKey {
  return `${year}-${pad(monthIndex + 1)}-${pad(day)}`;
}

export function toDateKey(date: Date): DateKey {
  return makeDateKey(date.getFullYear(), date.getMonth(), date.getDate());
}

export function splitDateKey(key: DateKey): { year: number; monthIndex: number; day: number } {
  const [year, month, day] = key.split('-').map(Number);
  return { year, monthIndex: month - 1, day };
}

export function isDateKey(value: unknown): value is DateKey {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const { year, monthIndex, day } = splitDateKey(value);
  return monthIndex >= 0 && monthIndex < 12 && day >= 1 && day <= daysInMonth(year, monthIndex);
}

/** Local midnight at the start of the given day. */
export function fromDateKey(key: DateKey): Date {
  const { year, monthIndex, day } = splitDateKey(key);
  return new Date(year, monthIndex, day);
}

/** Local date and time, e.g. `atTime('2026-10-18', '09:00')`. */
export function atTime(key: DateKey, time: string): Date {
  const { year, monthIndex, day } = splitDateKey(key);
  const [hours, minutes] = time.split(':').map(Number);
  return new Date(year, monthIndex, day, hours, minutes, 0, 0);
}

export function addDays(key: DateKey, amount: number): DateKey {
  const { year, monthIndex, day } = splitDateKey(key);
  return toDateKey(new Date(year, monthIndex, day + amount));
}

/** Keeps the same day next year; 29 February falls back to 28 February. */
export function addYears(key: DateKey, amount: number): DateKey {
  const { year, monthIndex, day } = splitDateKey(key);
  const targetYear = year + amount;
  return makeDateKey(targetYear, monthIndex, Math.min(day, daysInMonth(targetYear, monthIndex)));
}

export function daysInMonth(year: number, monthIndex: number): number {
  return new Date(year, monthIndex + 1, 0).getDate();
}

/** Whole calendar days from one day to another; negative when `to` is in the past. */
export function daysBetween(from: DateKey, to: DateKey): number {
  const a = splitDateKey(from);
  const b = splitDateKey(to);
  return Math.round((Date.UTC(b.year, b.monthIndex, b.day) - Date.UTC(a.year, a.monthIndex, a.day)) / DAY_MS);
}

/** `25 October 2026` */
export function formatLongDate(key: DateKey): string {
  const { year, monthIndex, day } = splitDateKey(key);
  return `${day} ${MONTHS[monthIndex]} ${year}`;
}

/** `25 Oct 2026` */
export function formatShortDate(key: DateKey): string {
  const { year, monthIndex, day } = splitDateKey(key);
  return `${day} ${MONTHS[monthIndex].slice(0, 3)} ${year}`;
}

/** `Sun, 25 Oct 2026` */
export function formatWeekdayDate(key: DateKey): string {
  const weekday = WEEKDAYS_SHORT[(fromDateKey(key).getDay() + 6) % 7];
  return `${weekday}, ${formatShortDate(key)}`;
}

/** `25 / 10 / 2026`, the format used by the form fields in the mockup. */
export function formatSlashedDate(key: DateKey): string {
  const { year, monthIndex, day } = splitDateKey(key);
  return `${pad(day)} / ${pad(monthIndex + 1)} / ${year}`;
}

/** `Sun, 25 Oct 2026 at 09:00` */
export function formatDateTime(date: Date): string {
  return `${formatWeekdayDate(toDateKey(date))} at ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** Headline number and caption for the countdown badge. */
export function countdown(days: number): { value: string; caption: string } {
  if (days === 0) return { value: 'Today', caption: "it's the day" };
  if (days === 1) return { value: '1', caption: 'day left' };
  if (days > 1) return { value: String(days), caption: 'days left' };
  const ago = Math.abs(days);
  return { value: String(ago), caption: ago === 1 ? 'day ago' : 'days ago' };
}

/** `Today`, `Tomorrow`, `37 days left`, `3 days ago` */
export function countdownLabel(days: number): string {
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  if (days === -1) return 'Yesterday';
  return days > 0 ? `${days} days left` : `${Math.abs(days)} days ago`;
}

/** `today`, `tomorrow`, `in 1 week`, `in 5 days` — reads naturally mid-sentence. */
export function relativeDay(days: number): string {
  if (days === 0) return 'today';
  if (days === 1) return 'tomorrow';
  if (days === -1) return 'yesterday';
  if (days === 7) return 'in 1 week';
  if (days > 0 && days % 7 === 0 && days <= 28) return `in ${days / 7} weeks`;
  return days > 0 ? `in ${days} days` : `${Math.abs(days)} days ago`;
}

/** `On the day`, `1 day before`, `1 week before` */
export function leadLabel(daysBefore: number): string {
  if (daysBefore === 0) return 'On the day';
  if (daysBefore % 7 === 0) {
    const weeks = daysBefore / 7;
    return `${weeks} week${weeks === 1 ? '' : 's'} before`;
  }
  return `${daysBefore} day${daysBefore === 1 ? '' : 's'} before`;
}

/** Six Monday-first weeks for a month grid; `null` pads days from other months. */
export function monthGrid(year: number, monthIndex: number): (number | null)[][] {
  const leading = (new Date(year, monthIndex, 1).getDay() + 6) % 7;
  const total = daysInMonth(year, monthIndex);
  return Array.from({ length: 6 }, (_, week) =>
    Array.from({ length: 7 }, (_, weekday) => {
      const day = week * 7 + weekday - leading + 1;
      return day >= 1 && day <= total ? day : null;
    }),
  );
}
