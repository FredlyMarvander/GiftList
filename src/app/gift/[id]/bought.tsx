import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { PurchaseFields } from '@/components/form/purchase-fields';
import { defaultRemindAgain, RemindAgainFields, remindAgainError } from '@/components/form/remind-again-fields';
import { GiftArt } from '@/components/gift/gift-art';
import { GiftNotFound } from '@/components/gift/gift-not-found';
import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { SwitchRow } from '@/components/ui/fields';
import { Screen } from '@/components/ui/screen';
import { ScreenHeader } from '@/components/ui/screen-header';
import { OCCASIONS } from '@/constants/options';
import { spacing } from '@/constants/theme';
import { useToday } from '@/hooks/use-today';
import { formatLongDate } from '@/lib/dates';
import { haptics } from '@/lib/haptics';
import { useCelebrate } from '@/providers/celebration-provider';
import { useGift, useGifts } from '@/providers/gifts-provider';
import { useNotifications } from '@/providers/notification-provider';
import { useToast } from '@/providers/toast-provider';
import type { Gift } from '@/types/gift';

export default function BoughtScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const gift = useGift(id);
  return gift ? <BoughtForm gift={gift} /> : <GiftNotFound />;
}

/** Saves that the gift is bought, then asks when to remind the user again. */
function BoughtForm({ gift }: { gift: Gift }) {
  const today = useToday();
  const { updateGift } = useGifts();
  const { askOnce } = useNotifications();
  const celebrate = useCelebrate();
  const toast = useToast();

  const firstTime = gift.purchase === null;
  const upcoming = gift.eventDate >= today;
  const yearly = OCCASIONS[gift.occasion].yearly;

  const [purchase, setPurchase] = useState(gift.purchase ?? { date: today, price: gift.budget, store: '' });
  const [remindAgain, setRemindAgain] = useState(
    gift.remindAgain ?? (firstTime && upcoming ? defaultRemindAgain(gift.eventDate, today) : null),
  );
  const [remindNextYear, setRemindNextYear] = useState(gift.remindNextYear);
  const [remindError, setRemindError] = useState<string>();

  const save = () => {
    const error = remindAgainError(remindAgain, gift.eventDate);
    setRemindError(error);
    if (error) {
      haptics.error();
      return;
    }
    updateGift(gift.id, {
      status: gift.status === 'given' ? 'given' : 'bought',
      purchase: { ...purchase, store: purchase.store.trim() },
      remindAgain,
      remindNextYear: yearly && remindNextYear,
      snoozedUntil: null,
    });
    router.dismissTo({ pathname: '/gift/[id]', params: { id: gift.id } });
    if (firstTime) celebrate();
    toast({
      message: firstTime ? `Nice! ${gift.name} is bought` : 'Purchase updated',
      icon: firstTime ? 'party-popper' : 'circle-check',
    });
    askOnce();
  };

  return (
    <Screen
      header={<ScreenHeader title={firstTime ? 'Mark as Bought' : 'Purchase'} backIcon="x" />}
      contentStyle={styles.page}>
      <Card style={styles.gift}>
        <GiftArt gift={gift} size={60} />
        <View style={styles.flex}>
          <AppText variant="subheading" numberOfLines={1}>
            {gift.name}
          </AppText>
          <AppText variant="caption" color="textMuted" numberOfLines={1}>
            For {gift.recipient}, {formatLongDate(gift.eventDate)}
          </AppText>
        </View>
      </Card>

      <PurchaseFields value={purchase} onChange={setPurchase} budget={gift.budget} />

      {upcoming && gift.status !== 'given' ? (
        <RemindAgainFields
          value={remindAgain}
          onChange={(next) => {
            setRemindAgain(next);
            setRemindError(undefined);
          }}
          eventDate={gift.eventDate}
          error={remindError}
        />
      ) : null}

      {yearly ? (
        <SwitchRow
          icon="history"
          label="Remind me next year"
          description="Two weeks before the date comes around again"
          value={remindNextYear}
          onChange={setRemindNextYear}
        />
      ) : null}

      <Button label={firstTime ? 'Save as Bought' : 'Save Changes'} icon="check" onPress={save} testID="save-bought" />
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  page: { gap: spacing.xl - 4 },
  gift: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md },
});
