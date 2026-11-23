import { router } from 'expo-router';

import { STATUSES, type GiftStatus } from '@/constants/options';
import { addDays, atTime, toDateKey } from '@/lib/dates';
import { haptics } from '@/lib/haptics';
import { deletePhoto } from '@/lib/photos';
import { useCelebrate } from '@/providers/celebration-provider';
import { useConfirm } from '@/providers/confirm-provider';
import { useGifts } from '@/providers/gifts-provider';
import { useNotifications } from '@/providers/notification-provider';
import { useToast } from '@/providers/toast-provider';
import type { Gift } from '@/types/gift';

/** Things the user can do to a gift, shared by cards, the detail page and notifications. */
export function useGiftActions() {
  const { updateGift, removeGift, restoreGift, settings } = useGifts();
  const confirm = useConfirm();
  const toast = useToast();
  const celebrate = useCelebrate();
  const { askOnce } = useNotifications();

  const openBoughtForm = (gift: Pick<Gift, 'id'>) =>
    router.push({ pathname: '/gift/[id]/bought', params: { id: gift.id } });

  const markGiven = (gift: Gift) => {
    const { status, snoozedUntil } = gift;
    updateGift(gift.id, { status: 'given', snoozedUntil: null });
    celebrate();
    toast({
      message: `${gift.name} was given to ${gift.recipient}`,
      icon: 'party-popper',
      actionLabel: 'Undo',
      onAction: () => updateGift(gift.id, { status, snoozedUntil }),
    });
  };

  /** Runs the right flow for a status change; returns without changes when the user cancels. */
  const changeStatus = async (gift: Gift, next: GiftStatus) => {
    if (next === gift.status) return;
    if (next === 'bought' && !gift.purchase) return openBoughtForm(gift);
    if (next === 'given') return markGiven(gift);

    if (gift.purchase && next !== 'bought') {
      const agreed = await confirm({
        title: `Move back to ${STATUSES[next].label}?`,
        message: 'The purchase details and the "Remind me again" reminder will be removed.',
        confirmLabel: 'Move back',
        icon: 'rotate-ccw',
      });
      if (!agreed) return;
      updateGift(gift.id, { status: next, purchase: null, remindAgain: null });
    } else {
      updateGift(gift.id, { status: next });
    }
    haptics.tap();
    toast({ message: `Moved to ${STATUSES[next].label}`, icon: STATUSES[next].icon });
  };

  const snoozeUntilTomorrow = (gift: Gift) => {
    const tomorrow = atTime(addDays(toDateKey(new Date()), 1), settings.reminderTime);
    updateGift(gift.id, { snoozedUntil: tomorrow.toISOString() });
    toast({ message: `Snoozed until tomorrow at ${settings.reminderTime}`, icon: 'bell-ring' });
    askOnce();
  };

  /** Resolves to true once the gift is deleted. */
  const deleteGift = async (gift: Gift): Promise<boolean> => {
    const agreed = await confirm({
      title: 'Delete this idea?',
      message: `"${gift.name}" for ${gift.recipient} and its reminders will be removed.`,
      confirmLabel: 'Delete',
      icon: 'trash-2',
      destructive: true,
    });
    if (!agreed) return false;
    removeGift(gift.id);
    haptics.warning();
    toast({
      message: `${gift.name} deleted`,
      icon: 'trash-2',
      actionLabel: 'Undo',
      onAction: () => restoreGift(gift),
      onDismiss: () => deletePhoto(gift.photo),
    });
    return true;
  };

  return { openBoughtForm, markGiven, changeStatus, snoozeUntilTomorrow, deleteGift };
}
