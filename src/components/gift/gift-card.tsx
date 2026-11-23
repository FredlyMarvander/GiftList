import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { GiftArt } from '@/components/gift/gift-art';
import { StatusPill } from '@/components/gift/status-pill';
import { AppText } from '@/components/ui/app-text';
import { Icon } from '@/components/ui/icon';
import { Touchable } from '@/components/ui/touchable';
import { BUY_SOON_WINDOW_DAYS, STATUSES } from '@/constants/options';
import { radius, spacing } from '@/constants/theme';
import { formatRupiah } from '@/lib/currency';
import { countdownLabel, daysBetween } from '@/lib/dates';
import { needsBuying } from '@/lib/reminders';
import { useTheme } from '@/providers/theme-provider';
import type { DateKey, Gift } from '@/types/gift';

type GiftCardProps = { gift: Gift; today: DateKey };

export function GiftCard({ gift, today }: GiftCardProps) {
  const { colors } = useTheme();
  const daysLeft = daysBetween(today, gift.eventDate);
  const price = gift.purchase?.price || gift.budget;
  const priceText = price > 0 ? formatRupiah(price) : 'No budget yet';
  const when = countdownLabel(daysLeft);
  const urgent = needsBuying(gift) && daysLeft >= 0 && daysLeft <= BUY_SOON_WINDOW_DAYS;

  return (
    <Touchable
      pressedScale={0.985}
      onPress={() => router.push({ pathname: '/gift/[id]', params: { id: gift.id } })}
      accessibilityLabel={`${gift.name} for ${gift.recipient}, ${STATUSES[gift.status].label}, ${priceText}, ${when}`}
      style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <GiftArt gift={gift} size={76} />
      <View style={styles.copy}>
        <View style={styles.titleRow}>
          <AppText variant="subheading" numberOfLines={1} style={styles.name}>
            {gift.name}
          </AppText>
          <StatusPill status={gift.status} />
        </View>
        <View style={styles.bottomRow}>
          <View style={styles.details}>
            <AppText variant="caption" numberOfLines={1}>
              For: {gift.recipient}
            </AppText>
            <AppText variant="captionStrong" numberOfLines={1}>
              {priceText}
            </AppText>
            <View style={styles.when}>
              <Icon name={urgent ? 'bell-ring' : 'calendar'} size={13} color={urgent ? 'rose' : 'textMuted'} />
              <AppText variant="caption" color={urgent ? 'rose' : 'textMuted'} style={styles.whenText}>
                {when}
              </AppText>
            </View>
          </View>
          <Icon name="chevron-right" size={22} color="textMuted" strokeWidth={2.6} />
        </View>
      </View>
    </Touchable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md + 2,
    padding: spacing.md + 2,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  copy: { flex: 1, gap: 2 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  name: { flex: 1 },
  bottomRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  details: { flex: 1, gap: 1 },
  when: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 1 },
  whenText: { fontSize: 12, lineHeight: 16 },
});
