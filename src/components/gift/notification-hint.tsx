import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Icon } from '@/components/ui/icon';
import { Touchable } from '@/components/ui/touchable';
import { spacing } from '@/constants/theme';
import { useNotifications } from '@/providers/notification-provider';

/** Warns that a reminder is set but the phone will not show it. */
export function NotificationHint() {
  const { permission, enable } = useNotifications();
  if (permission !== 'undetermined' && permission !== 'denied') return null;

  return (
    <View style={styles.row}>
      <Icon name="bell-off" size={15} color="warning" />
      <AppText variant="caption" color="warning" style={styles.text}>
        Notifications are off
      </AppText>
      <Touchable onPress={enable} accessibilityLabel="Turn on notifications" style={styles.action}>
        <AppText variant="captionStrong" color="primaryText">
          Turn on
        </AppText>
      </Touchable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  text: { flex: 1 },
  action: { minHeight: 36, minWidth: 44, alignItems: 'flex-end', justifyContent: 'center' },
});
