import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Chip } from '@/components/ui/chip';
import { IconButton } from '@/components/ui/icon-button';
import { Touchable } from '@/components/ui/touchable';
import { fonts, radius, spacing } from '@/constants/theme';
import { useToday } from '@/hooks/use-today';
import { addDays, formatWeekdayDate, makeDateKey, monthGrid, MONTHS, splitDateKey, WEEKDAYS_SHORT } from '@/lib/dates';
import { haptics } from '@/lib/haptics';
import { useTheme } from '@/providers/theme-provider';
import type { DateKey } from '@/types/gift';

type CalendarSheetProps = {
  visible: boolean;
  title: string;
  value: DateKey | null;
  onSelect: (value: DateKey) => void;
  onClose: () => void;
  minDate?: DateKey;
  maxDate?: DateKey;
  /** Days that already have an event; shown with a dot. */
  markedDates?: ReadonlySet<DateKey>;
  shortcuts?: { label: string; value: DateKey }[];
};

export function CalendarSheet({ visible, title, onClose, ...body }: CalendarSheetProps) {
  return (
    <BottomSheet visible={visible} title={title} onClose={onClose}>
      <CalendarBody {...body} onClose={onClose} />
    </BottomSheet>
  );
}

function CalendarBody({
  value,
  onSelect,
  onClose,
  minDate,
  maxDate,
  markedDates,
  shortcuts = [],
}: Omit<CalendarSheetProps, 'visible' | 'title'>) {
  const { colors } = useTheme();
  const today = useToday();
  const [cursor, setCursor] = useState(() => {
    const { year, monthIndex } = splitDateKey(value ?? (minDate && minDate > today ? minDate : today));
    return { year, monthIndex };
  });

  const moveMonth = (amount: number) => {
    const next = new Date(cursor.year, cursor.monthIndex + amount, 1);
    setCursor({ year: next.getFullYear(), monthIndex: next.getMonth() });
  };

  const inRange = (key: DateKey) => (!minDate || key >= minDate) && (!maxDate || key <= maxDate);
  const choose = (key: DateKey) => {
    haptics.tap();
    onSelect(key);
    onClose();
  };

  const weeks = monthGrid(cursor.year, cursor.monthIndex).filter((week) => week.some((day) => day !== null));
  const previousDisabled = minDate !== undefined && makeDateKey(cursor.year, cursor.monthIndex, 1) <= minDate;
  const nextDisabled = maxDate !== undefined && makeDateKey(cursor.year, cursor.monthIndex, 31) >= maxDate;

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.monthRow}>
        <IconButton
          icon="chevron-left"
          label="Previous month"
          onPress={() => moveMonth(-1)}
          disabled={previousDisabled}
          background="surfaceMuted"
        />
        <AppText variant="subheading" accessibilityLiveRegion="polite">
          {MONTHS[cursor.monthIndex]} {cursor.year}
        </AppText>
        <IconButton
          icon="chevron-right"
          label="Next month"
          onPress={() => moveMonth(1)}
          disabled={nextDisabled}
          background="surfaceMuted"
        />
      </View>

      <View style={styles.week}>
        {WEEKDAYS_SHORT.map((weekday) => (
          <View key={weekday} style={styles.cell}>
            <AppText variant="small" color="textMuted">
              {weekday}
            </AppText>
          </View>
        ))}
      </View>

      {weeks.map((week, weekIndex) => (
        <View key={weekIndex} style={styles.week}>
          {week.map((day, dayIndex) => {
            if (day === null) return <View key={dayIndex} style={styles.cell} />;
            const key = makeDateKey(cursor.year, cursor.monthIndex, day);
            const selected = key === value;
            const isToday = key === today;
            const disabled = !inRange(key);
            const marked = markedDates?.has(key) ?? false;
            return (
              <View key={dayIndex} style={styles.cell}>
                <Touchable
                  disabled={disabled}
                  pressedScale={0.88}
                  onPress={() => choose(key)}
                  accessibilityLabel={`${formatWeekdayDate(key)}${marked ? ', has an event' : ''}`}
                  accessibilityState={{ selected, disabled }}
                  style={[
                    styles.day,
                    isToday && { borderColor: colors.primary },
                    selected && { backgroundColor: colors.primary, borderColor: colors.primary },
                  ]}>
                  <AppText
                    variant="bodyMedium"
                    maxFontSizeMultiplier={1.15}
                    color={selected ? 'onPrimary' : 'text'}
                    style={[disabled && styles.faded, (selected || isToday) && styles.strongDay]}>
                    {day}
                  </AppText>
                  {marked ? (
                    <View style={[styles.dot, { backgroundColor: selected ? colors.onPrimary : colors.rose }]} />
                  ) : null}
                </Touchable>
              </View>
            );
          })}
        </View>
      ))}

      {shortcuts.length > 0 ? (
        <View style={styles.shortcuts}>
          {shortcuts
            .filter((shortcut) => inRange(shortcut.value))
            .map((shortcut) => (
              <Chip
                key={shortcut.label}
                label={shortcut.label}
                role="button"
                selected={shortcut.value === value}
                onPress={() => choose(shortcut.value)}
              />
            ))}
        </View>
      ) : null}
    </ScrollView>
  );
}

/** Handy jumps for picking a future event date. */
export function futureShortcuts(today: DateKey) {
  return [
    { label: 'Tomorrow', value: addDays(today, 1) },
    { label: 'In 1 week', value: addDays(today, 7) },
    { label: 'In 2 weeks', value: addDays(today, 14) },
    { label: 'In 30 days', value: addDays(today, 30) },
  ];
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: spacing.xl, paddingBottom: spacing.sm, gap: 2 },
  monthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: spacing.sm,
  },
  week: { flexDirection: 'row' },
  cell: { flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: 30 },
  day: {
    width: 42,
    height: 42,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  strongDay: { fontFamily: fonts.bold },
  faded: { opacity: 0.35 },
  dot: { position: 'absolute', bottom: 4, width: 5, height: 5, borderRadius: 3 },
  shortcuts: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, paddingTop: spacing.md },
});
