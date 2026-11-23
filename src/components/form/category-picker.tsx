import { useRef } from 'react';
import { ScrollView, StyleSheet, type ScrollViewInstance } from 'react-native';

import { GiftIllustration } from '@/components/gift/gift-illustration';
import { AppText } from '@/components/ui/app-text';
import { Field } from '@/components/ui/fields';
import { Touchable } from '@/components/ui/touchable';
import { CATEGORIES, CATEGORY_IDS, type CategoryId } from '@/constants/options';
import { radius, spacing } from '@/constants/theme';
import { haptics } from '@/lib/haptics';
import { useTheme } from '@/providers/theme-provider';

const ITEM_WIDTH = 78;

type CategoryPickerProps = { value: CategoryId; onChange: (value: CategoryId) => void };

/** Sets the artwork and the "Gift Type" chip on the detail page. */
export function CategoryPicker({ value, onChange }: CategoryPickerProps) {
  const { colors } = useTheme();
  const scroller = useRef<ScrollViewInstance>(null);

  return (
    <Field label="Category">
      <ScrollView
        ref={scroller}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        accessibilityRole="radiogroup"
        onLayout={() =>
          scroller.current?.scrollTo({
            x: Math.max(0, CATEGORY_IDS.indexOf(value) - 1) * (ITEM_WIDTH + spacing.sm),
            animated: false,
          })
        }
        style={styles.scroller}
        contentContainerStyle={styles.content}>
        {CATEGORY_IDS.map((id) => {
          const selected = id === value;
          return (
            <Touchable
              key={id}
              pressedScale={0.94}
              onPress={() => {
                haptics.tap();
                onChange(id);
              }}
              accessibilityRole="radio"
              accessibilityLabel={CATEGORIES[id].label}
              accessibilityState={{ checked: selected }}
              style={[
                styles.item,
                {
                  backgroundColor: selected ? colors.primarySoft : colors.surface,
                  borderColor: selected ? colors.primary : colors.fieldBorder,
                },
              ]}>
              <GiftIllustration category={id} size={50} />
              <AppText
                variant={selected ? 'small' : 'caption'}
                color={selected ? 'onPrimarySoft' : 'textMuted'}
                numberOfLines={1}
                maxFontSizeMultiplier={1.1}
                style={styles.label}>
                {CATEGORIES[id].label}
              </AppText>
            </Touchable>
          );
        })}
      </ScrollView>
    </Field>
  );
}

const styles = StyleSheet.create({
  scroller: { marginHorizontal: -spacing.xl },
  content: { paddingHorizontal: spacing.xl, gap: spacing.sm },
  item: {
    width: ITEM_WIDTH,
    alignItems: 'center',
    gap: 6,
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.md,
    borderWidth: 1.5,
  },
  label: { fontSize: 11.5, lineHeight: 15 },
});
