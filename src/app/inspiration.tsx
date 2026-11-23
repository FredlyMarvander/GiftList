import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { EmptyState } from '@/components/gift/empty-state';
import { GiftIllustration } from '@/components/gift/gift-illustration';
import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';
import { Icon } from '@/components/ui/icon';
import { Screen } from '@/components/ui/screen';
import { ScreenHeader } from '@/components/ui/screen-header';
import { Touchable } from '@/components/ui/touchable';
import { CATEGORIES, GIFT_TYPE_IDS, type CategoryId, type GiftType } from '@/constants/options';
import { radius, spacing } from '@/constants/theme';
import inspirationData from '@/data/inspirations.json';
import { formatRupiah } from '@/lib/currency';
import { haptics } from '@/lib/haptics';
import { useTheme } from '@/providers/theme-provider';

type Inspiration = {
  id: string;
  name: string;
  category: CategoryId;
  type: GiftType;
  price: number;
  audience: string[];
  why: string;
};

/** Skips entries whose category or type was mistyped in the JSON file. */
const INSPIRATIONS = inspirationData.filter(
  (item): item is Inspiration =>
    Object.hasOwn(CATEGORIES, item.category) && GIFT_TYPE_IDS.some((type) => type === item.type),
);

const AUDIENCES = [
  { value: 'all', label: 'Anyone' },
  { value: 'mom', label: 'Mom' },
  { value: 'dad', label: 'Dad' },
  { value: 'partner', label: 'Partner' },
  { value: 'friend', label: 'Friend' },
  { value: 'sibling', label: 'Sibling' },
  { value: 'colleague', label: 'Colleague' },
  { value: 'kid', label: 'Kid' },
];

const BUDGETS = [
  { value: 'all', label: 'Any budget', min: 0, max: Infinity },
  { value: 'low', label: 'Under Rp100.000', min: 0, max: 99_999 },
  { value: 'mid', label: 'Rp100.000 to 250.000', min: 100_000, max: 250_000 },
  { value: 'high', label: 'Rp250.000 to 500.000', min: 250_000, max: 500_000 },
  { value: 'top', label: 'Over Rp500.000', min: 500_001, max: Infinity },
];

function addToList(item: Inspiration) {
  router.push({
    pathname: '/gift/new',
    params: { name: item.name, category: item.category, type: item.type, budget: String(item.price) },
  });
}

export default function InspirationScreen() {
  const [audience, setAudience] = useState('all');
  const [budgetId, setBudgetId] = useState('all');
  const [surpriseId, setSurpriseId] = useState<string | null>(null);

  const budget = BUDGETS.find((option) => option.value === budgetId) ?? BUDGETS[0];
  const matches = INSPIRATIONS.filter(
    (item) =>
      (audience === 'all' || item.audience.includes(audience)) && item.price >= budget.min && item.price <= budget.max,
  );
  const surprise = matches.find((item) => item.id === surpriseId);

  const surpriseMe = () => {
    const options = matches.filter((item) => item.id !== surpriseId);
    const pool = options.length > 0 ? options : matches;
    if (pool.length === 0) return;
    haptics.success();
    setSurpriseId(pool[Math.floor(Math.random() * pool.length)].id);
  };

  return (
    <Screen header={<ScreenHeader title="Inspiration" />} contentStyle={styles.page}>
      <FilterRow label="Who is it for?" options={AUDIENCES} value={audience} onChange={setAudience} />
      <FilterRow label="Budget" options={BUDGETS} value={budgetId} onChange={setBudgetId} />

      {matches.length > 0 ? (
        <>
          <Button
            label={surprise ? 'Surprise me again' : 'Surprise me'}
            icon={surprise ? 'shuffle' : 'wand-sparkles'}
            onPress={surpriseMe}
            testID="surprise-me"
          />
          {surprise ? <SurpriseCard item={surprise} /> : null}
          <AppText variant="caption" color="textMuted" accessibilityLiveRegion="polite">
            {matches.length} idea{matches.length === 1 ? '' : 's'}
          </AppText>
          <View style={styles.list}>
            {matches.map((item) => (
              <InspirationRow key={item.id} item={item} />
            ))}
          </View>
        </>
      ) : (
        <EmptyState title="No match yet" message="Try a different person or a wider budget." />
      )}
    </Screen>
  );
}

type FilterRowProps = {
  label: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
};

function FilterRow({ label, options, value, onChange }: FilterRowProps) {
  return (
    <View style={styles.filter}>
      <AppText variant="label" color="heading">
        {label}
      </AppText>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        accessibilityRole="radiogroup"
        accessibilityLabel={label}
        style={styles.bleed}
        contentContainerStyle={styles.chips}>
        {options.map((option) => (
          <Chip
            key={option.value}
            label={option.label}
            selected={option.value === value}
            onPress={() => onChange(option.value)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

function SurpriseCard({ item }: { item: Inspiration }) {
  const { colors } = useTheme();
  return (
    <View
      accessibilityLiveRegion="polite"
      style={[styles.surprise, { backgroundColor: colors.hero, borderColor: colors.roseSoft }]}>
      <GiftIllustration category={item.category} size={110} />
      <AppText variant="heading" align="center">
        {item.name}
      </AppText>
      <AppText variant="body" color="heroDate" align="center">
        {item.why}
      </AppText>
      <AppText variant="bodyStrong" color="rose">
        About {formatRupiah(item.price)}
      </AppText>
      <Button label="Add to my list" icon="plus" onPress={() => addToList(item)} style={styles.stretch} />
    </View>
  );
}

function InspirationRow({ item }: { item: Inspiration }) {
  const { colors } = useTheme();
  return (
    <Touchable
      pressedScale={0.985}
      onPress={() => addToList(item)}
      accessibilityLabel={`${item.name}, about ${formatRupiah(item.price)}. ${item.why} Add to my list`}
      style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <GiftIllustration category={item.category} size={62} />
      <View style={styles.flex}>
        <AppText variant="bodyStrong" numberOfLines={1}>
          {item.name}
        </AppText>
        <AppText variant="caption" color="textMuted" numberOfLines={2}>
          {item.why}
        </AppText>
        <AppText variant="captionStrong">{formatRupiah(item.price)}</AppText>
      </View>
      <View style={[styles.add, { backgroundColor: colors.primarySoft }]}>
        <Icon name="plus" size={20} color="primaryText" strokeWidth={2.4} />
      </View>
    </Touchable>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  page: { gap: spacing.lg },
  filter: { gap: spacing.sm },
  bleed: { marginHorizontal: -spacing.xl },
  chips: { paddingHorizontal: spacing.xl, gap: spacing.sm },
  list: { gap: spacing.md },
  surprise: {
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.xl,
    borderRadius: radius.xl,
    borderWidth: 1,
  },
  stretch: { alignSelf: 'stretch', marginTop: spacing.sm },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  add: { width: 40, height: 40, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
});
