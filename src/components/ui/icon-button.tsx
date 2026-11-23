import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Icon } from '@/components/ui/icon';
import type { IconName } from '@/components/ui/icon-data';
import { Touchable } from '@/components/ui/touchable';
import { fonts, radius, touchTarget, type ColorToken } from '@/constants/theme';
import { useTheme } from '@/providers/theme-provider';

type IconButtonProps = {
  icon: IconName;
  label: string;
  onPress: () => void;
  size?: number;
  color?: ColorToken;
  background?: ColorToken;
  badge?: number;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function IconButton({
  icon,
  label,
  onPress,
  size = 22,
  color = 'text',
  background,
  badge = 0,
  disabled = false,
  style,
}: IconButtonProps) {
  const { colors } = useTheme();
  return (
    <Touchable
      onPress={onPress}
      disabled={disabled}
      pressedScale={0.9}
      hitSlop={4}
      accessibilityLabel={badge > 0 ? `${label}, ${badge} need attention` : label}
      accessibilityState={{ disabled }}
      style={[
        styles.button,
        background && { backgroundColor: colors[background] },
        disabled && styles.disabled,
        style,
      ]}>
      <Icon name={icon} size={size} color={color} />
      {badge > 0 ? (
        <View style={[styles.badge, { backgroundColor: colors.rose, borderColor: colors.background }]}>
          <AppText variant="small" maxFontSizeMultiplier={1} style={[styles.badgeText, { color: colors.background }]}>
            {badge > 9 ? '9+' : badge}
          </AppText>
        </View>
      ) : null}
    </Touchable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: touchTarget,
    height: touchTarget,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: { opacity: 0.4 },
  badge: {
    position: 'absolute',
    top: 1,
    right: 0,
    minWidth: 20,
    height: 20,
    paddingHorizontal: 4,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { fontFamily: fonts.bold, fontSize: 10, lineHeight: 14 },
});
