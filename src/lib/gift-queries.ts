import { CATEGORIES, GIFT_TYPES, OCCASIONS, STATUSES, type GiftStatus, type OccasionId } from '@/constants/options';
import { daysBetween } from '@/lib/dates';
import { personKey } from '@/lib/names';
import { needsBuying } from '@/lib/reminders';
import type { DateKey, Gift } from '@/types/gift';

/** Nearest upcoming event first, then past events from most recent to oldest. */
export function sortByEvent(gifts: Gift[], today: DateKey): Gift[] {
  return [...gifts].sort((a, b) => {
    const aPast = a.eventDate < today;
    const bPast = b.eventDate < today;
    if (aPast !== bPast) return aPast ? 1 : -1;
    const order = a.eventDate.localeCompare(b.eventDate) || a.name.localeCompare(b.name);
    return aPast ? -order : order;
  });
}

export type SortMode = 'date' | 'budget' | 'name';

export const SORT_LABELS: Record<SortMode, string> = {
  date: 'Nearest event',
  budget: 'Highest budget',
  name: 'Name A to Z',
};

export function sortGifts(gifts: Gift[], mode: SortMode, today: DateKey): Gift[] {
  if (mode === 'budget') return [...gifts].sort((a, b) => b.budget - a.budget);
  if (mode === 'name') return [...gifts].sort((a, b) => a.name.localeCompare(b.name));
  return sortByEvent(gifts, today);
}

/** Matches people, gifts and events; every word in the query has to appear somewhere. */
export function searchGifts(gifts: Gift[], query: string): Gift[] {
  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length === 0) return gifts;
  return gifts.filter((gift) => {
    const haystack = [
      gift.name,
      gift.recipient,
      gift.notes,
      OCCASIONS[gift.occasion].label,
      CATEGORIES[gift.category].label,
      GIFT_TYPES[gift.type].label,
      STATUSES[gift.status].label,
      gift.purchase?.store ?? '',
    ]
      .join(' ')
      .toLowerCase();
    return words.every((word) => haystack.includes(word));
  });
}

/* ---------------------------------------------------------------- Events */

export type UpcomingEvent = {
  key: string;
  recipient: string;
  occasion: OccasionId;
  date: DateKey;
  daysLeft: number;
  gifts: Gift[];
};

/** Gifts for the same person, occasion and day are shown as one event. */
export function upcomingEvents(gifts: Gift[], today: DateKey): UpcomingEvent[] {
  const events = new Map<string, UpcomingEvent>();
  for (const gift of sortByEvent(gifts, today)) {
    if (gift.eventDate < today || gift.status === 'given') continue;
    const key = `${personKey(gift.recipient)}|${gift.occasion}|${gift.eventDate}`;
    const existing = events.get(key);
    if (existing) {
      existing.gifts.push(gift);
    } else {
      events.set(key, {
        key,
        recipient: gift.recipient,
        occasion: gift.occasion,
        date: gift.eventDate,
        daysLeft: daysBetween(today, gift.eventDate),
        gifts: [gift],
      });
    }
  }
  return [...events.values()];
}

/* ---------------------------------------------------------------- People */

export type Person = {
  key: string;
  name: string;
  gifts: Gift[];
  nextEvent: UpcomingEvent | null;
  spent: number;
};

export function listPeople(gifts: Gift[], today: DateKey): Person[] {
  const people = new Map<string, Person>();
  for (const gift of sortByEvent(gifts, today)) {
    const key = personKey(gift.recipient);
    const person = people.get(key) ?? { key, name: gift.recipient.trim(), gifts: [], nextEvent: null, spent: 0 };
    person.gifts.push(gift);
    person.spent += gift.purchase?.price ?? 0;
    people.set(key, person);
  }
  for (const person of people.values()) {
    person.nextEvent = upcomingEvents(person.gifts, today)[0] ?? null;
  }
  return [...people.values()];
}

export function findPerson(gifts: Gift[], name: string, today: DateKey): Person | null {
  const key = personKey(name);
  return listPeople(gifts, today).find((person) => person.key === key) ?? null;
}

/* ---------------------------------------------------------------- Budget */

export type BudgetSummary = {
  /** Budgets of gifts that still need buying. */
  toBuy: number;
  toBuyCount: number;
  /** What was actually paid. */
  spent: number;
  boughtCount: number;
  /** Budget minus price for bought gifts that had a budget; negative when over budget. */
  saved: number;
  total: number;
};

export function summarizeBudget(gifts: Gift[]): BudgetSummary {
  const summary: BudgetSummary = { toBuy: 0, toBuyCount: 0, spent: 0, boughtCount: 0, saved: 0, total: 0 };
  for (const gift of gifts) {
    if (needsBuying(gift)) {
      summary.toBuy += gift.budget;
      summary.toBuyCount += 1;
    } else if (gift.purchase) {
      summary.spent += gift.purchase.price;
      summary.boughtCount += 1;
      if (gift.budget > 0) summary.saved += gift.budget - gift.purchase.price;
    }
  }
  summary.total = summary.toBuy + summary.spent;
  return summary;
}

export function countByStatus(gifts: Gift[]): Record<GiftStatus, number> {
  const counts: Record<GiftStatus, number> = { idea: 0, planned: 0, bought: 0, given: 0 };
  for (const gift of gifts) counts[gift.status] += 1;
  return counts;
}
