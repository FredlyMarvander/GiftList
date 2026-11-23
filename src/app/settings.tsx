import Constants from 'expo-constants';
import { StyleSheet, View } from 'react-native';

import { timeOptions } from '@/components/form/remind-again-fields';
import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';
import { Field, SelectField } from '@/components/ui/fields';
import { Screen } from '@/components/ui/screen';
import { ScreenHeader } from '@/components/ui/screen-header';
import { SectionHeader } from '@/components/ui/section-header';
import { spacing } from '@/constants/theme';
import { useConfirm } from '@/providers/confirm-provider';
import { useGifts } from '@/providers/gifts-provider';
import { useNotifications } from '@/providers/notification-provider';
import { useToast } from '@/providers/toast-provider';
import type { ThemePreference } from '@/types/gift';

const THEMES: { value: ThemePreference; label: string; icon: 'smartphone' | 'sun' | 'moon' }[] = [
  { value: 'system', label: 'System', icon: 'smartphone' },
  { value: 'light', label: 'Light', icon: 'sun' },
  { value: 'dark', label: 'Dark', icon: 'moon' },
];

const PERMISSION_TEXT = {
  unknown: 'Checking...',
  undetermined: 'Not turned on yet',
  granted: 'On',
  denied: 'Blocked in the phone settings',
  unsupported: 'Only available on the phone app',
};

export default function SettingsScreen() {
  const { settings, updateSettings, resetDemoData } = useGifts();
  const { permission, enable } = useNotifications();
  const confirm = useConfirm();
  const toast = useToast();

  const reset = async () => {
    const agreed = await confirm({
      title: 'Reset the demo data?',
      message: 'Your own gifts and settings will be replaced by the sample list.',
      confirmLabel: 'Reset',
      icon: 'rotate-ccw',
      destructive: true,
    });
    if (!agreed) return;
    resetDemoData();
    toast({ message: 'Demo data restored', icon: 'circle-check' });
  };

  return (
    <Screen header={<ScreenHeader title="Settings" />} contentStyle={styles.page}>
      <View style={styles.group}>
        <SectionHeader title="Reminders" />
        <Field label="Notifications" helper={PERMISSION_TEXT[permission]}>
          {permission === 'undetermined' || permission === 'denied' ? (
            <Button
              compact
              variant="soft"
              icon="bell-ring"
              label={permission === 'denied' ? 'Open settings' : 'Turn on notifications'}
              onPress={enable}
            />
          ) : null}
        </Field>
        <SelectField
          label="Reminder time"
          value={settings.reminderTime}
          options={timeOptions(settings.reminderTime)}
          onChange={(reminderTime) => updateSettings({ reminderTime })}
          helper="When buy reminders arrive, one week before the event by default."
        />
      </View>

      <View style={styles.group}>
        <SectionHeader title="Appearance" />
        <View style={styles.chips} accessibilityRole="radiogroup">
          {THEMES.map((theme) => (
            <Chip
              key={theme.value}
              label={theme.label}
              icon={theme.icon}
              selected={settings.theme === theme.value}
              onPress={() => updateSettings({ theme: theme.value })}
            />
          ))}
        </View>
      </View>

      <View style={styles.group}>
        <SectionHeader title="Data" />
        <AppText variant="caption" color="textMuted">
          Everything is stored on this device only. Resetting brings back the sample gifts with fresh dates.
        </AppText>
        <Button label="Reset demo data" icon="rotate-ccw" variant="danger" onPress={reset} />
      </View>

      <AppText variant="caption" color="textMuted" align="center">
        GiftList {Constants.expoConfig?.version ?? ''}
      </AppText>
    </Screen>
  );
}

const styles = StyleSheet.create({
  page: { gap: spacing.xl },
  group: { gap: spacing.lg },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
});
