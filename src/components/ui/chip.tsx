import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Icon } from '@/components/ui/icon';
import type { IconName } from '@/components/ui/icon-data';
import { Touchable } from '@/components/ui/touchable';
import { radius, spacing } from '@/constants/theme';
import { haptics } from '@/lib/haptics';
import { useTheme } from '@/providers/theme-provider';

type ChipProps = {
  label: string;
  selected?: boolean;
  onPress: () => void;
  icon?: IconName;
  disabled?: boolean;
  /** `radio` for pick-one groups, `checkbox` when several can be on. */
  role?: 'radio' | 'checkbox' | 'button';
  style?: StyleProp<ViewStyle>;
};

export function Chip({ label, selected = false, onPress, icon, disabled = false, role = 'radio', style }: ChipProps) {
  const { colors } = useTheme();
  return (
    <Touchable
      onPress={() => {
        haptics.tap();
        onPress();
      }}
      disabled={disabled}
      accessibilityRole={role}
      accessibilityLabel={label}
      accessibilityState={role === 'button' ? { disabled } : { checked: selected, disabled }}
      hitSlop={{ top: 4, bottom: 4 }}
      style={[
        styles.chip,
        {
          backgroundColor: selected ? colors.primary : colors.surface,
          borderColor: selected ? colors.primary : colors.fieldBorder,
        },
        disabled && styles.disabled,
        style,
      ]}>
      {icon ? <Icon name={icon} size={16} color={selected ? 'onPrimary' : 'primaryText'} /> : null}
      <AppText variant="captionStrong" color={selected ? 'onPrimary' : 'text'}>
        {label}
      </AppText>
    </Touchable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: 38,
    paddingHorizontal: spacing.md + 2,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  disabled: { opacity: 0.45 },
});
