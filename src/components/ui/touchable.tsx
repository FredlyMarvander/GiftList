import { Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type TouchableProps = Omit<PressableProps, 'style'> & {
  style?: StyleProp<ViewStyle>;
  /** How far the control shrinks while pressed. */
  pressedScale?: number;
};

/** Pressable with a soft press-in animation, used by every tappable surface. */
export function Touchable({ style, pressedScale = 0.97, disabled, onPressIn, onPressOut, ...rest }: TouchableProps) {
  const pressed = useSharedValue(0);
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: 1 - pressed.get() * 0.15,
    transform: [{ scale: 1 - pressed.get() * (1 - pressedScale) }],
  }));

  return (
    <AnimatedPressable
      accessibilityRole="button"
      {...rest}
      disabled={disabled}
      onPressIn={(event) => {
        pressed.set(withTiming(1, { duration: 80 }));
        onPressIn?.(event);
      }}
      onPressOut={(event) => {
        pressed.set(withTiming(0, { duration: 160 }));
        onPressOut?.(event);
      }}
      style={[style, animatedStyle]}
    />
  );
}
