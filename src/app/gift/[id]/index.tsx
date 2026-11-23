import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';

import { BudgetDifference } from '@/components/form/purchase-fields';
import { GiftArt } from '@/components/gift/gift-art';
import { GiftNotFound } from '@/components/gift/gift-not-found';
import { LinkedText } from '@/components/gift/linked-text';
import { NotificationHint } from '@/components/gift/notification-hint';
import { StatusTracker } from '@/components/gift/status-tracker';
import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { IconButton } from '@/components/ui/icon-button';
import type { IconName } from '@/components/ui/icon-data';
import { OptionSheet } from '@/components/ui/option-sheet';
import { Screen } from '@/components/ui/screen';
import { goBack, ScreenHeader } from '@/components/ui/screen-header';
import { Toggle } from '@/components/ui/toggle';
import { Touchable } from '@/components/ui/touchable';
import {
  BUY_SOON_WINDOW_DAYS,
  CATEGORIES,
  DEFAULT_BUY_REMINDER_DAYS,
  GIFT_TYPES,
  OCCASIONS,
  STATUS_IDS,
  STATUSES,
} from '@/constants/options';
import { fonts, radius, spacing } from '@/constants/theme';
import { useGiftActions } from '@/hooks/use-gift-actions';
import { useToday } from '@/hooks/use-today';
import { formatRupiah } from '@/lib/currency';
import { atTime, countdownLabel, daysBetween, formatDateTime, formatLongDate, leadLabel } from '@/lib/dates';
import { buyReminderTimes, needsBuying, nextYearlyDate, remindAgainDay } from '@/lib/reminders';
import { shareText } from '@/lib/share';
import { useGift, useGifts } from '@/providers/gifts-provider';
import { useNotifications } from '@/providers/notification-provider';
import { useTheme } from '@/providers/theme-provider';
import { useToast } from '@/providers/toast-provider';
import type { Gift } from '@/types/gift';

export default function GiftDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const live = useGift(id);

  // Keep showing the last version while the screen animates away after a delete.
  const [last, setLast] = useState(live);
  if (live && live !== last) setLast(live);

  const gift = live ?? last;
  return gift ? <GiftDetail gift={gift} /> : <GiftNotFound />;
}

function GiftDetail({ gift }: { gift: Gift }) {
  const today = useToday();
  const { colors } = useTheme();
  const { changeStatus, deleteGift, openBoughtForm, markGiven } = useGiftActions();
  const toast = useToast();
  const [choosingStatus, setChoosingStatus] = useState(false);

  const daysLeft = daysBetween(today, gift.eventDate);
  const status = STATUSES[gift.status];
  const waiting = needsBuying(gift);
  const urgent = waiting && daysLeft >= 0 && daysLeft <= BUY_SOON_WINDOW_DAYS;

  const share = async () => {
    const budget = gift.budget > 0 ? `\nBudget: ${formatRupiah(gift.budget)}` : '';
    const notes = gift.notes ? `\nNotes: ${gift.notes}` : '';
    const result = await shareText(
      `Gift idea for ${gift.recipient}: ${gift.name}\n${OCCASIONS[gift.occasion].label}: ${formatLongDate(gift.eventDate)}${budget}${notes}`,
    );
    if (result === 'copied') toast({ message: 'Copied to clipboard', icon: 'circle-check' });
    if (result === 'failed') toast({ message: 'Could not share this idea', icon: 'circle-alert' });
  };

  const remove = async () => {
    if (await deleteGift(gift)) goBack();
  };

  return (
    <Screen
      header={
        <ScreenHeader
          title="Gift Detail"
          right={<IconButton icon="share-2" label="Share this idea" color="heading" onPress={share} />}
        />
      }
      contentStyle={styles.page}>
      <View style={styles.hero}>
        <GiftArt gift={gift} size={170} />
        <AppText align="center" accessibilityRole="header" style={styles.name}>
          {gift.name}
        </AppText>
        <Touchable
          onPress={() => router.push({ pathname: '/person/[name]', params: { name: gift.recipient } })}
          accessibilityLabel={`For ${gift.recipient}. Open their page`}
          style={styles.person}>
          <AppText variant="subheading" style={styles.personText}>
            For {gift.recipient}
          </AppText>
          <Icon name="chevron-right" size={18} color="text" strokeWidth={2.4} />
        </Touchable>
        <View style={styles.date}>
          <Icon name="calendar" size={20} />
          <AppText variant="subheading" style={styles.personText}>
            {formatLongDate(gift.eventDate)}
          </AppText>
        </View>
        <View style={styles.tags}>
          <Tag icon={OCCASIONS[gift.occasion].icon} label={OCCASIONS[gift.occasion].label} />
          <Tag icon={urgent ? 'bell-ring' : daysLeft < 0 ? 'history' : 'hourglass'} label={countdownLabel(daysLeft)} highlight={urgent} />
        </View>
      </View>

      <Card style={styles.overview}>
        <View style={styles.split}>
          <View style={styles.flex}>
            <View style={styles.inline}>
              <Icon name="wallet" size={18} color="textMuted" />
              <AppText variant="caption" color="textMuted">
                Budget
              </AppText>
            </View>
            <AppText numberOfLines={1} adjustsFontSizeToFit style={styles.budget}>
              {gift.budget > 0 ? formatRupiah(gift.budget) : 'Not set'}
            </AppText>
          </View>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <Touchable
            onPress={() => setChoosingStatus(true)}
            accessibilityLabel={`Status: ${status.label}. Change`}
            style={[styles.statusButton, { backgroundColor: colors[status.bg] }]}>
            <Icon name={status.icon} size={20} color={status.fg} />
            <AppText variant="subheading" color={status.fg}>
              {status.label}
            </AppText>
            <Icon name="chevron-down" size={16} color={status.fg} strokeWidth={2.6} />
          </Touchable>
        </View>
        <View style={[styles.rule, { backgroundColor: colors.borderSoft }]} />
        <StatusTracker status={gift.status} onSelect={(next) => changeStatus(gift, next)} />
      </Card>

      {waiting ? (
        <>
          <Button label="Mark as Bought" icon="shopping-bag" onPress={() => openBoughtForm(gift)} testID="mark-bought" />
          {daysLeft >= 0 ? <BuyReminderCard gift={gift} /> : null}
        </>
      ) : null}

      {gift.status === 'bought' ? (
        <Button label="Mark as Given" icon="hand-heart" onPress={() => markGiven(gift)} testID="mark-given" />
      ) : null}

      {!waiting ? <PurchaseCard gift={gift} /> : null}
      {gift.status === 'bought' ? <RemindAgainCard gift={gift} /> : null}
      {!waiting && OCCASIONS[gift.occasion].yearly ? <NextYearCard gift={gift} today={today} /> : null}

      <Card style={styles.typeCard}>
        <Icon name="gift" size={26} />
        <AppText variant="subheading" style={styles.flex}>
          Gift Type
        </AppText>
        <View style={styles.typeChips}>
          {gift.type === 'surprise' ? <TypeChip icon={GIFT_TYPES.surprise.icon} label={GIFT_TYPES.surprise.label} /> : null}
          <TypeChip icon={CATEGORIES[gift.category].icon} label={CATEGORIES[gift.category].label} />
        </View>
      </Card>

      <Card style={styles.notesCard}>
        <View style={styles.inline}>
          <Icon name="notepad-text" size={20} />
          <AppText variant="bodyStrong">Notes</AppText>
        </View>
        <View style={[styles.notes, { backgroundColor: colors.surfaceSunken, borderColor: colors.borderStrong }]}>
          {gift.notes ? (
            <LinkedText variant="body" selectable>
              {gift.notes}
            </LinkedText>
          ) : (
            <AppText variant="body" color="textMuted">
              No notes yet
            </AppText>
          )}
        </View>
      </Card>

      <View style={styles.actions}>
        <Button
          label="Edit Idea"
          icon="pencil"
          variant="soft"
          onPress={() => router.push({ pathname: '/gift/[id]/edit', params: { id: gift.id } })}
          style={styles.action}
        />
        <Button label="Delete Idea" icon="trash-2" variant="danger" onPress={remove} style={styles.action} />
      </View>

      <OptionSheet
        visible={choosingStatus}
        title="Status"
        value={gift.status}
        options={STATUS_IDS.map((id) => ({
          value: id,
          label: STATUSES[id].label,
          description: STATUSES[id].description,
          icon: STATUSES[id].icon,
          iconColor: STATUSES[id].fg,
          iconBackground: STATUSES[id].bg,
        }))}
        onSelect={(next) => {
          // Let the sheet close first; iOS cannot open a dialog on top of a closing one.
          setTimeout(() => changeStatus(gift, next), Platform.OS === 'ios' ? 350 : 0);
        }}
        onClose={() => setChoosingStatus(false)}
      />
    </Screen>
  );
}

/* -------------------------------------------------------------- Small parts */

function Tag({ icon, label, highlight = false }: { icon: IconName; label: string; highlight?: boolean }) {
  const { colors } = useTheme();
  const color = highlight ? 'rose' : 'primaryText';
  return (
    <View style={[styles.tag, { backgroundColor: highlight ? colors.roseSoft : colors.search }]}>
      <Icon name={icon} size={15} color={color} />
      <AppText variant="captionStrong" color={color}>
        {label}
      </AppText>
    </View>
  );
}

function TypeChip({ icon, label }: { icon: IconName; label: string }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.tag, { backgroundColor: colors.chipBg }]}>
      <Icon name={icon} size={15} color="chipText" />
      <AppText variant="captionStrong" color="chipText">
        {label}
      </AppText>
    </View>
  );
}

function InfoHeader({ icon, title, action }: { icon: IconName; title: string; action?: { label: string; onPress: () => void } }) {
  const { colors } = useTheme();
  return (
    <View style={styles.infoHeader}>
      <View style={[styles.infoIcon, { backgroundColor: colors.primarySoft }]}>
        <Icon name={icon} size={19} color="primaryText" />
      </View>
      <AppText variant="bodyStrong" style={styles.flex}>
        {title}
      </AppText>
      {action ? (
        <Touchable onPress={action.onPress} accessibilityLabel={`${action.label}, ${title}`} style={styles.infoAction}>
          <AppText variant="captionStrong" color="primaryText">
            {action.label}
          </AppText>
        </Touchable>
      ) : null}
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <AppText variant="caption" color="textMuted">
        {label}
      </AppText>
      <AppText variant="captionStrong" numberOfLines={1} style={styles.infoValue}>
        {value}
      </AppText>
    </View>
  );
}

/* ---------------------------------------------------------- Reminder cards */

/** The "one week before" reminder, with a quick on/off switch. */
function BuyReminderCard({ gift }: { gift: Gift }) {
  const { colors } = useTheme();
  const { updateGift, settings } = useGifts();
  const { askOnce } = useNotifications();
  const enabled = gift.buyReminderDays.length > 0;
  const times = buyReminderTimes(gift, settings.reminderTime, new Date());

  return (
    <Card style={styles.info}>
      <View style={styles.infoHeader}>
        <View style={[styles.infoIcon, { backgroundColor: colors.primarySoft }]}>
          <Icon name={enabled ? 'bell-ring' : 'bell-off'} size={19} color="primaryText" />
        </View>
        <View style={styles.flex}>
          <AppText variant="bodyStrong">Remind me to buy</AppText>
          <AppText variant="caption" color="textMuted">
            {enabled ? gift.buyReminderDays.map(leadLabel).join(', ') : 'Off'}
          </AppText>
        </View>
        <Toggle
          label="Remind me to buy"
          value={enabled}
          onChange={(on) => {
            updateGift(gift.id, { buyReminderDays: on ? DEFAULT_BUY_REMINDER_DAYS : [] });
            if (on) askOnce();
          }}
        />
      </View>
      {enabled
        ? times.map((time) => (
            <InfoRow
              key={time.daysBefore}
              label={time.fallback ? `Event is close, ${leadLabel(time.daysBefore).toLowerCase()}` : leadLabel(time.daysBefore)}
              value={formatDateTime(time.at)}
            />
          ))
        : null}
      {enabled && times.length === 0 ? (
        <AppText variant="caption" color="warning">
          No time left for another reminder. The event is today!
        </AppText>
      ) : null}
      {gift.snoozedUntil && new Date(gift.snoozedUntil) > new Date() ? (
        <InfoRow label="Snoozed until" value={formatDateTime(new Date(gift.snoozedUntil))} />
      ) : null}
      {enabled ? <NotificationHint /> : null}
    </Card>
  );
}

function PurchaseCard({ gift }: { gift: Gift }) {
  const { openBoughtForm } = useGiftActions();
  const { purchase } = gift;
  return (
    <Card style={styles.info}>
      <InfoHeader
        icon="shopping-bag"
        title="Purchase"
        action={{ label: purchase ? 'Edit' : 'Add', onPress: () => openBoughtForm(gift) }}
      />
      {purchase ? (
        <>
          <InfoRow label="Price paid" value={purchase.price > 0 ? formatRupiah(purchase.price) : 'Not set'} />
          <InfoRow label="Bought on" value={formatLongDate(purchase.date)} />
          {purchase.store ? <InfoRow label="Store" value={purchase.store} /> : null}
          <BudgetDifference budget={gift.budget} price={purchase.price} />
        </>
      ) : (
        <AppText variant="caption" color="textMuted">
          No purchase details saved.
        </AppText>
      )}
    </Card>
  );
}

/** The "Remind me again" field, available once the gift is bought. */
function RemindAgainCard({ gift }: { gift: Gift }) {
  const { openBoughtForm } = useGiftActions();
  const { remindAgain } = gift;
  const at = remindAgain ? atTime(remindAgainDay(remindAgain, gift.eventDate), remindAgain.time) : null;
  const passed = at !== null && at <= new Date();

  return (
    <Card style={styles.info}>
      <InfoHeader
        icon="bell-plus"
        title="Remind me again"
        action={{ label: remindAgain ? 'Edit' : 'Set', onPress: () => openBoughtForm(gift) }}
      />
      {remindAgain && at ? (
        <>
          <InfoRow label={passed ? 'Reminded on' : 'When'} value={formatDateTime(at)} />
          {remindAgain.note ? <InfoRow label="Note" value={remindAgain.note} /> : null}
          {passed ? null : <NotificationHint />}
        </>
      ) : (
        <AppText variant="caption" color="textMuted">
          No reminder to hand it over yet.
        </AppText>
      )}
    </Card>
  );
}

function NextYearCard({ gift, today }: { gift: Gift; today: string }) {
  const { updateGift } = useGifts();
  const { colors } = useTheme();
  const nextDate = nextYearlyDate(gift.eventDate, today);

  return (
    <Card style={styles.info}>
      <View style={styles.infoHeader}>
        <View style={[styles.infoIcon, { backgroundColor: colors.primarySoft }]}>
          <Icon name="history" size={19} color="primaryText" />
        </View>
        <View style={styles.flex}>
          <AppText variant="bodyStrong">Remind me next year</AppText>
          <AppText variant="caption" color="textMuted">
            Next on {formatLongDate(nextDate)}
          </AppText>
        </View>
        <Toggle
          label="Remind me next year"
          value={gift.remindNextYear}
          onChange={(remindNextYear) => updateGift(gift.id, { remindNextYear })}
        />
      </View>
      <Button
        compact
        label="Plan the next gift"
        icon="copy-plus"
        variant="soft"
        onPress={() =>
          router.push({
            pathname: '/gift/new',
            params: { recipient: gift.recipient, occasion: gift.occasion, eventDate: nextDate },
          })
        }
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  page: { gap: spacing.lg },
  hero: { alignItems: 'center', gap: spacing.xs },
  name: { fontFamily: fonts.bold, fontSize: 30, lineHeight: 38, letterSpacing: -0.6, marginTop: spacing.sm },
  person: { flexDirection: 'row', alignItems: 'center', gap: 2, minHeight: 34 },
  personText: { fontFamily: fonts.medium },
  date: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  tags: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: spacing.sm, marginTop: spacing.sm },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
  },
  overview: { gap: spacing.lg },
  split: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  divider: { width: 1, alignSelf: 'stretch' },
  rule: { height: 1 },
  inline: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  budget: { fontFamily: fonts.bold, fontSize: 21, lineHeight: 28, letterSpacing: -0.3 },
  statusButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 48,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
  },
  typeCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  typeChips: { flexDirection: 'row', gap: 6 },
  notesCard: { gap: spacing.md },
  notes: { borderRadius: radius.sm, borderWidth: 1, padding: spacing.md },
  actions: { flexDirection: 'row', gap: spacing.md },
  action: { flex: 1, paddingHorizontal: spacing.sm },
  info: { gap: spacing.md },
  infoHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  infoIcon: { width: 38, height: 38, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
  infoAction: { minHeight: 40, minWidth: 44, alignItems: 'flex-end', justifyContent: 'center' },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md },
  infoValue: { flexShrink: 1 },
});
