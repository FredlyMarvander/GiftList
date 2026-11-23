import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AttentionCard } from '@/components/gift/attention-card';
import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { IconButton } from '@/components/ui/icon-button';
import type { IconName } from '@/components/ui/icon-data';
import { Screen } from '@/components/ui/screen';
import { ScreenHeader } from '@/components/ui/screen-header';
import { SectionHeader } from '@/components/ui/section-header';
import { Touchable } from '@/components/ui/touchable';
import { fonts, radius, spacing } from '@/constants/theme';
import { useToday } from '@/hooks/use-today';
import { formatDateTime, MONTHS } from '@/lib/dates';
import { sendPreview } from '@/lib/notifications';
import { attentionItems, planAllReminders, type PlannedReminder, type ReminderKind } from '@/lib/reminders';
import { useGifts } from '@/providers/gifts-provider';
import { useNotifications } from '@/providers/notification-provider';
import { useTheme } from '@/providers/theme-provider';
import { useToast } from '@/providers/toast-provider';
import type { Gift } from '@/types/gift';

const KIND_ICON: Record<ReminderKind, IconName> = {
  buy: 'shopping-bag',
  snooze: 'clock',
  again: 'bell-plus',
  'next-year': 'history',
};

const PREVIEW_SECONDS = 5;

export default function RemindersScreen() {
  const { gifts, settings } = useGifts();
  const today = useToday();
  const attention = attentionItems(gifts, today);
  const reminders = planAllReminders(gifts, settings, new Date());

  return (
    <Screen
      header={
        <ScreenHeader
          title="Reminders"
          right={<IconButton icon="settings" label="Reminder settings" onPress={() => router.push('/settings')} />}
        />
      }
      contentStyle={styles.page}>
      <PermissionCard />

      {attention.length > 0 ? (
        <View style={styles.group}>
          <SectionHeader title="Needs attention" />
          {attention.map((item) => (
            <AttentionCard key={item.gift.id} item={item} />
          ))}
        </View>
      ) : null}

      <View style={styles.group}>
        <SectionHeader title="Scheduled" />
        {reminders.length > 0 ? (
          reminders.map((reminder) => (
            <ReminderRow
              key={reminder.id}
              reminder={reminder}
              gift={gifts.find((gift) => gift.id === reminder.giftId)}
            />
          ))
        ) : (
          <AppText variant="body" color="textMuted">
            Nothing scheduled. Add a gift with an event date and a reminder will appear here.
          </AppText>
        )}
      </View>

      <PreviewCard reminders={reminders} />
    </Screen>
  );
}

function ReminderRow({ reminder, gift }: { reminder: PlannedReminder; gift: Gift | undefined }) {
  const { colors } = useTheme();
  return (
    <Touchable
      pressedScale={0.985}
      onPress={() => router.push({ pathname: '/gift/[id]', params: { id: reminder.giftId } })}
      accessibilityLabel={`${reminder.label}, ${gift?.name ?? ''}, ${formatDateTime(reminder.at)}`}
      style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={[styles.dateBlock, { backgroundColor: colors.hero }]}>
        <AppText color="rose" maxFontSizeMultiplier={1.1} style={styles.day}>
          {reminder.at.getDate()}
        </AppText>
        <AppText variant="small" color="rose" maxFontSizeMultiplier={1.1}>
          {MONTHS[reminder.at.getMonth()].slice(0, 3)}
        </AppText>
      </View>
      <View style={styles.flex}>
        <AppText variant="bodyStrong" numberOfLines={1}>
          {gift ? `${gift.name} for ${gift.recipient}` : 'Gift'}
        </AppText>
        <View style={styles.inline}>
          <Icon name={KIND_ICON[reminder.kind]} size={14} color="primaryText" />
          <AppText variant="caption" color="primaryText" numberOfLines={1} style={styles.flex}>
            {reminder.label}
          </AppText>
        </View>
        <AppText variant="caption" color="textMuted" numberOfLines={1}>
          {formatDateTime(reminder.at)}
        </AppText>
      </View>
      <Icon name="chevron-right" size={20} color="textMuted" strokeWidth={2.6} />
    </Touchable>
  );
}

function PermissionCard() {
  const { permission, enable } = useNotifications();
  const { colors } = useTheme();
  if (permission === 'granted' || permission === 'unknown') return null;

  const unsupported = permission === 'unsupported';
  return (
    <View style={[styles.permission, { backgroundColor: colors.primarySoft }]}>
      <Icon name={unsupported ? 'smartphone' : 'bell-off'} size={24} color="onPrimarySoft" />
      <View style={styles.flex}>
        <AppText variant="bodyStrong" color="onPrimarySoft">
          {unsupported ? 'Notifications work on your phone' : 'Notifications are off'}
        </AppText>
        <AppText variant="caption" color="onPrimarySoft">
          {unsupported
            ? 'Open GiftList on Android or iOS to receive them. The schedule below is the same.'
            : permission === 'denied'
              ? 'Allow them in the phone settings to get reminded one week before.'
              : 'Turn them on to get reminded one week before every event.'}
        </AppText>
        {unsupported ? null : (
          <Button
            compact
            label={permission === 'denied' ? 'Open settings' : 'Turn on notifications'}
            icon="bell-ring"
            onPress={enable}
            style={styles.permissionButton}
          />
        )}
      </View>
    </View>
  );
}

/** Nobody can wait a week to see a reminder, so this sends the real one in a few seconds. */
function PreviewCard({ reminders }: { reminders: PlannedReminder[] }) {
  const { permission, enable } = useNotifications();
  const toast = useToast();

  const buyReminders = reminders.filter((reminder) => reminder.kind === 'buy');
  const previews = [
    { label: 'Time to buy', reminder: buyReminders.find(({ daysBefore }) => daysBefore === 7) ?? buyReminders[0] },
    { label: 'Remind me again', reminder: reminders.find((reminder) => reminder.kind === 'again') },
  ].filter((preview) => preview.reminder !== undefined);

  if (previews.length === 0 || permission === 'unsupported') return null;

  const send = async (reminder: PlannedReminder | undefined) => {
    if (!reminder) return;
    if (permission !== 'granted' && !(await enable())) return;
    await sendPreview(reminder, PREVIEW_SECONDS);
    toast({ message: `Notification arrives in ${PREVIEW_SECONDS} seconds`, icon: 'send' });
  };

  return (
    <Card style={styles.group}>
      <View style={styles.inline}>
        <Icon name="send" size={18} color="primaryText" />
        <AppText variant="bodyStrong">Try a reminder now</AppText>
      </View>
      <AppText variant="caption" color="textMuted">
        Sends a scheduled reminder as a real notification, so you can see how it looks.
      </AppText>
      <View style={styles.previews}>
        {previews.map((preview) => (
          <Button
            key={preview.label}
            compact
            variant="soft"
            label={preview.label}
            accessibilityHint="Sends a notification in a few seconds"
            onPress={() => send(preview.reminder)}
            style={styles.preview}
          />
        ))}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  page: { gap: spacing.xl },
  group: { gap: spacing.md },
  inline: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  dateBlock: { width: 56, minHeight: 56, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  day: { fontFamily: fonts.bold, fontSize: 20, lineHeight: 24 },
  permission: { flexDirection: 'row', gap: spacing.md, borderRadius: radius.lg, padding: spacing.lg },
  permissionButton: { alignSelf: 'flex-start', marginTop: spacing.md },
  previews: { flexDirection: 'row', gap: spacing.sm },
  preview: { flex: 1, paddingHorizontal: spacing.sm },
});
