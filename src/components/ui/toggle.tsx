import { Platform, Switch } from 'react-native';

import { useTheme } from '@/providers/theme-provider';

type ToggleProps = { label: string; value: boolean; onChange: (value: boolean) => void };

/** react-native-web tints the active thumb teal unless told otherwise. */
const webThumb: object = Platform.OS === 'web' ? { activeThumbColor: '#FFFFFF' } : {};

export function Toggle({ label, value, onChange }: ToggleProps) {
  const { colors } = useTheme();
  return (
    <Switch
      accessibilityLabel={label}
      value={value}
      onValueChange={onChange}
      trackColor={{ false: colors.border, true: colors.primary }}
      ios_backgroundColor={colors.border}
      thumbColor="#FFFFFF"
      {...webThumb}
    />
  );
}
