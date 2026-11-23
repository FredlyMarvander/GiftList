import { StyleSheet, View } from 'react-native';

import { GiftBox } from '@/components/gift/gift-illustration';
import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import type { IconName } from '@/components/ui/icon-data';
import { spacing } from '@/constants/theme';

type EmptyStateProps = {
  title: string;
  message: string;
  actionLabel?: string;
  actionIcon?: IconName;
  onAction?: () => void;
};

export function EmptyState({ title, message, actionLabel, actionIcon = 'plus', onAction }: EmptyStateProps) {
  return (
    <View style={styles.wrapper}>
      <GiftBox size={84} />
      <AppText variant="heading" align="center">
        {title}
      </AppText>
      <AppText variant="body" color="textMuted" align="center">
        {message}
      </AppText>
      {actionLabel && onAction ? (
        <Button label={actionLabel} icon={actionIcon} onPress={onAction} style={styles.action} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xxl, paddingHorizontal: spacing.lg },
  action: { marginTop: spacing.md, alignSelf: 'stretch' },
});
