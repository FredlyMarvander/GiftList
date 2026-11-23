import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Icon } from '@/components/ui/icon';
import { Touchable } from '@/components/ui/touchable';
import { STATUS_IDS, STATUSES, type GiftStatus } from '@/constants/options';
import { radius, spacing } from '@/constants/theme';
import { useTheme } from '@/providers/theme-provider';

type StatusTrackerProps = { status: GiftStatus; onSelect: (status: GiftStatus) => void };

/** Idea, Planned, Bought, Given: shows progress and lets the user jump to a step. */
export function StatusTracker({ status, onSelect }: StatusTrackerProps) {
  const { colors } = useTheme();
  const currentIndex = STATUS_IDS.indexOf(status);

  return (
    <View accessibilityRole="radiogroup" accessibilityLabel="Gift status" style={styles.row}>
      {STATUS_IDS.map((id, index) => {
        const step = STATUSES[id];
        const reached = index <= currentIndex;
        const current = index === currentIndex;
        return (
          <View key={id} style={styles.step}>
            {index > 0 ? (
              <View style={[styles.line, { backgroundColor: reached ? colors.primary : colors.borderSoft }]} />
            ) : null}
            <Touchable
              pressedScale={0.92}
              onPress={() => onSelect(id)}
              accessibilityRole="radio"
              accessibilityLabel={`${step.label}. ${step.description}`}
              accessibilityState={{ checked: current }}
              style={styles.target}>
              <View
                style={[
                  styles.circle,
                  {
                    backgroundColor: current ? colors.primary : reached ? colors.primarySoft : colors.surface,
                    borderColor: reached ? colors.primary : colors.border,
                  },
                ]}>
                <Icon
                  name={reached && !current ? 'check' : step.icon}
                  size={17}
                  color={current ? 'onPrimary' : reached ? 'primaryText' : 'textMuted'}
                  strokeWidth={reached && !current ? 2.8 : 2}
                />
              </View>
              <AppText
                variant={current ? 'small' : 'caption'}
                maxFontSizeMultiplier={1.15}
                color={current ? 'text' : 'textMuted'}
                style={styles.label}>
                {step.label}
              </AppText>
            </Touchable>
          </View>
        );
      })}
    </View>
  );
}

const CIRCLE = 36;

const styles = StyleSheet.create({
  row: { flexDirection: 'row' },
  step: { flex: 1, alignItems: 'center' },
  // From the edge of the previous circle to the edge of this one.
  line: { position: 'absolute', top: CIRCLE / 2 - 1, left: '-50%', right: '50%', height: 2, marginHorizontal: CIRCLE / 2 },
  target: { alignItems: 'center', gap: spacing.xs + 1, minWidth: 56 },
  circle: {
    width: CIRCLE,
    height: CIRCLE,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { fontSize: 12, lineHeight: 16 },
});
