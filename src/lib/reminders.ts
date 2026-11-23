import { BUY_SOON_WINDOW_DAYS, NEXT_YEAR_LEAD_DAYS, REMIND_AGAIN_PRESETS } from '@/constants/options';
import { formatRupiah } from '@/lib/currency';
import { addDays, addYears, atTime, daysBetween, leadLabel, relativeDay, toDateKey } from '@/lib/dates';
import { personKey, possessive } from '@/lib/names';
import type { DateKey, Gift, RemindAgain, Settings } from '@/types/gift';

/**
 * Reminder rules, kept free of React and native code so they are easy to test:
 *
 * 1. `buy`       The gift is not bought yet: fires 1 week before the event (and any other lead the user picked).
 * 2. `snooze`    "Remind me tomorrow" from a buy notification.
 * 3. `again`     The gift is bought: the "Remind me again" field.
 * 4. `next-year` The event repeats: start planning before next year's date.
 */
export type ReminderKind = 'buy' | 'snooze' | 'again' | 'next-year';

export type PlannedReminder = {
  id: string;
  giftId: string;
  kind: ReminderKind;
  at: Date;
  /** Only for `buy`: how many days before the event it fires. */
  daysBefore?: number;
  /** Short description shown in the app, e.g. "1 week before". */
  label: string;
  title: string;
  body: string;
};

/** Names the event inside a sentence, e.g. `Sarah's birthday` or `Christmas`. */
export function eventName(gift: Pick<Gift, 'recipient' | 'occasion'>): string {
  switch (gift.occasion) {
    case 'valentine':
      return "Valentine's Day";
    case 'eid':
      return 'Eid';
    case 'christmas':
      return 'Christmas';
    case 'thanks':
      return `Thank-you day for ${gift.recipient}`;
    case 'other':
      return `${possessive(gift.recipient)} special day`;
    default:
      return `${possessive(gift.recipient)} ${gift.occasion}`;
  }
}

export function needsBuying(gift: Pick<Gift, 'status'>): boolean {
  return gift.status === 'idea' || gift.status === 'planned';
}

/** The calendar day the "Remind me again" field points to. */
export function remindAgainDay(remindAgain: RemindAgain, eventDate: DateKey): DateKey {
  const { daysBefore } = REMIND_AGAIN_PRESETS[remindAgain.preset];
  if (daysBefore !== null) return addDays(eventDate, -daysBefore);
  return remindAgain.customDate ?? eventDate;
}

/**
 * Upcoming buy reminders for a gift. When the event is closer than every lead
 * the user picked, fall back to one day before (or the day itself) so a gift
 * added at the last minute still gets a reminder.
 */
export function buyReminderTimes(
  gift: Pick<Gift, 'status' | 'eventDate' | 'buyReminderDays'>,
  reminderTime: string,
  now: Date,
): { at: Date; daysBefore: number; fallback: boolean }[] {
  if (!needsBuying(gift) || gift.buyReminderDays.length === 0) return [];
  const timeFor = (daysBefore: number) => atTime(addDays(gift.eventDate, -daysBefore), reminderTime);

  const chosen = [...new Set(gift.buyReminderDays)]
    .sort((a, b) => b - a)
    .map((daysBefore) => ({ at: timeFor(daysBefore), daysBefore, fallback: false }))
    .filter((entry) => entry.at > now);
  if (chosen.length > 0) return chosen;

  const fallback = [1, 0]
    .map((daysBefore) => ({ at: timeFor(daysBefore), daysBefore, fallback: true }))
    .find((entry) => entry.at > now);
  return fallback ? [fallback] : [];
}

export function planReminders(gift: Gift, settings: Pick<Settings, 'reminderTime'>, now: Date): PlannedReminder[] {
  const reminders: PlannedReminder[] = [];
  const event = eventName(gift);

  for (const { at, daysBefore } of buyReminderTimes(gift, settings.reminderTime, now)) {
    const budget = gift.budget > 0 ? ` Your budget is ${formatRupiah(gift.budget)}.` : '';
    reminders.push({
      id: `buy-${gift.id}-${daysBefore}`,
      giftId: gift.id,
      kind: 'buy',
      at,
      daysBefore,
      label: leadLabel(daysBefore),
      title: `${event} is ${relativeDay(daysBefore)}`,
      body: `Time to buy ${gift.name} for ${gift.recipient}!${budget}`,
    });
  }

  if (needsBuying(gift) && gift.snoozedUntil) {
    const at = new Date(gift.snoozedUntil);
    const daysLeft = daysBetween(toDateKey(at), gift.eventDate);
    if (at > now && daysLeft >= 0) {
      reminders.push({
        id: `snooze-${gift.id}`,
        giftId: gift.id,
        kind: 'snooze',
        at,
        label: 'Snoozed',
        title: `Still need to buy ${gift.name}?`,
        body: `${event} is ${relativeDay(daysLeft)}.`,
      });
    }
  }

  if (gift.status === 'bought' && gift.remindAgain) {
    const day = remindAgainDay(gift.remindAgain, gift.eventDate);
    const at = atTime(day, gift.remindAgain.time);
    if (at > now) {
      const daysLeft = daysBetween(day, gift.eventDate);
      reminders.push({
        id: `again-${gift.id}`,
        giftId: gift.id,
        kind: 'again',
        at,
        label: 'Remind me again',
        title: daysLeft >= 0 ? `${event} is ${relativeDay(daysLeft)}` : `About the gift for ${gift.recipient}`,
        body: gift.remindAgain.note.trim() || `${gift.name} is ready. Don't forget to wrap it and hand it over!`,
      });
    }
  }

  if (!needsBuying(gift) && gift.remindNextYear) {
    const nextEvent = nextYearlyDate(gift.eventDate, toDateKey(now));
    const at = atTime(addDays(nextEvent, -NEXT_YEAR_LEAD_DAYS), settings.reminderTime);
    if (at > now) {
      reminders.push({
        id: `next-year-${gift.id}`,
        giftId: gift.id,
        kind: 'next-year',
        at,
        label: 'Plan next gift',
        title: `${event} is ${relativeDay(NEXT_YEAR_LEAD_DAYS)}`,
        body: `Last time you gave ${gift.recipient} ${gift.name}. Time to find something new!`,
      });
    }
  }

  return reminders;
}

/** The next repeat of a yearly event after the original one. */
export function nextYearlyDate(eventDate: DateKey, today: DateKey): DateKey {
  let years = 1;
  while (addYears(eventDate, years) < today) years += 1;
  return addYears(eventDate, years);
}

export function planAllReminders(gifts: Gift[], settings: Pick<Settings, 'reminderTime'>, now: Date): PlannedReminder[] {
  const today = toDateKey(now);
  const sameEvent = (a: Gift, b: Gift) => a.occasion === b.occasion && personKey(a.recipient) === personKey(b.recipient);

  return gifts
    .flatMap((gift) => {
      const reminders = planReminders(gift, settings, now);
      // One "plan the next gift" per person and occasion: skip it when a newer gift
      // carries the reminder, or when the next gift is already on the list or bought.
      const superseded = gifts.some(
        (other) =>
          other.id !== gift.id &&
          sameEvent(other, gift) &&
          (other.eventDate > gift.eventDate || (other.eventDate === gift.eventDate && other.id > gift.id)) &&
          (other.remindNextYear || other.eventDate >= today),
      );
      return superseded ? reminders.filter((reminder) => reminder.kind !== 'next-year') : reminders;
    })
    .sort((a, b) => a.at.getTime() - b.at.getTime());
}

/* -------------------------------------------------------- Needs attention */

export type AttentionKind = 'buy' | 'give' | 'passed';
export type AttentionItem = { gift: Gift; kind: AttentionKind; daysLeft: number };

/** What the user should act on now; this is the in-app twin of the notifications. */
export function attentionItems(gifts: Gift[], today: DateKey): AttentionItem[] {
  const items: AttentionItem[] = [];
  for (const gift of gifts) {
    if (gift.status === 'given') continue;
    const daysLeft = daysBetween(today, gift.eventDate);
    if (daysLeft < 0) items.push({ gift, kind: 'passed', daysLeft });
    else if (needsBuying(gift) && daysLeft <= BUY_SOON_WINDOW_DAYS) items.push({ gift, kind: 'buy', daysLeft });
    else if (gift.status === 'bought' && daysLeft <= 1) items.push({ gift, kind: 'give', daysLeft });
  }
  const order: Record<AttentionKind, number> = { give: 0, buy: 1, passed: 2 };
  return items.sort((a, b) => order[a.kind] - order[b.kind] || a.daysLeft - b.daysLeft);
}
