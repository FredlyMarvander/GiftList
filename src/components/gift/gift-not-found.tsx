import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { EmptyState } from '@/components/gift/empty-state';
import { ScreenHeader } from '@/components/ui/screen-header';
import { spacing } from '@/constants/theme';
import { useTheme } from '@/providers/theme-provider';

export function GiftNotFound() {
  const { colors } = useTheme();
  return (
    <View style={[styles.page, { backgroundColor: colors.background }]}>
      <ScreenHeader title="Gift" />
      <View style={styles.content}>
        <EmptyState
          title="This gift is gone"
          message="It may have been deleted. Your other ideas are safe."
          actionLabel="Back to home"
          actionIcon="house"
          onAction={() => router.dismissTo('/')}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1 },
  content: { padding: spacing.xl },
});
