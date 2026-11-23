import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { EmptyState } from '@/components/gift/empty-state';
import { GiftCard } from '@/components/gift/gift-card';
import { PersonAvatar } from '@/components/gift/person-avatar';
import { UpcomingCarousel } from '@/components/gift/upcoming-carousel';
import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Screen } from '@/components/ui/screen';
import { ScreenHeader } from '@/components/ui/screen-header';
import { SectionHeader } from '@/components/ui/section-header';
import { spacing } from '@/constants/theme';
import { useToday } from '@/hooks/use-today';
import { formatRupiah } from '@/lib/currency';
import { findPerson, upcomingEvents } from '@/lib/gift-queries';
import { useGifts } from '@/providers/gifts-provider';

export default function PersonScreen() {
  const { name } = useLocalSearchParams<{ name: string }>();
  const { gifts } = useGifts();
  const today = useToday();
  const person = findPerson(gifts, name ?? '', today);

  if (!person) {
    return (
      <Screen header={<ScreenHeader title={name ?? 'Person'} />}>
        <EmptyState
          title="No gifts yet"
          message={`Add a gift idea and ${name ?? 'this person'} will show up here.`}
          actionLabel="Add a gift idea"
          onAction={() => router.push({ pathname: '/gift/new', params: { recipient: name ?? '' } })}
        />
      </Screen>
    );
  }

  const given = person.gifts.filter((gift) => gift.status === 'given');
  const active = person.gifts.filter((gift) => gift.status !== 'given');
  const events = upcomingEvents(person.gifts, today);
  const next = person.nextEvent;
  const stats = [
    { label: 'Ideas', value: String(active.length) },
    { label: 'Given', value: String(given.length) },
    { label: 'Spent', value: formatRupiah(person.spent) },
  ];

  return (
    <Screen header={<ScreenHeader title={person.name} />} contentStyle={styles.page}>
      <View style={styles.hero}>
        <PersonAvatar name={person.name} size={96} />
      </View>

      <Card style={styles.stats}>
        {stats.map((stat) => (
          <View key={stat.label} style={styles.stat} accessible accessibilityLabel={`${stat.label}: ${stat.value}`}>
            <AppText variant="subheading" numberOfLines={1} adjustsFontSizeToFit>
              {stat.value}
            </AppText>
            <AppText variant="caption" color="textMuted">
              {stat.label}
            </AppText>
          </View>
        ))}
      </Card>

      {events.length > 0 ? <UpcomingCarousel events={events} /> : null}

      <Button
        label={`Add idea for ${person.name}`}
        icon="plus"
        onPress={() =>
          router.push({
            pathname: '/gift/new',
            params: {
              recipient: person.name,
              ...(next ? { occasion: next.occasion, eventDate: next.date } : {}),
            },
          })
        }
      />

      {active.length > 0 ? (
        <View style={styles.group}>
          <SectionHeader title="Gift ideas" />
          {active.map((gift) => (
            <GiftCard key={gift.id} gift={gift} today={today} />
          ))}
        </View>
      ) : null}

      {given.length > 0 ? (
        <View style={styles.group}>
          <SectionHeader title="Already given" />
          {given.map((gift) => (
            <GiftCard key={gift.id} gift={gift} today={today} />
          ))}
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  page: { gap: spacing.xl },
  hero: { alignItems: 'center' },
  stats: { flexDirection: 'row' },
  stat: { flex: 1, alignItems: 'center', gap: 2, paddingHorizontal: spacing.xs },
  group: { gap: spacing.md },
});
