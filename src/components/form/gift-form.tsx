import { usePreventRemove } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import { Platform, StyleSheet, View, type ScrollViewInstance } from 'react-native';

import { CategoryPicker } from '@/components/form/category-picker';
import { PurchaseFields } from '@/components/form/purchase-fields';
import { defaultRemindAgain, RemindAgainFields, remindAgainError } from '@/components/form/remind-again-fields';
import { GiftArt } from '@/components/gift/gift-art';
import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { futureShortcuts } from '@/components/ui/calendar-sheet';
import { Chip } from '@/components/ui/chip';
import { DateField, Field, MoneyField, SelectField, SwitchRow, TextField } from '@/components/ui/fields';
import { Icon } from '@/components/ui/icon';
import { Screen } from '@/components/ui/screen';
import { ScreenHeader } from '@/components/ui/screen-header';
import { Touchable } from '@/components/ui/touchable';
import {
  BUY_REMINDER_DAYS,
  GIFT_TYPE_IDS,
  GIFT_TYPES,
  OCCASION_IDS,
  OCCASIONS,
  STATUS_IDS,
  STATUSES,
} from '@/constants/options';
import { radius, spacing } from '@/constants/theme';
import { useToday } from '@/hooks/use-today';
import { daysBetween, formatDateTime, formatLongDate, leadLabel } from '@/lib/dates';
import { listPeople } from '@/lib/gift-queries';
import { haptics } from '@/lib/haptics';
import { personKey } from '@/lib/names';
import { deletePhoto, photosSupported, pickPhoto, savePhoto } from '@/lib/photos';
import { buyReminderTimes, needsBuying } from '@/lib/reminders';
import { useConfirm } from '@/providers/confirm-provider';
import { useGifts } from '@/providers/gifts-provider';
import { useToast } from '@/providers/toast-provider';
import type { DateKey, GiftDraft } from '@/types/gift';

export type GiftFormValues = Omit<GiftDraft, 'eventDate'> & { eventDate: DateKey | null };

const KEYBOARD_OPEN_MS = 350;

type Errors = Partial<Record<'name' | 'recipient' | 'eventDate' | 'remindAgain', string>>;

type GiftFormProps = {
  title: string;
  submitLabel: string;
  initialValues: GiftFormValues;
  /** The gift being edited, so it is not compared with itself. */
  editingId?: string;
  onSubmit: (draft: GiftDraft) => void;
};

export function GiftForm({ title, submitLabel, initialValues, editingId, onSubmit }: GiftFormProps) {
  const today = useToday();
  const { gifts, settings } = useGifts();
  const confirm = useConfirm();
  const toast = useToast();

  const [values, setValues] = useState(initialValues);
  const [newPhoto, setNewPhoto] = useState<string | null>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [saving, setSaving] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const scroller = useRef<ScrollViewInstance>(null);

  const set = <K extends keyof GiftFormValues>(key: K, value: GiftFormValues[K]) => {
    setValues((current) => ({ ...current, [key]: value }));
    if (key in errors) setErrors((current) => ({ ...current, [key]: undefined }));
  };

  /* ------------------------------------------------- Unsaved changes guard */

  const dirty = newPhoto !== null || JSON.stringify(values) !== JSON.stringify(initialValues);
  const disableGuard = usePreventRemove(dirty && !leaving, async ({ repeat }) => {
    const discard = await confirm({
      title: 'Discard changes?',
      message: 'What you typed has not been saved yet.',
      confirmLabel: 'Discard',
      cancelLabel: 'Keep editing',
      icon: 'triangle-alert',
      destructive: true,
    });
    if (!discard) return;
    setLeaving(true);
    repeat();
  });

  /* ------------------------------------------------------------ Suggestions */

  const people = useMemo(() => listPeople(gifts, today), [gifts, today]);
  const key = personKey(values.recipient);
  const suggestions = people.filter((person) => person.key !== key && (key === '' || person.key.includes(key))).slice(0, 6);
  const knownPerson = people.find((person) => person.key === key);
  const knownEvent = knownPerson?.nextEvent;
  const offerKnownEvent =
    knownEvent && (knownEvent.date !== values.eventDate || knownEvent.occasion !== values.occasion) ? knownEvent : null;
  const nameKey = personKey(values.name);
  const duplicate = nameKey
    ? knownPerson?.gifts.find((gift) => gift.id !== editingId && personKey(gift.name) === nameKey)
    : undefined;
  const markedDates = useMemo(() => new Set(gifts.map((gift) => gift.eventDate)), [gifts]);

  /* ----------------------------------------------------------- Dependent UI */

  const waiting = needsBuying(values);
  const purchase = values.purchase ?? { date: today, price: 0, store: '' };
  const eventDate = values.eventDate ?? today;

  const changeStatus = (status: GiftFormValues['status']) => {
    setValues((current) => {
      const owned = !needsBuying({ status });
      return {
        ...current,
        status,
        purchase: owned ? (current.purchase ?? { date: today, price: current.budget, store: '' }) : current.purchase,
        remindAgain:
          status === 'bought' && current.remindAgain === null && current.purchase === null && eventDate >= today
            ? defaultRemindAgain(eventDate, today)
            : current.remindAgain,
      };
    });
  };

  const toggleBuyReminder = (days: number) => {
    const selected = values.buyReminderDays.includes(days);
    set(
      'buyReminderDays',
      selected
        ? values.buyReminderDays.filter((value) => value !== days)
        : [...values.buyReminderDays, days].sort((a, b) => b - a),
    );
  };

  /* ---------------------------------------------------------------- Actions */

  const choosePhoto = async () => {
    try {
      const uri = await pickPhoto();
      if (uri) setNewPhoto(uri);
    } catch {
      toast({ message: 'Could not open your photos', icon: 'circle-alert' });
    }
  };

  /** Notes is the last field: bring all of it, and the save button, above the keyboard. */
  const revealNotes = () => {
    if (Platform.OS !== 'web') setTimeout(() => scroller.current?.scrollToEnd({ animated: true }), KEYBOARD_OPEN_MS);
  };

  const validate = (): Errors => {
    const next: Errors = {};
    if (!values.name.trim()) next.name = 'Give this gift a name.';
    if (!values.recipient.trim()) next.recipient = 'Who is it for?';
    if (!values.eventDate) next.eventDate = 'Choose the event date.';
    else if (values.status !== 'given' && values.eventDate < today && values.eventDate !== initialValues.eventDate) {
      next.eventDate = 'This date has passed. Choose an upcoming date.';
    }
    if (values.status === 'bought' && eventDate >= today) {
      next.remindAgain = remindAgainError(values.remindAgain, eventDate);
    }
    return next;
  };

  const submit = async () => {
    const found = validate();
    setErrors(found);
    if (Object.values(found).some(Boolean) || !values.eventDate) {
      haptics.error();
      if (found.name || found.recipient) scroller.current?.scrollTo({ y: 0, animated: true });
      toast({ message: 'Please check the highlighted fields', icon: 'circle-alert' });
      return;
    }

    setSaving(true);
    let photo = values.photo;
    if (newPhoto) {
      try {
        photo = await savePhoto(newPhoto);
        deletePhoto(initialValues.photo);
      } catch {
        toast({ message: 'The photo could not be saved', icon: 'circle-alert' });
      }
    }

    setLeaving(true);
    disableGuard();
    haptics.success();
    onSubmit({
      ...values,
      name: values.name.trim(),
      recipient: values.recipient.trim().replace(/\s+/g, ' '),
      notes: values.notes.trim(),
      eventDate: values.eventDate,
      photo,
      purchase: waiting ? null : { ...purchase, store: purchase.store.trim() },
      remindAgain: values.status === 'bought' ? values.remindAgain : null,
      remindNextYear: !waiting && OCCASIONS[values.occasion].yearly && values.remindNextYear,
    });
  };

  return (
    <Screen header={<ScreenHeader title={title} />} scrollRef={scroller} contentStyle={styles.form}>
      <View style={styles.photo}>
        <GiftArt gift={values} size={104} previewUri={newPhoto} />
        {photosSupported ? (
          <Touchable
            onPress={choosePhoto}
            hitSlop={8}
            accessibilityLabel={newPhoto || values.photo ? 'Change photo' : 'Add a photo'}
            style={styles.photoButton}>
            <Icon name="camera" size={16} color="primaryText" />
            <AppText variant="captionStrong" color="primaryText">
              {newPhoto || values.photo ? 'Change photo' : 'Add a photo'}
            </AppText>
          </Touchable>
        ) : null}
      </View>

      <TextField
        label="Gift / Surprise Name"
        value={values.name}
        onChangeText={(name) => set('name', name)}
        placeholder="E.g. Parfum, Concert Ticket"
        error={errors.name}
        maxLength={60}
        autoCapitalize="words"
        returnKeyType="next"
        testID="field-name"
        helper={
          duplicate ? (
            <View style={styles.hint}>
              <Icon name="info" size={15} color="warning" />
              <AppText variant="caption" color="warning" style={styles.flex}>
                {duplicate.status === 'given'
                  ? `You already gave ${duplicate.recipient} this on ${formatLongDate(duplicate.eventDate)}.`
                  : `This is already on your list for ${duplicate.recipient}.`}
              </AppText>
            </View>
          ) : undefined
        }
      />

      <TextField
        label="For"
        value={values.recipient}
        onChangeText={(recipient) => set('recipient', recipient)}
        placeholder="E.g. Sarah"
        error={errors.recipient}
        maxLength={40}
        autoCapitalize="words"
        autoCorrect={false}
        testID="field-recipient"
        helper={
          suggestions.length > 0 ? (
            <View style={styles.chips}>
              {suggestions.map((person) => (
                <Chip
                  key={person.key}
                  label={person.name}
                  icon="user"
                  role="button"
                  onPress={() => set('recipient', person.name)}
                />
              ))}
            </View>
          ) : undefined
        }
      />

      <SelectField
        label="Type"
        value={values.type}
        options={GIFT_TYPE_IDS.map((id) => ({ value: id, ...GIFT_TYPES[id] }))}
        onChange={(type) => set('type', type)}
        iconColor="text"
      />

      <CategoryPicker value={values.category} onChange={(category) => set('category', category)} />

      <SelectField
        label="Occasion"
        value={values.occasion}
        options={OCCASION_IDS.map((id) => ({ value: id, label: OCCASIONS[id].label, icon: OCCASIONS[id].icon }))}
        onChange={(occasion) => set('occasion', occasion)}
        iconColor="rose"
      />

      <DateField
        label="Event Date"
        value={values.eventDate}
        onChange={(date) => set('eventDate', date)}
        error={errors.eventDate}
        minDate={values.status === 'given' ? undefined : today}
        markedDates={markedDates}
        shortcuts={futureShortcuts(today)}
        helper={
          offerKnownEvent ? (
            <View style={styles.chips}>
              <Chip
                role="button"
                icon={OCCASIONS[offerKnownEvent.occasion].icon}
                label={`Use ${OCCASIONS[offerKnownEvent.occasion].label}, ${formatLongDate(offerKnownEvent.date)}`}
                onPress={() =>
                  setValues((current) => ({
                    ...current,
                    eventDate: offerKnownEvent.date,
                    occasion: offerKnownEvent.occasion,
                  }))
                }
              />
            </View>
          ) : undefined
        }
      />

      <MoneyField
        label="Budget"
        optional
        amount={values.budget}
        onChangeAmount={(budget) => set('budget', budget)}
        testID="field-budget"
      />

      <SelectField
        label="Status"
        value={values.status}
        options={STATUS_IDS.map((id) => ({
          value: id,
          label: STATUSES[id].label,
          description: STATUSES[id].description,
          icon: STATUSES[id].icon,
          iconColor: STATUSES[id].fg,
          iconBackground: STATUSES[id].bg,
        }))}
        onChange={changeStatus}
      />

      {waiting ? (
        <Field
          label="Remind me to buy"
          helper={<BuyReminderSummary values={values} reminderTime={settings.reminderTime} today={today} />}>
          <View style={styles.chips}>
            {BUY_REMINDER_DAYS.map((days) => (
              <Chip
                key={days}
                role="checkbox"
                label={leadLabel(days)}
                selected={values.buyReminderDays.includes(days)}
                onPress={() => toggleBuyReminder(days)}
              />
            ))}
          </View>
        </Field>
      ) : (
        <>
          <PurchaseFields value={purchase} onChange={(next) => set('purchase', next)} budget={values.budget} />
          {values.status === 'bought' ? (
            <RemindAgainFields
              value={values.remindAgain}
              onChange={(next) => set('remindAgain', next)}
              eventDate={eventDate}
              error={errors.remindAgain}
            />
          ) : null}
          {OCCASIONS[values.occasion].yearly ? (
            <SwitchRow
              icon="history"
              label="Remind me next year"
              description="Two weeks before the date comes around again"
              value={values.remindNextYear}
              onChange={(enabled) => set('remindNextYear', enabled)}
            />
          ) : null}
        </>
      )}

      <TextField
        label="Notes"
        optional
        multiline
        value={values.notes}
        onChangeText={(notes) => set('notes', notes)}
        onFocus={revealNotes}
        placeholder="Add any notes, links, or ideas..."
        maxLength={500}
        testID="field-notes"
      />

      <Button label={submitLabel} onPress={submit} loading={saving} testID="submit" style={styles.submit} />
    </Screen>
  );
}

function BuyReminderSummary({
  values,
  reminderTime,
  today,
}: {
  values: GiftFormValues;
  reminderTime: string;
  today: DateKey;
}) {
  if (values.buyReminderDays.length === 0) {
    return (
      <AppText variant="caption" color="textMuted">
        No reminder. Turn one on so you do not forget.
      </AppText>
    );
  }
  if (!values.eventDate) {
    return (
      <AppText variant="caption" color="textMuted">
        Pick the event date to see when the reminder arrives.
      </AppText>
    );
  }

  const [next] = buyReminderTimes({ ...values, eventDate: values.eventDate }, reminderTime, new Date());
  if (!next) {
    return (
      <AppText variant="caption" color="warning">
        {daysBetween(today, values.eventDate) < 0
          ? 'The event has passed, so no reminder will be sent.'
          : "It's today! There is no time left for a reminder."}
      </AppText>
    );
  }
  return (
    <View style={styles.hint}>
      <Icon name="bell-ring" size={15} color="primaryText" />
      <AppText variant="caption" color="primaryText" style={styles.flex}>
        {next.fallback ? 'The event is close, so the reminder moves to ' : 'First reminder: '}
        {formatDateTime(next.at)}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  form: { gap: spacing.xl - 4 },
  photo: { alignItems: 'center', gap: spacing.xs },
  photoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: 40,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  hint: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  submit: { marginTop: spacing.sm },
});
