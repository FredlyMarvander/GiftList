import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Chip } from '@/components/ui/chip';
import { DateField, Field, SelectField, SwitchRow, TextField } from '@/components/ui/fields';
import { Icon } from '@/components/ui/icon';
import { REMIND_AGAIN_PRESET_IDS, REMIND_AGAIN_PRESETS, REMINDER_TIMES } from '@/constants/options';
import { radius, spacing } from '@/constants/theme';
import { useToday } from '@/hooks/use-today';
import { DEFAULT_REMIND_AGAIN_TIME } from '@/lib/app-data';
import { addDays, atTime, formatDateTime } from '@/lib/dates';
import { remindAgainDay } from '@/lib/reminders';
import { useTheme } from '@/providers/theme-provider';
import type { DateKey, RemindAgain } from '@/types/gift';

/** Starts with the closest preset that is still in the future. */
export function defaultRemindAgain(eventDate: DateKey, today: DateKey): RemindAgain {
  const preset = eventDate > today ? 'day_before' : 'on_day';
  return {
    preset: addDays(eventDate, -1) > today ? preset : 'on_day',
    customDate: null,
    time: DEFAULT_REMIND_AGAIN_TIME,
    note: '',
  };
}

export function timeOptions(current: string) {
  const times = REMINDER_TIMES.includes(current) ? REMINDER_TIMES : [...REMINDER_TIMES, current].sort();
  return times.map((time) => ({ value: time, label: time, icon: 'clock' as const }));
}

/** A reminder set for a moment that already passed would never fire. */
export function remindAgainError(value: RemindAgain | null, eventDate: DateKey): string | undefined {
  if (!value) return undefined;
  return atTime(remindAgainDay(value, eventDate), value.time) <= new Date()
    ? 'That moment has already passed. Pick a later date or time.'
    : undefined;
}

type RemindAgainFieldsProps = {
  value: RemindAgain | null;
  onChange: (value: RemindAgain | null) => void;
  eventDate: DateKey;
  error?: string;
};

/** The field that appears once a gift is bought, so it is not forgotten on the day. */
export function RemindAgainFields({ value, onChange, eventDate, error }: RemindAgainFieldsProps) {
  const { colors } = useTheme();
  const today = useToday();

  return (
    <View style={[styles.box, { backgroundColor: colors.surfaceMuted, borderColor: colors.borderSoft }]}>
      <SwitchRow
        icon="bell-plus"
        label="Remind me again"
        description="So the gift is wrapped and handed over on time"
        value={value !== null}
        onChange={(enabled) => onChange(enabled ? defaultRemindAgain(eventDate, today) : null)}
      />

      {value ? (
        <>
          <Field label="When" error={error}>
            <View style={styles.chips} accessibilityRole="radiogroup">
              {REMIND_AGAIN_PRESET_IDS.map((preset) => {
                const { label, daysBefore } = REMIND_AGAIN_PRESETS[preset];
                const passed = daysBefore !== null && addDays(eventDate, -daysBefore) < today;
                return (
                  <Chip
                    key={preset}
                    label={label}
                    icon={preset === 'custom' ? 'calendar' : undefined}
                    selected={value.preset === preset}
                    disabled={passed}
                    onPress={() =>
                      onChange({
                        ...value,
                        preset,
                        customDate:
                          preset === 'custom' ? (value.customDate ?? (eventDate >= today ? eventDate : today)) : value.customDate,
                      })
                    }
                  />
                );
              })}
            </View>
          </Field>

          {value.preset === 'custom' ? (
            <DateField
              label="Reminder date"
              value={value.customDate}
              onChange={(customDate) => onChange({ ...value, customDate })}
              minDate={today}
            />
          ) : null}

          <SelectField
            label="Time"
            value={value.time}
            options={timeOptions(value.time)}
            onChange={(time) => onChange({ ...value, time })}
          />

          <TextField
            label="Reminder note"
            optional
            value={value.note}
            onChangeText={(note) => onChange({ ...value, note })}
            placeholder="E.g. Wrap it and write a card"
            maxLength={120}
          />

          {error ? null : (
            <View style={styles.summary}>
              <Icon name="bell-ring" size={16} color="primaryText" />
              <AppText variant="caption" color="primaryText" style={styles.flex}>
                {formatDateTime(atTime(remindAgainDay(value, eventDate), value.time))}
              </AppText>
            </View>
          )}
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  box: { borderRadius: radius.lg, borderWidth: 1, padding: spacing.lg, gap: spacing.lg },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  summary: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
});
