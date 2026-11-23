import { ScrollView, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Icon } from '@/components/ui/icon';
import type { IconName } from '@/components/ui/icon-data';
import { Touchable } from '@/components/ui/touchable';
import { radius, spacing, type ColorToken } from '@/constants/theme';
import { haptics } from '@/lib/haptics';
import { useTheme } from '@/providers/theme-provider';

export type Option<T extends string> = {
  value: T;
  label: string;
  description?: string;
  icon?: IconName;
  iconColor?: ColorToken;
  iconBackground?: ColorToken;
};

type OptionSheetProps<T extends string> = {
  visible: boolean;
  title: string;
  options: Option<T>[];
  value: T | null;
  onSelect: (value: T) => void;
  onClose: () => void;
};

export function OptionSheet<T extends string>({
  visible,
  title,
  options,
  value,
  onSelect,
  onClose,
}: OptionSheetProps<T>) {
  const { colors } = useTheme();
  return (
    <BottomSheet visible={visible} title={title} onClose={onClose}>
      <ScrollView contentContainerStyle={styles.list} accessibilityRole="radiogroup">
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <Touchable
              key={option.value}
              pressedScale={0.985}
              accessibilityRole="radio"
              accessibilityLabel={option.description ? `${option.label}, ${option.description}` : option.label}
              accessibilityState={{ checked: selected }}
              onPress={() => {
                haptics.tap();
                onSelect(option.value);
                onClose();
              }}
              style={[
                styles.row,
                {
                  borderColor: selected ? colors.primary : colors.borderSoft,
                  backgroundColor: selected ? colors.surfaceMuted : colors.surface,
                },
              ]}>
              {option.icon ? (
                <View style={[styles.icon, { backgroundColor: colors[option.iconBackground ?? 'search'] }]}>
                  <Icon name={option.icon} size={20} color={option.iconColor ?? 'primaryText'} />
                </View>
              ) : null}
              <View style={styles.copy}>
                <AppText variant="bodyStrong">{option.label}</AppText>
                {option.description ? (
                  <AppText variant="caption" color="textMuted">
                    {option.description}
                  </AppText>
                ) : null}
              </View>
              {selected ? <Icon name="check" size={20} color="primaryText" strokeWidth={2.6} /> : null}
            </Touchable>
          );
        })}
      </ScrollView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  list: { paddingHorizontal: spacing.xl, paddingBottom: spacing.sm, gap: spacing.sm },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 54,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.md,
    borderWidth: 1.5,
  },
  icon: { width: 38, height: 38, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
  copy: { flex: 1 },
});
