import { useLocalSearchParams } from 'expo-router';

import { GiftForm } from '@/components/form/gift-form';
import { GiftNotFound } from '@/components/gift/gift-not-found';
import { goBack } from '@/components/ui/screen-header';
import { useGift, useGifts } from '@/providers/gifts-provider';
import { useNotifications } from '@/providers/notification-provider';
import { useToast } from '@/providers/toast-provider';

export default function EditGiftScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const gift = useGift(id);
  const { updateGift } = useGifts();
  const { askOnce } = useNotifications();
  const toast = useToast();

  if (!gift) return <GiftNotFound />;

  const { id: _id, createdAt: _createdAt, updatedAt: _updatedAt, snoozedUntil: _snoozedUntil, ...draft } = gift;

  return (
    <GiftForm
      title="Edit Gift Idea"
      submitLabel="Save Changes"
      initialValues={draft}
      editingId={gift.id}
      onSubmit={(next) => {
        updateGift(gift.id, next);
        goBack();
        toast({ message: 'Changes saved', icon: 'circle-check' });
        askOnce();
      }}
    />
  );
}
