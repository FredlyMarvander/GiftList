import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Icon } from '@/components/ui/icon';
import { Touchable } from '@/components/ui/touchable';
import { OCCASIONS } from '@/constants/options';
import { fonts, maxContentWidth, radius, spacing } from '@/constants/theme';
import { countdown, formatLongDate } from '@/lib/dates';
import type { UpcomingEvent } from '@/lib/gift-queries';
import { needsBuying } from '@/lib/reminders';
import { useTheme } from '@/providers/theme-provider';

const GAP = spacing.md;

/** Swipeable countdown cards. Bleeds past the page gutter so the next card peeks in. */
export function UpcomingCarousel({ events }: { events: UpcomingEvent[] }) {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const [page, setPage] = useState(0);
  const cardWidth = Math.min(width, maxContentWidth) - spacing.xl * 2;
  const current = Math.min(page, events.length - 1);

  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={cardWidth + GAP}
        scrollEventThrottle={32}
        onScroll={(event) => setPage(Math.round(event.nativeEvent.contentOffset.x / (cardWidth + GAP)))}
        style={styles.scroller}
        contentContainerStyle={styles.content}>
        {events.map((event) => (
          <UpcomingCard key={event.key} event={event} width={cardWidth} />
        ))}
      </ScrollView>
      {events.length > 1 ? (
        <View style={styles.dots} accessible accessibilityLabel={`Event ${current + 1} of ${events.length}`}>
          {events.map((event, index) => (
            <View
              key={event.key}
              style={[
                styles.dot,
                { backgroundColor: index === current ? colors.rose : colors.border },
                index === current && styles.activeDot,
              ]}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}

function UpcomingCard({ event, width }: { event: UpcomingEvent; width: number }) {
  const { colors } = useTheme();
  const badge = countdown(event.daysLeft);
  const waiting = event.gifts.filter(needsBuying);
  const ready = waiting.length === 0;
  const summary = ready
    ? event.gifts.length === 1
      ? 'Gift is ready'
      : 'All gifts are ready'
    : event.gifts.length === 1
      ? `${event.gifts[0].name} still to buy`
      : `${waiting.length} of ${event.gifts.length} gifts still to buy`;

  const open = () => {
    if (event.gifts.length === 1) router.push({ pathname: '/gift/[id]', params: { id: event.gifts[0].id } });
    else router.push({ pathname: '/person/[name]', params: { name: event.recipient } });
  };

  return (
    <Touchable
      pressedScale={0.985}
      onPress={open}
      accessibilityLabel={`Upcoming ${OCCASIONS[event.occasion].label}, ${event.recipient}, ${formatLongDate(event.date)}, ${badge.value} ${badge.caption}. ${summary}`}
      style={[styles.card, { width, backgroundColor: colors.hero }]}>
      <View style={styles.top}>
        <View style={styles.info}>
          <AppText variant="bodyMedium" color="heroLabel" numberOfLines={1}>
            Upcoming {OCCASIONS[event.occasion].label}
          </AppText>
          <AppText color="textStrong" numberOfLines={1} style={styles.name}>
            {event.recipient}
          </AppText>
          <View style={styles.date}>
            <Icon name="calendar" size={18} color="rose" strokeWidth={2.3} />
            <AppText variant="bodyMedium" color="heroDate">
              {formatLongDate(event.date)}
            </AppText>
          </View>
        </View>
        <View
          style={[styles.badge, { backgroundColor: colors.heroBadge, boxShadow: `0px 6px 14px ${colors.shadow}` }]}>
          <AppText
            color="rose"
            align="center"
            maxFontSizeMultiplier={1.1}
            style={event.daysLeft === 0 ? styles.badgeToday : styles.badgeValue}>
            {badge.value}
          </AppText>
          <AppText variant="small" color="rose" align="center" maxFontSizeMultiplier={1.1} style={styles.badgeCaption}>
            {badge.caption}
          </AppText>
        </View>
      </View>
      <View style={[styles.footer, { borderTopColor: colors.roseSoft }]}>
        <Icon name={ready ? 'package-check' : 'shopping-bag'} size={16} color={ready ? 'success' : 'rose'} />
        <AppText variant="captionStrong" color={ready ? 'success' : 'rose'} numberOfLines={1} style={styles.flex}>
          {summary}
        </AppText>
        <Icon name="chevron-right" size={16} color="heroDate" strokeWidth={2.6} />
      </View>
    </Touchable>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  wrapper: { gap: spacing.md },
  scroller: { marginHorizontal: -spacing.xl },
  content: { paddingHorizontal: spacing.xl, gap: GAP, paddingVertical: 2 },
  card: { borderRadius: radius.xl, paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.md },
  top: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  info: { flex: 1, gap: 3 },
  name: { fontFamily: fonts.extrabold, fontSize: 26, lineHeight: 32, letterSpacing: -0.6 },
  date: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  badge: { width: 78, height: 78, borderRadius: radius.lg + 2, alignItems: 'center', justifyContent: 'center' },
  badgeValue: { fontFamily: fonts.bold, fontSize: 26, lineHeight: 30 },
  badgeToday: { fontFamily: fonts.bold, fontSize: 19, lineHeight: 26 },
  badgeCaption: { fontFamily: fonts.bold, fontSize: 11, lineHeight: 14 },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
  },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  activeDot: { width: 18 },
});
