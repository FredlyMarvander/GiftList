import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Icon } from '@/components/ui/icon';
import { Touchable } from '@/components/ui/touchable';
import { spacing, touchTarget } from '@/constants/theme';

type SectionHeaderProps = {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function SectionHeader({ title, actionLabel, onAction }: SectionHeaderProps) {
  return (
    <View style={styles.row}>
      <AppText variant="heading" accessibilityRole="header" style={styles.title}>
        {title}
      </AppText>
      {actionLabel && onAction ? (
        <Touchable onPress={onAction} accessibilityLabel={`${actionLabel}, ${title}`} style={styles.action}>
          <AppText variant="bodyMedium" color="textMuted">
            {actionLabel}
          </AppText>
          <Icon name="chevron-right" size={18} color="textMuted" strokeWidth={2.6} />
        </Touchable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', minHeight: touchTarget },
  title: { flex: 1 },
  action: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, minHeight: touchTarget },
});
