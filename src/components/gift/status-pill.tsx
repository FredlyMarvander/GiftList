import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { STATUSES, type GiftStatus } from '@/constants/options';
import { radius, spacing } from '@/constants/theme';
import { useTheme } from '@/providers/theme-provider';

export function StatusPill({ status }: { status: GiftStatus }) {
  const { colors } = useTheme();
  const { label, bg, fg } = STATUSES[status];
  return (
    <View style={[styles.pill, { backgroundColor: colors[bg] }]}>
      <AppText variant="small" color={fg} maxFontSizeMultiplier={1.2}>
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: { alignSelf: 'flex-end', borderRadius: radius.pill, paddingHorizontal: spacing.md, paddingVertical: 4 },
});
