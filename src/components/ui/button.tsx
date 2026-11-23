import { ActivityIndicator, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Icon } from '@/components/ui/icon';
import type { IconName } from '@/components/ui/icon-data';
import { Touchable } from '@/components/ui/touchable';
import { radius, spacing, type ColorToken } from '@/constants/theme';
import { useTheme } from '@/providers/theme-provider';

type ButtonVariant = 'primary' | 'soft' | 'danger' | 'success' | 'plain';

const variants: Record<ButtonVariant, { bg: ColorToken | null; fg: ColorToken; border: ColorToken | null }> = {
  primary: { bg: 'primary', fg: 'onPrimary', border: null },
  soft: { bg: 'primarySoft', fg: 'onPrimarySoft', border: 'primaryBorder' },
  danger: { bg: 'dangerSoft', fg: 'danger', border: 'dangerBorder' },
  success: { bg: 'successSoft', fg: 'success', border: 'successBorder' },
  plain: { bg: null, fg: 'primaryText', border: null },
};

type ButtonProps = {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  icon?: IconName;
  loading?: boolean;
  disabled?: boolean;
  compact?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityHint?: string;
  testID?: string;
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  icon,
  loading = false,
  disabled = false,
  compact = false,
  style,
  accessibilityHint,
  testID,
}: ButtonProps) {
  const { colors } = useTheme();
  const { bg, fg, border } = variants[variant];
  const blocked = disabled || loading;

  return (
    <Touchable
      onPress={onPress}
      disabled={blocked}
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: blocked, busy: loading }}
      testID={testID}
      style={[
        styles.base,
        compact ? styles.compact : styles.regular,
        bg && { backgroundColor: colors[bg] },
        border && { borderWidth: 1, borderColor: colors[border] },
        disabled && styles.disabled,
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={colors[fg]} />
      ) : (
        <>
          {icon ? <Icon name={icon} size={compact ? 17 : 20} color={fg} /> : null}
          <AppText variant={compact ? 'captionStrong' : 'subheading'} color={fg} numberOfLines={1} style={styles.label}>
            {label}
          </AppText>
        </>
      )}
    </Touchable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderRadius: radius.md,
  },
  regular: { minHeight: 54, paddingHorizontal: spacing.lg },
  compact: { minHeight: 44, paddingHorizontal: spacing.md + 2, borderRadius: radius.sm + 2 },
  disabled: { opacity: 0.5 },
  label: { flexShrink: 1 },
});
