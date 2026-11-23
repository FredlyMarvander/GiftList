import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { FlatList, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/gift/empty-state';
import { GiftCard } from '@/components/gift/gift-card';
import { AppText } from '@/components/ui/app-text';
import { Chip } from '@/components/ui/chip';
import { IconButton } from '@/components/ui/icon-button';
import { OptionSheet } from '@/components/ui/option-sheet';
import { keyboardDismissMode } from '@/components/ui/screen';
import { ScreenHeader } from '@/components/ui/screen-header';
import { SearchBar } from '@/components/ui/search-bar';
import { STATUS_IDS, STATUSES, type GiftStatus } from '@/constants/options';
import { maxContentWidth, spacing } from '@/constants/theme';
import { useToday } from '@/hooks/use-today';
import { countByStatus, searchGifts, SORT_LABELS, sortGifts, type SortMode } from '@/lib/gift-queries';
import { useGifts } from '@/providers/gifts-provider';
import { useTheme } from '@/providers/theme-provider';

type Filter = GiftStatus | 'all';

const SORT_OPTIONS = (Object.keys(SORT_LABELS) as SortMode[]).map((mode) => ({
  value: mode,
  label: SORT_LABELS[mode],
  icon: ({ date: 'calendar', budget: 'wallet', name: 'tag' } as const)[mode],
}));

export default function AllGiftsScreen() {
  const params = useLocalSearchParams<{ status?: string }>();
  const { gifts } = useGifts();
  const { colors } = useTheme();
  const today = useToday();
  const insets = useSafeAreaInsets();

  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>(
    STATUS_IDS.find((status) => status === params.status) ?? 'all',
  );
  const [sort, setSort] = useState<SortMode>('date');
  const [sorting, setSorting] = useState(false);

  const found = searchGifts(gifts, query);
  const counts = countByStatus(found);
  const visible = sortGifts(filter === 'all' ? found : found.filter((gift) => gift.status === filter), sort, today);

  return (
    <View style={[styles.fill, { backgroundColor: colors.background }]}>
      <ScreenHeader
        title="My Gift Ideas"
        right={<IconButton icon="plus" label="Add a gift idea" size={26} onPress={() => router.push('/gift/new')} />}
      />
      <View style={styles.controls}>
        <SearchBar value={query} onChangeText={setQuery} placeholder="Search people, gifts, or events..." />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          accessibilityRole="radiogroup"
          style={styles.bleed}
          contentContainerStyle={styles.filters}>
          <Chip label={`All ${found.length}`} selected={filter === 'all'} onPress={() => setFilter('all')} />
          {STATUS_IDS.map((status) => (
            <Chip
              key={status}
              label={`${STATUSES[status].label} ${counts[status]}`}
              icon={STATUSES[status].icon}
              selected={filter === status}
              onPress={() => setFilter(status)}
            />
          ))}
        </ScrollView>
        <View style={styles.sortRow}>
          <AppText variant="caption" color="textMuted" accessibilityLiveRegion="polite">
            {visible.length} gift{visible.length === 1 ? '' : 's'}
          </AppText>
          <Chip label={SORT_LABELS[sort]} icon="arrow-up-down" role="button" onPress={() => setSorting(true)} />
        </View>
      </View>

      <FlatList
        data={visible}
        keyExtractor={(gift) => gift.id}
        renderItem={({ item }) => <GiftCard gift={item} today={today} />}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={keyboardDismissMode}
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + spacing.xxl }]}
        ListEmptyComponent={
          <EmptyState
            title={query || filter !== 'all' ? 'Nothing here' : 'No gift ideas yet'}
            message={
              query || filter !== 'all'
                ? 'Try another word or filter.'
                : 'Save your first idea and GiftList will remind you when it is time to buy it.'
            }
            actionLabel="Add a gift idea"
            onAction={() => router.push('/gift/new')}
          />
        }
      />

      <OptionSheet
        visible={sorting}
        title="Sort by"
        options={SORT_OPTIONS}
        value={sort}
        onSelect={setSort}
        onClose={() => setSorting(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  controls: {
    width: '100%',
    maxWidth: maxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xs,
    gap: spacing.md,
  },
  bleed: { marginHorizontal: -spacing.xl },
  filters: { paddingHorizontal: spacing.xl, gap: spacing.sm },
  sortRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  list: {
    flexGrow: 1,
    width: '100%',
    maxWidth: maxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    gap: spacing.md,
  },
});
