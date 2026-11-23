import { useState, type ReactNode, type Ref } from 'react';
import { Platform, StyleSheet, TextInput, View, type TextInputInstance, type TextInputProps } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { CalendarSheet } from '@/components/ui/calendar-sheet';
import { Icon } from '@/components/ui/icon';
import type { IconName } from '@/components/ui/icon-data';
import { OptionSheet, type Option } from '@/components/ui/option-sheet';
import { Toggle } from '@/components/ui/toggle';
import { Touchable } from '@/components/ui/touchable';
import { fonts, radius, spacing, type ColorToken } from '@/constants/theme';
import { groupThousands, parseRupiah } from '@/lib/currency';
import { formatLongDate, formatSlashedDate } from '@/lib/dates';
import { useTheme } from '@/providers/theme-provider';
import type { DateKey } from '@/types/gift';

/* ----------------------------------------------------------------- Wrapper */

type FieldProps = {
  label: string;
  optional?: boolean;
  error?: string;
  helper?: ReactNode;
  children: ReactNode;
};

/** Label, control, error and helper. */
export function Field({ label, optional = false, error, helper, children }: FieldProps) {
  return (
    <View style={styles.field}>
      <View style={styles.labelRow}>
        <AppText variant="label" color="heading">
          {label}
        </AppText>
        {optional ? (
          <AppText variant="caption" color="textMuted">
            Optional
          </AppText>
        ) : null}
      </View>
      {children}
      {error ? (
        <View style={styles.errorRow} accessibilityLiveRegion="polite">
          <Icon name="circle-alert" size={15} color="error" />
          <AppText variant="caption" color="error" style={styles.flex}>
            {error}
          </AppText>
        </View>
      ) : null}
      {/* Suggestions stay useful while there is an error; a plain hint would only repeat it. */}
      {typeof helper !== 'string' ? (
        helper
      ) : error ? null : (
        <AppText variant="caption" color="textMuted">
          {helper}
        </AppText>
      )}
    </View>
  );
}

/** The field border already shows focus, so the browser's own ring is not needed. */
export const hideWebOutline: object = Platform.OS === 'web' ? { outlineStyle: 'none' } : {};

function useFieldColors(focused: boolean, error?: string) {
  const { colors } = useTheme();
  return {
    backgroundColor: colors.surface,
    borderColor: error ? colors.error : focused ? colors.primary : colors.fieldBorder,
  };
}

/* -------------------------------------------------------------------- Text */

type TextFieldProps = Omit<TextInputProps, 'style' | 'ref'> & {
  label: string;
  optional?: boolean;
  error?: string;
  helper?: ReactNode;
  prefix?: string;
  ref?: Ref<TextInputInstance>;
};

export function TextField({
  label,
  optional,
  error,
  helper,
  prefix,
  multiline = false,
  onFocus,
  onBlur,
  ref,
  ...input
}: TextFieldProps) {
  const { colors, scheme } = useTheme();
  const [focused, setFocused] = useState(false);
  const frame = useFieldColors(focused, error);

  return (
    <Field label={label} optional={optional} error={error} helper={helper}>
      <View style={[styles.control, multiline && styles.multiline, frame]}>
        {prefix ? (
          <AppText variant="body" color={input.value ? 'heading' : 'placeholder'} style={styles.prefix}>
            {prefix}
          </AppText>
        ) : null}
        <TextInput
          ref={ref}
          accessibilityLabel={label}
          aria-invalid={error !== undefined}
          placeholderTextColor={colors.placeholder}
          selectionColor={colors.primary}
          keyboardAppearance={scheme}
          maxFontSizeMultiplier={1.4}
          multiline={multiline}
          {...input}
          onFocus={(event) => {
            setFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            onBlur?.(event);
          }}
          style={[styles.input, { color: colors.heading }, multiline && styles.inputMultiline, hideWebOutline]}
        />
      </View>
    </Field>
  );
}

/* ------------------------------------------------------------------- Money */

type MoneyFieldProps = {
  label: string;
  amount: number;
  onChangeAmount: (amount: number) => void;
  optional?: boolean;
  error?: string;
  helper?: ReactNode;
  testID?: string;
};

export function MoneyField({ label, amount, onChangeAmount, ...rest }: MoneyFieldProps) {
  return (
    <TextField
      {...rest}
      label={label}
      prefix="Rp"
      placeholder=" ..."
      inputMode="numeric"
      keyboardType="number-pad"
      returnKeyType="done"
      value={amount > 0 ? groupThousands(amount) : ''}
      onChangeText={(text) => onChangeAmount(parseRupiah(text))}
    />
  );
}

/* ------------------------------------------------------------------ Select */

type SelectFieldProps<T extends string> = {
  label: string;
  value: T;
  options: Option<T>[];
  onChange: (value: T) => void;
  iconColor?: ColorToken;
  helper?: ReactNode;
  sheetTitle?: string;
};

export function SelectField<T extends string>({
  label,
  value,
  options,
  onChange,
  iconColor,
  helper,
  sheetTitle,
}: SelectFieldProps<T>) {
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.value === value);

  return (
    <Field label={label} helper={helper}>
      <PickerButton
        label={label}
        text={selected?.label ?? ''}
        icon={selected?.icon}
        iconColor={iconColor ?? selected?.iconColor}
        trailing="chevron-down"
        onPress={() => setOpen(true)}
      />
      <OptionSheet
        visible={open}
        title={sheetTitle ?? label}
        options={options}
        value={value}
        onSelect={onChange}
        onClose={() => setOpen(false)}
      />
    </Field>
  );
}

/* -------------------------------------------------------------------- Date */

type DateFieldProps = {
  label: string;
  value: DateKey | null;
  onChange: (value: DateKey) => void;
  placeholder?: string;
  error?: string;
  helper?: ReactNode;
  minDate?: DateKey;
  maxDate?: DateKey;
  markedDates?: ReadonlySet<DateKey>;
  shortcuts?: { label: string; value: DateKey }[];
};

export function DateField({
  label,
  value,
  onChange,
  placeholder = 'DD / MM / YYYY',
  error,
  helper,
  ...calendar
}: DateFieldProps) {
  const [open, setOpen] = useState(false);
  return (
    <Field label={label} error={error} helper={helper}>
      <PickerButton
        label={label}
        text={value ? formatSlashedDate(value) : placeholder}
        spokenValue={value ? formatLongDate(value) : 'Not set'}
        muted={value === null}
        icon="calendar"
        error={error}
        onPress={() => setOpen(true)}
      />
      <CalendarSheet
        visible={open}
        title={label}
        value={value}
        onSelect={onChange}
        onClose={() => setOpen(false)}
        {...calendar}
      />
    </Field>
  );
}

type PickerButtonProps = {
  label: string;
  text: string;
  spokenValue?: string;
  icon?: IconName;
  iconColor?: ColorToken;
  trailing?: IconName;
  muted?: boolean;
  error?: string;
  onPress: () => void;
};

function PickerButton({
  label,
  text,
  spokenValue,
  icon,
  iconColor = 'heading',
  trailing,
  muted = false,
  error,
  onPress,
}: PickerButtonProps) {
  const frame = useFieldColors(false, error);
  return (
    <Touchable
      pressedScale={0.985}
      onPress={onPress}
      accessibilityLabel={label}
      accessibilityValue={{ text: spokenValue ?? text }}
      style={[styles.control, styles.picker, frame]}>
      {icon ? <Icon name={icon} size={21} color={iconColor} /> : null}
      <AppText variant="body" color={muted ? 'placeholder' : 'heading'} numberOfLines={1} style={styles.pickerText}>
        {text}
      </AppText>
      {trailing ? <Icon name={trailing} size={20} color="heading" strokeWidth={2.4} /> : null}
    </Touchable>
  );
}

/* ------------------------------------------------------------------ Switch */

type SwitchRowProps = {
  label: string;
  description?: string;
  icon?: IconName;
  value: boolean;
  onChange: (value: boolean) => void;
};

export function SwitchRow({ label, description, icon, value, onChange }: SwitchRowProps) {
  const { colors } = useTheme();
  return (
    <View style={styles.switchRow}>
      {icon ? (
        <View style={[styles.switchIcon, { backgroundColor: colors.primarySoft }]}>
          <Icon name={icon} size={19} color="primaryText" />
        </View>
      ) : null}
      <View style={styles.flex}>
        <AppText variant="bodyStrong" color="heading">
          {label}
        </AppText>
        {description ? (
          <AppText variant="caption" color="textMuted">
            {description}
          </AppText>
        ) : null}
      </View>
      <Toggle label={label} value={value} onChange={onChange} />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  field: { gap: spacing.sm },
  labelRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  errorRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  control: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 50,
    borderRadius: radius.md - 2,
    borderWidth: 1.5,
    paddingHorizontal: spacing.lg,
  },
  multiline: { minHeight: 104, alignItems: 'flex-start', paddingVertical: spacing.sm },
  prefix: { fontSize: 16 },
  input: { flex: 1, alignSelf: 'stretch', fontFamily: fonts.regular, fontSize: 16, paddingVertical: 10 },
  inputMultiline: { minHeight: 84, textAlignVertical: 'top', paddingVertical: 6, lineHeight: 22 },
  picker: { gap: spacing.md },
  pickerText: { flex: 1, fontSize: 16 },
  switchRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, minHeight: 48 },
  switchIcon: { width: 38, height: 38, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
});
