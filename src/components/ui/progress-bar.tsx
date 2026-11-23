import { StyleSheet, View } from 'react-native';

import type { ColorToken } from '@/constants/theme';
import { useTheme } from '@/providers/theme-provider';

type ProgressBarProps = {
  /** 0 to 1 */
  value: number;
  label: string;
  color?: ColorToken;
  track?: ColorToken;
  height?: number;
};

export function ProgressBar({ value, label, color = 'primary', track = 'search', height = 8 }: ProgressBarProps) {
  const { colors } = useTheme();
  const percent = Math.round(Math.min(Math.max(value, 0), 1) * 100);
  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      accessibilityValue={{ min: 0, max: 100, now: percent }}
      style={[styles.track, { height, borderRadius: height / 2, backgroundColor: colors[track] }]}>
      <View style={{ width: `${percent}%`, height, borderRadius: height / 2, backgroundColor: colors[color] }} />
    </View>
  );
}

const styles = StyleSheet.create({ track: { overflow: 'hidden', alignSelf: 'stretch' } });
