import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { GiftArt } from '@/components/gift/gift-art';
import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { Touchable } from '@/components/ui/touchable';
import { radius, spacing } from '@/constants/theme';
import { useGiftActions } from '@/hooks/use-gift-actions';
import { relativeDay } from '@/lib/dates';
import { eventName, needsBuying, type AttentionItem } from '@/lib/reminders';
import { useTheme } from '@/providers/theme-provider';

function copyFor({ gift, kind, daysLeft }: AttentionItem): { title: string; detail: string } {
  const event = eventName(gift);
  switch (kind) {
    case 'buy':
      return { title: `Time to buy ${gift.name}`, detail: `${event} is ${relativeDay(daysLeft)}` };
    case 'give':
      return { title: `Give ${gift.name} to ${gift.recipient}`, detail: `${event} is ${relativeDay(daysLeft)}` };
    case 'passed':
      return needsBuying(gift)
        ? { title: `${gift.name} was never bought`, detail: `${event} was ${relativeDay(daysLeft)}` }
        : { title: `Did you give ${gift.name}?`, detail: `${event} was ${relativeDay(daysLeft)}` };
  }
}

/** In-app version of the notifications: says what to do and offers it in one tap. */
export function AttentionCard({ item }: { item: AttentionItem }) {
  const { colors } = useTheme();
  const { openBoughtForm, markGiven, snoozeUntilTomorrow } = useGiftActions();
  const { gift, kind } = item;
  const { title, detail } = copyFor(item);
  const missed = kind === 'passed' && needsBuying(gift);

  return (
    <View style={[styles.card, { backgroundColor: colors.warningSoft, borderColor: colors.warningBorder }]}>
      <Touchable
        pressedScale={0.985}
        onPress={() => router.push({ pathname: '/gift/[id]', params: { id: gift.id } })}
        accessibilityLabel={`${title}. ${detail}`}
        style={styles.row}>
        <GiftArt gift={gift} size={54} />
        <View style={styles.copy}>
          <AppText variant="bodyStrong" color="heading" numberOfLines={2}>
            {title}
          </AppText>
          <AppText variant="caption" color="warning">
            {detail}
          </AppText>
        </View>
      </Touchable>
      <View style={styles.actions}>
        {kind === 'buy' ? (
          <>
            <Button compact label="I bought it" icon="check" onPress={() => openBoughtForm(gift)} style={styles.action} />
            <Button
              compact
              label="Remind tomorrow"
              variant="soft"
              onPress={() => snoozeUntilTomorrow(gift)}
              style={styles.action}
            />
          </>
        ) : missed ? (
          <Button
            compact
            label="Change the date"
            icon="calendar"
            variant="soft"
            onPress={() => router.push({ pathname: '/gift/[id]/edit', params: { id: gift.id } })}
            style={styles.action}
          />
        ) : (
          <Button compact label="Mark as given" icon="hand-heart" onPress={() => markGiven(gift)} style={styles.action} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radius.lg, borderWidth: 1, padding: spacing.md + 2, gap: spacing.md },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  copy: { flex: 1, gap: 2 },
  actions: { flexDirection: 'row', gap: spacing.sm },
  action: { flex: 1, paddingHorizontal: spacing.sm },
});
