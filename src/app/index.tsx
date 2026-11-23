import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AttentionCard } from '@/components/gift/attention-card';
import { EmptyState } from '@/components/gift/empty-state';
import { GiftCard } from '@/components/gift/gift-card';
import { GiftBox, HeartArt } from '@/components/gift/gift-illustration';
import { PersonAvatar } from '@/components/gift/person-avatar';
import { UpcomingCarousel } from '@/components/gift/upcoming-carousel';
import { AppText } from '@/components/ui/app-text';
import { Icon } from '@/components/ui/icon';
import { IconButton } from '@/components/ui/icon-button';
import { Screen } from '@/components/ui/screen';
import { SearchBar } from '@/components/ui/search-bar';
import { SectionHeader } from '@/components/ui/section-header';
import { Touchable } from '@/components/ui/touchable';
import { fonts, maxContentWidth, radius, spacing } from '@/constants/theme';
import quotes from '@/data/quotes.json';
import { useToday } from '@/hooks/use-today';
import { formatRupiah } from '@/lib/currency';
import { countdownLabel, daysBetween } from '@/lib/dates';
import {
  listPeople,
  searchGifts,
  sortByEvent,
  summarizeBudget,
  upcomingEvents,
  type Person,
} from '@/lib/gift-queries';
import { attentionItems } from '@/lib/reminders';
import { useGifts } from '@/providers/gifts-provider';
import { useTheme } from '@/providers/theme-provider';

const HOME_GIFT_LIMIT = 3;
const CAROUSEL_LIMIT = 5;

export default function HomeScreen() {
  const { gifts } = useGifts();
  const today = useToday();
  const { colors } = useTheme();
  const [query, setQuery] = useState('');

  const searching = query.trim() !== '';
  const attention = attentionItems(gifts, today);

  return (
    <Screen overlay={<AddButton />} contentStyle={styles.page}>
      <View style={styles.topBar}>
        <IconButton icon="settings" label="Settings" onPress={() => router.push('/settings')} />
        <IconButton
          icon="bell"
          label="Reminders"
          badge={attention.length}
          onPress={() => router.push('/reminders')}
        />
      </View>

      <View style={styles.brand}>
        <View style={styles.logo} accessible accessibilityRole="header" accessibilityLabel="GiftList">
          <GiftBox size={40} />
          <AppText maxFontSizeMultiplier={1.2} style={styles.wordmark}>
            Gift<AppText style={[styles.wordmark, { color: colors.pink }]}>List</AppText>
          </AppText>
        </View>
        <AppText variant="bodyMedium" color="textMuted" align="center">
          Find the perfect gift
        </AppText>
      </View>

      <SearchBar value={query} onChangeText={setQuery} placeholder="Search people, gifts, or events..." />

      {searching ? <SearchResults query={query} /> : <HomeSections />}
    </Screen>
  );
}

/* ---------------------------------------------------------------- Sections */

function HomeSections() {
  const { gifts } = useGifts();
  const today = useToday();

  const events = upcomingEvents(gifts, today);
  const attention = attentionItems(gifts, today);
  const ideas = sortByEvent(
    gifts.filter((gift) => gift.status !== 'given' && gift.eventDate >= today),
    today,
  );

  return (
    <View style={styles.sections}>
      {events.length > 0 ? <UpcomingCarousel events={events.slice(0, CAROUSEL_LIMIT)} /> : null}

      {attention.length > 0 ? (
        <View style={styles.group}>
          <AttentionCard item={attention[0]} />
          {attention.length > 1 ? (
            <Touchable
              onPress={() => router.push('/reminders')}
              accessibilityLabel={`${attention.length - 1} more need attention`}
              style={styles.moreLink}>
              <AppText variant="captionStrong" color="primaryText">
                {attention.length - 1} more need{attention.length === 2 ? 's' : ''} attention
              </AppText>
              <Icon name="chevron-right" size={16} color="primaryText" strokeWidth={2.6} />
            </Touchable>
          ) : null}
        </View>
      ) : null}

      <View style={styles.group}>
        <SectionHeader title="My Gift Ideas" actionLabel="See all" onAction={() => router.push('/gifts')} />
        {ideas.length > 0 ? (
          ideas.slice(0, HOME_GIFT_LIMIT).map((gift) => <GiftCard key={gift.id} gift={gift} today={today} />)
        ) : (
          <EmptyState
            title="No gift ideas yet"
            message="Save your first idea and GiftList will remind you when it is time to buy it."
            actionLabel="Add a gift idea"
            onAction={() => router.push('/gift/new')}
          />
        )}
      </View>

      <BudgetStrip />
      <PeopleRow />
      <InspirationBanner />
      <QuoteCard />
    </View>
  );
}

function BudgetStrip() {
  const { gifts } = useGifts();
  const { colors } = useTheme();
  const summary = summarizeBudget(gifts);
  const cells = [
    { label: 'Still to buy', value: formatRupiah(summary.toBuy) },
    { label: 'Spent', value: formatRupiah(summary.spent) },
  ];

  return (
    <Touchable
      pressedScale={0.985}
      onPress={() => router.push('/budget')}
      accessibilityLabel={`Budget. ${cells.map((cell) => `${cell.label} ${cell.value}`).join(', ')}`}
      style={[styles.strip, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={[styles.stripIcon, { backgroundColor: colors.primarySoft }]}>
        <Icon name="wallet" size={20} color="primaryText" />
      </View>
      {cells.map((cell) => (
        <View key={cell.label} style={styles.flex}>
          <AppText variant="caption" color="textMuted" numberOfLines={1}>
            {cell.label}
          </AppText>
          <AppText variant="bodyStrong" numberOfLines={1} adjustsFontSizeToFit>
            {cell.value}
          </AppText>
        </View>
      ))}
      <Icon name="chevron-right" size={20} color="textMuted" strokeWidth={2.6} />
    </Touchable>
  );
}

function PeopleRow() {
  const { gifts } = useGifts();
  const today = useToday();
  const people = listPeople(gifts, today);
  if (people.length === 0) return null;

  return (
    <View style={styles.group}>
      <SectionHeader title="People" />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.bleed}
        contentContainerStyle={styles.people}>
        {people.map((person) => (
          <PersonBubble key={person.key} person={person} />
        ))}
      </ScrollView>
    </View>
  );
}

function PersonBubble({ person }: { person: Person }) {
  const when = person.nextEvent ? countdownLabel(person.nextEvent.daysLeft) : 'No event';
  return (
    <Touchable
      pressedScale={0.94}
      onPress={() => router.push({ pathname: '/person/[name]', params: { name: person.name } })}
      accessibilityLabel={`${person.name}, ${when}`}
      style={styles.person}>
      <PersonAvatar name={person.name} size={58} />
      <AppText variant="captionStrong" numberOfLines={1}>
        {person.name}
      </AppText>
      <AppText variant="caption" color="textMuted" numberOfLines={1} style={styles.personWhen}>
        {when}
      </AppText>
    </Touchable>
  );
}

function InspirationBanner() {
  const { colors } = useTheme();
  return (
    <Touchable
      pressedScale={0.985}
      onPress={() => router.push('/inspiration')}
      accessibilityLabel="Need inspiration? Get ideas by person and budget"
      style={[styles.inspiration, { backgroundColor: colors.primarySoft }]}>
      <View style={[styles.inspirationIcon, { backgroundColor: colors.surface }]}>
        <Icon name="wand-sparkles" size={24} color="primaryText" />
      </View>
      <View style={styles.flex}>
        <AppText variant="subheading" color="onPrimarySoft">
          Need inspiration?
        </AppText>
        <AppText variant="caption" color="onPrimarySoft">
          Get ideas by person and budget
        </AppText>
      </View>
      <Icon name="arrow-right" size={22} color="onPrimarySoft" />
    </Touchable>
  );
}

function QuoteCard() {
  const { colors } = useTheme();
  const today = useToday();
  // A new quote every day.
  const index = Math.abs(daysBetween('2026-01-01', today)) % quotes.length;

  return (
    <View style={[styles.quote, { backgroundColor: colors.surfaceMuted }]}>
      <HeartArt size={50} color={colors.heart} />
      <AppText variant="bodyStrong" color="quote" style={styles.flex}>
        “{quotes[index]}”
      </AppText>
    </View>
  );
}

/* ------------------------------------------------------------------ Search */

function SearchResults({ query }: { query: string }) {
  const { gifts } = useGifts();
  const today = useToday();
  const text = query.trim();
  const matches = sortByEvent(searchGifts(gifts, query), today);
  const people = listPeople(gifts, today).filter((person) => person.key.includes(text.toLowerCase()));

  if (matches.length === 0) {
    return (
      <EmptyState
        title="Nothing found"
        message={`No person, gift or event matches "${text}".`}
        actionLabel={`Add "${text.slice(0, 18)}${text.length > 18 ? '...' : ''}"`}
        onAction={() => router.push({ pathname: '/gift/new', params: { name: text } })}
      />
    );
  }

  return (
    <View style={styles.sections}>
      {people.length > 0 ? (
        <View style={styles.group}>
          <SectionHeader title="People" />
          <View style={styles.peopleWrap}>
            {people.map((person) => (
              <PersonBubble key={person.key} person={person} />
            ))}
          </View>
        </View>
      ) : null}
      <View style={styles.group}>
        <SectionHeader title={`${matches.length} gift${matches.length === 1 ? '' : 's'}`} />
        {matches.map((gift) => (
          <GiftCard key={gift.id} gift={gift} today={today} />
        ))}
      </View>
    </View>
  );
}

/* -------------------------------------------------------------- Add button */

function AddButton() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  return (
    <Touchable
      pressedScale={0.92}
      onPress={() => router.push('/gift/new')}
      accessibilityLabel="Add a gift idea"
      style={[
        styles.fab,
        {
          bottom: Math.max(insets.bottom, spacing.lg) + spacing.xs,
          right: Math.max(0, (width - maxContentWidth) / 2) + spacing.xl - 4,
          backgroundColor: colors.primary,
          boxShadow: `0px 10px 22px ${colors.shadow}`,
        },
      ]}>
      <Icon name="plus" size={32} color="onPrimary" strokeWidth={2.2} />
    </Touchable>
  );
}

const FAB_SIZE = 64;

const styles = StyleSheet.create({
  flex: { flex: 1 },
  // Room to scroll the quote above the floating button, which covered it in the mockup.
  page: { gap: spacing.lg, paddingBottom: FAB_SIZE + spacing.xxl + spacing.xl },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: -spacing.sm },
  brand: { gap: spacing.xs, marginTop: -spacing.xl, paddingBottom: spacing.xs },
  logo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  wordmark: { fontFamily: fonts.bold, fontSize: 34, lineHeight: 42, letterSpacing: -0.8 },
  sections: { gap: spacing.xl },
  group: { gap: spacing.md },
  moreLink: { flexDirection: 'row', alignItems: 'center', alignSelf: 'center', gap: 2, minHeight: 36 },
  strip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.lg,
  },
  stripIcon: { width: 42, height: 42, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  bleed: { marginHorizontal: -spacing.xl },
  people: { paddingHorizontal: spacing.xl, gap: spacing.md },
  peopleWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  person: { width: 82, alignItems: 'center', gap: 2 },
  personWhen: { fontSize: 11.5, lineHeight: 15 },
  inspiration: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  inspirationIcon: { width: 48, height: 48, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  quote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl - 2,
  },
  fab: {
    position: 'absolute',
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: FAB_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
