import { router, useLocalSearchParams } from 'expo-router';

import { GiftForm, type GiftFormValues } from '@/components/form/gift-form';
import {
  CATEGORY_IDS,
  DEFAULT_BUY_REMINDER_DAYS,
  GIFT_TYPE_IDS,
  OCCASION_IDS,
} from '@/constants/options';
import { parseRupiah } from '@/lib/currency';
import { isDateKey } from '@/lib/dates';
import { useGifts } from '@/providers/gifts-provider';
import { useNotifications } from '@/providers/notification-provider';
import { useToast } from '@/providers/toast-provider';

/** Any field can be prefilled through the URL, e.g. from Inspiration or a person's page. */
type NewGiftParams = {
  name?: string;
  recipient?: string;
  type?: string;
  category?: string;
  occasion?: string;
  eventDate?: string;
  budget?: string;
};

function pick<T extends string>(options: readonly T[], value: string | undefined, fallback: T): T {
  return options.find((option) => option === value) ?? fallback;
}

export default function AddGiftScreen() {
  const params = useLocalSearchParams<NewGiftParams>();
  const { addGift } = useGifts();
  const { askOnce } = useNotifications();
  const toast = useToast();

  const initialValues: GiftFormValues = {
    name: params.name ?? '',
    recipient: params.recipient ?? '',
    type: pick(GIFT_TYPE_IDS, params.type, 'gift'),
    category: pick(CATEGORY_IDS, params.category, 'other'),
    occasion: pick(OCCASION_IDS, params.occasion, 'birthday'),
    eventDate: isDateKey(params.eventDate) ? params.eventDate : null,
    budget: parseRupiah(params.budget ?? ''),
    status: 'idea',
    notes: '',
    photo: null,
    buyReminderDays: DEFAULT_BUY_REMINDER_DAYS,
    purchase: null,
    remindAgain: null,
    remindNextYear: false,
  };

  return (
    <GiftForm
      title="Add Gift Idea"
      submitLabel="Save Idea"
      initialValues={initialValues}
      onSubmit={(draft) => {
        const gift = addGift(draft);
        router.replace({ pathname: '/gift/[id]', params: { id: gift.id } });
        toast({ message: `${gift.name} saved for ${gift.recipient}`, icon: 'circle-check' });
        askOnce();
      }}
    />
  );
}
