import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { EmptyState } from '@/components/gift/empty-state';
import { PersonAvatar } from '@/components/gift/person-avatar';
import { AppText } from '@/components/ui/app-text';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import type { IconName } from '@/components/ui/icon-data';
import { Screen } from '@/components/ui/screen';
import { ScreenHeader } from '@/components/ui/screen-header';
import { SectionHeader } from '@/components/ui/section-header';
import { Touchable } from '@/components/ui/touchable';
import { STATUS_IDS, STATUSES } from '@/constants/options';
import { fonts, radius, spacing, type ColorToken } from '@/constants/theme';
import { useToday } from '@/hooks/use-today';
import { formatRupiah } from '@/lib/currency';
import { countByStatus, listPeople, summarizeBudget } from '@/lib/gift-queries';
import { useGifts } from '@/providers/gifts-provider';
import { useTheme } from '@/providers/theme-provider';

export default function BudgetScreen() {
  const { gifts } = useGifts();
  const today = useToday();

  if (gifts.length === 0) {
    return (
      <Screen header={<ScreenHeader title="Budget" />}>
        <EmptyState
          title="No budget yet"
          message="Add a gift with a budget to see where the money goes."
          actionLabel="Add a gift idea"
          onAction={() => router.push('/gift/new')}
        />
      </Screen>
    );
  }

  const summary = summarizeBudget(gifts);
  const people = listPeople(gifts, today)
    .map((person) => ({ ...person, ...summarizeBudget(person.gifts) }))
    .filter((person) => person.total > 0)
    .sort((a, b) => b.total - a.total);
  const largest = people[0]?.total ?? 0;

  return (
    <Screen header={<ScreenHeader title="Budget" />} contentStyle={styles.page}>
      <Card style={styles.total}>
        <AppText variant="caption" color="textMuted">
          Total for all gifts
        </AppText>
        <AppText numberOfLines={1} adjustsFontSizeToFit accessibilityRole="header" style={styles.totalValue}>
          {formatRupiah(summary.total)}
        </AppText>
        <SplitBar
          spent={summary.spent}
          toBuy={summary.toBuy}
          scale={1}
          label={`Spent ${formatRupiah(summary.spent)}, still to buy ${formatRupiah(summary.toBuy)}`}
        />
        <LegendRow color="chartSpent" label={`Spent on ${plural(summary.boughtCount)}`} value={formatRupiah(summary.spent)} />
        <LegendRow color="chartToBuy" label={`Still to buy, ${plural(summary.toBuyCount)}`} value={formatRupiah(summary.toBuy)} />
      </Card>

      <SavedCard saved={summary.saved} boughtCount={summary.boughtCount} />
      <StatusTiles />

      {people.length > 0 ? (
        <View style={styles.group}>
          <SectionHeader title="By person" />
          <View style={styles.legend}>
            <Swatch color="chartSpent" label="Spent" />
            <Swatch color="chartToBuy" label="Still to buy" />
          </View>
          <Card style={styles.people}>
            {people.map((person) => (
              <Touchable
                key={person.key}
                pressedScale={0.985}
                onPress={() => router.push({ pathname: '/person/[name]', params: { name: person.name } })}
                accessibilityLabel={`${person.name}. Spent ${formatRupiah(person.spent)}, still to buy ${formatRupiah(person.toBuy)}`}
                style={styles.personRow}>
                <PersonAvatar name={person.name} size={40} />
                <View style={styles.flex}>
                  <View style={styles.between}>
                    <AppText variant="bodyStrong" numberOfLines={1} style={styles.flex}>
                      {person.name}
                    </AppText>
                    <AppText variant="captionStrong">{formatRupiah(person.total)}</AppText>
                  </View>
                  <SplitBar spent={person.spent} toBuy={person.toBuy} scale={person.total / largest} />
                  <AppText variant="caption" color="textMuted" numberOfLines={1} style={styles.breakdown}>
                    {[
                      person.spent > 0 ? `${formatRupiah(person.spent)} spent` : null,
                      person.toBuy > 0 ? `${formatRupiah(person.toBuy)} to buy` : null,
                    ]
                      .filter(Boolean)
                      .join(', ')}
                  </AppText>
                </View>
              </Touchable>
            ))}
          </Card>
        </View>
      ) : null}
    </Screen>
  );
}

const plural = (count: number) => `${count} gift${count === 1 ? '' : 's'}`;

/** Thin two-part bar. The amounts are always printed next to it, so color is never the only cue. */
function SplitBar({ spent, toBuy, scale, label }: { spent: number; toBuy: number; scale: number; label?: string }) {
  const { colors } = useTheme();
  return (
    <View
      accessible={label !== undefined}
      accessibilityLabel={label}
      style={[styles.bar, { width: `${Math.max(scale * 100, 4)}%` }]}>
      {spent > 0 ? <View style={[styles.segment, { flex: spent, backgroundColor: colors.chartSpent }]} /> : null}
      {toBuy > 0 ? <View style={[styles.segment, { flex: toBuy, backgroundColor: colors.chartToBuy }]} /> : null}
    </View>
  );
}

function Swatch({ color, label }: { color: ColorToken; label: string }) {
  const { colors } = useTheme();
  return (
    <View style={styles.inline}>
      <View style={[styles.swatch, { backgroundColor: colors[color] }]} />
      <AppText variant="caption" color="textMuted">
        {label}
      </AppText>
    </View>
  );
}

function LegendRow({ color, label, value }: { color: ColorToken; label: string; value: string }) {
  return (
    <View style={styles.between}>
      <Swatch color={color} label={label} />
      <AppText variant="bodyStrong">{value}</AppText>
    </View>
  );
}

function SavedCard({ saved, boughtCount }: { saved: number; boughtCount: number }) {
  const { colors } = useTheme();
  if (boughtCount === 0 || saved === 0) return null;
  const under = saved > 0;
  const tone: ColorToken = under ? 'success' : 'rose';
  const icon: IconName = under ? 'piggy-bank' : 'trending-up';

  return (
    <View
      style={[
        styles.saved,
        { backgroundColor: under ? colors.successSoft : colors.roseSoft },
      ]}>
      <Icon name={icon} size={26} color={tone} />
      <View style={styles.flex}>
        <AppText variant="bodyStrong" color={tone}>
          {under ? `You saved ${formatRupiah(saved)}` : `${formatRupiah(-saved)} over budget`}
        </AppText>
        <AppText variant="caption" color={tone}>
          Compared with the budgets of the gifts you bought
        </AppText>
      </View>
    </View>
  );
}

function StatusTiles() {
  const { gifts } = useGifts();
  const { colors } = useTheme();
  const counts = countByStatus(gifts);
  return (
    <View style={styles.tiles}>
      {STATUS_IDS.map((id) => {
        const { label, icon, bg, fg } = STATUSES[id];
        return (
          <Touchable
            key={id}
            onPress={() => router.push({ pathname: '/gifts', params: { status: id } })}
            accessibilityLabel={`${label}: ${counts[id]}`}
            style={[styles.tile, { backgroundColor: colors[bg] }]}>
            <Icon name={icon} size={18} color={fg} />
            <AppText color={fg} maxFontSizeMultiplier={1.2} style={styles.tileValue}>
              {counts[id]}
            </AppText>
            <AppText variant="small" color={fg} maxFontSizeMultiplier={1.1} numberOfLines={1}>
              {label}
            </AppText>
          </Touchable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  page: { gap: spacing.xl },
  group: { gap: spacing.md },
  total: { gap: spacing.md },
  totalValue: { fontFamily: fonts.bold, fontSize: 34, lineHeight: 42, letterSpacing: -0.8 },
  bar: { flexDirection: 'row', gap: 2, height: 10 },
  segment: { height: 10, borderRadius: 5, minWidth: 4 },
  between: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  inline: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  swatch: { width: 12, height: 12, borderRadius: 4 },
  legend: { flexDirection: 'row', gap: spacing.lg },
  people: { gap: spacing.lg },
  personRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  breakdown: { marginTop: 4 },
  saved: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, borderRadius: radius.lg, padding: spacing.lg },
  tiles: { flexDirection: 'row', gap: spacing.sm },
  tile: { flex: 1, alignItems: 'center', gap: 2, borderRadius: radius.md, paddingVertical: spacing.md },
  tileValue: { fontFamily: fonts.bold, fontSize: 20, lineHeight: 26 },
});
